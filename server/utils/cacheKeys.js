const crypto = require("crypto");

/**
 * Generate a cache key for Gemini prompts
 * Keys are deterministic - same input = same key
 */

/**
 * Generate cache key for chat
 * @param {string} prompt - User prompt
 * @returns {string} - Cache key
 */
const generateChatKey = (prompt) => {
  const hash = crypto.createHash("sha256").update(prompt).digest("hex");
  return `chat:${hash}`;
};

/**
 * Generate cache key for notes
 * @param {string} topic - Topic name
 * @returns {string} - Cache key
 */
const generateNotesKey = (topic) => {
  const normalized = topic.toLowerCase().trim();
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return `notes:${normalized}:${hash.slice(0, 8)}`;
};

/**
 * Generate cache key for quiz
 * @param {string} topic - Topic name
 * @param {string} difficulty - Difficulty level
 * @returns {string} - Cache key
 */
const generateQuizKey = (topic, difficulty) => {
  const key = `${topic.toLowerCase().trim()}:${difficulty}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return `quiz:${hash}`;
};

/**
 * Generate cache key for OCR/upload processing
 * @param {Buffer} fileBuffer - File content
 * @returns {string} - Cache key
 */
const generateUploadKey = (fileBuffer) => {
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return `upload:${hash}`;
};

/**
 * Generate cache key for question-answer processing
 * @param {string} text - Extracted text from file
 * @returns {string} - Cache key
 */
const generateAnswerKey = (text) => {
  const normalized = text.toLowerCase().trim();
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return `answer:${hash.slice(0, 12)}`;
};

/**
 * Check if topic is commonly used (cache beneficial)
 * Common topics get longer TTL
 */
const getTopicTTL = (topic) => {
  const common = [
    "recursion",
    "binary search",
    "sorting",
    "graph",
    "tree",
    "database",
    "sql",
    "algorithm",
    "data structure",
    "dbms",
    "networking",
    "os",
    "operating system",
  ];

  const lowerTopic = topic.toLowerCase();
  const isCommon = common.some((ct) => lowerTopic.includes(ct));

  // Common topics: 30 days, others: 7 days
  return isCommon ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
};

/**
 * Get cache key stats
 */
const getCacheKeyPrefix = (feature) => {
  return `${feature}:*`;
};

module.exports = {
  generateChatKey,
  generateNotesKey,
  generateQuizKey,
  generateUploadKey,
  generateAnswerKey,
  getTopicTTL,
  getCacheKeyPrefix,
};
