const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getMyDashboard, updateProfile, toggleBookmark, getMyBookmarks,
  toggleSavedMedia, getMySavedMedia,
} = require('../controllers/userController');

router.use(protect);
router.get('/me/dashboard', getMyDashboard);
router.patch('/me', updateProfile);
router.post('/me/bookmarks/:eventId', toggleBookmark);
router.get('/me/bookmarks', getMyBookmarks);
router.post('/me/saved-media/:mediaId', toggleSavedMedia);
router.get('/me/saved-media', getMySavedMedia);

module.exports = router;
