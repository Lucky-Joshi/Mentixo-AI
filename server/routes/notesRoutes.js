const express = require("express");
const { generateNotes, getNotesHistory } = require("../controllers/notesController");
const { protect } = require("../middleware/authMiddleware");
const { checkMessageLimit } = require("../middleware/usageMiddleware");

const router = express.Router();

router.post("/", protect, checkMessageLimit, generateNotes);
router.get("/history", protect, getNotesHistory);

module.exports = router;
