import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

// Mock staff data (this would come from your staff records)
const mockStaff = [
  { id: 1, staffId: 'OJO001', firstName: 'Adebayo', lastName: 'Johnson', department: 'Administration' },
  { id: 2, staffId: 'OJO002', firstName: 'Fatima', lastName: 'Ibrahim', department: 'Finance' },
  { id: 3, staffId: 'OJO003', firstName: 'Chinedu', lastName: 'Okafor', department: 'Works' },
  { id: 4, staffId: 'OJO004', firstName: 'Blessing', lastName: 'Adeyemi', department: 'Health' },
  { id: 5, staffId: 'OJO005', firstName: 'Yusuf', lastName: 'Akinwale', department: 'Education' }
];

// Mock attendance data
const mockAttendanceData = [
  {
    id: 1,
    staffId: 'OJO001',
    date: '2025-09-27',
    timeIn: '08:15',
    timeOut: '17:30',
    status: 'present',
    hoursWorked: 9.25,
    notes: ''
  },
  {
    id: 2,
    staffId: 'OJO002',
    date: '2025-09-27',
    timeIn: '08:45',
    timeOut: '17:15',
    status: 'late',
    hoursWorked: 8.5,
    notes: 'Traffic delay'
  },
  {
    id: 3,
    staffId: 'OJO003',
    date: '2025-09-27',
    timeIn: null,
    timeOut: null,
    status: 'absent',
    hoursWorked: 0,
    notes: 'Sick leave'
  },
  {
    id: 4,
    staffId: 'OJO004',
    date: '2025-09-27',
    timeIn: '08:00',
    timeOut: '17:45',
    status: 'present',
    hoursWorked: 9.75,
    notes: ''
  },
  {
    id: 5,
    staffId: 'OJO005',
    date: '2025-09-27',
    timeIn: '09:30',
    timeOut: '16:00',
    status: 'half_day',
    hoursWorked: 6.5,
    notes: 'Personal appointment'
  }
];

