import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Menu, GraduationCap } from "lucide-react-native";
import { triggerHapticFeedback } from "../../utils/mobileUtils";

const Navbar = ({ onToggleSidebar, scrollY }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scrollY) {
      const listenerId = scrollY.addListener(({ value }) => {
        const currentScrollY = value;

        // Show navbar when scrolling up or at top
        if (currentScrollY < lastScrollY || currentScrollY < 10) {
          if (!isVisible) {
            setIsVisible(true);
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }
        }
        // Hide navbar when scrolling down (but not at the very top)
        else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          if (isVisible) {
            setIsVisible(false);
            Animated.timing(translateY, {
              toValue: -100,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }
        }

        setLastScrollY(currentScrollY);
      });

      return () => {
        scrollY.removeListener(listenerId);
      };
    }
  }, [scrollY, isVisible, lastScrollY, translateY]);

  return (
    <>
      {/* Animated Navbar Container */}
      <Animated.View
        style={[
          styles.navbar,
          {
            transform: [{ translateY }],
          }
        ]}
      >
        <View style={styles.navInner}>
          {/* Enhanced Mobile Toggle Button */}
          <TouchableOpacity
            onPress={() => {
              triggerHapticFeedback('light');
              onToggleSidebar();
            }}
            style={styles.toggleButton}
            activeOpacity={0.7}
          >
            <Menu size={24} color="#374151" />
          </TouchableOpacity>

          {/* Professional Logo and Text */}
          <View style={styles.centerContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Image
                  source={{
                    uri: "https://sjec.ac.in/storage/config/1718876544_6673f9807e469.png",
                  }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Exam Portal</Text>
              <Text style={styles.subtitle}>Examination Duty Management System</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SJEC</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Enhanced Spacer */}
      <View style={styles.spacer} />
    </>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 50,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  navInner: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },
  toggleButton: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  centerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    position: "relative",
    marginRight: 16,
  },
  logoBox: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    height: 44,
    width: 44,
  },
  fallbackLogo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DBEAFE",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  spacer: {
    paddingTop: 80,
  },
});

export default Navbar;
