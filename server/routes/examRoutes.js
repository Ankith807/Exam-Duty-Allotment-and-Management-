const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const cron = require('node-cron');
const axios = require('axios');
const db = require('../config/db');




router.get("/exams/completed",examController.getCompletedExamDates);

// Create new exam
router.post("/exams", examController.createExam);

// Get an exam by ID
router.get("/exams/:id", examController.getExamById);

// Update exam
router.put("/exams/:id", examController.updateExam);

router.get("/exams-with-dates", examController.getAllExamsWithDates);

// Delete exam
router.delete("/exams/:id", examController.deleteExam);

router.post("/save-selections",examController.saveExamSelections);

router.get("/saved-selections/:id",examController.selected_exams)

router.get("/user-selections/:id", examController.displaySelectionsByUser);
router.get("/user-selections", examController.displayUserSelections);
router.get("/user-selections-by-exam/:id", examController.displaySelectionsByExam);
router.get("/eligible-users",examController.getEligibleUsersByExamT)
router.post("/manual-assign",examController.assignDutyManually)
router.post("/send-exam-selection-reminders", examController.sendExamSelectionReminders);

module.exports = router;
