
const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_pictures'
    });

    // Update in MySQL
    await db.promise().query(
      "UPDATE users SET profile_picture = ? WHERE id = ?",
      [result.secure_url, req.params.id]
    );

    // Remove local temp file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: "Profile picture updated!",
      imageUrl: result.secure_url 
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
};
exports.getProfilepic = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT profile_picture FROM users WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract the profile picture URL from the first row
    const picUrl = rows[0].profile_picture;

    res.json({ picurl: picUrl });
  } catch (err) {
    console.error("Error fetching profile picture:", err);
    res.status(500).json({ error: "Failed to fetch profile picture" });
  }
};
