import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// User Import
import UserLogin from "./UserLogin";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import UserDashboard from "./Components/UserDashboard/UserDashboard";  // Modified import for User Dashboard
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";  // Modified import for Admin Dashboard
import Unauthorized from "../Unautherized";
import Profile from "./Components/shared/Profile"; // Importing Profile component
import PrivateRoutes from "./PrivateRoutes";


const App = () => {
  const [examDates, setExamDates] = useState([]);
  return (
    <Router>
      <Routes>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<UserLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/user" element={<PrivateRoutes allowed={["faculty"]}><UserDashboard /></PrivateRoutes>} />
        <Route path="/admindashboard" element={<PrivateRoutes allowed={["admin"]}><AdminDashboard /></PrivateRoutes>} />
      </Routes>
    </Router>
  );
};

export default App;
