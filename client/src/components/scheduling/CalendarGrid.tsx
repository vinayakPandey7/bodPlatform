'use client';

import {
  Box,
} from '@mui/material';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import CalendarDayCell from './CalendarDayCell';

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

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  availableSlots: AvailabilitySlot[];
  showAllSlots: boolean;
  onDateClick: (date: Date) => void;
  getSlotsForDate: (date: Date) => AvailabilitySlot[];
}

const CalendarGrid = ({
  currentDate,
  selectedDate,
  availableSlots,
  showAllSlots,
  onDateClick,
  getSlotsForDate
}: CalendarGridProps) => {
  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <Box sx={{ 
      backgroundColor: 'white',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'grey.200',
      overflow: 'hidden'
    }}>
      {/* Day headers */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        backgroundColor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
          <Box
            key={day}
            sx={{
              textAlign: 'center',
              py: 2,
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.75rem',
              borderRight: '1px solid',
              borderColor: 'grey.200',
              '&:last-child': {
                borderRight: 'none'
              }
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* Calendar days */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        minHeight: '300px'
      }}>
        {calendarDays.map((day, index) => {
          const daySlots = getSlotsForDate(day);

          return (
            <CalendarDayCell
              key={day.toISOString()}
              day={day}
              currentDate={currentDate}
              selectedDate={selectedDate}
              daySlots={daySlots}
              showAllSlots={showAllSlots}
              index={index}
              onClick={onDateClick}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default CalendarGrid;
