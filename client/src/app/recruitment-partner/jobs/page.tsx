"use client";
import { useEffect, useState } from "react";
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
  employer: {
    _id: string;
    ownerName: string;
    companyName: string;
  };
  createdAt: string;
}

export default function RecruitmentPartnerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [payStructureFilter, setPayStructureFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs/active");
      setJobs(response.data.jobs || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesJobType = jobTypeFilter === "all" || job.jobType === jobTypeFilter;
    const matchesPayStructure = payStructureFilter === "all" || job.payStructure === payStructureFilter;

    return matchesSearch && matchesLocation && matchesJobType && matchesPayStructure;
  });

  const handleApplyToJob = (jobId: string) => {
    // This would open a modal or redirect to application form
    alert(`Apply to job ${jobId} - This feature will be implemented`);
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
            <p className="mt-1 text-gray-600">
              Find opportunities to place your candidates
            </p>
          </div>

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
                  {searchTerm || locationFilter || jobTypeFilter !== "all" || payStructureFilter !== "all"
                    ? "Try adjusting your search filters."
                    : "No active job postings available at the moment."}
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <Chip 
                          label="Active" 
                          size="small"
                          sx={{
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                          }}
                        />
                        <Chip 
                          label={`${job.numberOfPositions} Position${job.numberOfPositions > 1 ? "s" : ""}`}
                          size="small"
                          sx={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                          }}
                        />
                      </div>

                      <div className="mb-4">
                        <p className="text-lg font-medium text-gray-800">
                          {job.employer.companyName}
                        </p>
                        <p className="text-gray-600">{job.location}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Type:</span>{" "}
                          {job.jobRole.replace("_", " ")}
                        </div>
                        <div>
                          <span className="font-medium">Work Style:</span>{" "}
                          {job.jobType.replace("_", " ")}
                        </div>
                        <div>
                          <span className="font-medium">Pay:</span>{" "}
                          {job.payStructure}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span>{" "}
                          {new Date(job.expires).toLocaleDateString()}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      <div className="text-xs text-gray-500">
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="ml-6">
                      <Button
                        onClick={() => handleApplyToJob(job._id)}
                        variant="contained"
                        sx={{
                          backgroundColor: '#4f46e5',
                          '&:hover': {
                            backgroundColor: '#4338ca',
                          },
                          borderRadius: '6px',
                          padding: '12px 24px',
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
