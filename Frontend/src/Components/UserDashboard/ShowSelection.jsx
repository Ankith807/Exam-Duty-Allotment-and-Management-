import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, CheckCircle, AlertCircle, Eye, RefreshCw, Shield, Users, XCircle } from 'lucide-react';
import LoadingSpinner, { CardSkeleton } from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import Card, { StatCard, InfoCard } from '../ui/Card';

const ShowSelection = () => {
  const [selections, setSelections] = useState([]);
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasFetched = useRef(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
  }

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

  const fetchSelections = () => {
    if (!userId) return;

    setLoading(true);
    setRefreshing(true);

    axios
      .get(`http://localhost:3000/api/v1/exam/saved-selections/${userId}`)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setSelections(res.data.data);
          setExamData(groupSelectionsByExam(res.data.data));
        } else {
          setSelections([]);
          setExamData([]);
        }
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch data.");
        setSelections([]);
        setExamData([]);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    if (!userId || hasFetched.current) return;
    hasFetched.current = true;
    fetchSelections();
  }, [userId]);

  if (!userId) return <Navigate to="/" replace />;

  const getDutyTypeColor = (dutyType) => {
    switch (dutyType?.toLowerCase()) {
      case 'exam_duty':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reliever_duty':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'not_available':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDutyTypeIcon = (dutyType) => {
    switch (dutyType?.toLowerCase()) {
      case 'exam_duty':
        return <Shield className="w-4 h-4" />;
      case 'reliever_duty':
        return <Users className="w-4 h-4" />;
      case 'not_available':
        return <XCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const handleRefresh = () => {
    fetchSelections();
  };

  return (
    <div className="min-h-screen bg-secondary-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-primary-600" />
                Your Exam Selections
              </h1>
              <p className="text-secondary-600 mt-1">
                View all your exam duty selections organized by exam
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              loading={refreshing}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner
              size="lg"
              color="primary"
              text="Loading your exam selections..."
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <InfoCard
            variant="danger"
            title="Error Loading Data"
            description={error}
            icon={<AlertCircle className="w-6 h-6 text-danger-500" />}
            action={
              <Button
                onClick={handleRefresh}
                variant="danger"
                size="sm"
              >
                Try Again
              </Button>
            }
            className="text-center"
          />
        )}

        {/* Empty State */}
        {!loading && !error && examData.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <BookOpen className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Selections Found</h3>
            <p className="text-yellow-700">
              You haven't made any exam duty selections yet. Go to the exam dates section to make your selections.
            </p>
          </div>
        )}

        {/* Exam Tables */}
        {!loading && !error && examData.length > 0 && (
          <div className="space-y-8">
          {examData.map((exam, examIndex) => (
            <motion.div
              key={exam.examId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: examIndex * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Exam Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      {exam.examName}
                    </h2>
                    <p className="text-blue-100 mt-1">Exam ID: {exam.examId}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg px-3 py-1">
                      <span className="text-sm font-medium">
                        {exam.dates.length} Selection{exam.dates.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam Dates Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Exam Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Session & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duty Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {exam.dates.map((selection, dateIndex) => (
                      <motion.tr
                        key={selection.selection_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (examIndex * 0.1) + (dateIndex * 0.05) }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Exam Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(selection.exam_date)}
                            </span>
                          </div>
                        </td>

                        {/* Session & Time */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {selection.session}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(selection.session)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Duty Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDutyTypeColor(selection.duty_type)}`}>
                            {getDutyTypeIcon(selection.duty_type)}
                            <span className="ml-1 capitalize">
                              {selection.duty_type.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 font-medium">Submitted</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              
            </motion.div>
          ))}
        </div>
        )}

        {/* Overall Summary */}
        {!loading && !error && selections.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">Overall Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <span className="font-medium text-indigo-800">Total Exams:</span>
                <span className="ml-2 text-indigo-700 font-bold text-lg">{examData.length}</span>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <span className="font-medium text-blue-800">Total Selections:</span>
                <span className="ml-2 text-blue-700 font-bold text-lg">{selections.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowSelection;
