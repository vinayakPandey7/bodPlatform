"use client";
import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  UserPlus,
  X,
  Send,
} from "lucide-react";

interface BookingDetails {
  _id: string;
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show" | "confirmed";
  interviewType: "phone" | "video" | "in_person";
  meetingLink?: string;
  notes?: string;
  participants?: string[];
  scheduledAt: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
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

interface GoogleCalendarViewProps {
  bookings: BookingDetails[];
  onBookingClick: (booking: BookingDetails) => void;
  onStatusUpdate?: (booking: BookingDetails) => void;
  onInviteParticipant?: (bookingId: string, email: string) => Promise<void>;
  isLoading?: boolean;
}

type CalendarViewType = "month" | "week" | "day";

const GoogleCalendarView: React.FC<GoogleCalendarViewProps> = memo(
  ({
    bookings,
    onBookingClick,
    onStatusUpdate,
    onInviteParticipant,
    isLoading = false,
  }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewType, setViewType] = useState<CalendarViewType>("month");
    const [selectedBooking, setSelectedBooking] =
      useState<BookingDetails | null>(null);
    const [showBookingDetails, setShowBookingDetails] = useState(false);
    const [participantEmail, setParticipantEmail] = useState("");
    const [participants, setParticipants] = useState<string[]>([]);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    // Color palette for different candidates
    const candidateColors = [
      { bg: "#e3f2fd", border: "#2196f3", text: "#1565c0" }, // Blue
      { bg: "#e8f5e8", border: "#4caf50", text: "#2e7d32" }, // Green
      { bg: "#fff3e0", border: "#ff9800", text: "#ef6c00" }, // Orange
      { bg: "#f3e5f5", border: "#9c27b0", text: "#7b1fa2" }, // Purple
      { bg: "#ffebee", border: "#f44336", text: "#c62828" }, // Red
      { bg: "#e0f2f1", border: "#009688", text: "#00695c" }, // Teal
      { bg: "#fff8e1", border: "#ffc107", text: "#f57f17" }, // Amber
      { bg: "#e8eaf6", border: "#3f51b5", text: "#303f9f" }, // Indigo
      { bg: "#fce4ec", border: "#e91e63", text: "#ad1457" }, // Pink
      { bg: "#e1f5fe", border: "#03a9f4", text: "#0277bd" }, // Light Blue
      { bg: "#f1f8e9", border: "#8bc34a", text: "#558b2f" }, // Light Green
      { bg: "#fff3e0", border: "#ff5722", text: "#d84315" }, // Deep Orange
    ];

    // Generate consistent color for each candidate based on their name/email
    const getCandidateColor = (
      candidateName: string,
      candidateEmail: string
    ) => {
      const identifier = candidateName + candidateEmail;
      let hash = 0;
      for (let i = 0; i < identifier.length; i++) {
        const char = identifier.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      const colorIndex = Math.abs(hash) % candidateColors.length;
      return candidateColors[colorIndex];
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "scheduled":
        case "confirmed":
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

    const getCandidateBackgroundColor = (
      candidateName: string,
      candidateEmail: string
    ) => {
      return getCandidateColor(candidateName, candidateEmail).bg;
    };

    const getCandidateBorderColor = (
      candidateName: string,
      candidateEmail: string
    ) => {
      return getCandidateColor(candidateName, candidateEmail).border;
    };

    const getCandidateTextColor = (
      candidateName: string,
      candidateEmail: string
    ) => {
      return getCandidateColor(candidateName, candidateEmail).text;
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "scheduled":
        case "confirmed":
          return <Clock size={14} />;
        case "completed":
          return <CheckCircle size={14} />;
        case "cancelled":
          return <XCircle size={14} />;
        case "no_show":
          return <AlertCircle size={14} />;
        default:
          return <Clock size={14} />;
      }
    };

    // Navigation functions
    const navigateDate = (direction: "prev" | "next") => {
      const newDate = new Date(currentDate);

      switch (viewType) {
        case "month":
          newDate.setMonth(
            currentDate.getMonth() + (direction === "next" ? 1 : -1)
          );
          break;
        case "week":
          newDate.setDate(
            currentDate.getDate() + (direction === "next" ? 7 : -7)
          );
          break;
        case "day":
          newDate.setDate(
            currentDate.getDate() + (direction === "next" ? 1 : -1)
          );
          break;
      }

      setCurrentDate(newDate);
    };

    const goToToday = () => {
      setCurrentDate(new Date());
    };

    // Get bookings for a specific date - memoized for performance
    const getBookingsForDate = useCallback(
      (date: Date) => {
        const dateString = date.toISOString().split("T")[0];
        return bookings.filter((booking) => {
          const bookingDate = new Date(booking.slotDate)
            .toISOString()
            .split("T")[0];
          return bookingDate === dateString;
        });
      },
      [bookings]
    );

    // Generate calendar days for month view - memoized for performance
    const generateMonthDays = useMemo(() => {
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
    }, [currentDate]);

    // Generate week days - memoized for performance
    const generateWeekDays = useMemo(() => {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day;
      startOfWeek.setDate(diff);

      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        days.push(date);
      }

      return days;
    }, [currentDate]);

    // Get current view title
    const getViewTitle = () => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      switch (viewType) {
        case "month":
          return `${
            monthNames[currentDate.getMonth()]
          } ${currentDate.getFullYear()}`;
        case "week":
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return `${
            monthNames[weekStart.getMonth()]
          } ${weekStart.getDate()} - ${
            monthNames[weekEnd.getMonth()]
          } ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        case "day":
          return `${
            monthNames[currentDate.getMonth()]
          } ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
        default:
          return "";
      }
    };

