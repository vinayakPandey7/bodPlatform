"use client";
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Calendar, Clock, Users, Plus, X, Save } from "lucide-react";
import { useSetEmployerAvailability, useEmployerCalendar } from "@/lib/hooks/interview.hooks";
import { AvailabilitySlot } from "@/lib/fetchers";

interface InterviewCalendarProps {
  open: boolean;
  onClose: () => void;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxCandidates: number;
}

const InterviewCalendar: React.FC<InterviewCalendarProps> = ({ open, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot>({
    startTime: "09:00",
    endTime: "10:00",
    isAvailable: true,
    maxCandidates: 1,
  });

  const { mutate: setAvailability, isPending } = useSetEmployerAvailability();
  const { data: calendarData } = useEmployerCalendar();

  // Generate time options (9 AM to 6 PM)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      options.push(time);
    }
    return options;
  }, []);

  const addTimeSlot = () => {
    if (currentSlot.startTime && currentSlot.endTime) {
      setTimeSlots([...timeSlots, { ...currentSlot }]);
      setCurrentSlot({
        startTime: "09:00",
        endTime: "10:00",
        isAvailable: true,
        maxCandidates: 1,
      });
    }
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedDate || timeSlots.length === 0) {
      alert("Please select a date and add at least one time slot");
      return;
    }

    const slots: AvailabilitySlot[] = timeSlots.map(slot => ({
      date: selectedDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      maxCandidates: slot.maxCandidates,
      timezone: "America/New_York",
    }));

    setAvailability(slots, {
      onSuccess: () => {
        onClose();
        setTimeSlots([]);
        setSelectedDate("");
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Calendar className="h-5 w-5" />
          Set Interview Availability
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Date Selection */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Select Date
            </Typography>
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split("T")[0] }}
            />
          </Grid>

          {/* Time Slots */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Time Slots
            </Typography>
            
            {/* Add New Slot */}
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Start Time</InputLabel>
                <Select
                  value={currentSlot.startTime}
                  onChange={(e) => setCurrentSlot({ ...currentSlot, startTime: e.target.value })}
                  label="Start Time"
                >
                  {timeOptions.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>End Time</InputLabel>
                <Select
                  value={currentSlot.endTime}
                  onChange={(e) => setCurrentSlot({ ...currentSlot, endTime: e.target.value })}
                  label="End Time"
                >
                  {timeOptions.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                type="number"
                label="Max Candidates"
                value={currentSlot.maxCandidates}
                onChange={(e) => setCurrentSlot({ ...currentSlot, maxCandidates: parseInt(e.target.value) })}
                size="small"
                sx={{ width: 120 }}
                inputProps={{ min: 1, max: 10 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={currentSlot.isAvailable}
                    onChange={(e) => setCurrentSlot({ ...currentSlot, isAvailable: e.target.checked })}
                  />
                }
                label="Available"
              />

              <Button
                variant="outlined"
                startIcon={<Plus />}
                onClick={addTimeSlot}
                disabled={!currentSlot.startTime || !currentSlot.endTime}
              >
                Add Slot
              </Button>
            </Box>

            {/* Existing Slots */}
            <Box>
              {timeSlots.map((slot, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  p={2}
                  border={1}
                  borderColor="divider"
                  borderRadius={1}
                  mb={1}
                >
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Typography>
                    {slot.startTime} - {slot.endTime}
                  </Typography>
                  <Chip
                    icon={<Users />}
                    label={`${slot.maxCandidates} candidate${slot.maxCandidates > 1 ? "s" : ""}`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={slot.isAvailable ? "Available" : "Unavailable"}
                    size="small"
                    color={slot.isAvailable ? "success" : "default"}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => removeTimeSlot(index)}
                    startIcon={<X />}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Calendar Preview */}
          {calendarData && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Current Schedule
              </Typography>
              <Box maxHeight={200} overflow="auto">
                {calendarData.data?.map((day: any) => (
                  <Box key={day.slot.date} mb={2}>
                    <Typography variant="subtitle2" color="primary">
                      {new Date(day.slot.date).toLocaleDateString()}
                    </Typography>
                    {day.bookings?.map((booking: any) => (
                      <Box key={booking._id} ml={2} p={1} bgcolor="grey.100" borderRadius={1}>
                        <Typography variant="body2">
                          {booking.candidateName} - {day.slot.startTime}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          disabled={isPending || !selectedDate || timeSlots.length === 0}
        >
          {isPending ? "Saving..." : "Save Availability"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewCalendar;
