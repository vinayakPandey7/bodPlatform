"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCandidateSavedJobs, useUnsaveJob } from "@/lib/hooks/candidate.hooks";
import { useApplyToJob } from "@/lib/hooks/job.hooks";
import { toast } from "sonner";
import {
  Heart,
  MapPin,
  Building,
  DollarSign,
  Clock,
  Eye,
  Share2,
  Trash2,
  Search,
  Filter,
  Briefcase,
  Calendar,
  BookmarkPlus,
  ArrowUpRight,
  Target,
  TrendingUp,
  Star,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Send,
  HeartOff,
} from "lucide-react";

export default function CandidateSavedJobsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("saved_date");

  // Use real API data instead of mock data
  const { data: savedJobsData, isLoading, error, refetch } = useCandidateSavedJobs();
  const { mutate: unsaveJob, isPending: isUnsaving } = useUnsaveJob();
  const { mutate: applyToJob, isPending: isApplying } = useApplyToJob();

  const savedJobs = savedJobsData?.savedJobs || [];

  // Filter and sort saved jobs
  const filteredAndSortedJobs = savedJobs
    .filter((job: any) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.skills?.some((skill: string) => 
                             skill.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "match_score":
          return b.matchScore - a.matchScore;
        case "posted_date":
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case "salary":
          return (b.salaryMax || 0) - (a.salaryMax || 0);
        case "saved_date":
        default:
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      }
    });

  // Calculate stats
  const totalSaved = savedJobs.length;
  const averageMatchScore = savedJobs.length > 0 
    ? Math.round(savedJobs.reduce((sum: number, job: any) => sum + (job.matchScore || 0), 0) / savedJobs.length)
    : 0;
  const highPriorityCount = savedJobs.filter((job: any) => job.priority === "high").length;
  const unappliedCount = savedJobs.filter((job: any) => !job.applied).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  // Handler functions
  const handleUnsaveJob = (jobId: string) => {
    unsaveJob(jobId, {
      onSuccess: () => {
        toast.success("Job removed from saved list");
      },
      onError: (error) => {
        console.error("Failed to unsave job:", error);
      }
    });
  };

  const handleApplyToJob = (jobId: string) => {
    applyToJob({ jobId, data: {} }, {
      onSuccess: () => {
        // Refresh the saved jobs to update the applied status
        refetch();
        toast.success("Application submitted successfully!");
      },
      onError: (error) => {
        console.error("Failed to apply to job:", error);
        // You could add an error toast notification here
      }
    });
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/candidate/jobs?jobId=${jobId}`);
  };

  const handleSearchJobs = () => {
    router.push("/candidate/jobs");
  };

  const handleViewCompany = (companyName: string) => {
    router.push(`/candidate/jobs?search=${encodeURIComponent(companyName)}`);
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load saved jobs</h3>
            <p className="text-gray-600 mb-4">There was an error loading your saved jobs.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
              <p className="mt-1 text-gray-600">Manage your bookmarked job opportunities</p>
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
                Find More Jobs
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSaved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageMatchScore}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">{highPriorityCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Send className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready to Apply</p>
                  <p className="text-2xl font-bold text-gray-900">{unappliedCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Jobs</label>
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, company, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="saved_date">Date Saved</option>
                  <option value="match_score">Match Score</option>
                  <option value="posted_date">Date Posted</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-6">
            {filteredAndSortedJobs.length > 0 ? (
              filteredAndSortedJobs.map((job: any) => (
                <div
                  key={job._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            {job.urgent && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <button
                              onClick={() => handleViewCompany(job.company)}
                              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                            >
                              <Building className="h-4 w-4" />
                              <span>{job.company}</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{job.workMode}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              job.priority
                            )}`}
                          >
                            {job.priority} priority
                          </span>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getMatchScoreColor(job.matchScore)}`}>
                              {job.matchScore}%
                            </div>
                            <div className="text-xs text-gray-500">match</div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                      {/* Job Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Salary</h4>
                          <p className="text-sm text-gray-600">
                            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Job Type</h4>
                          <p className="text-sm text-gray-600 capitalize">{job.jobType}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Posted</h4>
                          <p className="text-sm text-gray-600">{formatDate(job.postedDate)}</p>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 6).map((skill: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 6 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{job.skills.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Saved: {formatDate(job.savedDate)}</span>
                          {job.applied && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Already Applied
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewJob(job._id)}
                            className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                          
                          {!job.applied && (
                            <button
                              onClick={() => handleApplyToJob(job._id)}
                              disabled={isApplying}
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {isApplying ? 'Applying...' : 'Quick Apply'}
                            </button>
                          )}

                          <button
                            onClick={() => handleUnsaveJob(job._id)}
                            disabled={isUnsaving}
                            className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            <HeartOff className="h-4 w-4 mr-1" />
                            {isUnsaving ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || priorityFilter !== "all" 
                    ? "No saved jobs match your search" 
                    : "No saved jobs yet"
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || priorityFilter !== "all"
                    ? "Try adjusting your search criteria to find saved jobs."
                    : "Start saving jobs you're interested in to track them here."
                  }
                </p>
                <button
                  onClick={handleSearchJobs}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Browse Jobs to Save
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 