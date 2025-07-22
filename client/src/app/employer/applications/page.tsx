"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  resume: string;
  job: {
    _id: string;
    title: string;
    location: string;
  };
  createdAt: string;
}

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/employer/applications");
      setApplications(response.data.applications || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setError(error.response?.data?.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const updateCandidateStatus = async (
    candidateId: string,
    newStatus: string
  ) => {
    try {
      await api.put(`/employer/candidates/${candidateId}/status`, {
        status: newStatus,
      });
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error("Error updating candidate status:", error);
    }
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
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

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
              <p className="mt-1 text-gray-600">
                Review and manage candidate applications for your jobs
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="shortlist">Shortlisted</option>
                <option value="assessment">Assessment</option>
                <option value="phone_interview">Phone Interview</option>
                <option value="in_person_interview">In-Person Interview</option>
                <option value="background_check">Background Check</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                <option value="stand_by">Stand By</option>
                <option value="no_response">No Response</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredApplications?.length === 0 ? (
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
                    ? "No candidates have applied to your jobs yet."
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
                        Job Position
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
                    {filteredApplications?.map((application) => (
                      <tr key={application?._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application?.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application?.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {application?.job?.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application?.job?.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              application?.status
                            )}`}
                          >
                            {application?.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            application?.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <select
                              value={application?.status}
                              onChange={(e) =>
                                updateCandidateStatus(
                                  application?._id,
                                  e.target.value
                                )
                              }
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="shortlist">Shortlist</option>
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
                              <option value="selected">Selected</option>
                              <option value="rejected">Rejected</option>
                              <option value="stand_by">Stand By</option>
                              <option value="no_response">No Response</option>
                            </select>
                            {application?.resume && (
                              <a
                                href={
                                  application.resume.startsWith("http")
                                    ? application.resume
                                    : `https://docs.google.com/viewer?url=${encodeURIComponent(
                                        application.resume
                                      )}&embedded=true`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900 text-xs"
                              >
                                View Resume
                              </a>
                            )}
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
