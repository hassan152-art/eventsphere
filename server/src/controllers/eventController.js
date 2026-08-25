const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now().toString(36);

const streamUpload = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
    stream.end(fileBuffer);
  });

// @route GET /api/events  (public discovery, SRS section 8)
const listEvents = asyncHandler(async (req, res) => {
  const {
    search, category, department, eventType, status, venue,
    dateFrom, dateTo, sort = '-date', page = 1, limit = 12,
    mine, // organizer's own events (any status)
  } = req.query;

  const filter = {};

  if (req.user?.role === 'organizer' && mine === 'true') {
    filter.organizer = req.user._id;
  } else {
    // Public discovery only shows approved events
    filter.status = 'Approved';
  }

  if (status && ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].includes(status)) {
    filter.computedStatus = status;
  }
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (department) filter.department = department;
  if (eventType) filter.eventType = eventType;
  if (venue) filter.venue = { $regex: venue, $options: 'i' };
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const sortMap = {
    '-date': { date: 1 },
    date: { date: -1 },
    popularity: { registrationCount: -1 },
  };

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('category department organizer', 'name fullName email')
      .sort(sortMap[sort] || { date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Event.countDocuments(filter),
  ]);

  success(res, 200, 'Events fetched', { events, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route GET /api/events/:slug
const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug })
    .populate('category department organizer', 'name fullName email avatarUrl bio');
  if (!event) throw new ApiError(404, 'Event not found');

  event.viewCount += 1;
  await event.save();

  success(res, 200, 'Event fetched', { event });
});

// @route POST /api/events  (organizer creates - SRS section 14)
const createEvent = asyncHandler(async (req, res) => {
  const body = req.body;

  const event = await Event.create({
    ...body,
    slug: slugify(body.title),
    organizer: req.user._id,
    seatsRemaining: body.maxParticipants,
    status: 'Pending Approval',
  });
  event.recomputeStatus();
  await event.save();

  success(res, 201, 'Event submitted for admin approval', { event });
});

// @route PATCH /api/events/:id
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted to edit this event');

  const protectedFields = ['seatsRemaining', 'registrationCount', 'status', 'organizer'];
  protectedFields.forEach((f) => delete req.body[f]);

  Object.assign(event, req.body);
  event.recomputeStatus();
  await event.save();

  success(res, 200, 'Event updated', { event });
});

// @route POST /api/events/:id/media  (banner / images / rulebook upload)
const uploadEventMedia = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  const { field } = req.body; // 'banner' | 'images' | 'rulebook'
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const url = await streamUpload(req.file.buffer, `eventsphere/events/${event._id}`);

  if (field === 'banner') event.bannerUrl = url;
  else if (field === 'rulebook') event.rulebookUrl = url;
  else event.images.push(url);

  await event.save();
  success(res, 200, 'Media uploaded', { event });
});

// @route DELETE /api/events/:id
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  await event.deleteOne();
  success(res, 200, 'Event deleted');
});

// ---------- Admin approval workflow (SRS section 16) ----------

// @route GET /api/admin/events/pending
const listPendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'Pending Approval' })
    .populate('category department organizer', 'name fullName email')
    .sort('-createdAt');
  success(res, 200, 'Pending events fetched', { events });
});

// @route PATCH /api/admin/events/:id/approval
const setEventApproval = asyncHandler(async (req, res) => {
  const { decision, note } = req.body; // 'Approved' | 'Rejected' | 'Changes Requested'
  if (!['Approved', 'Rejected', 'Changes Requested'].includes(decision)) {
    throw new ApiError(400, 'Invalid decision');
  }

  const event = await Event.findById(req.params.id).populate('organizer');
  if (!event) throw new ApiError(404, 'Event not found');

  event.status = decision;
  event.approvalNote = note || '';
  event.recomputeStatus();
  await event.save();

  await Notification.create({
    recipient: event.organizer._id,
    type: 'Event Approval Update',
    title: `Event ${decision.toLowerCase()}`,
    message: `Your event "${event.title}" was ${decision.toLowerCase()}${note ? `: ${note}` : '.'}`,
    relatedEvent: event._id,
  });

  success(res, 200, `Event ${decision.toLowerCase()}`, { event });
});

// @route PATCH /api/admin/events/:id/cancel  (or organizer cancelling own event)
const cancelEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  event.status = 'Cancelled';
  event.computedStatus = 'Cancelled';
  await event.save();

  success(res, 200, 'Event cancelled', { event });
});

module.exports = {
  listEvents, getEventBySlug, createEvent, updateEvent, uploadEventMedia,
  deleteEvent, listPendingEvents, setEventApproval, cancelEvent,
};
