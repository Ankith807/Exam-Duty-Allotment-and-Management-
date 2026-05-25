const db = require("../config/db");
const { getGeminiEmailContent, sendEmail } = require('./aiEmailAgent');
const nodemailer = require('nodemailer');
const {
  validateExamId,
  validateDate,
  validateNumber,
  validateForm
} = require('../utils/validation');
require('dotenv').config();

exports.createExam = async (req, res) => {
  try {
    const { examId, examName, examDates, dueDate } = req.body;

    // ============================
    // 1️⃣ Validation
    // ============================
    const validationErrors = {};

    // Validate exam ID
    const examIdValidation = validateExamId(examId);
    if (!examIdValidation.isValid) {
      validationErrors.examId = examIdValidation.message;
    }

    // Validate exam name
    if (!examName || typeof examName !== "string" || examName.trim().length < 3) {
      validationErrors.examName = "Exam name must be at least 3 characters long";
    } else if (examName.trim().length > 100) {
      validationErrors.examName = "Exam name must be less than 100 characters";
    }

    // Validate due date
    const dueDateValidation = validateDate(dueDate, { required: true, futureOnly: false });
    if (!dueDateValidation.isValid) {
      validationErrors.dueDate = dueDateValidation.message;
    }

    // Validate exam dates
    if (!examDates || !Array.isArray(examDates) || examDates.length === 0) {
      validationErrors.examDates = "At least one exam date is required";
    } else {
      examDates.forEach((date, index) => {
        const dateValidation = validateDate(date.examDate, { required: true, futureOnly: true });
        if (!dateValidation.isValid) {
          validationErrors[`examDate_${index}`] = `Exam date ${index + 1}: ${dateValidation.message}`;
        }

        const examDutyValidation = validateNumber(date.examDuty, {
          required: true,
          min: 1,
          max: 100,
          integer: true,
        });
        if (!examDutyValidation.isValid) {
          validationErrors[`examDuty_${index}`] = `Exam duty ${index + 1}: ${examDutyValidation.message}`;
        }

        const relieverDutyValidation = validateNumber(date.relieverDuty, {
          required: true,
          min: 1,
          max: 100,
          integer: true,
        });
        if (!relieverDutyValidation.isValid) {
          validationErrors[`relieverDuty_${index}`] = `Reliever duty ${index + 1}: ${relieverDutyValidation.message}`;
        }

        const validSessions = ["morning", "afternoon", "evening"];
        if (!date.session || !validSessions.includes(date.session)) {
          validationErrors[`session_${index}`] = `Session ${index + 1}: Must be one of morning, afternoon, or evening`;
        }
      });
    }

    // Return errors if any
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }

    // ============================
    // 2️⃣ Insert into `exams` table
    // ============================
    const sanitizedExamId = examId.trim();
    const sanitizedExamName = examName.trim();

    const [examResult] = await db.promise().query(
      "INSERT INTO exams (exam_id, exam_name, dueDate) VALUES (?, ?, ?)",
      [sanitizedExamId, sanitizedExamName, dueDate]
    );

    const examDbId = examResult.insertId;

    // ============================
    // 3️⃣ Insert into `exam_dates` table
    // ============================
    const insertPromises = examDates.map((date) => {
      const formattedExamDate = new Date(date.examDate).toISOString().split("T")[0];
      return db.promise().query(
        "INSERT INTO exam_dates (exam_id, exam_date, exam_duty_count, reliever_duty_count, session) VALUES (?, ?, ?, ?, ?)",
        [
          examDbId,
          formattedExamDate,
          date.examDuty ?? 0,
          date.relieverDuty ?? 0,
          date.session ?? "morning",
        ]
      );
    });

    await Promise.all(insertPromises);
    
    // ============================
    // 4️⃣ Notify Faculty (Optional but helpful)
    // ============================
    try {
      const [faculty] = await db.promise().query(
        "SELECT email, name FROM users WHERE role = 'faculty'"
      );
      
      if (faculty.length > 0) {
        const facultyEmails = faculty.map(f => f.email);
        const subject = `New Exam Scheduled: ${sanitizedExamName}`;
        const emailContent = `Dear Professor,\n\nA new exam "${sanitizedExamName}" (${sanitizedExamId}) has been scheduled. Please log in to the Exam Duty Portal to select your preferred duty dates.\n\nNote: The deadline for selection is ${new Date(dueDate).toLocaleDateString()}.\n\nBest regards,\nExam Coordinator`;
        
        // We use the centralized sendEmail which has fallback logic
        sendEmail(facultyEmails, subject, emailContent).catch(err => {
          console.error("Error sending notification to faculty:", err.message);
        });
      }
    } catch (notifyErr) {
      console.error("Failed to fetch faculty for notification:", notifyErr.message);
    }

    // ============================
    // 5️⃣ Success Response
    // ============================
    res.status(201).json({ message: "Exam created successfully and notifications sent" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating exam" });
  }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params; // id = exams.id

    const [examRows] = await db.promise().query(
      "SELECT id, exam_id, exam_name, created_at FROM exams WHERE id = ?",
      [id]
    );

    if (!examRows.length) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const [dateRows] = await db.promise().query(
      "SELECT id, exam_date, exam_duty_count, reliever_duty_count,session, created_at FROM exam_dates WHERE exam_id = ?",
      [id]
    );

    res.status(200).json({
      exam: examRows[0],
      examDates: dateRows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching exam" });
  }
};

// Update an exam
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params; // id = exams.id
    const { examName, dueDate, examDates } = req.body;

    // Update exam name and due date
    await db.promise().query(
      "UPDATE exams SET exam_name = ?, dueDate = ? WHERE id = ?",
      [examName, dueDate, id]
    );

    // Delete old exam dates
    await db.promise().query(
      "DELETE FROM exam_dates WHERE exam_id = ?",
      [id]
    );

    // Insert new exam dates
    const insertPromises = examDates.map(date => {
      return db.promise().query(
        "INSERT INTO exam_dates (exam_id, exam_date, exam_duty_count, reliever_duty_count,session) VALUES (?, ?, ?, ?,?)",
        [id, date.examDate, date.examDutyCount, date.relieverDutyCount,date.session]
      );
    });
    await Promise.all(insertPromises);

    res.status(200).json({ message: "Exam updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating exam" });
  }
};

