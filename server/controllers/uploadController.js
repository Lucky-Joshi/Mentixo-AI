const Tesseract = require("tesseract.js");
const pdfParseLib = require("pdf-parse");
const pdfParse = pdfParseLib.default || pdfParseLib;
const { generateContent } = require("../config/gemini");
const { logFeatureUsage } = require("../utils/auditLogger");

/**
 * Extract text from an image buffer using Tesseract OCR
 */
const extractTextFromImage = async (buffer) => {
  const { data: { text } } = await Tesseract.recognize(buffer, "eng", {
    logger: () => {}, // suppress progress logs
  });
  return text.trim();
};

/**
 * Extract text from a PDF buffer using pdf-parse
 */
const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text.trim();
};

/**
 * POST /api/upload
 * Accepts image or PDF, extracts text, sends to Gemini, returns answer
 */
const handleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    const { mimetype, buffer, originalname } = req.file;
    let extractedText = "";

    // --- Extract text based on file type ---
    if (mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else if (mimetype.startsWith("image/")) {
      extractedText = await extractTextFromImage(buffer);
    } else {
      res.status(400);
      throw new Error("Unsupported file type. Upload a PDF or image.");
    }

    if (!extractedText || extractedText.length < 5) {
      res.status(422);
      throw new Error("Could not extract readable text from the file.");
    }

    // --- Send to Gemini ---
    const prompt = `Answer the following question clearly and step-by-step:\n\n${extractedText}`;
    const answer = await generateContent(prompt);

    console.log(`[UPLOAD] ${new Date().toISOString()} - file: ${originalname}, chars: ${extractedText.length}`);
    
    // Log to audit trail
    logFeatureUsage(req.user._id, "upload", "file_uploaded", {
      metadata: {
        status: "success",
        fileName: originalname,
        fileSize: req.file.size,
      },
    }).catch((err) => console.error("Audit logging failed:", err));

    res.json({ success: true, extractedText, answer });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleUpload };
