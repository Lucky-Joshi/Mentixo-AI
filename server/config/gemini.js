const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate content using Gemini with retry logic
 * @param {string} prompt - The full prompt to send
 * @param {number} retries - Number of retry attempts
 * @returns {string} - Generated text response
 */
const generateContent = async (prompt, retries = 3) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error(`Gemini attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) throw error;
      // Wait 1s before retrying
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
};

module.exports = { generateContent }; 