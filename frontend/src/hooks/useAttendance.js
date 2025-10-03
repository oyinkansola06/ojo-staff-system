// src/hooks/useAttendance.js
import { useState, useEffect, useCallback } from 'react';
import AttendanceService from '../api/services/attendanceService';
import useApi from './useApi';

const useAttendance = (initialDate = null) => {
  const [selectedDate, setSelectedDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );

  // API hooks for different operations
  const attendanceApi = useApi(AttendanceService.getAttendanceByDate);
  const checkInApi = useApi(AttendanceService.checkIn);
  const checkOutApi = useApi(AttendanceService.checkOut);
  const manualEntryApi = useApi(AttendanceService.createManualEntry);

  /**
   * Load attendance data for selected date
   */
  const loadAttendanceData = useCallback(async () => {
    return await attendanceApi.execute(selectedDate);
  }, [selectedDate, attendanceApi.execute]);

  /**
   * Handle staff check-in
   * @param {string} staffId - Staff ID
   * @param {string} timeIn - Time in HH:MM format
   */
  const handleCheckIn = useCallback(
    async (staffId, timeIn) => {
      const result = await checkInApi.execute({
        staff_id: staffId,
        time_in: timeIn,
        date: selectedDate,
      });

      // Refresh attendance data after successful check-in
      if (result.success) {
        await loadAttendanceData();
      }

      return result;
    },
    [selectedDate, checkInApi.execute, loadAttendanceData]
  );

  /**
   * Handle staff check-out
   * @param {string} staffId - Staff ID
   * @param {string} timeOut - Time out in HH:MM format
   */
  const handleCheckOut = useCallback(
    async (staffId, timeOut) => {
      const result = await checkOutApi.execute({
        staff_id: staffId,
        time_out: timeOut,
        date: selectedDate,
      });

      // Refresh attendance data after successful check-out
      if (result.success) {
        await loadAttendanceData();
      }

      return result;
    },
    [selectedDate, checkOutApi.execute, loadAttendanceData]
  );

  /**
   * Handle manual attendance entry
   * @param {Object} entryData - Manual entry data
   */
  const handleManualEntry = useCallback(
    async (entryData) => {
      const result = await manualEntryApi.execute({
        ...entryData,
        attendance_date: selectedDate,
      });

      // Refresh attendance data after successful entry
      if (result.success) {
        await loadAttendanceData();
      }

      return result;
    },
    [selectedDate, manualEntryApi.execute, loadAttendanceData]
  );

  /**
   * Change selected date and load data
   * @param {string} date - Date in YYYY-MM-DD format
   */
  const changeDate = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  // Load attendance data when date changes
  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  return {
    // State
    selectedDate,
    attendanceRecords: attendanceApi.data?.records || [],
    attendanceStats: attendanceApi.data?.stats || {},
    
    // Loading states
    loading: {
      attendance: attendanceApi.loading,
      checkIn: checkInApi.loading,
      checkOut: checkOutApi.loading,
      manualEntry: manualEntryApi.loading,
    },
    
    // Error states
    error: {
      attendance: attendanceApi.error,
      checkIn: checkInApi.error,
      checkOut: checkOutApi.error,
      manualEntry: manualEntryApi.error,
    },
    
    // Actions
    changeDate,
    loadAttendanceData,
    handleCheckIn,
    handleCheckOut,
    handleManualEntry,
    
    // Reset functions
    resetErrors: () => {
      attendanceApi.reset();
      checkInApi.reset();
      checkOutApi.reset();
      manualEntryApi.reset();
    },
  };
};

export default useAttendance;