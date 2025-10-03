const { pool } = require("../config/database");
const { calculateHoursWorked } = require("../utils/helpers");

class AttendanceController {
	// Get all attendance records
	static async getAllAttendance(req, res) {
		try {
			const [rows] = await pool.execute(`
            SELECT 
                ar.id,
                ar.staff_id,
                ar.attendance_date,
                ar.time_in,
                ar.time_out,
                ar.status,
                ar.hours_worked,
                ar.notes,
                ar.created_at,
                s.first_name,
                s.last_name,
                s.email,
                s.position,
                d.name as department_name
            FROM attendance_records ar
            JOIN staff s ON ar.staff_id = s.staff_id
            LEFT JOIN departments d ON s.department_id = d.id
            ORDER BY ar.attendance_date DESC, s.first_name, s.last_name
        `);

			res.json({
				success: true,
				message: "All attendance records fetched successfully",
				data: rows,
			});
		} catch (error) {
			console.error("Error fetching all attendance:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch attendance records",
				error: error.message,
			});
		}
	}

	// Get attendance for a specific date
	static async getAttendanceByDate(req, res) {
		try {
			const { date } = req.params;

			const [rows] = await pool.execute(
				`
                SELECT 
                    ar.id,
                    ar.staff_id,
                    ar.attendance_date,
                    ar.time_in,
                    ar.time_out,
                    ar.status,
                    ar.hours_worked,
                    ar.notes,
                    ar.created_at,
                    s.first_name,
                    s.last_name,
                    s.email,
                    s.position,
                    d.name as department_name
                FROM attendance_records ar
                JOIN staff s ON ar.staff_id = s.staff_id
                LEFT JOIN departments d ON s.department_id = d.id
                WHERE ar.attendance_date = ?
                ORDER BY s.first_name, s.last_name
            `,
				[date]
			);

			// Get attendance statistics
			const stats = await AttendanceController.getAttendanceStats(date);

			res.json({
				success: true,
				message: "Attendance records fetched successfully",
				data: {
					records: rows,
					stats: stats,
				},
			});
		} catch (error) {
			console.error("Error fetching attendance:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch attendance records",
				error: error.message,
			});
		}
	}

	// Get attendance statistics for a date
	static async getAttendanceStats(date) {
		try {
			const [statsRows] = await pool.execute(
				`
                SELECT 
                    COUNT(DISTINCT s.staff_id) as total_staff,
                    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
                    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_count,
                    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
                    COUNT(CASE WHEN ar.status = 'half_day' THEN 1 END) as half_day_count,
                    COUNT(CASE WHEN ar.status = 'excused' THEN 1 END) as excused_count
                FROM staff s
                LEFT JOIN attendance_records ar ON s.staff_id = ar.staff_id AND ar.attendance_date = ?
            `,
				[date]
			);

			const stats = statsRows[0];

			// Calculate attendance rate
			const attendedCount =
				stats.present_count + stats.late_count + stats.half_day_count;
			stats.attendance_rate =
				stats.total_staff > 0
					? Math.round((attendedCount / stats.total_staff) * 100)
					: 0;

			return stats;
		} catch (error) {
			console.error("Error calculating attendance stats:", error);
			return {
				total_staff: 0,
				present_count: 0,
				late_count: 0,
				absent_count: 0,
				half_day_count: 0,
				excused_count: 0,
				attendance_rate: 0,
			};
		}
	}

	// Staff check-in
	static async checkIn(req, res) {
		try {
			const { staff_id, time_in, date } = req.body;

			// Validate required fields
			if (!staff_id || !time_in || !date) {
				return res.status(400).json({
					success: false,
					message: "Staff ID, time in, and date are required",
				});
			}

			// Check if staff exists
			const [staffRows] = await pool.execute(
				"SELECT staff_id FROM staff WHERE staff_id = ?",
				[staff_id]
			);

			if (staffRows.length === 0) {
				return res.status(404).json({
					success: false,
					message: "Staff member not found",
				});
			}

			// Determine status (late if after 8:30 AM)
			const timeIn = new Date(`1970-01-01 ${time_in}`);
			const lateThreshold = new Date("1970-01-01 08:30:00");
			const status = timeIn > lateThreshold ? "late" : "present";

			// Insert or update attendance record
			const [result] = await pool.execute(
				`
                INSERT INTO attendance_records (staff_id, attendance_date, time_in, status)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                time_in = VALUES(time_in),
                status = VALUES(status),
                updated_at = CURRENT_TIMESTAMP
            `,
				[staff_id, date, time_in, status]
			);

			res.json({
				success: true,
				message: `Check-in successful for ${staff_id}`,
				data: {
					staff_id,
					date,
					time_in,
					status,
				},
			});
		} catch (error) {
			console.error("Error during check-in:", error);
			res.status(500).json({
				success: false,
				message: "Check-in failed",
				error: error.message,
			});
		}
	}

	// Staff check-out
	static async checkOut(req, res) {
		try {
			const { staff_id, time_out, date } = req.body;

			// Validate required fields
			if (!staff_id || !time_out || !date) {
				return res.status(400).json({
					success: false,
					message: "Staff ID, time out, and date are required",
				});
			}

			// Get existing attendance record
			const [existingRows] = await pool.execute(
				`
                SELECT * FROM attendance_records 
                WHERE staff_id = ? AND attendance_date = ?
            `,
				[staff_id, date]
			);

			if (existingRows.length === 0) {
				return res.status(404).json({
					success: false,
					message: "No check-in record found for today. Please check in first.",
				});
			}

			const record = existingRows[0];

			if (!record.time_in) {
				return res.status(400).json({
					success: false,
					message: "Cannot check out without checking in first",
				});
			}

			// Calculate hours worked
			const hoursWorked = calculateHoursWorked(record.time_in, time_out);

			// Update record with check-out time
			await pool.execute(
				`
                UPDATE attendance_records 
                SET time_out = ?, hours_worked = ?, updated_at = CURRENT_TIMESTAMP
                WHERE staff_id = ? AND attendance_date = ?
            `,
				[time_out, hoursWorked, staff_id, date]
			);

			res.json({
				success: true,
				message: `Check-out successful for ${staff_id}`,
				data: {
					staff_id,
					date,
					time_out,
					hours_worked: hoursWorked,
				},
			});
		} catch (error) {
			console.error("Error during check-out:", error);
			res.status(500).json({
				success: false,
				message: "Check-out failed",
				error: error.message,
			});
		}
	}

	// Create manual attendance entry
	static async createManualEntry(req, res) {
		try {
			const { staff_id, attendance_date, time_in, time_out, status, notes } =
				req.body;

			// Validate required fields
			if (!staff_id || !attendance_date || !status) {
				return res.status(400).json({
					success: false,
					message: "Staff ID, date, and status are required",
				});
			}

			// Calculate hours worked if both times provided
			let hoursWorked = 0;
			if (time_in && time_out) {
				hoursWorked = calculateHoursWorked(time_in, time_out);
			}

			// Insert or update attendance record
			const [result] = await pool.execute(
				`
                INSERT INTO attendance_records 
                (staff_id, attendance_date, time_in, time_out, status, hours_worked, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                time_in = VALUES(time_in),
                time_out = VALUES(time_out),
                status = VALUES(status),
                hours_worked = VALUES(hours_worked),
                notes = VALUES(notes),
                updated_at = CURRENT_TIMESTAMP
            `,
				[
					staff_id,
					attendance_date,
					time_in,
					time_out,
					status,
					hoursWorked,
					notes,
				]
			);

			res.json({
				success: true,
				message: "Manual attendance entry created successfully",
				data: {
					staff_id,
					attendance_date,
					time_in,
					time_out,
					status,
					hours_worked: hoursWorked,
					notes,
				},
			});
		} catch (error) {
			console.error("Error creating manual entry:", error);
			res.status(500).json({
				success: false,
				message: "Failed to create manual attendance entry",
				error: error.message,
			});
		}
	}
}

module.exports = AttendanceController;
