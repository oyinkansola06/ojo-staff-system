// src/api/services/staffService.js
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

class StaffService {
  /**
   * Get all staff members
   * @returns {Promise} Array of staff members
   */
  static async getAllStaff() {
    try {
      const response = await apiClient.get(ENDPOINTS.STAFF.LIST);
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch staff members',
        error,
      };
    }
  }

  /**
   * Get single staff member by staff ID
   * @param {string} staffId - Staff ID (e.g., 'OJO001')
   * @returns {Promise} Staff member object
   */
  static async getStaffById(staffId) {
    try {
      const response = await apiClient.get(ENDPOINTS.STAFF.BY_ID(staffId));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || `Failed to fetch staff member ${staffId}`,
        error,
      };
    }
  }

  /**
   * Create new staff member
   * @param {Object} staffData - Staff data
   * @returns {Promise} Created staff member
   */
  static async createStaff(staffData) {
    try {
      const response = await apiClient.post(ENDPOINTS.STAFF.CREATE, staffData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create staff member',
        error,
      };
    }
  }
}

export default StaffService;