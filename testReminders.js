const { sendExamSelectionReminders } = require('./yourControllerPath');
const db = require('')

// Mock request and response objects
const mockRequest = (body) => ({
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Test Cases
async function testReminders() {
  try {
    // Case 1: Test with valid exam_id
    console.log("\nTEST 1: Valid exam_id");
    const exam = await db.promise().query('SELECT id FROM exams LIMIT 1');
    const req = mockRequest({ exam_id: exam[0][0].id });
    const res = mockResponse();
    await sendExamSelectionReminders(req, res);
    console.log("Response:", res.json.mock.calls[0][0]);

    // Case 2: Test with missing exam_id
    console.log("\nTEST 2: Missing exam_id");
    const req2 = mockRequest({});
    const res2 = mockResponse();
    await sendExamSelectionReminders(req2, res2);
    console.log("Response:", res2.json.mock.calls[0][0]);

    // Case 3: Test with invalid exam_id
    console.log("\nTEST 3: Invalid exam_id");
    const req3 = mockRequest({ exam_id: 99999 });
    const res3 = mockResponse();
    await sendExamSelectionReminders(req3, res3);
    console.log("Response:", res3.json.mock.calls[0][0]);

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    db.end(); // Close DB connection
  }
}

testReminders();