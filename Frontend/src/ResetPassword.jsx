"use client";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { BackgroundBeams } from "./Components/ui/Background-beams";
import { validatePassword, validateConfirmPassword } from "./utils/validation";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`http://localhost:3000/api/v1/auth/verify-reset-token/${token}`);
        setIsValidToken(true);
      } catch (error) {
        setErrorMessage("Invalid or expired reset link. Please request a new one.");
      } finally {
        setIsCheckingToken(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  // Real-time validation handlers
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Clear previous errors
    setFieldErrors(prev => ({ ...prev, password: "" }));
    setErrorMessage("");
    setMessage("");

    // Validate password if user has typed something
    if (value.trim()) {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid) {
        setFieldErrors(prev => ({ ...prev, password: passwordValidation.message }));
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Clear previous errors
    setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
    setErrorMessage("");
    setMessage("");

    // Validate confirm password if user has typed something
    if (value.trim()) {
      const confirmPasswordValidation = validateConfirmPassword(password, value);
      if (!confirmPasswordValidation.isValid) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: confirmPasswordValidation.message }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      errors.confirmPassword = confirmPasswordValidation.message;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/api/v1/auth/reset-password", {
        token,
        newPassword: password.trim(),
      });

      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen font-sans bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen font-sans bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-sm"
        >
          <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-white">
            Invalid Reset Link
          </h2>
          
          <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {errorMessage}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-500 hover:underline text-sm"
            >
              Request New Reset Link
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-sm"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-white">
          Reset Password
        </h2>
        
        <p className="text-center text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className={`mt-1 w-full px-4 py-2 pr-10 rounded-xl border bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {fieldErrors.password}
            </motion.p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`mt-1 w-full px-4 py-2 pr-10 rounded-xl border bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 ${
                fieldErrors.confirmPassword
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {confirmPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {fieldErrors.confirmPassword}
            </motion.p>
          )}
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"
          >
            {message}
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
          >
            {errorMessage}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading || Object.values(fieldErrors).some(error => error !== '')}
          className={`w-full font-semibold py-2 px-4 rounded-xl transition duration-300 ${
            isLoading || Object.values(fieldErrors).some(error => error !== '')
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-blue-500 hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>
      </motion.form>
      
      <div className="pointer-events-none">
        <BackgroundBeams />
      </div>
    </div>
  );
};

export default ResetPassword; 