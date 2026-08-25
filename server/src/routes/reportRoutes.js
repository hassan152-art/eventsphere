const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  registrationsReport, attendanceReport, feedbackReport, certificatesReport,
  userGrowthReport, departmentPerformanceReport,
} = require('../controllers/reportController');

router.use(protect, authorize('organizer', 'admin'));
router.get('/registrations', registrationsReport);
router.get('/attendance', attendanceReport);
router.get('/feedback', feedbackReport);
router.get('/certificates', certificatesReport);
router.get('/user-growth', authorize('admin'), userGrowthReport);
router.get('/department-performance', authorize('admin'), departmentPerformanceReport);

module.exports = router;
