import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../shared/Navbar";
import Sidebar from "./Sidebar";

import ManageExamDates from "./ManageExamDates";
import ViewExamDates from "./ViewExamDates";
import FacultyDutyCardsMobile from "./FacultyDutyCardsMobile";
import AddFaculty from "./AddFaculty";
import ManageFaculty from "./ManageFaculty";
import ManualDutyAssignment from "./ManualDutyAssign";
import DutyReportGeneratorMobile from "./DutyReportGeneratorMobile";
import Profile from "../shared/Profile";
import CompletedExamDates from "../shared/CompletedExams";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import Breadcrumb, { getBreadcrumbsForSection } from "../ui/Breadcrumb";
import { triggerHapticFeedback } from "../../utils/mobileUtils";

const AdminDashboard = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState("faculty-duty");
  const [examDates, setExamDates] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [user, setUser] = useState(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const sidebarAnimation = useState(new Animated.Value(-280))[0];
  const backdropAnimation = useState(new Animated.Value(0))[0];
  const scrollY = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const renderSection = () => {
    switch (activeSection) {
  
      case "manage-exams":
        return (
          <ManageExamDates
            examDates={examDates}
            setExamDates={setExamDates}
          />
        );
      case "view-exam-dates":
        return <ViewExamDates />;
      case "faculty-duty":
        return <FacultyDutyCardsMobile />;
      case "add-faculty":
        return <AddFaculty />;
      case "manage-faculty":
        return <ManageFaculty />;
      case "manual-assign":
        return <ManualDutyAssignment />;
      case "generate-report":
        return <DutyReportGeneratorMobile />;
      case "exam_history":
        return <CompletedExamDates />;
      case "profile":
        return <Profile/>
      default:
        return <ViewExamDates/>
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
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onNavigate={() => setSidebarOpen(false)}
          navigation={navigation}
        />
      </Animated.View>
    );
  };

  const handleBreadcrumbNavigation = (item) => {
    if (item.id === 'home') {
      setActiveSection('faculty-duty');
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
        homeTitle="Admin Dashboard"
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
          {renderSection()}
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
    </View>
  );
};

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
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
    width: "100%",
  },
  profileContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  profileSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
});

export default AdminDashboard;