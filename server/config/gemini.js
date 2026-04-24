const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getCache, setCache } = require("./redis");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate content using Gemini with cache and retry logic
 * @param {string} prompt - The full prompt to send
 * @param {object} options - { retries, cacheKey, cacheTTL }
 * @returns {string} - Generated text response
 */
const generateContent = async (prompt, options = {}) => {
  const { retries = 3, cacheKey = null, cacheTTL = 7 * 24 * 60 * 60 } = options;

  // Try cache first if key provided
  if (cacheKey) {
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Cache successful result
      if (cacheKey) {
        await setCache(cacheKey, text, cacheTTL);
      }

      return text;
    } catch (error) {
      console.error(`Gemini attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) throw error;
      // Wait 1s before retrying
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
};

module.exports = { generateContent };