'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { format, addMonths, subMonths } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import TimePanel from './TimePanel';

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

interface CalendlyStyleSchedulerProps {
  availableSlots: AvailabilitySlot[];
  onSlotSelect: (slot: AvailabilitySlot) => void;
  title?: string;
  showAllSlots?: boolean; // If true, shows all slots (for employers), if false, only available slots (for candidates)
  currentDate?: Date; // Optional prop to control the current date from parent
  onCurrentDateChange?: (date: Date) => void; // Optional callback when date changes
}

const CalendlyStyleScheduler = ({
  availableSlots,
  onSlotSelect,
  title = "Select a Date & Time",
  showAllSlots = false,
  currentDate: propCurrentDate,
  onCurrentDateChange
}: CalendlyStyleSchedulerProps) => {
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Use prop currentDate if provided, otherwise use internal state
  const currentDate = propCurrentDate || internalCurrentDate;

  // Calendar navigation
  const goToPreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (onCurrentDateChange) {
      onCurrentDateChange(newDate);
    } else {
      setInternalCurrentDate(newDate);
    }
  };
  
  const goToNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    if (onCurrentDateChange) {
      onCurrentDateChange(newDate);
    } else {
      setInternalCurrentDate(newDate);
    }
  };

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return availableSlots.filter(slot => {
      try {
        // Handle different date formats that might come from the API
        let slotDate;
        if (typeof slot.date === 'string') {
          // If it's a string, parse it
          slotDate = new Date(slot.date);
        } else if (slot.date instanceof Date) {
          // If it's already a Date object
          slotDate = slot.date;
        } else {
          // Fallback
          slotDate = new Date(slot.date);
        }
        
        const slotDateKey = format(slotDate, 'yyyy-MM-dd');
        if (slotDateKey !== dateKey) return false;
        
        // If showAllSlots is true (for employers), return all slots
        // If false (for candidates), only return available slots
        if (showAllSlots) {
          return true;
        } else {
          return slot.status === 'available' && slot.currentBookings < slot.maxBookings;
        }
      } catch (error) {
        console.error('Error parsing slot date:', slot.date, error);
        return false;
      }
    });
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', format(date, 'yyyy-MM-dd'));
    console.log('Available slots for date:', getSlotsForDate(date));
    console.log('Total available slots:', availableSlots);
    
    // For employers (showAllSlots = true), always allow date selection
    // This allows them to see the full day schedule and create new slots
    if (showAllSlots) {
      console.log('Setting selected date for employer:', date);
      setSelectedDate(date);
    } else {
      // For candidates, only allow selection if there are available slots
      const daySlots = getSlotsForDate(date);
      if (daySlots.length > 0) {
        console.log('Setting selected date for candidate:', date);
        setSelectedDate(date);
      } else {
        console.log('No available slots found for this date');
      }
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '600px',
      backgroundColor: 'white',
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Left Side - Calendar */}
      <Box sx={{ flex: 1 }}>
        <CalendarHeader
          currentDate={currentDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          title={title}
        />
        
        <Box sx={{ px: 4, pb: 4 }}>
          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            availableSlots={availableSlots}
            showAllSlots={showAllSlots}
            onDateClick={handleDateClick}
            getSlotsForDate={getSlotsForDate}
          />

          {/* Time zone info */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Time zone
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                backgroundColor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🌍
              </Box>
              <Typography variant="body2" color="text.secondary">
                Eastern Time - US & Canada (1:42pm) ▼
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Time Slots */}
      <TimePanel
        selectedDate={selectedDate}
        availableSlots={availableSlots}
        showAllSlots={showAllSlots}
        onSlotSelect={onSlotSelect}
        onClose={() => setSelectedDate(null)}
      />
    </Box>
  );
};

export default CalendlyStyleScheduler;
