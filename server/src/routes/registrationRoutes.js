const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { registerForEvent, cancelRegistration, getMyRegistrations } = require('../controllers/registrationController');

router.use(protect);
router.get('/me', getMyRegistrations);
router.post('/:eventId', registerForEvent);
router.delete('/:id', cancelRegistration);

module.exports = router;
