const router = require('express').Router();
const { downloadICS } = require('../controllers/calendarController');

router.get('/:eventId.ics', downloadICS);

module.exports = router;
