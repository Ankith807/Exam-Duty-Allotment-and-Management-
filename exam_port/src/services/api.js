import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_IP, API_PORT } from '@env';

// Base API URL - Uses environment variables for consistency
const BASE_URL = `http://${API_IP}:${API_PORT}/api/v1`;

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // You might want to navigate to login screen here
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  register: (userData) => api.post('/auth/register', userData),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

// Exam API
export const examAPI = {
  getAllExams: () => api.get('/exam/exams-with-dates'),
  getExamById: (id) => api.get(`/exam/exams/${id}`),
  createExam: (examData) => api.post('/exam/exams', examData),
  updateExam: (id, examData) => api.put(`/exam/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/exam/exams/${id}`),
  getCompletedExams: () => api.get('/exam/exams/completed'),
  
  // Selections
  saveExamSelections: (selections) => api.post('/exam/save-selections', selections),
  getUserSelections: (userId) => api.get(`/exam/saved-selections/${userId}`),
  getSelectionsByExam: (examId) => api.get(`/exam/user-selections-by-exam/${examId}`),
  
  // Manual Assignment
  getEligibleUsers: () => api.get('/exam/eligible-users'),
  assignDutyManually: (assignmentData) => api.post('/exam/manual-assign', assignmentData),
  sendExamReminders: (examId) => api.post('/exam/send-exam-selection-reminders', { exam_id: examId }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (days = 30) => api.get(`/analytics/overview?days=${days}`),
  getDepartments: (days = 30) => api.get(`/analytics/departments?days=${days}`),
  getDutyTypes: (days = 30) => api.get(`/analytics/duty-types?days=${days}`),
  getTrends: (days = 90) => api.get(`/analytics/trends?days=${days}`),
  getFacultyWorkload: (days = 30) => api.get(`/analytics/faculty-workload?days=${days}`),
  getExamStats: (days = 30) => api.get(`/analytics/exam-stats?days=${days}`),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return error.response.data?.message || 'Server error occurred';
    } else if (error.request) {
      // Request was made but no response received
      return 'Network error. Please check your connection.';
    } else {
      // Something else happened
      return 'An unexpected error occurred';
    }
  },

  // Format API response
  formatResponse: (response) => {
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },
};

export default api;
