const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateContent = async (prompt, options = {}) => {
  const { retries = 3, cacheKey, cacheTTL } = options;

  // Use gemini-1.5-flash (available and reliable)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }
      
      return text;
    } catch (error) {
      console.error(`[GEMINI] Attempt ${attempt}/${retries} failed: ${error.message}`);
      
      if (attempt === retries) {
        throw new Error(`Gemini API failed after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
};

module.exports = { generateContent };