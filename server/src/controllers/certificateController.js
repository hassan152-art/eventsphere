const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const { generateCertificateNumber, generateCertificatePDF } = require('../services/certificateService');

const uploadBuffer = (buffer, folder, resourceType = 'raw') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });

// @route POST /api/certificates/generate  (organizer, single participant)
const generateCertificate = asyncHandler(async (req, res) => {
  const { eventId, studentId, type = 'Participation' } = req.body;

  const attended = await Attendance.findOne({ event: eventId, student: studentId });
  if (!attended) throw new ApiError(400, 'Participant has not been marked present for this event');

  const already = await Certificate.findOne({ event: eventId, student: studentId });
  if (already) throw new ApiError(409, 'Certificate already issued for this participant');

  const [event, student] = await Promise.all([Event.findById(eventId), User.findById(studentId)]);
  if (!event || !student) throw new ApiError(404, 'Event or student not found');

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  const certificateNumber = generateCertificateNumber();
  const pdfBuffer = await generateCertificatePDF({
    studentName: student.fullName,
    eventTitle: event.title,
    date: new Date(event.date).toLocaleDateString(),
    type,
    certificateNumber,
  });
  const certificateUrl = await uploadBuffer(pdfBuffer, 'eventsphere/certificates', 'raw');

  const certificate = await Certificate.create({
    event: eventId,
    student: studentId,
    issuedBy: req.user._id,
    certificateUrl,
    certificateNumber,
    type,
    feeStatus: event.certificateFeeEnabled ? 'Pending' : 'Not Applicable',
  });

  await Notification.create({
    recipient: studentId,
    type: 'Certificate Available',
    title: 'Your certificate is ready to download',
    message: `Your ${type.toLowerCase()} certificate for "${event.title}" is now available.`,
    relatedEvent: eventId,
  });

  success(res, 201, 'Certificate generated', { certificate });
});

// @route POST /api/certificates/bulk-issue  (organizer, all attendees of an event)
const bulkIssueCertificates = asyncHandler(async (req, res) => {
  const { eventId, type = 'Participation' } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  const attendees = await Attendance.find({ event: eventId }).populate('student');
  const existingCerts = await Certificate.find({ event: eventId }).select('student');
  const alreadyIssued = new Set(existingCerts.map((c) => c.student.toString()));

  const issued = [];
  for (const record of attendees) {
    if (alreadyIssued.has(record.student._id.toString())) continue;

    const certificateNumber = generateCertificateNumber();
    const pdfBuffer = await generateCertificatePDF({
      studentName: record.student.fullName,
      eventTitle: event.title,
      date: new Date(event.date).toLocaleDateString(),
      type,
      certificateNumber,
    });
    const certificateUrl = await uploadBuffer(pdfBuffer, 'eventsphere/certificates', 'raw');

    const cert = await Certificate.create({
      event: eventId, student: record.student._id, issuedBy: req.user._id,
      certificateUrl, certificateNumber, type,
      feeStatus: event.certificateFeeEnabled ? 'Pending' : 'Not Applicable',
    });
    issued.push(cert);

    await Notification.create({
      recipient: record.student._id,
      type: 'Certificate Available',
      title: 'Your certificate is ready to download',
      message: `Your certificate for "${event.title}" is now available.`,
      relatedEvent: eventId,
    });
  }

  success(res, 201, `${issued.length} certificate(s) issued`, { issued });
});

// @route GET /api/certificates/me
const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id })
    .populate('event', 'title date bannerUrl')
    .sort('-issuedAt');
  success(res, 200, 'Certificates fetched', { certificates });
});

module.exports = { generateCertificate, bulkIssueCertificates, getMyCertificates };
