const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Analytics endpoints
router.get('/overview', analyticsController.getOverview);
router.get('/departments', analyticsController.getDepartments);
router.get('/duty-types', analyticsController.getDutyTypes);
router.get('/trends', analyticsController.getTrends);
router.get('/faculty-workload', analyticsController.getFacultyWorkload);
router.get('/exam-stats', analyticsController.getExamStats);

module.exports = router;
