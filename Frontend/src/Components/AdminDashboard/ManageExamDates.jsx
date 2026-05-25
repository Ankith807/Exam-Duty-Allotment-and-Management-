import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Save, Trash2, Edit3, Plus, AlertCircle } from "lucide-react";
import {
  validateExamId,
  validateText,
  validateDate,
  validateNumber
} from "../../utils/validation";

const ManageExamDates = () => {

  const [examDetails, setExamDetails] = useState({
    examId: "",
    examName: "",
    dueDate: "",
    examDates: [],
  });

  const [newExamRow, setNewExamRow] = useState({
    examDate: "",
    examDuty: "",
    relieverDuty: "",
    session: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const today = new Date();
  const formatDate = (date) => date.toISOString().split("T")[0];
  const minExamDate = formatDate(new Date(today.setDate(today.getDate() + 5)));

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear errors when user starts typing
    if (["examId", "examName", "dueDate"].includes(name)) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    } else {
      setRowErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "session") {
      setNewExamRow((prevState) => ({ ...prevState, session: value }));
      return;
    }

    if (["examId", "examName", "dueDate"].includes(name)) {
      setExamDetails((prevState) => ({ ...prevState, [name]: value }));
      // Real-time validation for exam details
      validateExamField(name, value);
    } else {
      setNewExamRow((prevState) => ({ ...prevState, [name]: value }));
      // Real-time validation for row fields
      validateRowField(name, value);
    }
  };

  const validateExamField = (fieldName, value) => {
    let validation;

    switch (fieldName) {
      case 'examId':
        validation = validateExamId(value);
        break;
      case 'examName':
        validation = validateText(value, { minLength: 3, maxLength: 100 });
        break;
      case 'dueDate':
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 365); // Max 1 year from now
        validation = validateDate(value, {
          required: true,
          minDate: today.toISOString().split('T')[0],
          maxDate: maxDate.toISOString().split('T')[0]
        });
        break;
      default:
        return;
    }

    if (!validation.isValid && value.trim()) {
      setErrors(prev => ({ ...prev, [fieldName]: validation.message }));
    }
  };

  const validateRowField = (fieldName, value) => {
    let validation;

    switch (fieldName) {
      case 'examDate':
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 5);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 365);
        validation = validateDate(value, {
          required: true,
          minDate: minDate.toISOString().split('T')[0],
          maxDate: maxDate.toISOString().split('T')[0]
        });
        break;
      case 'examDuty':
      case 'relieverDuty':
        validation = validateNumber(value, {
          required: true,
          min: 1,
          max: 100,
          integer: true,
          positive: true
        });
        break;
      default:
        return;
    }

    if (!validation.isValid && value.trim()) {
      setRowErrors(prev => ({ ...prev, [fieldName]: validation.message }));
    }
  };

  const validateRow = () => {
    const { examDate, examDuty, relieverDuty, session } = newExamRow;
    const newRowErrors = {};

    // Validate exam date
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 5);
    const dateValidation = validateDate(examDate, {
      required: true,
      minDate: minDate.toISOString().split('T')[0]
    });
    if (!dateValidation.isValid) {
      newRowErrors.examDate = dateValidation.message;
    }

    // Validate exam duty count
    const examDutyValidation = validateNumber(examDuty, {
      required: true,
      min: 1,
      max: 100,
      integer: true,
      positive: true
    });
    if (!examDutyValidation.isValid) {
      newRowErrors.examDuty = examDutyValidation.message;
    }

    // Validate reliever duty count
    const relieverDutyValidation = validateNumber(relieverDuty, {
      required: true,
      min: 1,
      max: 100,
      integer: true,
      positive: true
    });
    if (!relieverDutyValidation.isValid) {
      newRowErrors.relieverDuty = relieverDutyValidation.message;
    }

    // Validate session
    if (!session) {
      newRowErrors.session = "Session is required";
    }

    setRowErrors(newRowErrors);

    if (Object.keys(newRowErrors).length > 0) {
      toast.error("Please fix the errors before adding the row.");
      return false;
    }

    return true;
  };

  const handleAddRow = (e) => {
    e.preventDefault();
    if (!validateRow()) return;

    setExamDetails((prevState) => ({
      ...prevState,
      examDates: [...prevState.examDates, newExamRow],
    }));

    setNewExamRow({
      examDate: "",
      examDuty: "",
      relieverDuty: "",
      session: "",
    });
    toast.success("Exam date added successfully!");
  };

  const validateExamDetails = () => {
    const { examId, examName, dueDate, examDates } = examDetails;
    const newErrors = {};

    // Validate exam ID
    const examIdValidation = validateExamId(examId);
    if (!examIdValidation.isValid) {
      newErrors.examId = examIdValidation.message;
    }

    // Validate exam name
    const examNameValidation = validateText(examName, { minLength: 3, maxLength: 100 });
    if (!examNameValidation.isValid) {
      newErrors.examName = examNameValidation.message;
    }

    // Validate due date
    const today = new Date();
    const dueDateValidation = validateDate(dueDate, {
      required: true,
      minDate: today.toISOString().split('T')[0]
    });
    if (!dueDateValidation.isValid) {
      newErrors.dueDate = dueDateValidation.message;
    }

    // Check if exam dates exist
    if (examDates.length === 0) {
      toast.error("Please add at least one exam date before saving.");
      setErrors(newErrors);
      return false;
    }

    // Validate due date is before earliest exam date
    if (dueDate && examDates.length > 0) {
      const dueDateObj = new Date(dueDate);
      const earliestExamDate = new Date(
        Math.min(...examDates.map((d) => new Date(d.examDate)))
      );
      const latestAllowedDue = new Date(earliestExamDate);
      latestAllowedDue.setDate(latestAllowedDue.getDate() - 2);

      if (dueDateObj > latestAllowedDue) {
        newErrors.dueDate = `Due Date should be at least 2 days before the first exam date (${formatDate(latestAllowedDue)})`;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors before saving.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateExamDetails()) return;
    setIsSubmitting(true);
    const saveToast = toast.loading("Saving exam details...");

    try {
      await axios.post("http://localhost:3000/api/v1/exam/exams", examDetails);
      toast.update(saveToast, {
        render: "Exam details saved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error saving exam details:", error);
      toast.update(saveToast, {
        render: error.response?.data?.message || "Failed to save exam details.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setExamDetails({ examId: "", examName: "", dueDate: "", examDates: [] });
    setNewExamRow({
      examDate: "",
      examDuty: "",
      relieverDuty: "",
      session: "",
    });
    toast.info("Form cleared successfully.");
  };

  const handleEditDate = (index) => {
    const row = examDetails.examDates[index];
    setNewExamRow(row);
    const updatedRows = examDetails.examDates.filter((_, idx) => idx !== index);
    setExamDetails((prevState) => ({ ...prevState, examDates: updatedRows }));
    toast.info("Exam date ready for editing.");
  };

  const handleDeleteDate = (index) => {
    const updatedRows = examDetails.examDates.filter((_, idx) => idx !== index);
    setExamDetails((prevState) => ({ ...prevState, examDates: updatedRows }));
    toast.success("Exam date removed successfully.");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Exam Details</h1>
          <p className="text-gray-600">Create and configure examination schedules with duty assignments</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Exam Basic Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="examId"
                  placeholder="Enter exam ID (e.g., MID-2024-01)"
                  value={examDetails.examId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.examId
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.examId && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.examId}
                  </motion.p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="examName"
                  placeholder="Enter exam name"
                  value={examDetails.examName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.examName
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.examName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.examName}
                  </motion.p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  min={formatDate(new Date())}
                  value={examDetails.dueDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.dueDate
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.dueDate && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.dueDate}
                  </motion.p>
                )}
              </div>
            </div>
          </div>

          {/* Add Exam Dates Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Plus className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Add Exam Dates</h2>
            </div>

            <form onSubmit={handleAddRow} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="examDate"
                    min={minExamDate}
                    value={newExamRow.examDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Duties <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="examDuty"
                    min="1"
                    placeholder="Number of exam duties"
                    value={newExamRow.examDuty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reliever Duties <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="relieverDuty"
                    min="1"
                    placeholder="Number of reliever duties"
                    value={newExamRow.relieverDuty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="session"
                    value={newExamRow.session}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="" disabled>Select Session</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Exam Date</span>
                </button>
              </div>
            </form>
          </div>

          {/* Added Exam Dates Table */}
          {examDetails.examDates.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Added Exam Dates</h2>
                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {examDetails.examDates.length} {examDetails.examDates.length === 1 ? 'date' : 'dates'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Exam Duties</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Reliever Duties</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Session</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {examDetails.examDates.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(row.examDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span>{row.examDuty}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-green-500" />
                            <span>{row.relieverDuty}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.session === 'morning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {row.session.charAt(0).toUpperCase() + row.session.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditDate(index)}
                              className="inline-flex items-center space-x-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDate(index)}
                              className="inline-flex items-center space-x-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                onClick={handleClear}
                className="inline-flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Form</span>
              </button>

              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || examDetails.examDates.length === 0}
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Saving..." : "Save Exam"}</span>
              </button>
            </div>

            {examDetails.examDates.length === 0 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Add at least one exam date before saving
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageExamDates;
