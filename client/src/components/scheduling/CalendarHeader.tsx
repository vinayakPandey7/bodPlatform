'use client';

import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  title?: string;
}

const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  title = "Select a Date & Time"
}: CalendarHeaderProps) => {
  return (
    <Box sx={{ p: 4, borderRight: '1px solid', borderColor: 'grey.200' }}>
      {/* Title */}
      <Typography variant="h4" sx={{ 
        fontWeight: 700, 
        mb: 4,
        color: 'text.primary'
      }}>
        {title}
      </Typography>

      {/* Calendar Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <IconButton 
          onClick={onPreviousMonth}
          sx={{
            width: 40,
            height: 40,
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'grey.50',
              borderColor: 'grey.400'
            }
          }}
        >
          <ChevronLeft sx={{ fontSize: 20 }} />
        </IconButton>
        
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        
        <IconButton 
          onClick={onNextMonth}
          sx={{
            width: 40,
            height: 40,
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'grey.50',
              borderColor: 'grey.400'
            }
          }}
        >
          <ChevronRight sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CalendarHeader;
