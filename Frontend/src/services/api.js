import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access, but NOT for login requests
      if (error.config && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);


// Auth API
export const authAPI = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  forgotPassword: (email) => api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (token, newPassword) => api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword }),
  verifyResetToken: (token) => api.get(`${API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN}/${token}`),
};

// User API
export const userAPI = {
  // Get all users with optional filters
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append('role', params.role);
    if (params.department) queryParams.append('department', params.department);

    const queryString = queryParams.toString();
    return api.get(`${API_ENDPOINTS.USERS.BASE}${queryString ? `?${queryString}` : ''}`);
  },

  // Get user by ID
  getUserById: (id) => api.get(API_ENDPOINTS.USERS.BY_ID(id)),

  // Create new user
  createUser: (userData) => api.post(API_ENDPOINTS.USERS.BASE, userData),

  // Update user
  updateUser: (id, userData) => api.put(API_ENDPOINTS.USERS.BY_ID(id), userData),

  // Delete user
  deleteUser: (id) => api.delete(API_ENDPOINTS.USERS.BY_ID(id)),

  // Update user role
  updateUserRole: (id, role) => api.put(API_ENDPOINTS.USERS.UPDATE_ROLE(id), { role }),

  // Get user availability
  getUserAvailability: (userId) => api.get(API_ENDPOINTS.USERS.AVAILABILITY(userId)),

  // Get eligible users for exam
  getEligibleUsers: () => api.get(API_ENDPOINTS.USERS.ELIGIBLE),

  // Profile picture endpoints
  updateProfilePicture: (id, formData) => {
    return api.put(API_ENDPOINTS.USERS.PROFILE_PICTURE(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getProfilePicture: (id) => api.get(API_ENDPOINTS.USERS.PROFILE_PICTURE(id)),
};

// Exam API
export const examAPI = {
  // Get all exams with dates
  getAllExams: () => api.get(API_ENDPOINTS.EXAMS.WITH_DATES),

  // Get exam by ID
  getExamById: (id) => api.get(API_ENDPOINTS.EXAMS.BY_ID(id)),

  // Create new exam
  createExam: (examData) => api.post(API_ENDPOINTS.EXAMS.BASE, examData),

  // Update exam
  updateExam: (id, examData) => api.put(API_ENDPOINTS.EXAMS.BY_ID(id), examData),

  // Delete exam
  deleteExam: (id) => api.delete(API_ENDPOINTS.EXAMS.BY_ID(id)),

  // Get completed exams
  getCompletedExams: () => api.get(API_ENDPOINTS.EXAMS.COMPLETED),

  // Exam selections
  saveExamSelections: (selections) => api.post(API_ENDPOINTS.EXAMS.SAVE_SELECTIONS, selections),
  getUserSelections: (userId) => api.get(API_ENDPOINTS.EXAMS.SAVED_SELECTIONS(userId)),
  getSelectionsByExam: (examId) => api.get(API_ENDPOINTS.EXAMS.USER_SELECTIONS_BY_EXAM(examId)),

  // Manual duty assignment
  manualAssign: (assignmentData) => api.post(API_ENDPOINTS.EXAMS.MANUAL_ASSIGN, assignmentData),

  // Send reminders
  sendExamSelectionReminders: (examId) => api.post(API_ENDPOINTS.EXAMS.SEND_REMINDERS, { exam_id: examId }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (days = 30) => api.get(`${API_ENDPOINTS.ANALYTICS.OVERVIEW}?days=${days}`),
  getDepartments: (days = 30) => api.get(`${API_ENDPOINTS.ANALYTICS.DEPARTMENTS}?days=${days}`),
  getDutyTypes: (days = 30) => api.get(`${API_ENDPOINTS.ANALYTICS.DUTY_TYPES}?days=${days}`),
  getTrends: (days = 90) => api.get(`${API_ENDPOINTS.ANALYTICS.TRENDS}?days=${days}`),
  getFacultyWorkload: (days = 30) => api.get(`${API_ENDPOINTS.ANALYTICS.FACULTY_WORKLOAD}?days=${days}`),
  getExamStats: (days = 30) => api.get(`${API_ENDPOINTS.ANALYTICS.EXAM_STATS}?days=${days}`),
};

export default api;
