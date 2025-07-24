"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import CandidateProfileModal from "@/components/CandidateProfileModal";
import api from "@/lib/api";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

interface Application {
  _id: string;
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: string;
  appliedAt: string;
  appliedAtRaw: string;
  coverLetter?: string;
  job: {
    _id: string;
    title: string;
    location: string;
  };
}

interface Job {
  _id: string;
  title: string;
  location: string;
  description: string;
  status: string;
}

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      fetchJobAndApplications();
    }
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    try {
      console.log(`Fetching applications for job ID: ${jobId}`);

      // Fetch job and applications in one call using the new endpoint
      const response = await api.get(`/employer/jobs/${jobId}/applications`);

      console.log("Job applications response:", response.data);

      setJob(response.data.job);
      setApplications(response.data.applications || []);

      console.log(
        `Found ${response.data.applications?.length || 0} applications`
      );
    } catch (error: any) {
      console.error("Error fetching job applications:", error);
      if (error.response?.status === 404) {
        setError(
          "Job not found or you don't have permission to view its applications"
        );
      } else {
        setError(
          error.response?.data?.message || "Failed to fetch job applications"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCandidateStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      // Get the application to find the candidate ID
      const application = applications.find((app) => app._id === applicationId);
      if (!application) {
        console.error("Application not found");
        return;
      }

      // Use the correct endpoint with both candidateId and applicationId
      await api.put(
        `/employer/candidates/${application.candidate._id}/applications/${applicationId}/status`,
        {
          status: newStatus,
        }
      );
      fetchJobAndApplications(); // Refresh the list
    } catch (error) {
      console.error("Error updating candidate status:", error);
    }
  };

  const openCandidateProfile = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setIsProfileModalOpen(true);
  };

  const closeCandidateProfile = () => {
    setSelectedCandidateId(null);
    setIsProfileModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      shortlist: "bg-blue-100 text-blue-800",
      assessment: "bg-yellow-100 text-yellow-800",
      phone_interview: "bg-purple-100 text-purple-800",
      in_person_interview: "bg-indigo-100 text-indigo-800",
      background_check: "bg-orange-100 text-orange-800",
      selected: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      stand_by: "bg-gray-100 text-gray-800",
      no_response: "bg-gray-100 text-gray-600",
      hired: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      reviewing: "bg-blue-100 text-blue-800",
      shortlisted: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  console.log("Filtered Applications:", filteredApplications);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["employer"]}>
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
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.back()}
                className="text-indigo-600 hover:text-indigo-900 text-sm mb-2 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Jobs
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Applications for: {job?.title}
              </h1>
              <p className="mt-1 text-gray-600">
                {job?.location} • Total Applications: {applications.length}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as string)}
                  label="Filter by Status"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="reviewing">Reviewing</MenuItem>
                  <MenuItem value="shortlisted">Shortlisted</MenuItem>
                  <MenuItem value="assessment">Assessment</MenuItem>
                  <MenuItem value="phone_interview">Phone Interview</MenuItem>
                  <MenuItem value="in_person_interview">In-Person Interview</MenuItem>
                  <MenuItem value="background_check">Background Check</MenuItem>
                  <MenuItem value="hired">Hired</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="withdrawn">Withdrawn</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {error ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error Loading Applications
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchJobAndApplications}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredApplications.length === 0 ? (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications found
                </h3>
                <p className="text-gray-600">
                  {statusFilter === "all"
                    ? "No candidates have applied to this job yet."
                    : `No applications with status "${statusFilter.replace(
                        "_",
                        " "
                      )}" found.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied Date
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplications.map((application) => (
                      <tr key={application._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {`${application?.candidate?.firstName} ${application?.candidate?.lastName}`}
                            </div>
                            {/* <div className="text-sm text-gray-500">
                              {application?.candidate?.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application?.candidate?.phone}
                            </div> */}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {application.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {application.appliedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                openCandidateProfile(application.candidate._id)
                              }
                              className="text-indigo-600 hover:text-indigo-900 text-xs px-2 py-1 border border-indigo-300 rounded hover:bg-indigo-50 transition-colors"
                            >
                              View Profile
                            </button>
                            <select
                              value={application.status}
                              onChange={(e) =>
                                updateCandidateStatus(
                                  application._id,
                                  e.target.value
                                )
                              }
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="assessment">Assessment</option>
                              <option value="phone_interview">
                                Phone Interview
                              </option>
                              <option value="in_person_interview">
                                In-Person Interview
                              </option>
                              <option value="background_check">
                                Background Check
                              </option>
                              <option value="hired">Hired</option>
                              <option value="rejected">Rejected</option>
                              <option value="withdrawn">Withdrawn</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Profile Modal */}
        {selectedCandidateId && (
          <CandidateProfileModal
            candidateId={selectedCandidateId}
            isOpen={isProfileModalOpen}
            onClose={closeCandidateProfile}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
