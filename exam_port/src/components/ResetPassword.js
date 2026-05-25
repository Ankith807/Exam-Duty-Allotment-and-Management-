import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react-native';
import axios from 'axios';
import { API_IP, API_PORT } from '@env';
import { triggerHapticFeedback } from '../utils/mobileUtils';

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const ResetPassword = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = route?.params?.token || '';

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      triggerHapticFeedback('error');
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      triggerHapticFeedback('error');
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      triggerHapticFeedback('error');
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    triggerHapticFeedback('light');
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/auth/reset-password`, {
        token,
        newPassword: password,
      });

      triggerHapticFeedback('success');
      Alert.alert('Success', response.data.message || 'Password updated successfully!', [
        {
          text: 'Continue to Login',
          onPress: () => navigation.navigate('UserLogin'),
        },
      ]);
    } catch (error) {
      triggerHapticFeedback('error');
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const hasMinLength = password.length >= 6;
    const hasMatch = password === confirmPassword && password.length > 0;
    return { hasMinLength, hasMatch };
  };

  const { hasMinLength, hasMatch } = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              triggerHapticFeedback('light');
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.title}>Reset Password</Text>
        </View>

        {/* Professional Form */}
        <View style={styles.form}>
          <View style={styles.iconContainer}>
            <Shield size={48} color="#10B981" />
          </View>

          <Text style={styles.formTitle}>Create New Password</Text>
          <Text style={styles.formSubtitle}>
            Choose a strong password to secure your account.
          </Text>

          {/* New Password Field with Toggle */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  setShowPassword(!showPassword);
                }}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Field with Toggle */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                style={styles.eyeButton}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Modern Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <CheckCircle
                  size={16}
                  color={hasMinLength ? "#10B981" : "#9CA3AF"}
                />
                <Text style={[
                  styles.requirementText,
                  hasMinLength && styles.requirementMet
                ]}>
                  At least 6 characters long
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <CheckCircle
                  size={16}
                  color={hasMatch ? "#10B981" : "#9CA3AF"}
                />
                <Text style={[
                  styles.requirementText,
                  hasMatch && styles.requirementMet
                ]}>
                  Passwords match
                </Text>
              </View>
            </View>
          </View>

          {/* Modern Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Shield size={18} color="white" />
              )}
              <Text style={styles.buttonText}>
                {loading ? 'Updating Password...' : 'Update Password'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => {
              triggerHapticFeedback('light');
              navigation.navigate('UserLogin');
            }}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        {/* Professional Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footer}></Text>
          <Text style={styles.footerSub}>Secure Password Reset</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    marginRight: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#ECFDF5',
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1f2937',
  },
  requirementsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  requirementMet: {
    color: '#10B981',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footer: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSub: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default ResetPassword;
