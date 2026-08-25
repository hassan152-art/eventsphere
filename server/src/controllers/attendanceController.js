const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const { generateAttendanceQR } = require('../services/qrService');

// @route GET /api/attendance/qr/:registrationId  (participant fetches their pass)
const getMyQRPass = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.registrationId).populate('event');
  if (!registration) throw new ApiError(404, 'Registration not found');
  if (registration.student.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not permitted');
  }
  if (registration.status !== 'Confirmed') {
    throw new ApiError(400, 'QR pass is only available for confirmed registrations');
  }

  const qrDataUrl = await generateAttendanceQR({
    registrationId: registration._id,
    eventId: registration.event._id,
    token: registration.attendanceToken,
  });

  success(res, 200, 'QR pass generated', { qrDataUrl, event: registration.event });
});

// @route POST /api/attendance/scan  (organizer scans a participant's QR - SRS section 11)
const scanAttendance = asyncHandler(async (req, res) => {
  const { registrationId, eventId, token } = req.body;

  const registration = await Registration.findById(registrationId).populate('event student');
  if (!registration) throw new ApiError(404, 'Invalid QR code - registration not found');

  if (registration.attendanceToken !== token || registration.event._id.toString() !== eventId) {
    throw new ApiError(400, 'Invalid or tampered QR code');
  }
  if (registration.status !== 'Confirmed') {
    throw new ApiError(400, `Cannot check in - registration status is ${registration.status}`);
  }

  const isOwner = registration.event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted to scan for this event');

  const already = await Attendance.findOne({ registration: registration._id });
  if (already) throw new ApiError(409, 'Attendance already marked for this participant');

  const attendance = await Attendance.create({
    event: registration.event._id,
    student: registration.student._id,
    registration: registration._id,
    scannedBy: req.user._id,
  });

  await Notification.create({
    recipient: registration.student._id,
    type: 'Attendance Confirmation',
    title: 'Attendance verified successfully',
    message: `Your attendance for "${registration.event.title}" has been marked.`,
    relatedEvent: registration.event._id,
  });

  success(res, 200, 'Attendance Marked Successfully', {
    attendance,
    participant: { name: registration.student.fullName, email: registration.student.email },
  });
});

// @route GET /api/events/:eventId/attendance  (organizer report)
const getEventAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ event: req.params.eventId })
    .populate('student', 'fullName email department enrollmentNumber')
    .sort('-checkedInAt');
  success(res, 200, 'Attendance report fetched', { attendance });
});

// @route GET /api/attendance/me
const getMyAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ student: req.user._id })
    .populate('event', 'title date venue bannerUrl');
  success(res, 200, 'Attendance history fetched', { attendance });
});

module.exports = { getMyQRPass, scanAttendance, getEventAttendance, getMyAttendance };
