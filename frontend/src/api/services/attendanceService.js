// src/api/services/attendanceService.js
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

class AttendanceService {
  /**
   * Get attendance for a specific date
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
        message: error.response?.data?.message || 'Failed to fetch attendance',
        error,
      };
    }
  }

  /**
   * Staff check-in
   */
  static async checkIn(staffId, timeIn, date) {
    try {
      const response = await apiClient.post(ENDPOINTS.ATTENDANCE.CHECK_IN, {
        staff_id: staffId,
        time_in: timeIn,
        date: date,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Check-in failed',
        error,
      };
    }
  }

  /**
   * Staff check-out
   */
  static async checkOut(staffId, timeOut, date) {
    try {
      const response = await apiClient.post(ENDPOINTS.ATTENDANCE.CHECK_OUT, {
        staff_id: staffId,
        time_out: timeOut,
        date: date,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Check-out failed',
        error,
      };
    }
  }

  /**
   * Create manual attendance entry
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
        message: error.response?.data?.message || 'Failed to create manual entry',
        error,
      };
    }
  }
}

export default AttendanceService;