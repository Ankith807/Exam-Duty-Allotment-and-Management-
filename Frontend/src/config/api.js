// API Configuration
// This file contains all API-related configuration

// Environment-based API configuration
const getApiBaseUrl = () => {
  // In Vite, environment variables are available via import.meta.env
  // Check if we're in development, staging, or production
  const environment = import.meta.env.MODE || 'development';

  switch (environment) {
    case 'development':
      return import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    case 'production':
      return import.meta.env.VITE_API_URL || 'https://your-production-api.com/api/v1';
    case 'staging':
      return import.meta.env.VITE_API_URL || 'https://your-staging-api.com/api/v1';
    default:
      return 'http://localhost:3000/api/v1';
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};



// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
    PROTECTED: '/auth/protected',
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
    AVAILABILITY: (userId) => `/users/availability/${userId}`,
    ELIGIBLE: '/users/eligible-users',
    PROFILE_PICTURE: (id) => `/users/user/${id}/profile-picture`,
  },
  
  // Exam endpoints
  EXAMS: {
    BASE: '/exam/exams',
    WITH_DATES: '/exam/exams-with-dates',
    BY_ID: (id) => `/exam/exams/${id}`,
    COMPLETED: '/exam/exams/completed',
    SAVE_SELECTIONS: '/exam/save-selections',
    SAVED_SELECTIONS: (id) => `/exam/saved-selections/${id}`,
    USER_SELECTIONS: (id) => `/exam/user-selections/${id}`,
    USER_SELECTIONS_BY_EXAM: (id) => `/exam/user-selections-by-exam/${id}`,
    MANUAL_ASSIGN: '/exam/manual-assign',
    SEND_REMINDERS: '/exam/send-exam-selection-reminders',
  },
  
  // Analytics endpoints
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    DEPARTMENTS: '/analytics/departments',
    DUTY_TYPES: '/analytics/duty-types',
    TRENDS: '/analytics/trends',
    FACULTY_WORKLOAD: '/analytics/faculty-workload',
    EXAM_STATS: '/analytics/exam-stats',
  },
};

export default API_CONFIG;
