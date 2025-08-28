"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Calendar,
  Clock,
  Building,
  MapPin,
  User,
  Mail,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  generateICSFile,
  downloadCalendarFile,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
} from "@/lib/calendarUtils";

interface InterviewSuccessModalProps {
  open: boolean;
  onClose: () => void;
  booking: {
    candidateName: string;
    candidateEmail: string;
    slotDate: string;
    slotStartTime: string;
    slotEndTime: string;
    job: {
      title: string;
      description?: string;
      location: string;
    };
    employer: {
      companyName: string;
      email: string;
    };
  };
}

const InterviewSuccessModal: React.FC<InterviewSuccessModalProps> = ({
  open,
  onClose,
  booking,
}) => {
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

  const handleDownloadICS = () => {
    const startDate = new Date(`${booking.slotDate}T${booking.slotStartTime}`);
    const endDate = new Date(`${booking.slotDate}T${booking.slotEndTime}`);

    const interviewData = {
      title: `Interview - ${booking.job.title} at ${booking.employer.companyName}`,
      description: `Interview for ${booking.job.title} position at ${booking.employer.companyName}.

Candidate: ${booking.candidateName}
Email: ${booking.candidateEmail}

${booking.job.description || ""}

Please arrive 10 minutes early.`,
      location: booking.job.location,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      organizer: {
        name: booking.employer.companyName,
        email: booking.employer.email,
      },
      attendee: {
        name: booking.candidateName,
        email: booking.candidateEmail,
      },
    };

    const icsContent = generateICSFile(interviewData);
    downloadCalendarFile(icsContent, `interview-${booking.job.title}.ics`);
  };

  const handleGoogleCalendar = () => {
    const startDate = new Date(`${booking.slotDate}T${booking.slotStartTime}`);
    const endDate = new Date(`${booking.slotDate}T${booking.slotEndTime}`);

    const interviewData = {
      title: `Interview - ${booking.job.title} at ${booking.employer.companyName}`,
      description: `Interview for ${booking.job.title} position at ${booking.employer.companyName}.

Candidate: ${booking.candidateName}
Email: ${booking.candidateEmail}

${booking.job.description || ""}

Please arrive 10 minutes early.`,
      location: booking.job.location,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const googleUrl = generateGoogleCalendarUrl(interviewData);
    window.open(googleUrl, "_blank");
  };

  const handleOutlookCalendar = () => {
    const startDate = new Date(`${booking.slotDate}T${booking.slotStartTime}`);
    const endDate = new Date(`${booking.slotDate}T${booking.slotEndTime}`);

    const interviewData = {
      title: `Interview - ${booking.job.title} at ${booking.employer.companyName}`,
      description: `Interview for ${booking.job.title} position at ${booking.employer.companyName}.

Candidate: ${booking.candidateName}
Email: ${booking.candidateEmail}

${booking.job.description || ""}

Please arrive 10 minutes early.`,
      location: booking.job.location,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const outlookUrl = generateOutlookCalendarUrl(interviewData);
    window.open(outlookUrl, "_blank");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <CheckCircle className="h-6 w-6 text-green-600" />
          <Typography variant="h6">Interview Scheduled Successfully!</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="body1" color="text.secondary">
            Your interview has been confirmed. You will receive a confirmation email shortly with all the details.
          </Typography>
        </Box>

        {/* Interview Details */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Interview Details
            </Typography>

            {booking &&<Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Building className="h-4 w-4 text-gray-500" />
                  <Typography variant="body2">
                    <strong>Company:</strong> {booking?.employer?.companyName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <User className="h-4 w-4 text-gray-500" />
                  <Typography variant="body2">
                    <strong>Position:</strong> {booking?.job?.title}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Typography variant="body2">
                    <strong>Date:</strong> {formatDate(booking?.slotDate)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Typography variant="body2">
                    <strong>Time:</strong> {formatTime(booking.slotStartTime)} - {formatTime(booking.slotEndTime)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <Typography variant="body2">
                    <strong>Location:</strong> {booking.job.location}
                  </Typography>
                </Box>
              </Grid>
            </Grid>}

            <Box mt={2}>
              <Chip
                icon={<CheckCircle className="h-4 w-4" />}
                label="Confirmed"
                color="success"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Add to Calendar Section */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add to Your Calendar
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={3}>
              Add this interview to your calendar to receive reminders and keep track of your schedule.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownloadICS}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Download .ics File
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Works with any calendar app
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  startIcon={<ExternalLink />}
                  onClick={handleGoogleCalendar}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Add to Google Calendar
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Opens Google Calendar
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  startIcon={<ExternalLink />}
                  onClick={handleOutlookCalendar}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Add to Outlook
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Opens Outlook Calendar
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              <strong>Reminder:</strong> Please arrive 10 minutes before your scheduled interview time.
            </Typography>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewSuccessModal;
