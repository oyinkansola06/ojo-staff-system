/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
	Clock,
	Calendar,
	Users,
	CheckCircle,
	XCircle,
	AlertCircle,
	Search,
	Download,
	Edit,
	Trash2,
} from "lucide-react";
import StaffService from "../api/services/staffService";
import DepartmentService from "../api/services/departmentService";
import AttendanceService from "../api/services/attendanceService";

function AttendanceModule() {
	// State for data
	const [attendanceRecords, setAttendanceRecords] = useState([]);
	const [, setAttendanceStats] = useState({});
	const [staffList, setStaffList] = useState([]);
	const [departmentList, setDepartmentList] = useState([]);

	// State for UI
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [departmentFilter, setDepartmentFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
		return attendanceRecords.filter((record) => record.date === selectedDate);
	};

	// Get staff attendance for today
	const getStaffAttendanceForDate = () => {
		const todayRecords = getTodayAttendance();
		return staffList.map((staff) => {
			const record = todayRecords.find((r) => r.staffId === staff.staffId);
			return {
				...staff,
				attendance: record || {
					id: null,
					staffId: staff.staffId,
					date: selectedDate,
					timeIn: null,
					timeOut: null,
					status: "absent",
					hoursWorked: 0,
					notes: "",
				},
			};
		});
	};

	// Filter staff based on search and filters
	const getFilteredStaffAttendance = () => {
		let filtered = getStaffAttendanceForDate();

		if (searchTerm) {
			filtered = filtered.filter(
				(staff) =>
					staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					staff.staffId.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (departmentFilter) {
			filtered = filtered.filter(
				(staff) => staff.department === departmentFilter
			);
		}

		if (statusFilter) {
			filtered = filtered.filter(
				(staff) => staff.attendance.status === statusFilter
			);
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
				DepartmentService.getAllDepartments(),
			]);

			if (staffResult.success) {
				// Map API fields to component fields
				const mappedStaff = staffResult.data.map((staff) => ({
					id: staff.id,
					staffId: staff.staff_id,
					firstName: staff.first_name,
					lastName: staff.last_name,
					department: staff.department_name,
					position: staff.position,
					email: staff.email,
				}));
				setStaffList(mappedStaff);
			} else {
				console.error("Failed to load staff:", staffResult.message);
			}

			if (departmentResult.success) {
				const mappedDepartments = departmentResult.data.map((dept) => ({
					id: dept.id,
					name: dept.name,
					description: dept.description,
				}));
				setDepartmentList(mappedDepartments);
			} else {
				console.error("Failed to load departments:", departmentResult.message);
			}

			// Load today's attendance
			await loadAttendanceData();
		} catch (err) {
			setError("Failed to load initial data: " + err.message);
			console.error("Error loading initial data:", err);
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
				console.error("Failed to load attendance:", result.message);
				setAttendanceRecords([]);
				setAttendanceStats({});
			}
		} catch (err) {
			console.error("Error loading attendance:", err);
			setAttendanceRecords([]);
			setAttendanceStats({});
		}
	};

	// Show loading state
	if (loading && attendanceRecords.length === 0) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<div className="text-lg text-gray-600">
						Loading attendance data...
					</div>
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
		const totalStaff = staffList.length;
		const presentCount = todayRecords.filter(
			(r) => r.status === "present"
		).length;
		const lateCount = todayRecords.filter((r) => r.status === "late").length;
		const absentCount = totalStaff - todayRecords.length;
		const halfDayCount = todayRecords.filter(
			(r) => r.status === "half_day"
		).length;

		return {
			total: totalStaff,
			present: presentCount,
			late: lateCount,
			absent: absentCount,
			halfDay: halfDayCount,
			attendanceRate: Math.round(
				((presentCount + lateCount) / totalStaff) * 100
			),
		};
	};

	if (!staffList || staffList.length === 0) {
		return <div>Loading staff data...</div>;
	}

	const stats = getAttendanceStats();
	const filteredStaffAttendance = getFilteredStaffAttendance();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Attendance Management
					</h2>
					<p className="text-gray-600 mt-1">
						Track and manage staff attendance
					</p>
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
							<p className="text-2xl font-bold text-gray-900">
								{stats.present}
							</p>
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
							<p className="text-2xl font-bold text-gray-900">
								{stats.attendanceRate}%
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Controls */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Filters */}
				<div className="lg:col-span-2">
					<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Filters & Search
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Date
								</label>
								<input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Search
								</label>
								<div className="relative">
									<Search
										className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
										size={16}
									/>
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
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Department
								</label>
								<select
									value={departmentFilter}
									onChange={(e) => setDepartmentFilter(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="">All Departments</option>
									{departmentList.map((dept) => (
										<option key={dept.id} value={dept.name}>
											{dept.name}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Status
								</label>
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
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Staff
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Department
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Time In
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Time Out
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Hours
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Notes
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
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
											<div className="text-sm text-gray-500">
												{staff.staffId}
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{staff.department}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{staff.attendance.timeIn || "-"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{staff.attendance.timeOut || "-"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{staff.attendance.hoursWorked || 0}h
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
												staff.attendance.status === "present"
													? "bg-green-100 text-green-800"
													: staff.attendance.status === "late"
														? "bg-yellow-100 text-yellow-800"
														: staff.attendance.status === "half_day"
															? "bg-blue-100 text-blue-800"
															: "bg-red-100 text-red-800"
											}`}
										>
											{staff.attendance.status.replace("_", " ").toUpperCase()}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{staff.attendance.notes || "-"}
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
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No records found
						</h3>
						<p className="text-gray-500">
							Try adjusting your search or filters
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default AttendanceModule;
