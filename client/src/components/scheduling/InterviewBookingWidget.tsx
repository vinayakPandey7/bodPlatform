"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
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
  Avatar,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { toast } from "sonner";

interface AvailabilitySlot {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
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
  employer: {
    _id: string;
    companyName: string;
    ownerName: string;
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

interface InterviewBookingWidgetProps {
  job: Job;
  availableSlots: AvailabilitySlot[];
  onBookInterview: (slotId: string, jobId: string, notes?: string, interviewType?: string) => Promise<void>;
  loading?: boolean;
  open: boolean;
  onClose: () => void;
}

const InterviewBookingWidget: React.FC<InterviewBookingWidgetProps> = ({
  job,
  availableSlots,
  onBookInterview,
  loading = false,
  open,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [interviewType, setInterviewType] = useState("screening");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = availableSlots.reduce((acc, slot) => {
      const dateKey = format(parseISO(slot.date), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    }, {} as Record<string, AvailabilitySlot[]>);

    // Sort slots within each date by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [availableSlots]);

  // Get available dates (next 30 days with slots)
  const availableDates = useMemo(() => {
    return Object.keys(slotsByDate)
      .map(dateStr => parseISO(dateStr))
      .sort((a, b) => a.getTime() - b.getTime())
      .slice(0, 30); // Limit to next 30 days
  }, [slotsByDate]);

  const steps = ['Select Date', 'Choose Time', 'Confirm Details'];

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setSelectedSlot(null);
      setSelectedDate(null);
      setCandidateNotes("");
      setInterviewType("screening");
    }
  }, [open]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep(1);
  };

  // Handle slot selection
  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setCurrentStep(2);
  };

  // Handle booking confirmation
  const handleBookingConfirm = async () => {
    if (!selectedSlot) return;

    try {
      await onBookInterview(
        selectedSlot._id,
        job._id,
        candidateNotes,
        interviewType
      );
      toast.success("Interview booked successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to book interview. Please try again.");
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 1) {
        setSelectedDate(null);
      } else if (currentStep === 2) {
        setSelectedSlot(null);
      }
    }
  };

  // Get meeting type icon
  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon fontSize="small" color="primary" />;
      case 'phone': return <PhoneIcon fontSize="small" color="primary" />;
      case 'in-person': return <LocationIcon fontSize="small" color="primary" />;
      default: return <EventIcon fontSize="small" color="primary" />;
    }
  };

  // Get meeting type label
  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video Call';
      case 'phone': return 'Phone Call';
      case 'in-person': return 'In Person';
      default: return 'Meeting';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '600px',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          {currentStep > 0 && (
            <IconButton onClick={handleBack} size="small">
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box>
            <Typography variant="h6" fontWeight="600">
              Schedule Interview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.title} at {job.employer.companyName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {/* Progress Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Date Selection */}
        {currentStep === 0 && (
          <Box>
            <Typography variant="h6" mb={3} fontWeight="600">
              Select a Date
            </Typography>
            {availableDates.length === 0 ? (
              <Alert severity="info">
                No available interview slots at this time. Please check back later or contact the employer directly.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {availableDates.map((date) => {
                  const dateSlots = slotsByDate[format(date, 'yyyy-MM-dd')];
                  const availableCount = dateSlots.filter(slot => 
                    slot.status === 'available' && slot.currentBookings < slot.maxBookings
                  ).length;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={date.toISOString()}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          },
                          border: selectedDate && isSameDay(date, selectedDate) ? 2 : 1,
                          borderColor: selectedDate && isSameDay(date, selectedDate) ? 'primary.main' : 'divider',
                        }}
                        onClick={() => handleDateSelect(date)}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="h6" fontWeight="600" color="primary.main">
                            {format(date, 'MMM d')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            {format(date, 'EEEE')}
                          </Typography>
                          <Chip
                            label={`${availableCount} slot${availableCount !== 1 ? 's' : ''}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* Step 2: Time Selection */}
        {currentStep === 1 && selectedDate && (
          <Box>
            <Typography variant="h6" mb={3} fontWeight="600">
              Choose a Time Slot
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Typography>

            <Grid container spacing={2}>
              {slotsByDate[format(selectedDate, 'yyyy-MM-dd')]?.map((slot) => {
                const isAvailable = slot.status === 'available' && slot.currentBookings < slot.maxBookings;
                
                return (
                  <Grid item xs={12} sm={6} key={slot._id}>
                    <Card
                      sx={{
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.6,
                        transition: 'all 0.2s',
                        '&:hover': isAvailable ? {
                          transform: 'translateY(-1px)',
                          boxShadow: 2,
                        } : {},
                        border: selectedSlot?._id === slot._id ? 2 : 1,
                        borderColor: selectedSlot?._id === slot._id ? 'primary.main' : 'divider',
                      }}
                      onClick={() => isAvailable && handleSlotSelect(slot)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <TimeIcon color="primary" />
                          <Typography variant="h6" fontWeight="600">
                            {slot.startTime} - {slot.endTime}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {getMeetingTypeIcon(slot.meetingType)}
                          <Typography variant="body2">
                            {getMeetingTypeLabel(slot.meetingType)}
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Duration: {slot.duration} minutes
                        </Typography>

                        {slot.meetingDetails.instructions && (
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            {slot.meetingDetails.instructions}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 2 && selectedSlot && (
          <Box>
            <Typography variant="h6" mb={3} fontWeight="600">
              Confirm Your Interview
            </Typography>

            {/* Interview Summary */}
            <Card sx={{ mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {job.employer.companyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.title}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <EventIcon fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight="600">Date & Time</Typography>
                    </Box>
                    <Typography variant="body2">
                      {format(parseISO(selectedSlot.date), 'EEEE, MMMM d, yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      {selectedSlot.startTime} - {selectedSlot.endTime} ({selectedSlot.duration} min)
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {getMeetingTypeIcon(selectedSlot.meetingType)}
                      <Typography variant="body2" fontWeight="600">Meeting Type</Typography>
                    </Box>
                    <Typography variant="body2">
                      {getMeetingTypeLabel(selectedSlot.meetingType)}
                    </Typography>
                    {selectedSlot.meetingDetails.location && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedSlot.meetingDetails.location}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {selectedSlot.meetingDetails.instructions && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" fontWeight="600" mb={1}>
                      Instructions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSlot.meetingDetails.instructions}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Interview Type Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Interview Type</InputLabel>
              <Select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                label="Interview Type"
              >
                <MenuItem value="screening">Screening Interview</MenuItem>
                <MenuItem value="technical">Technical Interview</MenuItem>
                <MenuItem value="behavioral">Behavioral Interview</MenuItem>
                <MenuItem value="final">Final Interview</MenuItem>
                <MenuItem value="hr">HR Interview</MenuItem>
              </Select>
            </FormControl>

            {/* Candidate Notes */}
            <TextField
              label="Notes (Optional)"
              multiline
              rows={4}
              fullWidth
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="Any questions or information you'd like to share with the interviewer..."
              sx={{ mb: 3 }}
            />

            <Alert severity="info" sx={{ mb: 2 }}>
              You will receive a confirmation email with interview details and any meeting links.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {currentStep === 2 && (
          <Button
            onClick={handleBookingConfirm}
            variant="contained"
            disabled={loading}
            startIcon={<CheckIcon />}
            sx={{
              background: 'linear-gradient(45deg, #10b981, #059669)',
              '&:hover': {
                background: 'linear-gradient(45deg, #059669, #047857)',
              }
            }}
          >
            Confirm Interview
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InterviewBookingWidget;
