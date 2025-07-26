"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Alert,
  Tabs,
  Tab,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as SparklesIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  jobRole: string;
  jobType: string;
  payStructure: string;
  numberOfPositions: number;
  startDate: string;
  expires: string;
  isApproved: boolean;
  isActive: boolean;
  employer?: {
    _id: string;
    ownerName: string;
    companyName: string;
  };
  recruitmentPartner?: {
    _id: string;
    ownerName: string;
    companyName: string;
  };
  postedBy: "employer" | "recruitment_partner";
  createdAt: string;
  // Extended fields for detailed view
  requirements?: string[];
  skills?: string[];
  experience?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  benefits?: string[];
  department?: string;
  contactNumber?: string;
  urgency?: string;
  languagePreference?: string[];
  qualifications?: string[];
  additionalRequirements?: string[];
  licenseRequirement?: string;
  additionalInfo?: string;
  workMode?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  legacyJobType?: string;
}

export default function RecruitmentPartnerJobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [payStructureFilter, setPayStructureFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Utility function to safely format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Not specified";
      return date.toLocaleDateString();
    } catch {
      return "Not specified";
    }
  };

  useEffect(() => {
    fetchAllJobs();
    fetchMyJobs();
  }, []);

  const fetchAllJobs = async () => {
    try {
      const response = await api.get("/jobs/active");
      setAllJobs(response.data.jobs || []);
    } catch (error: any) {
      console.error("Error fetching all jobs:", error);
      setError("Failed to fetch jobs");
    }
  };

  const fetchMyJobs = async () => {
    try {
      const response = await api.get("/jobs/recruitment-partner/my-jobs");
      setMyJobs(response.data.jobs || []);
    } catch (error: any) {
      console.error("Error fetching my jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentJobs = activeTab === 0 ? allJobs : myJobs;

  const filteredJobs = currentJobs.filter((job: Job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.employer?.companyName || job.recruitmentPartner?.companyName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesJobType =
      jobTypeFilter === "all" || job.jobType === jobTypeFilter;
    const matchesPayStructure =
      payStructureFilter === "all" || job.payStructure === payStructureFilter;

    return (
      matchesSearch && matchesLocation && matchesJobType && matchesPayStructure
    );
  });

  const handleApplyToJob = (jobId: string) => {
    // This would open a modal or redirect to application form
    alert(`Apply to job ${jobId} - This feature will be implemented`);
  };

  const handleCreateJob = () => {
    router.push("/recruitment-partner/jobs/create");
  };

  const handleJobPreview = async (jobId: string) => {
    try {
      // Fetch detailed job information
      const response = await api.get(`/jobs/${jobId}`);
      console.log("Job details response:", response.data);
      setSelectedJob(response.data);
      setPreviewOpen(true);
    } catch (error: any) {
      console.error("Error fetching job details:", error);
      setError("Failed to fetch job details");
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedJob(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getCompanyName = (job: Job) => {
    return (
      job.employer?.companyName || job.recruitmentPartner?.companyName || ""
    );
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["recruitment_partner"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Job Management
              </h1>
              <p className="mt-1 text-gray-600">
                Browse opportunities and manage your job postings
              </p>
            </div>

            {/* Post New Job Button */}
            <Button
              variant="contained"
              startIcon={<SparklesIcon />}
              onClick={handleCreateJob}
              sx={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
                },
                borderRadius: "12px",
                padding: "12px 24px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "16px",
              }}
            >
              Post New Job
            </Button>
          </div>

          {/* Tabs */}
          <Card>
            <CardContent sx={{ pt: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
              >
                <Tab
                  label={`Browse Jobs (${allJobs.length})`}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                />
                <Tab
                  label={`My Postings (${myJobs.length})`}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                />
              </Tabs>

              {/* Tab Content */}
              <Box>
                {activeTab === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Find opportunities to place your candidates with these
                    active job postings.
                  </Typography>
                )}
                {activeTab === 1 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Manage and track the job postings you've created for your
                    clients.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField
                label="Search Jobs"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "14px",
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="Location"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "14px",
                    color: "#64748b",
                  },
                }}
              />

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "14px", color: "#64748b" }}>
                  Job Type
                </InputLabel>
                <Select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  label="Job Type"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="freelance">Freelance</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "14px", color: "#64748b" }}>
                  Pay Structure
                </InputLabel>
                <Select
                  value={payStructureFilter}
                  onChange={(e) => setPayStructureFilter(e.target.value)}
                  label="Pay Structure"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="all">All Structures</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="salary">Salary</MenuItem>
                  <MenuItem value="commission">Commission</MenuItem>
                  <MenuItem value="piece_rate">Piece Rate</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {error && (
            <Alert severity="error" className="rounded">
              {error}
            </Alert>
          )}

          <div className="grid gap-6">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600">
                  {searchTerm ||
                  locationFilter ||
                  jobTypeFilter !== "all" ||
                  payStructureFilter !== "all"
                    ? "Try adjusting your search filters."
                    : "No active job postings available at the moment."}
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleJobPreview(job._id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <Chip
                          label="Active"
                          size="small"
                          sx={{
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                          }}
                        />
                        <Chip
                          label={`${job.numberOfPositions} Position${
                            job.numberOfPositions > 1 ? "s" : ""
                          }`}
                          size="small"
                          sx={{
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                          }}
                        />
                      </div>

                      <div className="mb-4">
                        <p className="text-lg font-medium text-gray-800">
                          {job?.employer?.companyName}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <WorkIcon fontSize="small" className="mr-1" />
                          <span className="font-medium">Type:</span>{" "}
                          {job.jobRole.replace("_", " ")}
                        </div>
                        <div className="flex items-center">
                          <TimeIcon fontSize="small" className="mr-1" />
                          <span className="font-medium">Work Style:</span>{" "}
                          {job.jobType.replace("_", " ")}
                        </div>
                        <div className="flex items-center">
                          <MoneyIcon fontSize="small" className="mr-1" />
                          <span className="font-medium">Pay:</span>{" "}
                          {job.payStructure}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon fontSize="small" className="mr-1" />
                          <span className="font-medium">Expires:</span>{" "}
                          {formatDate(job.expires)}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      <div className="text-xs text-gray-500">
                        Posted on {formatDate(job.createdAt)}
                      </div>
                    </div>

                    <div className="ml-6">
                      <Button
                        onClick={() => handleApplyToJob(job._id)}
                        variant="contained"
                        sx={{
                          backgroundColor: "#4f46e5",
                          "&:hover": {
                            backgroundColor: "#4338ca",
                          },
                          borderRadius: "6px",
                          padding: "12px 24px",
                          fontWeight: 500,
                        }}
                      >
                        Submit Candidates
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Job Preview Modal */}
          <Dialog
            open={previewOpen}
            onClose={handleClosePreview}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: "12px",
                maxHeight: "90vh",
              },
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 2,
              }}
            >
              <Typography variant="h5" component="div" fontWeight={600}>
                Job Details
              </Typography>
              <IconButton
                onClick={handleClosePreview}
                size="small"
                sx={{
                  color: "grey.500",
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
              {selectedJob && (
                <Box sx={{ p: 3 }}>
                  {/* Job Header */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {selectedJob.title}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {getCompanyName(selectedJob)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <LocationIcon sx={{ mr: 1, color: "grey.600" }} />
                      <Typography color="text.secondary">
                        {selectedJob.city && selectedJob.state
                          ? `${selectedJob.city}, ${selectedJob.state}`
                          : selectedJob.location}
                        {selectedJob.zipCode && ` ${selectedJob.zipCode}`}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                      <Chip
                        label={
                          selectedJob.jobType?.replace("_", " ") ||
                          selectedJob.jobRole?.replace("_", " ") ||
                          "Full Time"
                        }
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        label={
                          selectedJob.workMode?.replace("_", " ") ||
                          selectedJob.legacyJobType
                            ?.replace("work_from_", "")
                            .replace("_", " ") ||
                          "Office"
                        }
                        variant="outlined"
                        color="secondary"
                      />
                      <Chip
                        label={`${selectedJob.numberOfPositions || 1} Position${
                          (selectedJob.numberOfPositions || 1) > 1 ? "s" : ""
                        }`}
                        variant="outlined"
                      />
                      {selectedJob.urgency &&
                        selectedJob.urgency !== "normal" && (
                          <Chip
                            label={selectedJob.urgency.replace("_", " ")}
                            color="warning"
                            variant="outlined"
                          />
                        )}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Job Information Layout */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 4,
                      flexDirection: { xs: "column", md: "row" },
                    }}
                  >
                    {/* Left Column */}
                    <Box sx={{ flex: 2 }}>
                      {/* Description */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Job Description
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ lineHeight: 1.7, whiteSpace: "pre-line" }}
                        >
                          {selectedJob.description ||
                            "No description available"}
                        </Typography>
                      </Box>

                      {/* Requirements */}
                      {selectedJob.requirements &&
                        selectedJob.requirements.length > 0 && (
                          <Box sx={{ mb: 4 }}>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              gutterBottom
                            >
                              Requirements
                            </Typography>
                            <Box
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {selectedJob.requirements.map((req, index) => (
                                <Chip
                                  key={index}
                                  label={req}
                                  variant="outlined"
                                  size="small"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                      {/* Skills */}
                      {selectedJob.skills && selectedJob.skills.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                          >
                            Required Skills
                          </Typography>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
                            {selectedJob.skills.map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Qualifications */}
                      {selectedJob.qualifications &&
                        selectedJob.qualifications.length > 0 && (
                          <Box sx={{ mb: 4 }}>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              gutterBottom
                            >
                              Qualifications
                            </Typography>
                            <Box
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {selectedJob.qualifications.map((qual, index) => (
                                <Chip
                                  key={index}
                                  label={qual}
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                      {/* Benefits */}
                      {selectedJob.benefits &&
                        selectedJob.benefits.length > 0 && (
                          <Box sx={{ mb: 4 }}>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              gutterBottom
                            >
                              Benefits
                            </Typography>
                            <Box
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {selectedJob.benefits.map((benefit, index) => (
                                <Chip
                                  key={index}
                                  label={benefit}
                                  variant="filled"
                                  size="small"
                                  color="success"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                      {/* Additional Info */}
                      {selectedJob.additionalInfo && (
                        <Box sx={{ mb: 4 }}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                          >
                            Additional Information
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedJob.additionalInfo}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Right Column - Job Details */}
                    <Box sx={{ flex: 1, minWidth: { md: "300px" } }}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Job Details
                        </Typography>

                        <Stack spacing={2}>
                          {/* Salary */}
                          {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Salary Range
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedJob.salaryMin && selectedJob.salaryMax
                                  ? `$${selectedJob.salaryMin.toLocaleString()} - $${selectedJob.salaryMax.toLocaleString()}`
                                  : selectedJob.salaryMin
                                  ? `From $${selectedJob.salaryMin.toLocaleString()}`
                                  : `Up to $${selectedJob.salaryMax?.toLocaleString()}`}
                                {selectedJob.currency &&
                                selectedJob.currency !== "USD"
                                  ? ` ${selectedJob.currency}`
                                  : ""}
                              </Typography>
                            </Box>
                          )}

                          {/* Experience */}
                          {selectedJob.experience && (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Experience Required
                              </Typography>
                              <Typography variant="body1">
                                {selectedJob.experience} years
                              </Typography>
                            </Box>
                          )}

                          {/* Department */}
                          {selectedJob.department && (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Department
                              </Typography>
                              <Typography variant="body1">
                                {selectedJob.department}
                              </Typography>
                            </Box>
                          )}

                          {/* License Requirement */}
                          {selectedJob.licenseRequirement && (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                License Requirement
                              </Typography>
                              <Typography variant="body1">
                                {selectedJob.licenseRequirement}
                              </Typography>
                            </Box>
                          )}

                          {/* Languages */}
                          {selectedJob.languagePreference &&
                            selectedJob.languagePreference.length > 0 && (
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                >
                                  Languages
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                    mt: 0.5,
                                  }}
                                >
                                  {selectedJob.languagePreference.map(
                                    (lang, index) => (
                                      <Chip
                                        key={index}
                                        label={lang}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )
                                  )}
                                </Box>
                              </Box>
                            )}

                          {/* Start Date */}
                          {selectedJob.startDate && (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Start Date
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(selectedJob.startDate)}
                              </Typography>
                            </Box>
                          )}

                          {/* Expiry Date */}
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Application Deadline
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(selectedJob.expires)}
                            </Typography>
                          </Box>

                          {/* Posted Date */}
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Posted On
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(selectedJob.createdAt)}
                            </Typography>
                          </Box>

                          {/* Contact */}
                          {selectedJob.contactNumber && (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Contact
                              </Typography>
                              <Typography variant="body1">
                                {selectedJob.contactNumber}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Card>
                    </Box>
                  </Box>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleClosePreview} color="inherit">
                Close
              </Button>
              {selectedJob && activeTab === 0 && (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleClosePreview();
                    handleApplyToJob(selectedJob._id);
                  }}
                  sx={{
                    backgroundColor: "#4f46e5",
                    "&:hover": {
                      backgroundColor: "#4338ca",
                    },
                  }}
                >
                  Submit Candidates
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
