const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail, sendBookingConfirmationEmail, sendPendingRegistrationEmail, sendAdminRegistrationNotification } = require('../services/emailService');
const { generateTicketPDF } = require('../services/ticketService');

// @route POST /api/registrations/:eventId
const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const studentId = req.user._id;

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

  let registration;

  if (event.seatsRemaining > 0) {
    try {
      registration = await Registration.create({
        event: eventId,
        student: studentId,
        status: 'Pending', // Pending approval by Admin / Organizer
        ...(hasWalkInDetails && { walkInDetails }),
      });
    } catch (err) {
      if (err.code === 11000) throw new ApiError(409, 'You are already registered for this event');
      throw err;
    }
  } else {
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
    } catch (err) {
      if (err.code === 11000) throw new ApiError(409, 'You are already registered for this event');
      throw err;
    }
  }

  const isWaitlisted = registration.status === 'Waitlisted';

  // Notify the student
  await Notification.create({
    recipient: studentId,
    type: 'Registration Confirmation',
    title: isWaitlisted ? "You're on the waitlist" : 'Registration Submitted (Pending Approval)',
    message: isWaitlisted
      ? `The event "${event.title}" is currently full. You've been added to the waitlist.`
      : `Your registration for "${event.title}" has been submitted and is pending Admin & Organizer approval.`,
    relatedEvent: event._id,
  });

  if (isWaitlisted) {
    await sendBookingConfirmationEmail(req.user, event, registration);
  } else {
    await sendPendingRegistrationEmail(req.user, event);
  }

  // Notify ALL admins about the new pending registration (in-app + email)
  if (!isWaitlisted) {
    try {
      const admins = await User.find({ role: 'admin', status: 'active' }).select('_id fullName email');
      await Promise.all(
        admins.map(async (admin) => {
          // In-app notification
          await Notification.create({
            recipient: admin._id,
            type: 'Registration Confirmation',
            title: 'New Registration Request Pending Approval',
            message: `${req.user.fullName} has submitted a registration request for "${event.title}".`,
            relatedEvent: event._id,
          });
          // Email notification
          await sendAdminRegistrationNotification(admin.email, admin.fullName, req.user, event);
        })
      );

      // Also notify the event organizer
      const organizer = await User.findById(event.organizer).select('_id fullName email');
      if (organizer && organizer._id.toString() !== studentId.toString()) {
        await Notification.create({
          recipient: organizer._id,
          type: 'Registration Confirmation',
          title: 'New Registration Request for Your Event',
          message: `${req.user.fullName} has submitted a registration request for "${event.title}".`,
          relatedEvent: event._id,
        });
        await sendAdminRegistrationNotification(organizer.email, organizer.fullName, req.user, event);
      }
    } catch (notifyErr) {
      console.error('[registrationController] Admin/organizer notification failed:', notifyErr.message);
    }
  }

  success(
    res,
    201,
    isWaitlisted
      ? "The event is currently full. You've been added to the waitlist."
      : "Your registration request has been submitted to Admin & Organizer for approval!",
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

// @route GET /api/registrations/:id/ticket  (PDF ticket download)
const getRegistrationTicket = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id)
    .populate('event')
    .populate('student');

  if (!registration) throw new ApiError(404, 'Registration not found');

  const isOwner = registration.student._id.toString() === req.user._id.toString();
  const isOrganizerOrAdmin = req.user.role === 'admin' || req.user.role === 'organizer';
  if (!isOwner && !isOrganizerOrAdmin) throw new ApiError(403, 'Not authorized to download this ticket');

  const pdfBuffer = await generateTicketPDF({
    registration,
    event: registration.event,
    user: registration.student,
  });

  const fileName = `Ticket_${registration.event.title.replace(/[^\w]/g, '_')}_${registration._id}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(pdfBuffer);
});

// @route GET /api/events/:eventId/export-registrations (CSV export for organizer/admin)
const exportRegistrationsCSV = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  const registrations = await Registration.find({ event: eventId })
    .populate('student', 'fullName email department enrollmentNumber contactNumber')
    .sort('-createdAt');

  let csvContent = 'Registration ID,Student Name,Email,Enrollment No,Department,Status,Registered Date\n';
  registrations.forEach((r) => {
    const s = r.student || {};
    const walk = r.walkInDetails || {};
    const name = (walk.fullName || s.fullName || 'N/A').replace(/,/g, ' ');
    const email = (walk.email || s.email || 'N/A').replace(/,/g, ' ');
    const enroll = (walk.rollNumber || s.enrollmentNumber || 'N/A').replace(/,/g, ' ');
    const dept = (walk.department || s.department || 'N/A').replace(/,/g, ' ');
    const date = new Date(r.registeredAt).toISOString().split('T')[0];

    csvContent += `"${r._id}","${name}","${email}","${enroll}","${dept}","${r.status}","${date}"\n`;
  });

  const filename = `Participants_${event.title.replace(/[^\w]/g, '_')}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

// @route GET /api/registrations/pending (admin/organizer pending approvals queue)
const getPendingRegistrations = asyncHandler(async (req, res) => {
  const filter = { status: 'Pending' };

  // Organizers only see pending registrations for their own events
  if (req.user.role === 'organizer') {
    const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
    filter.event = { $in: myEvents.map((e) => e._id) };
  }

  const registrations = await Registration.find(filter)
    .populate('student', 'fullName email department enrollmentNumber contactNumber')
    .populate('event', 'title date venue department startTime endTime')
    .sort('-createdAt');

  success(res, 200, 'Pending registrations fetched', { registrations });
});

// @route PATCH /api/registrations/:id/status (organizer/admin update status)
const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Confirmed', 'Waitlisted', 'Cancelled'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const registration = await Registration.findById(req.params.id)
    .populate('event')
    .populate('student');

  if (!registration) throw new ApiError(404, 'Registration not found');

  const isOwner = registration.event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  const prevStatus = registration.status;
  registration.status = status;
  await registration.save();

  // If status is approved to Confirmed from Pending, reserve seat count
  if (status === 'Confirmed' && prevStatus === 'Pending') {
    await Event.updateOne(
      { _id: registration.event._id },
      { $inc: { seatsRemaining: -1, registrationCount: 1 } }
    );
    // Send email confirmation with PDF ticket pass details
    await sendBookingConfirmationEmail(registration.student, registration.event, registration);
  }

  await Notification.create({
    recipient: registration.student._id,
    type: 'Registration Confirmation',
    title: `Registration ${status === 'Confirmed' ? 'Approved!' : status}`,
    message: status === 'Confirmed'
      ? `Your registration for "${registration.event.title}" has been APPROVED by Admin! You can now download your PDF ticket.`
      : `Your registration for "${registration.event.title}" status is now ${status}.`,
    relatedEvent: registration.event._id,
  });

  success(res, 200, `Registration updated to ${status}`, { registration });
});

module.exports = {
  registerForEvent, cancelRegistration, getMyRegistrations,
  getEventRegistrations, getRegistrationTicket, exportRegistrationsCSV,
  updateRegistrationStatus, getPendingRegistrations,
};
