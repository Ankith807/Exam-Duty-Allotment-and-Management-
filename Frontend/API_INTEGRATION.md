# API Integration Guide

## Overview
This document describes the API integration setup for the Frontend application, specifically focusing on the ManageFaculty component and other admin dashboard features.

## Changes Made

### 1. Created Centralized API Service (`src/services/api.js`)
- Centralized all API calls in a single service file
- Added axios interceptors for authentication and error handling
- Implemented proper error handling and token management
- Organized API calls by feature (auth, users, exams, analytics)

### 2. Created API Configuration (`src/config/api.js`)
- Environment-based API URL configuration
- Centralized endpoint definitions
- Easy to maintain and update API endpoints

### 3. Updated Components
The following components were updated to use the new API service:

#### ManageFaculty Component (`src/Components/AdminDashboard/ManageFaculty.jsx`)
- **Before**: Used hardcoded `axios.get("http://localhost:3000/api/v1/users")`
- **After**: Uses `userAPI.getAllUsers()` from the centralized service
- **Benefits**: 
  - Environment-aware API URLs
  - Consistent error handling
  - Automatic token management
  - Better maintainability

#### Other Updated Components:
- `AddFaculty.jsx` - Now uses `authAPI.register()`
- `UserLogin.jsx` - Now uses `authAPI.login()`
- `AnalyticsDashboard.jsx` - Now uses `analyticsAPI.*` methods
- `Avatar.jsx` - Now uses `userAPI.getProfilePicture()`
- `Completed_Exams.jsx` - Now uses `examAPI.getCompletedExams()`

## API Endpoints

### User Management
- `GET /api/v1/users` - Get all users (with optional filters)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PUT /api/v1/users/:id/role` - Update user role

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password

### Exams
- `GET /api/v1/exam/exams-with-dates` - Get all exams with dates
- `GET /api/v1/exam/exams/:id` - Get exam by ID
- `POST /api/v1/exam/exams` - Create new exam
- `PUT /api/v1/exam/exams/:id` - Update exam
- `DELETE /api/v1/exam/exams/:id` - Delete exam

### Analytics
- `GET /api/v1/analytics/overview` - Get analytics overview
- `GET /api/v1/analytics/departments` - Get department statistics
- `GET /api/v1/analytics/faculty-workload` - Get faculty workload data

## Environment Configuration

### Setup
1. Copy `.env.example` to `.env`
2. Update the `VITE_API_URL` to match your server configuration

### Example `.env` file:
```
VITE_API_URL=http://localhost:3000/api/v1
```

**Note**: Vite uses `VITE_` prefix for environment variables that should be exposed to the client-side code.

### Different Environments:
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://your-production-api.com/api/v1`
- **Staging**: `https://your-staging-api.com/api/v1`

## Usage Examples

### Using the User API
```javascript
import { userAPI } from '../services/api';

// Get all faculty members
const fetchFaculty = async () => {
  try {
    const response = await userAPI.getAllUsers({ role: 'faculty' });
    setFacultyList(response.data.data);
  } catch (error) {
    console.error('Error fetching faculty:', error);
  }
};

// Update a user
const updateUser = async (id, userData) => {
  try {
    await userAPI.updateUser(id, userData);
    console.log('User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
  }
};
```

### Using the Auth API
```javascript
import { authAPI } from '../services/api';

// Login
const login = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    localStorage.setItem('token', response.data.token);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## Error Handling
The API service includes automatic error handling:
- **401 Unauthorized**: Automatically redirects to login page
- **Network errors**: Proper error messages displayed
- **Token management**: Automatic token attachment to requests

## Benefits of This Approach
1. **Maintainability**: All API calls in one place
2. **Consistency**: Standardized error handling and request format
3. **Environment Flexibility**: Easy to switch between dev/staging/production
4. **Security**: Automatic token management
5. **Type Safety**: Clear API method signatures
6. **Debugging**: Centralized logging and error tracking

## Future Improvements
1. Add request/response logging for debugging
2. Implement request caching for better performance
3. Add retry logic for failed requests
4. Implement request cancellation for component unmounting
5. Add TypeScript definitions for better type safety
