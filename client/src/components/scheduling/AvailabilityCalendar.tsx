"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
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
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
} from "date-fns";
import { toast } from "sonner";

interface AvailabilitySlot {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  isRecurring: boolean;
  status: "available" | "booked" | "cancelled";
  maxBookings: number;
  currentBookings: number;
  meetingType: "video" | "phone" | "in-person";
  meetingDetails: {
    location?: string;
    videoLink?: string;
    phoneNumber?: string;
    instructions?: string;
  };
  isActive: boolean;
}

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
  onCreateSlot: (slotData: any) => Promise<void>;
  onUpdateSlot: (id: string, slotData: any) => Promise<void>;
  onDeleteSlot: (id: string) => Promise<void>;
  loading?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  slots,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  loading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);

  // Calendar navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group slots by date
  const slotsByDate = useMemo(() => {
    return slots.reduce((acc, slot) => {
      const dateKey = format(new Date(slot.date), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    }, {} as Record<string, AvailabilitySlot[]>);
  }, [slots]);

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return slotsByDate[dateKey] || [];
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isBefore(date, new Date().setHours(0, 0, 0, 0))) {
      toast.error("Cannot create slots for past dates");
      return;
    }
    setSelectedDate(date);
    setEditingSlot(null);
    setIsSlotModalOpen(true);
  };

  // Handle slot edit
  const handleSlotEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setSelectedDate(new Date(slot.date));
    setIsSlotModalOpen(true);
  };

  // Handle slot delete
  const handleSlotDelete = async (slotId: string) => {
    if (
      window.confirm("Are you sure you want to delete this availability slot?")
    ) {
      try {
        await onDeleteSlot(slotId);
        toast.success("Availability slot deleted successfully");
      } catch (error) {
        toast.error("Failed to delete availability slot");
      }
    }
  };

  // Get meeting type icon
  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <VideoIcon fontSize="small" />;
      case "phone":
        return <PhoneIcon fontSize="small" />;
      case "in-person":
        return <LocationIcon fontSize="small" />;
      default:
        return <EventIcon fontSize="small" />;
    }
  };

  // Get status color
  const getStatusColor = (
    status: string,
    currentBookings: number,
    maxBookings: number
  ) => {
    if (status === "cancelled") return "error";
    if (currentBookings >= maxBookings) return "warning";
    return "success";
  };

  return (
    <Box>
      {/* Calendar Header - Calendly Style */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 3,
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={goToPreviousMonth}
            disabled={loading}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            <ChevronLeft sx={{ fontSize: 20 }} />
          </IconButton>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mx: 3,
              minWidth: 200,
              textAlign: "center",
            }}
          >
            {format(currentDate, "MMMM yyyy")}
          </Typography>

          <IconButton
            onClick={goToNextMonth}
            disabled={loading}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            <ChevronRight sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={goToToday}
            disabled={loading}
            sx={{
              borderColor: "grey.300",
              color: "text.primary",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            Today
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedDate(new Date());
              setEditingSlot(null);
              setIsSlotModalOpen(true);
            }}
            disabled={loading}
            sx={{
              backgroundColor: "#006BFF",
              color: "white",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0, 107, 255, 0.2)",
              "&:hover": {
                backgroundColor: "#0056CC",
                boxShadow: "0 4px 12px rgba(0, 107, 255, 0.3)",
              },
            }}
          >
            Add Availability
          </Button>
        </Box>
      </Box>

      {/* Calendar Grid - Calendly Style */}
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
          overflow: "hidden",
        }}
      >
        {/* Day headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            backgroundColor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "grey.200",
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: "center",
                py: 2,
                fontWeight: 600,
                color: "text.secondary",
                fontSize: "0.875rem",
                borderRight: "1px solid",
                borderColor: "grey.200",
                "&:last-child": {
                  borderRight: "none",
                },
              }}
            >
              {day}
            </Box>
          ))}
        </Box>

        {/* Calendar days */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            minHeight: "600px",
          }}
        >
          {calendarDays.map((day, index) => {
            const daySlots = getSlotsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isPastDate = isBefore(day, new Date().setHours(0, 0, 0, 0));
            const isWeekStart = index % 7 === 0;

            return (
              <Box
                key={day.toISOString()}
                sx={{
                  minHeight: 100,
                  cursor: isPastDate ? "not-allowed" : "pointer",
                  opacity: isCurrentMonth ? 1 : 0.4,
                  backgroundColor: isToday(day) ? "primary.50" : "white",
                  borderRight: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "grey.200",
                  p: 1.5,
                  position: "relative",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: isPastDate
                      ? undefined
                      : isToday(day)
                      ? "primary.100"
                      : "grey.50",
                  },
                  "&:last-child": {
                    borderRight: index % 7 === 6 ? "none" : "1px solid",
                  },
                }}
                onClick={() => !isPastDate && handleDateClick(day)}
              >
                {/* Date number */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday(day) ? 700 : isCurrentMonth ? 600 : 400,
                    color: isToday(day)
                      ? "primary.main"
                      : isCurrentMonth
                      ? "text.primary"
                      : "text.disabled",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  {format(day, "d")}
                </Typography>

                {/* Available slots indicator */}
                {daySlots.length > 0 && (
                  <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: daySlots.some(
                          (slot) => slot.status === "available"
                        )
                          ? "success.main"
                          : "warning.main",
                      }}
                    />
                  </Box>
                )}

                {/* Slots preview */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {daySlots.slice(0, 3).map((slot) => (
                    <Box
                      key={slot._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotEdit(slot);
                      }}
                      sx={{
                        backgroundColor:
                          slot.status === "available"
                            ? "success.50"
                            : slot.status === "booked"
                            ? "warning.50"
                            : "error.50",
                        color:
                          slot.status === "available"
                            ? "success.700"
                            : slot.status === "booked"
                            ? "warning.700"
                            : "error.700",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor:
                          slot.status === "available"
                            ? "success.200"
                            : slot.status === "booked"
                            ? "warning.200"
                            : "error.200",
                        "&:hover": {
                          backgroundColor:
                            slot.status === "available"
                              ? "success.100"
                              : slot.status === "booked"
                              ? "warning.100"
                              : "error.100",
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {getMeetingTypeIcon(slot.meetingType)}
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {slot.startTime}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {daySlots.length > 3 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.65rem",
                        textAlign: "center",
                        mt: 0.5,
                      }}
                    >
                      +{daySlots.length - 3} more
                    </Typography>
                  )}
                </Box>

                {/* Add slot button for empty days */}
                {daySlots.length === 0 && !isPastDate && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      right: 8,
                      height: 24,
                      border: "2px dashed",
                      borderColor: "grey.300",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                      ".MuiBox-root:hover &": {
                        opacity: 1,
                      },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 16, color: "grey.400" }} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Slot Creation/Edit Modal */}
      <SlotModal
        open={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        selectedDate={selectedDate}
        editingSlot={editingSlot}
        onCreateSlot={onCreateSlot}
        onUpdateSlot={onUpdateSlot}
        loading={loading}
      />
    </Box>
  );
};

// Slot Modal Component
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
    endTime: "10:00",
    duration: 60,
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

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (editingSlot) {
      setFormData({
        title: editingSlot.title,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        duration: editingSlot.duration,
        meetingType: editingSlot.meetingType,
        maxBookings: editingSlot.maxBookings,
        meetingDetails: {
          location: editingSlot.meetingDetails.location || "",
          videoLink: editingSlot.meetingDetails.videoLink || "",
          phoneNumber: editingSlot.meetingDetails.phoneNumber || "",
          instructions: editingSlot.meetingDetails.instructions || "",
        },
        isRecurring: editingSlot.isRecurring,
      });
    } else {
      setFormData({
        title: "Interview Slot",
        startTime: "09:00",
        endTime: "10:00",
        duration: 60,
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

    try {
      const slotData = {
        ...formData,
        date: format(selectedDate, "yyyy-MM-dd"),
      };

      if (editingSlot) {
        await onUpdateSlot(editingSlot._id, slotData);
      } else {
        await onCreateSlot(slotData);
      }

      toast.success(
        editingSlot ? "Slot updated successfully" : "Slot created successfully"
      );
      onClose();
    } catch (error) {
      toast.error(
        editingSlot ? "Failed to update slot" : "Failed to create slot"
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
          {editingSlot ? "Edit Availability" : "Add Availability"}
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
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
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

          {/* <Box display="flex" gap={2}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Meeting Type</InputLabel>
              <Select
                value={formData.meetingType}
                onChange={(e) => setFormData({ ...formData, meetingType: e.target.value as any })}
                label="Meeting Type"
              >
                <MenuItem value="video">Video Call</MenuItem>
                <MenuItem value="phone">Phone Call</MenuItem>
                <MenuItem value="in-person">In Person</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Max Bookings"
              type="number"
              value={formData.maxBookings}
              onChange={(e) => setFormData({ ...formData, maxBookings: parseInt(e.target.value) })}
              sx={{ flex: 1 }}
              inputProps={{ min: 1, max: 10 }}
            />
          </Box> */}

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

          {/* <FormControlLabel
            control={
              <Switch
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              />
            }
            label="Recurring Slot"
          /> */}
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
          {editingSlot ? "Update" : "Create"} Availability
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvailabilityCalendar;
