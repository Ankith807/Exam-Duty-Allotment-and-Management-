import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, BookOpen, AlertCircle, CheckCircle, Eye, RefreshCw, Edit3, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import LoadingSpinner, { CardSkeleton } from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import Card, { StatCard, InfoCard } from '../ui/Card';

const ViewExamDates = () => {
  const [examDates, setExamDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    examName: '',
    dueDate: '',
    examDates: []
  });
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchExamDates = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(
        "http://localhost:3000/api/v1/exam/exams-with-dates"
      );
      setExamDates(response.data);
      setError(null);

      if (isRefresh) {
        toast.success("Data refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching exam dates:", error);
      setError("Failed to load exam dates. Please try again.");
      if (isRefresh) {
        toast.error("Failed to refresh data. Please try again.");
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
        // Get the full exam data from the backend
        const response = await axios.get(`http://localhost:3000/api/v1/exam/exams-with-dates`);
        const allExams = response.data;
        const fullExamData = allExams.find(exam => exam.examId === examId);

        if (fullExamData) {
          setEditingExam(fullExamData);

          // Format the data for the edit form
          setEditFormData({
            examName: fullExamData.examName,
            dueDate: fullExamData.dueDate ? new Date(fullExamData.dueDate).toISOString().split('T')[0] : '',
            examDates: fullExamData.dates.map(date => ({
              id: date.id || Math.random().toString(36).substr(2, 9),
              examDate: new Date(date.examDate).toISOString().split('T')[0],
              examDutyCount: date.examDutyCount || 0,
              relieverDutyCount: date.relieverDutyCount || 0,
              session: date.session || 'morning'
            }))
          });

          setEditErrors({});
          setShowEditModal(true);
        }
      }
    } catch (error) {
      console.error("Error preparing exam for edit:", error);
      toast.error("Failed to load exam data for editing.");
    }
  };

  const handleDeleteExam = (examId, examName) => {
    const examToDelete = examDates.find(exam => exam.examId === examId);
    setExamToDelete(examToDelete);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

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

      await axios.put(`http://localhost:3000/api/v1/exam/exams/${editingExam.internalId}`, updateData);

      toast.success(`Exam "${editFormData.examName}" updated successfully!`);
      setShowEditModal(false);
      setEditingExam(null);
      setEditFormData({ examName: '', dueDate: '', examDates: [] });
      fetchExamDates(); // Refresh the data
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error(error.response?.data?.message || "Failed to update exam. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.examName.trim()) {
      errors.examName = 'Exam name is required';
    } else if (editFormData.examName.trim().length < 3) {
      errors.examName = 'Exam name must be at least 3 characters';
    }

    if (!editFormData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(editFormData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

      if (dueDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (editFormData.examDates.length === 0) {
      errors.examDates = 'At least one exam date is required';
    }

    editFormData.examDates.forEach((date, index) => {
      if (!date.examDate) {
        errors[`examDate_${index}`] = 'Date is required';
      } else if (editFormData.dueDate) {
        const examDate = new Date(date.examDate);
        const dueDate = new Date(editFormData.dueDate);

        if (examDate < dueDate) {
          errors[`examDate_${index}`] = 'Exam date must be on or after the due date';
        }
      }

      if (date.examDutyCount < 0) {
        errors[`examDuty_${index}`] = 'Exam duty count cannot be negative';
      }
      if (date.relieverDutyCount < 0) {
        errors[`relieverDuty_${index}`] = 'Reliever duty count cannot be negative';
      }
    });

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (editErrors[field]) {
      setEditErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleEditDateChange = (index, field, value) => {
    setEditFormData(prev => ({
      ...prev,
      examDates: prev.examDates.map((date, i) =>
        i === index ? { ...date, [field]: value } : date
      )
    }));

    // Clear error for this field
    const errorKey = `${field}_${index}`;
    if (editErrors[errorKey]) {
      setEditErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  const addEditExamDate = () => {
    setEditFormData(prev => ({
      ...prev,
      examDates: [...prev.examDates, {
        id: Math.random().toString(36).substr(2, 9),
        examDate: '',
        examDutyCount: 0,
        relieverDutyCount: 0,
        session: 'morning'
      }]
    }));
  };

  const removeEditExamDate = (index) => {
    setEditFormData(prev => ({
      ...prev,
      examDates: prev.examDates.filter((_, i) => i !== index)
    }));
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;

    try {
      // Use the internal ID from the exam to delete
      if (!examToDelete.internalId) {
        throw new Error("Could not find exam internal ID");
      }

      await axios.delete(`http://localhost:3000/api/v1/exam/exams/${examToDelete.internalId}`);

      toast.success(`Exam "${examToDelete.examName}" deleted successfully!`);
      setShowDeleteModal(false);
      setExamToDelete(null);
      fetchExamDates(); // Refresh the data
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error(error.response?.data?.message || "Failed to delete exam. Please try again.");
    }
  };

  const getRemainingSlots = (required, filled) => {
    const remaining = required - filled;
    return remaining <= 0 ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Full
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        {remaining} left
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">Loading exam dates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-blue-600" />
              Scheduled Exam Dates
            </h1>
            <p className="text-gray-600 mt-1">View and manage all scheduled examinations and duty assignments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{examDates.length} exam{examDates.length !== 1 ? 's' : ''} scheduled</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {examDates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Scheduled</h3>
          <p className="text-gray-600">No exam dates have been scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {examDates.map((exam, examIndex) => (
            <motion.div
              key={exam.examId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: examIndex * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Exam Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{exam.examName}</h2>
                    <p className="text-blue-100 mt-1">Exam ID: {exam.examId}</p>
                    <p className="text-blue-100 mt-1">Due Date: {new Date(exam.dueDate).toLocaleDateString("en-US", {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-lg px-3 py-1">
                      <span className="text-sm font-medium">{exam.dates.length} Date{exam.dates.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditExam(exam.examId)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        title="Edit Exam"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.examId, exam.examName)}
                        className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam Dates */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exam.dates.map((date, dateIndex) => (
                    <motion.div
                      key={dateIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (examIndex * 0.1) + (dateIndex * 0.05) }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      {/* Date Info */}
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {new Date(date.examDate).toLocaleDateString("en-US", {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          date.session === 'morning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {date.session.charAt(0).toUpperCase() + date.session.slice(1)}
                        </span>
                      </div>

                      {/* Duty Statistics */}
                      <div className="space-y-3">
                        {/* Exam Duty */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Exam Duty</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {date.examDutyFilled || 0}/{date.examDutyCount || 0}
                            </span>
                            {getRemainingSlots(date.examDutyCount, date.examDutyFilled || 0)}
                          </div>
                        </div>

                        {/* Reliever Duty */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Reliever Duty</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {date.relieverDutyFilled || 0}/{date.relieverDutyCount || 0}
                            </span>
                            {date.relieverDutyCount > 0
                              ? getRemainingSlots(date.relieverDutyCount, date.relieverDutyFilled || 0)
                              : <span className="text-xs text-gray-500">N/A</span>
                            }
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Exam</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the exam <strong>"{examToDelete?.examName}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This will permanently delete the exam and all its associated dates and selections.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setExamToDelete(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExam}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Exam</h3>
                  <p className="text-sm text-gray-600">Modify exam details and dates</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingExam(null);
                  setEditFormData({ examName: '', dueDate: '', examDates: [] });
                  setEditErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name *
                </label>
                <input
                  type="text"
                  value={editFormData.examName}
                  onChange={(e) => handleEditFormChange('examName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    editErrors.examName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter exam name"
                />
                {editErrors.examName && (
                  <p className="text-red-500 text-sm mt-1">{editErrors.examName}</p>
                )}
              </div>

              {/* Exam ID (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam ID (Read-only)
                </label>
                <input
                  type="text"
                  value={editingExam?.examId || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => handleEditFormChange('dueDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    editErrors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {editErrors.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{editErrors.dueDate}</p>
                )}
              </div>

              {/* Exam Dates */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Exam Dates *
                  </label>
                  <button
                    type="button"
                    onClick={addEditExamDate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Date</span>
                  </button>
                </div>

                {editErrors.examDates && (
                  <p className="text-red-500 text-sm mb-4">{editErrors.examDates}</p>
                )}

                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {editFormData.examDates.map((date, index) => (
                    <div key={date.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Date {index + 1}</h4>
                        {editFormData.examDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditExamDate(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Date *
                          </label>
                          <input
                            type="date"
                            value={date.examDate}
                            onChange={(e) => handleEditDateChange(index, 'examDate', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              editErrors[`examDate_${index}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {editErrors[`examDate_${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{editErrors[`examDate_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Exam Duty
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={date.examDutyCount}
                            onChange={(e) => handleEditDateChange(index, 'examDutyCount', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              editErrors[`examDuty_${index}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {editErrors[`examDuty_${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{editErrors[`examDuty_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Reliever Duty
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={date.relieverDutyCount}
                            onChange={(e) => handleEditDateChange(index, 'relieverDutyCount', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              editErrors[`relieverDuty_${index}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {editErrors[`relieverDuty_${index}`] && (
                            <p className="text-red-500 text-xs mt-1">{editErrors[`relieverDuty_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Session
                          </label>
                          <select
                            value={date.session}
                            onChange={(e) => handleEditDateChange(index, 'session', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingExam(null);
                  setEditFormData({ examName: '', dueDate: '', examDates: [] });
                  setEditErrors({});
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExamDates;
