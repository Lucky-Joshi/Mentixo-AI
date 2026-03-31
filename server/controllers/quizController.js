const { generateContent } = require("../config/gemini");
const { quizPrompt } = require("../utils/promptTemplates");
const Quiz = require("../models/Quiz");

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

/**
 * POST /api/quiz
 * Body: { topic, difficulty }
 */
const generateQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty = "medium" } = req.body;
    const userId = req.user._id;

    if (!topic || typeof topic !== "string") {
      res.status(400);
      throw new Error("topic is required and must be a string");
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      res.status(400);
      throw new Error(`difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}`);
    }

    const fullPrompt = quizPrompt(topic.trim(), difficulty);
    const rawResponse = await generateContent(fullPrompt);

    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    let questions;
    try {
      questions = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse quiz response from AI. Please try again.");
    }

    const quiz = await Quiz.create({
      userId,
      topic: topic.trim(),
      difficulty,
      questions,
      totalQuestions: questions.length,
    });

    console.log(`[QUIZ] ${new Date().toISOString()} - topic: ${topic}`);
    res.json({ success: true, quizId: quiz._id, questions });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/quiz/:id/submit
 * Body: { answers: ["A. option1", "B. option2", ...] }
 * Calculates and saves score
 */
const submitQuiz = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { answers } = req.body;

    const quiz = await Quiz.findOne({ _id: req.params.id, userId });
    if (!quiz) {
      res.status(404);
      throw new Error("Quiz not found");
    }

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] && answers[i] === q.answer) correct++;
    });

    quiz.score = correct;
    await quiz.save();

    console.log(`[QUIZ SUBMIT] user: ${userId}, score: ${correct}/${quiz.totalQuestions}`);
    res.json({
      success: true,
      score: correct,
      total: quiz.totalQuestions,
      percentage: Math.round((correct / quiz.totalQuestions) * 100),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/quiz/history
 */
const getQuizHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const quizzes = await Quiz.find({ userId })
      .select("topic difficulty score totalQuestions createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, quizzes });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateQuiz, submitQuiz, getQuizHistory };
