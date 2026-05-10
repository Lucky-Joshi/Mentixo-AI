const crypto = require("crypto");

const generateChatKey = (prompt) => {
  const hash = crypto.createHash("sha256").update(prompt).digest("hex");
  return `chat:${hash}`;
};

const generateNotesKey = (topic) => {
  const normalized = topic.toLowerCase().trim();
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return `notes:${normalized}:${hash.slice(0, 8)}`;
};

const generateQuizKey = (topic, difficulty) => {
  const key = `${topic.toLowerCase().trim()}:${difficulty}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return `quiz:${hash}`;
};

const generateUploadKey = (fileBuffer) => {
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return `upload:${hash}`;
};

const generateAnswerKey = (text) => {
  const normalized = text.toLowerCase().trim();
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return `answer:${hash.slice(0, 12)}`;
};

const getTopicTTL = (topic) => {
  return 7 * 24 * 60 * 60;
};

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
