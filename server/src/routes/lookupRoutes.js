const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const { listDepartments, createDepartment, listCategories, createCategory } = require('../controllers/lookupController');

router.get('/departments', listDepartments);
router.get('/categories', listCategories);
router.post('/departments', protect, authorize('admin'), createDepartment);
router.post('/categories', protect, authorize('admin'), createCategory);

module.exports = router;
