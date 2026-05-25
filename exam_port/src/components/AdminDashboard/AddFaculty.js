import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";
import { API_IP, API_PORT } from '@env';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateDepartment
} from "../../utils/validation";

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const AddFaculty = ({ onAddFaculty }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    role: "faculty",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));

    // Real-time validation
    validateField(key, value);
  };

  const validateField = (fieldName, value) => {
    let validation;

    switch (fieldName) {
      case 'name':
        validation = validateName(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'phone':
        validation = validatePhone(value);
        break;
      case 'department':
        validation = validateDepartment(value);
        break;
      default:
        return;
    }

    if (!validation.isValid && value.trim()) {
      setErrors(prev => ({ ...prev, [fieldName]: validation.message }));
    } else {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  const validateForm = () => {
    const { name, email, password, phone, department } = formData;
    const newErrors = {};

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    // Validate phone
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message;
    }

    // Validate department
    const departmentValidation = validateDepartment(department);
    if (!departmentValidation.isValid) {
      newErrors.department = departmentValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/auth/register`, formData);

      if (response.status === 200 || response.status === 201) {
        Toast.show({ type: "success", text1: "Faculty added successfully!" });
        setFormData({ name: "", email: "", password: "", phone: "", department: "", role: "faculty" });
        setErrors({});
        onAddFaculty?.(formData);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to add faculty";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add New Faculty</Text>

      {/* Name */}
      <TextInput
        style={[styles.input, errors.name && styles.errorInput]}
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(text) => handleChange("name", text)}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Email */}
      <TextInput
        style={[styles.input, errors.email && styles.errorInput]}
        placeholder="Email"
        value={formData.email}
        keyboardType="email-address"
        onChangeText={(text) => handleChange("email", text)}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.flex1, errors.password && styles.errorInput]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#555" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Phone */}
      <TextInput
        style={[styles.input, errors.phone && styles.errorInput]}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(text) => handleChange("phone", text)}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      {/* Department */}
      <TextInput
        style={[styles.input, errors.department && styles.errorInput]}
        placeholder="Department"
        value={formData.department}
        onChangeText={(text) => handleChange("department", text)}
      />
      {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}

      {/* Role Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.role}
          onValueChange={(itemValue) => handleChange("role", itemValue)}
        >
          <Picker.Item label="Faculty" value="faculty" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Faculty</Text>
        )}
      </TouchableOpacity>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f9fafb",
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  errorInput: {
    borderColor: "red",
    backgroundColor: "#ffeef0",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginLeft: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AddFaculty;
