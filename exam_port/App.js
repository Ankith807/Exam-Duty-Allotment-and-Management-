import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import './global.css';

// Import screens
import UserLogin from './src/components/UserLogin';
import ForgotPassword from './src/components/ForgotPassword';
import ResetPassword from './src/components/ResetPassword';
import UserDashboard from './src/components/UserDashboard/UserDashboard';
import AdminDashboard from './src/components/AdminDashboard/AdminDashboard';
import Unauthorized from './src/components/Unauthorized';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#3B82F6" />
      <Stack.Navigator
        initialRouteName="UserLogin"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3B82F6',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="UserLogin"
          component={UserLogin}
          options={{
            title: 'Login',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ title: 'Forgot Password' }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{ title: 'Reset Password' }}
        />
        <Stack.Screen
          name="UserDashboard"
          component={UserDashboard}
          options={{
            title: 'Faculty Dashboard',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            title: 'Admin Dashboard',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Unauthorized"
          component={Unauthorized}
          options={{ title: 'Unauthorized' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
