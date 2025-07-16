"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import JobDetailsModal from "@/components/JobDetailsModal";
import { useJobsForCandidates, useApplyToJob } from "@/lib/hooks/job.hooks";
import { useSaveJob, useUnsaveJob } from "@/lib/hooks/candidate.hooks";
import { useCurrentUser } from "@/lib/hooks/auth.hooks";

interface JobSearchFilters {
  zipCode: string;
  search: string;
  jobType: string;
  experience: string;
  page: number;
  limit: number;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  location: string;
  zipCode: string;
  city: string;
  state: string;
  jobType: string;
  workMode: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  benefits: string[];
  department: string;
  urgency: string;
  createdAt: string;
  distance?: number;
  employer: {
    companyName: string;
    city: string;
    state: string;
  };
}

export default function CandidateJobsPage() {
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.user;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<JobSearchFilters>({
    zipCode: "",
    search: "",
    jobType: "",
    experience: "",
    page: 1,
    limit: 20,
  });

  // Add hooks for job actions
  const { mutate: saveJob, isPending: isSaving } = useSaveJob();
  const { mutate: unsaveJob, isPending: isUnsaving } = useUnsaveJob();
  const { mutate: applyToJob, isPending: isApplying } = useApplyToJob();

  const [zipCodeError, setZipCodeError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-populate zip code if user is logged in and has zip code
  useEffect(() => {
    if (currentUser?.zipCode && !filters.zipCode) {
      setFilters((prev) => ({
        ...prev,
        zipCode: currentUser.zipCode,
      }));
    }
  }, [currentUser, filters.zipCode]);

  // Handle jobId from URL parameters
  useEffect(() => {
    const jobIdFromUrl = searchParams.get("jobId");
    const searchFromUrl = searchParams.get("search");

    if (jobIdFromUrl) {
      setSelectedJobId(jobIdFromUrl);
      setIsModalOpen(true);
    }

    if (searchFromUrl && !filters.search) {
      setFilters((prev) => ({
        ...prev,
        search: searchFromUrl,
      }));
    }
  }, [searchParams, filters.search]);

  const {
    data: jobsData,
    isLoading,
    isError,
    error,
  } = useJobsForCandidates(filters.zipCode ? filters : undefined);

  const jobs = jobsData?.jobs || [];
  const pagination = jobsData?.pagination;
  const searchCriteria = jobsData?.searchCriteria;

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "zipCode") {
      // Validate zip code format
      if (value && !/^\d{0,5}$/.test(value)) {
        return; // Don't update if not valid digits
      }
      if (value && value.length === 5 && !/^\d{5}$/.test(value)) {
        setZipCodeError("Invalid zip code format");
      } else {
        setZipCodeError("");
      }
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = () => {
    if (!filters.zipCode) {
      setZipCodeError("Zip code is required to search for jobs");
      return;
    }
    if (filters.zipCode.length !== 5) {
      setZipCodeError("Zip code must be 5 digits");
      return;
    }
    setZipCodeError("");
    // The query will automatically refetch when filters change
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return "Salary not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    if (min) return `$${min.toLocaleString()}+ ${currency}`;
    if (max) return `Up to $${max.toLocaleString()} ${currency}`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "very_urgent":
        return "bg-red-100 text-red-800";
      case "urgent":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  // Handler functions for job actions
  const handleViewJobDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);

    // Clear jobId from URL parameters when modal is closed
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete("jobId");
    const newUrl =
      currentUrl.pathname +
      (currentUrl.searchParams.toString()
        ? "?" + currentUrl.searchParams.toString()
        : "");
    router.replace(newUrl, { scroll: false });
  };

  const handleSaveJob = (jobId: string) => {
    saveJob(jobId, {
      onSuccess: () => {
        console.log("Job saved successfully");
        // You could add a toast notification here
      },
      onError: (error) => {
        console.error("Failed to save job:", error);
        // You could add an error toast notification here
      },
    });
  };

  const handleUnsaveJob = (jobId: string) => {
    unsaveJob(jobId, {
      onSuccess: () => {
        console.log("Job unsaved successfully");
      },
      onError: (error) => {
        console.error("Failed to unsave job:", error);
      },
    });
  };

  const handleApplyToJob = (jobId: string) => {
    applyToJob(
      { jobId, data: {} },
      {
        onSuccess: () => {
          console.log("Applied to job successfully");
          // You could add a success toast notification here
        },
        onError: (error) => {
          console.error("Failed to apply to job:", error);
          // You could add an error toast notification here
        },
      }
    );
  };

  return (
    <ProtectedRoute allowedRoles={["candidate", "recruitment_partner"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Find Jobs Near You
              </h1>
              <p className="mt-1 text-gray-600">
                Search for jobs within 4 miles of your location
              </p>
            </div>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Zip Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={filters.zipCode}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 90210"
                  maxLength={5}
                />
                {zipCodeError && (
                  <p className="text-red-600 text-sm mt-1">{zipCodeError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search Keywords
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Job title, skills, company..."
                />
              </div>

              <div>
                <label
                  htmlFor="jobType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Experience Level
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Levels</option>
                  <option value="0-1">0-1 years (Entry Level)</option>
                  <option value="1-3">1-3 years (Junior)</option>
                  <option value="3-5">3-5 years (Mid Level)</option>
                  <option value="5-8">5-8 years (Senior)</option>
                  <option value="8-12">8-12 years (Lead)</option>
                  <option value="12+">12+ years (Principal/Director)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleSearch}
                disabled={!filters.zipCode || isLoading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Searching..." : "Search Jobs"}
              </button>

              {searchCriteria && (
                <div className="text-sm text-gray-600">
                  {searchCriteria.searchRadius && (
                    <span>
                      Within {searchCriteria.searchRadius} of{" "}
                      {searchCriteria.zipCode}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error?.message || "Failed to fetch jobs"}
            </div>
          )}

          {jobsData?.message && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              {jobsData.message}
            </div>
          )}

          {/* Job Results */}
          {jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job: Job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-gray-600">
                        {job.employer.companyName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {job.city}, {job.state} {job.zipCode}
                        {job.distance && (
                          <span className="ml-2 text-indigo-600">
                            ({job.distance} miles away)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                          job.urgency
                        )}`}
                      >
                        {job.urgency.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {job.jobType.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {job.workMode.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Experience Required
                      </h4>
                      <p className="text-sm text-gray-600">
                        {job.experience} years
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Salary
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatSalary(
                          job.salaryMin,
                          job.salaryMax,
                          job.currency
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Department
                      </h4>
                      <p className="text-sm text-gray-600">
                        {job.department || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {job.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs"
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

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveJob(job._id)}
                        disabled={isSaving}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-1"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{isSaving ? "Saving..." : "Save"}</span>
                      </button>
                      <button
                        onClick={() => handleApplyToJob(job._id)}
                        disabled={isApplying}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isApplying ? "Applying..." : "Quick Apply"}
                      </button>
                      <button
                        onClick={() => handleViewJobDetails(job._id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>

              <span className="text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* No results message */}
          {filters.zipCode && !isLoading && jobs.length === 0 && !isError && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or expanding your search
                radius.
              </p>
            </div>
          )}

          {/* Initial state message */}
          {!filters.zipCode && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Enter your zip code to find jobs
              </h3>
              <p className="text-gray-600">
                We'll show you all available jobs within 4 miles of your
                location.
              </p>
            </div>
          )}
        </div>

        {/* Job Details Modal */}
        {selectedJobId && (
          <JobDetailsModal
            jobId={selectedJobId}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
