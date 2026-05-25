// SelectExamDates.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";
import { API_IP, API_PORT } from '@env';
import ConfirmationDialog from "../ui/ConfirmationDialog";
import { triggerHapticFeedback } from "../../utils/mobileUtils";

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const SelectExamDates = () => {
  const [originalExamList, setOriginalExamList] = useState([]);
  const [filteredExamList, setFilteredExamList] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [savedSelections, setSavedSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        const user = JSON.parse(userJson);
        const userId = user?.id;
        if (!userId) {
          Toast.show({ type: "error", text1: "User ID not found" });
          return;
        }

        setLoading(true);
        Toast.show({ type: "info", text1: "Loading exam data..." });

        const examsRes = await axios.get(
          `${BASE_URL}/api/v1/exam/exams-with-dates?userId=${userId}`
        );

        const savedRes = await axios.get(
          `${BASE_URL}/api/v1/exam/saved-selections/${userId}`
        );

        setOriginalExamList(examsRes.data);
        setSavedSelections(savedRes.data.data || []);

        const savedSlots = {};
        savedRes.data.data.forEach((selection) => {
          const dateStr = new Date(selection.exam_date).toLocaleDateString();
          const key = `${selection.exam_id}_${dateStr}`;
          savedSlots[key] = {
            dutyType: selection.duty_type,
            session: selection.session,
            reason: selection.reason || "",
          };
        });

        setSelectedSlots(savedSlots);
      } catch (err) {
        Toast.show({ type: "error", text1: `Failed to load data` });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (originalExamList.length === 0) return;
    const savedIds = savedSelections.map((s) => s.exam_id);
    const filtered = originalExamList.filter(
      (exam) => !savedIds.includes(exam.examId)
    );
    setFilteredExamList(filtered);
  }, [originalExamList, savedSelections]);

  const toggleDateSelection = (key, type, session) => {
    triggerHapticFeedback('light');
    setSelectedSlots((prev) => {
      if (type === "Not Available") {
        return {
          ...prev,
          [key]: { dutyType: "Not Available", session, reason: "" },
        };
      }
      return {
        ...prev,
        [key]:
          prev[key]?.dutyType === type
            ? null
            : { dutyType: type, session },
      };
    });
  };

  const handleSaveExam = (examId) => {
    triggerHapticFeedback('light');
    setPendingSaveData(examId);
    setShowSaveDialog(true);
  };

  const confirmSaveExam = async () => {
    if (!pendingSaveData) return;

    try {
      const userJson = await AsyncStorage.getItem("user");
      const user = JSON.parse(userJson);
      const userId = user?.id;

      const examId = pendingSaveData;
      const newSelections = [];

      Object.entries(selectedSlots).forEach(([key, value]) => {
        if (!value?.dutyType) return;
        const [keyExamId, examDate] = key.split("_");
        if (keyExamId !== examId) return;

        const alreadySaved = savedSelections.some(
          (s) =>
            s.exam_id === examId &&
            new Date(s.exam_date).toLocaleDateString() === examDate
        );
        if (!alreadySaved) {
          newSelections.push({
            examId: keyExamId,
            examDate,
            dutyType: value.dutyType,
            session: value.session,
            reason: value.reason || "",
          });
        }
      });

      if (newSelections.length === 0) {
        Toast.show({ type: "info", text1: "No new selections to save" });
        return;
      }

      Toast.show({ type: "info", text1: "Saving selections..." });

      await axios.post(`${BASE_URL}/api/v1/exam/save-selections`, {
        userId,
        selections: newSelections,
      });

      const savedRes = await axios.get(
        `${BASE_URL}/api/v1/exam/saved-selections/${userId}`
      );
      setSavedSelections(savedRes.data.data || []);

      const updatedSlots = { ...selectedSlots };
      newSelections.forEach((sel) => {
        const key = `${sel.examId}_${sel.examDate}`;
        delete updatedSlots[key];
      });
      setSelectedSlots(updatedSlots);

      setShowSaveDialog(false);
      setPendingSaveData(null);
      triggerHapticFeedback('success');

      Toast.show({ type: "success", text1: "Selections saved!" });
    } catch (err) {
      setShowSaveDialog(false);
      setPendingSaveData(null);
      triggerHapticFeedback('error');

      Toast.show({ type: "error", text1: "Save failed" });
      console.error(err);
    }
  };

  const paginatedExams = filteredExamList;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading exam data...</Text>
      </View>
    );
  }

  if (originalExamList.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.header}>No Exams Available</Text>
        <Text style={styles.subText}>
          There are currently no exams available for selection.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Toast />

      {/* Professional Header */}
      <View style={styles.headerCard}>
        <Text style={styles.pageTitle}>Select Exam Dates</Text>
        <Text style={styles.pageSubtitle}>Choose your examination duty preferences</Text>
      </View>

      {paginatedExams.map((exam) => (
        <View key={exam.examId} style={styles.examCard}>
          <View style={styles.examHeader}>
            <Text style={styles.examName}>{exam.examName}</Text>
            <View style={styles.examBadge}>
              <Text style={styles.examBadgeText}>{exam.dates.length} dates</Text>
            </View>
          </View>

          {exam.dates.map((d, idx) => {
            const dateStr = new Date(d.examDate).toLocaleDateString();
            const key = `${exam.examId}_${dateStr}`;
            const selected = selectedSlots[key];
            const isAlreadySaved = savedSelections.some(
              (s) =>
                s.exam_id === exam.examId &&
                new Date(s.exam_date).toLocaleDateString() === dateStr
            );

            return (
              <View key={idx} style={styles.dateCard}>
                <Text style={styles.dateText}>{dateStr} - {d.session}</Text>

                {isAlreadySaved ? (
                  <Text style={styles.savedText}>Already Selected</Text>
                ) : (
                  <>
                    <View style={styles.buttonGroup}>
                      {/* Exam Duty Button */}
                      <TouchableOpacity
                        onPress={() => {
                          if (d.examDutyCount > 0) {
                            triggerHapticFeedback('light');
                            toggleDateSelection(key, "Exam Duty", d.session);
                          }
                        }}
                        disabled={d.examDutyCount <= 0}
                        style={[
                          styles.button,
                          selected?.dutyType === "Exam Duty" && styles.activeButton,
                          d.examDutyCount <= 0 && styles.disabledButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            selected?.dutyType === "Exam Duty" && styles.activeButtonText,
                            d.examDutyCount <= 0 && styles.disabledButtonText,
                          ]}
                        >
                          Exam Duty
                        </Text>
                        <Text
                          style={[
                            styles.slotText,
                            selected?.dutyType === "Exam Duty" && styles.activeSlotText,
                            d.examDutyCount <= 0 && styles.disabledSlotText,
                          ]}
                        >
                          {d.examDutyCount > 0
                            ? `${d.examDutyCount} slot${d.examDutyCount !== 1 ? 's' : ''} available`
                            : 'Slot Filled'
                          }
                        </Text>
                      </TouchableOpacity>

                      {/* Reliever Duty Button */}
                      <TouchableOpacity
                        onPress={() => {
                          if (d.relieverDutyCount > 0) {
                            triggerHapticFeedback('light');
                            toggleDateSelection(key, "Reliever Duty", d.session);
                          }
                        }}
                        disabled={d.relieverDutyCount <= 0}
                        style={[
                          styles.button,
                          selected?.dutyType === "Reliever Duty" && styles.activeButton,
                          d.relieverDutyCount <= 0 && styles.disabledButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            selected?.dutyType === "Reliever Duty" && styles.activeButtonText,
                            d.relieverDutyCount <= 0 && styles.disabledButtonText,
                          ]}
                        >
                          Reliever Duty
                        </Text>
                        <Text
                          style={[
                            styles.slotText,
                            selected?.dutyType === "Reliever Duty" && styles.activeSlotText,
                            d.relieverDutyCount <= 0 && styles.disabledSlotText,
                          ]}
                        >
                          {d.relieverDutyCount > 0
                            ? `${d.relieverDutyCount} slot${d.relieverDutyCount !== 1 ? 's' : ''} available`
                            : 'Slot Filled'
                          }
                        </Text>
                      </TouchableOpacity>

                      {/* Not Available Button */}
                      <TouchableOpacity
                        onPress={() => {
                          triggerHapticFeedback('light');
                          toggleDateSelection(key, "Not Available", d.session);
                        }}
                        style={[
                          styles.button,
                          selected?.dutyType === "Not Available" && styles.activeButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            selected?.dutyType === "Not Available" && styles.activeButtonText,
                          ]}
                        >
                          Not Available
                        </Text>
                        <Text
                          style={[
                            styles.slotText,
                            selected?.dutyType === "Not Available" && styles.activeSlotText,
                          ]}
                        >
                          Mark as unavailable
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {selected?.dutyType === "Not Available" && (
                      <TextInput
                        placeholder="Reason for unavailability"
                        value={selected.reason || ""}
                        onChangeText={(text) =>
                          setSelectedSlots((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], reason: text },
                          }))
                        }
                        style={styles.textArea}
                        multiline
                      />
                    )}
                  </>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            onPress={() => handleSaveExam(exam.examId)}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              Save Selections for {exam.examName}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Save Confirmation Dialog */}
      <ConfirmationDialog
        visible={showSaveDialog}
        title="Confirm Save"
        message="Are you sure you want to save your exam date selections? This action cannot be undone."
        type="info"
        confirmText="Save Selections"
        cancelText="Cancel"
        onConfirm={confirmSaveExam}
        onCancel={() => {
          setShowSaveDialog(false);
          setPendingSaveData(null);
        }}
      />
    </ScrollView>
  );
};

export default SelectExamDates;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9fafb"
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  headerCard: {
    backgroundColor: "white",
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  examCard: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  examHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  examName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  examBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  examBadgeText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
  },
  dateCard: {
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  savedText: {
    color: "#10b981",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "#ecfdf5",
    padding: 8,
    borderRadius: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  buttonText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  activeButtonText: {
    color: "white",
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    opacity: 0.6,
  },
  disabledButtonText: {
    color: "#9ca3af",
    fontWeight: "500",
  },
  slotText: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "center",
  },
  activeSlotText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  disabledSlotText: {
    color: "#9ca3af",
  },
  textArea: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "white",
    fontSize: 14,
    color: "#374151",
    minHeight: 80,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
