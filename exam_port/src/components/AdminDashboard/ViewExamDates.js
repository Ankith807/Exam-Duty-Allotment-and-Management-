import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Modal } from "react-native";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Edit3,
  Trash2,
} from "lucide-react-native";
import { API_IP, API_PORT } from '@env';
import Toast from "react-native-toast-message";

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const ViewExamDates = () => {
  const [examDates, setExamDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editFormData, setEditFormData] = useState({
    examName: '',
    dueDate: '',
    examDates: []
  });
  const [saving, setSaving] = useState(false);

  const fetchExamDates = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`${BASE_URL}/api/v1/exam/exams-with-dates`);
      setExamDates(response.data);
      setError(null);

      if (isRefresh) {
        Toast.show({
          type: "success",
          text1: "Data refreshed successfully!"
        });
      }
    } catch (err) {
      console.error("Error fetching exam dates:", err);
      setError("Failed to load exam dates. Please try again.");
      if (isRefresh) {
        Toast.show({
          type: "error",
          text1: "Failed to refresh data. Please try again."
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExamDates();
  }, []);

  const handleRefresh = () => {
    fetchExamDates(true);
  };

  const handleEditExam = async (examId) => {
    try {
      // Find the exam data from the current state
      const examToEdit = examDates.find(exam => exam.examId === examId);
      if (examToEdit) {
        setEditingExam(examToEdit);

        // Format the data for the edit form
        setEditFormData({
          examName: examToEdit.examName,
          dueDate: examToEdit.dueDate ? new Date(examToEdit.dueDate).toISOString().split('T')[0] : '',
          examDates: examToEdit.dates.map(date => ({
            id: Math.random().toString(36).substr(2, 9),
            examDate: new Date(date.examDate).toISOString().split('T')[0],
            examDutyCount: date.examDutyCount || 0,
            relieverDutyCount: date.relieverDutyCount || 0,
            session: date.session || 'morning'
          }))
        });

        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Error preparing exam for edit:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load exam data for editing."
      });
    }
  };

  const handleDeleteExam = (examId, examName) => {
    const examToDelete = examDates.find(exam => exam.examId === examId);
    setExamToDelete(examToDelete);

    Alert.alert(
      "Delete Exam",
      `Are you sure you want to delete "${examName}"?\n\nThis will permanently delete the exam and all its associated dates and selections.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteExam
        }
      ]
    );
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // Use the internal ID from the editing exam
      if (!editingExam || !editingExam.internalId) {
        throw new Error("Could not find exam internal ID");
      }

      const updateData = {
        examName: editFormData.examName,
        dueDate: editFormData.dueDate,
        examDates: editFormData.examDates.map(date => ({
          examDate: date.examDate,
          examDutyCount: parseInt(date.examDutyCount) || 0,
          relieverDutyCount: parseInt(date.relieverDutyCount) || 0,
          session: date.session
        }))
      };

      await axios.put(`${BASE_URL}/api/v1/exam/exams/${editingExam.internalId}`, updateData);

      Toast.show({
        type: "success",
        text1: `Exam "${editFormData.examName}" updated successfully!`
      });

      setShowEditModal(false);
      setEditingExam(null);
      setEditFormData({ examName: '', dueDate: '', examDates: [] });
      fetchExamDates(); // Refresh the data
    } catch (error) {
      console.error("Error updating exam:", error);
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to update exam. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;

    try {
      // Use the internal ID from the exam to delete
      if (!examToDelete.internalId) {
        throw new Error("Could not find exam internal ID");
      }

      await axios.delete(`${BASE_URL}/api/v1/exam/exams/${examToDelete.internalId}`);

      Toast.show({
        type: "success",
        text1: `Exam "${examToDelete.examName}" deleted successfully!`
      });

      setExamToDelete(null);
      fetchExamDates(); // Refresh the data
    } catch (error) {
      console.error("Error deleting exam:", error);
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to delete exam. Please try again."
      });
    }
  };

  const getRemainingSlots = (required, filled) => {
    const remaining = required - filled;
    if (remaining <= 0) {
      return (
        <View style={styles.slotBadgeRed}>
          <AlertCircle size={12} color="#b91c1c" />
          <Text style={styles.slotBadgeTextRed}> Full</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.slotBadgeGreen}>
          <CheckCircle size={12} color="#166534" />
          <Text style={styles.slotBadgeTextGreen}> {remaining} left</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading exam dates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorBox}>
        <AlertCircle size={48} color="#b91c1c" />
        <Text style={styles.errorTitle}>Error Loading Data</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Eye size={24} color="#3B82F6" />
            <Text style={styles.title}>Scheduled Exam Dates</Text>
          </View>
          <Text style={styles.subtitle}>View and manage all scheduled examinations and duty assignments</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.statsRow}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.statsText}>
              {" "}
              {examDates.length} exam{examDates.length !== 1 ? "s" : ""} scheduled
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
          >
            <RefreshCw
              size={16}
              color="white"
              style={refreshing ? styles.spinning : null}
            />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* No Data */}
      {examDates.length === 0 ? (
        <View style={styles.noExamBox}>
          <Calendar size={64} color="#9ca3af" />
          <Text style={styles.noExamTitle}>No Exams Scheduled</Text>
          <Text style={styles.noExamSubtitle}>No exam dates have been scheduled yet.</Text>
        </View>
      ) : (
        examDates.map((exam, examIndex) => (
          <View key={exam.examId} style={styles.examCard}>
            {/* Exam Header */}
            <View style={styles.examHeader}>
              <View style={styles.examHeaderLeft}>
                <Text style={styles.examName}>{exam.examName}</Text>
                <Text style={styles.examId}>Exam ID: {exam.examId}</Text>
              </View>
              <View style={styles.examHeaderRight}>
                <View style={styles.examDateCount}>
                  <Text style={styles.examDateCountText}>
                    {exam.dates.length} Date{exam.dates.length !== 1 ? "s" : ""}
                  </Text>
                </View>
                <View style={styles.examActions}>
                  <TouchableOpacity
                    onPress={() => handleEditExam(exam.examId)}
                    style={styles.actionButton}
                  >
                    <Edit3 size={16} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteExam(exam.examId, exam.examName)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <Trash2 size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Exam Dates */}
            <View style={styles.examDatesWrapper}>
              {exam.dates.map((date, dateIndex) => (
                <View key={dateIndex} style={styles.examDateBox}>
                  {/* Date Info */}
                  <View style={styles.dateHeader}>
                    <Calendar size={16} color="#2563eb" />
                    <Text style={styles.dateText}>
                      {new Date(date.examDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <View
                      style={[
                        styles.sessionBadge,
                        {
                          backgroundColor:
                            date.session === "morning" ? "#fef08a" : "#fed7aa",
                        },
                      ]}
                    >
                      <Clock size={12} color="#92400e" />
                      <Text style={styles.sessionText}>
                        {" "}
                        {date.session.charAt(0).toUpperCase() +
                          date.session.slice(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Exam Duty */}
                  <View style={styles.dutyRow}>
                    <View style={styles.dutyLabel}>
                      <BookOpen size={16} color="#2563eb" />
                      <Text style={styles.dutyText}>Exam Duty</Text>
                    </View>
                    <View style={styles.dutyStatus}>
                      <Text style={styles.dutyRatio}>
                        {date.examDutyFilled}/{date.examDutyCount}
                      </Text>
                      {getRemainingSlots(date.examDutyCount, date.examDutyFilled)}
                    </View>
                  </View>

                  {/* Reliever Duty */}
                  <View style={styles.dutyRow}>
                    <View style={styles.dutyLabel}>
                      <Users size={16} color="#16a34a" />
                      <Text style={styles.dutyText}>Reliever Duty</Text>
                    </View>
                    <View style={styles.dutyStatus}>
                      <Text style={styles.dutyRatio}>
                        {date.relieverDutyFilled}/{date.relieverDutyCount}
                      </Text>
                      {date.relieverDutyCount > 0 ? (
                        getRemainingSlots(
                          date.relieverDutyCount,
                          date.relieverDutyFilled
                        )
                      ) : (
                        <Text style={styles.naText}>N/A</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))
      )}

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowEditModal(false);
          setEditingExam(null);
          setEditFormData({ examName: '', dueDate: '', examDates: [] });
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Edit3 size={24} color="#3B82F6" />
              <Text style={styles.modalTitle}>Edit Exam</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowEditModal(false);
                setEditingExam(null);
                setEditFormData({ examName: '', dueDate: '', examDates: [] });
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Exam Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Exam Name</Text>
              <Text style={styles.inputField}>{editFormData.examName}</Text>
            </View>

            {/* Exam ID (Read-only) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Exam ID (Read-only)</Text>
              <Text style={styles.readOnlyField}>{editingExam?.examId || ''}</Text>
            </View>

            {/* Due Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.inputField}>
                {editFormData.dueDate ?
                  new Date(editFormData.dueDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) :
                  'No due date set'
                }
              </Text>
            </View>

            {/* Exam Dates */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Exam Dates</Text>
              {editFormData.examDates.map((date, index) => (
                <View key={date.id} style={styles.dateCard}>
                  <Text style={styles.dateCardTitle}>Date {index + 1}</Text>
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateText}>
                      {new Date(date.examDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                    <Text style={styles.sessionText}>
                      {date.session.charAt(0).toUpperCase() + date.session.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.dutyInfo}>
                    <View style={styles.dutyItem}>
                      <Text style={styles.dutyLabel}>Exam Duty:</Text>
                      <Text style={styles.dutyValue}>{date.examDutyCount}</Text>
                    </View>
                    <View style={styles.dutyItem}>
                      <Text style={styles.dutyLabel}>Reliever Duty:</Text>
                      <Text style={styles.dutyValue}>{date.relieverDutyCount}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                Note: Full edit functionality with form inputs will be implemented in a future update.
                Currently showing read-only view of exam data.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => {
                setShowEditModal(false);
                setEditingExam(null);
                setEditFormData({ examName: '', dueDate: '', examDates: [] });
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Full edit functionality coming soon!",
                  text2: "Form inputs will be added in the next update"
                });
              }}
              style={styles.saveButton}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Edit (Coming Soon)"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ViewExamDates;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    color: "#4b5563",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    margin: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#b91c1c",
    marginTop: 8,
  },
  errorText: {
    color: "#991b1b",
    marginTop: 4,
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerContent: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 12,
  },
  subtitle: {
    color: "#6b7280",
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    color: "#6b7280",
    fontSize: 12,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noExamBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  noExamTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 12,
  },
  noExamSubtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  examCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  examHeader: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  examHeaderLeft: {
    flex: 1,
  },
  examHeaderRight: {
    alignItems: "flex-end",
  },
  examActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "rgba(239,68,68,0.8)",
  },
  examName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  examId: {
    color: "#c7d2fe",
    marginTop: 4,
  },
  examDateCount: {
    backgroundColor: "#ffffff20",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  examDateCountText: {
    color: "#ffffff",
    fontSize: 12,
  },
  examDatesWrapper: {
    padding: 16,
  },
  examDateBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  dateText: {
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 6,
  },
  sessionBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  sessionText: {
    fontSize: 12,
    color: "#78350f",
  },
  dutyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  dutyLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dutyText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 6,
  },
  dutyStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dutyRatio: {
    fontSize: 13,
    color: "#4b5563",
  },
  slotBadgeRed: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: "center",
  },
  slotBadgeGreen: {
    flexDirection: "row",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: "center",
  },
  slotBadgeTextRed: {
    fontSize: 12,
    color: "#b91c1c",
  },
  slotBadgeTextGreen: {
    fontSize: 12,
    color: "#166534",
  },
  naText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    color: '#111827',
  },
  readOnlyField: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    color: '#6b7280',
  },
  dateCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateInfo: {
    marginBottom: 12,
  },
  dutyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dutyItem: {
    flex: 1,
  },
  dutyLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  dutyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  noteContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
