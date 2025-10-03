"use client";

import { useEffect, useState } from "react";
import StaffService from "../api/services/staffService";
import AttendanceService from "../api/services/attendanceService";
import { Calendar, Clock, FileText, Users } from "lucide-react";

const Dashboard = () => {
	const [stats, setStats] = useState({
		totalStaff: 0,
		presentToday: 0,
		lateArrivals: 0,
		absentToday: 0,
	});
	const [recentActivity, setRecentActivity] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadDashboardStats();
	}, []);

	const loadDashboardStats = async () => {
		try {
			setLoading(true);
			const today = new Date().toISOString().split("T")[0];

			const [staffResult, attendanceResult] = await Promise.all([
				StaffService.getAllStaff(),
				AttendanceService.getAttendanceByDate(today),
			]);

			if (staffResult.success) {
				const totalStaff = staffResult.data.length;
				const attendanceRecords = attendanceResult.data?.records || [];

				const presentToday = attendanceRecords.filter(
					(r) => r.status === "present"
				).length;
				const lateArrivals = attendanceRecords.filter(
					(r) => r.status === "late"
				).length;

				setStats({
					totalStaff: totalStaff,
					presentToday: presentToday,
					lateArrivals: lateArrivals,
					absentToday: totalStaff - presentToday - lateArrivals,
				});

				// Map attendance records with staff details for recent activity
				const recentWithDetails = attendanceRecords
					.filter((r) => r.time_in) // Only show staff who checked in
					.map((record) => {
						// Find matching staff member
						const staff = staffResult.data.find(
							(s) => s.staff_id === record.staff_id
						);
						return {
							...record,
							first_name: staff?.first_name || "Unknown",
							last_name: staff?.last_name || "",
							department_name: staff?.department_name || "Unknown",
						};
					})
					.sort((a, b) => b.time_in.localeCompare(a.time_in)) // Most recent first
					.slice(0, 5); // Last 5 check-ins

				setRecentActivity(recentWithDetails);
			}
		} catch (error) {
			console.error("Error loading dashboard stats:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
				<p className="text-gray-600 mt-1">
					Welcome to Ojo LGA Staff Management System
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="bg-blue-100 p-3 rounded-lg">
							<Users className="h-6 w-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Total Staff</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.totalStaff}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="bg-green-100 p-3 rounded-lg">
							<Clock className="h-6 w-6 text-green-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Present Today</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.presentToday}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="bg-yellow-100 p-3 rounded-lg">
							<Calendar className="h-6 w-6 text-yellow-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Late Arrivals</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.lateArrivals}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="bg-red-100 p-3 rounded-lg">
							<FileText className="h-6 w-6 text-red-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Absent Today</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.absentToday}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
				</div>
				<div className="p-6">
					{recentActivity.length === 0 ? (
						<p className="text-gray-500 text-center">No recent activity</p>
					) : (
						<div className="space-y-4">
							{recentActivity.map((activity, index) => (
								<div
									key={index}
									className="flex items-center justify-between py-3 border-b border-gray-100"
								>
									<div>
										<p className="font-medium text-gray-900">
											{activity.first_name} {activity.last_name} checked in
										</p>
										<p className="text-sm text-gray-500">
											{activity.department_name} Department • {activity.time_in}
										</p>
									</div>
									<span
										className={`text-sm px-2 py-1 rounded-full ${
											activity.status === "present"
												? "text-green-600 bg-green-100"
												: activity.status === "late"
													? "text-yellow-600 bg-yellow-100"
													: "text-red-600 bg-red-100"
										}`}
									>
										{activity.status === "present"
											? "On Time"
											: activity.status === "late"
												? "Late"
												: "Absent"}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
