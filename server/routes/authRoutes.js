const express = require("express");
const { signup, login, refreshAccessToken, logout, syncAuth0User } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", protect, logout);
router.post("/sync", syncAuth0User); // called by Auth0 Action

module.exports = router;