// Delete exam and its dates
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    // Since ON DELETE CASCADE is there on exam_dates, no need to manually delete exam_dates
    await db.promise().query(
      "DELETE FROM exams WHERE id = ?",
      [id]
    );

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting exam" });
  }
};

exports.getAllExamsWithDates = async (req, res) => {
    try {
      // Fetch all exams
      const [exams] = await db.promise().query("SELECT * FROM exams");
  
      // For each exam, fetch its corresponding dates
      const examsWithDates = await Promise.all(
        exams.map(async (exam) => {
          const [dates] = await db.promise().query(
            `SELECT 
              DATE_FORMAT(exam_date, '%Y-%m-%d') AS examDate, 
              exam_duty_count AS lecturersRequired, 
              reliever_duty_count AS relieverRequired,
              session as examSession
            FROM exam_dates 
            WHERE exam_id = ?`,
            [exam.id]
          );
  
          return {
            internalId: exam.id,
            examId: exam.exam_id,
            examName: exam.exam_name,
            dueDate: exam.dueDate ? new Date(exam.dueDate).toISOString().split('T')[0] : null,
            dates: dates.map((d) => ({
              examDate: d.examDate, // This will now be just the date part without time
              examDutyCount: d.lecturersRequired,
              relieverDutyCount: d.relieverRequired,
              relieverDuty: d.relieverRequired > 0 ? "Yes" : "No",
              session: d.examSession
            }))
          };
        })
      );
  
      res.status(200).json(examsWithDates);
    } catch (error) {
      console.error("Error fetching exams with dates:", error);
      res.status(500).json({ message: "Internal server error" });
    } 
};




  
  exports.selected_exams = async (req, res) => {
    const { id } = req.params;
    
    try {
      const [selected_exams] = await db.promise().query(
        "SELECT * FROM exam_selections WHERE user_id = ?",
        [id]
      );
  
      res.status(200).json({ success: true, data: selected_exams });
    } catch (err) {
      console.error("Error getting exam selections:", err);
      res.status(500).json({ success: false, error: "Database error" });
    }
  };
  
  exports.displayUserSelections = async (req, res) => {
    try {
        
        const [selections] = await db.promise().query(`
            SELECT 
                es.selection_id,
                u.id as user_id,
                u.name as user_name,
                u.email,
                u.department,
                e.id as exam_id,
                e.exam_name,
                es.exam_date,
                es.duty_type,
                es.created_at as selection_time
            FROM 
                exam_selections es
            JOIN 
                users u ON es.user_id = u.id
            JOIN 
                exams e ON es.exam_id = e.exam_id
            ORDER BY 
                es.created_at DESC
        `);

        if (selections.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No selections found in the database."
            });
        }

        res.status(200).json({
            success: true,
            count: selections.length,
            data: selections
        });
    } catch (error) {
        console.error("Error fetching user selections:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching selections."
        });
    }
};

