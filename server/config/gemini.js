const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateContent = async (prompt, options = {}) => {
  const { retries = 3 } = options;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (error) {
      console.error(`Gemini attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) throw error;
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
};

module.exports = { generateContent };