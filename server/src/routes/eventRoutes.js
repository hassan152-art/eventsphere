const router = require('express').Router();
const { protect, optionalAuth } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const { createEventValidator } = require('../validators/eventValidators');
const validate = require('../validators/validate');
const {
  listEvents, getEventBySlug, createEvent, updateEvent, uploadEventMedia, deleteEvent, cancelEvent,
} = require('../controllers/eventController');
const { getEventRegistrations, exportRegistrationsCSV } = require('../controllers/registrationController');
const { getEventAttendance } = require('../controllers/attendanceController');
const { getEventFeedback } = require('../controllers/feedbackController');

router.get('/', optionalAuth, listEvents);
router.get('/:slug', getEventBySlug);
router.get('/:eventId/feedback', getEventFeedback);

router.post('/', protect, authorize('organizer', 'admin'), createEventValidator, validate, createEvent);
router.patch('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.post('/:id/media', protect, authorize('organizer', 'admin'), upload.single('file'), uploadEventMedia);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.patch('/:id/cancel', protect, authorize('organizer', 'admin'), cancelEvent);

router.get('/:eventId/registrations', protect, authorize('organizer', 'admin'), getEventRegistrations);
router.get('/:eventId/export-registrations', protect, authorize('organizer', 'admin'), exportRegistrationsCSV);
router.get('/:eventId/attendance', protect, authorize('organizer', 'admin'), getEventAttendance);

module.exports = router;
