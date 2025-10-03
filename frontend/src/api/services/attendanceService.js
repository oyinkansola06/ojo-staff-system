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
  static async checkIn(data) {
    try {
      const response = await apiClient.post(ENDPOINTS.ATTENDANCE.CHECK_IN, {
        staff_id: data.staff_id,
        time_in: data.time_in,
        attendance_date: data.attendance_date,
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
  static async checkOut(data) { 
    try {
      const response = await apiClient.post(ENDPOINTS.ATTENDANCE.CHECK_OUT, {
        staff_id: data.staff_id,
        time_out: data.time_out,
        attendance_date: data.attendance_date,  
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

  /**x
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

  static async getTodayStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(`${ENDPOINTS.ATTENDANCE}/stats/${today}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch stats',
        error,
      };
    }
  }
}

export default AttendanceService;