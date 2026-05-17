const prisma = require("../lib/prisma");
const { generateContent } = require("../config/gemini");
const { quizPrompt } = require("../utils/promptTemplates");
const { generateQuizKey, getTopicTTL } = require("../utils/cacheKeys");
const { logFeatureUsage } = require("../utils/auditLogger");

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

/**
 * POST /api/quiz
 * Body: { topic, difficulty }
 */
const generateQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty = "medium" } = req.body;
    const userId = req.user.id;

    if (!topic || typeof topic !== "string") {
      res.status(400);
      throw new Error("topic is required and must be a string");
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      res.status(400);
      throw new Error(`difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}`);
    }

    const fullPrompt = quizPrompt(topic.trim(), difficulty);
    const cacheKey = generateQuizKey(topic.trim(), difficulty);
    const cacheTTL = getTopicTTL(topic);
    const rawResponse = await generateContent(fullPrompt, { cacheKey, cacheTTL });

    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    let questions;
    try {
      questions = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse quiz response from AI. Please try again.");
    }

    const quiz = await prisma.quiz.create({
      data: {
        userId,
        topic: topic.trim(),
        difficulty,
        totalQuestions: questions.length,
        questions: {
          create: questions.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
      },
      include: { questions: true },
    });

    console.log(`[QUIZ] ${new Date().toISOString()} - topic: ${topic}`);

    // Log to audit trail
    logFeatureUsage(userId, "quiz", "quiz_created", {
      resourceId: quiz.id,
      metadata: {
        status: "success",
        topic: topic.trim(),
        difficulty,
        questionCount: questions.length,
      },
    }).catch((err) => console.error("Audit logging failed:", err));

    res.json({
      success: true,
      quizId: quiz.id,
      questions: quiz.questions,
      remaining: req.usageRemaining,
    });
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
    const userId = req.user.id;
    const { answers } = req.body;

    const quiz = await prisma.quiz.findFirst({
      where: { id: req.params.id, userId },
      include: { questions: true },
    });

    if (!quiz) {
      res.status(404);
      throw new Error("Quiz not found");
    }

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] && answers[i] === q.answer) correct++;
    });

    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { score: correct },
    });

    console.log(`[QUIZ SUBMIT] user: ${userId}, score: ${correct}/${quiz.totalQuestions}`);

    // Log to audit trail
    logFeatureUsage(userId, "quiz", "quiz_submitted", {
      resourceId: quiz.id,
      metadata: {
        status: "success",
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        score: correct,
        totalQuestions: quiz.totalQuestions,
      },
    }).catch((err) => console.error("Audit logging failed:", err));

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
    const userId = req.user.id;
    const quizzes = await prisma.quiz.findMany({
      where: { userId },
      select: {
        id: true,
        topic: true,
        difficulty: true,
        score: true,
        totalQuestions: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ success: true, quizzes });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateQuiz, submitQuiz, getQuizHistory };
