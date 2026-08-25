const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

const { getAdminDashboard } = require('../controllers/adminController');
const { listUsers, changeUserRole, changeUserStatus, deleteUser } = require('../controllers/userController');
const { listPendingEvents, setEventApproval, cancelEvent } = require('../controllers/eventController');
const { moderateFeedback } = require('../controllers/feedbackController');
const { moderateMedia } = require('../controllers/mediaController');
const { createAnnouncement, deactivateAnnouncement } = require('../controllers/announcementController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);

router.get('/users', listUsers);
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/status', changeUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/events/pending', listPendingEvents);
router.patch('/events/:id/approval', setEventApproval);
router.patch('/events/:id/cancel', cancelEvent);

router.patch('/feedback/:id/moderate', moderateFeedback);
router.patch('/media/:id/moderate', moderateMedia);

router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deactivateAnnouncement);

module.exports = router;
