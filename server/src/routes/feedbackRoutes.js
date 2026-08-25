const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { submitFeedback } = require('../controllers/feedbackController');

router.post('/:eventId', protect, submitFeedback);

module.exports = router;
