const express = require("express");
const { handleChat, getChatHistory } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { checkMessageLimit } = require("../middleware/usageMiddleware");

const router = express.Router();

router.post("/", protect, checkMessageLimit, handleChat);
router.get("/history", protect, getChatHistory);

module.exports = router;
