"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

interface TimeSlotPickerProps {
  selectedDate: Date;
  existingSlots?: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  workingHours?: {
    start: string;
    end: string;
  };
  slotDuration?: number;
  bufferTime?: number;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  existingSlots = [],
  onSlotsChange,
  workingHours = { start: "09:00", end: "17:00" },
  slotDuration = 60,
  bufferTime = 0,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [quickSelectDuration, setQuickSelectDuration] = useState(60);
  const [selectionMode, setSelectionMode] = useState<'single' | 'bulk'>('single');

  // Generate time slots for the day
  const availableTimeSlots = useMemo(() => {
    const slots: { time: string; available: boolean }[] = [];
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const startMinute = parseInt(workingHours.start.split(':')[1]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    const endMinute = parseInt(workingHours.end.split(':')[1]);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Generate 15-minute intervals
    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 15) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      // Check if this time conflicts with existing slots
      const isConflicted = existingSlots.some(slot => {
        const slotStart = slot.startTime;
        const slotEnd = slot.endTime;
        return timeString >= slotStart && timeString < slotEnd;
      });

      slots.push({
        time: timeString,
        available: !isConflicted
      });
    }

    return slots;
  }, [workingHours, existingSlots]);

  // Check if a time range conflicts with existing slots
  const hasConflict = (startTime: string, endTime: string) => {
    return existingSlots.some(slot => {
      return (startTime < slot.endTime && endTime > slot.startTime);
    });
  };

  // Generate end time based on start time and duration
  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Handle single slot selection
  const handleSlotClick = (startTime: string) => {
    const endTime = getEndTime(startTime, quickSelectDuration);
    
    // Check if end time exceeds working hours
    if (endTime > workingHours.end) {
      return;
    }

    // Check for conflicts
    if (hasConflict(startTime, endTime)) {
      return;
    }

    const newSlot: TimeSlot = {
      startTime,
      endTime,
      duration: quickSelectDuration
    };

    // Check if slot already exists
    const existingIndex = selectedSlots.findIndex(
      slot => slot.startTime === startTime && slot.duration === quickSelectDuration
    );

    if (existingIndex >= 0) {
      // Remove existing slot
      const updatedSlots = selectedSlots.filter((_, index) => index !== existingIndex);
      setSelectedSlots(updatedSlots);
      onSlotsChange(updatedSlots);
    } else {
      // Add new slot
      const updatedSlots = [...selectedSlots, newSlot];
      setSelectedSlots(updatedSlots);
      onSlotsChange(updatedSlots);
    }
  };

  // Handle bulk selection
  const handleBulkSelect = (startTime: string, endTime: string) => {
    const slots: TimeSlot[] = [];
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    for (let minutes = startMinutes; minutes < endMinutes; minutes += quickSelectDuration) {
      const slotStart = minutesToTime(minutes);
      const slotEnd = minutesToTime(minutes + quickSelectDuration);
      
      if (slotEnd <= workingHours.end && !hasConflict(slotStart, slotEnd)) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          duration: quickSelectDuration
        });
      }
    }

    setSelectedSlots(slots);
    onSlotsChange(slots);
  };

  // Utility functions
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Check if a time slot is selected
  const isSlotSelected = (time: string) => {
    return selectedSlots.some(slot => 
      time >= slot.startTime && time < slot.endTime
    );
  };

  // Check if a time slot can be selected (no conflicts and within duration)
  const canSelectSlot = (time: string) => {
    const endTime = getEndTime(time, quickSelectDuration);
    return endTime <= workingHours.end && !hasConflict(time, endTime);
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedSlots([]);
    onSlotsChange([]);
  };

  // Quick select common patterns
  const quickSelectMorning = () => {
    handleBulkSelect("09:00", "12:00");
  };

  const quickSelectAfternoon = () => {
    handleBulkSelect("13:00", "17:00");
  };

  const quickSelectFullDay = () => {
    handleBulkSelect(workingHours.start, workingHours.end);
  };

  return (
    <Box>
      {/* Controls */}
      <Box mb={3}>
        <Typography variant="h6" mb={2} fontWeight="600">
          Select Time Slots
        </Typography>
        
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Duration</InputLabel>
            <Select
              value={quickSelectDuration}
              onChange={(e) => setQuickSelectDuration(Number(e.target.value))}
              label="Duration"
            >
              <MenuItem value={15}>15 min</MenuItem>
              <MenuItem value={30}>30 min</MenuItem>
              <MenuItem value={45}>45 min</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
              <MenuItem value={90}>1.5 hours</MenuItem>
              <MenuItem value={120}>2 hours</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={selectionMode}
            exclusive
            onChange={(_, value) => value && setSelectionMode(value)}
            size="small"
          >
            <ToggleButton value="single">Single</ToggleButton>
            <ToggleButton value="bulk">Bulk</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Quick Select Buttons */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            onClick={quickSelectMorning}
            startIcon={<AddIcon />}
          >
            Morning (9-12)
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={quickSelectAfternoon}
            startIcon={<AddIcon />}
          >
            Afternoon (1-5)
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={quickSelectFullDay}
            startIcon={<AddIcon />}
          >
            Full Day
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={clearSelections}
            startIcon={<RemoveIcon />}
          >
            Clear All
          </Button>
        </Box>

        {selectedSlots.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {selectedSlots.length} time slot{selectedSlots.length !== 1 ? 's' : ''} selected
          </Alert>
        )}
      </Box>

      {/* Time Grid */}
      <Grid container spacing={1}>
        {availableTimeSlots.map((slot) => {
          const isSelected = isSlotSelected(slot.time);
          const canSelect = canSelectSlot(slot.time);
          const isConflicted = !slot.available;

          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={slot.time}>
              <Card
                sx={{
                  cursor: canSelect && !isConflicted ? 'pointer' : 'not-allowed',
                  opacity: isConflicted ? 0.3 : 1,
                  backgroundColor: isSelected ? 'primary.main' : 
                                  canSelect ? 'background.paper' : 'action.disabledBackground',
                  color: isSelected ? 'primary.contrastText' : 'text.primary',
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? 'primary.main' : 
                              isConflicted ? 'error.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': canSelect && !isConflicted ? {
                    transform: 'scale(1.02)',
                    boxShadow: 2,
                  } : {},
                }}
                onClick={() => canSelect && !isConflicted && handleSlotClick(slot.time)}
              >
                <CardContent sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  '&:last-child': { pb: 1 }
                }}>
                  <Typography variant="body2" fontWeight="600">
                    {slot.time}
                  </Typography>
                  {isSelected && (
                    <Typography variant="caption" display="block">
                      {quickSelectDuration}min
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Slots Summary */}
      {selectedSlots.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" mb={2} fontWeight="600">
            Selected Time Slots:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {selectedSlots.map((slot, index) => (
              <Chip
                key={index}
                label={`${slot.startTime} - ${slot.endTime}`}
                color="primary"
                variant="outlined"
                onDelete={() => {
                  const updatedSlots = selectedSlots.filter((_, i) => i !== index);
                  setSelectedSlots(updatedSlots);
                  onSlotsChange(updatedSlots);
                }}
                icon={<TimeIcon />}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TimeSlotPicker;
