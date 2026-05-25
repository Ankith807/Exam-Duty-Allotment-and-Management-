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
  CalendarDays,
  Eye,
  History,
  User,
  LogOut,
  Shield,
} from "lucide-react-native"; // Use `lucide-react-native`

const Sidebar = ({ activeSection, setActiveSection, onNavigate }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user", error);
      }
    };
    fetchUser();
  }, []);

  const getRoleInfo = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case "admin":
        return {
          title: "Admin Portal",
          subtitle: "System Administration",
          icon: <Shield color="#f87171" size={24} />,
          bgColor: "#dc2626",
        };
      case "faculty":
        return {
          title: "Faculty Portal",
          subtitle: "Exam Duty Management",
          icon: <User color="#3b82f6" size={24} />,
          bgColor: "#2563eb",
        };
      default:
        return {
          title: "User Portal",
          subtitle: "Dashboard",
          icon: <User color="#6b7280" size={24} />,
          bgColor: "#4b5563",
        };
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert("Logged out", "You have been signed out.");
    if (onNavigate) onNavigate("login");
  };

  const navItems = [
    {
      id: "select-dates",
      label: "Select Exam Dates",
      icon: <CalendarDays size={20} color="#374151" />,
    },
    {
      id: "view-dates",
      label: "View Selected Dates",
      icon: <Eye size={20} color="#374151" />,
    },
    {
      id: "exam_history",
      label: "Completed Exams",
      icon: <History size={20} color="#374151" />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={20} color="#374151" />,
    },
  ];

  const roleInfo = getRoleInfo();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: roleInfo.bgColor }]}>
          {roleInfo.icon}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{roleInfo.title}</Text>
          <Text style={styles.headerSubtitle}>{roleInfo.subtitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.menu}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              activeSection === item.id && styles.activeNavItem,
            ]}
            onPress={() => {
              setActiveSection(item.id);
              if (onNavigate) onNavigate(item.id);
            }}
          >
            <View style={styles.navIcon}>{item.icon}</View>
            <Text
              style={[
                styles.navText,
                activeSection === item.id && styles.activeText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
          <LogOut size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Sidebar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  iconBox: {
    padding: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  menu: {
    paddingBottom: 60,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#f9fafb",
    marginBottom: 10,
  },
  activeNavItem: {
    backgroundColor: "#2563eb",
  },
  navIcon: {
    marginRight: 12,
  },
  navText: {
    fontSize: 16,
    color: "#374151",
  },
  activeText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "500",
  },
});
