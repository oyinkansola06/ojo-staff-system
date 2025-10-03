// utils/helpers.js

// Calculate hours worked between two times
function calculateHoursWorked(timeIn, timeOut) {
    if (!timeIn || !timeOut) return 0;
    
    // Convert time strings to Date objects for calculation
    const timeInDate = new Date(`1970-01-01 ${timeIn}`);
    const timeOutDate = new Date(`1970-01-01 ${timeOut}`);
    
    // Handle case where checkout is next day (night shift)
    if (timeOutDate < timeInDate) {
        timeOutDate.setDate(timeOutDate.getDate() + 1);
    }
    
    // Calculate difference in milliseconds
    const diffMs = timeOutDate - timeInDate;
    
    // Convert to hours
    let hours = diffMs / (1000 * 60 * 60);
    
    // Subtract lunch break if worked more than 6 hours
    if (hours > 6) {
        hours -= 1; // 1 hour lunch break
    }
    
    // Round to 2 decimal places
    return Math.round(hours * 100) / 100;
}

// Format date for MySQL
function formatDateForMySQL(date) {
    if (!date) return null;
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Format time for MySQL
function formatTimeForMySQL(time) {
    if (!time) return null;
    
    // Ensure time is in HH:MM:SS format
    if (time.length === 5) {
        return `${time}:00`;
    }
    return time;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate staff ID format (e.g., OJO001)
function isValidStaffId(staffId) {
    const staffIdRegex = /^[A-Z]{3}\d{3}$/;
    return staffIdRegex.test(staffId);
}

module.exports = {
    calculateHoursWorked,
    formatDateForMySQL,
    formatTimeForMySQL,
    isValidEmail,
    isValidStaffId
};