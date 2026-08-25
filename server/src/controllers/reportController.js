const asyncHandler = require('../middleware/asyncHandler');
const { Parser } = require('json2csv');
const { success, ApiError } = require('../utils/apiResponse');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const User = require('../models/User');

const sendCSV = (res, filename, rows) => {
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
};

// @route GET /api/reports/registrations?eventId=&format=csv|json
const registrationsReport = asyncHandler(async (req, res) => {
  const { eventId, format = 'json' } = req.query;
  const filter = eventId ? { event: eventId } : {};

  const registrations = await Registration.find(filter)
    .populate('event', 'title date')
    .populate('student', 'fullName email department enrollmentNumber');

  const rows = registrations.map((r) => ({
    event: r.event?.title,
    student: r.student?.fullName,
    email: r.student?.email,
    enrollmentNumber: r.student?.enrollmentNumber,
    status: r.status,
    registeredAt: r.registeredAt,
  }));

  if (format === 'csv') return sendCSV(res, 'registrations-report.csv', rows);
  success(res, 200, 'Registrations report generated', { rows });
});

// @route GET /api/reports/attendance?eventId=&format=
const attendanceReport = asyncHandler(async (req, res) => {
  const { eventId, format = 'json' } = req.query;
  const filter = eventId ? { event: eventId } : {};

  const records = await Attendance.find(filter)
    .populate('event', 'title date')
    .populate('student', 'fullName email department');

  const rows = records.map((a) => ({
    event: a.event?.title,
    student: a.student?.fullName,
    email: a.student?.email,
    checkedInAt: a.checkedInAt,
  }));

  if (format === 'csv') return sendCSV(res, 'attendance-report.csv', rows);
  success(res, 200, 'Attendance report generated', { rows });
});

// @route GET /api/reports/feedback?eventId=&format=
const feedbackReport = asyncHandler(async (req, res) => {
  const { eventId, format = 'json' } = req.query;
  const filter = eventId ? { event: eventId } : {};

  const records = await Feedback.find(filter).populate('event', 'title').populate('student', 'fullName');

  const rows = records.map((f) => ({
    event: f.event?.title,
    student: f.student?.fullName,
    overallRating: f.overallRating,
    venueRating: f.venueRating,
    coordinationRating: f.coordinationRating,
    comment: f.comment,
  }));

  if (format === 'csv') return sendCSV(res, 'feedback-report.csv', rows);
  success(res, 200, 'Feedback report generated', { rows });
});

// @route GET /api/reports/certificates?eventId=&format=
const certificatesReport = asyncHandler(async (req, res) => {
  const { eventId, format = 'json' } = req.query;
  const filter = eventId ? { event: eventId } : {};

  const records = await Certificate.find(filter).populate('event', 'title').populate('student', 'fullName email');

  const rows = records.map((c) => ({
    event: c.event?.title,
    student: c.student?.fullName,
    email: c.student?.email,
    certificateNumber: c.certificateNumber,
    type: c.type,
    issuedAt: c.issuedAt,
  }));

  if (format === 'csv') return sendCSV(res, 'certificates-report.csv', rows);
  success(res, 200, 'Certificates report generated', { rows });
});

// @route GET /api/reports/user-growth  (admin)
const userGrowthReport = asyncHandler(async (req, res) => {
  const growth = await User.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  success(res, 200, 'User growth report generated', { growth });
});

// @route GET /api/reports/department-performance  (admin)
const departmentPerformanceReport = asyncHandler(async (req, res) => {
  const performance = await Event.aggregate([
    { $group: { _id: '$department', totalEvents: { $sum: 1 }, totalRegistrations: { $sum: '$registrationCount' }, avgRating: { $avg: '$averageRating' } } },
    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
    { $unwind: '$department' },
    { $project: { name: '$department.name', totalEvents: 1, totalRegistrations: 1, avgRating: { $round: ['$avgRating', 1] } } },
  ]);
  success(res, 200, 'Department performance report generated', { performance });
});

module.exports = {
  registrationsReport, attendanceReport, feedbackReport, certificatesReport,
  userGrowthReport, departmentPerformanceReport,
};
