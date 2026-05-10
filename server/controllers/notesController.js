const prisma = require("../lib/prisma");
const { generateContent } = require("../config/gemini");
const { notesPrompt } = require("../utils/promptTemplates");
const { generateNotesKey, getTopicTTL } = require("../utils/cacheKeys");
const { logFeatureUsage } = require("../utils/auditLogger");

/**
 * POST /api/notes
 * Body: { topic: string }
 */
const generateNotes = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const userId = req.user.id;

    if (!topic || typeof topic !== "string") {
      res.status(400);
      throw new Error("topic is required and must be a string");
    }

    const fullPrompt = notesPrompt(topic.trim());
    const cacheKey = generateNotesKey(topic.trim());
    const cacheTTL = getTopicTTL(topic);
    const notes = await generateContent(fullPrompt, { cacheKey, cacheTTL });

    const note = await prisma.note.create({
      data: {
        userId,
        topic: topic.trim(),
        content: notes,
      },
    });

    console.log(`[NOTES] ${new Date().toISOString()} - topic: ${topic}`);

    // Log to audit trail
    logFeatureUsage(userId, "notes", "notes_generated", {
      resourceId: note.id,
      metadata: {
        status: "success",
        topic: topic.trim(),
      },
    }).catch((err) => console.error("Audit logging failed:", err));

    res.json({ success: true, notes, remaining: req.usageRemaining });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notes/history
 * Returns all saved notes for the logged-in user
 */
const getNotesHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notes = await prisma.note.findMany({
      where: { userId },
      select: { id: true, topic: true, content: true, createdAt: true },
      orderBy: { createdAt: -1 },
      take: 20,
    });

    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateNotes, getNotesHistory };
