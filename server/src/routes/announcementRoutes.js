const router = require('express').Router();
const { listAnnouncements } = require('../controllers/announcementController');

router.get('/', listAnnouncements);

module.exports = router;
