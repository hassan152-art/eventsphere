const asyncHandler = require('../middleware/asyncHandler');
const { success, ApiError } = require('../utils/apiResponse');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route GET /api/announcements  (public/active, for homepage + notification center)
const listAnnouncements = asyncHandler(async (req, res) => {
  const { audience } = req.query;
  const filter = { isActive: true };
  if (audience) filter.audience = audience;
  const announcements = await Announcement.find(filter).sort('-createdAt').limit(20).populate('relatedEvent', 'title slug');
  success(res, 200, 'Announcements fetched', { announcements });
});

// @route POST /api/admin/announcements
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, audience = 'Global', relatedEvent } = req.body;
  const announcement = await Announcement.create({ title, message, audience, relatedEvent, createdBy: req.user._id });

  // Fan out as notifications to the relevant audience
  const roleFilter = audience === 'Students' ? { role: 'participant' } : audience === 'Organizers' ? { role: 'organizer' } : {};
  const recipients = await User.find(roleFilter).select('_id');
  if (recipients.length) {
    await Notification.insertMany(
      recipients.map((u) => ({
        recipient: u._id,
        type: 'Admin Announcement',
        title,
        message,
        relatedEvent: relatedEvent || undefined,
      }))
    );
  }

  success(res, 201, 'Announcement published', { announcement });
});

// @route DELETE /api/admin/announcements/:id
const deactivateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  success(res, 200, 'Announcement removed', { announcement });
});

module.exports = { listAnnouncements, createAnnouncement, deactivateAnnouncement };
