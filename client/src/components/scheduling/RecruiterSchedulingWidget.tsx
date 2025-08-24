'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { Client as apiClient } from '@/lib/api';
import TimeSlotSelector from './TimeSlotSelector';

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

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

interface RecruiterSchedulingWidgetProps {
  open: boolean;
  onClose: () => void;
  candidate?: Candidate;
  job?: Job;
  employer?: {
    _id: string;
    companyName: string;
    ownerName: string;
  };
}

const RecruiterSchedulingWidget = ({
  open,
  onClose,
  candidate,
  job,
  employer,
}: RecruiterSchedulingWidgetProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [step, setStep] = useState<'calendar' | 'timeslots' | 'confirm'>('calendar');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [candidateEmail, setCandidateEmail] = useState(candidate?.email || '');
  const [selectedJob, setSelectedJob] = useState(job?._id || '');
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  // Fetch available slots
  const { data: availableSlots = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.AVAILABILITY.FOR_BOOKING({
      month: format(currentDate, 'yyyy-MM'),
      employer: employer?._id,
    }),
    queryFn: () => apiClient.get(API_ENDPOINTS.AVAILABILITY.FOR_BOOKING, {
      params: {
        month: format(currentDate, 'yyyy-MM'),
        employer: employer?._id,
      }
    }).then(res => res.data),
    enabled: open && !!employer?._id,
  });

  // Fetch jobs if not provided
  const { data: jobs = [] } = useQuery({
    queryKey: QUERY_KEYS.JOBS.LIST(),
    queryFn: () => apiClient.get(API_ENDPOINTS.JOBS.LIST).then(res => res.data.jobs || []),
    enabled: open && !job,
  });

  // Book interview mutation
  const bookInterviewMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(API_ENDPOINTS.INTERVIEWS.BOOK, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.MY_INTERVIEWS() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AVAILABILITY.FOR_BOOKING() });
      toast.success('Interview scheduled successfully!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to schedule interview');
    },
  });

  // Calendar navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return availableSlots.filter((slot: AvailabilitySlot) => 
      format(new Date(slot.date), 'yyyy-MM-dd') === dateKey &&
      slot.status === 'available' &&
      slot.currentBookings < slot.maxBookings
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

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
    setStep('timeslots');
  };

  // Handle slot selection
  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  // Handle booking confirmation
  const handleBookInterview = () => {
    if (!selectedSlot || !candidateEmail || !selectedJob) {
      toast.error('Please fill in all required fields');
      return;
    }

    bookInterviewMutation.mutate({
      candidateEmail,
      jobId: selectedJob,
      availabilitySlotId: selectedSlot._id,
      notes,
    });
  };

  // Handle close
  const handleClose = () => {
    setStep('calendar');
    setSelectedSlot(null);
    setSelectedCalendarDate(null);
    setCandidateEmail(candidate?.email || '');
    setSelectedJob(job?._id || '');
    setNotes('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        borderBottom: '1px solid', 
        borderColor: 'grey.200',
        backgroundColor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {step === 'calendar' ? 'Select Interview Date' : 
             step === 'timeslots' ? 'Select Time Slot' : 'Confirm Interview'}
          </Typography>
          {employer && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {employer.companyName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {step === 'calendar' ? (
          <Box sx={{ p: 4 }}>
            {/* Calendar Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4
            }}>
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
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
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

            {/* Calendar Grid */}
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
                minHeight: '400px'
              }}>
                {calendarDays.map((day, index) => {
                  const daySlots = getSlotsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isPastDate = isBefore(day, new Date().setHours(0, 0, 0, 0));

                  return (
                    <Box
                      key={day.toISOString()}
                      sx={{
                        minHeight: 80,
                        opacity: isCurrentMonth ? 1 : 0.4,
                        backgroundColor: isToday(day) ? 'primary.50' : 'white',
                        borderRight: '1px solid',
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                        p: 1,
                        position: 'relative',
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

                      {/* Available slots */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {daySlots.length > 0 && (
                          <Button
                            onClick={() => handleDateSelect(day)}
                            size="small"
                            sx={{
                              backgroundColor: 'primary.50',
                              color: 'primary.700',
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              minHeight: 'auto',
                              py: 0.5,
                              px: 1,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'primary.200',
                              '&:hover': {
                                backgroundColor: 'primary.100',
                                borderColor: 'primary.300',
                              },
                              textTransform: 'none',
                              width: '100%',
                            }}
                          >
                            {daySlots.length} slot{daySlots.length > 1 ? 's' : ''}
                          </Button>
                        )}

                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        ) : step === 'timeslots' ? (
          <TimeSlotSelector
            open={true}
            onClose={() => setStep('calendar')}
            selectedDate={selectedCalendarDate}
            availableSlots={availableSlots}
            onSlotSelect={handleSlotSelect}
          />
        ) : (
          <Box sx={{ p: 4 }}>
            {/* Confirmation Step */}
            <Grid container spacing={3}>
              {/* Selected Slot Info */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: 'primary.50', borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Selected Time Slot
                    </Typography>
                    {selectedSlot && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CalendarIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <Typography variant="body2">
                              {format(new Date(selectedSlot.date), 'EEEE, MMMM d, yyyy')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <ScheduleIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <Typography variant="body2">
                              {selectedSlot.startTime} - {selectedSlot.endTime} ({selectedSlot.duration} min)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {getMeetingTypeIcon(selectedSlot.meetingType)}
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {selectedSlot.meetingType} meeting
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <Typography variant="body2">
                              {selectedSlot.employer.companyName}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Candidate Info */}
              {candidate && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Candidate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={candidate.profilePicture}
                      sx={{ width: 48, height: 48 }}
                    >
                      {candidate.firstName[0]}{candidate.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {candidate.firstName} {candidate.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {candidate.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {/* Form Fields */}
              <Grid item xs={12} md={candidate ? 6 : 12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {!candidate && (
                    <TextField
                      label="Candidate Email"
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      fullWidth
                      required
                      placeholder="candidate@example.com"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}

                  {!job && (
                    <FormControl fullWidth required>
                      <InputLabel>Select Job Position</InputLabel>
                      <Select
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        label="Select Job Position"
                        sx={{ borderRadius: 2 }}
                      >
                        {jobs.map((jobOption: Job) => (
                          <MenuItem key={jobOption._id} value={jobOption._id}>
                            {jobOption.title} - {jobOption.location}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <TextField
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Any additional notes for the interview..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              </Grid>

              {job && (
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Job Position
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {job.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.location}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 4, 
        pt: 2, 
        borderTop: '1px solid', 
        borderColor: 'grey.200',
        backgroundColor: 'grey.50',
        gap: 2
      }}>
        {(step === 'confirm' || step === 'timeslots') && (
          <Button 
            onClick={() => setStep(step === 'confirm' ? 'timeslots' : 'calendar')}
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
            Back
          </Button>
        )}
        
        <Button 
          onClick={handleClose}
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
        
        {step === 'confirm' && (
          <Button
            onClick={handleBookInterview}
            variant="contained"
            disabled={bookInterviewMutation.isPending}
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
            {bookInterviewMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RecruiterSchedulingWidget;
