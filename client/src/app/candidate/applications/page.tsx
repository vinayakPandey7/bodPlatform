"use client";
import { useState, useMemo, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCandidateApplications } from "@/lib/hooks/candidate.hooks";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
} from "@mui/material";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Building,
  DollarSign,
  Filter,
  Search,
  ArrowUpRight,
  Briefcase,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

// Memoized Stats Card Component
const StatsCard = memo(({ icon: Icon, title, value, color, filterValue, onCardClick, isActive }: {
  icon: any;
  title: string;
  value: number;
  color: string;
  filterValue: string;
  onCardClick: (filterValue: string) => void;
  isActive: boolean;
}) => (
  <div 
    className={`bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border transition-all duration-300 ease-in-out group cursor-pointer ${
      isActive 
        ? 'border-blue-300 shadow-lg scale-105 bg-gradient-to-br from-blue-50 to-white' 
        : 'border-gray-100 hover:shadow-lg hover:scale-105'
    }`}
    onClick={() => onCardClick(filterValue)}
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-xl ${color} bg-opacity-15 group-hover:bg-opacity-25 transition-all duration-300 group-hover:scale-110 ${
        isActive ? 'bg-opacity-25' : ''
      }`}>
        <Icon className={`h-6 w-6 ${color} group-hover:scale-110 transition-transform duration-300`} />
      </div>
      <div className="ml-4">
        <p className={`text-sm font-medium transition-colors duration-300 ${
          isActive ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-700'
        }`}>{title}</p>
        <p className={`text-2xl font-bold transition-colors duration-300 ${
          isActive ? 'text-blue-900' : 'text-gray-900 group-hover:text-gray-800'
        }`}>{value}</p>
      </div>
    </div>
  </div>
));

StatsCard.displayName = 'StatsCard';

// Memoized Application Card Component
const ApplicationCard = memo(({ application, onViewCompany }: {
  application: any;
  onViewCompany: (companyName: string) => void;
}) => {
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "under_review":
        return <Eye className="h-4 w-4" />;
      case "interview_scheduled":
        return <Calendar className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  const handleViewCompany = useCallback(() => {
    onViewCompany(application.companyName);
  }, [application.companyName, onViewCompany]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {application.jobTitle}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <button
                  onClick={handleViewCompany}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                >
                  <Building className="h-4 w-4" />
                  <span>{application.companyName}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{application.location}</span>
                </span>
                {application.salary && (
                  <span className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{application.salary}</span>
                  </span>
                )}
              </div>
            </div>
            <span
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                application.status
              )}`}
            >
              {getStatusIcon(application.status)}
              <span className="capitalize">
                {application.status.replace("_", " ")}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicationCard.displayName = 'ApplicationCard';

// Stable Loading Layout Component
const ApplicationsLoadingLayout = memo(() => (
  <div className="max-w-7xl mx-auto space-y-8">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="mt-4 sm:mt-0 flex space-x-3">
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-200 animate-pulse">
              <div className="h-6 w-6"></div>
            </div>
            <div className="ml-4">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Filter Bar Skeleton */}
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>

    {/* Applications List Skeleton */}
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

ApplicationsLoadingLayout.displayName = 'ApplicationsLoadingLayout';

function CandidateApplicationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Use real API data with optimized configuration
  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useCandidateApplications();

  // Memoize applications data processing
  const { applications, stats, filteredApplications } = useMemo(() => {
    const apps = applicationsData?.applications || [];
    
    // Calculate stats from real data
    const totalApplications = apps.length;
    const pendingCount = apps.filter((app: any) => app.status === "pending").length;
    const underReviewCount = apps.filter((app: any) => app.status === "under_review").length;
    const interviewCount = apps.filter((app: any) => app.status === "interview_scheduled").length;
    const acceptedCount = apps.filter((app: any) => app.status === "accepted").length;
    const rejectedCount = apps.filter((app: any) => app.status === "rejected").length;

    // Filter applications based on search and status
    const filtered = apps.filter((app: any) => {
      const matchesSearch =
        app?.jobTitle?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        app?.companyName?.toLowerCase()?.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return {
      applications: apps,
      stats: {
        totalApplications,
        pendingCount,
        underReviewCount,
        interviewCount,
        acceptedCount,
        rejectedCount,
      },
      filteredApplications: filtered,
    };
  }, [applicationsData?.applications, searchTerm, statusFilter]);

  // Memoized handlers
  const handleViewCompany = useCallback((companyName: string) => {
    router.push(`/candidate/jobs?search=${encodeURIComponent(companyName)}`);
  }, [router]);

  const handleSearchJobs = useCallback(() => {
    router.push("/candidate/jobs");
  }, [router]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e: any) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleCardClick = useCallback((filterValue: string) => {
    setStatusFilter(filterValue);
  }, []);

  // Show stable loading layout that matches final content
  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <DashboardLayout>
          <ApplicationsLoadingLayout />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <DashboardLayout>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load applications
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error loading your applications.
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Applications
              </h1>
              <p className="mt-1 text-gray-600">
                Track and manage your job applications
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleSearchJobs}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Find New Jobs
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <StatsCard
              icon={Briefcase}
              title="Total"
              value={stats.totalApplications}
              color="text-blue-600"
              filterValue="all"
              onCardClick={handleCardClick}
              isActive={statusFilter === "all"}
            />
            <StatsCard
              icon={Clock}
              title="Pending"
              value={stats.pendingCount}
              color="text-yellow-600"
              filterValue="pending"
              onCardClick={handleCardClick}
              isActive={statusFilter === "pending"}
            />
            <StatsCard
              icon={Eye}
              title="Under Review"
              value={stats.underReviewCount}
              color="text-blue-600"
              filterValue="under_review"
              onCardClick={handleCardClick}
              isActive={statusFilter === "under_review"}
            />
            <StatsCard
              icon={Calendar}
              title="Interview"
              value={stats.interviewCount}
              color="text-purple-600"
              filterValue="interview_scheduled"
              onCardClick={handleCardClick}
              isActive={statusFilter === "interview_scheduled"}
            />
            <StatsCard
              icon={CheckCircle}
              title="Accepted"
              value={stats.acceptedCount}
              color="text-green-600"
              filterValue="accepted"
              onCardClick={handleCardClick}
              isActive={statusFilter === "accepted"}
            />
            <StatsCard
              icon={XCircle}
              title="Rejected"
              value={stats.rejectedCount}
              color="text-red-600"
              filterValue="rejected"
              onCardClick={handleCardClick}
              isActive={statusFilter === "rejected"}
            />
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <TextField
                  fullWidth
                  placeholder="Search by job title or company..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search className="h-4 w-4 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '8px 12px',
                    },
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <FormControl sx={{ minWidth: 150 }}>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    displayEmpty
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '& .MuiSelect-select': {
                        padding: '8px 12px',
                      },
                    }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="interview_scheduled">Interview</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application: any) => (
                <ApplicationCard
                  key={application._id || application.id}
                  application={application}
                  onViewCompany={handleViewCompany}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Start applying to jobs to see your applications here."}
                </p>
                <button
                  onClick={handleSearchJobs}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default memo(CandidateApplicationsPage);
