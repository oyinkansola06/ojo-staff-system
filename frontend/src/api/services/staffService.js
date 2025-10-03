import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

class StaffService {
  /**
   * Get all staff members
   */
  static async getAllStaff() {
    try {
      const response = await apiClient.get(ENDPOINTS.STAFF);
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch staff',
        error,
      };
    }
  }
}

export default StaffService;