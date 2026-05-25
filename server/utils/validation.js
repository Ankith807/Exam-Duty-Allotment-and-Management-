/**
 * Server-side Validation Utility Library
 * Provides comprehensive validation functions for backend API endpoints
 */

// Email validation with comprehensive regex
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, message: "Email must be a string" };
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
const validatePassword = (password, options = {}) => {
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

  if (typeof password !== 'string') {
    return { isValid: false, message: "Password must be a string" };
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

// Phone number validation (supports multiple formats)
const validatePhone = (phone, options = {}) => {
  const { country = 'IN', required = true } = options;
  
  if (!phone && !required) {
    return { isValid: true, message: "" };
  }
  
  if (!phone) {
    return { isValid: false, message: "Phone number is required" };
  }

  if (typeof phone !== 'string') {
    return { isValid: false, message: "Phone number must be a string" };
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
const validateName = (name, options = {}) => {
  const { minLength = 2, maxLength = 50, allowNumbers = false } = options;
  
  if (!name) {
    return { isValid: false, message: "Name is required" };
  }

  if (typeof name !== 'string') {
    return { isValid: false, message: "Name must be a string" };
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

// Department validation
const validateDepartment = (department) => {
  const validDepartments = [
    'MCA',
    'MBA',
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Administration'
  ];

  if (!department) {
    return { isValid: false, message: "Department is required" };
  }

  if (typeof department !== 'string') {
    return { isValid: false, message: "Department must be a string" };
  }

  if (!validDepartments.includes(department)) {
    return { isValid: false, message: "Please select a valid department" };
  }

  return { isValid: true, message: "" };
};

// Role validation
const validateRole = (role) => {
  const validRoles = ['admin', 'faculty'];

  if (!role) {
    return { isValid: false, message: "Role is required" };
  }

  if (typeof role !== 'string') {
    return { isValid: false, message: "Role must be a string" };
  }

  if (!validRoles.includes(role)) {
    return { isValid: false, message: "Please select a valid role" };
  }

  return { isValid: true, message: "" };
};

// Exam ID validation
const validateExamId = (examId) => {
  if (!examId) {
    return { isValid: false, message: "Exam ID is required" };
  }

  if (typeof examId !== 'string') {
    return { isValid: false, message: "Exam ID must be a string" };
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

// Date validation
const validateDate = (date, options = {}) => {
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
const validateNumber = (value, options = {}) => {
  const { 
    required = true, 
    min = null, 
    max = null, 
    integer = false,
    positive = false 
  } = options;

  if ((value === null || value === undefined || value === '') && !required) {
    return { isValid: true, message: "" };
  }

  if (value === null || value === undefined || value === '') {
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

// Comprehensive form validation helper
const validateForm = (formData, validationRules) => {
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

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateDepartment,
  validateRole,
  validateExamId,
  validateDate,
  validateNumber,
  validateForm
};
