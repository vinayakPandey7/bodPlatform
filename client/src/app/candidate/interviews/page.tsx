"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Event as EventIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import InterviewBookingWidget from "@/components/scheduling/InterviewBookingWidget";
import { API_ENDPOINTS, QUERY_KEYS } from "@/lib/constants";
import api from "@/lib/api";

interface Interview {
  _id: string;
  candidate: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  employer: {
    _id: string;
    companyName: string;
    ownerName: string;
    email: string;
  };
  job: {
    _id: string;
    title: string;
    location: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  timezone: string;
  status: string;
  meetingDetails: {
    type: string;
    location?: string;
    videoLink?: string;
    phoneNumber?: string;
    instructions?: string;
  };
  interviewType: string;
  candidateNotes?: string;
  employerNotes?: string;
  feedback?: {
    rating?: number;
    comments?: string;
    recommendation?: string;
  };
  createdAt: string;
  updatedAt: string;
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

export default function CandidateInterviewsPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [cancellationReason, setCancellationReason] = useState("");

  const queryClient = useQueryClient();

  // Fetch interviews
  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: QUERY_KEYS.INTERVIEWS.MY_INTERVIEWS(),
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.INTERVIEWS.MY_INTERVIEWS);
      return response.data;
    },
  });

  // Fetch interview stats
  const { data: statsData } = useQuery({
    queryKey: QUERY_KEYS.INTERVIEWS.STATS,
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.INTERVIEWS.STATS);
      return response.data;
    },
  });

  // Book interview mutation
  const bookInterviewMutation = useMutation({
    mutationFn: async ({ slotId, jobId, notes, interviewType }: {
      slotId: string;
      jobId: string;
      notes?: string;
      interviewType?: string;
    }) => {
      const response = await api.post(API_ENDPOINTS.INTERVIEWS.BOOK, {
        availabilitySlotId: slotId,
        jobId,
        candidateNotes: notes,
        interviewType,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.ALL });
      toast.success("Interview booked successfully!");
      setBookingDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to book interview");
    },
  });

  // Cancel interview mutation
  const cancelInterviewMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.patch(API_ENDPOINTS.INTERVIEWS.CANCEL(id), { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.ALL });
      toast.success("Interview cancelled successfully");
      setCancelDialog(false);
      setCancellationReason("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel interview");
    },
  });

  const interviews: Interview[] = interviewsData?.interviews || [];
  const stats = statsData?.stats || {};

  // Filter interviews by status
  const upcomingInterviews = interviews.filter(interview => {
    const interviewDate = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
    return interviewDate > new Date() && ['scheduled', 'confirmed'].includes(interview.status);
  });

  const pastInterviews = interviews.filter(interview => {
    const interviewDate = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
    return interviewDate <= new Date() || ['completed', 'cancelled_by_candidate', 'cancelled_by_employer'].includes(interview.status);
  });

  // Handle booking interview
  const handleBookInterview = async (slotId: string, jobId: string, notes?: string, interviewType?: string) => {
    await bookInterviewMutation.mutateAsync({ slotId, jobId, notes, interviewType });
  };

  // Handle cancel interview
  const handleCancelInterview = async () => {
    if (!selectedInterview || !cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    await cancelInterviewMutation.mutateAsync({
      id: selectedInterview._id,
      reason: cancellationReason,
    });
  };

  // Fetch available slots for a job
  const fetchAvailableSlots = async (employerId: string) => {
    try {
      const response = await api.get(API_ENDPOINTS.AVAILABILITY.FOR_BOOKING, {
        params: { employerId }
      });
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      toast.error("Failed to fetch available slots");
      setAvailableSlots([]);
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

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'primary' as const, icon: <ScheduleIcon fontSize="small" /> };
      case 'confirmed':
        return { color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> };
      case 'completed':
        return { color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> };
      case 'cancelled_by_candidate':
      case 'cancelled_by_employer':
        return { color: 'error' as const, icon: <CancelIcon fontSize="small" /> };
      case 'rescheduled':
        return { color: 'warning' as const, icon: <WarningIcon fontSize="small" /> };
      default:
        return { color: 'default' as const, icon: <InfoIcon fontSize="small" /> };
    }
  };

  // Check if interview can be cancelled (at least 2 hours before)
  const canCancelInterview = (interview: Interview) => {
    const interviewDateTime = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
    const now = new Date();
    const hoursUntil = (interviewDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil > 2 && ['scheduled', 'confirmed'].includes(interview.status);
  };

  const isLoading = interviewsLoading || bookInterviewMutation.isPending || cancelInterviewMutation.isPending;

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <DashboardLayout>
        <Box>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" fontWeight="700" mb={1}>
              My Interviews
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your scheduled interviews and book new ones
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <ScheduleIcon color="primary" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {upcomingInterviews.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upcoming
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <CheckCircleIcon color="success" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {stats.byStatus?.completed || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EventIcon color="info" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {stats.total || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Interviews
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <BusinessIcon color="warning" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {new Set(interviews.map(i => i.employer._id)).size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Companies
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Tabs
                  value={currentTab}
                  onChange={(_, newValue) => setCurrentTab(newValue)}
                >
                  <Tab label={`Upcoming (${upcomingInterviews.length})`} />
                  <Tab label={`Past (${pastInterviews.length})`} />
                </Tabs>
              </Box>

              {/* Upcoming Interviews */}
              {currentTab === 0 && (
                <Box>
                  {upcomingInterviews.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      No upcoming interviews scheduled. Check your job applications to book interviews.
                    </Alert>
                  ) : (
                    <List>
                      {upcomingInterviews.map((interview) => {
                        const statusDisplay = getStatusDisplay(interview.status);
                        return (
                          <React.Fragment key={interview._id}>
                            <ListItem
                              secondaryAction={
                                <IconButton
                                  onClick={(e) => {
                                    setSelectedInterview(interview);
                                    setMenuAnchor(e.currentTarget);
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              }
                            >
                              <ListItemIcon>
                                {getMeetingTypeIcon(interview.meetingDetails.type)}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                                    <Typography variant="h6" fontWeight="600">
                                      {interview.job.title}
                                    </Typography>
                                    <Chip
                                      label={interview.status.replace('_', ' ')}
                                      size="small"
                                      color={statusDisplay.color}
                                      icon={statusDisplay.icon}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                                      <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      {interview.employer.companyName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                                      <CalendarIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      {format(parseISO(interview.scheduledDate), 'EEEE, MMMM d, yyyy')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <TimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      {interview.scheduledTime} ({interview.duration} minutes)
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}
                </Box>
              )}

              {/* Past Interviews */}
              {currentTab === 1 && (
                <Box>
                  {pastInterviews.length === 0 ? (
                    <Alert severity="info">
                      No past interviews found.
                    </Alert>
                  ) : (
                    <List>
                      {pastInterviews.map((interview) => {
                        const statusDisplay = getStatusDisplay(interview.status);
                        return (
                          <React.Fragment key={interview._id}>
                            <ListItem
                              secondaryAction={
                                <IconButton
                                  onClick={() => {
                                    setSelectedInterview(interview);
                                    setDetailsDialog(true);
                                  }}
                                >
                                  <InfoIcon />
                                </IconButton>
                              }
                            >
                              <ListItemIcon>
                                {getMeetingTypeIcon(interview.meetingDetails.type)}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                                    <Typography variant="h6" fontWeight="600">
                                      {interview.job.title}
                                    </Typography>
                                    <Chip
                                      label={interview.status.replace('_', ' ')}
                                      size="small"
                                      color={statusDisplay.color}
                                      icon={statusDisplay.icon}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                                      <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      {interview.employer.companyName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <CalendarIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      {format(parseISO(interview.scheduledDate), 'EEEE, MMMM d, yyyy')} • {interview.scheduledTime}
                                    </Typography>
                                    {interview.feedback && (
                                      <Typography variant="body2" color="success.main" mt={0.5}>
                                        Feedback: {interview.feedback.recommendation || 'Provided'}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Interview Actions Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => {
              setDetailsDialog(true);
              setMenuAnchor(null);
            }}>
              <ListItemIcon>
                <InfoIcon fontSize="small" />
              </ListItemIcon>
              View Details
            </MenuItem>
            {selectedInterview && canCancelInterview(selectedInterview) && (
              <MenuItem onClick={() => {
                setCancelDialog(true);
                setMenuAnchor(null);
              }}>
                <ListItemIcon>
                  <CancelIcon fontSize="small" />
                </ListItemIcon>
                Cancel Interview
              </MenuItem>
            )}
          </Menu>

          {/* Interview Details Dialog */}
          <Dialog
            open={detailsDialog}
            onClose={() => setDetailsDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Interview Details</DialogTitle>
            <DialogContent>
              {selectedInterview && (
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" mb={2}>Interview Information</Typography>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">Job Title</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedInterview.job.title}</Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">Company</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedInterview.employer.companyName}</Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">Interview Type</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedInterview.interviewType}</Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          label={selectedInterview.status.replace('_', ' ')}
                          size="small"
                          color={getStatusDisplay(selectedInterview.status).color}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" mb={2}>Meeting Details</Typography>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                        <Typography variant="body1" fontWeight="600">
                          {format(parseISO(selectedInterview.scheduledDate), 'EEEE, MMMM d, yyyy')}
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {selectedInterview.scheduledTime} ({selectedInterview.duration} minutes)
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">Meeting Type</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getMeetingTypeIcon(selectedInterview.meetingDetails.type)}
                          <Typography variant="body1" fontWeight="600">
                            {selectedInterview.meetingDetails.type === 'video' ? 'Video Call' :
                             selectedInterview.meetingDetails.type === 'phone' ? 'Phone Call' : 'In Person'}
                          </Typography>
                        </Box>
                      </Box>
                      {selectedInterview.meetingDetails.videoLink && (
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">Video Link</Typography>
                          <Typography variant="body1" fontWeight="600">
                            {selectedInterview.meetingDetails.videoLink}
                          </Typography>
                        </Box>
                      )}
                      {selectedInterview.meetingDetails.location && (
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">Location</Typography>
                          <Typography variant="body1" fontWeight="600">
                            {selectedInterview.meetingDetails.location}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                  
                  {selectedInterview.candidateNotes && (
                    <Box mt={3}>
                      <Typography variant="h6" mb={1}>Your Notes</Typography>
                      <Typography variant="body2">{selectedInterview.candidateNotes}</Typography>
                    </Box>
                  )}
                  
                  {selectedInterview.meetingDetails.instructions && (
                    <Box mt={3}>
                      <Typography variant="h6" mb={1}>Instructions</Typography>
                      <Typography variant="body2">{selectedInterview.meetingDetails.instructions}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Cancel Interview Dialog */}
          <Dialog
            open={cancelDialog}
            onClose={() => setCancelDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Cancel Interview</DialogTitle>
            <DialogContent>
              <Typography variant="body1" mb={3}>
                Are you sure you want to cancel this interview? Please provide a reason:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Cancellation Reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please explain why you need to cancel this interview..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCancelDialog(false)}>Keep Interview</Button>
              <Button
                onClick={handleCancelInterview}
                color="error"
                variant="contained"
                disabled={!cancellationReason.trim() || cancelInterviewMutation.isPending}
              >
                Cancel Interview
              </Button>
            </DialogActions>
          </Dialog>

          {/* Interview Booking Widget */}
          {selectedJob && (
            <InterviewBookingWidget
              job={selectedJob}
              availableSlots={availableSlots}
              onBookInterview={handleBookInterview}
              loading={bookInterviewMutation.isPending}
              open={bookingDialog}
              onClose={() => setBookingDialog(false)}
            />
          )}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
