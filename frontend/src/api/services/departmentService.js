import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

class DepartmentService {
  /**
   * Get all departments
   */
  static async getAllDepartments() {
    try {
      const response = await apiClient.get(ENDPOINTS.DEPARTMENTS);
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch departments',
        error,
      };
    }
  }
}

export default DepartmentService;