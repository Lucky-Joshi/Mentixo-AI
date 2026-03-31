const Chat = require("../models/Chat");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");

/**
 * GET /api/dashboard
 * Returns stats and recent activity for the logged-in user
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run all queries in parallel for performance
    const [totalChats, totalNotes, totalQuizzes, quizScores, recentChats, recentNotes, recentQuizzes] =
      await Promise.all([
        Chat.countDocuments({ userId }),
        Note.countDocuments({ userId }),
        Quiz.countDocuments({ userId }),

        // Only quizzes that have been submitted (score is not null)
        Quiz.find({ userId, score: { $ne: null } }).select("score totalQuestions"),

        Chat.find({ userId }).select("title createdAt").sort({ createdAt: -1 }).limit(5),
        Note.find({ userId }).select("topic createdAt").sort({ createdAt: -1 }).limit(5),
        Quiz.find({ userId }).select("topic score createdAt").sort({ createdAt: -1 }).limit(5),
      ]);

    // Average score as a percentage across all submitted quizzes
    let averageScore = 0;
    if (quizScores.length > 0) {
      const totalPct = quizScores.reduce((sum, q) => {
        return sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0);
      }, 0);
      averageScore = Math.round(totalPct / quizScores.length);
    }

    // Merge and sort last 5 activities across all types
    const recentActivity = [
      ...recentChats.map((c) => ({
        type: "chat",
        title: c.title || "Chat session",
        date: c.createdAt,
      })),
      ...recentNotes.map((n) => ({
        type: "note",
        title: n.topic,
        date: n.createdAt,
      })),
      ...recentQuizzes.map((q) => ({
        type: "quiz",
        title: q.topic,
        score: q.score,
        date: q.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      success: true,
      totalChats,
      totalNotes,
      totalQuizzes,
      averageScore,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
