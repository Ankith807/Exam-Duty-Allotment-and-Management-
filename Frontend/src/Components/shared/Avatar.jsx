import React, { useState, useEffect } from "react";
import { userAPI } from "../../services/api";

const Avatar = ({ 
  user, 
  size = "md", 
  className = "", 
  showBorder = false,
  borderColor = "border-white"
}) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8", 
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32"
  };

  const sizePx = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
    "2xl": 128
  };

  const borderClass = showBorder ? `border-4 ${borderColor}` : "";
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState(null);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const user1 = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const response = await userAPI.getProfilePicture(user.id);
        setProfilePic(response.data.picurl);
      } catch (err) {
        setError("Failed to fetch profile picture");
        console.error(err);
      }
    };

    if (user?.id) {
      fetchProfilePic();
    }
  }, [user?.id]);

  const generateAvatarUrl = (name, size) => {
    const initials = getInitials(name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=ffffff&size=${size}&font-size=0.6&bold=true`;
  };

  const defaultImage = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e
    ?ixlib=rb-4.0.3
    &ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    &auto=format&fit=crop&w=${sizePx[size]}&h=${sizePx[size]}&q=80`
    .replace(/\s+/g, '');

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${borderClass} overflow-hidden 
        bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg ${className}`}
    >
      <img
        src={profilePic}
        alt={`${user1?.name || "User"}'s profile`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = generateAvatarUrl(user?.name, sizePx[size]);
        }}
      />
    </div>
  );
};

export default Avatar;
