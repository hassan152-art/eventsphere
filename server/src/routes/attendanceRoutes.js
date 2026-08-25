const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const { getMyQRPass, scanAttendance, getMyAttendance } = require('../controllers/attendanceController');

router.use(protect);
router.get('/me', getMyAttendance);
router.get('/qr/:registrationId', getMyQRPass);
router.post('/scan', authorize('organizer', 'admin'), scanAttendance);

module.exports = router;
