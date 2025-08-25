'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoCallIcon,
  Call as CallIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CandidateSubmission {
  _id: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    resume?: string;
  };
  application: {
    status: string;
    appliedAt: string;
    coverLetter: string;
    customFields: any[];
  };
  interviewStatus: string;
  interviewDetails?: {
    _id: string;
    status: string;
    scheduledDateTime: string;
    interviewType: string;
    tokenExpiresAt: string;
    bookedAt?: string;
    createdAt: string;
    employer: string;
  };
  submittedAt: string;
}

interface SubmittedCandidatesModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
}

const SubmittedCandidatesModal: React.FC<SubmittedCandidatesModalProps> = ({
  open,
  onClose,
  jobId,
  jobTitle,
  companyName,
}) => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && jobId) {
      fetchSubmissions();
    }
  }, [open, jobId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/recruitment-partner/jobs/${jobId}/submissions`);
      setSubmissions(response.data.submissions || []);
      setSummary(response.data.summary || {});
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      setError('Failed to fetch submitted candidates');
      toast.error('Failed to fetch submitted candidates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'shortlist':
        return 'info';
      case 'phone_interview':
      case 'in_person_interview':
        return 'primary';
      case 'hired':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInterviewStatusInfo = (interviewStatus: string, interviewDetails?: any) => {
    
    const formatISODate = (isoDateString: string): string => {
      if (!isoDateString) return 'TBD';

      try {
        const date = parseISO(isoDateString);
        return format(date, 'MMM dd, yyyy \'at\' h:mm a');
      } catch (error) {
        return 'Invalid date';
      }
    };


    switch (interviewStatus) {
      case 'pending':
        return {
          label: 'Interview Invited',
          color: 'warning',
          icon: <PendingIcon />,
          description: 'Candidate has been sent an interview invitation',
        };
      case 'confirmed':
        return {
          label: 'Interview Scheduled',
          color: 'success',
          icon: <CheckCircleIcon />,
          description: `Interview scheduled for ${
          interviewDetails?.scheduledDateTime
            ? formatISODate(interviewDetails?.scheduledDateTime)
            : 'TBD'
        }`,
        };
      case 'completed':
        return {
          label: 'Interview Completed',
          color: 'info',
          icon: <CheckCircleIcon />,
          description: 'Interview has been completed',
        };
      case 'cancelled':
        return {
          label: 'Interview Cancelled',
          color: 'error',
          icon: <CancelIcon />,
          description: 'Interview was cancelled',
        };
      case 'expired':
        return {
          label: 'Invitation Expired',
          color: 'error',
          icon: <CancelIcon />,
          description: 'Interview invitation has expired',
        };
      default:
        return {
          label: 'No Interview',
          color: 'default',
          icon: <ScheduleIcon />,
          description: 'No interview scheduled yet',
        };
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoCallIcon fontSize="small" />;
      case 'phone':
        return <CallIcon fontSize="small" />;
      case 'in-person':
        return <LocationIcon fontSize="small" />;
      default:
        return <ScheduleIcon fontSize="small" />;
    }
  };

  const handleDownloadResume = (resumeUrl: any, candidateName: string) => {
    if (resumeUrl) {
      const link = document.createElement('a');
      link.href = resumeUrl?.cloudinaryUrl;
      link.download = `${candidateName}_Resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="div" fontWeight={600}>
            Submitted Candidates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {jobTitle} at {companyName}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            {/* Summary Cards */}
            {summary && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Card variant="outlined" sx={{ flex: 1 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="primary" fontWeight={700}>
                        {summary.totalSubmissions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Submissions
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" sx={{ flex: 1 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="success.main" fontWeight={700}>
                        {summary.interviewBooked}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Interviews Scheduled
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" sx={{ flex: 1 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="warning.main" fontWeight={700}>
                        {summary.interviewInvited}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Interview
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" sx={{ flex: 1 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="info.main" fontWeight={700}>
                        {summary.hired}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hired
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              </Box>
            )}

            {/* Candidates List */}
            {submissions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <WorkIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No candidates submitted yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submit candidates for this job to see them here.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {submissions.map((submission) => {
                  const interviewInfo = getInterviewStatusInfo(
                    submission.interviewStatus,
                    submission.interviewDetails
                  );

                  return (
                    <Card key={submission._id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {submission.candidate.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <EmailIcon fontSize="small" color="action" />
                                  <Typography variant="body2" color="text.secondary">
                                    {submission.candidate.email}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PhoneIcon fontSize="small" color="action" />
                                  <Typography variant="body2" color="text.secondary">
                                    {submission.candidate.phone}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {submission.candidate.resume && (
                              <Tooltip title="Download Resume">
                                <IconButton
                                  onClick={() => handleDownloadResume(
                                    submission.candidate.resume!,
                                    submission.candidate.name
                                  )}
                                  size="small"
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Chip
                              label={submission.application.status.replace('_', ' ')}
                              color={getStatusColor(submission.application.status) as any}
                              size="small"
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Interview Status */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {interviewInfo.icon}
                            <Typography variant="subtitle2" fontWeight={600}>
                              Interview Status
                            </Typography>
                            <Chip
                              label={interviewInfo.label}
                              color={interviewInfo.color as any}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {interviewInfo.description}
                          </Typography>

                          {/* Interview Details */}
                          {submission.interviewDetails && submission.interviewDetails.scheduledDateTime && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Stack spacing={1}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <TimeIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    <strong>Date:</strong> {format(
                                      new Date(submission.interviewDetails.scheduledDateTime),
                                      'EEEE, MMMM dd, yyyy at h:mm a'
                                    )}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getInterviewTypeIcon(submission.interviewDetails.interviewType)}
                                  <Typography variant="body2">
                                    <strong>Type:</strong> {submission.interviewDetails.interviewType} interview
                                  </Typography>
                                </Box>
                                {submission.interviewDetails.bookedAt && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon fontSize="small" color="success" />
                                    <Typography variant="body2">
                                      <strong>Booked:</strong> {format(
                                        new Date(submission.interviewDetails.bookedAt),
                                        'MMM dd, yyyy at h:mm a'
                                      )}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </Box>

                        {/* Application Details */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Submitted on {format(new Date(submission.submittedAt), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={fetchSubmissions} variant="contained" disabled={loading}>
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmittedCandidatesModal;
