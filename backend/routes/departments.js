const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/departmentController');

// GET /api/departments - Get all departments
router.get('/', DepartmentController.getAllDepartments);

// GET /api/departments/:id - Get single department
router.get('/:id', DepartmentController.getDepartmentById);

// POST /api/departments - Create new department
router.post('/', DepartmentController.createDepartment);

module.exports = router;