exports.displaySelectionsByUser = async (req, res) => {
    const { id } = req.params;

    try {
        
        const [selections] = await db.promise().query(`
         SELECT 
    es.selection_id, 
    e.id as exam_id, 
    e.exam_name, 
    es.exam_date, 
    es.duty_type, 
    es.created_at as selection_time 
FROM 
    exam_selections es 
JOIN 
    exams e ON es.exam_id = e.exam_id 
WHERE 
    es.user_id = ?
ORDER BY 
    es.exam_date, es.duty_type;
        `, [id]);

        if (selections.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No selections found for user ID ${userId}.`
            });
        }

        res.status(200).json({
            success: true,
            count: selections.length,
            data: selections
        });
    } catch (error) {
        console.error("Error fetching user selections:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching selections."
        });
    }
};

exports.displaySelectionsByExam = async (req, res) => {
    const { id } = req.params;

    try {
        
        const [selections] = await db.promise().query(`
            SELECT
                es.selection_id,
                u.id as user_id,
                u.name as user_name,
                u.email,
                u.department,
                e.exam_name,
                es.exam_date,
                es.duty_type,
                es.session,
                es.created_at as selection_time
            FROM
                exam_selections es
            JOIN
                users u ON es.user_id = u.id
            JOIN
                exams e ON es.exam_id = e.exam_id
            WHERE
                es.exam_id = ?
            ORDER BY
                es.exam_date, u.name
        `, [id]);

        if (selections.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No selections found for exam ID ${id}.`
            });
        }

        res.status(200).json({
            success: true,
            count: selections.length,
            data: selections
        });
    } catch (error) {
        console.error("Error fetching exam selections:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching selections."
        });
    }
};





