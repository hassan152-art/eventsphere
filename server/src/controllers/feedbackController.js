const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');

// @route POST /api/feedback/:eventId
const submitFeedback = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const studentId = req.user._id;

  const attended = await Attendance.findOne({ event: eventId, student: studentId });
  if (!attended) throw new ApiError(400, 'Feedback can only be submitted after attending the event');

  const existing = await Feedback.findOne({ event: eventId, student: studentId });
  if (existing) throw new ApiError(409, 'You have already submitted feedback for this event');

  const feedback = await Feedback.create({ event: eventId, student: studentId, ...req.body });

  const stats = await Feedback.aggregate([
    { $match: { event: feedback.event } },
    { $group: { _id: '$event', avg: { $avg: '$overallRating' }, count: { $sum: 1 } } },
  ]);
  if (stats[0]) {
    await Event.findByIdAndUpdate(eventId, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  }

  success(res, 201, 'Thank you! Your feedback has been submitted', { feedback });
});

// @route GET /api/feedback/event/:eventId  (approved feedback, public)
const getEventFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ event: req.params.eventId, isApproved: true })
    .populate('student', 'fullName avatarUrl')
    .sort('-createdAt');
  success(res, 200, 'Feedback fetched', { feedback });
});

// @route PATCH /api/admin/feedback/:id/moderate
const moderateFeedback = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
  if (!feedback) throw new ApiError(404, 'Feedback not found');
  success(res, 200, 'Feedback moderation updated', { feedback });
});

module.exports = { submitFeedback, getEventFeedback, moderateFeedback };
