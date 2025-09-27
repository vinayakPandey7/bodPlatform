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

interface InterviewSlotSelectorProps {
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

const InterviewSlotSelector: React.FC<InterviewSlotSelectorProps> = ({
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

    return availableSlots?.data?.some(
      (day: any) => day.date === dateString && day.slots.length > 0
    );
  };

  // Get slots for selected date
  const getSlotsForDate = (date: Date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const dayData = availableSlots?.data?.find(
      (day: any) => day.date === dateString
    );
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
    setShowDetailsModal(true);
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
          <Box sx={{ height: "100%", p: 3 }}>
            {/* Header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="between"
              mb={3}
            >
              <Box display="flex" alignItems="center">
                <IconButton onClick={onClose} sx={{ mr: 2 }}>
                  <ArrowLeft size={20} />
                </IconButton>
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={employerAvatar}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    {employerName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {employerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sessionDuration} min session
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
              Select a Date & Time
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
              {/* Calendar */}
              <Box sx={{ gridColumn: 'span 8' }}>
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

                  {/* Calendar Grid */}
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
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
                          py={1.5}
                          sx={{ borderRight: 1, borderColor: "divider" }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            textTransform="uppercase"
                          >
                            {day}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Calendar Days Grid */}
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(7, 1fr)"
                      sx={{ backgroundColor: "white" }}
                    >
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
                          <Box
                            key={index}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height={48}
                            position="relative"
                            sx={{
                              cursor:
                                hasSlots && !isPast ? "pointer" : "default",
                              borderRight: (index + 1) % 7 !== 0 ? 1 : 0,
                              borderBottom: index < 35 ? 1 : 0,
                              borderColor: "divider",
                              backgroundColor: isSelected
                                ? "primary.main"
                                : isToday
                                ? "primary.50"
                                : "transparent",
                              "&:hover":
                                hasSlots && !isPast
                                  ? {
                                      backgroundColor: isSelected
                                        ? "primary.dark"
                                        : "grey.100",
                                    }
                                  : {},
                              transition: "all 0.2s ease",
                            }}
                            onClick={() =>
                              !isPast && hasSlots && handleDateSelect(date)
                            }
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: isSelected
                                  ? "white"
                                  : isToday
                                  ? "primary.main"
                                  : !isCurrentMonth || isPast
                                  ? "text.disabled"
                                  : hasSlots
                                  ? "text.primary"
                                  : "text.secondary",
                                fontWeight:
                                  isSelected || isToday || hasSlots ? 600 : 400,
                                fontSize: "14px",
                              }}
                            >
                              {date.getDate()}
                            </Typography>

                            {/* Available slots indicator */}
                            {hasSlots && !isSelected && (
                              <Box
                                position="absolute"
                                bottom={4}
                                left="50%"
                                sx={{
                                  transform: "translateX(-50%)",
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  backgroundColor: "primary.main",
                                }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Timezone */}
                  <Box mt={3} display="flex" alignItems="center" gap={1}>
                    <Globe size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Eastern Time - US & Canada (4:58pm)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Time Slots */}
              <Box sx={{ gridColumn: 'span 4' }}>
                <div className="h-[400px] overflow-y-auto">
                  {selectedDate && (
                    <Box>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                          {selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </Box>
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
                                borderColor: "divider",
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
                                color="text.primary"
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
                    </Box>
                  )}
                </div>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton
              onClick={() => setShowDetailsModal(false)}
              sx={{ mr: 2 }}
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Typography variant="h5" fontWeight={600}>
              Enter Your Details
            </Typography>
          </Box>

          {selectedSlot && selectedDate && (
            <Box mb={3} p={2} bgcolor="grey.50" borderRadius={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                Selected Time Slot
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong>{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {formatTime(selectedSlot.startTime)} -{" "}
                {formatTime(selectedSlot.endTime)}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {sessionDuration} minutes
              </Typography>
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Full Name"
              value={candidateInfo.name}
              onChange={(e) =>
                setCandidateInfo({ ...candidateInfo, name: e.target.value })
              }
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <User size={16} style={{ marginRight: 8, color: "#666" }} />
                ),
              }}
            />

            <TextField
              label="Email Address"
              type="email"
              value={candidateInfo.email}
              onChange={(e) =>
                setCandidateInfo({ ...candidateInfo, email: e.target.value })
              }
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <Mail size={16} style={{ marginRight: 8, color: "#666" }} />
                ),
              }}
            />

            <TextField
              label="Phone Number"
              value={candidateInfo.phone}
              onChange={(e) =>
                setCandidateInfo({ ...candidateInfo, phone: e.target.value })
              }
              fullWidth
              InputProps={{
                startAdornment: (
                  <Phone size={16} style={{ marginRight: 8, color: "#666" }} />
                ),
              }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSchedule}
              disabled={
                isPending || !candidateInfo.name || !candidateInfo.email
              }
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                mt: 2,
              }}
            >
              {isPending ? "Scheduling..." : "Confirm Interview"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <InterviewSuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setShowDetailsModal(false);
        }}
        booking={bookingData}
      />
    </Fragment>
  );
};

export default InterviewSlotSelector;