exports.saveExamSelections = async (req, res) => {
  const { userId, selections } = req.body;



  db.beginTransaction(async (err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).json({ success: false, message: "Transaction start failed" });
    }

    try {
      for (const selection of selections) {
        
        const d = new Date(selection.examDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
      

        // If Not Available, insert into exam_availability instead
        if (selection.dutyType === "Not Available") {
          await new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO exam_availability (exam_id, exam_date, user_id, availability_status, reason,session)
               VALUES (?, ?, ?, ?, ?,?)`,
              [selection.examId, dateStr, userId, "Not Available", selection.reason || null,selection.session],
              (err) => err ? reject(err) : resolve()
            );
          });
          continue; // Skip rest of the loop
        }

        // Check for duplicate selection
        const [existing] = await new Promise((resolve, reject) => {
          db.query(
            "SELECT 1 FROM exam_selections WHERE user_id = ? AND exam_id = ? AND exam_date = ? AND session = ?",
            [userId, selection.examId, dateStr, selection.session],
            (err, results) => err ? reject(err) : resolve(results)
          );
        });

        if (existing) continue;

        // Get internal exam ID
        const [examRow] = await new Promise((resolve, reject) => {
          db.query(
            "SELECT id FROM exams WHERE exam_id = ?",
            [selection.examId],
            (err, results) => err ? reject(err) : resolve(results)
          );
        });

        if (!examRow) throw new Error("Invalid exam_id");

        const internalExamId = examRow.id;

       
        // Lock exam_dates row
        const [row] = await new Promise((resolve, reject) => {
          db.query(
            `SELECT id, exam_duty_count, reliever_duty_count 
             FROM exam_dates 
             WHERE exam_id = ? AND exam_date = ? AND session = ? 
             FOR UPDATE`,
            [internalExamId, dateStr, selection.session],
            (err, results) => err ? reject(err) : resolve(results)
          );
        });

        if (!row) throw new Error("No matching exam date");

        const isExamDuty = selection.dutyType === "Exam Duty";
        const column = isExamDuty ? "exam_duty_count" : "reliever_duty_count";

        if (row[column] <= 0) throw new Error(`${selection.dutyType} slots are full`);

        // Insert the selection
        await new Promise((resolve, reject) => {
          db.query(
            `INSERT INTO exam_selections (user_id, exam_id, exam_date, duty_type, session) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, selection.examId, dateStr, selection.dutyType, selection.session],
            (err) => err ? reject(err) : resolve()
          );
        });

        // Decrease the count
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE exam_dates SET ${column} = ${column} - 1 WHERE id = ?`,
            [row.id],
            (err) => err ? reject(err) : resolve()
          );
        });
      }

      db.commit(async (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Commit failed:", err);
            res.status(500).json({ success: false, message: "Commit failed" });
          });
        }

        // Send confirmation email to user
        try {
          const [userRows] = await db.promise().query("SELECT name, email FROM users WHERE id = ?", [userId]);
          if (userRows.length > 0) {
            const user = userRows[0];
            const subject = "Exam Duty Selections Confirmed";
            const htmlContent = `
              <p>Dear ${user.name},</p>
              <p>Your exam duty selections have been successfully saved. You can view your updated schedule in the exam portal.</p>
              <p>Thank you for your cooperation.</p>
              <br/>
              <p>Regards,<br/>Exam Coordinator</p>
            `;
            sendEmail(user.email, subject, htmlContent).catch(e => console.error("Self-selection email failed:", e));
          }
        } catch (emailErr) {
          console.error("Error fetching user for confirmation email:", emailErr);
        }

        res.status(200).json({ success: true, message: "Selections saved successfully." });
      });
    } catch (error) {
      db.rollback(() => {
        console.error("Transaction failed:", error);
        res.status(500).json({ success: false, message: error.message });
      });
    }
  });
};



exports.getEligibleUsersByExamT = async (req, res) => {
  try {
    const { examId, examDate, session } = req.query;
   
    if (!examId || !examDate || !session) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Format the date to YYYY-MM-DD
    const formattedDate = new Date(examDate).toISOString().split("T")[0];
    console.log(formattedDate)
  const query = `
  SELECT u.id, u.name, u.department
  FROM users u
  WHERE u.role = 'faculty'
    AND u.id NOT IN (
      SELECT ea.user_id
      FROM exam_availability ea
      WHERE ea.exam_id = ?
        AND ea.exam_date = ?
        AND ea.session = ?
    )
    AND u.id NOT IN (
      SELECT es.user_id
      FROM exam_selections es
      WHERE es.exam_id = ?
        AND es.exam_date = ?
        AND es.session = ?
    )
`;



    const [rows] = await db.promise().query(query, [examId, formattedDate,session,examId,formattedDate, session]);
       console.log("Query Results:", rows); 
    res.status(200).json({
      message: "Eligible users fetched successfully",
      eligibleUsers: rows,
    });
  } catch (error) {
    console.error("Error fetching eligible users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.assignDutyManually = async (req, res) => {
  const { userId, examId, examDate, session, dutyType } = req.body;

  if (!userId || !examId || !examDate || !session || !dutyType) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const d = new Date(examDate);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  db.beginTransaction(async (err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).json({ success: false, message: "Transaction start failed" });
    }

    try {
      // 1. Duplicate check
      const [existing] = await new Promise((resolve, reject) => {
        db.query(
          "SELECT 1 FROM exam_selections WHERE user_id = ? AND exam_id = ? AND exam_date = ? AND session = ?",
          [userId, examId, dateStr, session],
          (err, results) => (err ? reject(err) : resolve(results))
        );
      });
      if (existing) throw new Error("User already assigned to this duty");

      // 2. Get internal exam ID
      const [examRow] = await new Promise((resolve, reject) => {
        db.query(
          "SELECT id FROM exams WHERE exam_id = ?",
          [examId],
          (err, results) => (err ? reject(err) : resolve(results))
        );
      });
      if (!examRow) throw new Error("Invalid examId");

      const internalExamId = examRow.id;

      // 3. Lock exam_dates row
      const [row] = await new Promise((resolve, reject) => {
        db.query(
          `SELECT id, exam_duty_count, reliever_duty_count 
           FROM exam_dates 
           WHERE exam_id = ? AND exam_date = ? AND session = ? 
           FOR UPDATE`,
          [internalExamId, dateStr, session],
          (err, results) => (err ? reject(err) : resolve(results))
        );
      });
      if (!row) throw new Error("No matching exam date");

      const column = dutyType === "Exam Duty" ? "exam_duty_count" : "reliever_duty_count";
      if (row[column] <= 0) throw new Error(`${dutyType} slots are full`);

      // 4. Insert into exam_selections
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO exam_selections (user_id, exam_id, exam_date, duty_type, session) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, examId, dateStr, dutyType, session],
          (err) => (err ? reject(err) : resolve())
        );
      });

      // 5. Decrease slot count
      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE exam_dates SET ${column} = ${column} - 1 WHERE id = ?`,
          [row.id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      // 6. Commit
      db.commit(async (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Commit failed:", err);
            return res.status(500).json({ success: false, message: "Commit failed" });
          });
        }

        const [userRow] = await new Promise((resolve, reject) => {
          db.query("SELECT name, email FROM users WHERE id = ?", [userId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        if (userRow) {
          const subject = `Exam Duty Assigned on ${dateStr}`;
          const htmlContent = `
            <p>Dear ${userRow.name},</p>
            <p>You have been assigned a <strong>${dutyType}</strong> on <strong>${dateStr}</strong> during the <strong>${session}</strong> session.</p>
            <p>Please check the exam portal for more details.</p>
            <br/>
            <p>Regards,<br/>Exam Coordinator</p>
          `;

          sendEmail(userRow.email, subject, htmlContent).catch(error => {
            console.error("Email sending failed:", error);
          });
        }

        return res.status(200).json({
          success: true,
          message: "Manual duty assigned successfully.",
        });
      });

    } catch (error) {
      db.rollback(() => {
        console.error("Transaction failed:", error);
        return res.status(409).json({ success: false, message: error.message }); // 409 for conflict
      });
    }
  });
};




