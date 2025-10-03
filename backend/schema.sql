-- Attendance System Database Schema

USE attendance_system;

-- ============================================
-- 1. DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. STAFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    position VARCHAR(100),
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_staff_id (staff_id),
    INDEX idx_department (department_id)
);

-- ============================================
-- 3. ATTENDANCE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(50) NOT NULL,
    attendance_date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    status ENUM('present', 'late', 'absent', 'half_day', 'excused') DEFAULT 'present',
    hours_worked DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (staff_id, attendance_date),
    INDEX idx_date (attendance_date),
    INDEX idx_staff_date (staff_id, attendance_date)
);

-- ============================================
-- INSERT SAMPLE DATA (Optional)
-- ============================================

-- Sample Departments
INSERT INTO departments (name) VALUES 
    ('Engineering'),
    ('Human Resources'),
    ('Sales'),
    ('Marketing'),
    ('Finance')
ON DUPLICATE KEY UPDATE name=name;

-- Sample Staff
INSERT INTO staff (staff_id, first_name, last_name, email, position, department_id) VALUES
    ('EMP001', 'John', 'Doe', 'john.doe@company.com', 'Senior Engineer', 1),
    ('EMP002', 'Jane', 'Smith', 'jane.smith@company.com', 'HR Manager', 2),
    ('EMP003', 'Mike', 'Johnson', 'mike.johnson@company.com', 'Sales Executive', 3),
    ('EMP004', 'Sarah', 'Williams', 'sarah.williams@company.com', 'Marketing Specialist', 4),
    ('EMP005', 'David', 'Brown', 'david.brown@company.com', 'Financial Analyst', 5)
ON DUPLICATE KEY UPDATE staff_id=staff_id;

-- Sample Attendance Records (for today)
INSERT INTO attendance_records (staff_id, attendance_date, time_in, time_out, status, hours_worked) VALUES
    ('EMP001', CURDATE(), '08:15:00', '17:00:00', 'present', 8.75),
    ('EMP002', CURDATE(), '08:45:00', '17:15:00', 'late', 8.50),
    ('EMP003', CURDATE(), '08:00:00', NULL, 'present', 0.00),
    ('EMP004', CURDATE(), NULL, NULL, 'absent', 0.00),
    ('EMP005', CURDATE(), '09:00:00', '13:00:00', 'half_day', 4.00)
ON DUPLICATE KEY UPDATE staff_id=staff_id;

-- ============================================
-- VERIFY TABLES CREATED
-- ============================================
SHOW TABLES;

SELECT 'Database setup complete!' as message;