// src/api/services/attendanceService.js
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

class AttendanceService {
  /**
   * Get attendance records for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} Attendance records and stats
   */
  static async getAttendanceByDate(date) {
    try {
      const response = await apiClient.get(ENDPOINTS.ATTENDANCE.BY_DATE(date));
      return {
        success: true,
        data: response.data.data || { records: [], stats: {} },
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: { records: [], stats: {} },
        message: error.message || `Failed to fetch attendance for ${date}`,
        error,
      };
    }
  }

  /**
   * Staff check-in
   * @param {Object} checkInData - Check-in data
   * @param {string} checkInData.staff_id - Staff ID
   * @param {string} checkInData.time_in - Time in HH:MM format
   * @param {string} checkInData.date - Date in YYYY-MM-DD format
   * @returns {Promise} Check-in result
   */
  static async checkIn(checkInData) {
    try {
      const response = await apiClient.post(ENDPOINTS.ATTENDANCE.CHECK_IN, checkInData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Check-in failed',
        error,
      };
    }
  }

  /**
   * Staff check-out
   * @param {Object} checkOutData - Check-out data
   * @param {string} checkOutData.staff_id - Staff ID
   * @param {string} checkOutData.time_out - Time out in HH:MM format
   * @param {string} checkOutData.date - Date in YYYY-MM-DD format
   * @returns {Promise} Check-out result
   */
  static async checkOut(checkOutData) {
    try {
      const response = await apiClient.post(ENDPOINTS.ATTENDANCE.CHECK_OUT, checkOutData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Check-out failed',
        error,
      };
    }
  }

  /**
   * Create manual attendance entry
   * @param {Object} entryData - Manual entry data
   * @param {string} entryData.staff_id - Staff ID
   * @param {string} entryData.attendance_date - Date in YYYY-MM-DD format
   * @param {string} entryData.time_in - Time in HH:MM format (optional)
   * @param {string} entryData.time_out - Time out HH:MM format (optional)
   * @param {string} entryData.status - Status (present, late, absent, half_day, excused)
   * @param {string} entryData.notes - Notes (optional)
   * @returns {Promise} Manual entry result
   */
  static async createManualEntry(entryData) {
    try {
      const response = await apiClient.post(ENDPOINTS.ATTENDANCE.MANUAL_ENTRY, entryData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create manual entry',
        error,
      };
    }
  }

  /**
   * Get attendance for date range
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date YYYY-MM-DD
   * @param {string} params.endDate - End date YYYY-MM-DD
   * @param {string} params.staffId - Optional staff ID filter
   * @returns {Promise} Attendance records for date range
   */
  static async getAttendanceByDateRange(params) {
    try {
      const response = await apiClient.get(ENDPOINTS.ATTENDANCE.BY_DATE_RANGE, { params });
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch attendance range',
        error,
      };
    }
  }
}

export default AttendanceService;