# Examination Duty Allotment System - Mobile App

A React Native mobile application built with Expo and NativeWind (Tailwind CSS) for the Examination Duty Allotment System.

## 🚀 Features

### 📱 Cross-Platform
- **iOS & Android** support via Expo
- **Web** support for development and testing
- **Responsive Design** with NativeWind (Tailwind CSS)

### 🔐 Authentication
- Secure login with JWT tokens
- Forgot password functionality
- Role-based access (Admin/Faculty)
- AsyncStorage for persistent sessions

### 👨‍🏫 Faculty Features
- Personal dashboard with duty statistics
- Exam date selection interface
- View current selections and assignments
- Profile management
- Completed exam history

### 👨‍💼 Admin Features
- Comprehensive admin dashboard
- Faculty management system
- Exam scheduling and management
- Manual duty assignment
- Analytics and reporting
- System overview with statistics

## 🛠️ Technology Stack

- **Framework**: Expo SDK 53
- **UI Library**: React Native with NativeWind
- **Navigation**: React Navigation v7
- **Styling**: Tailwind CSS via NativeWind
- **State Management**: React Hooks + AsyncStorage
- **HTTP Client**: Axios
- **Authentication**: JWT Tokens

## 📦 Installation

### Prerequisites
```bash
# Install Node.js (v18 or higher)
# Install Expo CLI
npm install -g @expo/cli
```

### Setup
```bash
# Clone the repository
cd exam_port

# Install dependencies (already done)
npm install

# Start the development server
npm start
# or
expo start
```

### Development Options
```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

## 🏗️ Project Structure

```
exam_port/
├── src/
│   ├── components/
│   │   ├── AdminDashboard/
│   │   │   └── AdminDashboard.js
│   │   ├── UserDashboard/
│   │   │   └── UserDashboard.js
│   │   ├── ForgotPassword.js
│   │   ├── ResetPassword.js
│   │   ├── Unauthorized.js
│   │   └── UserLogin.js
│   └── services/
│       └── api.js
├── assets/
├── App.js                 # Main app component with navigation
├── babel.config.js        # Babel configuration for NativeWind
├── global.css            # Global Tailwind CSS styles
├── metro.config.js       # Metro bundler configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json
```

## 🎨 Styling with NativeWind

This app uses NativeWind, which brings Tailwind CSS to React Native:

```jsx
// Example usage
<View className="flex-1 bg-white items-center justify-center">
  <Text className="text-lg font-bold text-blue-600">
    Welcome to EDS Mobile!
  </Text>
  <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg mt-4">
    <Text className="text-white font-semibold">Get Started</Text>
  </TouchableOpacity>
</View>
```

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/api.js`:
```javascript
const BASE_URL = 'http://your-backend-url:3000/api/v1';
```

### Tailwind Configuration
Customize colors, fonts, and other design tokens in `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'custom-yellow': '#FFED48',
        primary: { /* ... */ },
      },
    },
  },
};
```

## 📱 Navigation Structure

The app uses React Navigation with the following screens:

- **UserLogin** - Authentication screen
- **ForgotPassword** - Password recovery
- **ResetPassword** - Password reset with token
- **UserDashboard** - Faculty dashboard (role: faculty)
- **AdminDashboard** - Admin dashboard (role: admin)
- **Unauthorized** - Access denied screen

## 🔐 Authentication Flow

1. User enters credentials on login screen
2. App sends request to `/api/v1/auth/login`
3. On success, stores JWT token and user data in AsyncStorage
4. Navigates to appropriate dashboard based on user role
5. API requests include Authorization header with JWT token
6. On token expiry, user is redirected to login

## 🚀 Development

### Adding New Components
1. Create component in appropriate directory under `src/components/`
2. Use NativeWind classes for styling
3. Import and use in navigation or parent components

### API Integration
Use the centralized API service in `src/services/api.js`:
```javascript
import { examAPI, userAPI } from '../services/api';

// Example usage
const fetchExams = async () => {
  try {
    const response = await examAPI.getAllExams();
    setExams(response.data);
  } catch (error) {
    console.error('Error fetching exams:', error);
  }
};
```

## 🔄 State Management

The app uses React hooks for state management:
- `useState` for component state
- `useEffect` for side effects
- `AsyncStorage` for persistent data
- Context API can be added for global state if needed

## 📱 Platform-Specific Features

### iOS
- Native navigation animations
- iOS-style alerts and modals
- Safe area handling

### Android
- Material Design components
- Android-style navigation
- Hardware back button support

### Web
- Responsive design
- Keyboard navigation
- Web-specific optimizations

## 🧪 Testing

```bash
# Run on different platforms for testing
expo start --ios
expo start --android
expo start --web

# Test on physical device
# Scan QR code with Expo Go app
```

## 🚀 Deployment

### Building for Production
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Or use EAS Build (recommended)
eas build --platform all
```

## 📝 Notes

- **Backend Integration**: Ensure your backend server is running on the configured URL
- **CORS**: Backend should allow requests from mobile app origins
- **Network**: For physical device testing, ensure both device and backend are on same network
- **AsyncStorage**: Used for token and user data persistence
- **Navigation**: Uses stack navigation with role-based routing

## 🤝 Contributing

1. Follow the existing code structure
2. Use NativeWind for styling
3. Implement proper error handling
4. Test on multiple platforms
5. Update documentation as needed

## 📄 License

This project is part of the Examination Duty Allotment System for Shree Devi Institute of Technology College.
