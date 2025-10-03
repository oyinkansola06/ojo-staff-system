"use client"

import { Menu, Users, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<header className="bg-white shadow-sm border-b border-gray-200">
			<div className="flex items-center justify-between px-4 py-4">
				<div className="flex items-center">
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
					>
						{isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
					<div className="flex items-center ml-4 lg:ml-0">
						<div className="bg-blue-600 p-2 rounded-lg">
							<Users className="h-6 w-6 text-white" />
						</div>
						<div className="ml-3">
							<h1 className="text-lg font-semibold text-gray-900">
								Ojo Local Government
							</h1>
							<p className="text-sm text-gray-500">Staff Management System</p>
						</div>
					</div>
				</div>

				<div className="flex items-center space-x-4">
					<div className="text-right">
						<p className="text-sm font-medium text-gray-900">Admin User</p>
						<p className="text-xs text-gray-500">Lagos State, Nigeria</p>
					</div>
					<div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
						<span className="text-blue-600 font-medium text-sm">AU</span>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
