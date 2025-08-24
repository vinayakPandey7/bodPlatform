'use client';

import {
  Box,
  Typography,
} from '@mui/material';
import { format, isSameMonth, isToday, isBefore } from 'date-fns';

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

interface CalendarDayCellProps {
  day: Date;
  currentDate: Date;
  selectedDate: Date | null;
  daySlots: AvailabilitySlot[];
  showAllSlots: boolean;
  index: number;
  onClick: (day: Date) => void;
}

const CalendarDayCell = ({
  day,
  currentDate,
  selectedDate,
  daySlots,
  showAllSlots,
  index,
  onClick
}: CalendarDayCellProps) => {
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isPastDate = isBefore(day, new Date().setHours(0, 0, 0, 0));
  const hasSlots = daySlots.length > 0;
  const hasAvailableSlots = daySlots.some(slot => 
    slot.status === 'available' && slot.currentBookings < slot.maxBookings
  );
  const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
  
  // For employers, all current/future dates are clickable
  // For candidates, only dates with available slots are clickable
  const isClickable = showAllSlots ? (!isPastDate && isCurrentMonth) : (hasSlots && !isPastDate);

  return (
    <Box
      onClick={() => onClick(day)}
      sx={{
        minHeight: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: isClickable ? 'pointer' : 'default',
        opacity: isCurrentMonth ? 1 : 0.3,
        borderRight: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        backgroundColor: isSelected ? '#006BFF' : 
                       isToday(day) ? '#f0f8ff' : 'white',
        color: isSelected ? 'white' : 
               isToday(day) ? '#006BFF' : 'text.primary',
        '&:hover': isClickable ? {
          backgroundColor: isSelected ? '#0056CC' : '#f0f8ff',
        } : {},
        '&:last-child': {
          borderRight: index % 7 === 6 ? 'none' : '1px solid'
        }
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: isToday(day) || isSelected ? 700 : 400,
          fontSize: '0.875rem'
        }}
      >
        {format(day, 'd')}
      </Typography>

      {/* Slots indicator */}
      {hasSlots && !isSelected && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: hasAvailableSlots ? '#006BFF' : '#FFA726' // Blue for available, orange for booked
          }}
        />
      )}
    </Box>
  );
};

export default CalendarDayCell;
