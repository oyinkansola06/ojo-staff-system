import React, { useState } from "react";
import AttendanceModule from "./components/AttendanceManagement";
import StaffRecords from "./components/StaffRecords";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

function App() {
	const [currentView, setCurrentView] = useState("dashboard");

	// Render current view
	const renderCurrentView = () => {
		switch (currentView) {
			case "dashboard":
				return <Dashboard />;
			case "staff":
				return <StaffRecords />;
			case "attendance":
				return <AttendanceModule />;
			default:
				return <Dashboard />;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />
					<main className="flex-1 overflow-x-hidden overflow-y-auto">
						<div className="container mx-auto px-4 py-6 max-w-7xl">
							{renderCurrentView()}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default App;
