const express = require("express");
const { signup, login, syncAuth0User } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/sync", syncAuth0User); // called by Auth0 Action

module.exports = router;
