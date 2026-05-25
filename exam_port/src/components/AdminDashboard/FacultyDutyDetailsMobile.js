import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import DutyReportGenerator from "./DutyReportGeneratorMobile";

const FacultyDutyDetailsMobile = ({ faculty, onGenerateReport }) => {
  const duties = faculty.duties || [];
  const hasDuties = !(duties[0]?.exam === "No duties assigned");

  const initials = faculty.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{faculty.name}</Text>
            <Text style={styles.subHeading}>Faculty Duty Details</Text>
          </View>
        </View>
        <DutyReportGenerator faculty={faculty} onGenerate={onGenerateReport} />
      </View>

      {/* Info Cards */}
      <View style={styles.infoCards}>
        <InfoCard label="Email" value={faculty.email} color="#3b82f6" />
        <InfoCard label="Department" value={faculty.department} color="#10b981" />
        <InfoCard label="Total Duties" value={hasDuties ? `${duties.length}` : "0"} color="#8b5cf6" />
      </View>

      {/* Duties */}
      <Text style={styles.sectionTitle}>Assigned Duties</Text>
      {!hasDuties ? (
        <View style={styles.noDutiesBox}>
          <Text style={styles.noDutiesTitle}>No exam duties assigned</Text>
          <Text style={styles.noDutiesSub}>This faculty member has no duty assignments.</Text>
        </View>
      ) : (
        <FlatList
          data={duties}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={styles.dutiesList}
          renderItem={({ item }) => (
            <DutyRow duty={item} />
          )}
        />
      )}
    </Animated.View>
  );
};

const InfoCard = ({ label, value, color }) => (
  <View style={[styles.card, { borderColor: color + "40" }]}>
    <Text style={[styles.cardLabel, { color }]}>{label.toUpperCase()}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const DutyRow = ({ duty }) => {
  const dutyBg = duty.duty === "Exam Duty"
    ? "#dcfce7"
    : duty.duty === "Reliever Duty"
    ? "#fef3c7"
    : "#e5e5e5";
  const dutyColor = duty.duty === "Exam Duty"
    ? "#065f46"
    : duty.duty === "Reliever Duty"
    ? "#92400e"
    : "#4b5563";

  return (
    <View style={styles.row}>
      <Text style={styles.rowExam}>{duty.exam}</Text>
      <Text style={styles.rowDate}>
        {new Date(duty.date).toLocaleDateString("en-GB", {
          day: "numeric", month: "long", year: "numeric"
        })}
      </Text>
      <View style={[styles.badge, { backgroundColor: dutyBg, borderColor: dutyColor + "80" }]}>
        <View style={[styles.dot, { backgroundColor: dutyColor }]} />
        <Text style={[styles.badgeText, { color: dutyColor }]}>{duty.duty}</Text>
      </View>
    </View>
  );
};

export default FacultyDutyDetailsMobile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    margin: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subHeading: {
    fontSize: 14,
    color: "#e0e7ff",
  },
  infoCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  noDutiesBox: {
    backgroundColor: "#e5e7eb",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  noDutiesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  noDutiesSub: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 13,
  },
  dutiesList: {
    paddingBottom: 16,
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    padding: 14,
  },
  rowExam: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  rowDate: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
