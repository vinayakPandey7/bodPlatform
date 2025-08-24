'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
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

interface EmployerDayScheduleProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  existingSlots: AvailabilitySlot[];
  onSlotSelect: (slot: AvailabilitySlot | null, timeSlot: string) => void;
  timezone?: string;
}

const EmployerDaySchedule = ({
  open,
  onClose,
  selectedDate,
  existingSlots,
  onSlotSelect,
  timezone = 'Eastern Time - US & Canada (UTC-5)',
}: EmployerDayScheduleProps) => {
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);

  // Generate all possible time slots (30-minute intervals from 9 AM to 6 PM)
  const allTimeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) { // 9 AM to 6 PM
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
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

  // Get existing slot for a specific time
  const getSlotForTime = (time24: string) => {
    return existingSlots.find(slot => slot.startTime === time24);
  };

  // Handle time slot click
  const handleTimeSlotClick = (time24: string) => {
    const existingSlot = getSlotForTime(time24);
    onSlotSelect(existingSlot || null, time24);
  };

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
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Click on a time slot to set your availability
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
          Close
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
            const existingSlot = getSlotForTime(time24);
            const hasSlot = !!existingSlot;
            const isAvailable = hasSlot && existingSlot.status === 'available';
            const isBooked = hasSlot && existingSlot.status === 'booked';
            
            let buttonColor = '#006BFF';
            let backgroundColor = 'white';
            let borderColor = '#006BFF';
            let textColor = '#006BFF';
            let statusText = 'Set Availability';
            
            if (hasSlot) {
              if (isAvailable) {
                backgroundColor = '#E8F5E8';
                borderColor = '#4CAF50';
                textColor = '#2E7D32';
                statusText = 'Available';
              } else if (isBooked) {
                backgroundColor = '#FFF3E0';
                borderColor = '#FF9800';
                textColor = '#E65100';
                statusText = 'Booked';
              } else {
                backgroundColor = '#FFEBEE';
                borderColor = '#F44336';
                textColor = '#C62828';
                statusText = 'Cancelled';
              }
            }
            
            return (
              <Button
                key={time24}
                onClick={() => handleTimeSlotClick(time24)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minHeight: '60px',
                  justifyContent: 'space-between',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    backgroundColor: hasSlot 
                      ? (isAvailable ? '#C8E6C9' : isBooked ? '#FFE0B2' : '#FFCDD2')
                      : '#f0f8ff',
                    borderColor: hasSlot 
                      ? (isAvailable ? '#388E3C' : isBooked ? '#F57C00' : '#D32F2F')
                      : '#0056CC',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {time12}
                  </Typography>
                  {hasSlot && (
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.875rem',
                      opacity: 0.8
                    }}>
                      {existingSlot.title}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  opacity: 0.9
                }}>
                  {statusText}
                </Typography>
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

export default EmployerDaySchedule;
