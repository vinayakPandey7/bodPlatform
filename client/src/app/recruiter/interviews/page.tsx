'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { Client as apiClient } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Interview {
  _id: string;
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  employer: {
    _id: string;
    companyName: string;
    ownerName: string;
  };
  job: {
    _id: string;
    title: string;
    location: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meetingDetails: {
    type: 'video' | 'phone' | 'in-person';
    location?: string;
    videoLink?: string;
    phoneNumber?: string;
  };
  notes?: string;
  feedback?: string;
  createdAt: string;
}

const RecruiterInterviewsContent = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const queryClient = useQueryClient();

  // Fetch interviews
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.INTERVIEWS.MY_INTERVIEWS(),
    queryFn: () => apiClient.get(API_ENDPOINTS.INTERVIEWS.MY_INTERVIEWS).then(res => res.data),
  });

  // Update interview status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(API_ENDPOINTS.INTERVIEWS.UPDATE_STATUS(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.MY_INTERVIEWS() });
      toast.success('Interview status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update interview status');
    },
  });

  // Reschedule interview mutation
  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date, time }: { id: string; date: string; time: string }) =>
      apiClient.put(API_ENDPOINTS.INTERVIEWS.RESCHEDULE(id), { 
        scheduledDate: date, 
        scheduledTime: time 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.MY_INTERVIEWS() });
      toast.success('Interview rescheduled successfully');
      setShowRescheduleModal(false);
      setSelectedInterview(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reschedule interview');
    },
  });

  // Cancel interview mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(API_ENDPOINTS.INTERVIEWS.CANCEL(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.MY_INTERVIEWS() });
      toast.success('Interview cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel interview');
    },
  });

  // Filter interviews based on tab and filters
  const getFilteredInterviews = () => {
    let filtered = interviews;

    // Filter by tab
    switch (currentTab) {
      case 0: // All
        break;
      case 1: // Upcoming
        filtered = filtered.filter((interview: Interview) => 
          interview.status === 'scheduled' && new Date(interview.scheduledDate) >= new Date()
        );
        break;
      case 2: // Completed
        filtered = filtered.filter((interview: Interview) => interview.status === 'completed');
        break;
      case 3: // Cancelled
        filtered = filtered.filter((interview: Interview) => interview.status === 'cancelled');
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((interview: Interview) =>
        interview.candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((interview: Interview) => interview.status === statusFilter);
    }

    return filtered;
  };

  const filteredInterviews = getFilteredInterviews();

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'rescheduled': return 'warning';
      default: return 'default';
    }
  };

  // Get meeting type icon
  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon fontSize="small" />;
      case 'phone': return <PhoneIcon fontSize="small" />;
      case 'in-person': return <LocationIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  // Handle reschedule
  const handleReschedule = () => {
    if (!selectedInterview || !newDate || !newTime) {
      toast.error('Please select date and time');
      return;
    }

    rescheduleMutation.mutate({
      id: selectedInterview._id,
      date: newDate,
      time: newTime,
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Interview Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all scheduled interviews
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 3, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search candidates, employers, or jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="rescheduled">Rescheduled</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FilterIcon sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {filteredInterviews.length} interviews
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
            }
          }}
        >
          <Tab label="All Interviews" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Box>

      {/* Interviews List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {filteredInterviews.map((interview: Interview) => (
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              '&:hover': {
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                borderColor: 'primary.main',
              },
              transition: 'all 0.2s ease'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, alignItems: 'center' }}>
                  {/* Candidate Info */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={interview.candidate.profilePicture}
                        sx={{ width: 48, height: 48 }}
                      >
                        {interview.candidate.firstName[0]}{interview.candidate.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {interview.candidate.firstName} {interview.candidate.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {interview.candidate.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Job & Company Info */}
                  <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {interview.job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {interview.employer.companyName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {interview.job.location}
                      </Typography>
                  </Box>

                  {/* Schedule Info */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {format(new Date(interview.scheduledDate), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {interview.scheduledTime} ({interview.duration} min)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getMeetingTypeIcon(interview.meetingDetails.type)}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {interview.meetingDetails.type}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status & Actions */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip
                        label={interview.status}
                        color={getStatusColor(interview.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedInterview(interview);
                            setShowDetailsModal(true);
                          }}
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'grey.300',
                            '&:hover': { borderColor: 'primary.main' }
                          }}
                        >
                          <EventIcon fontSize="small" />
                        </IconButton>
                        
                        {interview.status === 'scheduled' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedInterview(interview);
                                setNewDate(interview.scheduledDate);
                                setNewTime(interview.scheduledTime);
                                setShowRescheduleModal(true);
                              }}
                              sx={{ 
                                border: '1px solid',
                                borderColor: 'grey.300',
                                '&:hover': { borderColor: 'warning.main' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this interview?')) {
                                  cancelMutation.mutate(interview._id);
                                }
                              }}
                              sx={{ 
                                border: '1px solid',
                                borderColor: 'grey.300',
                                '&:hover': { borderColor: 'error.main' }
                              }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        
                        {interview.status === 'scheduled' && new Date(interview.scheduledDate) < new Date() && (
                          <IconButton
                            size="small"
                            onClick={() => updateStatusMutation.mutate({ id: interview._id, status: 'completed' })}
                            sx={{ 
                              border: '1px solid',
                              borderColor: 'grey.300',
                              '&:hover': { borderColor: 'success.main' }
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
        ))}
      </Box>

      {filteredInterviews.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No interviews found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter ? 'Try adjusting your filters' : 'No interviews have been scheduled yet'}
          </Typography>
        </Box>
      )}

      {/* Interview Details Modal */}
      <Dialog 
        open={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '1px solid', 
          borderColor: 'grey.200',
          backgroundColor: 'grey.50'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Interview Details
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {selectedInterview && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Candidate Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar 
                    src={selectedInterview.candidate.profilePicture}
                    sx={{ width: 56, height: 56 }}
                  >
                    {selectedInterview.candidate.firstName[0]}{selectedInterview.candidate.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {selectedInterview.candidate.firstName} {selectedInterview.candidate.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedInterview.candidate.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Job Information
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedInterview.job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedInterview.employer.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedInterview.job.location}
                </Typography>
              </Box>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Schedule Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {format(new Date(selectedInterview.scheduledDate), 'EEEE, MMMM d, yyyy')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedInterview.scheduledTime} ({selectedInterview.duration} minutes)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getMeetingTypeIcon(selectedInterview.meetingDetails.type)}
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {selectedInterview.meetingDetails.type} meeting
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Meeting Details
                </Typography>
                {selectedInterview.meetingDetails.videoLink && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Video Link:</strong> {selectedInterview.meetingDetails.videoLink}
                  </Typography>
                )}
                {selectedInterview.meetingDetails.phoneNumber && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Phone:</strong> {selectedInterview.meetingDetails.phoneNumber}
                  </Typography>
                )}
                {selectedInterview.meetingDetails.location && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Location:</strong> {selectedInterview.meetingDetails.location}
                  </Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={selectedInterview.status}
                    color={getStatusColor(selectedInterview.status) as any}
                    sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                  />
                </Box>
              </Box>

              {(selectedInterview.notes || selectedInterview.feedback) && (
                <>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Divider sx={{ my: 2 }} />
                  </Box>
                  
                  {selectedInterview.notes && (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedInterview.notes}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedInterview.feedback && (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Feedback
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedInterview.feedback}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          pt: 2, 
          borderTop: '1px solid', 
          borderColor: 'grey.200',
          backgroundColor: 'grey.50'
        }}>
          <Button 
            onClick={() => setShowDetailsModal(false)}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'grey.100'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog 
        open={showRescheduleModal} 
        onClose={() => setShowRescheduleModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '1px solid', 
          borderColor: 'grey.200',
          backgroundColor: 'grey.50'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Reschedule Interview
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="New Date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            
            <TextField
              label="New Time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          pt: 2, 
          borderTop: '1px solid', 
          borderColor: 'grey.200',
          backgroundColor: 'grey.50',
          gap: 2
        }}>
          <Button 
            onClick={() => setShowRescheduleModal(false)}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'grey.100'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            variant="contained"
            disabled={rescheduleMutation.isPending}
            sx={{
              backgroundColor: '#006BFF',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(0, 107, 255, 0.2)',
              '&:hover': {
                backgroundColor: '#0056CC',
                boxShadow: '0 4px 12px rgba(0, 107, 255, 0.3)',
              }
            }}
          >
            {rescheduleMutation.isPending ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const RecruiterInterviewsPage = () => {
  return (
    <ProtectedRoute allowedRoles={['recruitment_partner']}>
      <DashboardLayout>
        <RecruiterInterviewsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default RecruiterInterviewsPage;
