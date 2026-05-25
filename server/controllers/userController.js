
const db= require('../config/db');
const bcrypt = require('bcryptjs');
const {
  validateName,
  validatePhone,
  validatePassword,
  validateEmail
} = require('../utils/validation');
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Base query
    let query = `
      SELECT 
        id, 
        name, 
        email, 
        role, 
        department,
        phone,
        profile_picture,
        is_email_verified,
        created_at
      FROM users
    `;

    const params = [];
    const conditions = [];

    // Filter by role if specified
    if (req.query.role) {
      conditions.push(`role = ?`);
      params.push(req.query.role);
    }

    // Filter by department if specified
    if (req.query.department) {
      conditions.push(`department = ?`);
      params.push(req.query.department);
    }

    // Filter by email verification status if specified
    if (req.query.verified !== undefined) {
      const isVerified = req.query.verified === 'true' ? 1 : 0;
      conditions.push(`is_email_verified = ?`);
      params.push(isVerified);
    }

    // Add WHERE clause if there are any conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add sorting
    query += ` ORDER BY name ASC`;

    // Execute query
    const [users] = await db.promise().query(query, params);

    // Format response
    const response = {
      success: true,
      count: users.length,
      data: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        profilePicture: user.profile_picture,
        isEmailVerified: Boolean(user.is_email_verified),
        createdAt: user.created_at
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};
  // Get user by ID
  exports.getUserById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results[0] || {});
    });
  };
  
 // Create new user
exports.createUser = (req, res) => {
  const { name, email, password, phone, role, department, profile_picture } = req.body;

  const user = {
    name,
    email,
    password,
    phone,
    role: role || 'faculty', // default role is faculty if not provided
    department: department || null,
    profile_picture: profile_picture || null,
    is_email_verified: 0, // By default email is not verified
  };

  db.query('INSERT INTO users SET ?', user, (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Insert failed', details: err });
    }
    res.status(201).json({ message: 'User created', userId: result.insertId });
  });
};

  // Update user
  exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { name, email, phone, department, role, newPassword } = req.body;

    // Validate inputs
    const validationErrors = {};

    // Validate name if provided
    if (name !== undefined) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        validationErrors.name = nameValidation.message;
      }
    }

    // Validate email if provided
    if (email !== undefined && email !== null && email !== '') {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        validationErrors.email = emailValidation.message;
      }
    }

    // Validate phone if provided
    if (phone !== undefined && phone !== null && phone !== '') {
      const phoneValidation = validatePhone(phone, { required: false });
      if (!phoneValidation.isValid) {
        validationErrors.phone = phoneValidation.message;
      }
    }

    // Validate role if provided
    if (role !== undefined && role !== null && role !== '') {
      const validRoles = ['faculty', 'admin'];
      if (!validRoles.includes(role.toLowerCase())) {
        validationErrors.role = 'Role must be either faculty or admin';
      }
    }

    // Validate new password if provided
    if (newPassword !== undefined && newPassword !== null && newPassword !== '') {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        validationErrors.newPassword = passwordValidation.message;
      }
    }

    // If there are validation errors, return them
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Prepare updates object with sanitized data
    const updates = {};
    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (email !== undefined && email !== null && email !== '') {
      updates.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) {
      updates.phone = phone ? phone.trim() : null;
    }
    if (department !== undefined) {
      updates.department = department ? department.trim() : null;
    }
    if (role !== undefined && role !== null && role !== '') {
      updates.role = role.toLowerCase();
    }
    if (newPassword !== undefined && newPassword !== null && newPassword !== '') {
      updates.password = bcrypt.hashSync(newPassword, 10);
    }

    // Only proceed if there are actual updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    db.query('UPDATE users SET ? WHERE id = ?', [updates, id], (err) => {
      if (err) {
        console.error('Error updating user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Update failed' });
      }
      res.json({ message: 'User updated successfully' });
    });
  };
  
  // Delete user
  exports.deleteUser = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Delete failed' });
      res.json({ message: 'User deleted' });
    });
  };

  // Update only the role of a user
exports.updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const validRoles = ['Faculty', 'Admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  db.query('UPDATE users SET role = ? WHERE id = ?', [role, id], (err, result) => {
    if (err) {
      console.error('Error updating role:', err);
      return res.status(500).json({ error: 'Role update failed' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Role updated successfully' });
  });
};


exports.getAvailabilityByUserId = (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const query = `
    SELECT availability_id, exam_id, exam_date, availability_status, reason, created_at
    FROM exam_availability
    WHERE user_id = ?
    ORDER BY exam_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching availability:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.status(200).json({ success: true, data: results });
  });
};



exports.getEligibleUsersByExam = async (req, res) => {
  console.log(req.params)
  try {
    const { examId, examDate, session } = req.query;

    if (!examId || !examDate || !session) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: examId, examDate, or session",
      });
    }


    const query = `
      SELECT id, name, email, phone, department
      FROM users
      WHERE role = 'faculty'
        AND id NOT IN (
          SELECT user_id
          FROM exam_selections
          WHERE exam_id = ?
            AND exam_date = ?
            AND session = ?
        )
        AND id NOT IN (
          SELECT user_id
          FROM exam_availability
          WHERE exam_id = ?
            AND exam_date = ?
        )
    `;

    const [rows] = await db.promise().query(query, [
      examId,        // used in exam_selections
      examDate,      // used in both
      session,       // used in exam_selections
      examId,        // used in exam_availability
      examDate       // used in exam_availability
    ]);
  console.log(raws)
    return res.status(200).json({
      success: true,
      count: rows.length,
      eligibleUsers: rows
    });

  } catch (error) {
    console.error("Error in getEligibleUsersByExam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



exports.getEligibleUsersByExamT = async (req, res) => {
  console.log(req.query); // You can check what's being received

  try {
    const { examId, examDate, session } = req.query;

    if (!examId || !examDate || !session) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: examId, examDate, or session",
      });
    }

    const query = `
      SELECT id, name, email, phone, department
      FROM users
      WHERE role = 'faculty'
        AND id NOT IN (
          SELECT user_id
          FROM exam_selections
          WHERE exam_id = ?
            AND exam_date = ?
            AND session = ?
        )
        AND id NOT IN (
          SELECT user_id
          FROM exam_availability
          WHERE exam_id = ?
            AND exam_date = ?
        )
    `;

    const [rows] = await db.promise().query(query, [
      examId,
      examDate,
      session,
      examId,
      examDate
    ]);

    console.log(rows); // fixed typo here

    return res.status(200).json({
      success: true,
      count: rows.length,
      eligibleUsers: rows
    });

  } catch (error) {
    console.error("Error in getEligibleUsersByExam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
