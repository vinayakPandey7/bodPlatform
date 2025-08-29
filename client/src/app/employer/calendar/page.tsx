"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import EnhancedInterviewCalendar from "@/components/EnhancedInterviewCalendar";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  CalendarDays,
  Filter,
  Search,
} from "lucide-react";
import {
  useEmployerCalendar,
  useUpdateInterviewStatus,
} from "@/lib/hooks/interview.hooks";

interface InterviewStatusModalProps {
  open: boolean;
  onClose: () => void;
  booking: any;
  onStatusUpdate: (bookingId: string, status: string, notes?: string) => void;
}

const InterviewStatusModal: React.FC<InterviewStatusModalProps> = ({
  open,
  onClose,
  booking,
  onStatusUpdate,
}) => {
  const [status, setStatus] = useState(booking?.status || "scheduled");
  const [notes, setNotes] = useState(booking?.notes || "");

  const handleUpdate = () => {
    onStatusUpdate(booking._id, status, notes);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Interview Status</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="no_show">No Show</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the interview..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpdate} variant="contained">
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function EmployerCalendarPage() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: calendarData, isLoading, refetch } = useEmployerCalendar();
  const { mutate: updateStatus, isPending } = useUpdateInterviewStatus();

  const handleStatusUpdate = (
    bookingId: string,
    status: string,
    notes?: string
  ) => {
    updateStatus(
      { bookingId, data: { status, notes } },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "no_show":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      case "no_show":
        return "warning";
      default:
        return "default";
    }
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
    const [hours, minutes] = time?.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filter and search bookings
  const filteredBookings = React.useMemo(() => {
    if (!calendarData?.data) return [];

    let allBookings: any[] = [];

    calendarData.data.forEach((day: any) => {
      if (day.bookings) {
        day.bookings.forEach((booking: any) => {
          allBookings.push({
            ...booking,
            slotDate: day.slot.date,
            slotStartTime: day.slot.startTime,
            slotEndTime: day.slot.endTime,
          });
        });
      }
    });

    // Apply status filter
    if (statusFilter !== "all") {
      allBookings = allBookings.filter(
        (booking) => booking.status === statusFilter
      );
    }

    // Apply search filter
    if (searchTerm) {
      allBookings = allBookings.filter(
        (booking) =>
          booking.candidateName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.candidateEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return allBookings.sort(
      (a, b) => new Date(a.slotDate).getTime() - new Date(b.slotDate).getTime()
    );
  }, [calendarData, statusFilter, searchTerm]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!calendarData?.data)
      return { total: 0, scheduled: 0, completed: 0, cancelled: 0, noShow: 0 };

    let total = 0;
    let scheduled = 0;
    let completed = 0;
    let cancelled = 0;
    let noShow = 0;

    calendarData.data.forEach((day: any) => {
      day.bookings.forEach((booking: any) => {
        total++;
        switch (booking.status) {
          case "scheduled":
            scheduled++;
            break;
          case "completed":
            completed++;
            break;
          case "cancelled":
            cancelled++;
            break;
          case "no_show":
            noShow++;
            break;
        }
      });
    });

    return { total, scheduled, completed, cancelled, noShow };
  }, [calendarData]);

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Interview Calendar
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your interview schedule and candidate bookings
              </p>
            </div>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setShowCalendar(true)}
              sx={{ bgcolor: "primary.main" }}
            >
              Set Availability
            </Button>
          </div>

          {/* Statistics */}
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total}
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
                    <Clock className="h-8 w-8 text-blue-500" />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.scheduled}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Scheduled
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
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.completed}
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
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.cancelled + stats.noShow}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cancelled/No Show
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search candidates or jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status Filter</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status Filter"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="no_show">No Show</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box display="flex" gap={2}>
                    <Chip
                      label={`Total: ${filteredBookings.length}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Scheduled: ${stats.scheduled}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Completed: ${stats.completed}`}
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
              >
                <Tab label="All Interviews" />
                <Tab label="Upcoming" />
                <Tab label="Completed" />
              </Tabs>

              <Box mt={3}>
                {activeTab === 0 && (
                  <div>
                    {isLoading ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <Typography>Loading interview schedule...</Typography>
                      </Box>
                    ) : filteredBookings.length === 0 ? (
                      <Alert severity="info">
                        <Typography>
                          No interviews found. Set your availability to start
                          receiving interview bookings.
                        </Typography>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                          <Card key={booking._id} variant="outlined">
                            <CardContent>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="flex-start"
                              >
                                <Box flex={1}>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                    mb={2}
                                  >
                                    <div className="p-2 bg-blue-100 rounded-full">
                                      <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <Box>
                                      <Typography
                                        variant="h6"
                                        fontWeight="medium"
                                      >
                                        {booking.candidateName}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {booking.job?.title}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap={1}
                                    mb={2}
                                  >
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Calendar className="h-4 w-4 text-gray-500" />
                                      <Typography variant="body2">
                                        {formatDate(booking.slotDate)}
                                      </Typography>
                                    </Box>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Clock className="h-4 w-4 text-gray-500" />
                                      <Typography variant="body2">
                                        {formatTime(booking.slotStartTime)} -{" "}
                                        {formatTime(booking.slotEndTime)}
                                      </Typography>
                                    </Box>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Mail className="h-4 w-4 text-gray-500" />
                                      <Typography variant="body2">
                                        {booking.candidateEmail}
                                      </Typography>
                                    </Box>
                                    {booking.candidatePhone && (
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <Typography variant="body2">
                                          {booking.candidatePhone}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>

                                <Box
                                  display="flex"
                                  flexDirection="column"
                                  alignItems="flex-end"
                                  gap={2}
                                >
                                  <Chip
                                    icon={getStatusIcon(booking.status)}
                                    label={booking.status.replace("_", " ")}
                                    color={
                                      getStatusColor(booking.status) as any
                                    }
                                    size="small"
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowStatusModal(true);
                                    }}
                                  >
                                    <Settings className="h-4 w-4" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 1 && (
                  <div>
                    {filteredBookings.filter((b) => b.status === "scheduled")
                      .length === 0 ? (
                      <Alert severity="info">
                        <Typography>No upcoming interviews found.</Typography>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings
                          .filter((b) => b.status === "scheduled")
                          .map((booking) => (
                            <Card key={booking._id} variant="outlined">
                              <CardContent>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="flex-start"
                                >
                                  <Box flex={1}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={2}
                                      mb={2}
                                    >
                                      <div className="p-2 bg-blue-100 rounded-full">
                                        <User className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <Box>
                                        <Typography
                                          variant="h6"
                                          fontWeight="medium"
                                        >
                                          {booking.candidateName}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {booking.job?.title}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Box
                                      display="flex"
                                      flexDirection="column"
                                      gap={1}
                                      mb={2}
                                    >
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <Typography variant="body2">
                                          {formatDate(booking.slotDate)}
                                        </Typography>
                                      </Box>
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <Typography variant="body2">
                                          {formatTime(booking.slotStartTime)} -{" "}
                                          {formatTime(booking.slotEndTime)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="flex-end"
                                    gap={2}
                                  >
                                    <Chip
                                      icon={getStatusIcon(booking.status)}
                                      label={booking.status.replace("_", " ")}
                                      color={
                                        getStatusColor(booking.status) as any
                                      }
                                      size="small"
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedBooking(booking);
                                        setShowStatusModal(true);
                                      }}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 2 && (
                  <div>
                    {filteredBookings.filter((b) => b.status === "completed")
                      .length === 0 ? (
                      <Alert severity="info">
                        <Typography>No completed interviews found.</Typography>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings
                          .filter((b) => b.status === "completed")
                          .map((booking) => (
                            <Card key={booking._id} variant="outlined">
                              <CardContent>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="flex-start"
                                >
                                  <Box flex={1}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={2}
                                      mb={2}
                                    >
                                      <div className="p-2 bg-green-100 rounded-full">
                                        <User className="h-4 w-4 text-green-600" />
                                      </div>
                                      <Box>
                                        <Typography
                                          variant="h6"
                                          fontWeight="medium"
                                        >
                                          {booking.candidateName}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {booking.job?.title}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Box
                                      display="flex"
                                      flexDirection="column"
                                      gap={1}
                                      mb={2}
                                    >
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <Typography variant="body2">
                                          {formatDate(booking.slotDate)}
                                        </Typography>
                                      </Box>
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <Typography variant="body2">
                                          {formatTime(booking.slotStartTime)} -{" "}
                                          {formatTime(booking.slotEndTime)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="flex-end"
                                    gap={2}
                                  >
                                    <Chip
                                      icon={getStatusIcon(booking.status)}
                                      label={booking.status.replace("_", " ")}
                                      color={
                                        getStatusColor(booking.status) as any
                                      }
                                      size="small"
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedBooking(booking);
                                        setShowStatusModal(true);
                                      }}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Interview Calendar Modal */}
          <EnhancedInterviewCalendar
            open={showCalendar}
            onClose={() => setShowCalendar(false)}
          />

          {/* Status Update Modal */}
          <InterviewStatusModal
            open={showStatusModal}
            onClose={() => setShowStatusModal(false)}
            booking={selectedBooking}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
