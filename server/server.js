require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notesRoutes = require("./routes/notesRoutes");
const quizRoutes = require("./routes/quizRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "production";

console.log(`[SERVER] Starting in ${NODE_ENV} mode on port ${PORT}`);
console.log(`[SERVER] JWT_SECRET: ${process.env.JWT_SECRET ? "SET" : "NOT SET"}`);
console.log(`[SERVER] DATABASE_URL: ${process.env.DATABASE_URL ? "SET" : "NOT SET"}`);
console.log(`[SERVER] GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? "SET" : "NOT SET"}`);

// --- Security headers ---
app.use(helmet());

// --- Gzip compression ---
app.use(compression());

// --- CORS ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "https://mentixo.netlify.app", "https://www.mentixo.netlify.app"];

console.log("[CORS] Allowed origins:", allowedOrigins);

app.use(cors({
  origin: true, // Allow all origins for now (debug mode)
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// --- Body parser ---
app.use(express.json({ limit: "10kb" }));

// --- IP rate limit: 100 req / 15 min ---
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", ipLimiter);

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "Mentixo AI server is running",
    version: "2.0",
    env: NODE_ENV,
  });
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Start with graceful shutdown ---
connectDB().then(() => {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[${NODE_ENV}] Server running on port ${PORT}`);
    console.log(`[SERVER] Health check: GET /health`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received — shutting down gracefully`);
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}).catch((error) => {
  console.error("[ERROR] Failed to connect to database:", error.message);
  console.error("[ERROR] Server startup failed");
  process.exit(1);
});
