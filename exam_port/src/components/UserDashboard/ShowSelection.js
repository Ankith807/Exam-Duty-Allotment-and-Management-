import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  BookOpen,
  Shield,
  Eye,
  Users
} from "lucide-react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { API_IP, API_PORT } from '@env';
import { triggerHapticFeedback } from "../../utils/mobileUtils";

const BASE_URL = `http://${API_IP}:${API_PORT}`;


const ShowSelection = () => {
  const [selections, setSelections] = useState([]);
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const hasFetched = useRef(false);
  const navigation = useNavigation();

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUser(userData);
        } else {
          // No user found, redirect to login
          navigation.replace("UserLogin");
        }
      } catch (e) {
        console.error("Error parsing user from AsyncStorage:", e);
        navigation.replace("UserLogin");
      }
    };

    loadUser();
  }, [navigation]);

  const userId = user?.id;

  // Group selections by exam ID
  const groupSelectionsByExam = (selections) => {
    const grouped = {};

    selections.forEach(selection => {
      const examId = selection.exam_id;
      if (!grouped[examId]) {
        grouped[examId] = {
          examId: examId,
          examName: selection.exam_name || `Exam ${examId}`,
          dates: []
        };
      }
      grouped[examId].dates.push(selection);
    });

    return Object.values(grouped);
  };

  const fetchSelections = async (isRefresh = false) => {
    if (!userId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/v1/exam/saved-selections/${userId}`);

      if (response.data.success && Array.isArray(response.data.data)) {
        setSelections(response.data.data);
        setExamData(groupSelectionsByExam(response.data.data));
        setError(null);
      } else {
        setSelections([]);
        setExamData([]);
      }
    } catch (err) {
      console.error("Error fetching selections:", err);
      setError(err.response?.data?.message || "Failed to fetch your exam selections.");
      setSelections([]);
      setExamData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId && !hasFetched.current) {
      hasFetched.current = true;
      fetchSelections();
    }
  }, [userId]);

  const onRefresh = () => {
    triggerHapticFeedback('light');
    fetchSelections(true);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  const getDutyTypeIcon = (dutyType, size = 16) => {
    switch (dutyType.toLowerCase()) {
      case 'exam_duty':
        return <Shield size={size} color="#3B82F6" />;
      case 'reliever_duty':
        return <Users size={size} color="#10B981" />;
      case 'not_available':
        return <XCircle size={size} color="#EF4444" />;
      default:
        return <CheckCircle size={size} color="#6B7280" />;
    }
  };

  const getDutyTypeColor = (dutyType) => {
    switch (dutyType.toLowerCase()) {
      case 'exam_duty':
        return '#3B82F6';
      case 'reliever_duty':
        return '#10B981';
      case 'not_available':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getDutyTypeBg = (dutyType) => {
    switch (dutyType.toLowerCase()) {
      case 'exam_duty':
        return '#EFF6FF';
      case 'reliever_duty':
        return '#ECFDF5';
      case 'not_available':
        return '#FEF2F2';
      default:
        return '#F9FAFB';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (session) => {
    const timeMap = {
      morning: '9:00 AM - 12:00 PM',
      afternoon: '1:00 PM - 4:00 PM',
      evening: '5:00 PM - 8:00 PM'
    };
    return timeMap[session] || session;
  };

  const renderExamTable = (exam, examIndex) => (
    <View key={exam.examId} style={styles.examTableContainer}>
      {/* Exam Header */}
      <View style={styles.examHeader}>
        <View style={styles.examHeaderContent}>
          <View style={styles.examTitleRow}>
            <BookOpen size={20} color="white" />
            <Text style={styles.examTitle}>{exam.examName}</Text>
          </View>
          <Text style={styles.examId}>Exam ID: {exam.examId}</Text>
        </View>
        <View style={styles.examSelectionCount}>
          <Text style={styles.selectionCountText}>
            {exam.dates.length} Selection{exam.dates.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Table Content */}
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Date</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Session</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Duty Type</Text>
        </View>

        {/* Table Rows */}
        {exam.dates.map((selection, dateIndex) => (
          <View key={selection.selection_id} style={styles.tableRow}>
            {/* Date Column */}
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.tableCellText}>
                {formatDate(selection.exam_date)}
              </Text>
            </View>

            {/* Session Column */}
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Clock size={14} color="#6B7280" />
              <View>
                <Text style={styles.tableCellText}>{selection.session}</Text>
                <Text style={styles.tableCellSubtext}>
                  {formatTime(selection.session)}
                </Text>
              </View>
            </View>

            {/* Duty Type Column */}
            <View style={[styles.tableCell, { flex: 2 }]}>
              <View style={[
                styles.dutyTypeBadge,
                { backgroundColor: getDutyTypeBg(selection.duty_type) }
              ]}>
                {getDutyTypeIcon(selection.duty_type, 12)}
                <Text style={[
                  styles.dutyTypeText,
                  { color: getDutyTypeColor(selection.duty_type) }
                ]}>
                  {selection.duty_type.replace('_', ' ')}
                </Text>
              </View>
            </View>

            
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your selections...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <XCircle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Error Loading Selections</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            triggerHapticFeedback('light');
            fetchSelections();
          }}
        >
          <RefreshCw size={18} color="white" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const examDuties = selections.filter(s => s.duty_type === "exam_duty").length;
  const relieverDuties = selections.filter(s => s.duty_type === "reliever_duty").length;
  const notAvailable = selections.filter(s => s.duty_type === "not_available").length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Eye size={28} color="#3B82F6" />
          <Text style={styles.title}>Your Exam Selections</Text>
        </View>
        <Text style={styles.subtitle}>
          View all your exam duty selections organized by exam
        </Text>
      </View>

      {/* Empty State */}
      {examData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookOpen size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Selections Yet</Text>
          <Text style={styles.emptyText}>
            You haven't made any exam duty selections yet. Go to the exam dates section to make your selections.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              triggerHapticFeedback('light');
              navigation.goBack();
            }}
          >
            <ArrowLeft size={18} color="white" />
            <Text style={styles.actionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Exam Tables */}
          <View style={styles.tablesContainer}>
            {examData.map(renderExamTable)}
          </View>

          {/* Overall Summary */}
          <View style={styles.overallSummary}>
            <Text style={styles.summaryTitle}>Overall Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Exams</Text>
                <Text style={[styles.summaryNumber, { color: '#6366F1' }]}>{examData.length}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Selections</Text>
                <Text style={[styles.summaryNumber, { color: '#3B82F6' }]}>{selections.length}</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F8FAFC",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  tablesContainer: {
    gap: 20,
    marginBottom: 24,
  },
  examTableContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  examHeader: {
    backgroundColor: '#3B82F6',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examHeaderContent: {
    flex: 1,
  },
  examTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    flex: 1,
  },
  examId: {
    fontSize: 14,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  examSelectionCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectionCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  tableContainer: {
    backgroundColor: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'flex-start',
  },
  tableCell: {
    paddingRight: 8,
  },
  tableCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  tableCellSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  dutyTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dutyTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  

  tableFooter: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footerBold: {
    fontWeight: '700',
  },
  footerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  footerStat: {
    fontSize: 11,
    color: '#6B7280',
  },
  overallSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ShowSelection;
