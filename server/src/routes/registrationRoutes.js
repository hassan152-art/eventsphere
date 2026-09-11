const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  registerForEvent, cancelRegistration, getMyRegistrations,
  getRegistrationTicket, updateRegistrationStatus, getPendingRegistrations,
} = require('../controllers/registrationController');

router.use(protect);
router.get('/me', getMyRegistrations);
// Admin & Organizer: view all pending student registrations
router.get('/pending', authorize('admin', 'organizer'), getPendingRegistrations);
router.get('/:id/ticket', getRegistrationTicket);
router.patch('/:id/status', authorize('organizer', 'admin'), updateRegistrationStatus);
router.post('/:eventId', registerForEvent);
router.delete('/:id', cancelRegistration);

module.exports = router;
