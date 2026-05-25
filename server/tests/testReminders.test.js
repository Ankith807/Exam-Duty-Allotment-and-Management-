const { getGeminiEmailContent } = require('../controllers/aiEmailAgent');

describe('Real API Tests (use sparingly)', () => {
  // Only run these if explicitly requested
  if (process.env.TEST_REAL_API === 'true') {
    test('real API response', async () => {
      const content = await getGeminiEmailContent(
        "Write a 2-sentence exam duty reminder for CS101"
      );
      console.log("Real API Response:", content);
      expect(content.length).toBeGreaterThan(20);
    }, 10000); // Longer timeout
  } else {
    test.skip('skipping real API tests', () => {});
  }
});