'use client';

import {
  Box,
  Typography,
} from '@mui/material';
import TimeSlotSelector from './TimeSlotSelector';
import EmployerDaySchedule from './EmployerDaySchedule';
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

interface TimePanelProps {
  selectedDate: Date | null;
  availableSlots: AvailabilitySlot[];
  showAllSlots: boolean;
  onSlotSelect: (slot: AvailabilitySlot) => void;
  onClose: () => void;
}

const TimePanel = ({
  selectedDate,
  availableSlots,
  showAllSlots,
  onSlotSelect,
  onClose
}: TimePanelProps) => {
  // Filter slots for the selected date
  const getFilteredSlots = () => {
    if (!selectedDate) return [];
    
    return availableSlots.filter(slot => {
      try {
        const slotDate = new Date(slot.date);
        const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
        const slotDateKey = format(slotDate, 'yyyy-MM-dd');
        return slotDateKey === selectedDateKey;
      } catch (error) {
        return false;
      }
    });
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

  const handleSlotSelect = (existingSlot: AvailabilitySlot | null, timeSlot?: string) => {
    if (existingSlot) {
      // Edit existing slot
      onSlotSelect(existingSlot);
    } else if (timeSlot && selectedDate) {
      // Create new slot for this time with 30-minute duration
      const duration = 30;
      const endTime = calculateEndTime(timeSlot, duration);
      
      const newSlot = {
        _id: `new-${timeSlot}`,
        employer: {
          _id: 'current-employer',
          companyName: 'Your Company',
          ownerName: 'You'
        },
        title: 'New Availability',
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: timeSlot,
        endTime: endTime,
        duration: duration,
        status: 'available' as const,
        maxBookings: 1,
        currentBookings: 0,
        meetingType: 'video' as const,
        meetingDetails: {}
      };
      onSlotSelect(newSlot);
    }
  };

  return (
    <Box sx={{ 
      width: '400px',
      backgroundColor: 'grey.50'
    }}>
      {selectedDate ? (
        showAllSlots ? (
          <EmployerDaySchedule
            open={true}
            onClose={onClose}
            selectedDate={selectedDate}
            existingSlots={getFilteredSlots()}
            onSlotSelect={handleSlotSelect}
          />
        ) : (
          <TimeSlotSelector
            open={true}
            onClose={onClose}
            selectedDate={selectedDate}
            availableSlots={availableSlots}
            onSlotSelect={onSlotSelect}
          />
        )
      ) : (
        <Box sx={{ 
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
              {availableSlots.length === 0 && showAllSlots ? 'No availability slots yet' : 'Select a date'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {availableSlots.length === 0 && showAllSlots
                ? 'Click on any date to start setting your availability'
                : showAllSlots 
                  ? 'Click on a date to manage your availability'
                  : 'Click on a date with available slots to see time options'
              }
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TimePanel;
