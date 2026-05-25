import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { Shield } from "lucide-react-native";
import { API_IP, API_PORT } from '@env';

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const ManualDutyAssign = () => {
  const [examList, setExamList] = useState([]);
  const [examId, setExamId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [session, setSession] = useState("");
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchExams = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/exam`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExamList(response.data);
    } catch (error) {
        Alert.alert("Error", "Failed to fetch exams");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchEligibleUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      setIsLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/assign/manual/${examId}/${examDate}/${session}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEligibleUsers(response.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Failed to fetch eligible users");
    }
  };

  const handleAssign = async () => {
    if (!examId || !examDate || !session || !selectedUser) {
      Alert.alert("Please fill in all fields.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const data = { examId, date: examDate, session, userId: selectedUser };
      const response = await axios.post(
        `${BASE_URL}/api/assign/manual`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Duty Assigned Successfully!");
      setSelectedUser("");
    } catch (error) {
        Alert.alert( error.response?.data?.message || "Failed to assign duty.");
     
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Shield size={48} color="#4B5563" />
      <Text style={styles.title}>Manual Duty Assignment</Text>

      {/* Exam Picker */}
      <Text style={styles.label}>Select Exam:</Text>
      {examList.map((exam) => (
        <TouchableOpacity
          key={exam._id}
          style={[
            styles.button,
            examId === exam._id && styles.selectedButton,
          ]}
          onPress={() => {
            setExamId(exam._id);
            setExamDate("");
            setSession("");
            setEligibleUsers([]);
            setSelectedUser("");
          }}
        >
          <Text style={styles.buttonText}>{exam.name}</Text>
        </TouchableOpacity>
      ))}

      {/* Date Input */}
      {examId ? (
        <>
          <Text style={styles.label}>Enter Exam Date (YYYY-MM-DD):</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2024-08-01"
            value={examDate}
            onChangeText={setExamDate}
          />
        </>
      ) : null}

      {/* Session Selection */}
      {examDate ? (
        <>
          <Text style={styles.label}>Select Session:</Text>
          <View style={styles.row}>
            {["FN", "AN"].map((sess) => (
              <TouchableOpacity
                key={sess}
                style={[
                  styles.button,
                  session === sess && styles.selectedButton,
                ]}
                onPress={() => {
                  setSession(sess);
                  fetchEligibleUsers();
                }}
              >
                <Text style={styles.buttonText}>{sess}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}

      {/* Eligible Users */}
      {session && isLoading ? (
        <ActivityIndicator size="large" color="#4B5563" />
      ) : (
        eligibleUsers.length > 0 && (
          <>
            <Text style={styles.label}>Select User to Assign:</Text>
            {eligibleUsers.map((user) => (
              <TouchableOpacity
                key={user._id}
                style={[
                  styles.button,
                  selectedUser === user._id && styles.selectedButton,
                ]}
                onPress={() => setSelectedUser(user._id)}
              >
                <Text style={styles.buttonText}>
                  {user.name} ({user.department})
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.button, styles.assignButton]}
              onPress={handleAssign}
            >
              <Text style={styles.buttonText}>Assign Duty</Text>
            </TouchableOpacity>
          </>
        )
      )}
    </ScrollView>
  );
};

export default ManualDutyAssign;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    flexGrow: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 10,
    color: "#111827",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 15,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    marginTop: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#E5E7EB",
    padding: 12,
    marginTop: 8,
    borderRadius: 10,
    width: "100%",
  },
  selectedButton: {
    backgroundColor: "#4B5563",
  },
  buttonText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  assignButton: {
    backgroundColor: "#16A34A",
    marginTop: 20,
  },
});
