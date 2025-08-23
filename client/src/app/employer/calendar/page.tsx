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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AvailabilityCalendar from "@/components/scheduling/AvailabilityCalendar";
import { API_ENDPOINTS, QUERY_KEYS } from "@/lib/constants";
import api from "@/lib/api";

interface AvailabilitySlot {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  isRecurring: boolean;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Interview {
  _id: string;
  candidate: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  job: {
    _id: string;
    title: string;
    location: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: string;
  meetingDetails: {
    type: string;
    location?: string;
    videoLink?: string;
    phoneNumber?: string;
  };
  interviewType: string;
  candidateNotes?: string;
  createdAt: string;
}

export default function EmployerCalendarPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewInterviewsDialog, setViewInterviewsDialog] = useState(false);

  const queryClient = useQueryClient();

  // Fetch availability slots
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: QUERY_KEYS.AVAILABILITY.LIST(),
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.AVAILABILITY.LIST);
      return response.data;
    },
  });

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

  // Create availability slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (slotData: any) => {
      const response = await api.post(API_ENDPOINTS.AVAILABILITY.CREATE, slotData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AVAILABILITY.ALL });
      toast.success("Availability slot created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create availability slot");
    },
  });

  // Update availability slot mutation
  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(API_ENDPOINTS.AVAILABILITY.UPDATE(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AVAILABILITY.ALL });
      toast.success("Availability slot updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update availability slot");
    },
  });

  // Delete availability slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(API_ENDPOINTS.AVAILABILITY.DELETE(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AVAILABILITY.ALL });
      toast.success("Availability slot deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete availability slot");
    },
  });

  const slots: AvailabilitySlot[] = slotsData?.slots || [];
  const interviews: Interview[] = interviewsData?.interviews || [];
  const stats = statsData?.stats || {};

  // Handle slot operations
  const handleCreateSlot = async (slotData: any) => {
    await createSlotMutation.mutateAsync(slotData);
  };

  const handleUpdateSlot = async (id: string, slotData: any) => {
    await updateSlotMutation.mutateAsync({ id, data: slotData });
  };

  const handleDeleteSlot = async (id: string) => {
    await deleteSlotMutation.mutateAsync(id);
  };

  // Get upcoming interviews
  const upcomingInterviews = interviews
    .filter(interview => {
      const interviewDate = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
      return interviewDate > new Date() && ['scheduled', 'confirmed'].includes(interview.status);
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  // Get meeting type icon
  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon fontSize="small" color="primary" />;
      case 'phone': return <PhoneIcon fontSize="small" color="primary" />;
      case 'in-person': return <LocationIcon fontSize="small" color="primary" />;
      default: return <EventIcon fontSize="small" color="primary" />;
    }
  };

  const isLoading = slotsLoading || interviewsLoading || 
                   createSlotMutation.isPending || 
                   updateSlotMutation.isPending || 
                   deleteSlotMutation.isPending;

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <Box>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" fontWeight="700" mb={1}>
              Interview Calendar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your availability and schedule interviews with candidates
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <CalendarIcon color="primary" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {slots.filter(s => s.status === 'available').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available Slots
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
                    <ScheduleIcon color="success" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {stats.upcoming || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upcoming Interviews
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
                    <PeopleIcon color="warning" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {slots.reduce((sum, slot) => sum + slot.currentBookings, 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Booked Slots
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Grid container spacing={3}>
            {/* Calendar Section */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="600">
                      Availability Calendar
                    </Typography>
                    <Tabs
                      value={currentTab}
                      onChange={(_, newValue) => setCurrentTab(newValue)}
                      size="small"
                    >
                      <Tab label="Calendar View" />
                      <Tab label="List View" />
                    </Tabs>
                  </Box>

                  {currentTab === 0 ? (
                    <AvailabilityCalendar
                      slots={slots}
                      onCreateSlot={handleCreateSlot}
                      onUpdateSlot={handleUpdateSlot}
                      onDeleteSlot={handleDeleteSlot}
                      loading={isLoading}
                    />
                  ) : (
                    <Box>
                      {slots.length === 0 ? (
                        <Alert severity="info">
                          No availability slots created yet. Click "Add Availability" to get started.
                        </Alert>
                      ) : (
                        <List>
                          {slots.map((slot) => (
                            <React.Fragment key={slot._id}>
                              <ListItem
                                secondaryAction={
                                  <IconButton
                                    onClick={(e) => {
                                      setSelectedSlot(slot);
                                      setMenuAnchor(e.currentTarget);
                                    }}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                }
                              >
                                <ListItemIcon>
                                  {getMeetingTypeIcon(slot.meetingType)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box display="flex" alignItems="center" gap={2}>
                                      <Typography variant="subtitle1" fontWeight="600">
                                        {slot.title}
                                      </Typography>
                                      <Chip
                                        label={slot.status}
                                        size="small"
                                        color={
                                          slot.status === 'available' ? 'success' :
                                          slot.status === 'booked' ? 'warning' : 'error'
                                        }
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        {format(parseISO(slot.date), 'EEEE, MMMM d, yyyy')} • {slot.startTime} - {slot.endTime}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {slot.currentBookings}/{slot.maxBookings} bookings • {slot.duration} minutes
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              {/* Upcoming Interviews */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="600">
                      Upcoming Interviews
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setViewInterviewsDialog(true)}
                      endIcon={<ViewIcon />}
                    >
                      View All
                    </Button>
                  </Box>

                  {upcomingInterviews.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No upcoming interviews scheduled
                    </Alert>
                  ) : (
                    <List dense>
                      {upcomingInterviews.map((interview) => (
                        <ListItem key={interview._id} sx={{ px: 0 }}>
                          <ListItemIcon>
                            {getMeetingTypeIcon(interview.meetingDetails.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="600">
                                {interview.candidate.firstName} {interview.candidate.lastName}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {interview.job.title}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {format(parseISO(interview.scheduledDate), 'MMM d')} • {interview.scheduledTime}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" mb={2}>
                    Quick Actions
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      fullWidth
                      onClick={() => {
                        // This would trigger the add availability modal
                        // Implementation would be in the AvailabilityCalendar component
                      }}
                    >
                      Add Availability
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ScheduleIcon />}
                      fullWidth
                      onClick={() => setViewInterviewsDialog(true)}
                    >
                      View All Interviews
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      fullWidth
                    >
                      Calendar Settings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Slot Actions Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => {
              // Handle edit
              setMenuAnchor(null);
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              Edit Slot
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedSlot) {
                handleDeleteSlot(selectedSlot._id);
              }
              setMenuAnchor(null);
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              Delete Slot
            </MenuItem>
          </Menu>

          {/* All Interviews Dialog */}
          <Dialog
            open={viewInterviewsDialog}
            onClose={() => setViewInterviewsDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>All Interviews</DialogTitle>
            <DialogContent>
              {interviews.length === 0 ? (
                <Alert severity="info">
                  No interviews scheduled yet
                </Alert>
              ) : (
                <List>
                  {interviews.map((interview) => (
                    <React.Fragment key={interview._id}>
                      <ListItem>
                        <ListItemIcon>
                          {getMeetingTypeIcon(interview.meetingDetails.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="subtitle1" fontWeight="600">
                                {interview.candidate.firstName} {interview.candidate.lastName}
                              </Typography>
                              <Chip
                                label={interview.status}
                                size="small"
                                color={
                                  interview.status === 'scheduled' ? 'primary' :
                                  interview.status === 'completed' ? 'success' :
                                  interview.status.includes('cancelled') ? 'error' : 'default'
                                }
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {interview.job.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {format(parseISO(interview.scheduledDate), 'EEEE, MMMM d, yyyy')} • {interview.scheduledTime}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewInterviewsDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
