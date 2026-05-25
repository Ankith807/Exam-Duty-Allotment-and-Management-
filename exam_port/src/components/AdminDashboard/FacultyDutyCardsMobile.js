import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import axios from "axios";
import Animated, { FadeIn } from "react-native-reanimated";
import FacultyDutyDetailsMobile from "./FacultyDutyDetailsMobile"; // Already converted version
import { API_IP, API_PORT } from '@env';

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const FacultyDutyCardsMobile = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const usersResponse = await axios.get(`${BASE_URL}/api/v1/users`);
        const users = Array.isArray(usersResponse.data?.data)
          ? usersResponse.data.data.filter(user => user.role === "faculty")
          : [];

        const selectionsResponse = await axios.get(`${BASE_URL}/api/v1/exam/user-selections`);
        const allSelections = Array.isArray(selectionsResponse.data?.data)
          ? selectionsResponse.data.data
          : [];

        const facultyWithDuties = users.map(user => {
          const userSelections = allSelections.filter(sel => sel.user_id === user.id);

          const duties = userSelections.map(sel => ({
            exam: sel.exam_name,
            date: sel.exam_date,
            duty: sel.duty_type,
          }));

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            duties: duties.length > 0
              ? duties
              : [{ exam: "No duties assigned", date: "", duty: "None" }],
          };
        });

        setFacultyData(facultyWithDuties);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch faculty data");
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading faculty data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const assignedCount = facultyData.filter(f => f.duties[0].exam !== "No duties assigned").length;
  const pendingCount = facultyData.length - assignedCount;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)}>
        <Text style={styles.title}>Faculty Duty Management</Text>
        <Text style={styles.subtitle}>Monitor and manage faculty examination duties</Text>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <StatCard title="Total Faculty" value={facultyData.length} color="#3b82f6" />
          <StatCard title="Assigned Duties" value={assignedCount} color="#10b981" />
          <StatCard title="Pending" value={pendingCount} color="#f97316" />
        </View>

        {/* Faculty List */}
        <Text style={styles.sectionTitle}>Faculty List</Text>
        <FlatList
          data={facultyData}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedFaculty(item)}
              style={styles.facultyItem}
            >
              <Text style={styles.facultyName}>{item.name}</Text>
              <Text style={styles.facultyEmail}>{item.email}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Duty Details */}
        {selectedFaculty && (
          <FacultyDutyDetailsMobile
            faculty={selectedFaculty}
            onGenerateReport={() => console.log("Generate report")}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const StatCard = ({ title, value, color }) => (
  <View style={[styles.statCard, { backgroundColor: color + "22" }]}>
    <Text style={[styles.statTitle, { color }]}>{title}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export default FacultyDutyCardsMobile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  facultyItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  facultyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  facultyEmail: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 10,
    color: "#4b5563",
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
