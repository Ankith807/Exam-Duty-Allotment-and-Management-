import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Eye, History, User, LogOut, Shield } from "lucide-react";

const Sidebar = ({ activeSection, setActiveSection, onNavigate }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
  }, []);

  const getRoleInfo = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return {
          title: 'Admin Portal',
          subtitle: 'System Administration',
          icon: <Shield className="w-6 h-6 text-red-500" />,
          bgColor: 'bg-red-600'
        };
      case 'faculty':
        return {
          title: 'Faculty Portal',
          subtitle: 'Exam Duty Management',
          icon: <User className="w-6 h-6 text-blue-500" />,
          bgColor: 'bg-blue-600'
        };
      default:
        return {
          title: 'User Portal',
          subtitle: 'Dashboard',
          icon: <User className="w-6 h-6 text-gray-500" />,
          bgColor: 'bg-gray-600'
        };
    }
  };

  const roleInfo = getRoleInfo();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };



  const navItems = [
    {
      id: "select-dates",
      label: "Select Exam Dates",
      icon: <CalendarDays className="w-5 h-5 mr-3" />,
      description: "Choose your exam duty preferences"
    },
    {
      id: "view-dates",
      label: "View Selected Dates",
      icon: <Eye className="w-5 h-5 mr-3" />,
      description: "Review your current selections"
    },
    {
      id: "exam_history",
      label: "Completed Exams",
      icon: <History className="w-5 h-5 mr-3" />,
      description: "View your exam history"
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User className="w-5 h-5 mr-3" />,
      description: "Manage your profile"
    },
  ];

  const actionItems = [
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut className="w-5 h-5 mr-3" />,
      description: "Sign out of your account",
      action: handleLogout
    },
  ];

  return (
    <div className="w-64 h-full min-h-screen bg-white shadow-lg flex flex-col">
      <div className="p-6 flex-1">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className={`${roleInfo.bgColor} p-2 rounded-lg`}>
              {React.cloneElement(roleInfo.icon, { className: "w-6 h-6 text-white" })}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{roleInfo.title}</h1>
              <p className="text-sm text-gray-500">{roleInfo.subtitle}</p>
            </div>
          </div>
        </div>



        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveSection(item.id);
                onNavigate && onNavigate();
              }}
              className={`flex items-start w-full px-4 py-4 rounded-xl text-left transition-all duration-200 group ${
                activeSection === item.id
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                  : "hover:bg-secondary-50 text-secondary-700 hover:text-secondary-900"
              }`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm block">{item.label}</span>
                {item.description && (
                  <span className={`text-xs mt-1 block ${
                    activeSection === item.id ? "text-primary-100" : "text-secondary-500"
                  }`}>
                    {item.description}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Action Items */}
        <div className="space-y-2">
          {actionItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={item.action}
              className={`flex items-start w-full px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                item.id === "logout"
                  ? "hover:bg-danger-50 text-danger-600 hover:text-danger-700"
                  : "hover:bg-secondary-50 text-secondary-700 hover:text-secondary-900"
              }`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm block">{item.label}</span>
                {item.description && (
                  <span className="text-xs mt-1 block text-secondary-500">
                    {item.description}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
