import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { analyticsAPI } from "../../services/api";

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalFaculty: 0,
      totalExams: 0,
      totalDuties: 0,
      completedExams: 0,
      upcomingExams: 0,
      facultyWithDuties: 0,
      facultyWithoutDuties: 0,
      avgDutiesPerFaculty: 0
    },
    departmentStats: [],
    dutyTypeDistribution: [],
    monthlyTrends: [],
    facultyWorkload: [],
    examStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from your backend API endpoints
      const [overview, departments, dutyTypes, trends, workload, exams] = await Promise.all([
        analyticsAPI.getOverview(selectedTimeRange),
        analyticsAPI.getDepartments(selectedTimeRange),
        analyticsAPI.getDutyTypes(selectedTimeRange),
        analyticsAPI.getTrends(selectedTimeRange),
        analyticsAPI.getFacultyWorkload(selectedTimeRange),
        analyticsAPI.getExamStats(selectedTimeRange)
      ]);

      setAnalyticsData({
        overview: overview.data.data,
        departmentStats: departments.data.data,
        dutyTypeDistribution: dutyTypes.data.data,
        monthlyTrends: trends.data.data,
        facultyWorkload: workload.data.data,
        examStats: exams.data.data
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to load analytics data from backend. Using fallback data.");

      // Fallback to mock data if backend is not available
      try {
        const response = await analyticsAPI.getAllAnalytics(selectedTimeRange);
        setAnalyticsData(response.data);
      } catch (mockError) {
        console.error("Mock API also failed:", mockError);
        // Use hardcoded fallback data as last resort
        setAnalyticsData({
          overview: {
            totalFaculty: 0,
            totalExams: 0,
            totalDuties: 0,
            completedExams: 0,
            upcomingExams: 0,
            facultyWithDuties: 0,
            facultyWithoutDuties: 0,
            avgDutiesPerFaculty: 0
          },
          departmentStats: [],
          dutyTypeDistribution: [],
          monthlyTrends: [],
          facultyWorkload: [],
          examStats: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Comprehensive insights into examination duty management</p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Last Updated */}
                {lastUpdated && (
                  <div className="text-sm text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Refresh Button */}
                <button
                  onClick={fetchAnalyticsData}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-white border border-gray-300 rounded-xl px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm">Refresh</span>
                </button>

                {/* Time Range Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Time Range:</label>
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Faculty"
            value={analyticsData.overview.totalFaculty}
            icon="👥"
            color="from-blue-500 to-blue-600"
            subtitle={`${analyticsData.overview.facultyWithDuties} with duties`}
          />
          <StatCard
            title="Total Exams"
            value={analyticsData.overview.totalExams}
            icon="📝"
            color="from-green-500 to-green-600"
            subtitle={`${analyticsData.overview.upcomingExams} upcoming`}
          />
          <StatCard
            title="Total Duties"
            value={analyticsData.overview.totalDuties}
            icon="📋"
            color="from-purple-500 to-purple-600"
            subtitle={`${analyticsData.overview.avgDutiesPerFaculty} avg per faculty`}
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Statistics */}
          <DepartmentChart data={analyticsData.departmentStats} />

          {/* Duty Type Distribution */}
          <DutyTypeChart data={analyticsData.dutyTypeDistribution} />
        </div>

        {/* Monthly Trends */}
        <div className="mb-8">
          <MonthlyTrendsChart data={analyticsData.monthlyTrends} />
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Faculty Workload */}
          <FacultyWorkloadChart data={analyticsData.facultyWorkload} />

          {/* Exam Statistics */}
          <ExamStatsChart data={analyticsData.examStats} />
        </div>

        {/* Quick Insights */}
        <QuickInsights data={analyticsData} />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <motion.div
    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// Department Chart Component
const DepartmentChart = ({ data = [] }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900">Department Statistics</h3>
    </div>

    {data.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No department data available</p>
      </div>
    ) : (
      <div className="space-y-4">
        {data.map((dept, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">{dept.department}</span>
              <span className="text-sm text-gray-600">{dept.duties} duties</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(dept.duties / Math.max(...data.map(d => d.duties))) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{dept.faculty} faculty</span>
              <span>{dept.avgDuties} avg duties</span>
            </div>
          </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Duty Type Chart Component
const DutyTypeChart = ({ data = [] }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900">Duty Type Distribution</h3>
    </div>

    {data.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No duty type data available</p>
      </div>
    ) : (
      <>
        <div className="space-y-6">
          {data.map((item, index) => (
        <div key={index} className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">{item.type}</span>
            <span className="text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
              style={{ width: `${item.percentage}%` }}
            ></div>
          </div>
            </div>
          ))}
        </div>

        {/* Pie Chart Representation */}
        <div className="mt-6 flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray={`${data[0]?.percentage || 0}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900">{data[0]?.percentage || 0}%</span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);

// Faculty Workload Chart Component
const FacultyWorkloadChart = ({ data = [] }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900">Top Faculty Workload</h3>
    </div>

    {data.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No faculty workload data available</p>
      </div>
    ) : (
      <div className="space-y-4">
        {data.map((faculty, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{faculty.name}</p>
                <p className="text-xs text-gray-500">{faculty.department}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">{faculty.duties}</p>
                <p className="text-xs text-gray-500">duties</p>
              </div>
            </div>
          </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Exam Stats Chart Component
const ExamStatsChart = ({ data = [] }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900">Exam Statistics</h3>
    </div>

    {data.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No exam statistics available</p>
      </div>
    ) : (
      <div className="space-y-4">
        {data.map((exam, index) => (
        <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">{exam.examName}</h4>
            <span className="text-sm text-gray-600">{exam.totalDuties} duties</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Faculty Assigned: {exam.facultyAssigned}</span>
            <span className="text-green-600 font-medium">
              {Math.round((exam.facultyAssigned / exam.totalDuties) * 100)}% coverage
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(exam.facultyAssigned / exam.totalDuties) * 100}%` }}
            ></div>
          </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Quick Insights Component
const QuickInsights = ({ data }) => {
  const insights = [];

  // Generate insights based on data
  if (data.overview.facultyWithoutDuties > 0) {
    insights.push({
      type: "warning",
      message: `${data.overview.facultyWithoutDuties} faculty members have no duties assigned`,
      icon: "⚠️"
    });
  }

  if (data.overview.avgDutiesPerFaculty > 4) {
    insights.push({
      type: "info",
      message: `High workload detected: ${data.overview.avgDutiesPerFaculty} average duties per faculty`,
      icon: "📊"
    });
  }

  const completionRate = (data.overview.completedExams / data.overview.totalExams) * 100;
  if (completionRate > 80) {
    insights.push({
      type: "success",
      message: `Excellent completion rate: ${Math.round(completionRate)}% of exams completed`,
      icon: "✅"
    });
  }

  if (data.departmentStats.length > 0) {
    const topDept = data.departmentStats.reduce((prev, current) =>
      (prev.duties > current.duties) ? prev : current
    );
    insights.push({
      type: "info",
      message: `${topDept.department} department has the highest duty load with ${topDept.duties} duties`,
      icon: "🏆"
    });
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Quick Insights</h3>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No insights available at this time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 ${
                insight.type === 'success' ? 'bg-green-50 border-green-500' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{insight.icon}</span>
                <p className="text-sm text-gray-700 font-medium">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Monthly Trends Chart Component
const MonthlyTrendsChart = ({ data = [] }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900">Monthly Trends</h3>
    </div>

    {data.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No trend data available</p>
      </div>
    ) : (
      <div className="space-y-4">
        {/* Chart Header */}
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
          <div>Month</div>
          <div className="text-center">Exams</div>
          <div className="text-center">Duties</div>
        </div>

        {/* Chart Data */}
        {data.map((item, index) => {
          const maxDuties = Math.max(...data.map(d => d.duties));
          const maxExams = Math.max(...data.map(d => d.exams));

          return (
            <div key={index} className="grid grid-cols-3 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg px-2">
              <div className="font-semibold text-gray-900">{item.month}</div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.exams / maxExams) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-blue-600 w-8">{item.exams}</span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.duties / maxDuties) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-green-600 w-8">{item.duties}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex justify-center space-x-6 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Exams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Duties</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default AnalyticsDashboard;
