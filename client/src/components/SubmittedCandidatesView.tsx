"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
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
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  FileText,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface InterviewSlot {
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface Interview {
  _id: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  interviewType: "phone" | "video" | "in_person";
  meetingLink?: string;
  notes?: string;
  scheduledAt: string;
  slot: InterviewSlot;
}

interface SubmittedCandidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  resume?: string;
  submittedAt: string;
  job: {
    _id: string;
    title: string;
    location: string;
    employer: {
      companyName: string;
    };
  };
  applicationStatus: string;
  coverLetter: string;
  customFields: Array<{
    question: string;
    answer: string;
  }>;
  interviews: Interview[];
  hasScheduledInterview: boolean;
  latestInterviewStatus?: string;
}

interface Summary {
  totalSubmitted: number;
  withScheduledInterviews: number;
  applicationStatuses: {
    pending: number;
    shortlisted: number;
    interviewing: number;
    hired: number;
    rejected: number;
  };
  interviewStatuses: {
    scheduled: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
}

interface SubmittedCandidatesViewProps {
  jobId?: string;
}

const SubmittedCandidatesView: React.FC<SubmittedCandidatesViewProps> = ({
  jobId,
}) => {
  const [candidates, setCandidates] = useState<SubmittedCandidate[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] =
    useState<SubmittedCandidate | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [interviewFilter, setInterviewFilter] = useState("all");

  useEffect(() => {
    fetchSubmittedCandidates();
  }, [jobId]);

  const fetchSubmittedCandidates = async () => {
    try {
      setLoading(true);
      const url = jobId
        ? `/recruitment-partner/submitted-candidates?jobId=${jobId}`
        : "/recruitment-partner/submitted-candidates";
      const response = await api.get(url);
      setCandidates(response.data.candidates || []);
      setSummary(response.data.summary);
    } catch (error: any) {
      console.error("Error fetching submitted candidates:", error);
      toast.error("Failed to fetch submitted candidates");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (time: string) => {
    console.log("xcvxbv", time);
    if (time) {
      const [hours, minutes] = time?.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "shortlist":
        return "primary";
      case "phone_interview":
      case "in_person_interview":
        return "warning";
      case "hired":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getInterviewStatusColor = (status: string) => {
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

  const getInterviewStatusIcon = (status: string) => {
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

  const toggleRowExpansion = (candidateId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId);
    } else {
      newExpanded.add(candidateId);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewDetails = (candidate: SubmittedCandidate) => {
    setSelectedCandidate(candidate);
    setDetailsOpen(true);
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.job.employer.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || candidate.applicationStatus === statusFilter;

    const matchesInterview =
      interviewFilter === "all" ||
      (interviewFilter === "scheduled" && candidate.hasScheduledInterview) ||
      (interviewFilter === "no_interviews" &&
        !candidate.hasScheduledInterview) ||
      candidate.latestInterviewStatus === interviewFilter;

    return matchesSearch && matchesStatus && matchesInterview;
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Loading submitted candidates...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      {summary && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, mb: 4 }}>
          <Box sx={{ gridColumn: 'span 12', '@media (min-width: 600px)': { gridColumn: 'span 6' }, '@media (min-width: 900px)': { gridColumn: 'span 3' } }}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom>
                  {summary.totalSubmitted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Submitted
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ gridColumn: 'span 12', '@media (min-width: 600px)': { gridColumn: 'span 6' }, '@media (min-width: 900px)': { gridColumn: 'span 3' } }}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {summary.withScheduledInterviews}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With Interviews
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ gridColumn: 'span 12', '@media (min-width: 600px)': { gridColumn: 'span 6' }, '@media (min-width: 900px)': { gridColumn: 'span 3' } }}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {summary.applicationStatuses.interviewing}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interviewing
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ gridColumn: 'span 12', '@media (min-width: 600px)': { gridColumn: 'span 6' }, '@media (min-width: 900px)': { gridColumn: 'span 3' } }}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {summary.applicationStatuses.hired}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hired
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, alignItems: 'center' }}>
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Search candidates, jobs, or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Application Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Application Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="shortlist">Shortlisted</MenuItem>
                  <MenuItem value="phone_interview">Phone Interview</MenuItem>
                  <MenuItem value="in_person_interview">In-Person Interview</MenuItem>
                  <MenuItem value="hired">Hired</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Interview Status</InputLabel>
                <Select
                  value={interviewFilter}
                  onChange={(e) => setInterviewFilter(e.target.value)}
                  label="Interview Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no_show">No Show</MenuItem>
                  <MenuItem value="no_interviews">No Interviews</MenuItem>
                </Select>
              </FormControl>
            </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Application Status</TableCell>
                  <TableCell>Interview Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <React.Fragment key={candidate._id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(candidate._id)}
                        >
                          {expandedRows.has(candidate._id) ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {candidate.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {candidate.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {candidate.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {candidate.job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {candidate.job.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {candidate.job.employer.companyName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={candidate.applicationStatus
                            .replace("_", " ")
                            .toUpperCase()}
                          color={
                            getStatusColor(candidate.applicationStatus) as any
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {candidate.hasScheduledInterview ? (
                          <Chip
                            label={
                              candidate.latestInterviewStatus
                                ?.replace("_", " ")
                                .toUpperCase() || "SCHEDULED"
                            }
                            color={
                              getInterviewStatusColor(
                                candidate.latestInterviewStatus || "scheduled"
                              ) as any
                            }
                            size="small"
                            icon={getInterviewStatusIcon(
                              candidate.latestInterviewStatus || "scheduled"
                            )}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No interviews
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(candidate.submittedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(candidate)}
                        >
                          <Eye size={16} />
                        </IconButton>
                        {/* {candidate.resume && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              window.open(candidate.resume, "_blank")
                            }
                          >
                            <FileText size={16} />
                          </IconButton>
                        )} */}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row - Interview Details */}
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 0 }}>
                        <Collapse in={expandedRows.has(candidate._id)}>
                          <Box sx={{ p: 2, backgroundColor: "grey.50" }}>
                            {candidate.interviews.length > 0 ? (
                              <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                  Interview Schedule
                                </Typography>
                                {
                                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                                    {candidate.interviews.map((interview) => (
                                      <Box
                                        sx={{
                                          gridColumn: 'span 12',
                                          '@media (min-width: 900px)': { gridColumn: 'span 6' }
                                        }}
                                        key={interview._id}
                                      >
                                        {interview && (
                                          <Card
                                            variant="outlined"
                                            sx={{ p: 2 }}
                                          >
                                            <Box
                                              display="flex"
                                              justifyContent="space-between"
                                              alignItems="center"
                                              mb={1}
                                            >
                                              <Chip
                                                label={interview?.status
                                                  .replace("_", " ")
                                                  .toUpperCase()}
                                                color={
                                                  getInterviewStatusColor(
                                                    interview?.status
                                                  ) as any
                                                }
                                                size="small"
                                                icon={getInterviewStatusIcon(
                                                  interview?.status
                                                )}
                                              />
                                              <Chip
                                                label={interview?.interviewType
                                                  .replace("_", " ")
                                                  .toUpperCase()}
                                                variant="outlined"
                                                size="small"
                                              />
                                            </Box>
                                            {interview && (
                                              <Typography
                                                variant="body2"
                                                gutterBottom
                                              >
                                                <Calendar
                                                  size={14}
                                                  style={{ marginRight: 8 }}
                                                />
                                                {formatDate(
                                                  interview?.slot?.date
                                                )}{" "}
                                                at{" "}
                                                {formatTime(
                                                  interview?.slot?.startTime
                                                )}{" "}
                                                -{" "}
                                                {formatTime(
                                                  interview?.slot?.endTime
                                                )}
                                              </Typography>
                                            )}
                                            {interview?.meetingLink && (
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Video />}
                                                href={interview.meetingLink}
                                                target="_blank"
                                                sx={{ mt: 1 }}
                                              >
                                                Join Meeting
                                              </Button>
                                            )}
                                          </Card>
                                        )}
                                      </Box>
                                    ))}
                                  </Box>
                                }
                              </Box>
                            ) : (
                              <Alert severity="info">
                                No interviews scheduled for this candidate yet.
                              </Alert>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredCandidates.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No candidates found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ||
                statusFilter !== "all" ||
                interviewFilter !== "all"
                  ? "Try adjusting your search filters."
                  : "You haven't submitted any candidates yet."}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Candidate Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Candidate Details</DialogTitle>
        <DialogContent>
          {selectedCandidate && (
            <Box>
              {/* Candidate Info */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {selectedCandidate.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {selectedCandidate.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Applied for {selectedCandidate.job.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                    <Box sx={{ gridColumn: 'span 12', '@media (min-width: 600px)': { gridColumn: 'span 6' } }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Mail size={16} />
                        <Typography variant="body2">
                          {selectedCandidate.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ gridColumn: 'span 12', '@media (min-width: 600px)': { gridColumn: 'span 6' } }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Phone size={16} />
                        <Typography variant="body2">
                          {selectedCandidate.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box mt={2}>
                    <Chip
                      label={selectedCandidate.applicationStatus
                        .replace("_", " ")
                        .toUpperCase()}
                      color={
                        getStatusColor(
                          selectedCandidate.applicationStatus
                        ) as any
                      }
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Job Info */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Job Information
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedCandidate.job.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {selectedCandidate.job.employer.companyName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MapPin size={16} />
                    <Typography variant="body2">
                      {selectedCandidate.job.location}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Interview Details */}
              {selectedCandidate.interviews.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Interview Schedule
                    </Typography>
                    {selectedCandidate.interviews.map((interview) => (
                      <Card
                        key={interview._id}
                        variant="outlined"
                        sx={{ mb: 2, p: 2 }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                        >
                          {interview?.status && (
                            <Chip
                              label={interview.status
                                .replace("_", " ")
                                .toUpperCase()}
                              color={
                                getInterviewStatusColor(interview.status) as any
                              }
                              icon={getInterviewStatusIcon(interview.status)}
                            />
                          )}
                          {interview?.interviewType && (
                            <Chip
                              label={interview.interviewType
                                .replace("_", " ")
                                .toUpperCase()}
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" gutterBottom>
                          <Calendar size={16} style={{ marginRight: 8 }} />
                          {formatDate(interview?.slot?.date)} at{" "}
                          {formatTime(interview?.slot?.startTime)} -{" "}
                          {formatTime(interview?.slot?.endTime)}
                        </Typography>
                        {interview.meetingLink && (
                          <Button
                            variant="outlined"
                            startIcon={<Video />}
                            href={interview.meetingLink}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            Join Meeting
                          </Button>
                        )}
                        {interview.notes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Notes: {interview.notes}
                          </Typography>
                        )}
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmittedCandidatesView;
