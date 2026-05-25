import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CalendarDays,
  History,
  User,
  Eye,
  LogOut,
  GraduationCap
} from "lucide-react-native";
import Navbar from "../shared/Navbar";
import SelectExamDates from "./SelectExamDates";
import Profile from "../shared/Profile";
import CompletedExamDates from "../shared/CompletedExams";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import Breadcrumb, { getBreadcrumbsForSection } from "../ui/Breadcrumb";
import { triggerHapticFeedback } from "../../utils/mobileUtils";
import ShowSelection from "./ShowSelection";

const UserDashboard = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState("select-dates");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const sidebarAnimation = useState(new Animated.Value(-280))[0]; // Start off-screen
  const backdropAnimation = useState(new Animated.Value(0))[0]; // Start transparent
  const scrollY = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
      // Auto-close sidebar on small screens
      if (window.width < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    });

    return () => subscription?.remove();
  }, [sidebarOpen]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sidebarAnimation, {
        toValue: sidebarOpen ? 0 : -280,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnimation, {
        toValue: sidebarOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [sidebarOpen, sidebarAnimation, backdropAnimation]);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserLogin' }],
      });

    } catch (error) {
      console.error('Logout error:', error);
      triggerHapticFeedback('error');
      setShowLogoutDialog(false);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const getRoleInfo = () => {
    return {
      title: "Faculty Portal",
      subtitle: "Examination Duty System",
      icon: <GraduationCap color="#fff" size={24} />,
      bgColor: "#3B82F6", // blue-600
    };
  };

  const roleInfo = getRoleInfo();

  const navItems = [
    {
      id: "select-dates",
      label: "Select Exam Dates",
      icon: <CalendarDays size={20} />,
      description: "Choose your exam duty preferences"
    },
    {
      id: "view-dates",
      label: "View Selected Dates",
      icon: <Eye size={20} />,
      description: "Review your selected dates"
    },
    {
      id: "exam_history",
      label: "Exam History",
      icon: <History size={20} />,
      description: "View completed exam duties"
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={20} />,
      description: "Manage your profile"
    },
  ];

  const actionItems = [
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut size={20} />,
      description: "Sign out",
      action: handleLogout
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "select-dates":
        return <SelectExamDates />;
      case "view-dates":
        return <ShowSelection />;
      case "exam_history":
        return <CompletedExamDates />;
      case "profile":
        return <Profile />;
      default:
        return <SelectExamDates />;
    }
  };

  const renderSidebar = () => {
    const sidebarWidth = screenWidth < 768 ? Math.min(280, screenWidth * 0.85) : 280;

    return (
      <Animated.View style={[
        styles.sidebar,
        {
          left: sidebarAnimation,
          width: sidebarWidth
        }
      ]}>
        <ScrollView contentContainerStyle={styles.sidebarScroll}>
        {/* Header */}
        <View style={styles.sidebarHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: roleInfo.bgColor }]}>
            {roleInfo.icon}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{roleInfo.title}</Text>
            <Text style={styles.headerSubtitle}>{roleInfo.subtitle}</Text>
          </View>
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.userBox}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <User size={20} color="#3B82F6" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name || "Faculty User"}</Text>
                <Text style={styles.userEmail}>{user.email || "faculty@system.com"}</Text>
                <Text style={styles.userRole}>{user.role || "Faculty"}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Navigation Items */}
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              triggerHapticFeedback('light');
              setActiveSection(item.id);
              setSidebarOpen(false);
            }}
            style={[
              styles.navItem,
              activeSection === item.id && styles.navItemActive,
            ]}
          >
            <View style={styles.navIcon}>{item.icon}</View>
            <View style={styles.navTextContainer}>
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

        {/* Action Items */}
        {actionItems.map((item) => (
          <TouchableOpacity key={item.id} onPress={item.action} style={styles.logoutItem}>
            <View style={styles.navIcon}>{item.icon}</View>
            <View style={styles.navTextContainer}>
              <Text style={styles.logoutLabel}>{item.label}</Text>
              <Text style={styles.logoutDesc}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.sidebarFooter}>
        <Text style={styles.footerText}>Examination Duty System</Text>
        <Text style={styles.footerSub}>v1.0.0 • Faculty Panel</Text>
      </View>
    </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const handleBreadcrumbNavigation = (item) => {
    if (item.id === 'home') {
      setActiveSection('select-dates');
    } else {
      setActiveSection(item.id);
    }
    triggerHapticFeedback('light');
  };

  return (
    <View style={styles.container}>
      <Navbar
        onToggleSidebar={() => {
          triggerHapticFeedback('light');
          setSidebarOpen(!sidebarOpen);
        }}
        scrollY={scrollY}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={getBreadcrumbsForSection(activeSection)}
        onItemPress={handleBreadcrumbNavigation}
        homeTitle="Faculty Dashboard"
      />

      <View style={styles.dashboard}>
        <Animated.ScrollView
          style={styles.content}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {renderContent()}
        </Animated.ScrollView>

        {/* Animated Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnimation,
              pointerEvents: sidebarOpen ? 'auto' : 'none'
            }
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setSidebarOpen(false)}
          />
        </Animated.View>

        {/* Sidebar - always rendered for animation */}
        {renderSidebar()}
      </View>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        visible={showLogoutDialog}
        title="Confirm Logout"
        message="Are you sure you want to sign out? You'll need to log in again to access your dashboard."
        type="warning"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </View>
  );
};

export default UserDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  dashboard: {
    flex: 1,
    position: "relative",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 998,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  sidebarScroll: {
    padding: 16,
    paddingBottom: 80,
  },
  sidebarHeader: {
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
    color: "#3B82F6",
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
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  navIcon: {
    marginRight: 10,
  },
  navTextContainer: {
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
    color: "#e0f2fe",
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
  sidebarFooter: {
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
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
    width: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f4f7",
  },
});
