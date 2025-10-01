// src/api/services/departmentService.js
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

class DepartmentService {
  /**
   * Get all departments
   * @returns {Promise} Array of departments
   */
  static async getAllDepartments() {
    try {
      const response = await apiClient.get(ENDPOINTS.DEPARTMENTS.LIST);
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch departments',
        error,
      };
    }
  }

  /**
   * Get single department by ID
   * @param {number} id - Department ID
   * @returns {Promise} Department object
   */
  static async getDepartmentById(id) {
    try {
      const response = await apiClient.get(ENDPOINTS.DEPARTMENTS.BY_ID(id));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || `Failed to fetch department ${id}`,
        error,
      };
    }
  }

  /**
   * Create new department
   * @param {Object} departmentData - Department data
   * @param {string} departmentData.name - Department name
   * @param {string} departmentData.description - Department description
   * @returns {Promise} Created department
   */
  static async createDepartment(departmentData) {
    try {
      const response = await apiClient.post(ENDPOINTS.DEPARTMENTS.CREATE, departmentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create department',
        error,
      };
    }
  }
}

export default DepartmentService;