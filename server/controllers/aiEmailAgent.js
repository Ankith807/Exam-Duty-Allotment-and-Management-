const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Function to get email content from Gemini API
async function getGeminiEmailContent(prompt) {
  console.log("Email agent triggered");
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.GEMINI_API_KEY
        }
      }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
           "Could not generate email content. Please try again.";
  } catch (error) {
    console.warn("Gemini API Error (using fallback):", error.message);
    
    // Fallback template if Gemini is down or quota exceeded
    if (prompt.toLowerCase().includes("reminder")) {
      return "Dear Professor,\n\nThis is a friendly reminder to select your preferred exam duty dates for the upcoming examinations. Please log in to the portal as soon as possible to make your selections. Your timely response helps us organize the schedule efficiently.\n\nBest regards,\nExam Coordinator";
    }
    
    return "This is an automated notification regarding your exam duty. Please check the portal for details.";
  }
}


// 2. Function to send email
async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `Exam Duty System <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log(`Email sent successfully to ${to}:`, info.response);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    throw error;
  }
}


module.exports = { 
  getGeminiEmailContent,
  sendEmail 
};