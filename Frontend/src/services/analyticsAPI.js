// Mock Analytics API Service
// This file provides mock data for the analytics dashboard
// Replace with actual API calls when backend is ready

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generators
const generateMockData = (days) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  return {
    overview: {
      totalFaculty: Math.floor(Math.random() * 50) + 30,
      totalExams: Math.floor(Math.random() * 15) + 8,
      totalDuties: Math.floor(Math.random() * 200) + 100,
      completedExams: Math.floor(Math.random() * 8) + 5,
      upcomingExams: Math.floor(Math.random() * 7) + 3,
      facultyWithDuties: Math.floor(Math.random() * 40) + 25,
      facultyWithoutDuties: Math.floor(Math.random() * 10) + 3,
      avgDutiesPerFaculty: (Math.random() * 2 + 2.5).toFixed(1)
    },
    
    departmentStats: [
      { department: "Computer Science", faculty: 12, duties: 48, avgDuties: 4.0 },
      { department: "Electronics & Communication", faculty: 10, duties: 35, avgDuties: 3.5 },
      { department: "Mechanical Engineering", faculty: 8, duties: 28, avgDuties: 3.5 },
      { department: "Civil Engineering", faculty: 9, duties: 27, avgDuties: 3.0 },
      { department: "Mathematics", faculty: 6, duties: 18, avgDuties: 3.0 },
      { department: "Physics", faculty: 5, duties: 15, avgDuties: 3.0 }
    ].map(dept => ({
      ...dept,
      duties: dept.duties + Math.floor(Math.random() * 10) - 5,
      avgDuties: (dept.avgDuties + (Math.random() * 0.5 - 0.25)).toFixed(1)
    })),
    
    dutyTypeDistribution: [
      { 
        type: "Exam Duty", 
        count: Math.floor(Math.random() * 50) + 80, 
        percentage: 0 
      },
      { 
        type: "Reliever Duty", 
        count: Math.floor(Math.random() * 30) + 40, 
        percentage: 0 
      }
    ],
    
    monthlyTrends: [
      { month: "Jan", exams: Math.floor(Math.random() * 3) + 1, duties: Math.floor(Math.random() * 20) + 15 },
      { month: "Feb", exams: Math.floor(Math.random() * 4) + 2, duties: Math.floor(Math.random() * 25) + 20 },
      { month: "Mar", exams: Math.floor(Math.random() * 3) + 2, duties: Math.floor(Math.random() * 20) + 18 },
      { month: "Apr", exams: Math.floor(Math.random() * 4) + 2, duties: Math.floor(Math.random() * 30) + 25 },
      { month: "May", exams: Math.floor(Math.random() * 3) + 1, duties: Math.floor(Math.random() * 20) + 15 },
      { month: "Jun", exams: Math.floor(Math.random() * 2) + 1, duties: Math.floor(Math.random() * 15) + 10 }
    ],
    
    facultyWorkload: [
      { name: "Dr. Rajesh Kumar", duties: Math.floor(Math.random() * 3) + 5, department: "CS" },
      { name: "Prof. Priya Sharma", duties: Math.floor(Math.random() * 2) + 4, department: "ECE" },
      { name: "Dr. Amit Singh", duties: Math.floor(Math.random() * 2) + 4, department: "ME" },
      { name: "Prof. Sunita Gupta", duties: Math.floor(Math.random() * 2) + 3, department: "CE" },
      { name: "Dr. Vikram Patel", duties: Math.floor(Math.random() * 2) + 3, department: "Math" },
      { name: "Prof. Neha Agarwal", duties: Math.floor(Math.random() * 2) + 3, department: "Physics" },
      { name: "Dr. Ravi Verma", duties: Math.floor(Math.random() * 2) + 2, department: "CS" },
      { name: "Prof. Kavita Jain", duties: Math.floor(Math.random() * 2) + 2, department: "ECE" }
    ],
    
    examStats: [
      { 
        examName: "Mid Semester Examination", 
        totalDuties: Math.floor(Math.random() * 20) + 35, 
        facultyAssigned: Math.floor(Math.random() * 15) + 25 
      },
      { 
        examName: "End Semester Examination", 
        totalDuties: Math.floor(Math.random() * 30) + 50, 
        facultyAssigned: Math.floor(Math.random() * 20) + 35 
      },
      { 
        examName: "Supplementary Examination", 
        totalDuties: Math.floor(Math.random() * 15) + 15, 
        facultyAssigned: Math.floor(Math.random() * 10) + 12 
      },
      { 
        examName: "Remedial Examination", 
        totalDuties: Math.floor(Math.random() * 10) + 10, 
        facultyAssigned: Math.floor(Math.random() * 8) + 8 
      }
    ]
  };
};

// Calculate percentages for duty type distribution
const calculatePercentages = (data) => {
  const total = data.dutyTypeDistribution.reduce((sum, item) => sum + item.count, 0);
  data.dutyTypeDistribution = data.dutyTypeDistribution.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
  }));
  return data;
};

// Mock API endpoints
export const analyticsAPI = {
  async getOverview(days = 30) {
    await delay(500); // Simulate network delay
    const data = generateMockData(days);
    return { success: true, data: data.overview };
  },

  async getDepartments(days = 30) {
    await delay(400);
    const data = generateMockData(days);
    return { success: true, data: data.departmentStats };
  },

  async getDutyTypes(days = 30) {
    await delay(300);
    const data = calculatePercentages(generateMockData(days));
    return { success: true, data: data.dutyTypeDistribution };
  },

  async getTrends(days = 90) {
    await delay(600);
    const data = generateMockData(days);
    return { success: true, data: data.monthlyTrends };
  },

  async getFacultyWorkload(days = 30) {
    await delay(450);
    const data = generateMockData(days);
    return { success: true, data: data.facultyWorkload };
  },

  async getExamStats(days = 30) {
    await delay(350);
    const data = generateMockData(days);
    return { success: true, data: data.examStats };
  },

  // Convenience method to get all data at once
  async getAllAnalytics(days = 30) {
    await delay(800);
    const data = calculatePercentages(generateMockData(days));
    return {
      success: true,
      data: {
        overview: data.overview,
        departmentStats: data.departmentStats,
        dutyTypeDistribution: data.dutyTypeDistribution,
        monthlyTrends: data.monthlyTrends,
        facultyWorkload: data.facultyWorkload,
        examStats: data.examStats
      }
    };
  }
};

export default analyticsAPI;
