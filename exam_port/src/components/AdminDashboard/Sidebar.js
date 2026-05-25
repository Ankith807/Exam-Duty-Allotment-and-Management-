import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Calendar,
  Eye,
  Users,
  UserPlus,
  Settings,
  ClipboardList,
  FileText,
  History,
  User,
  LogOut,
  Shield,
} from "lucide-react-native";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import { triggerHapticFeedback } from "../../utils/mobileUtils";


const Sidebar = ({ activeSection, setActiveSection, onNavigate, navigation }) => {
  const [user, setUser] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user from AsyncStorage", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    triggerHapticFeedback('light');
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'user',
        'userName',
        'userToken',
        'userRole',
        'isLoggedIn'
      ]);

      setShowLogoutDialog(false);
      triggerHapticFeedback('success');

      // Navigate back to login screen and reset navigation stack
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'UserLogin' }],
        });
      } else {
        // Fallback for older navigation pattern
        onNavigate && onNavigate("Login");
      }

    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutDialog(false);
      triggerHapticFeedback('error');
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const getRoleInfo = () => {
    return {
      title: "Admin Portal",
      subtitle: "System Administration",
      icon: <Shield color="#fff" size={24} />,
      bgColor: "#dc2626", // red-600
    };
  };

  const roleInfo = getRoleInfo();

  const navItems = [
   
    { id: "manage-exams", label: "Manage Exam Dates", icon: <Calendar size={20} />, description: "Manage exam schedules" },
    { id: "view-exam-dates", label: "View Exam Dates", icon: <Eye size={20} />, description: "Review scheduled exams" },
    { id: "faculty-duty", label: "Faculty Selections", icon: <Users size={20} />, description: "View faculty duty preferences" },
    { id: "add-faculty", label: "Add New Faculty", icon: <UserPlus size={20} />, description: "Register new faculty" },
    { id: "manage-faculty", label: "Manage Faculty", icon: <Settings size={20} />, description: "Edit faculty info" },
    { id: "manual-assign", label: "Manual Assignment", icon: <ClipboardList size={20} />, description: "Assign duties manually" },
    { id: "generate-report", label: "Generate Reports", icon: <FileText size={20} />, description: "Create duty reports" },
    { id: "exam_history", label: "Completed Exams", icon: <History size={20} />, description: "View exam history" },
    { id: "profile", label: "Profile", icon: <User size={20} />, description: "Manage your profile" },
  ];

  const actionItems = [
    { id: "logout", label: "Logout", icon: <LogOut size={20} />, description: "Sign out", action: handleLogout },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: roleInfo.bgColor }]}>
            {roleInfo.icon}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{roleInfo.title}</Text>
            <Text style={styles.headerSubtitle}>{roleInfo.subtitle}</Text>
          </View>
        </View>

        {user && (
          <View style={styles.userBox}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <User size={20} color="#dc2626" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name || "Admin User"}</Text>
                <Text style={styles.userEmail}>{user.email || "admin@system.com"}</Text>
                <Text style={styles.userRole}>{user.role || "Administrator"}</Text>
              </View>
            </View>
          </View>
        )}

        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              setActiveSection(item.id);
              onNavigate && onNavigate();
            }}
            style={[
              styles.navItem,
              activeSection === item.id && styles.navItemActive,
            ]}
          >
            <View style={styles.navIcon}>{item.icon}</View>
            <View style={styles.navText}>
              <Text style={[styles.navLabel, activeSection === item.id && styles.navLabelActive]}>
                {item.label}
              </Text>
              <Text style={[styles.navDesc, activeSection === item.id && styles.navDescActive]}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {actionItems.map((item) => (
          <TouchableOpacity key={item.id} onPress={item.action} style={styles.logoutItem}>
            <View style={styles.navIcon}>{item.icon}</View>
            <View style={styles.navText}>
              <Text style={styles.logoutLabel}>{item.label}</Text>
              <Text style={styles.logoutDesc}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Examination Duty System</Text>
        <Text style={styles.footerSub}>v1.0.0 • Admin Panel</Text>
      </View>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        visible={showLogoutDialog}
        title="Confirm Logout"
        message="Are you sure you want to sign out? You'll need to log in again to access the admin dashboard."
        type="warning"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </View>
  );
};

export default Sidebar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    height: "100%",
  },
  scroll: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    padding: 10,
    borderRadius: 8,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  userBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    marginBottom: 24,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: "#eff6ff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  userEmail: {
    fontSize: 12,
    color: "#6b7280",
  },
  userRole: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  navItemActive: {
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  navIcon: {
    marginRight: 10,
  },
  navText: {
    flex: 1,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  navLabelActive: {
    color: "#fff",
  },
  navDesc: {
    fontSize: 11,
    marginTop: 2,
    color: "#6b7280",
  },
  navDescActive: {
    color: "#fef2f2",
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    marginVertical: 16,
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  logoutDesc: {
    fontSize: 11,
    color: "#6b7280",
  },
  footer: {
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
  },
  footerSub: {
    fontSize: 11,
    color: "#9ca3af",
  },
});
