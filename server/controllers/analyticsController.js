const db = require("../config/db");

// Overview Statistics
exports.getOverview = async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    // Total faculty count
    const [facultyCount] = await db.promise().query(
      "SELECT COUNT(*) as totalFaculty FROM users WHERE role = 'faculty'"
    );
    
    // Total exams
    const [examCount] = await db.promise().query(
      "SELECT COUNT(*) as totalExams FROM exams WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)",
      [days]
    );
    
    // Total duties assigned
    const [dutyCount] = await db.promise().query(
      "SELECT COUNT(*) as totalDuties FROM exam_selections WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)",
      [days]
    );
    
    // Completed vs upcoming exams
    const [examStatus] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN ed.exam_date < NOW() THEN 1 ELSE 0 END) as completedExams,
        SUM(CASE WHEN ed.exam_date >= NOW() THEN 1 ELSE 0 END) as upcomingExams
      FROM exam_dates ed
      JOIN exams e ON ed.exam_id = e.id
      WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);
    
    // Faculty with/without duties
    const [facultyDuties] = await db.promise().query(`
      SELECT
        COUNT(DISTINCT CASE WHEN es.user_id IS NOT NULL THEN u.id END) as facultyWithDuties,
        COUNT(DISTINCT CASE WHEN es.user_id IS NULL THEN u.id END) as facultyWithoutDuties
      FROM users u
      LEFT JOIN exam_selections es ON u.id = es.user_id
        AND es.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      WHERE u.role = 'faculty'
    `, [days]);
    
    // Average duties per faculty
    const [avgDuties] = await db.promise().query(`
      SELECT
        ROUND(COUNT(es.selection_id) / COUNT(DISTINCT u.id), 1) as avgDutiesPerFaculty
      FROM users u
      LEFT JOIN exam_selections es ON u.id = es.user_id
        AND es.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      WHERE u.role = 'faculty'
    `, [days]);
    
    const overview = {
      totalFaculty: facultyCount[0].totalFaculty,
      totalExams: examCount[0].totalExams,
      totalDuties: dutyCount[0].totalDuties,
      completedExams: examStatus[0].completedExams || 0,
      upcomingExams: examStatus[0].upcomingExams || 0,
      facultyWithDuties: facultyDuties[0].facultyWithDuties || 0,
      facultyWithoutDuties: facultyDuties[0].facultyWithoutDuties || 0,
      avgDutiesPerFaculty: parseFloat(avgDuties[0].avgDutiesPerFaculty) || 0
    };
    
    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error("Error fetching overview analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overview analytics",
      error: error.message
    });
  }
};

// Department Statistics
exports.getDepartments = async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    const [departments] = await db.promise().query(`
      SELECT
        u.department,
        COUNT(DISTINCT u.id) as faculty,
        COUNT(es.selection_id) as duties,
        ROUND(COUNT(es.selection_id) / COUNT(DISTINCT u.id), 1) as avgDuties
      FROM users u
      LEFT JOIN exam_selections es ON u.id = es.user_id
        AND es.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      WHERE u.role = 'faculty' AND u.department IS NOT NULL
      GROUP BY u.department
      ORDER BY duties DESC
    `, [days]);
    
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error("Error fetching department analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department analytics",
      error: error.message
    });
  }
};

// Duty Type Distribution
exports.getDutyTypes = async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    const [dutyTypes] = await db.promise().query(`
      SELECT
        duty_type as type,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM exam_selections
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY))), 1) as percentage
      FROM exam_selections
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY duty_type
    `, [days, days]);
    
    res.status(200).json({
      success: true,
      data: dutyTypes
    });
  } catch (error) {
    console.error("Error fetching duty type analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch duty type analytics",
      error: error.message
    });
  }
};

// Monthly Trends
exports.getTrends = async (req, res) => {
  try {
    const days = req.query.days || 90;
    
    const [trends] = await db.promise().query(`
      SELECT
        DATE_FORMAT(ed.exam_date, '%b') as month,
        COUNT(DISTINCT ed.id) as exams,
        COUNT(es.selection_id) as duties
      FROM exam_dates ed
      JOIN exams e ON ed.exam_id = e.id
      LEFT JOIN exam_selections es ON e.exam_id = es.exam_id
      WHERE ed.exam_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(ed.exam_date, '%Y-%m'), DATE_FORMAT(ed.exam_date, '%b')
      ORDER BY DATE_FORMAT(ed.exam_date, '%Y-%m')
    `, [days]);
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error("Error fetching trends analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trends analytics",
      error: error.message
    });
  }
};

// Faculty Workload
exports.getFacultyWorkload = async (req, res) => {
  try {
    const days = req.query.days || 30;
    const limit = req.query.limit || 10;
    
    const [workload] = await db.promise().query(`
      SELECT
        u.name,
        COUNT(es.selection_id) as duties,
        u.department
      FROM users u
      JOIN exam_selections es ON u.id = es.user_id
      WHERE u.role = 'faculty'
        AND es.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY u.id, u.name, u.department
      ORDER BY duties DESC
      LIMIT ?
    `, [days, parseInt(limit)]);
    
    res.status(200).json({
      success: true,
      data: workload
    });
  } catch (error) {
    console.error("Error fetching faculty workload analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty workload analytics",
      error: error.message
    });
  }
};

// Exam Statistics
exports.getExamStats = async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    const [examStats] = await db.promise().query(`
      SELECT
        e.exam_name as examName,
        COUNT(es.selection_id) as totalDuties,
        COUNT(DISTINCT es.user_id) as facultyAssigned
      FROM exams e
      LEFT JOIN exam_dates ed ON ed.exam_id = e.id
      LEFT JOIN exam_selections es ON e.exam_id = es.exam_id
      WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY e.id, e.exam_name
      ORDER BY totalDuties DESC
    `, [days]);
    
    res.status(200).json({
      success: true,
      data: examStats
    });
  } catch (error) {
    console.error("Error fetching exam statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam statistics",
      error: error.message
    });
  }
};
