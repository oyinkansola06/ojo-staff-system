// src/api/endpoints.js
export const ENDPOINTS = {
    // Health check
    HEALTH: '/health',
    
    // Department endpoints
    DEPARTMENTS: {
      LIST: '/departments',
      BY_ID: (id) => `/departments/${id}`,
      CREATE: '/departments',
      UPDATE: (id) => `/departments/${id}`,
      DELETE: (id) => `/departments/${id}`,
    },
    
    // Staff endpoints
    STAFF: {
      LIST: '/staff',
      BY_ID: (staffId) => `/staff/${staffId}`,
      CREATE: '/staff',
      UPDATE: (staffId) => `/staff/${staffId}`,
      DELETE: (staffId) => `/staff/${staffId}`,
    },
    
    // Attendance endpoints
    ATTENDANCE: {
      LIST:  '/attendance',
      BY_DATE: (date) => `/attendance/date/${date}`,
      BY_DATE_RANGE: '/attendance/range',
      CHECK_IN: '/attendance/checkin',
      CHECK_OUT: '/attendance/checkout',
      MANUAL_ENTRY: '/attendance/manual',
      BULK_CHECK_IN: '/attendance/bulk-checkin',
      STATS: (date) => `/attendance/stats/${date}`,
    },
  };
  
  export default ENDPOINTS;