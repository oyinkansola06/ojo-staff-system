export const ENDPOINTS = {
  // Health check
  HEALTH: '/health',
  
  // Department endpoints
  DEPARTMENTS: '/departments',
  
  // Staff endpoints
  STAFF: '/staff',
  
  // Attendance endpoints
  ATTENDANCE: {
    BY_DATE: (date) => `/attendance/date/${date}`,
    CHECK_IN: '/attendance/checkin',
    CHECK_OUT: '/attendance/checkout',
    MANUAL_ENTRY: '/attendance/manual',
  },
};

export default ENDPOINTS;