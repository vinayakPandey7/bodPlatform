const AvailabilitySlot = require("../models/availabilitySlot.model");
const Employer = require("../models/employer.model");
const Interview = require("../models/interview.model");

// Get employer's availability slots with enhanced filtering
exports.getAvailabilitySlots = async (req, res) => {
  try {
    const { startDate, endDate, status, date } = req.query;
    
    // Find employer profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Build query
    const query = { employer: employer._id, isActive: true };
    
    if (date) {
      // If specific date is requested, get all slots for that date
      query.date = new Date(date);
    } else if (startDate && endDate) {
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

    // Group slots by date for easier frontend consumption
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
    console.error("Get availability slots error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Create multiple availability slots for a day
exports.createMultipleSlots = async (req, res) => {
  try {
    const { date, timeSlots, defaultSettings } = req.body;

    // Find employer profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    if (!date || !timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Date and timeSlots array are required" 
      });
    }

    // Normalize the date to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const createdSlots = [];
    const errors = [];

    // Process each time slot
    for (const timeSlot of timeSlots) {
      try {
        const { startTime, endTime, duration, title, meetingType, meetingDetails, maxBookings } = timeSlot;

        // Validate required fields
        if (!startTime || !endTime) {
          errors.push({ timeSlot, error: "Start time and end time are required" });
          continue;
        }

        // Validate time format and logic
        if (startTime >= endTime) {
          errors.push({ timeSlot, error: "Start time must be before end time" });
          continue;
        }

        // Check for conflicts with existing slots
        const conflictingSlots = await AvailabilitySlot.find({
          employer: employer._id,
          date: {
            $gte: new Date(normalizedDate.getTime()),
            $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
          },
          isActive: true,
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
          ]
        });

        if (conflictingSlots.length > 0) {
          errors.push({ 
            timeSlot, 
            error: `Time slot ${startTime}-${endTime} overlaps with existing availability` 
          });
          continue;
        }

        // Create the slot
        const slotData = {
          employer: employer._id,
          title: title || defaultSettings?.title || "Interview Slot",
          date: normalizedDate,
          startTime,
          endTime,
          duration: duration || defaultSettings?.duration || 60,
          timezone: defaultSettings?.timezone || "America/New_York",
          maxBookings: maxBookings || defaultSettings?.maxBookings || 1,
          meetingType: meetingType || defaultSettings?.meetingType || "video",
          meetingDetails: meetingDetails || defaultSettings?.meetingDetails || {},
          bufferTime: defaultSettings?.bufferTime || { before: 0, after: 0 }
        };

        const slot = new AvailabilitySlot(slotData);
        await slot.save();
        await slot.populate('employer', 'companyName ownerName');
        
        createdSlots.push(slot);
      } catch (error) {
        errors.push({ timeSlot, error: error.message });
      }
    }

    res.status(createdSlots.length > 0 ? 201 : 400).json({ 
      success: createdSlots.length > 0,
      message: `${createdSlots.length} slots created successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      createdSlots,
      errors: errors.length > 0 ? errors : undefined,
      totalCreated: createdSlots.length,
      totalErrors: errors.length
    });
  } catch (error) {
    console.error("Create multiple slots error:", error);
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

    // Normalize the date to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Check for overlapping time conflicts with existing slots on the same date
    const conflictingSlots = await AvailabilitySlot.find({
      employer: employer._id,
      date: {
        $gte: new Date(normalizedDate.getTime()),
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true,
      $and: [
        { startTime: { $lt: endTime } },
        { endTime: { $gt: startTime } }
      ]
    });

    console.log('Checking conflicts for:', {
      employerId: employer._id,
      date: normalizedDate,
      startTime,
      endTime,
      conflictingSlots: conflictingSlots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        title: s.title
      }))
    });

    if (conflictingSlots.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Time slot overlaps with existing availability. Please choose a different time.",
        conflictingSlots: conflictingSlots.map(slot => ({
          id: slot._id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          title: slot.title
        }))
      });
    }

    // Create the slot
    const slotData = {
      employer: employer._id,
      title: title || "Interview Slot",
      date: normalizedDate,
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
        message: "Cannot delete slot with existing bookings." 
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

// Get availability slots for a specific day
exports.getDayAvailability = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Find employer profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Normalize the date to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Get all slots for the specific date
    const slots = await AvailabilitySlot.find({
      employer: employer._id,
      date: {
        $gte: new Date(normalizedDate.getTime()),
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true
    }).sort({ startTime: 1 })
      .populate('employer', 'companyName ownerName');

    // Generate time grid (30-minute intervals from 9 AM to 6 PM)
    const timeGrid = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const existingSlot = slots.find(slot => slot.startTime === timeSlot);
        
        timeGrid.push({
          time: timeSlot,
          slot: existingSlot || null,
          available: !existingSlot
        });
      }
    }

    res.json({ 
      success: true, 
      date,
      slots,
      timeGrid,
      totalSlots: slots.length
    });
  } catch (error) {
    console.error("Get day availability error:", error);
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

// Helper function to check if two time slots overlap
function timeSlotsOverlap(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

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
