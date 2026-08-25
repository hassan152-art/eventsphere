const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const { generateCertificate, bulkIssueCertificates, getMyCertificates } = require('../controllers/certificateController');

router.use(protect);
router.get('/me', getMyCertificates);
router.post('/generate', authorize('organizer', 'admin'), generateCertificate);
router.post('/bulk-issue', authorize('organizer', 'admin'), bulkIssueCertificates);

module.exports = router;
