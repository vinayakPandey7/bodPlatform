'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AvailabilitySlot {
  _id: string;
  employer?: {
    _id: string;
    companyName: string;
    ownerName: string;
  };
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone?: string;
  isRecurring?: boolean;
  status: 'available' | 'booked' | 'cancelled';
  maxBookings: number;
  currentBookings: number;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingDetails: {
    location?: string;
    videoLink?: string;
    phoneNumber?: string;
    instructions?: string;
  };
  isActive?: boolean;
}

interface SlotModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  editingSlot: AvailabilitySlot | null;
  onCreateSlot: (slotData: any) => Promise<void>;
  onUpdateSlot: (id: string, slotData: any) => Promise<void>;
  loading: boolean;
}

const SlotModal: React.FC<SlotModalProps> = ({
  open,
  onClose,
  selectedDate,
  editingSlot,
  onCreateSlot,
  onUpdateSlot,
  loading,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    startTime: "09:00",
    endTime: "09:30",
    duration: 30,
    meetingType: "video" as "video" | "phone" | "in-person",
    maxBookings: 1,
    meetingDetails: {
      location: "",
      videoLink: "",
      phoneNumber: "",
      instructions: "",
    },
    isRecurring: false,
  });

  // Helper function to calculate duration in minutes
  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    return endTotalMinutes - startTotalMinutes;
  };

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = startTotalMinutes + duration;
    
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  };

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (editingSlot) {
      // Calculate duration from start and end time to ensure consistency
      const calculatedDuration = calculateDuration(editingSlot.startTime, editingSlot.endTime);
      
      setFormData({
        title: editingSlot.title,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        duration: calculatedDuration > 0 ? calculatedDuration : editingSlot.duration,
        meetingType: editingSlot.meetingType,
        maxBookings: editingSlot.maxBookings,
        meetingDetails: {
          location: editingSlot.meetingDetails.location || "",
          videoLink: editingSlot.meetingDetails.videoLink || "",
          phoneNumber: editingSlot.meetingDetails.phoneNumber || "",
          instructions: editingSlot.meetingDetails.instructions || "",
        },
        isRecurring: editingSlot.isRecurring || false,
      });
    } else {
      setFormData({
        title: "Interview Slot",
        startTime: "09:00",
        endTime: "09:30",
        duration: 30,
        meetingType: "video",
        maxBookings: 1,
        meetingDetails: {
          location: "",
          videoLink: "",
          phoneNumber: "",
          instructions: "",
        },
        isRecurring: false,
      });
    }
  }, [editingSlot, open]);

  const handleSave = async () => {
    if (!selectedDate) return;

    // Validate form data
    if (!formData.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    if (formData.duration <= 0) {
      toast.error("Duration must be greater than 0 minutes");
      return;
    }

    // Validate that end time is after start time
    const calculatedDuration = calculateDuration(formData.startTime, formData.endTime);
    if (calculatedDuration <= 0) {
      toast.error("End time must be after start time");
      return;
    }

    // Ensure duration matches the time difference
    if (Math.abs(calculatedDuration - formData.duration) > 1) {
      toast.error("Duration doesn't match the time difference between start and end time");
      return;
    }

    // Check if this is an existing slot (has a real _id) or a new slot (empty _id or template)
    const isNewSlot = !editingSlot || !editingSlot._id || editingSlot._id === '';

    try {
      const slotData = {
        ...formData,
        date: format(selectedDate, "yyyy-MM-dd"),
        // Ensure duration is consistent with time difference
        duration: calculatedDuration,
      };
      
      if (isNewSlot) {
        await onCreateSlot(slotData);
      } else {
        await onUpdateSlot(editingSlot._id, slotData);
      }

      toast.success(
        isNewSlot ? "Slot created successfully" : "Slot updated successfully"
      );
      onClose();
    } catch (error) {
      toast.error(
        isNewSlot ? "Failed to create slot" : "Failed to update slot"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "grey.50",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          {editingSlot && editingSlot._id ? "Edit Availability" : "Add Availability"}
        </Typography>
        {selectedDate && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent style={{ paddingTop: 12 }} sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Event Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "white",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#006BFF",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#006BFF",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#006BFF",
              },
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 120px",
              gap: 2,
              alignItems: "end",
            }}
          >
            <TextField
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => {
                const newStartTime = e.target.value;
                const newDuration = calculateDuration(newStartTime, formData.endTime);
                setFormData({ 
                  ...formData, 
                  startTime: newStartTime,
                  duration: newDuration > 0 ? newDuration : formData.duration
                });
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "white",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#006BFF",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#006BFF",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#006BFF",
                },
              }}
            />
            <TextField
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => {
                const newEndTime = e.target.value;
                const newDuration = calculateDuration(formData.startTime, newEndTime);
                setFormData({ 
                  ...formData, 
                  endTime: newEndTime,
                  duration: newDuration > 0 ? newDuration : formData.duration
                });
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "white",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#006BFF",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#006BFF",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#006BFF",
                },
              }}
            />
            <TextField
              label="Duration"
              type="number"
              value={formData.duration}
              onChange={(e) => {
                const newDuration = parseInt(e.target.value) || 0;
                const newEndTime = calculateEndTime(formData.startTime, newDuration);
                setFormData({ 
                  ...formData, 
                  duration: newDuration,
                  endTime: newEndTime
                });
              }}
              InputProps={{
                endAdornment: (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", ml: 1 }}
                  >
                    min
                  </Typography>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "white",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#006BFF",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#006BFF",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#006BFF",
                },
              }}
            />
          </Box>

          {/* Meeting Details */}
          {formData.meetingType === "video" && (
            <TextField
              label="Video Link (optional)"
              value={formData.meetingDetails.videoLink}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  meetingDetails: {
                    ...formData.meetingDetails,
                    videoLink: e.target.value,
                  },
                })
              }
              fullWidth
              placeholder="https://zoom.us/j/..."
            />
          )}

          {formData.meetingType === "phone" && (
            <TextField
              label="Phone Number (optional)"
              value={formData.meetingDetails.phoneNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  meetingDetails: {
                    ...formData.meetingDetails,
                    phoneNumber: e.target.value,
                  },
                })
              }
              fullWidth
              placeholder="+1 (555) 123-4567"
            />
          )}

          {formData.meetingType === "in-person" && (
            <TextField
              label="Location"
              value={formData.meetingDetails.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  meetingDetails: {
                    ...formData.meetingDetails,
                    location: e.target.value,
                  },
                })
              }
              fullWidth
              placeholder="Office address or meeting room"
            />
          )}

          <TextField
            label="Instructions (optional)"
            value={formData.meetingDetails.instructions}
            onChange={(e) =>
              setFormData({
                ...formData,
                meetingDetails: {
                  ...formData.meetingDetails,
                  instructions: e.target.value,
                },
              })
            }
            fullWidth
            multiline
            rows={3}
            placeholder="Any special instructions for the interview..."
          />
        </Box>
      </DialogContent>
      
      <DialogActions
        sx={{
          p: 4,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "grey.50",
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "grey.100",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: "#006BFF",
            color: "white",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: "0 2px 8px rgba(0, 107, 255, 0.2)",
            "&:hover": {
              backgroundColor: "#0056CC",
              boxShadow: "0 4px 12px rgba(0, 107, 255, 0.3)",
            },
          }}
        >
          {editingSlot && editingSlot._id ? "Update" : "Create"} Availability
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotModal;