    const resetParticipantState = useCallback(() => {
      setParticipantEmail("");
      setParticipants([]);
      setInviteError(null);
      setInviteSuccess(null);
      setIsInviting(false);
    }, []);

    const handleBookingClick = useCallback(
      (booking: BookingDetails) => {
        console.log("Booking clicked:", booking);
        console.log("Booking participants:", booking.participants);
        setSelectedBooking(booking);
        setShowBookingDetails(true);
        // Initialize participants from booking data instead of resetting
        const participantList = booking.participants || [];
        console.log("Setting participants to:", participantList);
        setParticipants(participantList);
        setParticipantEmail("");
        setInviteError(null);
        setInviteSuccess(null);
        setIsInviting(false);
        onBookingClick(booking);
      },
      [onBookingClick]
    );

    const handleStatusUpdateClick = useCallback(
      (booking: BookingDetails) => {
        setShowBookingDetails(false);
        if (onStatusUpdate) {
          onStatusUpdate(booking);
        }
      },
      [onStatusUpdate]
    );

    const handleAddParticipant = useCallback(async () => {
      if (!participantEmail || !selectedBooking || !onInviteParticipant) return;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(participantEmail)) {
        setInviteError("Please enter a valid email address");
        return;
      }

      // Check if email already exists
      if (participants.includes(participantEmail)) {
        setInviteError("This participant has already been added");
        return;
      }

      setIsInviting(true);
      setInviteError(null);
      setInviteSuccess(null);

      try {
        await onInviteParticipant(selectedBooking.id || selectedBooking._id, participantEmail);
        setParticipants((prev) => [...prev, participantEmail]);
        setParticipantEmail("");
        setInviteSuccess(`Invitation sent to ${participantEmail}`);
      } catch (error) {
        setInviteError("Failed to send invitation. Please try again.");
      } finally {
        setIsInviting(false);
      }
    }, [participantEmail, selectedBooking, onInviteParticipant, participants]);

    const handleRemoveParticipant = useCallback((email: string) => {
      setParticipants((prev) => prev.filter((p) => p !== email));
    }, []);

    const renderMonthView = () => {
      const days = generateMonthDays;
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

      return (
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            {/* Day Headers */}
            <Box
              display="grid"
              gridTemplateColumns="repeat(7, 1fr)"
              sx={{ backgroundColor: "grey.50" }}
            >
              {dayNames.map((day) => (
                <Box
                  key={day}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  py={2}
                  sx={{ borderRight: 1, borderColor: "divider" }}
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
              {days.map((date: Date, index: number) => {
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const dayBookings = getBookingsForDate(date);

                return (
                  <Box
                    key={index}
                    sx={{
                      minHeight: 120,
                      p: 1,
                      borderRight: (index + 1) % 7 !== 0 ? 1 : 0,
                      borderBottom: index < 35 ? 1 : 0,
                      borderColor: "divider",
                      backgroundColor: isToday ? "primary.50" : "transparent",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: !isCurrentMonth
                          ? "text.disabled"
                          : isToday
                          ? "primary.main"
                          : "text.primary",
                        fontWeight: isToday ? 600 : 400,
                        mb: 1,
                      }}
                    >
                      {date.getDate()}
                    </Typography>

                    {/* Bookings for this date */}
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {dayBookings.map((booking) => (
                        <Box
                          key={booking._id}
                          onClick={() => handleBookingClick(booking)}
                          sx={{
                            backgroundColor: getCandidateBackgroundColor(
                              booking.candidateName,
                              booking.candidateEmail
                            ),
                            borderLeft: `3px solid ${getCandidateBorderColor(
                              booking.candidateName,
                              booking.candidateEmail
                            )}`,
                            borderRadius: "4px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: getCandidateTextColor(
                              booking.candidateName,
                              booking.candidateEmail
                            ),
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-1px)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              backgroundColor: getCandidateBorderColor(
                                booking.candidateName,
                                booking.candidateEmail
                              ),
                              color: "white",
                            },
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            minHeight: "24px",
                          }}
                        >
                          {getStatusIcon(booking.status)}
                          <Box
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              flex: 1,
                            }}
                          >
                            {`${formatTime(booking.slotStartTime)} - ${
                              booking.candidateName
                            }`}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      );
    };

    const renderWeekView = () => {
      const days = generateWeekDays;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const hours = Array.from({ length: 24 }, (_, i) => i);

      return (
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            {/* Day Headers */}
            <Box
              display="grid"
              gridTemplateColumns="80px repeat(7, 1fr)"
              sx={{
                backgroundColor: "grey.50",
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Box /> {/* Empty cell for time column */}
              {days.map((date: Date, index: number) => {
                const isToday =
                  date.toDateString() === new Date().toDateString();
                return (
                  <Box
                    key={index}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    py={2}
                    sx={{
                      borderRight: index < 6 ? 1 : 0,
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {dayNames[index]}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: isToday ? "primary.main" : "text.primary",
                        fontWeight: isToday ? 600 : 400,
                      }}
                    >
                      {date.getDate()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Time slots */}
            <Box sx={{ maxHeight: 600, overflow: "auto" }}>
              {hours.map((hour) => (
                <Box
                  key={hour}
                  display="grid"
                  gridTemplateColumns="80px repeat(7, 1fr)"
                  sx={{
                    minHeight: 60,
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  {/* Time label */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      borderRight: 1,
                      borderColor: "divider",
                      backgroundColor: "grey.50",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {hour === 0
                        ? "12 AM"
                        : hour < 12
                        ? `${hour} AM`
                        : hour === 12
                        ? "12 PM"
                        : `${hour - 12} PM`}
                    </Typography>
                  </Box>

                  {/* Day columns */}
                  {days.map((date: Date, dayIndex: number) => {
                    const dayBookings = getBookingsForDate(date).filter(
                      (booking) => {
                        const startHour = parseInt(
                          booking.slotStartTime.split(":")[0]
                        );
                        return startHour === hour;
                      }
                    );

                    return (
                      <Box
                        key={dayIndex}
                        sx={{
                          borderRight: dayIndex < 6 ? 1 : 0,
                          borderColor: "divider",
                          p: 0.5,
                          position: "relative",
                        }}
                      >
                        {dayBookings.map((booking) => (
                          <Box
                            key={booking._id}
                            onClick={() => handleBookingClick(booking)}
                            sx={{
                              backgroundColor: getCandidateBackgroundColor(
                                booking.candidateName,
                                booking.candidateEmail
                              ),
                              borderLeft: `3px solid ${getCandidateBorderColor(
                                booking.candidateName,
                                booking.candidateEmail
                              )}`,
                              borderRadius: "4px",
                              padding: "4px 6px",
                              cursor: "pointer",
                              fontSize: "10px",
                              fontWeight: 500,
                              color: getCandidateTextColor(
                                booking.candidateName,
                                booking.candidateEmail
                              ),
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "translateY(-1px)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                backgroundColor: getCandidateBorderColor(
                                  booking.candidateName,
                                  booking.candidateEmail
                                ),
                                color: "white",
                              },
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mb: 0.5,
                              width: "100%",
                              minHeight: "20px",
                            }}
                          >
                            {getStatusIcon(booking.status)}
                            <Box
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flex: 1,
                              }}
                            >
                              {`${formatTime(booking.slotStartTime)} - ${
                                booking.candidateName
                              }`}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      );
    };

    const renderDayView = () => {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const dayBookings = getBookingsForDate(currentDate);

      return (
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            {/* Day Header */}
            <Box
              sx={{
                backgroundColor: "grey.50",
                borderBottom: 1,
                borderColor: "divider",
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h6">
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>

            {/* Time slots */}
            <Box sx={{ maxHeight: 600, overflow: "auto" }}>
              {hours.map((hour) => {
                const hourBookings = dayBookings.filter((booking) => {
                  const startHour = parseInt(
                    booking.slotStartTime.split(":")[0]
                  );
                  return startHour === hour;
                });

                return (
                  <Box
                    key={hour}
                    display="flex"
                    sx={{
                      minHeight: 60,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    {/* Time label */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        width: 80,
                        borderRight: 1,
                        borderColor: "divider",
                        backgroundColor: "grey.50",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {hour === 0
                          ? "12 AM"
                          : hour < 12
                          ? `${hour} AM`
                          : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                      </Typography>
                    </Box>

                    {/* Bookings */}
                    <Box flex={1} p={0.5}>
                      {hourBookings.map((booking) => (
                        <Box
                          key={booking._id}
                          onClick={() => handleBookingClick(booking)}
                          sx={{
                            backgroundColor: getCandidateBackgroundColor(
                              booking.candidateName,
                              booking.candidateEmail
                            ),
                            borderLeft: `4px solid ${getCandidateBorderColor(
                              booking.candidateName,
                              booking.candidateEmail
                            )}`,
                            borderRadius: "6px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: getCandidateTextColor(
                              booking.candidateName,
                              booking.candidateEmail
                            ),
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              backgroundColor: getCandidateBorderColor(
                                booking.candidateName,
                                booking.candidateEmail
                              ),
                              color: "white",
                            },
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                            width: "100%",
                            minHeight: "40px",
                          }}
                        >
                          {getStatusIcon(booking.status)}
                          <Box flex={1}>
                            <Box sx={{ fontWeight: 600, mb: 0.5 }}>
                              {`${formatTime(
                                booking.slotStartTime
                              )} - ${formatTime(booking.slotEndTime)}`}
                            </Box>
                            <Box sx={{ fontSize: "11px", opacity: 0.9 }}>
                              {`${booking.candidateName} - ${booking.job.title}`}
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      );
    };

    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography>Loading calendar...</Typography>
        </Box>
      );
    }

    return (
      <Box>
        {/* Calendar Controls */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" size="small" onClick={goToToday}>
              Today
            </Button>
            <IconButton onClick={() => navigateDate("prev")}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" minWidth={300} textAlign="center">
              {getViewTitle()}
            </Typography>
            <IconButton onClick={() => navigateDate("next")}>
              <ChevronRight />
            </IconButton>
          </Box>

          {/* View Toggle */}
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(_, newView) => newView && setViewType(newView)}
            size="small"
          >
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="day">Day</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Calendar Content */}
        {viewType === "month" && renderMonthView()}
        {viewType === "week" && renderWeekView()}
        {viewType === "day" && renderDayView()}

        {/* Legend */}
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Status Legend:
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label="Scheduled"
              color="primary"
              size="small"
              icon={<Clock size={14} />}
            />
            <Chip
              label="Completed"
              color="success"
              size="small"
              icon={<CheckCircle size={14} />}
            />
            <Chip
              label="Cancelled"
              color="error"
              size="small"
              icon={<XCircle size={14} />}
            />
            <Chip
              label="No Show"
              color="warning"
              size="small"
              icon={<AlertCircle size={14} />}
            />
          </Box>
        </Box>

        {/* Booking Details Modal - Google Calendar Style */}
        <Dialog
          open={showBookingDetails}
          onClose={() => setShowBookingDetails(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            },
          }}
        >
          {selectedBooking && (
            <>
              {/* Google Calendar Style Header */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${getCandidateBorderColor(
                    selectedBooking.candidateName,
                    selectedBooking.candidateEmail
                  )} 0%, ${getCandidateBackgroundColor(
                    selectedBooking.candidateName,
                    selectedBooking.candidateEmail
                  )} 100%)`,
                  color: "white",
                  p: 3,
                  position: "relative",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box flex={1}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {selectedBooking.job.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Calendar size={18} />
                        <Typography variant="body1">
                          {new Date(
                            selectedBooking.slotDate
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Clock size={18} />
                        <Typography variant="body1" fontWeight={500}>
                          {formatTime(selectedBooking.slotStartTime)} -{" "}
                          {formatTime(selectedBooking.slotEndTime)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MapPin size={16} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {selectedBooking.job.location}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => setShowBookingDetails(false)}
                    sx={{
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    <X size={24} />
                  </IconButton>
                </Box>

                {/* Status Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 60,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusIcon(selectedBooking.status)}
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      textTransform="uppercase"
                    >
                      {selectedBooking.status.replace("_", " ")}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                  {/* Main Content Grid */}
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
                    gap={3}
                  >
                    {/* Left Column - Interview Details */}
                    <Box>
                      {/* Candidate Section */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <User size={20} />
                          Candidate
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: "grey.50",
                            borderRadius: 2,
                            p: 2,
                            border: "1px solid",
                            borderColor: "grey.200",
                          }}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={2}
                          >
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: getCandidateBorderColor(
                                  selectedBooking.candidateName,
                                  selectedBooking.candidateEmail
                                ),
                                fontSize: "1.2rem",
                                fontWeight: 600,
                              }}
                            >
                              {selectedBooking.candidate?.firstName?.charAt(
                                0
                              ) || selectedBooking.candidateName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {selectedBooking.candidateName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Interview Candidate
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" flexDirection="column" gap={1.5}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Mail size={16} color="#666" />
                              <Typography variant="body2">
                                {selectedBooking.candidateEmail}
                              </Typography>
                            </Box>
                            {selectedBooking.candidatePhone && (
                              <Box display="flex" alignItems="center" gap={2}>
                                <Phone size={16} color="#666" />
                                <Typography variant="body2">
                                  {selectedBooking.candidatePhone}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Meeting Link */}
                      {selectedBooking.meetingLink && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Video size={20} />
                            Meeting Details
                          </Typography>
                          <Box
                            sx={{
                              backgroundColor: "primary.50",
                              borderRadius: 2,
                              p: 2,
                              border: "1px solid",
                              borderColor: "primary.200",
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Join the interview via video call
                            </Typography>
                            <Button
                              variant="contained"
                              size="large"
                              href={selectedBooking.meetingLink}
                              target="_blank"
                              startIcon={<Video size={18} />}
                              sx={{ mt: 1 }}
                            >
                              Join Meeting
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Right Column - Actions */}
                    <Box>
                      {/* Quick Actions */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Actions
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                          <Button
                            variant="outlined"
                            size="large"
                            onClick={() =>
                              handleStatusUpdateClick(selectedBooking)
                            }
                            startIcon={<Settings size={18} />}
                            fullWidth
                          >
                            Update Status
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
            </>
          )}

          {/* Add Participants Section - Moved to bottom */}
          {selectedBooking && (
            <Box sx={{ borderTop: "1px solid", borderColor: "divider", p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <UserPlus size={20} />
                Invite Participants
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add additional participants to this interview
              </Typography>

              {/* Add Participant Form */}
              <Box display="flex" gap={2} mt={2} mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="Enter participant's email address"
                  disabled={isInviting}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddParticipant();
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddParticipant}
                  disabled={!participantEmail || isInviting}
                  startIcon={
                    isInviting ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Send size={16} />
                    )
                  }
                  sx={{
                    minWidth: 120,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {isInviting ? "Sending..." : "Invite"}
                </Button>
              </Box>

              {inviteError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    "& .MuiAlert-message": { fontSize: "0.875rem" },
                  }}
                >
                  {inviteError}
                </Alert>
              )}
              {inviteSuccess && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    "& .MuiAlert-message": { fontSize: "0.875rem" },
                  }}
                >
                  {inviteSuccess}
                </Alert>
              )}

              {(participants.length > 0 || (selectedBooking && selectedBooking.participants && selectedBooking.participants.length > 0)) && (
                <Box
                  sx={{
                    backgroundColor: "grey.50",
                    borderRadius: 2,
                    p: 2,
                    mt: 2,
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Invited Participants ({(participants.length > 0 ? participants : selectedBooking?.participants || []).length})
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {(participants.length > 0 ? participants : selectedBooking?.participants || []).map((email, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          backgroundColor: "white",
                          borderRadius: 1,
                          p: 1.5,
                          border: "1px solid",
                          borderColor: "grey.100",
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Mail size={16} color="#666" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {email}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              Invitation sent
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveParticipant(email)}
                          sx={{
                            color: "error.main",
                            "&:hover": { backgroundColor: "error.50" },
                          }}
                        >
                          <X size={16} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Dialog>
      </Box>
    );
  }
);

export default GoogleCalendarView;
