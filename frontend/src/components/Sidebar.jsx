"use client";

import { useState } from "react";
import { Users, Clock, X, Home } from "lucide-react";

const Sidebar = ({ currentView, setCurrentView }) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// Navigation items
	const navItems = [
		{ id: "dashboard", label: "Dashboard", icon: Home },
		{ id: "staff", label: "Staff Records", icon: Users },
		{ id: "attendance", label: "Attendance", icon: Clock },
	];
	return (
		<>
			{/* Mobile backdrop */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`
  fixed top-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
  lg:relative lg:translate-x-0 lg:shadow-sm lg:border-r lg:border-gray-200
  h-screen
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
`}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
					<span className="text-lg font-semibold text-gray-900">Menu</span>
					<button
						onClick={() => setIsSidebarOpen(false)}
						className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
					>
						<X size={20} />
					</button>
				</div>

				<nav className="p-4">
					<ul className="space-y-2">
						{navItems.map((item) => {
							const IconComponent = item.icon;
							return (
								<li key={item.id}>
									<button
										onClick={() => {
											setCurrentView(item.id);
											setIsSidebarOpen(false);
										}}
										className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
											currentView === item.id
												? "bg-blue-50 text-blue-700 border border-blue-200"
												: "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
										}`}
									>
										<IconComponent size={20} className="mr-3" />
										{item.label}
									</button>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>
		</>
	);
};

export default Sidebar;
