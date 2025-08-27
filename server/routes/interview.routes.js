const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interview.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Employer routes (require authentication)
router.use("/employer", authMiddleware.authenticateToken);

// 1. Set employer availability calendar
router.post("/employer/availability", interviewController.setEmployerAvailability);

// 2. Get employer's interview calendar
router.get("/employer/calendar", interviewController.getEmployerCalendar);

// 3. Update interview status
router.put("/employer/interview/:bookingId/status", interviewController.updateInterviewStatus);

// 4. Send interview invitation to candidate
router.post("/employer/invitation", interviewController.sendInterviewInvitation);

// Public routes (no authentication required)

// 5. Get available slots for candidate selection
router.get("/slots", interviewController.getAvailableSlots);

// 6. Schedule interview (called when candidate selects slot)
router.post("/schedule", interviewController.scheduleInterview);

// 7. Get interview invitation details (for candidate selection page)
router.get("/invitation/:token", interviewController.getInterviewInvitation);

module.exports = router;
