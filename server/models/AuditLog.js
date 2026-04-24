const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    featureType: {
      type: String,
      enum: ["chat", "notes", "quiz", "upload"],
      required: true,
      index: true,
    },
    action: { type: String, required: true }, // e.g., "message_sent", "notes_generated", "quiz_created", "file_uploaded"
    resourceId: { type: mongoose.Schema.Types.ObjectId }, // Reference to Chat/Note/Quiz doc
    metadata: {
      topic: String, // for notes/quiz
      difficulty: String, // for quiz
      fileName: String, // for upload
      fileSize: Number, // for upload
      messageCount: Number, // for chat
      questionCount: Number, // for quiz
      status: String, // success/failed
      errorMessage: String, // if failed
    },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false } // We manually set timestamp
);

// Compound index for efficient querying
auditLogSchema.index({ userId: 1, featureType: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
