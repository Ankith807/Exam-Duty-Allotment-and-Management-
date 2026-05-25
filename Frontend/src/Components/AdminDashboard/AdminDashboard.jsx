import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import Sidebar from "./Sidebar";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ManageExamDates from "./ManageExamDates";
import ViewExamDates from "./ViewExamDates";
import FacultyDutyCards from "./FacultyDutyCards";
import AddFaculty from "./AddFaculty";
import ManageFaculty from "./ManageFaculty";
import ManualDutyAssignment from "./ManualDutyAssign";
import DutyReportGenerator from "./DutyReportGenerator";
import ProfileView from "../shared/ProfileView";

import { motion, AnimatePresence } from "framer-motion";
import CompletedExamDates from "../shared/Completed_Exams";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("analytics");
  const [examDates, setExamDates] = useState([]);
  const [facultyData, setFacultyData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
  }, []);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-inter">
      {/* Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Layout */}
      <div className="flex flex-1 relative pt-24 md:pt-0">
        {/* Sidebar */}
        <aside
          className={`sidebar-full-height fixed top-20 md:top-[100px] left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>

        {/* Overlay on Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 md:ml-64 h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
          <div className="h-full overflow-y-auto p-4 md:p-8 pt-24 md:pt-8">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {activeSection === "analytics" && <AnalyticsDashboard />}
                  {activeSection === "manage-exams" && (
                    <ManageExamDates
                      examDates={examDates}
                      setExamDates={setExamDates}
                    />
                  )}
                  {activeSection === "view-exam-dates" && <ViewExamDates />}
                  {activeSection === "faculty-duty" && <FacultyDutyCards />}
                  {activeSection === "add-faculty" && <AddFaculty />}
                  {activeSection === "manage-faculty" && <ManageFaculty />}
                  {activeSection === "manual-assign" && <ManualDutyAssignment />}
                  {activeSection === "generate-report" && <DutyReportGenerator />}
                  {activeSection === 'exam_history' && <CompletedExamDates />}
                  {activeSection === "profile" && (
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
                        <p className="text-gray-600 mt-1">Manage your administrator account</p>
                      </div>
                      <div className="max-w-2xl mx-auto">
                        <ProfileView user={user} onUpdate={handleUserUpdate} />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
