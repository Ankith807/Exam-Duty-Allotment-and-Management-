const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db=require('../config/db');
const { sendEmail } = require('./aiEmailAgent');

const {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateDepartment,
  validateRole
} = require('../utils/validation');
require('dotenv').config();

exports.register = (req, res) => {
  const { name, email, password, phone, role, department, profile_picture } = req.body;

  // Comprehensive server-side validation
  const validationErrors = {};

  // Validate name
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    validationErrors.name = nameValidation.message;
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    validationErrors.email = emailValidation.message;
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    validationErrors.password = passwordValidation.message;
  }

  // Validate phone (optional)
  if (phone) {
    const phoneValidation = validatePhone(phone, { required: false });
    if (!phoneValidation.isValid) {
      validationErrors.phone = phoneValidation.message;
    }
  }

  // Validate role
  const roleValidation = validateRole(role || 'faculty');
  if (!roleValidation.isValid) {
    validationErrors.role = roleValidation.message;
  }

  // Validate department (optional)
  if (department) {
    const departmentValidation = validateDepartment(department);
    if (!departmentValidation.isValid) {
      validationErrors.department = departmentValidation.message;
    }
  }

  // If there are validation errors, return them
  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors
    });
  }

  // Sanitize inputs
  const sanitizedData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    phone: phone ? phone.trim() : null,
    role: role || 'faculty',
    department: department ? department.trim() : null,
    profile_picture: profile_picture || null
  };

  const hashedPassword = bcrypt.hashSync(sanitizedData.password, 10);

  const sql = `
    INSERT INTO users (name, email, password, phone, role, department, profile_picture, is_email_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      sanitizedData.name,
      sanitizedData.email,
      hashedPassword,
      sanitizedData.phone,
      sanitizedData.role,
      sanitizedData.department,
      sanitizedData.profile_picture,
      0 // is_email_verified default 0
    ],
    (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already registered' });
        }
        return res.status(500).json({ message: 'Registration failed', error: err });
      }
      res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validate input
  const validationErrors = {};

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    validationErrors.email = emailValidation.message;
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    validationErrors.password = passwordValidation.message;
  }

  // If there are validation errors, return them
  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors
    });
  }

  // Sanitize email
  const sanitizedEmail = email.trim().toLowerCase();

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [sanitizedEmail], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Login failed due to server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        profilepic:user.profile_picture,
        is_email_verified: user.is_email_verified
      }
    });
  });
};
  

exports.protectedRoute = (req, res) => {
  res.send('This is a protected route!');
};

// Forgot password - send reset email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: { email: emailValidation.message }
    });
  }

  // Sanitize email
  const sanitizedEmail = email.trim().toLowerCase();

  try {
    // Check if user exists
    const [users] = await db.promise().query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [sanitizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await db.promise().query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const subject = 'Password Reset Request';
    const htmlContent = `
        <h2>Hello ${user.name},</h2>
        <p>You requested a password reset for your Exam Duty System account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Exam Duty System Team</p>
    `;

    await sendEmail(user.email, subject, htmlContent);


    res.status(200).json({ 
      message: 'Password reset email sent successfully',
      email: user.email 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending reset email' });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // Validate inputs
  const validationErrors = {};

  if (!token) {
    validationErrors.token = 'Reset token is required';
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    validationErrors.newPassword = passwordValidation.message;
  }

  // If there are validation errors, return them
  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors
    });
  }

  try {
    // Find user with valid reset token
    const [users] = await db.promise().query(
      'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = users[0];

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password and clear reset token
    await db.promise().query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const [users] = await db.promise().query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.status(200).json({ message: 'Token is valid' });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
};
