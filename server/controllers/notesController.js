const { generateContent } = require("../config/gemini");
const { notesPrompt } = require("../utils/promptTemplates");
const { logFeatureUsage } = require("../utils/auditLogger");
const Note = require("../models/Note");

/**
 * POST /api/notes
 * Body: { topic: string }
 */
const generateNotes = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const userId = req.user._id;

    if (!topic || typeof topic !== "string") {
      res.status(400);
      throw new Error("topic is required and must be a string");
    }

    const fullPrompt = notesPrompt(topic.trim());
    const notes = await generateContent(fullPrompt);

    const note = await Note.create({ userId, topic: topic.trim(), content: notes });

    console.log(`[NOTES] ${new Date().toISOString()} - topic: ${topic}`);
    
    // Log to audit trail
    logFeatureUsage(userId, "notes", "notes_generated", {
      resourceId: note._id,
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
    const userId = req.user._id;
    const notes = await Note.find({ userId })
      .select("topic content createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateNotes, getNotesHistory };
