'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface AvailabilitySlot {
  _id: string;
  employer: {
    _id: string;
    companyName: string;
    ownerName: string;
  };
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
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
}

interface TimeSlotSelectorProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  availableSlots: AvailabilitySlot[];
  onSlotSelect: (slot: AvailabilitySlot) => void;
  timezone?: string;
}

const TimeSlotSelector = ({
  open,
  onClose,
  selectedDate,
  availableSlots,
  onSlotSelect,
  timezone = 'Eastern Time - US & Canada (UTC-5)',
}: TimeSlotSelectorProps) => {
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);

  // Generate time slots for afternoon/evening (3 PM to 6:30 PM in 30-minute intervals)
  const allTimeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 15; hour <= 18; hour++) { // 3 PM to 6 PM
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 30) break; // Stop at 6:30 PM
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = new Date(`2000-01-01T${time24}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).toLowerCase();
        slots.push({ time24, time12 });
      }
    }
    return slots;
  }, []);

  // Get slots for the selected date
  const daySlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return availableSlots.filter(slot => 
      format(new Date(slot.date), 'yyyy-MM-dd') === dateKey
    );
  }, [selectedDate, availableSlots]);

  // Create a map of available slots by time
  const slotsByTime = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    daySlots.forEach(slot => {
      const time = slot.startTime;
      if (!map.has(time)) {
        map.set(time, []);
      }
      map.get(time)!.push(slot);
    });
    return map;
  }, [daySlots]);

  // Get meeting type icon
  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon fontSize="small" />;
      case 'phone': return <PhoneIcon fontSize="small" />;
      case 'in-person': return <LocationIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  // Get slot status and availability
  const getSlotStatus = (time24: string) => {
    const slots = slotsByTime.get(time24) || [];
    if (slots.length === 0) return { available: false, slots: [] };
    
    const availableSlots = slots.filter(slot => 
      slot.status === 'available' && slot.currentBookings < slot.maxBookings
    );
    
    return {
      available: availableSlots.length > 0,
      slots: availableSlots,
      totalSlots: slots.length,
    };
  };

  // Handle slot selection
  const handleSlotClick = (time24: string) => {
    const status = getSlotStatus(time24);
    if (status.available && status.slots.length > 0) {
      // If only one slot available, select it directly
      if (status.slots.length === 1) {
        onSlotSelect(status.slots[0]);
      } else {
        // If multiple slots, you could show a sub-selection or pick the first one
        onSlotSelect(status.slots[0]);
      }
    }
  };

  const selectedSlotsCount = daySlots.filter(slot => 
    slot.status === 'available' && slot.currentBookings < slot.maxBookings
  ).length;

  const totalDaySlots = daySlots.length;

  // Don't render as a modal - this will be used inline
  if (!open || !selectedDate) return null;

  return (
    <Box sx={{ 
      width: '100%',
      backgroundColor: 'white',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'grey.200',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid', 
        borderColor: 'grey.200',
        backgroundColor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: '#006BFF',
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: '#0056CC',
            }
          }}
        >
          Show times you're free
        </Button>
      </Box>

      {/* Time Slots */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {allTimeSlots.map(({ time24, time12 }) => {
            const status = getSlotStatus(time24);
            const isAvailable = status.available;
            
            return (
              <Button
                key={time24}
                onClick={() => handleSlotClick(time24)}
                disabled={!isAvailable}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: isAvailable ? '#006BFF' : 'grey.300',
                  backgroundColor: isAvailable ? 'white' : 'grey.50',
                  color: isAvailable ? '#006BFF' : 'text.disabled',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  minHeight: '56px',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: isAvailable ? '#f0f8ff' : 'grey.100',
                    borderColor: isAvailable ? '#0056CC' : 'grey.400',
                  },
                  '&:disabled': {
                    opacity: 0.4,
                  },
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                }}
              >
                {time12}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Timezone Selector */}
      <Box sx={{ 
        p: 3, 
        borderTop: '1px solid', 
        borderColor: 'grey.200',
        backgroundColor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <ScheduleIcon sx={{ color: 'text.secondary' }} />
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <Select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            displayEmpty
            sx={{ 
              backgroundColor: 'white',
              borderRadius: 1,
              fontSize: '0.875rem',
              '& .MuiSelect-select': {
                py: 1,
              }
            }}
          >
            <MenuItem value="Eastern Time - US & Canada (UTC-5)">Eastern Time - US & Canada (1:42pm)</MenuItem>
            <MenuItem value="Central Time - US & Canada (UTC-6)">Central Time - US & Canada (12:42pm)</MenuItem>
            <MenuItem value="Mountain Time - US & Canada (UTC-7)">Mountain Time - US & Canada (11:42am)</MenuItem>
            <MenuItem value="Pacific Time - US & Canada (UTC-8)">Pacific Time - US & Canada (10:42am)</MenuItem>
          </Select>
        </FormControl>
      </Box>

    </Box>
  );
};

export default TimeSlotSelector;
