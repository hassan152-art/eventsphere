const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { chat } = require('../controllers/aiController');

router.post('/chat', protect, chat);

module.exports = router;
