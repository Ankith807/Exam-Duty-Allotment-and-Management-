
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import UpdateProfile from "./UpdateProfile";
import Avatar from "./Avatar";


const ProfileView = ({ user, onUpdate }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleUpdateSuccess = (updatedUser) => {
    if (onUpdate) {
      onUpdate(updatedUser);
    }
    setShowUpdateModal(false);
  };

  if (!user) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const infoItems = [
    {
      icon: "mail",
      label: "Email Address",
      value: user?.email || "Not provided",
      color: "#3B82F6",
    },
    {
      icon: "phone",
      label: "Phone Number",
      value: user?.phone || "Not provided",
      color: "#10B981",
    },
    {
      icon: "briefcase",
      label: "Department",
      value: user?.department || "Not assigned",
      color: "#8B5CF6",
    },
    {
      icon: "calendar",
      label: "Member Since",
      value: user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Unknown",
      color: "#F59E0B",
    },
    {
      icon: "clock",
      label: "Last Updated",
      value: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      color: "#EF4444",
    },
  ];

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerGradient}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Faculty Information</Text>
          </View>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar user={user} size="xl" />
            <TouchableOpacity style={styles.cameraButton}>
              <Feather name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.nameSection}>
            <Text style={styles.nameText}>{user?.name || "Unknown User"}</Text>
            <View style={styles.roleBadge}>
              <Feather name="shield" size={14} color="#3B82F6" />
              <Text style={styles.roleText}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "Faculty"}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          {infoItems.map((item, index) => (
            <View style={styles.infoCard} key={index}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <Feather name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Modern Edit Button - Fixed positioning */}
        <TouchableOpacity style={styles.editButton} onPress={() => setShowUpdateModal(true)}>
          <View style={styles.editButtonContent}>
            <Feather name="edit-3" size={18} color="white" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </View>
        </TouchableOpacity>

        {/* Bottom spacing for better scrolling */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Update Modal */}
      {showUpdateModal && (
        <UpdateProfile
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          user={user}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingBox: {
    backgroundColor: "white",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for button accessibility
  },
  headerCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  headerGradient: {
    backgroundColor: "#3B82F6",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#DBEAFE",
    marginTop: 4,
    fontWeight: "400",
  },

  avatarSection: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  cameraButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#3B82F6",
    padding: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  nameSection: {
    alignItems: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  roleText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    marginTop: 32,
    marginHorizontal: 16,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    minHeight: 56, // Ensure button is easily tappable
  },
  editButtonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  editButtonText: {
    marginLeft: 12,
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bottomSpacing: {
    height: 40, // Extra space at bottom
  },
});

export default ProfileView;
