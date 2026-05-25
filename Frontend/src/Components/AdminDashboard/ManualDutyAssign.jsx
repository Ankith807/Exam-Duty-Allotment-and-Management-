import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManualDutyAssign = () => {

  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [session, setSession] = useState("");
  const [dutyType, setDutyType] = useState("Exam Duty");
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/exam/exams-with-dates"
        );
        setExams(res.data);
      } catch (err) {
        console.error("Error loading exams:", err);
        toast.error("Failed to load exams");
      }
    };

    fetchExams();
  }, []);

  const fetchEligibleUsers = async () => {
    if (!examId || !examDate || !session) {
      toast.warn("Please fill all fields");
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:3000/api/v1/exam/eligible-users",
        {
          params: { examId, examDate, session },
        }
      );
      setEligibleUsers(res.data.eligibleUsers || []);
      toast.success("Eligible users loaded");
    } catch (err) {
      toast.error("Failed to fetch users");
      console.error(err);
    }
  };

  const assignDuty = async () => {
    if (!selectedUser || !dutyType || !examId || !examDate || !session) {
      toast.warn("All fields are required");
      return;
    }
  
    try {
      await axios.post("http://localhost:3000/api/v1/exam/manual-assign", {
        userId: selectedUser,
        examId,
        examDate,
        session,
        dutyType,
      });
  
      toast.success("Duty assigned successfully!");
      setSelectedUser("");
  
      //  Reload eligible users after assigning
      fetchEligibleUsers();
  
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Assignment failed"
      );
      console.error(err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToastContainer theme="light" position="top-right" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Manual Duty Assignment
                </h1>
                <p className="text-gray-600 mt-1">Assign examination duties to faculty members manually</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Assignment Form</h3>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Exam Selection Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Examination Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
                    <select
                      value={examId}
                      onChange={(e) => {
                        setExamId(e.target.value);
                        setExamDate("");
                        setSession("");
                        setEligibleUsers([]);
                      }}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <option value="">Choose an exam...</option>
                      {exams.map((exam) => (
                        <option key={exam.examId} value={exam.examId}>
                          {exam.examName} ({exam.examId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                    <select
                      value={examDate}
                      onChange={(e) => {
                        const selected = exams
                          .find((exam) => exam.examId === examId)
                          ?.dates.find((d) => d.examDate === e.target.value);
                        setExamDate(e.target.value);
                        setSession(selected?.session || "");
                        setEligibleUsers([]);
                      }}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      disabled={!examId}
                    >
                      <option value="">Choose a date...</option>
                      {exams
                        .find((exam) => exam.examId === examId)
                        ?.dates.map((date, idx) => (
                          <option key={idx} value={date.examDate}>
                            {new Date(date.examDate).toLocaleDateString("en-GB")} ({date.session})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={session}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-600 cursor-not-allowed"
                        placeholder="Auto-filled"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duty Type & Load Users Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Duty Configuration</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duty Type</label>
                    <select
                      value={dutyType}
                      onChange={(e) => setDutyType(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <option value="Exam Duty">Exam Duty</option>
                      <option value="Reliever Duty">Reliever Duty</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={fetchEligibleUsers}
                      disabled={!examId || !examDate || !session}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Load Eligible Users</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* User Selection & Assignment Section */}
              {eligibleUsers.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Faculty Assignment</h4>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      {eligibleUsers.length} eligible
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Faculty Member</label>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <option value="">Choose a faculty member...</option>
                        {eligibleUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} - ({user.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={assignDuty}
                        disabled={!selectedUser}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Assign Duty</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualDutyAssign;
