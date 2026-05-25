import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoutes=({allowed,children})=>{
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return <Navigate to="/" />;
  
    
    if (!allowed.includes(user.role)) {
        localStorage.clear();
      return <Navigate to="/unauthorized" />; 
    }
  
    return children;
}

export default PrivateRoutes;