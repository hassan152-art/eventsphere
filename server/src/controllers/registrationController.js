const mongoose = require('mongoose');
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

  const session = await mongoose.startSession();
  let registration;

  try {
    await session.withTransaction(async () => {
      // Atomic seat decrement - only succeeds if a seat is still available,
      // which is what actually prevents overbooking under concurrent requests.
      const updatedEvent = await Event.findOneAndUpdate(
        { _id: eventId, seatsRemaining: { $gt: 0 } },
        { $inc: { seatsRemaining: -1, registrationCount: 1 } },
        { new: true, session }
      );

      if (updatedEvent) {
        const [reg] = await Registration.create(
          [{ event: eventId, student: studentId, status: 'Confirmed' }],
          { session }
        );
        registration = reg;
        return;
      }

      // No seat available -> waitlist if enabled
      if (!event.waitlistEnabled) {
        throw new ApiError(400, 'Registration Full');
      }

      const waitlistCount = await Registration.countDocuments({ event: eventId, status: 'Waitlisted' }).session(session);
      const [reg] = await Registration.create(
        [{ event: eventId, student: studentId, status: 'Waitlisted', waitlistPosition: waitlistCount + 1 }],
        { session }
      );
      await Event.updateOne({ _id: eventId }, { $inc: { registrationCount: 1 } }, { session });
      registration = reg;
    });
  } finally {
    session.endSession();
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
