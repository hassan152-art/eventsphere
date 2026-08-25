const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMyDashboard, updateProfile, toggleBookmark, getMyBookmarks } = require('../controllers/userController');

router.use(protect);
router.get('/me/dashboard', getMyDashboard);
router.patch('/me', updateProfile);
router.post('/me/bookmarks/:eventId', toggleBookmark);
router.get('/me/bookmarks', getMyBookmarks);

module.exports = router;
