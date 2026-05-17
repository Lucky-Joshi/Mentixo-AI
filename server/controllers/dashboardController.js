const prisma = require("../lib/prisma");

/**
 * GET /api/dashboard
 * Returns stats and recent activity for the logged-in user
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Run all queries in parallel for performance
    const [totalChats, totalNotes, totalQuizzes, quizScores, recentChats, recentNotes, recentQuizzes] =
      await Promise.all([
        prisma.chat.count({ where: { userId } }),
        prisma.note.count({ where: { userId } }),
        prisma.quiz.count({ where: { userId } }),

        // Only quizzes that have been submitted (score is not null)
        prisma.quiz.findMany({
          where: { userId, score: { not: null } },
          select: { score: true, totalQuestions: true },
        }),

        prisma.chat.findMany({
          where: { userId },
          select: { id: true, title: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),

        prisma.note.findMany({
          where: { userId },
          select: { id: true, topic: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),

        prisma.quiz.findMany({
          where: { userId },
          select: { id: true, topic: true, score: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
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
