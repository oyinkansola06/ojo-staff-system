const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');

// GET /api/staff - Get all staff
router.get('/', StaffController.getAllStaff);

// GET /api/staff/:staffId - Get single staff member
router.get('/:staffId', StaffController.getStaffById);

// POST /api/staff - Create new staff member
router.post('/', StaffController.createStaff);

module.exports = router;