function AttendanceModule() {
  // State for data
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  
  
// State for UI
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load attendance data when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAttendanceData();
    }
  }, [selectedDate]);


  // Get today's attendance for a specific date
  const getTodayAttendance = () => {
    return attendanceRecords.filter(record => record.date === selectedDate);
  };

  // Get staff attendance for today
  const getStaffAttendanceForDate = () => {
    const todayRecords = getTodayAttendance();
    return mockStaff.map(staff => {
      const record = todayRecords.find(r => r.staffId === staff.staffId);
      return {
        ...staff,
        attendance: record || {
          id: null,
          staffId: staff.staffId,
          date: selectedDate,
          timeIn: null,
          timeOut: null,
          status: 'absent',
          hoursWorked: 0,
          notes: ''
        }
      };
    });
  };

  // Filter staff based on search and filters
  const getFilteredStaffAttendance = () => {
    let filtered = getStaffAttendanceForDate();

    if (searchTerm) {
      filtered = filtered.filter(staff => 
        staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.staffId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(staff => staff.department === departmentFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(staff => staff.attendance.status === statusFilter);
    }

    return filtered;
  };
// Function to load initial data (staff and departments)
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load staff and departments in parallel
      const [staffResult, departmentResult] = await Promise.all([
        StaffService.getAllStaff(),
        DepartmentService.getAllDepartments()
      ]);

      if (staffResult.success) {
        setStaffList(staffResult.data);
      } else {
        console.error('Failed to load staff:', staffResult.message);
      }

      if (departmentResult.success) {
        setDepartmentList(departmentResult.data);
      } else {
        console.error('Failed to load departments:', departmentResult.message);
      }

      // Load today's attendance
      await loadAttendanceData();

    } catch (err) {
      setError('Failed to load initial data: ' + err.message);
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };
   // Function to load attendance data for selected date
  const loadAttendanceData = async () => {
    try {
      const result = await AttendanceService.getAttendanceByDate(selectedDate);
      
      if (result.success) {
        setAttendanceRecords(result.data.records || []);
        setAttendanceStats(result.data.stats || {});
      } else {
        console.error('Failed to load attendance:', result.message);
        setAttendanceRecords([]);
        setAttendanceStats({});
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
      setAttendanceRecords([]);
      setAttendanceStats({});
    }
  };
   // Function to handle check-in
  const handleCheckIn = async (staffId, timeIn) => {
    try {
      const result = await AttendanceService.checkIn(staffId, timeIn, selectedDate);
      
      if (result.success) {
        alert('Check-in successful!');
        // Reload attendance data to show the change
        await loadAttendanceData();
      } else {
        alert('Check-in failed: ' + result.message);
      }
    } catch (err) {
      alert('Check-in failed: ' + err.message);
    }
  };
  // Function to handle check-out
  const handleCheckOut = async (staffId, timeOut) => {
    try {
      const result = await AttendanceService.checkOut(staffId, timeOut, selectedDate);
      
      if (result.success) {
        alert('Check-out successful!');
        // Reload attendance data to show the change
        await loadAttendanceData();
      } else {
        alert('Check-out failed: ' + result.message);
      }
    } catch (err) {
      alert('Check-out failed: ' + err.message);
    }
  };
  // Function to handle manual entry
  const handleManualEntry = async (entryData) => {
    try {
      const result = await AttendanceService.createManualEntry({
        ...entryData,
        attendance_date: selectedDate
      });
      
      if (result.success) {
        alert('Manual entry created successfully!');
        // Reload attendance data to show the change
        await loadAttendanceData();
        setShowManualEntryModal(false);
      } else {
        alert('Manual entry failed: ' + result.message);
      }
    } catch (err) {
      alert('Manual entry failed: ' + err.message);
    }
  };

  // Show loading state
  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading attendance data...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div className="flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <div>
            <strong>Error:</strong>
            <p>{error}</p>
          </div>
        </div>
        <button 
          onClick={loadInitialData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getAttendanceStats = () => {
    const todayRecords = getTodayAttendance();
    const totalStaff = mockStaff.length;
    const presentCount = todayRecords.filter(r => r.status === 'present').length;
    const lateCount = todayRecords.filter(r => r.status === 'late').length;
    const absentCount = totalStaff - todayRecords.length;
    const halfDayCount = todayRecords.filter(r => r.status === 'half_day').length;

    return {
      total: totalStaff,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      halfDay: halfDayCount,
      attendanceRate: Math.round(((presentCount + lateCount) / totalStaff) * 100)
    };
  };

  // Quick Check In/Out Component
  const QuickCheckIn = () => {
    const [selectedStaff, setSelectedStaff] = useState('');
    const [action, setAction] = useState('checkin');

    const handleQuickAction = () => {
      if (!selectedStaff) {
        alert('Please select a staff member');
        return;
      }

      const staff = mockStaff.find(s => s.staffId === selectedStaff);
      const existingRecord = attendanceRecords.find(
        r => r.staffId === selectedStaff && r.date === selectedDate
      );

      const currentTimeStr = currentTime.toTimeString().slice(0, 5);

      if (action === 'checkin') {
        if (existingRecord && existingRecord.timeIn) {
          alert('Staff member already checked in today');
          return;
        }

        const newRecord = {
          id: attendanceRecords.length + 1,
          staffId: selectedStaff,
          date: selectedDate,
          timeIn: currentTimeStr,
          timeOut: null,
          status: currentTime.getHours() > 8 ? 'late' : 'present',
          hoursWorked: 0,
          notes: ''
        };

        if (existingRecord) {
          setAttendanceRecords(records => 
            records.map(r => r.id === existingRecord.id ? {...r, ...newRecord, id: existingRecord.id} : r)
          );
        } else {
          setAttendanceRecords([...attendanceRecords, newRecord]);
        }
      } else {
        if (!existingRecord || !existingRecord.timeIn) {
          alert('Staff member must check in first');
          return;
        }

        const timeInHours = parseInt(existingRecord.timeIn.split(':')[0]);
        const timeInMinutes = parseInt(existingRecord.timeIn.split(':')[1]);
        const timeOutHours = currentTime.getHours();
        const timeOutMinutes = currentTime.getMinutes();
        
        const hoursWorked = (timeOutHours + timeOutMinutes/60) - (timeInHours + timeInMinutes/60);

        setAttendanceRecords(records => 
          records.map(r => 
            r.id === existingRecord.id 
              ? {...r, timeOut: currentTimeStr, hoursWorked: Math.round(hoursWorked * 100) / 100}
              : r
          )
        );
      }

      setSelectedStaff('');
      setShowCheckInModal(false);
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="mr-2" size={20} />
          Quick Check In/Out
        </h3>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {currentTime.toTimeString().slice(0, 8)}
            </div>
            <div className="text-blue-700">
              {currentTime.toDateString()}
            </div>
          </div>

          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Staff Member</option>
            {mockStaff.map(staff => (
              <option key={staff.staffId} value={staff.staffId}>
                {staff.firstName} {staff.lastName} ({staff.staffId})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="checkin"
                checked={action === 'checkin'}
                onChange={(e) => setAction(e.target.value)}
                className="mr-2"
              />
              Check In
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="checkout"
                checked={action === 'checkout'}
                onChange={(e) => setAction(e.target.value)}
                className="mr-2"
              />
              Check Out
            </label>
          </div>

          <button
            onClick={handleQuickAction}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              action === 'checkin'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {action === 'checkin' ? 'Check In' : 'Check Out'}
          </button>
        </div>
      </div>
    );
  };

  // Manual Entry Modal
  const ManualEntryModal = () => {
    const [formData, setFormData] = useState({
      staffId: '',
      date: selectedDate,
      timeIn: '',
      timeOut: '',
      status: 'present',
      notes: ''
    });

    const handleSubmit = () => {
      if (!formData.staffId || !formData.date) {
        alert('Please fill in required fields');
        return;
      }

      const newRecord = {
        id: attendanceRecords.length + 1,
        ...formData,
        hoursWorked: formData.timeIn && formData.timeOut ? 
          calculateHoursWorked(formData.timeIn, formData.timeOut) : 0
      };

      setAttendanceRecords([...attendanceRecords, newRecord]);
      setShowManualEntryModal(false);
      setFormData({
        staffId: '',
        date: selectedDate,
        timeIn: '',
        timeOut: '',
        status: 'present',
        notes: ''
      });
    };

    const calculateHoursWorked = (timeIn, timeOut) => {
      if (!timeIn || !timeOut) return 0;
      const [inHour, inMin] = timeIn.split(':').map(Number);
      const [outHour, outMin] = timeOut.split(':').map(Number);
      return Math.round(((outHour + outMin/60) - (inHour + inMin/60)) * 100) / 100;
    };

    if (!showManualEntryModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Attendance Entry</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member *</label>
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Staff</option>
                {mockStaff.map(staff => (
                  <option key={staff.staffId} value={staff.staffId}>
                    {staff.firstName} {staff.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time In</label>
                <input
                  type="time"
                  value={formData.timeIn}
                  onChange={(e) => setFormData({...formData, timeIn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
                <input
                  type="time"
                  value={formData.timeOut}
                  onChange={(e) => setFormData({...formData, timeOut: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowManualEntryModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>
    );
  };

  const stats = getAttendanceStats();
  const filteredStaffAttendance = getFilteredStaffAttendance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600 mt-1">Track and manage staff attendance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Clock size={20} />
            Quick Check In/Out
          </button>
          <button
            onClick={() => setShowManualEntryModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Manual Entry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Check In Widget */}
        <QuickCheckIn />

        {/* Filters */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="Administration">Administration</option>
                  <option value="Finance">Finance</option>
                  <option value="Works">Works</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance Records - {new Date(selectedDate).toLocaleDateString()}
          </h3>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaffAttendance.map((staff) => (
                <tr key={staff.staffId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {staff.firstName} {staff.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{staff.staffId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.attendance.timeIn || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.attendance.timeOut || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.attendance.hoursWorked || 0}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      staff.attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                      staff.attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      staff.attendance.status === 'half_day' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {staff.attendance.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staff.attendance.notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaffAttendance.length === 0 && (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Quick Check In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <QuickCheckIn />
            <button
              onClick={() => setShowCheckInModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      <ManualEntryModal />
    </div>
  );
}

export default AttendanceModule;