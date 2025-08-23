const AvailabilitySlot = require("../models/availabilitySlot.model");
const Employer = require("../models/employer.model");
const Interview = require("../models/interview.model");

// Get employer's availability slots
exports.getAvailabilitySlots = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    // Find employer profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Build query
    const query = { employer: employer._id, isActive: true };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      query.status = status;
    }

    const slots = await AvailabilitySlot.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate('employer', 'companyName ownerName');

    res.json({ 
      success: true, 
      slots,
      count: slots.length 
    });
  } catch (error) {
    console.error("Get availability slots error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Create new availability slot
exports.createAvailabilitySlot = async (req, res) => {
  try {
    const {
      title,
      date,
      startTime,
      endTime,
      duration,
      timezone,
      isRecurring,
      recurringPattern,
      maxBookings,
      meetingType,
      meetingDetails,
      bufferTime
    } = req.body;

    // Find employer profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Validate time format and logic
    if (startTime >= endTime) {
      return res.status(400).json({ 
        message: "Start time must be before end time" 
      });
    }

    // Check for conflicts with existing slots
    const conflictingSlots = await AvailabilitySlot.find({
      employer: employer._id,
      date: new Date(date),
      isActive: true,
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
          ]
        }
      ]
    });

    if (conflictingSlots.length > 0) {
      return res.status(400).json({ 
        message: "Time slot conflicts with existing availability",
        conflictingSlots: conflictingSlots.map(slot => ({
          id: slot._id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      });
    }

    // Create the slot
    const slotData = {
      employer: employer._id,
      title: title || "Interview Slot",
      date: new Date(date),
      startTime,
      endTime,
      duration: duration || 60,
      timezone: timezone || "America/New_York",
      isRecurring: isRecurring || false,
      maxBookings: maxBookings || 1,
      meetingType: meetingType || "video",
      meetingDetails: meetingDetails || {},
      bufferTime: bufferTime || { before: 0, after: 0 }
    };

    if (isRecurring && recurringPattern) {
      slotData.recurringPattern = recurringPattern;
    }

    const slot = new AvailabilitySlot(slotData);
    await slot.save();

    // If recurring, create additional slots
    if (isRecurring && recurringPattern) {
      await createRecurringSlots(slot, recurringPattern);
    }

    await slot.populate('employer', 'companyName ownerName');

    res.status(201).json({ 
      success: true, 
      message: "Availability slot created successfully",
      slot 
    });
  } catch (error) {
    console.error("Create availability slot error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update availability slot
exports.updateAvailabilitySlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find employer profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Find and update slot
    const slot = await AvailabilitySlot.findOne({ 
      _id: id, 
      employer: employer._id 
    });

    if (!slot) {
      return res.status(404).json({ message: "Availability slot not found" });
    }

    // Check if slot has bookings before allowing certain updates
    if (slot.currentBookings > 0 && (updateData.date || updateData.startTime || updateData.endTime)) {
      return res.status(400).json({ 
        message: "Cannot modify date/time of slot with existing bookings" 
      });
    }

    // Validate time logic if updating times
    if (updateData.startTime && updateData.endTime && updateData.startTime >= updateData.endTime) {
      return res.status(400).json({ 
        message: "Start time must be before end time" 
      });
    }

    Object.assign(slot, updateData);
    await slot.save();
    await slot.populate('employer', 'companyName ownerName');

    res.json({ 
      success: true, 
      message: "Availability slot updated successfully",
      slot 
    });
  } catch (error) {
    console.error("Update availability slot error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete availability slot
exports.deleteAvailabilitySlot = async (req, res) => {
  try {
    const { id } = req.params;

    // Find employer profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Find slot
    const slot = await AvailabilitySlot.findOne({ 
      _id: id, 
      employer: employer._id 
    });

    if (!slot) {
      return res.status(404).json({ message: "Availability slot not found" });
    }

    // Check if slot has bookings
    if (slot.currentBookings > 0) {
      return res.status(400).json({ 
        message: "Cannot delete slot with existing bookings. Cancel bookings first." 
      });
    }

    await AvailabilitySlot.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: "Availability slot deleted successfully" 
    });
  } catch (error) {
    console.error("Delete availability slot error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get available slots for booking (public endpoint for candidates)
exports.getAvailableSlotsForBooking = async (req, res) => {
  try {
    const { employerId, startDate, endDate } = req.query;

    if (!employerId) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    // Build query for available slots
    const query = {
      employer: employerId,
      status: 'available',
      isActive: true,
      date: { $gte: new Date() }, // Only future slots
      $expr: { $lt: ['$currentBookings', '$maxBookings'] } // Available capacity
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const slots = await AvailabilitySlot.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate('employer', 'companyName ownerName')
      .select('-createdAt -updatedAt -__v');

    // Group slots by date for better UI organization
    const slotsByDate = slots.reduce((acc, slot) => {
      const dateKey = slot.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    }, {});

    res.json({ 
      success: true, 
      slots,
      slotsByDate,
      count: slots.length 
    });
  } catch (error) {
    console.error("Get available slots for booking error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Toggle slot status (activate/deactivate)
exports.toggleSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find employer profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const slot = await AvailabilitySlot.findOne({ 
      _id: id, 
      employer: employer._id 
    });

    if (!slot) {
      return res.status(404).json({ message: "Availability slot not found" });
    }

    slot.isActive = !slot.isActive;
    await slot.save();

    res.json({ 
      success: true, 
      message: `Slot ${slot.isActive ? 'activated' : 'deactivated'} successfully`,
      slot 
    });
  } catch (error) {
    console.error("Toggle slot status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Helper function to create recurring slots
async function createRecurringSlots(originalSlot, recurringPattern) {
  const { frequency, daysOfWeek, endDate } = recurringPattern;
  const slots = [];
  
  let currentDate = new Date(originalSlot.date);
  const finalDate = new Date(endDate);
  
  while (currentDate <= finalDate) {
    if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
      // For weekly recurring, create slots for specified days of week
      const dayOfWeek = currentDate.getDay();
      if (daysOfWeek.includes(dayOfWeek) && currentDate.getTime() !== originalSlot.date.getTime()) {
        const slotData = {
          employer: originalSlot.employer,
          title: originalSlot.title,
          date: new Date(currentDate),
          startTime: originalSlot.startTime,
          endTime: originalSlot.endTime,
          duration: originalSlot.duration,
          timezone: originalSlot.timezone,
          isRecurring: false, // Individual slots are not recurring
          maxBookings: originalSlot.maxBookings,
          meetingType: originalSlot.meetingType,
          meetingDetails: originalSlot.meetingDetails,
          bufferTime: originalSlot.bufferTime
        };
        
        slots.push(slotData);
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  if (slots.length > 0) {
    await AvailabilitySlot.insertMany(slots);
  }
}

module.exports = exports;
