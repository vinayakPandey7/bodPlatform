"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import EnhancedInterviewCalendar from "@/components/EnhancedInterviewCalendar";
import CalendarViewToggle from "@/components/CalendarViewToggle";
import GoogleCalendarView from "@/components/GoogleCalendarView";
import InterviewListView from "@/components/InterviewListView";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  useEmployerCalendar,
  useUpdateInterviewStatus,
} from "@/lib/hooks/interview.hooks";
import Client from "@/lib/api";

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
    onStatusUpdate(booking.id || booking._id, status, notes);
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
  const [currentView, setCurrentView] = useState<"calendar" | "list">(
    "calendar"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: calendarData, isLoading, refetch } = useEmployerCalendar();

  // Add manual refresh functionality
  const handleRefresh = () => {
    refetch();
  };
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

  const handleInviteParticipant = async (bookingId: string, email: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await Client.post(
        `interviews/employer/interview/${bookingId}/participant`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to send invitation");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send invitation"
      );
    }
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
      if (day.bookings && day.bookings.length > 0) {
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

    console.log('All bookings before filtering:', allBookings);
    console.log('Current status filter:', statusFilter);

    // Apply status filter - include both "scheduled" and "confirmed" for active interviews
    if (statusFilter !== "all") {
      allBookings = allBookings.filter(
        (booking) => booking.status === statusFilter
      );
    }

    console.log('All bookings after status filtering:', allBookings);

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

    const sortedBookings = allBookings.sort(
      (a, b) => new Date(a.slotDate).getTime() - new Date(b.slotDate).getTime()
    );
    
    console.log('Final filtered bookings:', sortedBookings);
    return sortedBookings;
  }, [calendarData, statusFilter, searchTerm]);

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking);
    // Don't open status modal immediately, let the details modal show first
  };

  const handleStatusUpdateClick = (booking: any) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

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
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Calendar />}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => setShowCalendar(true)}
                sx={{ bgcolor: "primary.main" }}
              >
                Set Availability
              </Button>
            </Box>
          </div>

          {/* Statistics */}
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr 1fr",
            }}
            gap={3}
            className="mb-6"
          >
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
          </Box>

          {/* View Toggle and Filters */}
          <Card className="mb-6">
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <CalendarViewToggle
                  view={currentView}
                  onViewChange={setCurrentView}
                />
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
              </Box>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                gap={3}
                alignItems="center"
              >
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
              </Box>
            </CardContent>
          </Card>

          {/* Calendar/List View Content */}
          {currentView === "calendar" ? (
            <GoogleCalendarView
              bookings={filteredBookings}
              onBookingClick={handleBookingClick}
              onStatusUpdate={handleStatusUpdateClick}
              onInviteParticipant={handleInviteParticipant}
              isLoading={isLoading}
            />
          ) : (
            <InterviewListView
              bookings={filteredBookings}
              onBookingClick={handleStatusUpdateClick}
              isLoading={isLoading}
            />
          )}

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
