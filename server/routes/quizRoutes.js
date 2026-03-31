const express = require("express");
const { generateQuiz, submitQuiz, getQuizHistory } = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");
const { checkMessageLimit } = require("../middleware/usageMiddleware");

const router = express.Router();

router.post("/", protect, checkMessageLimit, generateQuiz);
router.post("/:id/submit", protect, submitQuiz);
router.get("/history", protect, getQuizHistory);

module.exports = router;
