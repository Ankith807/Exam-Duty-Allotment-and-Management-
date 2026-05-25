import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { Calendar, Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react-native';
import axios from 'axios';
import { API_IP, API_PORT } from '@env';
import { triggerHapticFeedback } from '../../utils/mobileUtils';

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const CompletedExamDates = () => {
  const [examDates, setExamDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompletedExamDates = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/v1/exam/exams/completed`);
      setExamDates(response.data.completedExamDates || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch completed exam dates');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompletedExamDates();
  }, []);

  const onRefresh = () => {
    triggerHapticFeedback('light');
    fetchCompletedExamDates(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.examCard}>
      <View style={styles.cardHeader}>
        <View style={styles.examIdContainer}>
          <BookOpen size={20} color="#3B82F6" />
          <Text style={styles.examId}>Exam {item.exam_id}</Text>
        </View>
        <View style={styles.statusBadge}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Calendar size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>
            {new Date(item.exam_date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Clock size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Session:</Text>
          <Text style={styles.infoValue}>{item.session}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading completed exams...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <CheckCircle size={28} color="#10B981" />
          <Text style={styles.title}>Completed Exams</Text>
        </View>
        <Text style={styles.subtitle}>
          {examDates.length} exam{examDates.length !== 1 ? 's' : ''} completed
        </Text>
      </View>

      {examDates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookOpen size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Completed Exams</Text>
          <Text style={styles.emptyText}>
            No completed exam dates found. Check back later for updates.
          </Text>
        </View>
      ) : (
        <FlatList
          data={examDates}
          renderItem={renderItem}
          keyExtractor={(item, index) => `exam-${item.exam_id}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 16,
    paddingHorizontal: 32,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 60,
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
  listContainer: {
    gap: 16,
  },
  examCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  examIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 50,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
});

export default CompletedExamDates;
