const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');

// @route GET /api/users/me/dashboard  (participant overview stats)
const getMyDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const [registrations, certificatesCount, bookmarkedCount] = await Promise.all([
    Registration.find({ student: studentId, status: { $ne: 'Cancelled' } }).populate('event'),
    Certificate.countDocuments({ student: studentId }),
    User.findById(studentId).then((u) => u.bookmarkedEvents.length),
  ]);

  const now = new Date();
  const upcoming = registrations.filter((r) => r.event && new Date(r.event.date) >= now);
  const attended = registrations.filter((r) => r.event && new Date(r.event.date) < now);

  success(res, 200, 'Dashboard summary fetched', {
    stats: {
      registeredEvents: registrations.length,
      upcomingEvents: upcoming.length,
      attendedEvents: attended.length,
      certificates: certificatesCount,
      savedEvents: bookmarkedCount,
    },
    upcoming: upcoming.slice(0, 5),
  });
});

// @route PATCH /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['fullName', 'contactNumber', 'department', 'bio', 'avatarUrl'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  success(res, 200, 'Profile updated', { user: user.toSafeObject() });
});

// @route POST /api/users/me/bookmarks/:eventId
const toggleBookmark = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const eventId = req.params.eventId;

  const idx = user.bookmarkedEvents.findIndex((id) => id.toString() === eventId);
  let bookmarked;
  if (idx >= 0) {
    user.bookmarkedEvents.splice(idx, 1);
    bookmarked = false;
  } else {
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, 'Event not found');
    user.bookmarkedEvents.push(eventId);
    bookmarked = true;
  }
  await user.save();
  success(res, 200, bookmarked ? 'Event bookmarked' : 'Bookmark removed', { bookmarked });
});

// @route GET /api/users/me/bookmarks
const getMyBookmarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'bookmarkedEvents',
    populate: [{ path: 'category' }, { path: 'department' }],
  });
  success(res, 200, 'Bookmarked events fetched', { events: user.bookmarkedEvents });
});

// ---------- Admin: user management (SRS section 17) ----------

// @route GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('department'),
    User.countDocuments(filter),
  ]);

  success(res, 200, 'Users fetched', { users, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route PATCH /api/admin/users/:id/role
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['participant', 'organizer', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  success(res, 200, 'User role updated', { user: user.toSafeObject() });
});

// @route PATCH /api/admin/users/:id/status
const changeUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) throw new ApiError(400, 'Invalid status');
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  success(res, 200, `User ${status === 'suspended' ? 'suspended' : 'activated'}`, { user: user.toSafeObject() });
});

// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  success(res, 200, 'User deleted');
});

module.exports = {
  getMyDashboard, updateProfile, toggleBookmark, getMyBookmarks,
  listUsers, changeUserRole, changeUserStatus, deleteUser,
};
