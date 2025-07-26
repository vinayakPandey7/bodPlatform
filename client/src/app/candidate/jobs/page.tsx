"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import JobDetailsModal from "@/components/JobDetailsModal";
import { useJobsForCandidates, useApplyToJob } from "@/lib/hooks/job.hooks";
import { useSaveJob, useUnsaveJob } from "@/lib/hooks/candidate.hooks";
import { useCurrentUser } from "@/lib/hooks/auth.hooks";
import { toast } from "sonner";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

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
  expires?: string;
  startDate?: string;
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
  employer: {
    companyName: string;
    city: string;
    state: string;
  };
}

export default function CandidateJobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CandidateJobsPageContent />
    </Suspense>
  );
}

function CandidateJobsPageContent() {
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
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // Helper function to check if user has already applied to a job
  const hasAppliedToJob = (jobId: string) => {
    if (!currentUser?.applications) return false;
    return currentUser.applications.some(
      (app: any) => app.job === jobId || app.job._id === jobId
    );
  };

  // Auto-populate zip code if user is logged in and has zip code
  useEffect(() => {
    if (currentUser?.zipCode && !filters.zipCode) {
      setFilters((prev) => ({
        ...prev,
        zipCode: currentUser.zipCode,
      }));
    }
  }, [currentUser, filters.zipCode]);

  // Listen for location changes from LocationDetector
  useEffect(() => {
    const handleLocationChange = () => {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          if (location.zipCode && location.zipCode !== filters.zipCode) {
            setFilters((prev) => ({
              ...prev,
              zipCode: location.zipCode,
            }));
            setZipCodeError("");
          }
        } catch (e) {
          console.error("Error parsing saved location:", e);
        }
      }
    };

    // Listen for storage changes (from other tabs/components)
    window.addEventListener("storage", handleLocationChange);

    // Check on component mount
    handleLocationChange();

    return () => {
      window.removeEventListener("storage", handleLocationChange);
    };
  }, [filters.zipCode]);

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
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: unknown } }
  ) => {
    const { name, value } = e.target;

    if (name === "zipCode") {
      // Validate zip code format
      if (value && !/^\d{0,5}$/.test(value as string)) {
        return; // Don't update if not valid digits
      }
      if (
        value &&
        (value as string).length === 5 &&
        !/^\d{5}$/.test(value as string)
      ) {
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
        toast.success("Job saved successfully");
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
        toast.success("Job removed from saved list");
      },
      onError: (error) => {
        console.error("Failed to unsave job:", error);
      },
    });
  };

  const handleApplyToJob = (jobId: string) => {
    setApplyingJobId(jobId);
    applyToJob(
      { jobId, data: {} },
      {
        onSuccess: () => {
          toast.success("Application submitted successfully!");
          setApplyingJobId(null);
        },
        onError: (error) => {
          console.error("Failed to apply to job:", error);
          setApplyingJobId(null);
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
                {filters.zipCode
                  ? `Showing jobs within 4 miles of ${filters.zipCode}`
                  : "Set your location in the header to find jobs near you"}
              </p>
            </div>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <TextField
                label="Your Zip Code *"
                name="zipCode"
                value={filters.zipCode}
                onChange={(e) =>
                  handleFilterChange(
                    e as
                      | React.ChangeEvent<HTMLInputElement>
                      | { target: { name: string; value: unknown } }
                  )
                }
                placeholder="e.g., 90210"
                inputProps={{ maxLength: 5 }}
                error={!!zipCodeError}
                helperText={zipCodeError}
                fullWidth
                size="small"
              />

              <TextField
                label="Search Keywords"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Job title, skills, company..."
                fullWidth
                size="small"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                  label="Job Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="freelance">Freelance</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Experience Level</InputLabel>
                <Select
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  label="Experience Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="0-1">0-1 years (Entry Level)</MenuItem>
                  <MenuItem value="1-3">1-3 years (Junior)</MenuItem>
                  <MenuItem value="3-5">3-5 years (Mid Level)</MenuItem>
                  <MenuItem value="5-8">5-8 years (Senior)</MenuItem>
                  <MenuItem value="8-12">8-12 years (Lead)</MenuItem>
                  <MenuItem value="12+">
                    12+ years (Principal/Director)
                  </MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="flex justify-between items-center">
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
              <button
                onClick={handleSearch}
                disabled={!filters.zipCode || isLoading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Searching..." : "Search Jobs"}
              </button>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        {hasAppliedToJob(job._id) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Applied
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">
                        {job?.employer?.companyName}
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

                  {/* Enhanced Licensed Candidate Preview */}
                  {((job.candidateType && job.candidateType.length > 0) ||
                    job.workSchedule ||
                    job.payStructureType) && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">
                        🎯 Licensed Candidate Opportunity
                      </h4>
                      <div className="space-y-1 text-xs text-blue-700">
                        {job.candidateType && job.candidateType.length > 0 && (
                          <p>
                            <span className="font-medium">Looking for:</span>{" "}
                            {job.candidateType
                              .slice(0, 2)
                              .map((type: string) =>
                                type
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())
                              )
                              .join(", ")}
                            {job.candidateType.length > 2 &&
                              ` +${job.candidateType.length - 2} more`}
                          </p>
                        )}
                        {job.workSchedule && (
                          <p>
                            <span className="font-medium">Schedule:</span>{" "}
                            {job.workSchedule.replace("_", " ")}
                            {job.partTimeWorkDays &&
                              job.partTimeWorkDays.length > 0 &&
                              job.workSchedule === "part_time" &&
                              ` (${job.partTimeWorkDays
                                .slice(0, 3)
                                .join(", ")}${
                                job.partTimeWorkDays.length > 3 ? "..." : ""
                              })`}
                          </p>
                        )}
                        {job.payStructureType && (
                          <p>
                            <span className="font-medium">Pay:</span>{" "}
                            {job.payStructureType.replace(/_/g, " ")}
                            {job.hourlyPay && ` - ${job.hourlyPay}`}
                          </p>
                        )}
                        {job.freeParking && (
                          <p>
                            <span className="font-medium">Parking:</span>{" "}
                            {job.freeParking === "yes"
                              ? "Free"
                              : job.freeParking === "no"
                              ? "Not available"
                              : "Paid available"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

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
                        disabled={
                          hasAppliedToJob(job._id) || applyingJobId === job._id
                        }
                        className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasAppliedToJob(job._id)
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {hasAppliedToJob(job._id)
                          ? "Applied"
                          : applyingJobId === job._id
                          ? "Applying..."
                          : "Quick Apply"}
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
