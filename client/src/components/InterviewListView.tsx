"use client";
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  Button,
  TextField,
  Avatar,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Send,
  X,
  Video,
  MapPin,
  Search,
} from "lucide-react";

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

interface InterviewListViewProps {
  bookings: BookingDetails[];
  onBookingClick: (booking: BookingDetails) => void;
  onInviteParticipant?: (bookingId: string, email: string) => Promise<any>;
  isLoading?: boolean;
}

const InterviewListView: React.FC<InterviewListViewProps> = ({
  bookings,
  onBookingClick,
  onInviteParticipant,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedBooking, setSelectedBooking] = React.useState<BookingDetails | null>(null);
  const [showBookingDetails, setShowBookingDetails] = React.useState(false);
  const [participantEmail, setParticipantEmail] = React.useState("");
  const [participants, setParticipants] = React.useState<string[]>([]);
  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

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

  const handleBookingClick = (booking: BookingDetails) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
    resetParticipantState();
  };

  const resetParticipantState = () => {
    setParticipantEmail("");
    setParticipants([]);
    setInviteError(null);
    setInviteSuccess(null);
    setIsInviting(false);
  };

  const handleAddParticipant = async () => {
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
      await onInviteParticipant(selectedBooking._id, participantEmail);
      setParticipants(prev => [...prev, participantEmail]);
      setParticipantEmail("");
      setInviteSuccess(`Invitation sent to ${participantEmail}`);
    } catch (error) {
      setInviteError("Failed to send invitation. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveParticipant = (email: string) => {
    setParticipants(prev => prev.filter(p => p !== email));
  };

  const renderBookingCard = (booking: BookingDetails) => (
    <Card key={booking._id} variant="outlined" sx={{ mb: 2 }}>
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
              color={getStatusColor(booking.status) as any}
              size="small"
            />
            <Box display="flex" flexDirection="column" gap={1}>
              <IconButton
                size="small"
                onClick={() => handleBookingClick(booking)}
                sx={{ 
                  backgroundColor: 'primary.50',
                  '&:hover': { backgroundColor: 'primary.100' }
                }}
              >
                <UserPlus className="h-4 w-4" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onBookingClick(booking)}
                sx={{ 
                  backgroundColor: 'grey.50',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
              >
                <Settings className="h-4 w-4" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const filteredBookings = React.useMemo(() => {
    let filtered = bookings;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((b) =>
        b.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 1: // Upcoming
        return filtered.filter((b) => b.status === "scheduled");
      case 2: // Completed
        return filtered.filter((b) => b.status === "completed");
      case 3: // Cancelled
        return filtered.filter((b) => ["cancelled", "no_show"].includes(b.status));
      default: // All
        return filtered;
    }
  }, [bookings, activeTab, statusFilter, searchTerm]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>Loading interview schedule...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={600}>
              Interview Schedule
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search className="h-4 w-4 text-gray-400 mr-2" />,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as string)}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no_show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label={`All (${bookings.length})`} />
            <Tab label={`Upcoming (${bookings.filter(b => b.status === 'scheduled').length})`} />
            <Tab label={`Completed (${bookings.filter(b => b.status === 'completed').length})`} />
            <Tab label={`Cancelled (${bookings.filter(b => ['cancelled', 'no_show'].includes(b.status)).length})`} />
          </Tabs>

          <Box>
            {filteredBookings.length === 0 ? (
              <Alert severity="info" sx={{ textAlign: 'center' }}>
                <Typography variant="body1">
                  No interviews found matching your criteria.
                </Typography>
              </Alert>
            ) : (
              <div>
                {filteredBookings.map(renderBookingCard)}
              </div>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Interview Details Modal with Participant Invitation */}
      <Dialog
        open={showBookingDetails}
        onClose={() => setShowBookingDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        {selectedBooking && (
          <>
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2196f3 0%, #e3f2fd 100%)',
                color: 'white',
                p: 3,
                position: 'relative',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {selectedBooking.job.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Calendar size={18} />
                      <Typography variant="body1">
                        {formatDate(selectedBooking.slotDate)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Clock size={18} />
                      <Typography variant="body1" fontWeight={500}>
                        {formatTime(selectedBooking.slotStartTime)} - {formatTime(selectedBooking.slotEndTime)}
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
                  sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <X size={24} />
                </IconButton>
              </Box>

              {/* Status Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 60,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {getStatusIcon(selectedBooking.status)}
                  <Typography variant="caption" fontWeight={600} textTransform="uppercase">
                    {selectedBooking.status.replace('_', ' ')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 3 }}>
                {/* Main Content Grid */}
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={3}>
                  {/* Left Column - Interview Details */}
                  <Box>
                    {/* Candidate Section */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <User size={20} />
                        Candidate
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: 'grey.50',
                          borderRadius: 2,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'grey.200',
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              backgroundColor: '#2196f3',
                              fontSize: '1.2rem',
                              fontWeight: 600,
                            }}
                          >
                            {selectedBooking.candidate?.firstName?.charAt(0) || selectedBooking.candidateName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {selectedBooking.candidateName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Interview Candidate
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={1.5}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Mail size={16} color="#666" />
                            <Typography variant="body2">{selectedBooking.candidateEmail}</Typography>
                          </Box>
                          {selectedBooking.candidatePhone && (
                            <Box display="flex" alignItems="center" gap={2}>
                              <Phone size={16} color="#666" />
                              <Typography variant="body2">{selectedBooking.candidatePhone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Meeting Link */}
                    {selectedBooking.meetingLink && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Video size={20} />
                          Meeting Details
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: 'primary.50',
                            borderRadius: 2,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'primary.200',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Join the interview via video call
                          </Typography>
                          <Button
                            variant="contained"
                            size="large"
                            component="a"
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
                          onClick={() => selectedBooking && onBookingClick(selectedBooking)}
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

            {/* Add Participants Section */}
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    if (e.key === 'Enter') {
                      handleAddParticipant();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddParticipant}
                  disabled={!participantEmail || isInviting}
                  startIcon={isInviting ? <CircularProgress size={16} /> : <Send size={16} />}
                  sx={{ 
                    minWidth: 120,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {isInviting ? 'Sending...' : 'Invite'}
                </Button>
              </Box>

              {inviteError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': { fontSize: '0.875rem' }
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
                    '& .MuiAlert-message': { fontSize: '0.875rem' }
                  }}
                >
                  {inviteSuccess}
                </Alert>
              )}

              {participants.length > 0 && (
                <Box
                  sx={{
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                    p: 2,
                    mt: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Invited Participants ({participants.length})
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {participants.map((email, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: 1,
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'grey.100',
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
                            color: 'error.main',
                            '&:hover': { backgroundColor: 'error.50' }
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
          </>
        )}
      </Dialog>
    </>
  );
};

export default InterviewListView;
