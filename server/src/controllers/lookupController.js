const asyncHandler = require('../middleware/asyncHandler');
const { success, ApiError } = require('../utils/apiResponse');
const Department = require('../models/Department');
const Category = require('../models/Category');

const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort('name');
  success(res, 200, 'Departments fetched', { departments });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  success(res, 201, 'Department created', { department });
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  success(res, 200, 'Categories fetched', { categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  success(res, 201, 'Category created', { category });
});

module.exports = { listDepartments, createDepartment, listCategories, createCategory };
