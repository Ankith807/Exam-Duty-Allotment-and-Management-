const { getGeminiEmailContent, sendEmail } = require('./controllers/aiEmailAgent');
require('dotenv').config();

async function testEmailSystem() {
  try {
    // Test prompt
    const prompt = "Write a professional email reminding faculty about their exam duty tomorrow. Keep it under 100 words.";
    console.log("Generating email content...");
    
    const emailContent = await getGeminiEmailContent(prompt);
    console.log("Generated Email Content:\n", emailContent);

    if (emailContent && !emailContent.includes("Could not generate")) {
      const testEmail = process.env.EMAIL_USER; 
      console.log(`\nSending test email to ${testEmail}...`);
      
      await sendEmail(
        testEmail,
        "Test: Exam Duty Reminder",
        emailContent
      );
      console.log("Test email sent successfully!");
    }
    
  } catch (error) {
    console.error("Test failed:", error.message);
    console.log("\nTroubleshooting Tips:");
    console.log("1. Verify GEMINI_API_KEY in .env file");
    console.log("2. Check API is enabled at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
    console.log("3. Ensure your billing is set up (free tier available)");
    console.log("4. Try a simpler/shorter prompt");
  }
}

testEmailSystem();