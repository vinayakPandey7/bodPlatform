"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
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
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import CalendlyStyleScheduler from "./CalendlyStyleScheduler";

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




  const steps = ['Select Date & Time', 'Confirm Details'];

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setSelectedSlot(null);
      setCandidateNotes("");
      setInterviewType("screening");
    }
  }, [open]);

  // Handle time slot selection from CalendlyStyleScheduler
  const handleTimeSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setCurrentStep(1);
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
      toast.error(error?.data?.message);
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

        {/* Step 1: Date & Time Selection */}
        {currentStep === 0 && (
          <Box sx={{ height: '500px', overflow: 'hidden' }}>
            {availableSlots.length === 0 ? (
              <Alert severity="info">
                No available interview slots at this time. Please check back later or contact the employer directly.
              </Alert>
            ) : (
              <CalendlyStyleScheduler
                availableSlots={availableSlots}
                onSlotSelect={handleTimeSlotSelect}
                title="Select Date & Time"
              />
            )}
          </Box>
        )}

        {/* Step 2: Time Selection - Now handled by TimeSlotSelector popup */}

        {/* Step 2: Confirmation */}
        {currentStep === 1 && selectedSlot && (
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
