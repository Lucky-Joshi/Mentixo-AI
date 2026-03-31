const { generateContent } = require("../config/gemini");
const { chatPrompt } = require("../utils/promptTemplates");
const Chat = require("../models/Chat");

const MAX_PROMPT_LENGTH = 2000;

/**
 * POST /api/chat
 * Body: { prompt, chatId? }  — chatId allows appending to an existing conversation
 */
const handleChat = async (req, res, next) => {
  try {
    const { prompt, chatId } = req.body;
    const userId = req.user._id;

    if (!prompt || typeof prompt !== "string") {
      res.status(400);
      throw new Error("prompt is required and must be a string");
    }
    if (prompt.trim().length > MAX_PROMPT_LENGTH) {
      res.status(400);
      throw new Error(`Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`);
    }

    const fullPrompt = chatPrompt(prompt.trim());
    const reply = await generateContent(fullPrompt);

    let chat;

    if (chatId) {
      // Append to existing conversation
      chat = await Chat.findOneAndUpdate(
        { _id: chatId, userId },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", text: prompt.trim() },
                { role: "ai", text: reply },
              ],
            },
          },
        },
        { new: true }
      );
    }

    if (!chat) {
      // Start a new conversation
      chat = await Chat.create({
        userId,
        title: prompt.trim().slice(0, 60), // first 60 chars as title
        messages: [
          { role: "user", text: prompt.trim() },
          { role: "ai", text: reply },
        ],
      });
    }

    console.log(`[CHAT] ${new Date().toISOString()} - user: ${userId}`);
    res.json({ success: true, reply, chatId: chat._id });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/history
 * Returns all chat sessions for the logged-in user
 */
const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId })
      .select("title messages createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleChat, getChatHistory };
