const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const { sendEmail } = require('../services/emailService');

// @route POST /api/registrations/:eventId
// Implements SRS section 10: eligibility/deadline/seat/duplicate checks,
// waitlisting, and atomic seat decrement to prevent overbooking.
const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const studentId = req.user._id;

  // Optional extra details from a custom registration form on the frontend
  // (roll number, phone, semester, etc.) - all optional, purely additive.
  const { fullName, email, rollNumber, phone, department, semester } = req.body || {};
  const walkInDetails = { fullName, email, rollNumber, phone, department, semester };
  const hasWalkInDetails = Object.values(walkInDetails).some((v) => v !== undefined && v !== null && v !== '');

  const existing = await Registration.findOne({ event: eventId, student: studentId, status: { $ne: 'Cancelled' } });
  if (existing) throw new ApiError(409, 'You are already registered for this event');

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.status !== 'Approved') throw new ApiError(400, 'This event is not open for registration');
  if (event.computedStatus === 'Completed' || event.computedStatus === 'Cancelled') {
    throw new ApiError(400, `Registration closed - event is ${event.computedStatus.toLowerCase()}`);
  }
  if (new Date() > new Date(event.registrationDeadline)) {
    throw new ApiError(400, 'Registration deadline has passed');
  }

  // NOTE: We intentionally avoid mongoose sessions/transactions here.
  // Multi-document transactions require MongoDB to be running as a replica
  // set (or mongos), which a plain local `mongod` is not by default - on a
  // standalone instance `session.withTransaction()` throws "Transaction
  // numbers are only allowed on a replica set member or mongos" and the
  // whole registration silently fails, so students never get a Confirmed
  // registration (and therefore never see an attendance QR).
  //
  // Overbooking is still prevented because the seat decrement below is a
  // single atomic `findOneAndUpdate` (Mongo guarantees atomicity per
  // document regardless of transactions). If the follow-up Registration
  // write fails for some reason, we compensate by reverting the seat count.
  let registration;

  // Atomic seat decrement - only succeeds if a seat is still available,
  // which is what actually prevents overbooking under concurrent requests.
  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId, seatsRemaining: { $gt: 0 } },
    { $inc: { seatsRemaining: -1, registrationCount: 1 } },
    { new: true }
  );

  if (updatedEvent) {
    try {
      registration = await Registration.create({
        event: eventId,
        student: studentId,
        status: 'Confirmed',
        ...(hasWalkInDetails && { walkInDetails }),
      });
    } catch (err) {
      // Roll back the seat reservation if the registration record couldn't
      // be created (e.g. duplicate-key race), so seats aren't lost.
      await Event.updateOne({ _id: eventId }, { $inc: { seatsRemaining: 1, registrationCount: -1 } });
      if (err.code === 11000) throw new ApiError(409, 'You are already registered for this event');
      throw err;
    }
  } else {
    // No seat available -> waitlist if enabled
    if (!event.waitlistEnabled) {
      throw new ApiError(400, 'Registration Full');
    }

    const waitlistCount = await Registration.countDocuments({ event: eventId, status: 'Waitlisted' });
    try {
      registration = await Registration.create({
        event: eventId,
        student: studentId,
        status: 'Waitlisted',
        waitlistPosition: waitlistCount + 1,
        ...(hasWalkInDetails && { walkInDetails }),
      });
      await Event.updateOne({ _id: eventId }, { $inc: { registrationCount: 1 } });
    } catch (err) {
      if (err.code === 11000) throw new ApiError(409, 'You are already registered for this event');
      throw err;
    }
  }

  const isWaitlisted = registration.status === 'Waitlisted';

  await Notification.create({
    recipient: studentId,
    type: isWaitlisted ? 'Registration Confirmation' : 'Registration Confirmation',
    title: isWaitlisted ? "You're on the waitlist" : "You're registered!",
    message: isWaitlisted
      ? `The event "${event.title}" is currently full. You've been added to the waitlist.`
      : `Your spot for "${event.title}" is confirmed.`,
    relatedEvent: event._id,
  });

  await sendEmail({
    to: req.user.email,
    subject: isWaitlisted ? 'Waitlisted for ' + event.title : 'Registration confirmed: ' + event.title,
    html: `<p>${isWaitlisted ? "You've been added to the waitlist for" : 'Your spot is confirmed for'} <strong>${event.title}</strong>.</p>`,
  });

  success(
    res,
    201,
    isWaitlisted
      ? "The event is currently full. You've been added to the waitlist."
      : "You're registered! Your spot is confirmed.",
    { registration }
  );
});

// @route DELETE /api/registrations/:id  (cancel + auto-promote next waitlisted)
const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id).populate('event');
  if (!registration) throw new ApiError(404, 'Registration not found');

  const isOwner = registration.student.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  if (registration.status === 'Cancelled') throw new ApiError(400, 'Registration already cancelled');

  const wasConfirmed = registration.status === 'Confirmed';
  registration.status = 'Cancelled';
  registration.cancelledAt = new Date();
  await registration.save();

  if (wasConfirmed) {
    // Give the seat back, then promote the earliest waitlisted registrant
    const event = await Event.findByIdAndUpdate(
      registration.event._id,
      { $inc: { seatsRemaining: 1 } },
      { new: true }
    );

    const nextInLine = await Registration.findOne({ event: event._id, status: 'Waitlisted' }).sort('waitlistPosition');
    if (nextInLine) {
      nextInLine.status = 'Confirmed';
      nextInLine.waitlistPosition = null;
      await nextInLine.save();
      await Event.updateOne({ _id: event._id }, { $inc: { seatsRemaining: -1 } });

      await Notification.create({
        recipient: nextInLine.student,
        type: 'Waitlist Promotion',
        title: "You're off the waitlist!",
        message: `A spot opened up for "${event.title}" and you've been confirmed.`,
        relatedEvent: event._id,
      });
    }
  }

  success(res, 200, 'Registration cancelled successfully', { registration });
});

// @route GET /api/registrations/me
const getMyRegistrations = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { student: req.user._id };
  if (status) filter.status = status;

  const registrations = await Registration.find(filter)
    .populate({ path: 'event', populate: ['category', 'department'] })
    .sort('-createdAt');

  success(res, 200, 'Registrations fetched', { registrations });
});

// @route GET /api/events/:eventId/registrations  (organizer/admin view)
const getEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { status } = req.query;
  const filter = { event: eventId };
  if (status) filter.status = status;

  const registrations = await Registration.find(filter)
    .populate('student', 'fullName email department enrollmentNumber')
    .sort('-createdAt');

  success(res, 200, 'Event registrations fetched', { registrations });
});

module.exports = { registerForEvent, cancelRegistration, getMyRegistrations, getEventRegistrations };
