"use client";
import React, { useState, Fragment } from "react";
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
  CardActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { Calendar, Clock, Users, Check, User, Mail, Phone } from "lucide-react";
import { useAvailableSlots, useScheduleInterview } from "@/lib/hooks/interview.hooks";
import InterviewSuccessModal from "./InterviewSuccessModal";

interface InterviewSlotSelectorProps {
  open: boolean;
  onClose: () => void;
  employerId?: string;
  jobId?: string;
  invitationToken?: string;
}

interface SlotSelection {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
}

const InterviewSlotSelector: React.FC<InterviewSlotSelectorProps> = ({
  open,
  onClose,
  employerId,
  jobId,
  invitationToken,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null);
  const [candidateInfo, setCandidateInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const { data: availableSlots, isLoading } = useAvailableSlots({ employerId });
  const { mutate: scheduleInterview, isPending } = useScheduleInterview();

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot({
      slotId: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      availableSpots: slot.availableSpots,
    });
  };

  const handleSchedule = () => {
    if (!selectedSlot || !candidateInfo.name || !candidateInfo.email || !jobId) {
      alert("Please fill in all required fields");
      return;
    }

    scheduleInterview(
      {
        slotId: selectedSlot.slotId,
        candidateName: candidateInfo.name,
        candidateEmail: candidateInfo.email,
        candidatePhone: candidateInfo.phone,
        jobId,
      },
      {
        onSuccess: (data) => {
          // Prepare booking data for success modal
          const booking = {
            candidateName: candidateInfo.name,
            candidateEmail: candidateInfo.email,
            slotDate: selectedSlot.date,
            slotStartTime: selectedSlot.startTime,
            slotEndTime: selectedSlot.endTime,
            job: data.job || { title: "Interview", description: "", location: "TBD" },
            employer: data.employer || { companyName: "Company", email: "company@example.com" },
          };
          
          setBookingData(booking);
          setShowSuccessModal(true);
          onClose();
          setSelectedSlot(null);
          setCandidateInfo({ name: "", email: "", phone: "" });
        },
        onError: (error) => {
          alert("Failed to schedule interview. Please try again.");
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Fragment>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Calendar className="h-5 w-5" />
          Select Interview Slot
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Available Slots */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Available Time Slots
            </Typography>
            
            {isLoading ? (
              <Typography>Loading available slots...</Typography>
            ) : availableSlots?.data?.length === 0 ? (
              <Alert severity="info">No available slots found for this employer.</Alert>
            ) : (
              <Box maxHeight={400} overflow="auto">
                {availableSlots?.data?.map((day: any) => (
                  <Box key={day.date} mb={3}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {formatDate(day.date)}
                    </Typography>
                    <Grid container spacing={1}>
                      {day.slots.map((slot: any) => (
                        <Grid item xs={12} key={slot.id}>
                          <Card
                            variant={selectedSlot?.slotId === slot.id ? "elevation" : "outlined"}
                            sx={{
                              cursor: "pointer",
                              borderColor: selectedSlot?.slotId === slot.id ? "primary.main" : "divider",
                              "&:hover": {
                                borderColor: "primary.main",
                              },
                            }}
                            onClick={() => handleSlotSelect(slot)}
                          >
                            <CardContent sx={{ py: 2 }}>
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Clock className="h-4 w-4 text-gray-500" />
                                <Typography variant="body1" fontWeight="medium">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Users className="h-4 w-4 text-gray-500" />
                                <Chip
                                  label={`${slot.availableSpots} spot${slot.availableSpots > 1 ? "s" : ""} available`}
                                  size="small"
                                  color="success"
                                />
                              </Box>
                            </CardContent>
                            {selectedSlot?.slotId === slot.id && (
                              <CardActions>
                                <Check className="h-4 w-4 text-primary" />
                                <Typography variant="body2" color="primary">
                                  Selected
                                </Typography>
                              </CardActions>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Candidate Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Your Information
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Full Name"
                value={candidateInfo.name}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                required
                fullWidth
                InputProps={{
                  startAdornment: <User className="h-4 w-4 text-gray-500 mr-2" />,
                }}
              />
              
              <TextField
                label="Email Address"
                type="email"
                value={candidateInfo.email}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, email: e.target.value })}
                required
                fullWidth
                InputProps={{
                  startAdornment: <Mail className="h-4 w-4 text-gray-500 mr-2" />,
                }}
              />
              
              <TextField
                label="Phone Number (Optional)"
                value={candidateInfo.phone}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, phone: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: <Phone className="h-4 w-4 text-gray-500 mr-2" />,
                }}
              />
            </Box>

            {/* Selected Slot Summary */}
            {selectedSlot && (
              <Box mt={3} p={2} border={1} borderColor="primary.main" borderRadius={1}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Selected Interview Slot
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2">
                    <strong>Date:</strong> {formatDate(selectedSlot.date)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Available Spots:</strong> {selectedSlot.availableSpots}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSchedule}
          variant="contained"
          disabled={isPending || !selectedSlot || !candidateInfo.name || !candidateInfo.email}
        >
          {isPending ? "Scheduling..." : "Schedule Interview"}
        </Button>
      </DialogActions>
    </Dialog>

      {/* Success Modal */}
      <InterviewSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        booking={bookingData}
      />
    </Fragment>
  );
};

export default InterviewSlotSelector;
