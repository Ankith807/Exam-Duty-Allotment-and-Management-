const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// Database configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",        // keep empty if using XAMPP
  database: "exam_duty"
});

const resetAdminPassword = async () => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin123', salt);
    
    db.connect((err) => {
      if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
      }
      
      const sql = "UPDATE users SET password = ? WHERE email = ?";
      db.query(sql, [hashedPassword, 'admin@gmail.com'], (err, result) => {
        if (err) {
          console.error("Error updating password:", err);
        } else if (result.affectedRows === 0) {
          console.log("No user found with email admin@gmail.com");
        } else {
          console.log("Password updated successfully for admin@gmail.com");
          console.log("New password: admin123");
        }
        db.end();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Error in reset script:", error);
    process.exit(1);
  }
};

resetAdminPassword();
