'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { Client as apiClient } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CalendlyStyleScheduler from '@/components/scheduling/CalendlyStyleScheduler';

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

interface Job {
  _id: string;
  title: string;
  location: string;
  employer: {
    _id: string;
    companyName: string;
    ownerName: string;
  };
}

const RecruiterCalendarContent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployer, setSelectedEmployer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTimeSlotSelector, setShowTimeSlotSelector] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');

  // Fetch available slots for booking
  const { data: availableSlots = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.AVAILABILITY.FOR_BOOKING({
      month: format(currentDate, 'yyyy-MM'),
      employer: selectedEmployer || undefined,
    }),
    queryFn: () => apiClient.get(API_ENDPOINTS.AVAILABILITY.FOR_BOOKING, {
      params: {
        month: format(currentDate, 'yyyy-MM'),
        employer: selectedEmployer || undefined,
      }
    }).then((res: any) => res.data),
  });

  // Fetch jobs for scheduling
  const { data: jobs = [] } = useQuery({
    queryKey: QUERY_KEYS.JOBS.LIST(),
    queryFn: () => apiClient.get(API_ENDPOINTS.JOBS.LIST).then((res: any) => res.data.jobs || []),
  });

  // Get unique employers from slots
  const employers = Array.from(
    new Map(
      availableSlots.map((slot: AvailabilitySlot) => [
        slot.employer._id,
        slot.employer
      ])
    ).values()
  );

  // Filter slots based on search and employer
  const filteredSlots = availableSlots.filter((slot: AvailabilitySlot) => {
    const matchesSearch = !searchTerm || 
      slot.employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployer = !selectedEmployer || slot.employer._id === selectedEmployer;
    return matchesSearch && matchesEmployer;
  });

  // Calendar navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return filteredSlots.filter((slot: AvailabilitySlot) => 
      format(new Date(slot.date), 'yyyy-MM-dd') === dateKey
    );
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

  // Handle date click to show time slots
  const handleDateClick = (date: Date) => {
    const isPastDate = isBefore(date, new Date().setHours(0, 0, 0, 0));
    if (isPastDate) return;
    
    setSelectedCalendarDate(date);
    setShowTimeSlotSelector(true);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setShowTimeSlotSelector(false);
    setShowScheduleModal(true);
  };

  // Handle schedule interview
  const handleScheduleInterview = async () => {
    if (!selectedSlot || !selectedJob || !candidateEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.INTERVIEWS.BOOK, {
        candidateEmail,
        jobId: selectedJob,
        availabilitySlotId: selectedSlot._id,
      });

      toast.success('Interview scheduled successfully!');
      setShowScheduleModal(false);
      setSelectedSlot(null);
      setCandidateEmail('');
      setSelectedJob('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to schedule interview');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Employer Availability Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View employer availability and schedule interviews for candidates
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search employers or slots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Filter by Employer</InputLabel>
              <Select
                value={selectedEmployer}
                onChange={(e) => setSelectedEmployer(e.target.value)}
                label="Filter by Employer"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Employers</MenuItem>
                {employers.map((employer: any) => (
                  <MenuItem key={employer._id} value={employer._id}>
                    {employer.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FilterIcon sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {filteredSlots.length} available slots
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Calendar Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={goToPreviousMonth}
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
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              mx: 3,
              minWidth: 200,
              textAlign: 'center'
            }}
          >
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          
          <IconButton 
            onClick={goToNextMonth}
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
        
        <Button 
          variant="outlined" 
          onClick={goToToday}
          sx={{
            borderColor: 'grey.300',
            color: 'text.primary',
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'grey.50',
              borderColor: 'grey.400'
            }
          }}
        >
          Today
        </Button>
      </Box>

      {/* Calendly-Style Scheduler */}
      <CalendlyStyleScheduler
        availableSlots={filteredSlots}
        onSlotSelect={(slot) => {
          setSelectedSlot(slot);
          setShowScheduleModal(true);
        }}
        title="Employer Availability Calendar"
      />

      {/* Old Calendar Grid - Replaced with CalendlyStyleScheduler */}
      {false && (
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: 3,
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
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
                py: 2,
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.875rem',
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
          minHeight: '600px'
        }}>
          {calendarDays.map((day, index) => {
            const daySlots = getSlotsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isPastDate = isBefore(day, new Date().setHours(0, 0, 0, 0));

            return (
              <Box
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                sx={{
                  minHeight: 100,
                  opacity: isCurrentMonth ? 1 : 0.4,
                  backgroundColor: isToday(day) ? 'primary.50' : 'white',
                  borderRight: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'grey.200',
                  p: 1.5,
                  position: 'relative',
                  cursor: isPastDate ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: isPastDate ? undefined : isToday(day) ? 'primary.100' : 'grey.50',
                  },
                  '&:last-child': {
                    borderRight: index % 7 === 6 ? 'none' : '1px solid'
                  }
                }}
              >
                {/* Date number */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday(day) ? 700 : isCurrentMonth ? 600 : 400,
                    color: isToday(day) ? 'primary.main' : 
                           isCurrentMonth ? 'text.primary' : 'text.disabled',
                    mb: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  {format(day, 'd')}
                </Typography>

                {/* Available slots indicator */}
                {daySlots.length > 0 && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'success.main'
                      }}
                    />
                  </Box>
                )}

                {/* Slots preview */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {daySlots.slice(0, 3).map((slot: AvailabilitySlot) => (
                    <Box
                      key={slot._id}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the day click
                      }}
                      sx={{
                        backgroundColor: 'success.50',
                        color: 'success.700',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'success.200',
                        '&:hover': {
                          backgroundColor: 'success.100',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getMeetingTypeIcon(slot.meetingType)}
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {slot.startTime}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.8 }}>
                        {slot.employer.companyName}
                      </Typography>
                    </Box>
                  ))}
                  {daySlots.length > 3 && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.65rem',
                        textAlign: 'center',
                        mt: 0.5
                      }}
                    >
                      +{daySlots.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      )}

      {/* Schedule Interview Modal */}
      <Dialog 
        open={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '1px solid', 
          borderColor: 'grey.200',
          backgroundColor: 'grey.50'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Schedule Interview
          </Typography>
          {selectedSlot && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {format(new Date(selectedSlot.date), 'EEEE, MMMM d, yyyy')} at {selectedSlot.startTime}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {selectedSlot && (
              <Card sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <BusinessIcon sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedSlot.employer.companyName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedSlot.employer.ownerName}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getMeetingTypeIcon(selectedSlot.meetingType)}
                    <Typography variant="body2">
                      {selectedSlot.title} • {selectedSlot.duration} minutes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            <FormControl fullWidth>
              <InputLabel>Select Job Position</InputLabel>
              <Select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                label="Select Job Position"
                sx={{ borderRadius: 2 }}
              >
                {jobs.map((job: Job) => (
                  <MenuItem key={job._id} value={job._id}>
                    {job.title} - {job.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Candidate Email"
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              fullWidth
              placeholder="candidate@example.com"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          pt: 2, 
          borderTop: '1px solid', 
          borderColor: 'grey.200',
          backgroundColor: 'grey.50',
          gap: 2
        }}>
          <Button 
            onClick={() => setShowScheduleModal(false)}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'grey.100'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleScheduleInterview}
            variant="contained"
            sx={{
              backgroundColor: '#006BFF',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(0, 107, 255, 0.2)',
              '&:hover': {
                backgroundColor: '#0056CC',
                boxShadow: '0 4px 12px rgba(0, 107, 255, 0.3)',
              }
            }}
          >
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

const RecruiterCalendarPage = () => {
  return (
    <ProtectedRoute allowedRoles={['recruitment_partner']}>
      <DashboardLayout>
        <RecruiterCalendarContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default RecruiterCalendarPage;
