"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEmployerCalendar, useUpdateInterviewStatus } from "@/lib/hooks/interview.hooks";

interface EmployerInterviewCalendarProps {
  open: boolean;
  onClose: () => void;
}

interface BookingDetails {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  interviewType: "phone" | "video" | "in_person";
  meetingLink?: string;
  notes?: string;
  scheduledAt: string;
  slot: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  job: {
    _id: string;
    title: string;
    location: string;
  };
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

const EmployerInterviewCalendar: React.FC<EmployerInterviewCalendarProps> = ({
  open,
  onClose,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  const { data: calendarData, isLoading } = useEmployerCalendar({
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString(),
  });

  const { mutate: updateStatus } = useUpdateInterviewStatus();

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    if (!calendarData?.bookings) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return calendarData.bookings.filter((booking: BookingDetails) => {
      const bookingDate = new Date(booking.slot.date).toISOString().split('T')[0];
      return bookingDate === dateString;
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      case "no_show":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    updateStatus(
      { bookingId, data: { status: newStatus } },
      {
        onSuccess: () => {
          setShowBookingDetails(false);
          setSelectedBooking(null);
        },
      }
    );
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={600}>
              Interview Calendar
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={() => navigateMonth('prev')}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" minWidth={200} textAlign="center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Typography>
              <IconButton onClick={() => navigateMonth('next')}>
                <ChevronRight />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading calendar...</Typography>
            </Box>
          ) : (
            <Box>
              {/* Calendar Grid */}
              <Card variant="outlined">
                <CardContent sx={{ p: 0 }}>
                  {/* Day Headers */}
                  <Box 
                    display="grid" 
                    gridTemplateColumns="repeat(7, 1fr)"
                    sx={{ backgroundColor: 'grey.50' }}
                  >
                    {dayNames.map((day) => (
                      <Box
                        key={day}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        py={2}
                        sx={{ borderRight: 1, borderColor: 'divider' }}
                      >
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary" 
                          fontWeight={600}
                        >
                          {day}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Calendar Days */}
                  <Box 
                    display="grid" 
                    gridTemplateColumns="repeat(7, 1fr)"
                    sx={{ minHeight: 600 }}
                  >
                    {calendarDays.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isToday = date.toDateString() === new Date().toDateString();
                      const bookings = getBookingsForDate(date);

                      return (
                        <Box
                          key={index}
                          sx={{
                            minHeight: 120,
                            p: 1,
                            borderRight: (index + 1) % 7 !== 0 ? 1 : 0,
                            borderBottom: index < 35 ? 1 : 0,
                            borderColor: 'divider',
                            backgroundColor: isToday ? 'primary.50' : 'transparent',
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: !isCurrentMonth ? 'text.disabled' : 
                                     isToday ? 'primary.main' : 'text.primary',
                              fontWeight: isToday ? 600 : 400,
                              mb: 1
                            }}
                          >
                            {date.getDate()}
                          </Typography>

                          {/* Bookings for this date */}
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {bookings.map((booking: BookingDetails) => (
                              <Chip
                                key={booking._id}
                                label={`${formatTime(booking.slot.startTime)} - ${booking.candidateName}`}
                                size="small"
                                color={getStatusColor(booking.status) as any}
                                variant="outlined"
                                icon={getStatusIcon(booking.status)}
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowBookingDetails(true);
                                }}
                                sx={{
                                  fontSize: '10px',
                                  height: 20,
                                  cursor: 'pointer',
                                  '& .MuiChip-label': {
                                    px: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>

              {/* Legend */}
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Status Legend:
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip label="Scheduled" color="primary" size="small" icon={<Clock size={14} />} />
                  <Chip label="Completed" color="success" size="small" icon={<CheckCircle size={14} />} />
                  <Chip label="Cancelled" color="error" size="small" icon={<XCircle size={14} />} />
                  <Chip label="No Show" color="warning" size="small" icon={<AlertCircle size={14} />} />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Booking Details Modal */}
      <Dialog
        open={showBookingDetails}
        onClose={() => setShowBookingDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Interview Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              {/* Interview Info */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedBooking.job.title}
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(12, 1fr)' }}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Calendar size={16} />
                        <Typography variant="body2">
                          {new Date(selectedBooking.slot.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Clock size={16} />
                        <Typography variant="body2">
                          {formatTime(selectedBooking.slot.startTime)} - {formatTime(selectedBooking.slot.endTime)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <MapPin size={16} />
                        <Typography variant="body2">
                          {selectedBooking.job.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box mt={2}>
                    <Chip 
                      label={selectedBooking.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(selectedBooking.status) as any}
                      icon={getStatusIcon(selectedBooking.status)}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Candidate Info */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Candidate Information
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar>
                      {selectedBooking.candidate.firstName?.charAt(0) || selectedBooking.candidateName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedBooking.candidateName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Candidate
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Mail size={16} />
                    <Typography variant="body2">
                      {selectedBooking.candidateEmail}
                    </Typography>
                  </Box>

                  {selectedBooking.candidatePhone && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Phone size={16} />
                      <Typography variant="body2">
                        {selectedBooking.candidatePhone}
                      </Typography>
                    </Box>
                  )}

                  {selectedBooking.meetingLink && (
                    <Box display="flex" alignItems="center" gap={1} mt={2}>
                      <Video size={16} />
                      <Button
                        variant="outlined"
                        size="small"
                        href={selectedBooking.meetingLink}
                        target="_blank"
                      >
                        Join Meeting
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Status Actions */}
              {selectedBooking.status === 'scheduled' && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Update Status
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleStatusUpdate(selectedBooking._id, 'completed')}
                      >
                        Mark Completed
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleStatusUpdate(selectedBooking._id, 'no_show')}
                      >
                        No Show
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookingDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployerInterviewCalendar;
