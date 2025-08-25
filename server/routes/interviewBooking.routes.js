const express = require("express");
const router = express.Router();
const interviewBookingController = require("../controllers/interviewBooking.controller");

// Public routes (no auth required for candidates using tokens)

// Get available slots for booking
router.get("/slots", interviewBookingController.getAvailableSlots);

// Book a specific slot
router.post("/book", interviewBookingController.bookInterviewSlot);

// Get booking status
router.get("/status/:token", interviewBookingController.getBookingStatus);

module.exports = router;
