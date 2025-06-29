"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Application {
  _id: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    resume: string;
  };
  job: {
    _id: string;
    title: string;
    location: string;
    employer: {
      companyName: string;
    };
  };
  submittedAt: string;
}

export default function RecruitmentPartnerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Get candidates submitted by this recruitment partner
      const response = await api.get("/admin/candidates");
      const candidates = response.data.candidates || [];

      // Transform candidates into applications format
      const transformedApplications = candidates.map((candidate: any) => ({
        _id: candidate._id,
        candidate: {
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          status: candidate.status,
          resume: candidate.resume,
        },
        job: candidate.job,
        submittedAt: candidate.createdAt,
      }));

      setApplications(transformedApplications);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setError("Failed to fetch applications");
    } finally {
      setLoading(false);
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
    (app) => statusFilter === "all" || app.candidate.status === statusFilter
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Applications
              </h1>
              <p className="mt-1 text-gray-600">
                Track the status of candidates you've submitted
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

          {filteredApplications.length === 0 ? (
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
                  ? "You haven't submitted any candidates yet."
                  : `No applications with status "${statusFilter.replace(
                      "_",
                      " "
                    )}" found.`}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredApplications.map((application) => (
                <div
                  key={application._id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.candidate.name}
                        </h3>
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                            application.candidate.status
                          )}`}
                        >
                          {application.candidate.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {application.job.title}
                          </h4>
                          <p className="text-gray-600">
                            {application.job.employer?.companyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {application.job.location}
                          </p>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center mb-1">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {application.candidate.email}
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {application.candidate.phone}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Submitted on{" "}
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {application.candidate.resume && (
                        <a
                          href={`/api/uploads/${application.candidate.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm text-center"
                        >
                          View Resume
                        </a>
                      )}
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm">
                        Contact Employer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
