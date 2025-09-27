"use client";
import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
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
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { Calendar, Clock, Users, Plus, X, Save, CalendarDays } from "lucide-react";
import { useSetEmployerAvailability, useEmployerCalendar } from "@/lib/hooks/interview.hooks";
import { AvailabilitySlot } from "@/lib/fetchers";
import "react-day-picker/dist/style.css";

// Validation schema
const availabilitySchema = z.object({
  date: z.string().min(1, "Date is required"),
  timeSlots: z.array(z.object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    maxCandidates: z.number().min(1).max(10),
    isAvailable: z.boolean(),
  })).min(1, "At least one time slot is required"),
});

interface EnhancedInterviewCalendarProps {
  open: boolean;
  onClose: () => void;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxCandidates: number;
}

const EnhancedInterviewCalendar: React.FC<EnhancedInterviewCalendarProps> = ({ open, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot>({
    startTime: "09:00",
    endTime: "10:00",
    isAvailable: true,
    maxCandidates: 1,
  });

  const { mutate: setAvailability, isPending } = useSetEmployerAvailability();
  const { data: calendarData } = useEmployerCalendar();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      date: "",
      timeSlots: [],
    },
  });

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
      const newSlots = [...timeSlots, { ...currentSlot }];
      setTimeSlots(newSlots);
      setValue("timeSlots", newSlots);
      setCurrentSlot({
        startTime: "09:00",
        endTime: "10:00",
        isAvailable: true,
        maxCandidates: 1,
      });
    }
  };

  const removeTimeSlot = (index: number) => {
    const newSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newSlots);
    setValue("timeSlots", newSlots);
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setValue("date", format(date, "yyyy-MM-dd"));
    }
  };

  const onSubmit = (data: any) => {
    if (!selectedDate || timeSlots.length === 0) {
      return;
    }

    const slots: AvailabilitySlot[] = timeSlots.map(slot => ({
      date: format(selectedDate, "yyyy-MM-dd"),
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
        setSelectedDate(null);
        setValue("date", "");
        setValue("timeSlots", []);
      },
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(12, 1fr)' }}>
            <Calendar className="h-5 w-5" />
            Set Interview Availability
          </Box>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(12, 1fr)' }}>
              {/* Date Selection with Calendar */}
              <Box sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 6' } }}>
                <Typography variant="h6" gutterBottom>
                  Select Date
                </Typography>

                <Card variant="outlined" sx={{ p: 2 }}>
                  <DayPicker
                    mode="single"
                    selected={selectedDate ?? undefined}
                    onSelect={(date) => handleDateSelect(date ?? null)}
                    disabled={(date) => date < new Date()}
                    className="w-full"
                    required={false}
                  />
                </Card>

                {selectedDate && (
                  <Box mt={2}>
                    <Typography variant="body2" color="primary">
                      Selected: {format(selectedDate, "EEEE, MMMM do, yyyy")}
                    </Typography>
                  </Box>
                )}

                {errors.date && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.date.message}
                  </Alert>
                )}
              </Box>

              {/* Time Slots Management */}
              <Box sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 6' } }}>
                <Typography variant="h6" gutterBottom>
                  Time Slots
                </Typography>

                {/* Add New Slot */}
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add Time Slot
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(12, 1fr)', alignItems: 'center' }}>
                    <Box sx={{ gridColumn: 'span 6' }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Start Time</InputLabel>
                        <Select
                          value={currentSlot.startTime}
                          onChange={(e) => setCurrentSlot({ ...currentSlot, startTime: e.target.value })}
                          label="Start Time"
                        >
                          {timeOptions.map((time) => (
                            <MenuItem key={time} value={time}>
                              {formatTime(time)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ gridColumn: 'span 6' }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>End Time</InputLabel>
                        <Select
                          value={currentSlot.endTime}
                          onChange={(e) => setCurrentSlot({ ...currentSlot, endTime: e.target.value })}
                          label="End Time"
                        >
                          {timeOptions.map((time) => (
                            <MenuItem key={time} value={time}>
                              {formatTime(time)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ gridColumn: 'span 6' }}>
                      <TextField
                        type="number"
                        label="Max Candidates"
                        value={currentSlot.maxCandidates}
                        onChange={(e) => setCurrentSlot({ ...currentSlot, maxCandidates: parseInt(e.target.value) })}
                        size="small"
                        fullWidth
                        inputProps={{ min: 1, max: 10 }}
                      />
                    </Box>

                    <Box sx={{ gridColumn: 'span 6' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentSlot.isAvailable}
                            onChange={(e) => setCurrentSlot({ ...currentSlot, isAvailable: e.target.checked })}
                          />
                        }
                        label="Available"
                      />
                    </Box>

                    <Box sx={{ gridColumn: 'span 12' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Plus />}
                        onClick={addTimeSlot}
                        disabled={!currentSlot.startTime || !currentSlot.endTime}
                        fullWidth
                      >
                        Add Time Slot
                      </Button>
                    </Box>
                  </Box> 
                </Card>

                {/* Existing Slots */}
                {timeSlots.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Added Time Slots
                    </Typography>
                    {timeSlots.map((slot, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent sx={{ py: 2 }}>
                          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(12, 1fr)' }}>
                            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(12, 1fr)' }}>
                              <Clock className="h-4 w-4 text-gray-500" />
                              <Typography variant="body2">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
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
                            </Box>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => removeTimeSlot(index)}
                              startIcon={<X />}
                            >
                              Remove
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}

                {errors.timeSlots && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.timeSlots.message}
                  </Alert>
                )}
              </Box>

              {/* Calendar Preview */}
              {calendarData && calendarData.data && calendarData.data.length > 0 && (
                <Box sx={{ gridColumn: 'span 12' }}>
                  <Typography variant="h6" gutterBottom>
                    Current Schedule
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Box maxHeight={200} overflow="auto">
                        {calendarData.data.map((day: any) => (
                          <Box key={day.slot.date} mb={2}>
                            <Typography variant="subtitle2" color="primary">
                              {format(new Date(day.slot.date), "EEEE, MMMM do")}
                            </Typography>
                            {day.bookings?.map((booking: any) => (
                              <Box key={booking._id} ml={2} p={1} bgcolor="grey.100" borderRadius={1} mt={1}>
                                <Typography variant="body2">
                                  {booking.candidateName} - {day.slot.startTime}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            startIcon={<Save />}
            disabled={isPending || !selectedDate || timeSlots.length === 0}
          >
            {isPending ? "Saving..." : "Save Availability"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnhancedInterviewCalendar;
