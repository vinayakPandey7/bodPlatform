const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { auth } = require("../middlewares/auth.middleware");
const {
  validate,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../middlewares/validation.middleware");

// Authentication routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.put(
  "/reset-password/:resetToken",
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.get("/me", auth, authController.getMe);

module.exports = router;
