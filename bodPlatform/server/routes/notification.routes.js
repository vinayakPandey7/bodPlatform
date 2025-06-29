const express = require("express");
const router = express.Router();
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

// Placeholder for notification controller
// Actual implementation would be added later

// Basic routes
router.get("/", auth, (req, res) => {
  res.json({ message: "Get all notifications route" });
});

module.exports = router;
