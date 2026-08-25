const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const { listMedia, uploadMedia, deleteMedia } = require('../controllers/mediaController');

router.get('/', listMedia);
router.post('/', protect, authorize('organizer', 'admin'), upload.single('file'), uploadMedia);
router.delete('/:id', protect, deleteMedia);

module.exports = router;
