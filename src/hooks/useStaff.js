// src/hooks/useStaff.js
import { useState, useEffect, useCallback } from 'react';
import StaffService from '../api/services/staffService';
import DepartmentService from '../api/services/departmentService';
import useApi from './useApi';

const useStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  // API hooks
  const staffApi = useApi(StaffService.getAllStaff);
  const departmentApi = useApi(DepartmentService.getAllDepartments);
  const createStaffApi = useApi(StaffService.createStaff);

  /**
   * Load all staff members
   */
  const loadStaff = useCallback(async () => {
    const result = await staffApi.execute();
    if (result.success) {
      setStaffList(result.data);
    }
    return result;
  }, [staffApi.execute]);

  /**
   * Load all departments
   */
  const loadDepartments = useCallback(async () => {
    const result = await departmentApi.execute();
    if (result.success) {
      setDepartmentList(result.data);
    }
    return result;
  }, [departmentApi.execute]);

  /**
   * Create new staff member
   * @param {Object} staffData - Staff data
   */
  const createStaff = useCallback(
    async (staffData) => {
      const result = await createStaffApi.execute(staffData);
      
      // Refresh staff list after successful creation
      if (result.success) {
        await loadStaff();
      }
      
      return result;
    },
    [createStaffApi.execute, loadStaff]
  );

  /**
   * Get staff member by ID
   * @param {string} staffId - Staff ID
   */
  const getStaffById = useCallback(
    (staffId) => {
      return staffList.find(staff => staff.staff_id === staffId) || null;
    },
    [staffList]
  );

  /**
   * Filter staff by department
   * @param {number} departmentId - Department ID
   */
  const getStaffByDepartment = useCallback(
    (departmentId) => {
      return staffList.filter(staff => staff.department_id === departmentId);
    },
    [staffList]
  );

  // Load initial data
  useEffect(() => {
    loadStaff();
    loadDepartments();
  }, [loadStaff, loadDepartments]);

  return {
    // Data
    staffList,
    departmentList,
    
    // Loading states
    loading: {
      staff: staffApi.loading,
      departments: departmentApi.loading,
      creating: createStaffApi.loading,
    },
    
    // Error states
    error: {
      staff: staffApi.error,
      departments: departmentApi.error,
      creating: createStaffApi.error,
    },
    
    // Actions
    loadStaff,
    loadDepartments,
    createStaff,
    getStaffById,
    getStaffByDepartment,
    
    // Reset functions
    resetErrors: () => {
      staffApi.reset();
      departmentApi.reset();
      createStaffApi.reset();
    },
  };
};

export default useStaff;