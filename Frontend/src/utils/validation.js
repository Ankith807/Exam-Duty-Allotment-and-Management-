/**
 * Comprehensive Validation Utility Library
 * Provides reusable validation functions for the entire application
 */

// Email validation with comprehensive regex
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  
  if (email.length > 254) {
    return { isValid: false, message: "Email address is too long" };
  }
  
  return { isValid: true, message: "" };
};

// Password validation with strength requirements
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false,
    maxLength = 128
  } = options;

  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long` };
  }

  if (password.length > maxLength) {
    return { isValid: false, message: `Password must be less than ${maxLength} characters` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }

  if (requireNumbers && !/\d/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }

  return { isValid: true, message: "" };
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" };
  }

  return { isValid: true, message: "" };
};

// Phone number validation (supports multiple formats)
export const validatePhone = (phone, options = {}) => {
  const { country = 'IN', required = true } = options;
  
  if (!phone && !required) {
    return { isValid: true, message: "" };
  }
  
  if (!phone) {
    return { isValid: false, message: "Phone number is required" };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Indian phone number validation (10 digits, starting with 6-9)
  if (country === 'IN') {
    if (cleanPhone.length !== 10) {
      return { isValid: false, message: "Please enter a valid 10-digit phone number" };
    }
    
    if (!/^[6-9]/.test(cleanPhone)) {
      return { isValid: false, message: "Phone number must start with 6, 7, 8, or 9" };
    }
  }
  
  // US phone number validation (10 digits)
  if (country === 'US') {
    if (cleanPhone.length !== 10) {
      return { isValid: false, message: "Please enter a valid 10-digit phone number" };
    }
  }

  return { isValid: true, message: "" };
};

// Name validation
export const validateName = (name, options = {}) => {
  const { minLength = 2, maxLength = 50, allowNumbers = false } = options;
  
  if (!name) {
    return { isValid: false, message: "Name is required" };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < minLength) {
    return { isValid: false, message: `Name must be at least ${minLength} characters long` };
  }

  if (trimmedName.length > maxLength) {
    return { isValid: false, message: `Name must be less than ${maxLength} characters` };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = allowNumbers 
    ? /^[a-zA-Z0-9\s\-'\.]+$/ 
    : /^[a-zA-Z\s\-'\.]+$/;
    
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, message: "Name contains invalid characters" };
  }

  return { isValid: true, message: "" };
};

// Date validation
export const validateDate = (date, options = {}) => {
  const { 
    required = true, 
    minDate = null, 
    maxDate = null,
    futureOnly = false,
    pastOnly = false
  } = options;

  if (!date && !required) {
    return { isValid: true, message: "" };
  }

  if (!date) {
    return { isValid: false, message: "Date is required" };
  }

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: "Please enter a valid date" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (futureOnly && dateObj <= today) {
    return { isValid: false, message: "Date must be in the future" };
  }

  if (pastOnly && dateObj >= today) {
    return { isValid: false, message: "Date must be in the past" };
  }

  if (minDate && dateObj < new Date(minDate)) {
    return { isValid: false, message: `Date must be after ${new Date(minDate).toLocaleDateString()}` };
  }

  if (maxDate && dateObj > new Date(maxDate)) {
    return { isValid: false, message: `Date must be before ${new Date(maxDate).toLocaleDateString()}` };
  }

  return { isValid: true, message: "" };
};

// Number validation
export const validateNumber = (value, options = {}) => {
  const { 
    required = true, 
    min = null, 
    max = null, 
    integer = false,
    positive = false 
  } = options;

  if (!value && value !== 0 && !required) {
    return { isValid: true, message: "" };
  }

  if (!value && value !== 0) {
    return { isValid: false, message: "This field is required" };
  }

  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, message: "Please enter a valid number" };
  }

  if (integer && !Number.isInteger(num)) {
    return { isValid: false, message: "Please enter a whole number" };
  }

  if (positive && num <= 0) {
    return { isValid: false, message: "Please enter a positive number" };
  }

  if (min !== null && num < min) {
    return { isValid: false, message: `Value must be at least ${min}` };
  }

  if (max !== null && num > max) {
    return { isValid: false, message: `Value must be at most ${max}` };
  }

  return { isValid: true, message: "" };
};

// Text validation (general purpose)
export const validateText = (text, options = {}) => {
  const { 
    required = true, 
    minLength = 0, 
    maxLength = 1000,
    pattern = null,
    patternMessage = "Invalid format"
  } = options;

  if (!text && !required) {
    return { isValid: true, message: "" };
  }

  if (!text) {
    return { isValid: false, message: "This field is required" };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < minLength) {
    return { isValid: false, message: `Must be at least ${minLength} characters long` };
  }

  if (trimmedText.length > maxLength) {
    return { isValid: false, message: `Must be less than ${maxLength} characters` };
  }

  if (pattern && !pattern.test(trimmedText)) {
    return { isValid: false, message: patternMessage };
  }

  return { isValid: true, message: "" };
};

// Department validation
export const validateDepartment = (department) => {
  const validDepartments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'Administration',
    'MCA',
    'MBA'
    
  ];

  if (!department) {
    return { isValid: false, message: "Department is required" };
  }

  if (!validDepartments.includes(department)) {
    return { isValid: false, message: "Please select a valid department" };
  }

  return { isValid: true, message: "" };
};

// Exam ID validation
export const validateExamId = (examId) => {
  if (!examId) {
    return { isValid: false, message: "Exam ID is required" };
  }

  const trimmedId = examId.trim();
  
  if (trimmedId.length < 3) {
    return { isValid: false, message: "Exam ID must be at least 3 characters long" };
  }

  if (trimmedId.length > 20) {
    return { isValid: false, message: "Exam ID must be less than 20 characters" };
  }

  // Allow alphanumeric characters, hyphens, and underscores
  if (!/^[a-zA-Z0-9\-_]+$/.test(trimmedId)) {
    return { isValid: false, message: "Exam ID can only contain letters, numbers, hyphens, and underscores" };
  }

  return { isValid: true, message: "" };
};

// Comprehensive form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { isValid, errors };
};

// Real-time validation helper for React components
export const useValidation = (initialState = {}) => {
  const [errors, setErrors] = React.useState(initialState);
  
  const validateField = (fieldName, value, validationFn) => {
    const result = validationFn(value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? '' : result.message
    }));
    return result.isValid;
  };

  const clearError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const clearAllErrors = () => {
    setErrors(initialState);
  };

  return {
    errors,
    validateField,
    clearError,
    clearAllErrors,
    hasErrors: Object.values(errors).some(error => error !== '')
  };
};
