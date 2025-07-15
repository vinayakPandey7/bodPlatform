"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCandidateApplications } from "@/lib/hooks/candidate.hooks";
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

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Use real API data instead of mock data
  const { data: applicationsData, isLoading, error, refetch } = useCandidateApplications();
  const applications = applicationsData?.applications || [];

  // Filter applications based on search and status
  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from real data
  const totalApplications = applications.length;
  const pendingCount = applications.filter((app: any) => app.status === "pending").length;
  const underReviewCount = applications.filter((app: any) => app.status === "under_review").length;
  const interviewCount = applications.filter((app: any) => app.status === "interview_scheduled").length;
  const acceptedCount = applications.filter((app: any) => app.status === "accepted").length;
  const rejectedCount = applications.filter((app: any) => app.status === "rejected").length;
  
  const successRate = totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "under_review":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "interview_scheduled":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Navigation functions
  const handleViewJob = (jobId: string) => {
    router.push(`/candidate/jobs?jobId=${jobId}`);
  };

  const handleViewCompany = (companyName: string) => {
    router.push(`/candidate/jobs?search=${encodeURIComponent(companyName)}`);
  };

  const handleSearchJobs = () => {
    router.push("/candidate/jobs");
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load applications</h3>
            <p className="text-gray-600 mb-4">There was an error loading your applications.</p>
            <button
              onClick={() => refetch()}
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
              <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              <p className="mt-1 text-gray-600">Track and manage your job applications</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => refetch()}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{interviewCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-gray-900">{underReviewCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search applications by job title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application: any) => (
                <div
                  key={application._id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(
                    application.priority
                  )} border-r border-t border-b border-gray-100 p-6 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.jobTitle}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <button
                              onClick={() => handleViewCompany(application.companyName)}
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
                        <div className="flex items-center space-x-3">
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

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Applied: {formatDate(application.appliedDate)}</span>
                          <span className="capitalize">{application.jobType}</span>
                          {application.interviewDate && (
                            <span className="flex items-center space-x-1 text-purple-600">
                              <Calendar className="h-4 w-4" />
                              <span>Interview: {formatDate(application.interviewDate)}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {application.jobId && (
                            <button
                              onClick={() => handleViewJob(application.jobId)}
                              className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Job
                            </button>
                          )}
                          <button
                            onClick={() => handleViewCompany(application.companyName)}
                            className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
                          >
                            <Building className="h-4 w-4 mr-1" />
                            Company
                          </button>
                        </div>
                      </div>

                      {/* Status-specific alerts */}
                      {application.status === "interview_scheduled" && (
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-800">
                              Interview Scheduled
                            </span>
                          </div>
                          <p className="text-sm text-purple-700 mt-1">
                            Prepare for your interview on {application.interviewDate && formatDate(application.interviewDate)}
                          </p>
                        </div>
                      )}

                      {application.status === "accepted" && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">
                              Congratulations! Offer Received
                            </span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Review the offer details and respond accordingly.
                          </p>
                        </div>
                      )}

                      {application.notes && (
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center mb-1">
                            <MessageSquare className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Notes</span>
                          </div>
                          <p className="text-sm text-gray-600">{application.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "all" 
                    ? "No applications match your search" 
                    : "No applications yet"
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search criteria to find applications."
                    : "Start applying to jobs to track your applications here."
                  }
                </p>
                <button
                  onClick={handleSearchJobs}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Find Jobs to Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 