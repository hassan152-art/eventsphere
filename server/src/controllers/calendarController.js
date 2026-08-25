const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const Event = require('../models/Event');
const { buildICS } = require('../services/calendarService');

// @route GET /api/calendar/:eventId.ics
const downloadICS = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  const icsContent = await buildICS(event);
  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader('Content-Disposition', `attachment; filename="${event.slug}.ics"`);
  res.send(icsContent);
});

module.exports = { downloadICS };
