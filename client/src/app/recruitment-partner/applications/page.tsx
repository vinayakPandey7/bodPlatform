"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  Phone,
  Mail,
  Download,
  Eye,
  ExternalLink,
  X,
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  Linkedin,
  Globe,
  School,
  Award,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

interface Application {
  _id: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    resume: any;
  };
  job: {
    _id: string;
    title: string;
    location: string;
    employer: {
      companyName: string;
    };
  };
  status: string;
  appliedAt: string;
  submittedAt: string;
  coverLetter: string;
  customFields: any[];
}

interface ApplicationSummary {
  totalApplications: number;
  pending: number;
  shortlisted: number;
  interviewing: number;
  hired: number;
  rejected: number;
  awaitingPlacement: number;
}

export default function RecruitmentPartnerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [summary, setSummary] = useState<ApplicationSummary>({
    totalApplications: 0,
    pending: 0,
    shortlisted: 0,
    interviewing: 0,
    hired: 0,
    rejected: 0,
    awaitingPlacement: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log("Fetching applications...");

      // Use the correct recruitment partner API endpoint
      const response = await api.get("/recruitment-partner/applications");

      console.log("Applications API Response:", response.data);

      if (response.data.success) {
        setApplications(response.data.applications || []);
        setSummary(
          response.data.summary || {
            totalApplications: 0,
            pending: 0,
            shortlisted: 0,
            interviewing: 0,
            hired: 0,
            rejected: 0,
            awaitingPlacement: 0,
          }
        );
      } else {
        setError("Failed to fetch applications");
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setError(error.response?.data?.message || "Failed to fetch applications");
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const handleViewProfile = async (candidateId: string) => {
    setCandidateLoading(true);
    setCandidateModalOpen(true);

    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const candidate = await response.json();
        setSelectedCandidate(candidate);
      } else {
        console.error("Failed to fetch candidate details");
      }
    } catch (error) {
      console.error("Error fetching candidate:", error);
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleViewJob = async (jobId: string) => {
    setJobLoading(true);
    setJobModalOpen(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const job = await response.json();
        setSelectedJob(job);
      } else {
        console.error("Failed to fetch job details");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setJobLoading(false);
    }
  };

  const handleCloseCandidateModal = () => {
    setCandidateModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleCloseJobModal = () => {
    setJobModalOpen(false);
    setSelectedJob(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      shortlist: "bg-blue-100 text-blue-800 border-blue-200",
      assessment: "bg-purple-100 text-purple-800 border-purple-200",
      phone_interview: "bg-indigo-100 text-indigo-800 border-indigo-200",
      in_person_interview: "bg-violet-100 text-violet-800 border-violet-200",
      background_check: "bg-orange-100 text-orange-800 border-orange-200",
      hired: "bg-green-100 text-green-800 border-green-200",
      selected: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      stand_by: "bg-gray-100 text-gray-800 border-gray-200",
      no_response: "bg-gray-100 text-gray-600 border-gray-200",
      awaiting_placement: "bg-cyan-100 text-cyan-800 border-cyan-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "shortlist":
        return <Users className="h-4 w-4" />;
      case "phone_interview":
      case "in_person_interview":
        return <Phone className="h-4 w-4" />;
      case "hired":
      case "selected":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4" />;
      case "awaiting_placement":
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getResumeUrl = (resume: any) => {
    if (!resume) return null;

    if (resume.cloudinaryUrl) {
      return resume.cloudinaryUrl;
    } else if (resume.url) {
      return resume.url;
    } else if (resume.fileName) {
      return `/api/uploads/resumes/${resume.fileName}`;
    }
    return null;
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
                Applications & Placements
              </h1>
              <p className="mt-1 text-gray-600">
                Track the status of candidates you've submitted to jobs
              </p>
            </div>

            <button
              onClick={fetchApplications}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {summary.totalApplications}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {summary.pending}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Shortlisted
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {summary.shortlisted}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Interviews
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {summary.interviewing}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Hired</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {summary.hired}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {summary.rejected}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Awaiting</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {summary.awaitingPlacement}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Filter Applications
              </h3>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">
                  All Statuses ({summary.totalApplications})
                </option>
                <option value="pending">Pending ({summary.pending})</option>
                <option value="shortlist">
                  Shortlisted ({summary.shortlisted})
                </option>
                <option value="phone_interview">Phone Interview</option>
                <option value="in_person_interview">In-Person Interview</option>
                <option value="background_check">Background Check</option>
                <option value="hired">Hired ({summary.hired})</option>
                <option value="rejected">Rejected ({summary.rejected})</option>
                <option value="awaiting_placement">
                  Awaiting Placement ({summary.awaitingPlacement})
                </option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === "all"
                  ? "You haven't submitted any candidates yet."
                  : `No applications with status "${formatStatus(
                      statusFilter
                    )}" found.`}
              </p>
              {statusFilter === "all" && (
                <button
                  onClick={() =>
                    (window.location.href = "/recruitment-partner/jobs")
                  }
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs & Submit Candidates
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredApplications.map((application) => (
                <div
                  key={application._id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.candidate.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusIcon(application.status)}
                          {formatStatus(application.status)}
                        </span>
                      </div>

                      {/* Job Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                            <h4 className="font-medium text-gray-900">
                              Job Details
                            </h4>
                          </div>
                          <h5 className="font-semibold text-blue-600">
                            {application.job.title}
                          </h5>
                          <p className="text-gray-700 font-medium">
                            {application.job.employer?.companyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {application.job.location}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Users className="h-4 w-4 text-gray-500 mr-2" />
                            <h4 className="font-medium text-gray-900">
                              Contact Info
                            </h4>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <a
                                href={`mailto:${application.candidate.email}`}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                {application.candidate.email}
                              </a>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <a
                                href={`tel:${application.candidate.phone}`}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                {application.candidate.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Submitted on {formatDate(application.submittedAt)}
                        </div>
                        {application.appliedAt !== application.submittedAt && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Applied on {formatDate(application.appliedAt)}
                          </div>
                        )}
                      </div>

                      {/* Cover Letter Preview */}
                      {application.coverLetter && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            Cover Letter
                          </h4>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col space-y-2">
                      {getResumeUrl(application.candidate.resume) && (
                        <a
                          href={getResumeUrl(application.candidate.resume)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Resume
                        </a>
                      )}

                      <button
                        onClick={() =>
                          handleViewProfile(application.candidate._id)
                        }
                        className="flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </button>

                      {application.job._id !== "no-job" && (
                        <button
                          onClick={() => handleViewJob(application.job._id)}
                          className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Job
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Candidate Profile Modal */}
        <Dialog
          open={candidateModalOpen}
          onClose={handleCloseCandidateModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle className="flex items-center justify-between">
            <span>Candidate Profile</span>
            <IconButton onClick={handleCloseCandidateModal} size="small">
              <X className="h-4 w-4" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {candidateLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading candidate details...</span>
              </div>
            ) : selectedCandidate ? (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedCandidate.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">
                        {selectedCandidate.phoneNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">
                        {selectedCandidate.location || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Professional Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Current Position</p>
                      <p className="font-medium">
                        {selectedCandidate.currentPosition || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium">
                        {selectedCandidate.experience || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Skills</p>
                      <p className="font-medium">
                        {selectedCandidate.skills || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                {selectedCandidate.education && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <School className="h-5 w-5 mr-2" />
                      Education
                    </h3>
                    <p className="font-medium">{selectedCandidate.education}</p>
                  </div>
                )}

                {/* Resume */}
                {selectedCandidate.resume && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Resume
                    </h3>
                    <a
                      href={selectedCandidate.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Failed to load candidate details
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Job Details Modal */}
        <Dialog
          open={jobModalOpen}
          onClose={handleCloseJobModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle className="flex items-center justify-between">
            <span>Job Details</span>
            <IconButton onClick={handleCloseJobModal} size="small">
              <X className="h-4 w-4" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {jobLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading job details...</span>
              </div>
            ) : selectedJob ? (
              <div className="space-y-6">
                {/* Job Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Job Overview
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="font-semibold text-lg">
                        {selectedJob.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium">{selectedJob.company}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedJob.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Salary Range</p>
                      <p className="font-medium">
                        {selectedJob.salaryRange || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Job Type</p>
                      <p className="font-medium">{selectedJob.jobType}</p>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <div className="prose prose-sm max-w-none">
                    {selectedJob.description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedJob?.description?.replace(
                            /\n/g,
                            "<br>"
                          ),
                        }}
                      />
                    ) : (
                      <p className="text-gray-500">No description provided</p>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                {selectedJob?.requirements &&
                  selectedJob.requirements.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">
                        Requirements
                      </h3>
                      <div className="space-y-2">
                        {Array.isArray(selectedJob.requirements) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {selectedJob.requirements.map(
                              (req: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-700"
                                >
                                  {req}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: selectedJob.requirements.replace(
                                  /\n/g,
                                  "<br>"
                                ),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Benefits */}
                {selectedJob?.benefits && selectedJob.benefits.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                    <div className="space-y-2">
                      {Array.isArray(selectedJob.benefits) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {selectedJob.benefits.map(
                            (benefit: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700">
                                {benefit}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedJob.benefits.replace(
                                /\n/g,
                                "<br>"
                              ),
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Failed to load job details
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