exports.sendExamSelectionReminders = async (req, res) => {
  const { exam_id } = req.body;
  if (!exam_id) {
    return res.status(400).json({ message: 'exam_id is required' });
  }

  try {
    // 1. Get exam details
    const [exam] = await db.promise().query(
      'SELECT exam_id, exam_name FROM exams WHERE id = ?',
      [exam_id]
    );
    if (!exam.length) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    const examName = exam[0].exam_name;
    const examCode = exam[0].exam_id;

    // 2. Find faculty who haven't selected for this exam
    const [faculty] = await db.promise().query(
      `SELECT u.id, u.name, u.email
       FROM users u
       WHERE u.role = 'faculty'
         AND NOT EXISTS (
           SELECT 1 FROM exam_selections es
           WHERE es.user_id = u.id AND es.exam_id = ?
         )`,
      [exam_id]
    );

    // 3. Get admin emails
    const [admins] = await db.promise().query(
      "SELECT email FROM users WHERE role = 'admin'"
    );
    const adminEmails = admins.map(admin => admin.email);

    let sentCount = 0;
    const nonResponders = [];
    const currentDate = new Date().toLocaleDateString();

    // 4. Send reminders to faculty
    for (const user of faculty) {
      const prompt = `Compose a polite reminder email to Professor ${user.name} reminding them to select their exam duty dates for ${examName} (${examCode}) by tomorrow. Keep it professional and under 100 words.`;
      
      try {
        const emailContent = await getGeminiEmailContent(prompt);
        await sendEmail(
          user.email,
          `Urgent: Select Your Exam Duty Dates for ${examCode}`,
          emailContent
        );
        sentCount++;
        nonResponders.push(`${user.name} (${user.email})`);
      } catch (err) {
        console.error(`Error sending to ${user.email}:`, err.message);
        nonResponders.push(`${user.name} (${user.email}) - FAILED`);
      }
    }

    // 5. Send summary to admin
    if (adminEmails.length > 0 && faculty.length > 0) {
      try {
        const adminSubject = `[Action Required] ${faculty.length} Faculty Haven't Selected Duties for ${examCode}`;
        const adminContent = `
        Exam Duty Selection Status - ${currentDate}
        -------------------------------
        Exam: ${examName} (${examCode})
        Total Non-responders: ${faculty.length}
        Reminders Attempted: ${sentCount}
        
        Faculty Not Yet Responded:
        ${nonResponders.join('\n')}
        
        Please follow up with these faculty members.
        `;

        await sendEmail(
          adminEmails,
          adminSubject,
          adminContent
        );
      } catch (err) {
        console.error('Error sending admin notification:', err.message);
      }
    }

    res.status(200).json({
      message: `Reminders sent to ${sentCount} faculty. Admin notified about ${faculty.length} non-responders.`,
      nonResponders: faculty.map(f => ({ id: f.id, name: f.name, email: f.email }))
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Server error while sending reminders',
      error: error.message 
    });
  }

};


exports.updateExamStatus = async () => {
  try {
    const query = `
      UPDATE exams e
      JOIN (
        SELECT exam_id, MAX(exam_date) AS last_exam_date
        FROM exam_dates
        GROUP BY exam_id
      ) ed ON e.id = ed.exam_id
      SET e.status = 'completed'
      WHERE ed.last_exam_date < CURDATE()
        AND e.status != 'completed';
    `;

    const [result] = await db.promise().query(query);
    console.log(`[CRON] Exam statuses updated at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[CRON] Error updating exam status:', error);
  }
};

exports.getCompletedExamDates = async (req, res) => {
  try {
    const query = `
      SELECT ed.*
      FROM exam_dates ed
      JOIN exams e ON ed.exam_id = e.id
      WHERE e.status = 'completed'
      ORDER BY ed.exam_date DESC
    `;

    const [rows] = await db.promise().query(query);
    res.status(200).json({ completedExamDates: rows });
  } catch (error) {
    console.error('Error fetching completed exam dates:', error);
    res.status(500).json({ error: 'Failed to fetch completed exam dates' });
  }
};