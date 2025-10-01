const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================
// HEALTH CHECK
// ============================================
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// DEPARTMENTS
// ============================================
router.get('/departments', async (req, res) => {
    try {
        const [departments] = await db.query('SELECT * FROM departments ORDER BY name');
        res.json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch departments',
            error: error.message 
        });
    }
});

router.get('/departments/:id', async (req, res) => {
    try {
        const [dept] = await db.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
        if (dept.length === 0) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, data: dept[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/departments', async (req, res) => {
    try {
        const { name } = req.body;
        const [result] = await db.query('INSERT INTO departments (name) VALUES (?)', [name]);
        res.json({ success: true, data: { id: result.insertId, name } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/departments/:id', async (req, res) => {
    try {
        const { name } = req.body;
        await db.query('UPDATE departments SET name = ? WHERE id = ?', [name, req.params.id]);
        res.json({ success: true, message: 'Department updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/departments/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Department deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// STAFF
// ============================================
router.get('/staff', async (req, res) => {
    try {
        const [staff] = await db.query(`
            SELECT s.*, d.name as department_name 
            FROM staff s 
            LEFT JOIN departments d ON s.department_id = d.id
            ORDER BY s.name
        `);
        res.json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch staff',
            error: error.message 
        });
    }
});

router.get('/staff/:id', async (req, res) => {
    try {
        const [staff] = await db.query(`
            SELECT s.*, d.name as department_name 
            FROM staff s 
            LEFT JOIN departments d ON s.department_id = d.id
            WHERE s.id = ?
        `, [req.params.id]);
        
        if (staff.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        res.json({ success: true, data: staff[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/staff', async (req, res) => {
    try {
        const { staff_id, name, department_id } = req.body;
        const [result] = await db.query(
            'INSERT INTO staff (staff_id, name, department_id) VALUES (?, ?, ?)',
            [staff_id, name, department_id]
        );
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/staff/:id', async (req, res) => {
    try {
        const { name, department_id } = req.body;
        await db.query(
            'UPDATE staff SET name = ?, department_id = ? WHERE id = ?',
            [name, department_id, req.params.id]
        );
        res.json({ success: true, message: 'Staff updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/staff/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Staff deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ATTENDANCE - MATCHING YOUR FRONTEND ENDPOINTS
// ============================================

// Get all attendance records
router.get('/attendance', async (req, res) => {
    try {
        const [records] = await db.query(`
            SELECT a.*, s.name as staff_name, s.staff_id as staff_number, d.name as department_name
            FROM attendance a
            JOIN staff s ON a.staff_id = s.id
            LEFT JOIN departments d ON s.department_id = d.id
            ORDER BY a.date DESC, a.check_in DESC
        `);
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch attendance',
            error: error.message 
        });
    }
});

// Get attendance by specific date
router.get('/attendance/date/:date', async (req, res) => {
    try {
        const [records] = await db.query(`
            SELECT a.*, s.name as staff_name, s.staff_id as staff_number, d.name as department_name
            FROM attendance a
            JOIN staff s ON a.staff_id = s.id
            LEFT JOIN departments d ON s.department_id = d.id
            WHERE a.date = ?
            ORDER BY a.check_in DESC
        `, [req.params.date]);
        
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get attendance by date range
router.get('/attendance/range', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const [records] = await db.query(`
            SELECT a.*, s.name as staff_name, s.staff_id as staff_number, d.name as department_name
            FROM attendance a
            JOIN staff s ON a.staff_id = s.id
            LEFT JOIN departments d ON s.department_id = d.id
            WHERE a.date BETWEEN ? AND ?
            ORDER BY a.date DESC, a.check_in DESC
        `, [start_date, end_date]);
        
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check-in endpoint
router.post('/attendance/checkin', async (req, res) => {
    try {
        const { staff_id, date } = req.body;
        const check_in = new Date().toISOString();
        
        // Check if already checked in today
        const [existing] = await db.query(
            'SELECT * FROM attendance WHERE staff_id = ? AND date = ?',
            [staff_id, date || new Date().toISOString().split('T')[0]]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already checked in today' 
            });
        }
        
        const [result] = await db.query(
            'INSERT INTO attendance (staff_id, check_in, date) VALUES (?, ?, ?)',
            [staff_id, check_in, date || new Date().toISOString().split('T')[0]]
        );
        
        res.json({ 
            success: true, 
            message: 'Checked in successfully',
            data: { id: result.insertId, check_in }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check-out endpoint
router.post('/attendance/checkout', async (req, res) => {
    try {
        const { attendance_id, staff_id, date } = req.body;
        const check_out = new Date().toISOString();
        
        let query, params;
        
        if (attendance_id) {
            // Update by attendance ID
            query = 'UPDATE attendance SET check_out = ? WHERE id = ?';
            params = [check_out, attendance_id];
        } else if (staff_id && date) {
            // Update by staff_id and date
            query = 'UPDATE attendance SET check_out = ? WHERE staff_id = ? AND date = ?';
            params = [check_out, staff_id, date];
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Either attendance_id or (staff_id and date) required' 
            });
        }
        
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Attendance record not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Checked out successfully',
            data: { check_out }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Manual attendance entry
router.post('/attendance/manual', async (req, res) => {
    try {
        const { staff_id, check_in, check_out, date } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO attendance (staff_id, check_in, check_out, date) VALUES (?, ?, ?, ?)',
            [staff_id, check_in, check_out, date]
        );
        
        res.json({ 
            success: true, 
            message: 'Manual attendance recorded',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Bulk check-in
router.post('/attendance/bulk-checkin', async (req, res) => {
    try {
        const { staff_ids, date } = req.body;
        const check_in = new Date().toISOString();
        const attendanceDate = date || new Date().toISOString().split('T')[0];
        
        const values = staff_ids.map(staff_id => [staff_id, check_in, attendanceDate]);
        
        const [result] = await db.query(
            'INSERT INTO attendance (staff_id, check_in, date) VALUES ?',
            [values]
        );
        
        res.json({ 
            success: true, 
            message: `${result.affectedRows} staff checked in`,
            data: { count: result.affectedRows }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get attendance statistics for a specific date
router.get('/attendance/stats/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total_records,
                COUNT(CASE WHEN check_in IS NOT NULL THEN 1 END) as checked_in,
                COUNT(CASE WHEN check_out IS NOT NULL THEN 1 END) as checked_out,
                COUNT(CASE WHEN check_in IS NOT NULL AND check_out IS NULL THEN 1 END) as still_present
            FROM attendance
            WHERE date = ?
        `, [date]);
        
        res.json({ success: true, data: stats[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;