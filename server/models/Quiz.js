const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
});

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, required: true },
    difficulty: { type: String, default: "medium" },
    questions: [questionSchema],
    score: { type: Number, default: null },     // null = not submitted yet
    totalQuestions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
