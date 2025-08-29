"use client";
import React, { useState, Fragment } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Avatar,
  IconButton,
  Chip,
  Paper,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  Globe,
  User,
  Mail,
  Phone,
  Settings,
} from "lucide-react";
import {
  useAvailableSlots,
  useScheduleInterview,
} from "@/lib/hooks/interview.hooks";
import InterviewSuccessModal from "./InterviewSuccessModal";

interface ModernCalendarSchedulerProps {
  open: boolean;
  onClose: () => void;
  employerId?: string;
  jobId?: string;
  invitationToken?: string;
  employerName?: string;
  employerAvatar?: string;
  sessionDuration?: number;
}

interface SlotSelection {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
}

const ModernCalendarScheduler: React.FC<ModernCalendarSchedulerProps> = ({
  open,
  onClose,
  employerId,
  jobId,
  invitationToken,
  employerName = "Jane Smith",
  employerAvatar,
  sessionDuration = 30,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  // Calendar navigation
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedSlot(null);
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

  // Check if date has available slots
  const hasAvailableSlots = (date: Date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Handle both direct array and nested data structure
    const slotsData = Array.isArray(availableSlots?.data)
      ? availableSlots.data
      : availableSlots;

    if (!slotsData || !Array.isArray(slotsData)) {
      return false;
    }

    return slotsData.some((day: any) => {
      return day.date === dateString && day.slots && day.slots.length > 0;
    });
  };

  // Get slots for selected date
  const getSlotsForDate = (date: Date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Handle both direct array and nested data structure
    const slotsData = Array.isArray(availableSlots?.data)
      ? availableSlots.data
      : availableSlots;

    if (!slotsData || !Array.isArray(slotsData)) {
      return [];
    }

    const dayData = slotsData.find((day: any) => day.date === dateString);
    return dayData?.slots || [];
  };

  const handleDateSelect = (date: Date) => {
    if (hasAvailableSlots(date)) {
      setSelectedDate(date);
      setSelectedSlot(null);
    }
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot({
      slotId: slot.id,
      date: selectedDate?.toISOString() || "",
      startTime: slot.startTime,
      endTime: slot.endTime,
      availableSpots: slot.availableSpots,
    });
  };

  const handleSchedule = () => {
    if (
      !selectedSlot ||
      !candidateInfo.name ||
      !candidateInfo.email ||
      !jobId
    ) {
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
          const booking = {
            candidateName: candidateInfo.name,
            candidateEmail: candidateInfo.email,
            slotDate: selectedSlot.date,
            slotStartTime: selectedSlot.startTime,
            slotEndTime: selectedSlot.endTime,
            job: data.job || {
              title: "Interview",
              description: "",
              location: "TBD",
            },
            employer: data.employer || {
              companyName: "Company",
              email: "company@example.com",
            },
          };

          setBookingData(booking);
          setShowSuccessModal(true);
          onClose();
          setSelectedSlot(null);
          setCandidateInfo({ name: "", email: "", phone: "" });
        },
        onError: (error) => {
          // alert("Failed to schedule interview. Please try again.");
        },
      }
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

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

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const calendarDays = generateCalendarDays();
  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : [];

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
            overflow: "hidden",
          },
        }}
      >
        <DialogContent sx={{ p: 0, height: "80vh" }}>
          <Grid container sx={{ height: "100%" }}>
            {/* Left Panel - Profile & Info */}
            <Grid
              item
              xs={12}
              md={4}
              sx={{ borderRight: 1, borderColor: "divider", p: 3 }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <IconButton onClick={onClose} sx={{ mr: 1 }}>
                  <ArrowLeft size={20} />
                </IconButton>
              </Box>

              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  src={employerAvatar}
                  sx={{ width: 64, height: 64, mr: 2 }}
                >
                  {employerName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {employerName}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h5" fontWeight={700} mb={1}>
                {sessionDuration} min with {employerName.split(" ")[0]}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Clock size={16} />
                <Typography variant="body2" color="text.secondary">
                  {sessionDuration} min
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={4}>
                <Globe size={16} />
                <Typography variant="body2" color="text.secondary">
                  Web conferencing details provided upon confirmation.
                </Typography>
              </Box>

              {/* Candidate Information Form */}
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Full Name"
                  value={candidateInfo.name}
                  onChange={(e) =>
                    setCandidateInfo({ ...candidateInfo, name: e.target.value })
                  }
                  required
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <User
                        size={16}
                        style={{ marginRight: 8, color: "#666" }}
                      />
                    ),
                  }}
                />

                <TextField
                  label="Email Address"
                  type="email"
                  value={candidateInfo.email}
                  onChange={(e) =>
                    setCandidateInfo({
                      ...candidateInfo,
                      email: e.target.value,
                    })
                  }
                  required
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <Mail
                        size={16}
                        style={{ marginRight: 8, color: "#666" }}
                      />
                    ),
                  }}
                />

                <TextField
                  label="Phone Number"
                  value={candidateInfo.phone}
                  onChange={(e) =>
                    setCandidateInfo({
                      ...candidateInfo,
                      phone: e.target.value,
                    })
                  }
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <Phone
                        size={16}
                        style={{ marginRight: 8, color: "#666" }}
                      />
                    ),
                  }}
                />
              </Box>

              <Box
                mt={4}
                display="flex"
                alignItems="center"
                gap={1}
                color="text.secondary"
              >
                <Settings size={16} />
                <Typography variant="body2">Troubleshoot</Typography>
              </Box>
            </Grid>

            {/* Right Panel - Calendar */}
            <Grid item xs={12} md={8} sx={{ p: 3 }}>
              <Typography
                variant="h5"
                fontWeight={600}
                mb={3}
                textAlign="center"
              >
                Select a Date & Time
              </Typography>

              <Grid container spacing={4}>
                {/* Calendar */}
                <Grid item xs={12} md={7}>
                  <Box>
                    {/* Calendar Header */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="between"
                      mb={2}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        {monthNames[currentDate.getMonth()]}{" "}
                        {currentDate.getFullYear()}
                      </Typography>
                      <Box>
                        <IconButton
                          onClick={() => navigateMonth("prev")}
                          size="small"
                        >
                          <ChevronLeft size={20} />
                        </IconButton>
                        <IconButton
                          onClick={() => navigateMonth("next")}
                          size="small"
                        >
                          <ChevronRight size={20} />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Day Headers */}
                    <Grid container>
                      {dayNames.map((day) => (
                        <Grid item xs key={day}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            textAlign="center"
                            display="block"
                            py={1}
                            fontWeight={500}
                          >
                            {day}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Calendar Days */}
                    <Grid container>
                      {calendarDays.map((date, index) => {
                        const isCurrentMonth =
                          date.getMonth() === currentDate.getMonth();
                        const isToday =
                          date.toDateString() === new Date().toDateString();
                        const isSelected =
                          selectedDate?.toDateString() === date.toDateString();
                        const hasSlots = hasAvailableSlots(date);
                        const isPast =
                          date < new Date(new Date().setHours(0, 0, 0, 0));

                        return (
                          <Grid item xs key={index}>
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              height={40}
                              sx={{
                                cursor:
                                  hasSlots && !isPast ? "pointer" : "default",
                                borderRadius: 1,
                                mx: 0.5,
                                my: 0.25,
                                backgroundColor: isSelected
                                  ? "primary.main"
                                  : isToday
                                  ? "primary.light"
                                  : "transparent",
                                color: isSelected
                                  ? "white"
                                  : isToday
                                  ? "primary.main"
                                  : !isCurrentMonth || isPast
                                  ? "text.disabled"
                                  : hasSlots
                                  ? "primary.main"
                                  : "text.primary",
                                fontWeight: hasSlots ? 600 : 400,
                                "&:hover":
                                  hasSlots && !isPast
                                    ? {
                                        backgroundColor: isSelected
                                          ? "primary.dark"
                                          : "primary.light",
                                        color: isSelected
                                          ? "white"
                                          : "primary.main",
                                      }
                                    : {},
                              }}
                              onClick={() => !isPast && handleDateSelect(date)}
                            >
                              <Typography variant="body2" fontWeight="inherit">
                                {date.getDate()}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>

                    {/* Timezone */}
                    <Box mt={3} display="flex" alignItems="center" gap={1}>
                      <Globe size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Eastern Time - US & Canada (4:58pm)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Time Slots */}
                <Grid item xs={12} md={5}>
                  {selectedDate && (
                    <Box>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>

                      <Box display="flex" flexDirection="column" gap={1}>
                        {selectedDateSlots.length > 0 ? (
                          selectedDateSlots.map((slot: any) => (
                            <Paper
                              key={slot.id}
                              elevation={0}
                              sx={{
                                p: 2,
                                border: 1,
                                borderColor:
                                  selectedSlot?.slotId === slot.id
                                    ? "primary.main"
                                    : "divider",
                                backgroundColor:
                                  selectedSlot?.slotId === slot.id
                                    ? "primary.light"
                                    : "transparent",
                                cursor: "pointer",
                                borderRadius: 2,
                                "&:hover": {
                                  borderColor: "primary.main",
                                  backgroundColor: "primary.light",
                                },
                              }}
                              onClick={() => handleSlotSelect(slot)}
                            >
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color={
                                  selectedSlot?.slotId === slot.id
                                    ? "primary.main"
                                    : "text.primary"
                                }
                              >
                                {formatTime(slot.startTime)}
                              </Typography>
                            </Paper>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No available slots for this date.
                          </Typography>
                        )}
                      </Box>

                      {selectedSlot && (
                        <Box mt={3}>
                          <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleSchedule}
                            disabled={
                              isPending ||
                              !candidateInfo.name ||
                              !candidateInfo.email
                            }
                            sx={{
                              borderRadius: 2,
                              py: 1.5,
                              fontWeight: 600,
                            }}
                          >
                            {isPending ? "Scheduling..." : "Confirm"}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
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

export default ModernCalendarScheduler;
