"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import JobDetailsModal from "@/components/JobDetailsModal";
import api from "@/lib/api";
import {
  Search,
  Plus,
  Filter,
  SortAsc,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Building2,
  TrendingUp,
  Target,
  RefreshCw,
  ChevronDown,
  X,
  Sparkles,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";

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
  createdAt: string;
  contactNumber?: string;
  // Enhanced Licensed Candidate Fields
  candidateType?: string[];
  workSchedule?: string;
  partTimeWorkDays?: string[];
  officeRequirement?: string;
  officeDetails?: string;
  remoteWorkDays?: string;
  remoteWorkPreferredDays?: string[];
  payStructureType?: string;
  hourlyPay?: string;
  payDays?: string;
  employeeBenefits?: string[];
  freeParking?: string;
  roleType?: string;
  qualifications?: string[];
  additionalRequirements?: string[];
}

interface JobFilters {
  search: string;
  status: string;
  approval: string;
  jobRole: string;
  jobType: string;
  sortBy: string;
  dateRange: string;
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showJobTypeModal, setShowJobTypeModal] = useState(false);
  const router = useRouter();

  // Filter states
  const [filters, setFilters] = useState<JobFilters>({
    search: "",
    status: "all",
    approval: "all",
    jobRole: "all",
    jobType: "all",
    sortBy: "newest",
    dateRange: "all",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs/employer/my-jobs");
      setJobs(response.data.jobs || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.description
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          job.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((job) =>
        filters.status === "active" ? job.isActive : !job.isActive
      );
    }

    // Approval filter
    if (filters.approval !== "all") {
      filtered = filtered.filter((job) =>
        filters.approval === "approved" ? job.isApproved : !job.isApproved
      );
    }

    // Job role filter
    if (filters.jobRole !== "all") {
      filtered = filtered.filter((job) => job.jobRole === filters.jobRole);
    }

    // Job type filter
    if (filters.jobType !== "all") {
      filtered = filtered.filter((job) => job.jobType === filters.jobType);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const jobDate = new Date();

      switch (filters.dateRange) {
        case "week":
          jobDate.setDate(now.getDate() - 7);
          break;
        case "month":
          jobDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          jobDate.setMonth(now.getMonth() - 3);
          break;
      }

      if (filters.dateRange !== "all") {
        filtered = filtered.filter((job) => new Date(job.createdAt) >= jobDate);
      }
    }

    // Sort jobs
    switch (filters.sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "expires":
        filtered.sort(
          (a, b) =>
            new Date(a.expires).getTime() - new Date(b.expires).getTime()
        );
        break;
      case "positions":
        filtered.sort((a, b) => b.numberOfPositions - a.numberOfPositions);
        break;
    }

    return filtered;
  }, [jobs, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((job) => job.isActive).length;
    const approved = jobs.filter((job) => job.isApproved).length;
    const totalPositions = jobs.reduce(
      (sum, job) => sum + job.numberOfPositions,
      0
    );

    return { total, active, approved, totalPositions };
  }, [jobs]);

  const handleCreateJob = () => {
    setShowJobTypeModal(true);
  };

  const handleJobTypeSelection = (type: "normal" | "enhanced") => {
    setShowJobTypeModal(false);
    if (type === "normal") {
      router.push("/employer/jobs/create");
    } else {
      router.push("/employer/jobs/create-enhanced");
    }
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleCloseModal = () => {
    setSelectedJobId(null);
  };

  const handleEditJob = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); // Prevent job card click
    router.push(`/employer/jobs/${jobId}/edit`);
  };

  const handleViewApplications = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); // Prevent job card click
    router.push(`/employer/jobs/${jobId}/applications`);
  };

  const toggleJobStatus = async (
    e: React.MouseEvent,
    jobId: string,
    currentStatus: boolean
  ) => {
    e.stopPropagation(); // Prevent job card click
    try {
      await api.patch(`/jobs/${jobId}/toggle-status`);
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      approval: "all",
      jobRole: "all",
      jobType: "all",
      sortBy: "newest",
      dateRange: "all",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "all" && value !== "newest" && value !== ""
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["employer"]}>
        <DashboardLayout>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-md rounded-2xl p-6 h-24"
                ></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-md rounded-2xl p-6 h-48"
                ></div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="mt-2 text-gray-600">
                Manage your job postings and track applications
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchJobs}
                className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl text-gray-700 hover:bg-white/80 transition-all duration-200 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleCreateJob}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg cursor-pointer group"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Job Posting
                <ChevronDown className="h-4 w-4 ml-1 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Jobs
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Jobs
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.approved}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Positions
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.totalPositions}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  showFilters || hasActiveFilters
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white/50 text-gray-700 hover:bg-white/80"
                }`}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {
                      Object.values(filters).filter(
                        (value) =>
                          value !== "all" && value !== "newest" && value !== ""
                      ).length
                    }
                  </span>
                )}
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Status Filter */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value as string)
                      }
                      label="Status"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Approval Filter */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Approval</InputLabel>
                    <Select
                      value={filters.approval}
                      onChange={(e) =>
                        handleFilterChange("approval", e.target.value as string)
                      }
                      label="Approval"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Job Role Filter */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Job Role</InputLabel>
                    <Select
                      value={filters.jobRole}
                      onChange={(e) =>
                        handleFilterChange("jobRole", e.target.value as string)
                      }
                      label="Job Role"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value="full_time">Full Time</MenuItem>
                      <MenuItem value="part_time">Part Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="freelance">Freelance</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Job Type Filter */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Work Type</InputLabel>
                    <Select
                      value={filters.jobType}
                      onChange={(e) =>
                        handleFilterChange("jobType", e.target.value as string)
                      }
                      label="Work Type"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="remote">Remote</MenuItem>
                      <MenuItem value="onsite">On-site</MenuItem>
                      <MenuItem value="hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Date Range Filter */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Posted</InputLabel>
                    <Select
                      value={filters.dateRange}
                      onChange={(e) =>
                        handleFilterChange(
                          "dateRange",
                          e.target.value as string
                        )
                      }
                      label="Posted"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="week">Past Week</MenuItem>
                      <MenuItem value="month">Past Month</MenuItem>
                      <MenuItem value="quarter">Past 3 Months</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Sort Filter */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value as string)
                      }
                      label="Sort By"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                      <MenuItem value="title">Title A-Z</MenuItem>
                      <MenuItem value="expires">Expires Soon</MenuItem>
                      <MenuItem value="positions">Most Positions</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Jobs List */}
          <div className="space-y-6">
            {filteredJobs.length === 0 ? (
              <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-12 shadow-lg border border-white/20 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {jobs.length === 0
                    ? "No jobs posted yet"
                    : "No jobs match your filters"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {jobs.length === 0
                    ? "Start by posting your first job to attract candidates."
                    : "Try adjusting your search criteria or filters."}
                </p>
                {jobs.length === 0 ? (
                  <button
                    onClick={handleCreateJob}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Job Posting
                  </button>
                ) : (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 py-3 bg-white/80 text-gray-700 rounded-xl font-medium hover:bg-white transition-all duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleJobClick(job._id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      {/* Job Header */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
                              job.isActive
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {job.isActive ? (
                              <>
                                <div className="h-2 w-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                                Active
                              </>
                            ) : (
                              <>
                                <div className="h-2 w-2 bg-gray-400 rounded-full mr-1"></div>
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span>{job.jobRole.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>
                            {job.numberOfPositions} Position
                            {job.numberOfPositions > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            Expires {new Date(job.expires).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Job Description */}
                      <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Posted Date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Posted on{" "}
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3">
                      <button
                        onClick={(e) => handleViewApplications(e, job._id)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg flex-1 lg:flex-none cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Applications
                      </button>
                      <button
                        onClick={(e) => handleEditJob(e, job._id)}
                        className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 flex-1 lg:flex-none cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={(e) =>
                          toggleJobStatus(e, job._id, job.isActive)
                        }
                        className={`flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-all duration-200 flex-1 lg:flex-none cursor-pointer ${
                          job.isActive
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {job.isActive ? (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results Summary */}
          {filteredJobs.length > 0 && (
            <div className="text-center text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
          )}
        </div>

        {/* Job Type Selection Modal */}
        <Dialog
          open={showJobTypeModal}
          onClose={() => setShowJobTypeModal(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Choose Job Posting Type
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Select the type of job posting that best fits your needs
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pb: 3 }}>
            <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
              {/* Normal Posting Card */}
              <Card
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "2px solid transparent",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleJobTypeSelection("normal")}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box sx={{ mb: 2 }}>
                    <FileText size={48} color="#3b82f6" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Standard Job Posting
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 2 }}
                  >
                    Comprehensive job posting designed specifically for
                    recruiting licensed insurance professionals
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mb: 3,
                    }}
                  >
                    <Chip
                      label="Licensed Candidate Search"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label="Detailed Requirements Form"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label="Insurance-Specific Fields"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", mb: 2 }}
                  >
                    ✓ Work schedule & office requirements
                    <br />
                    ✓ Pay structure & benefits
                    <br />
                    ✓ License requirements & qualifications
                    <br />✓ Role-specific details
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 1 }}
                    endIcon={<ArrowRight size={16} />}
                  >
                    Choose Standard
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Posting Card */}
              <Card
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "2px solid transparent",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleJobTypeSelection("enhanced")}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box sx={{ mb: 2 }}>
                    <Sparkles size={48} color="#fbbf24" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Enhanced Job Posting
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}
                  >
                    Modern, guided job posting experience with templates and
                    step-by-step workflow
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mb: 3,
                    }}
                  >
                    <Chip
                      label="Pre-built Templates"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                      }}
                    />
                    <Chip
                      label="5-Step Guided Process"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                      }}
                    />
                    <Chip
                      label="Live Preview & Validation"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      display: "block",
                      mb: 2,
                    }}
                  >
                    ✓ Insurance agent templates
                    <br />
                    ✓ Progressive form completion
                    <br />
                    ✓ Real-time validation
                    <br />✓ Modern, intuitive interface
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                    }}
                    endIcon={<ArrowRight size={16} />}
                  >
                    Choose Enhanced
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setShowJobTypeModal(false)}
              variant="outlined"
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Job Details Modal */}
        {selectedJobId && (
          <JobDetailsModal
            jobId={selectedJobId}
            isOpen={!!selectedJobId}
            onClose={handleCloseModal}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
