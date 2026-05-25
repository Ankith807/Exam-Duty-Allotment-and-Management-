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
import { ArrowLeft, Mail, Send } from 'lucide-react-native';
import axios from 'axios';
import { API_IP, API_PORT } from '@env';
import { triggerHapticFeedback } from '../utils/mobileUtils';
import { validateEmail } from '../utils/validation';

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleEmailChange = (value) => {
    setEmail(value);

    // Clear previous errors
    setErrors(prev => ({ ...prev, email: "" }));

    // Validate email if user has typed something
    if (value.trim()) {
      const emailValidation = validateEmail(value);
      if (!emailValidation.isValid) {
        setErrors(prev => ({ ...prev, email: emailValidation.message }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      triggerHapticFeedback('error');
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    triggerHapticFeedback('light');
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/auth/forgot-password`, {
        email: email.trim(),
      });

      triggerHapticFeedback('success');
      Alert.alert('Success', response.data.message || 'Password reset link sent to your email!');
      setEmail('');
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
          <Text style={styles.title}>Forgot Password</Text>
        </View>

        {/* Professional Form */}
        <View style={styles.form}>
          <View style={styles.iconContainer}>
            <Mail size={48} color="#3B82F6" />
          </View>

          <Text style={styles.formTitle}>Reset Your Password</Text>
          <Text style={styles.formSubtitle}>
            Enter your email address and we'll send you a secure link to reset your password.
          </Text>

          {/* Email Field with Icon */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
              <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Modern Submit Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (loading || Object.values(errors).some(error => error !== '')) && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading || Object.values(errors).some(error => error !== '')}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={18} color="white" />
              )}
              <Text style={styles.buttonText}>
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
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
          <Text style={styles.footer}>Shree Devi Institute of Technology</Text>
          <Text style={styles.footerSub}>Secure Password Recovery</Text>
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
    backgroundColor: '#EFF6FF',
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backToLoginButton: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    minHeight: 56,
  },
  backToLoginText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
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
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputError: {
    color: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default ForgotPassword;
