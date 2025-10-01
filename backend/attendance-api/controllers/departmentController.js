// controllers/departmentController.js
const { pool } = require('../config/database');

class DepartmentController {
    // Get all departments
    static async getAllDepartments(req, res) {
        try {
            const [rows] = await pool.execute(`
                SELECT id, name, description, created_at 
                FROM departments 
                ORDER BY name
            `);
            
            res.json({
                success: true,
                message: 'Departments fetched successfully',
                data: rows
            });
        } catch (error) {
            console.error('Error fetching departments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch departments',
                error: error.message
            });
        }
    }

    // Get single department
    static async getDepartmentById(req, res) {
        try {
            const { id } = req.params;
            
            const [rows] = await pool.execute(`
                SELECT id, name, description, created_at 
                FROM departments 
                WHERE id = ?
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            res.json({
                success: true,
                message: 'Department fetched successfully',
                data: rows[0]
            });
        } catch (error) {
            console.error('Error fetching department:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch department',
                error: error.message
            });
        }
    }

    // Create new department
    static async createDepartment(req, res) {
        try {
            const { name, description } = req.body;

            // Validate required fields
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Department name is required'
                });
            }

            const [result] = await pool.execute(`
                INSERT INTO departments (name, description) 
                VALUES (?, ?)
            `, [name, description || null]);

            res.status(201).json({
                success: true,
                message: 'Department created successfully',
                data: {
                    id: result.insertId,
                    name,
                    description
                }
            });
        } catch (error) {
            console.error('Error creating department:', error);
            
            // Handle duplicate department name
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'Department name already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create department',
                error: error.message
            });
        }
    }
}

module.exports = DepartmentController;