const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availability.controller");
const { auth, authorizeRoles } = require("../middlewares/auth.middleware");

// Employer availability management routes
router.get(
  "/",
  auth,
  authorizeRoles("employer"),
  availabilityController.getAvailabilitySlots
);

router.post(
  "/",
  auth,
  authorizeRoles("employer"),
  availabilityController.createAvailabilitySlot
);

router.put(
  "/:id",
  auth,
  authorizeRoles("employer"),
  availabilityController.updateAvailabilitySlot
);

router.delete(
  "/:id",
  auth,
  authorizeRoles("employer"),
  availabilityController.deleteAvailabilitySlot
);

router.patch(
  "/:id/toggle-status",
  auth,
  authorizeRoles("employer"),
  availabilityController.toggleSlotStatus
);

// Public route for candidates to view available slots
router.get(
  "/booking/available",
  auth,
  authorizeRoles("candidate", "recruitment_partner"),
  availabilityController.getAvailableSlotsForBooking
);

module.exports = router;
