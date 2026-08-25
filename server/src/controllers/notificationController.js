const asyncHandler = require('../middleware/asyncHandler');
const { success, ApiError } = require('../utils/apiResponse');
const Notification = require('../models/Notification');

// @route GET /api/notifications/me
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(100);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  success(res, 200, 'Notifications fetched', { notifications, unreadCount });
});

// @route PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  success(res, 200, 'Notification marked as read', { notification });
});

// @route PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  success(res, 200, 'All notifications marked as read');
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
