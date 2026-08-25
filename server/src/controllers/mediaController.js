const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, success } = require('../utils/apiResponse');
const Media = require('../models/Media');
const cloudinary = require('../config/cloudinary');

const streamUpload = (fileBuffer, folder, resourceType) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
    stream.end(fileBuffer);
  });

// @route GET /api/media  (gallery, public)
const listMedia = asyncHandler(async (req, res) => {
  const { category, department, year, eventId, search, page = 1, limit = 24 } = req.query;
  const filter = { moderationStatus: 'Approved' };
  if (category) filter.category = category;
  if (department) filter.department = department;
  if (year) filter.year = Number(year);
  if (eventId) filter.event = eventId;
  if (search) filter.caption = { $regex: search, $options: 'i' };

  const [media, total] = await Promise.all([
    Media.find(filter).populate('event department', 'title name').sort('-createdAt')
      .skip((page - 1) * limit).limit(Number(limit)),
    Media.countDocuments(filter),
  ]);

  success(res, 200, 'Gallery media fetched', { media, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route POST /api/media  (organizer/admin upload)
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const { category, event, department, caption, year } = req.body;

  const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  const url = await streamUpload(req.file.buffer, 'eventsphere/gallery', type === 'video' ? 'video' : 'image');

  const media = await Media.create({
    category, event: event || undefined, department: department || undefined,
    caption, year, type, url,
    uploadedBy: req.user._id,
    moderationStatus: req.user.role === 'admin' ? 'Approved' : 'Pending',
  });

  success(res, 201, 'Media uploaded', { media });
});

// @route PATCH /api/admin/media/:id/moderate
const moderateMedia = asyncHandler(async (req, res) => {
  const { moderationStatus } = req.body;
  if (!['Pending', 'Approved', 'Rejected'].includes(moderationStatus)) throw new ApiError(400, 'Invalid status');

  const media = await Media.findByIdAndUpdate(req.params.id, { moderationStatus }, { new: true });
  if (!media) throw new ApiError(404, 'Media not found');
  success(res, 200, 'Media moderation updated', { media });
});

// @route DELETE /api/media/:id
const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw new ApiError(404, 'Media not found');

  const isOwner = media.uploadedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not permitted');

  await media.deleteOne();
  success(res, 200, 'Media deleted');
});

module.exports = { listMedia, uploadMedia, moderateMedia, deleteMedia };
