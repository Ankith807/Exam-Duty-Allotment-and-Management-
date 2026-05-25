import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { API_IP, API_PORT } from '@env';

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const ManageExamDates = () => {
  const [examDetails, setExamDetails] = useState({
    examId: "",
    examName: "",
    dueDate: "",
    examDates: []
  });
  const [newExamRow, setNewExamRow] = useState({
    examDate: "",
    examDuty: "",
    relieverDuty: "",
    session: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  const formatDate = (date) => date.toISOString().split("T")[0];
  const minExamDate = formatDate(new Date(today.setDate(today.getDate() + 5)));

  const handleExamChange = (name, value) => {
    if (["examId", "examName", "dueDate"].includes(name)) {
      setExamDetails(prev => ({ ...prev, [name]: value }));
    } else {
      setNewExamRow(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateRow = () => {
    const { examDate, examDuty, relieverDuty, session } = newExamRow;
    const missing = !examDate || !examDuty || !relieverDuty || !session;
    if (missing) {
      Toast.show({ type: "error", text1: "Please fill all fields in row." });
      return false;
    }
    const sel = new Date(examDate);
    const plus5 = new Date(); plus5.setDate(plus5.getDate() + 5);
    if (sel < plus5) {
      Toast.show({ type: "error", text1: "Exam Date must be ≥ 5 days from today." });
      return false;
    }
    if (parseInt(examDuty) <= 0 || parseInt(relieverDuty) <= 0) {
      Toast.show({ type: "error", text1: "Duty counts must be positive." });
      return false;
    }
    return true;
  };

  const handleAddRow = () => {
    if (!validateRow()) return;
    setExamDetails(prev => ({
      ...prev,
      examDates: [...prev.examDates, newExamRow]
    }));
    setNewExamRow({ examDate: "", examDuty: "", relieverDuty: "", session: "" });
    Toast.show({ type: "success", text1: "Exam date added" });
  };

  const validateExamDetails = () => {
    const { examId, examName, dueDate, examDates } = examDetails;
    if (!examId || !examName || !dueDate) {
      Toast.show({ type: "error", text1: "Please fill all exam details." });
      return false;
    }
    if (examDates.length === 0) {
      Toast.show({ type: "error", text1: "Add at least one exam date before save." });
      return false;
    }
    const due = new Date(dueDate);
    const earliest = new Date(Math.min(...examDates.map(r => new Date(r.examDate))));
    const latestDue = new Date(earliest); latestDue.setDate(latestDue.getDate() - 2);
    if (due > latestDue) {
      Toast.show({
        type: "error",
        text1: `Due Date must be ≤ ${formatDate(latestDue)}`
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateExamDetails()) return;
    setIsSubmitting(true);
    Toast.show({ type: "info", text1: "Saving exam..." });

    try {
      await axios.post(`${BASE_URL}/api/v1/exam/exams`, examDetails);
      Toast.show({ type: "success", text1: "Saved successfully!" });
      setExamDetails({ examId: "", examName: "", dueDate: "", examDates: [] });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Failed to save exam"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setExamDetails({ examId: "", examName: "", dueDate: "", examDates: [] });
    setNewExamRow({ examDate: "", examDuty: "", relieverDuty: "", session: "" });
    Toast.show({ type: "info", text1: "Form cleared" });
  };

  const handleEditDate = i => {
    const row = examDetails.examDates[i];
    setNewExamRow(row);
    setExamDetails(prev => ({
      ...prev,
      examDates: prev.examDates.filter((_, idx) => idx !== i)
    }));
    Toast.show({ type: "info", text1: "Row loaded for editing" });
  };

  const handleDeleteDate = i => {
    setExamDetails(prev => ({
      ...prev,
      examDates: prev.examDates.filter((_, idx) => idx !== i)
    }));
    Toast.show({ type: "success", text1: "Exam date removed" });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Toast />

      <Text style={styles.header}>Manage Exam Details</Text>

      <TextInput
        placeholder="Exam ID"
        value={examDetails.examId}
        onChangeText={val => handleExamChange("examId", val)}
        style={styles.input}
      />
      <TextInput
        placeholder="Exam Name"
        value={examDetails.examName}
        onChangeText={val => handleExamChange("examName", val)}
        style={styles.input}
      />
      <TextInput
        placeholder="Due Date (YYYY-MM-DD)"
        value={examDetails.dueDate}
        onChangeText={val => handleExamChange("dueDate", val)}
        style={styles.input}
      />

      <Text style={styles.subheader}>Add Exam Date</Text>
      <TextInput
        placeholder="Exam Date (YYYY-MM-DD)"
        value={newExamRow.examDate}
        onChangeText={val => handleExamChange("examDate", val)}
        style={styles.input}
      />
      <TextInput
        placeholder="Exam Duty Count"
        keyboardType="numeric"
        value={newExamRow.examDuty}
        onChangeText={val => handleExamChange("examDuty", val)}
        style={styles.input}
      />
      <TextInput
        placeholder="Reliever Duty Count"
        keyboardType="numeric"
        value={newExamRow.relieverDuty}
        onChangeText={val => handleExamChange("relieverDuty", val)}
        style={styles.input}
      />
      <TextInput
        placeholder="Session (morning/afternoon)"
        value={newExamRow.session}
        onChangeText={val => handleExamChange("session", val)}
        style={styles.input}
      />

      <Button title="Add Date" onPress={handleAddRow} />

      {examDetails.examDates.length > 0 && <>
        <Text style={styles.subheader}>Added Exam Dates</Text>
        {examDetails.examDates.map((r, i) => (
          <View key={i} style={styles.row}>
            <Text>{r.examDate} | {r.session} | Exam:{r.examDuty} | Reliever:{r.relieverDuty}</Text>
            <View style={styles.rowActions}>
              <TouchableOpacity onPress={() => handleEditDate(i)}>
                <Ionicons name="create-outline" size={20} color="orange" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteDate(i)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </>}

      {isSubmitting ? <ActivityIndicator size="large" color="#000" /> : (
        <View style={styles.buttonRow}>
          <Button title="Clear Form" color="gray" onPress={handleClear} />
          <Button title="Save Exam" onPress={handleSave} />
        </View>
      )}
    </ScrollView>
  );
};

export default ManageExamDates;

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  subheader: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 10, marginBottom: 12
  },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 8, backgroundColor: "#f1f1f1", borderRadius: 6, marginBottom: 6
  },
  rowActions: { flexDirection: "row", width: 60, justifyContent: "space-between" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 }
});
