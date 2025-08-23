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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore } from "date-fns";
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
      const dateKey = format(new Date(slot.date), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    }, {} as Record<string, AvailabilitySlot[]>);
  }, [slots]);

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
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
    if (window.confirm("Are you sure you want to delete this availability slot?")) {
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
      case 'video': return <VideoIcon fontSize="small" />;
      case 'phone': return <PhoneIcon fontSize="small" />;
      case 'in-person': return <LocationIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string, currentBookings: number, maxBookings: number) => {
    if (status === 'cancelled') return 'error';
    if (currentBookings >= maxBookings) return 'warning';
    return 'success';
  };

  return (
    <Box>
      {/* Calendar Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={goToPreviousMonth} disabled={loading}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5" fontWeight="600">
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={goToNextMonth} disabled={loading}>
            <ChevronRight />
          </IconButton>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={goToToday} disabled={loading}>
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
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              }
            }}
          >
            Add Availability
          </Button>
        </Box>
      </Box>

      {/* Calendar Grid */}
      <Grid container spacing={1}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid item xs={1.714} key={day}>
            <Box
              textAlign="center"
              py={1}
              fontWeight="600"
              color="text.secondary"
              fontSize="0.875rem"
            >
              {day}
            </Box>
          </Grid>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day) => {
          const daySlots = getSlotsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isPastDate = isBefore(day, new Date().setHours(0, 0, 0, 0));

          return (
            <Grid item xs={1.714} key={day.toISOString()}>
              <Card
                sx={{
                  minHeight: 120,
                  cursor: isPastDate ? 'not-allowed' : 'pointer',
                  opacity: isCurrentMonth ? 1 : 0.5,
                  backgroundColor: isToday(day) ? 'action.selected' : 'background.paper',
                  border: isToday(day) ? '2px solid' : '1px solid',
                  borderColor: isToday(day) ? 'primary.main' : 'divider',
                  '&:hover': {
                    backgroundColor: isPastDate ? undefined : 'action.hover',
                  },
                }}
                onClick={() => !isPastDate && handleDateClick(day)}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography
                    variant="body2"
                    fontWeight={isToday(day) ? 600 : 400}
                    color={isToday(day) ? 'primary.main' : 'text.primary'}
                    mb={1}
                  >
                    {format(day, 'd')}
                  </Typography>

                  {/* Slots for this day */}
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    {daySlots.slice(0, 2).map((slot) => (
                      <Chip
                        key={slot._id}
                        label={`${slot.startTime} - ${slot.endTime}`}
                        size="small"
                        color={getStatusColor(slot.status, slot.currentBookings, slot.maxBookings)}
                        icon={getMeetingTypeIcon(slot.meetingType)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotEdit(slot);
                        }}
                        onDelete={slot.currentBookings === 0 ? (e) => {
                          e.stopPropagation();
                          handleSlotDelete(slot._id);
                        } : undefined}
                        deleteIcon={<DeleteIcon />}
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          '& .MuiChip-label': {
                            px: 0.5,
                          },
                        }}
                      />
                    ))}
                    {daySlots.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{daySlots.length - 2} more
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

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
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    meetingType: 'video' as 'video' | 'phone' | 'in-person',
    maxBookings: 1,
    meetingDetails: {
      location: '',
      videoLink: '',
      phoneNumber: '',
      instructions: '',
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
          location: editingSlot.meetingDetails.location || '',
          videoLink: editingSlot.meetingDetails.videoLink || '',
          phoneNumber: editingSlot.meetingDetails.phoneNumber || '',
          instructions: editingSlot.meetingDetails.instructions || '',
        },
        isRecurring: editingSlot.isRecurring,
      });
    } else {
      setFormData({
        title: 'Interview Slot',
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        meetingType: 'video',
        maxBookings: 1,
        meetingDetails: {
          location: '',
          videoLink: '',
          phoneNumber: '',
          instructions: '',
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
        date: format(selectedDate, 'yyyy-MM-dd'),
      };

      if (editingSlot) {
        await onUpdateSlot(editingSlot._id, slotData);
      } else {
        await onCreateSlot(slotData);
      }
      
      toast.success(editingSlot ? 'Slot updated successfully' : 'Slot created successfully');
      onClose();
    } catch (error) {
      toast.error(editingSlot ? 'Failed to update slot' : 'Failed to create slot');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingSlot ? 'Edit Availability Slot' : 'Create Availability Slot'}
        {selectedDate && (
          <Typography variant="body2" color="text.secondary">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={2}>
          <TextField
            label="Slot Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              sx={{ flex: 1 }}
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
          {formData.meetingType === 'video' && (
            <TextField
              label="Video Link (optional)"
              value={formData.meetingDetails.videoLink}
              onChange={(e) => setFormData({
                ...formData,
                meetingDetails: { ...formData.meetingDetails, videoLink: e.target.value }
              })}
              fullWidth
              placeholder="https://zoom.us/j/..."
            />
          )}

          {formData.meetingType === 'phone' && (
            <TextField
              label="Phone Number (optional)"
              value={formData.meetingDetails.phoneNumber}
              onChange={(e) => setFormData({
                ...formData,
                meetingDetails: { ...formData.meetingDetails, phoneNumber: e.target.value }
              })}
              fullWidth
              placeholder="+1 (555) 123-4567"
            />
          )}

          {formData.meetingType === 'in-person' && (
            <TextField
              label="Location"
              value={formData.meetingDetails.location}
              onChange={(e) => setFormData({
                ...formData,
                meetingDetails: { ...formData.meetingDetails, location: e.target.value }
              })}
              fullWidth
              placeholder="Office address or meeting room"
            />
          )}

          <TextField
            label="Instructions (optional)"
            value={formData.meetingDetails.instructions}
            onChange={(e) => setFormData({
              ...formData,
              meetingDetails: { ...formData.meetingDetails, instructions: e.target.value }
            })}
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
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            '&:hover': {
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
            }
          }}
        >
          {editingSlot ? 'Update' : 'Create'} Slot
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvailabilityCalendar;
