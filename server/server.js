const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const exam_controller=require('./controllers/examController')
app.use(express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/exam', examRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Cron job: every minute for testing
cron.schedule('* * * * *', async () => {
  console.log('Cron job running');
  try {
    const [exams] = await db.promise().query(
      "SELECT exam_id FROM exams WHERE dueDate = CURDATE() + INTERVAL 1 DAY"
    );
    for (const exam of exams) {
      await axios.post('http://localhost:3000/api/v1/exam/send-exam-selection-reminders', {
        exam_id: exam.exam_id
      });
      console.log(`Sent reminders for exam_id: ${exam.exam_id}`);
    }
  } catch (err) {
    console.error('Error in cron job:', err.message);
  }

  console.log('[CRON] Checking for completed exams...');
 exam_controller.updateExamStatus();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});