import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Save,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { validateText } from "../../utils/validation";

const SelectExamDates = () => {
  const [originalExamList, setOriginalExamList] = useState([]);
  const [filteredExamList, setFilteredExamList] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [savedSelections, setSavedSelections] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reasonErrors, setReasonErrors] = useState({});
  const rowsPerPage = 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;
        if (!userId) {
          toast.error("User ID not found");
          return;
        }

        setLoading(true);
        toast.info("Loading exam data...");

        const examsRes = await axios.get(
          `http://localhost:3000/api/v1/exam/exams-with-dates?userId=${userId}`
        );

        const savedRes = await axios.get(
          `http://localhost:3000/api/v1/exam/saved-selections/${userId}`
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
        console.error("Error fetching data:", err);
        toast.error(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (originalExamList.length === 0) return;

    const savedExamIds = [...new Set(savedSelections.map((s) => s.exam_id))];
    const filtered = originalExamList.filter(
      (exam) => !savedExamIds.includes(exam.examId)
    );

    setFilteredExamList(filtered);
  }, [originalExamList, savedSelections]);

  const toggleDateSelection = (key, type, session) => {
    setSelectedSlots((prev) => {
      if (type === "Not Available") {
        return {
          ...prev,
          [key]: {
            dutyType: "Not Available",
            session,
            reason: "",
          },
        };
      }

      // If selecting Reliever Duty, check if user already has one for this exam
      if (type === "Reliever Duty") {
        const [currentExamId] = key.split("_");
        
        // Check if user already has a reliever duty for this exam
        const hasRelieverDuty = Object.entries(prev).some(([existingKey, value]) => {
          const [examId] = existingKey.split("_");
          return examId === currentExamId && value?.dutyType === "Reliever Duty";
        });

        // If already has reliever duty and trying to select a different one, remove the existing one
        if (hasRelieverDuty && prev[key]?.dutyType !== "Reliever Duty") {
          const updatedSlots = { ...prev };
          // Remove existing reliever duty for this exam
          Object.keys(updatedSlots).forEach(existingKey => {
            const [examId] = existingKey.split("_");
            if (examId === currentExamId && updatedSlots[existingKey]?.dutyType === "Reliever Duty") {
              delete updatedSlots[existingKey];
            }
          });
          // Add new reliever duty selection
          updatedSlots[key] = { dutyType: type, session };
          return updatedSlots;
        }
      }

      return {
        ...prev,
        [key]:
          prev[key]?.dutyType === type
            ? null
            : {
                dutyType: type,
                session,
              },
      };
    });
  };

  const handleSaveExam = async (examId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    const newSelections = [];

    // Validate selections before processing
    const validationErrors = {};

    Object.entries(selectedSlots).forEach(([key, value]) => {
      if (!value || !value.dutyType) return;

      const [keyExamId, examDate] = key.split("_");

      // Only process selections for this specific exam
      if (keyExamId !== examId) return;

      const { dutyType, session, reason } = value;

      // Validate reason for "Not Available" selections
      if (dutyType === "Not Available") {
        const reasonValidation = validateText(reason, {
          required: true,
          minLength: 10,
          maxLength: 500
        });
        if (!reasonValidation.isValid) {
          validationErrors[key] = reasonValidation.message;
        }
      }

      const isAlreadySaved = savedSelections.some(
        (s) =>
          s.exam_id === examId &&
          new Date(s.exam_date).toLocaleDateString() === examDate
      );

      if (!isAlreadySaved) {
        newSelections.push({
          examId: keyExamId,
          examDate,
          dutyType,
          session,
          reason: reason || "",
        });
      }
    });

    // If there are validation errors, show them and return
    if (Object.keys(validationErrors).length > 0) {
      setReasonErrors(validationErrors);
      toast.error("Please provide valid reasons for all unavailability selections");
      return;
    }

    if (newSelections.length === 0) {
      toast.warning("No new selections to save for this exam");
      return;
    }

    try {
      const saveToast = toast.loading("Saving selections...");

      await axios.post("http://localhost:3000/api/v1/exam/save-selections", {
        userId,
        selections: newSelections,
      });

      const savedRes = await axios.get(
        `http://localhost:3000/api/v1/exam/saved-selections/${userId}`
      );
      setSavedSelections(savedRes.data.data || []);

      // Clear the saved selections from selectedSlots
      const updatedSelectedSlots = { ...selectedSlots };
      newSelections.forEach(selection => {
        const key = `${selection.examId}_${selection.examDate}`;
        delete updatedSelectedSlots[key];
      });
      setSelectedSlots(updatedSelectedSlots);

      toast.update(saveToast, {
        render: "Selections saved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(
        `Failed to save: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handlePageChange = (_, value) => {
    setPage(value);
    toast.dismiss();
  };

  const paginatedExams = filteredExamList.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">Loading exam data...</p>
      </div>
    );
  }

  if (originalExamList.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Available</h3>
        <p className="text-gray-600">There are currently no exams available for selection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Select Exam Dates</h1>
          <p className="text-gray-600 mt-1">Choose your preferred exam duty assignments</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span>{filteredExamList.length} exams available</span>
        </div>
      </div>

      {filteredExamList.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Available Exams</h3>
          <p className="text-yellow-700">All exams have been completed or are not available for selection.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedExams.map((exam, examIndex) => (
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
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg px-3 py-1">
                      <span className="text-sm font-medium">{exam.dates.length} Date{exam.dates.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam Dates */}
              <div className="p-6 space-y-4">
                {exam.dates.map((d, i) => {
                  const dateStr = new Date(d.examDate).toLocaleDateString();
                  const key = `${exam.examId}_${dateStr}`;
                  const selected = selectedSlots[key];
                  const isAlreadySaved = savedSelections.some(
                    (s) =>
                      s.exam_id === exam.examId &&
                      new Date(s.exam_date).toLocaleDateString() === dateStr
                  );

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (examIndex * 0.1) + (i * 0.05) }}
                      className={`border rounded-lg p-4 transition-all ${
                        isAlreadySaved
                          ? 'border-green-300 bg-green-50'
                          : selected?.dutyType
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Date Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Exam Date</label>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(d.examDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Session</label>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              d.session === 'morning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {d.session.charAt(0).toUpperCase() + d.session.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Exam Duties</label>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-900">{d.examDutyCount}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reliever Duties</label>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-900">{d.relieverDutyCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Selection Status */}
                      {isAlreadySaved && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Already selected: {savedSelections.find(s =>
                                s.exam_id === exam.examId &&
                                new Date(s.exam_date).toLocaleDateString() === dateStr
                              )?.duty_type?.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Duty Selection Buttons */}
                      {!isAlreadySaved && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Exam Duty Button */}
                            <button
                              onClick={() => d.examDutyCount > 0 && toggleDateSelection(key, "Exam Duty", d.session)}
                              disabled={d.examDutyCount <= 0}
                              title={d.examDutyCount <= 0 ? "All exam duty slots are filled" : `${d.examDutyCount} exam duty slots available`}
                              className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-lg font-medium transition-all ${
                                d.examDutyCount <= 0
                                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                                  : selected?.dutyType === "Exam Duty"
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4" />
                                <span>Exam Duty</span>
                              </div>
                              <span className="text-xs">
                                {d.examDutyCount > 0
                                  ? `${d.examDutyCount} slot${d.examDutyCount !== 1 ? 's' : ''} available`
                                  : 'Slot Filled'
                                }
                              </span>
                            </button>

                            {/* Reliever Duty Button */}
                            <button
                              onClick={() => d.relieverDutyCount > 0 && toggleDateSelection(key, "Reliever Duty", d.session)}
                              disabled={d.relieverDutyCount <= 0}
                              title={d.relieverDutyCount <= 0 ? "All reliever duty slots are filled" : `${d.relieverDutyCount} reliever duty slots available`}
                              className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-lg font-medium transition-all ${
                                d.relieverDutyCount <= 0
                                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                                  : selected?.dutyType === "Reliever Duty"
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>Reliever Duty</span>
                              </div>
                              <span className="text-xs">
                                {d.relieverDutyCount > 0
                                  ? `${d.relieverDutyCount} slot${d.relieverDutyCount !== 1 ? 's' : ''} available`
                                  : 'Slot Filled'
                                }
                              </span>
                            </button>

                            {/* Not Available Button */}
                            <button
                              onClick={() => toggleDateSelection(key, "Not Available", d.session)}
                              className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-lg font-medium transition-all ${
                                selected?.dutyType === "Not Available"
                                  ? 'bg-red-600 text-white shadow-lg'
                                  : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>Not Available</span>
                              </div>
                              <span className="text-xs">Mark as unavailable</span>
                            </button>
                          </div>

                          {/* Reason Input for Not Available */}
                          {selected?.dutyType === "Not Available" && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for unavailability <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={selected.reason || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSelectedSlots((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      reason: value,
                                    },
                                  }));

                                  // Clear error when user starts typing
                                  setReasonErrors(prev => ({ ...prev, [key]: "" }));

                                  // Validate reason
                                  if (value.trim() && value.trim().length < 10) {
                                    setReasonErrors(prev => ({
                                      ...prev,
                                      [key]: "Please provide a detailed reason (at least 10 characters)"
                                    }));
                                  } else if (value.trim().length > 500) {
                                    setReasonErrors(prev => ({
                                      ...prev,
                                      [key]: "Reason is too long (maximum 500 characters)"
                                    }));
                                  }
                                }}
                                placeholder="Please provide a reason for your unavailability..."
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                                  reasonErrors[key]
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-red-500'
                                }`}
                                rows="3"
                              />
                              {reasonErrors[key] && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-1 text-sm text-red-600 flex items-center"
                                >
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  {reasonErrors[key]}
                                </motion.p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Save Button for this exam */}
                {(() => {
                  const hasUnsavedSelections = exam.dates.some(d => {
                    const dateStr = new Date(d.examDate).toLocaleDateString();
                    const key = `${exam.examId}_${dateStr}`;
                    const selected = selectedSlots[key];
                    const isAlreadySaved = savedSelections.some(
                      (s) =>
                        s.exam_id === exam.examId &&
                        new Date(s.exam_date).toLocaleDateString() === dateStr
                    );
                    return selected?.dutyType && !isAlreadySaved;
                  });

                  const allDatesSaved = exam.dates.every(d => {
                    const dateStr = new Date(d.examDate).toLocaleDateString();
                    return savedSelections.some(
                      (s) =>
                        s.exam_id === exam.examId &&
                        new Date(s.exam_date).toLocaleDateString() === dateStr
                    );
                  });

                  if (allDatesSaved) {
                    return (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-medium">All selections saved for this exam</span>
                        </div>
                      </div>
                    );
                  }

                  if (hasUnsavedSelections) {
                    return (
                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={() => handleSaveExam(exam.examId)}
                          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          <Save className="w-5 h-5" />
                          <span>Save Selections for {exam.examName}</span>
                        </button>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {Math.ceil(filteredExamList.length / rowsPerPage) > 1 && (
            <div className="flex justify-center items-center space-x-4 py-6">
              <button
                onClick={() => handlePageChange(null, Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.ceil(filteredExamList.length / rowsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(null, pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(null, Math.min(Math.ceil(filteredExamList.length / rowsPerPage), page + 1))}
                disabled={page === Math.ceil(filteredExamList.length / rowsPerPage)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}


        </div>
      )}
    </div>
  );
};

export default SelectExamDates;
