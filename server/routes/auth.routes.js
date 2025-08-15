const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { auth } = require("../middlewares/auth.middleware");
const {
  validate,
  loginSchema,
  registerSchema,
  employerRegistrationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../middlewares/validation.middleware");

// Authentication routes
router.post("/register", authController.register); // Temporarily remove validation
router.post("/register/employer", authController.registerEmployer); // New dedicated employer registration
router.post("/register/candidate", authController.registerCandidate); // New dedicated candidate registration
router.post("/register/recruitment-partner", authController.registerRecruitmentPartner); // New dedicated recruitment partner registration
router.post("/register/sales-person", authController.registerSalesPerson); // New dedicated sales person registration
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
