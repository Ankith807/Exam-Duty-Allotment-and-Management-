import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";

const FacultyListTableMobile = ({ facultyData, onSelectFaculty }) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Faculty Overview</Text>

      <Animated.FlatList
        data={facultyData}
        keyExtractor={(item, idx) => idx.toString()}
        entering={FadeIn.delay(100)}
        exiting={FadeOut}
        renderItem={({ item, index }) => {
          const duties = item.duties || [];
          const dutyCount =
            duties[0]?.exam === "No duties assigned" ? 0 : duties.length;
          const initials = item.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <Animated.View
              entering={SlideInDown.delay(index * 50)}
              style={styles.card}
            >
              <View style={styles.row}>
                {/* Avatar & Name */}
                <View style={styles.cellLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.subtext}>Faculty Member</Text>
                  </View>
                </View>

                {/* Contact/Dept */}
                <View style={styles.cellCenter}>
                  <Text style={styles.email}>{item.email}</Text>
                  <Text style={styles.subtext}>{item.department}</Text>
                </View>

                {/* Duty Status */}
                <View style={styles.cellCenter}>
                  <View
                    style={[
                      styles.statusBadge,
                      dutyCount > 0
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        dutyCount > 0
                          ? styles.dotActive
                          : styles.dotInactive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        dutyCount > 0
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}
                    >
                      {dutyCount} {dutyCount === 1 ? "duty" : "duties"}
                    </Text>
                  </View>
                </View>

                {/* Action */}
                <View style={styles.cellRight}>
                  <TouchableOpacity
                    onPress={() => onSelectFaculty(item)}
                    style={styles.viewBtn}
                  >
                    <Text style={styles.viewBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

export default FacultyListTableMobile;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#f0f4f8",
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  cellLeft: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  subtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  cellCenter: {
    flex: 2,
  },
  email: {
    fontSize: 14,
    color: "#374151",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#6ee7b7",
    borderWidth: 1,
  },
  statusInactive: {
    backgroundColor: "#e5e7eb",
    borderColor: "#d1d5db",
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: "#10b981",
  },
  dotInactive: {
    backgroundColor: "#9ca3af",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextActive: {
    color: "#065f46",
  },
  statusTextInactive: {
    color: "#4b5563",
  },
  cellRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  viewBtn: {
    backgroundColor: "#6366f1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});
