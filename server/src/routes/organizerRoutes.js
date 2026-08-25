const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const { getOrganizerDashboard } = require('../controllers/adminController');

router.get('/dashboard', protect, authorize('organizer', 'admin'), getOrganizerDashboard);

module.exports = router;
