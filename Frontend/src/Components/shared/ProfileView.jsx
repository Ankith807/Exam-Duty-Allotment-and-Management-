import  { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield,
  Edit3,
  Camera,
  Clock,
  X
} from "lucide-react";
import UpdateProfile from "./UpdateProfile";
import Avatar from "./Avatar";
import axios from "axios"; 

const ProfileView = ({ user, onUpdate }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpdateSuccess = (updatedUser) => {
    if (onUpdate) {
      onUpdate(updatedUser);
    }
    setShowUpdateModal(false);
  };




  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };


const handleUpload = async () => {
  if (!selectedFile) return;

  try {
  
    const formData = new FormData();
    formData.append("profile_pic", selectedFile); 
    formData.append("user_id", user.id);

    const response = await axios.put(
      `http://localhost:3000/api/v1/users/user/${user.id}/profile-picture`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data.imageUrl) { 
      if (onUpdate)
        onUpdate({ ...user, profile_picture: response.data.imageUrl });
      setShowImageModal(false);
      setSelectedFile(null);
    } else {
      alert("Upload failed: " + (response.data.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Something went wrong while uploading.");
  }
};


  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          {/* Profile Image Section */}
          <div className="flex justify-center mt-6 mb-6">
            <div className="relative">
              <Avatar
                user={user}
                size="2xl"
                showBorder={true}
                borderColor="border-white"
                className="shadow-xl"
              />
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Name */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {user?.name || "Unknown User"}
            </h3>
            <div className="flex items-center justify-center mt-2">
              <Shield className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "Faculty"}
              </span>
            </div>
          </div>

          {/* User Information Cards */}
          <div className="space-y-4">
            {/* Email */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-gray-900">{user?.email || "Not provided"}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="text-gray-900">{user?.phone || "Not provided"}</p>
              </div>
            </div>

            {/* Department */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
              <Building className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-gray-900">{user?.department || "Not assigned"}</p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      <UpdateProfile
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        user={user}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* Upload Image Modal */}
      {showImageModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 w-80 shadow-xl relative">
      <button
        onClick={() => setShowImageModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-lg font-semibold mb-4">Upload Profile Picture</h2>

      {/* Image Preview */}
      {selectedFile && (
        <img
          src={URL.createObjectURL(selectedFile)}
          alt="Preview"
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border border-gray-300 rounded p-2 mb-4"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowImageModal(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Upload
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default ProfileView;
