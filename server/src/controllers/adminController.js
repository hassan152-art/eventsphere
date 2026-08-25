const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/apiResponse');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');

// @route GET /api/admin/dashboard  (SRS section 15)
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers, students, organizers, admins,
    totalEvents, pendingEvents, approvedEvents,
    totalRegistrations, totalAttendance,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'participant' }),
    User.countDocuments({ role: 'organizer' }),
    User.countDocuments({ role: 'admin' }),
    Event.countDocuments(),
    Event.countDocuments({ status: 'Pending Approval' }),
    Event.countDocuments({ status: 'Approved' }),
    Registration.countDocuments({ status: { $ne: 'Cancelled' } }),
    Attendance.countDocuments(),
  ]);

  const attendanceRate = totalRegistrations ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;

  const [userGrowth, eventGrowth, categoryDistribution] = await Promise.all([
    User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Event.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Event.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]),
  ]);

  success(res, 200, 'Admin dashboard fetched', {
    stats: {
      totalUsers, students, organizers, admins,
      totalEvents, pendingEvents, approvedEvents,
      totalRegistrations, attendanceRate,
    },
    charts: { userGrowth, eventGrowth, categoryDistribution },
  });
});

// @route GET /api/organizer/dashboard  (SRS section 13)
const getOrganizerDashboard = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const events = await Event.find({ organizer: organizerId });
  const eventIds = events.map((e) => e._id);

  const [totalRegistrations, totalAttendance, feedbackAgg] = await Promise.all([
    Registration.countDocuments({ event: { $in: eventIds }, status: { $ne: 'Cancelled' } }),
    Attendance.countDocuments({ event: { $in: eventIds } }),
    Feedback.aggregate([{ $match: { event: { $in: eventIds } } }, { $group: { _id: null, avg: { $avg: '$overallRating' } } }]),
  ]);

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now).length;
  const attendanceRate = totalRegistrations ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;

  const registrationTrends = events
    .map((e) => ({ event: e.title, registrations: e.registrationCount }))
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 8);

  success(res, 200, 'Organizer dashboard fetched', {
    stats: {
      totalEvents: events.length,
      upcomingEvents,
      totalRegistrations,
      attendanceRate,
      averageRating: feedbackAgg[0]?.avg ? Math.round(feedbackAgg[0].avg * 10) / 10 : 0,
    },
    charts: { registrationTrends },
  });
});

module.exports = { getAdminDashboard, getOrganizerDashboard };
