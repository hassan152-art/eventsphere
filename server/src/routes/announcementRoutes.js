const router = require('express').Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

const {
  listAnnouncements,
  createAnnouncement,
} = require('../controllers/announcementController');

// Get announcements
router.get('/', protect, listAnnouncements);

// Admin creates announcement
router.post(
  '/',
  protect,
  authorize('admin'),
  createAnnouncement
);

module.exports = router;