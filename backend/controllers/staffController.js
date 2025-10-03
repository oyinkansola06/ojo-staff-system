const { pool } = require('../config/database');

class StaffController {
    // Get all staff with department info
    static async getAllStaff(req, res) {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    s.id, 
                    s.staff_id, 
                    s.first_name, 
                    s.last_name, 
                    s.email, 
                    s.phone, 
                    s.position,
                    s.created_at,
                    d.id as department_id,
                    d.name as department_name
                FROM staff s
                LEFT JOIN departments d ON s.department_id = d.id
                ORDER BY s.first_name, s.last_name
            `);
            
            res.json({
                success: true,
                message: 'Staff fetched successfully',
                data: rows
            });
        } catch (error) {
            console.error('Error fetching staff:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch staff',
                error: error.message
            });
        }
    }

    // Get single staff member
    static async getStaffById(req, res) {
        try {
            const { staffId } = req.params;
            
            const [rows] = await pool.execute(`
                SELECT 
                    s.id, 
                    s.staff_id, 
                    s.first_name, 
                    s.last_name, 
                    s.email, 
                    s.phone, 
                    s.position,
                    s.created_at,
                    d.id as department_id,
                    d.name as department_name
                FROM staff s
                LEFT JOIN departments d ON s.department_id = d.id
                WHERE s.staff_id = ?
            `, [staffId]);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff member not found'
                });
            }

            res.json({
                success: true,
                message: 'Staff member fetched successfully',
                data: rows[0]
            });
        } catch (error) {
            console.error('Error fetching staff:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch staff member',
                error: error.message
            });
        }
    }

    // Create new staff member
    static async createStaff(req, res) {
        try {
            const { 
                staff_id, 
                first_name, 
                last_name, 
                email, 
                phone, 
                department_id, 
                position 
            } = req.body;

            // Validate required fields
            if (!staff_id || !first_name || !last_name || !department_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Staff ID, first name, last name, and department are required'
                });
            }

            const [result] = await pool.execute(`
                INSERT INTO staff (staff_id, first_name, last_name, email, phone, department_id, position) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [staff_id, first_name, last_name, email, phone, department_id, position]);

            res.status(201).json({
                success: true,
                message: 'Staff member created successfully',
                data: {
                    id: result.insertId,
                    staff_id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    department_id,
                    position
                }
            });
        } catch (error) {
            console.error('Error creating staff:', error);
            
            // Handle duplicate staff ID or email
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'Staff ID or email already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create staff member',
                error: error.message
            });
        }
    }
}

module.exports = StaffController;