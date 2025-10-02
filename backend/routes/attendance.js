const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');

// GET /api/attendance - Get all attendance records
router.get('/', AttendanceController.getAllAttendance);

// GET /api/attendance/date/:date - Get attendance for specific date
router.get('/date/:date', AttendanceController.getAttendanceByDate);

// POST /api/attendance/checkin - Staff check-in
router.post('/checkin', AttendanceController.checkIn);

// POST /api/attendance/checkout - Staff check-out
router.post('/checkout', AttendanceController.checkOut);

// POST /api/attendance/manual - Create manual attendance entry
router.post('/manual', AttendanceController.createManualEntry);

module.exports = router;