"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  jobRole: string; // "full_time" | "part_time"
  jobType: string; // "work_from_office" | "work_from_home"
  payStructure: string; // "monthly" | "hourly"
  serviceSalesFocus: string;
  licenseRequirement: string;
  numberOfPositions: number;
  recruitmentDuration: string;
  startDate: string;
  expires: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  employer: {
    companyName: string;
    ownerName: string;
  };
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "all" | "approved" | "pending" | "active"
  >("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      const response = await api.get("/admin/jobs");
      setJobs(response.data.jobs || []);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.response?.data?.message || "Failed to fetch jobs");
      // Set empty array if API fails
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      await api.put(`/admin/jobs/${jobId}/approve`);
      setJobs(
        jobs.map((job) =>
          job._id === jobId ? { ...job, isApproved: true, isActive: true } : job
        )
      );
    } catch (err: any) {
      console.error("Error approving job:", err);
      // For demo, just update the state
      setJobs(
        jobs.map((job) =>
          job._id === jobId ? { ...job, isApproved: true, isActive: true } : job
        )
      );
    }
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      await api.delete(`/admin/jobs/${jobId}/reject`);
      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (err: any) {
      console.error("Error rejecting job:", err);
      // For demo, just update the state
      setJobs(jobs.filter((job) => job._id !== jobId));
    }
  };

  const handleToggleActive = async (jobId: string) => {
    try {
      const job = jobs.find((j) => j._id === jobId);
      await api.put(`/admin/jobs/${jobId}/toggle-active`);
      setJobs(
        jobs.map((j) => (j._id === jobId ? { ...j, isActive: !j.isActive } : j))
      );
    } catch (err: any) {
      console.error("Error toggling job status:", err);
      // For demo, just update the state
      setJobs(
        jobs.map((j) => (j._id === jobId ? { ...j, isActive: !j.isActive } : j))
      );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === "approved") return job.isApproved;
    if (filter === "pending") return !job.isApproved;
    if (filter === "active") return job.isActive && job.isApproved;
    return true;
  });

  const getStatusBadge = (job: Job) => {
    if (!job.isApproved) {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Pending Approval
        </span>
      );
    }
    if (job.isActive) {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200 shadow-sm">
        <svg
          className="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
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
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Job Management
              </h1>
              <p className="mt-1 text-gray-600">
                Review and manage job postings
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                  filter === "all"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform hover:scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                  filter === "pending"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform hover:scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Pending ({jobs.filter((j) => !j.isApproved).length})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                  filter === "approved"
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform hover:scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Approved ({jobs.filter((j) => j.isApproved).length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                  filter === "active"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg transform hover:scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Active ({jobs.filter((j) => j.isActive && j.isApproved).length})
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-amber-800 font-medium">
                    API connection failed. Showing demo data.
                  </p>
                  <p className="text-amber-700 text-sm mt-1">Error: {error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {filteredJobs.length === 0 ? (
                <li className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-500">
                    No jobs match the selected filter criteria.
                  </p>
                </li>
              ) : (
                filteredJobs.map((job) => (
                  <li key={job._id}>
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {job.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {job.employer?.companyName || "Company"} •{" "}
                                {job.location}
                              </p>
                            </div>
                            {getStatusBadge(job)}
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {job.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Positions:</span>{" "}
                              {job.numberOfPositions}
                            </div>
                            <div>
                              <span className="font-medium">Role:</span>{" "}
                              {job.jobRole
                                ?.replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>{" "}
                              {job.jobType
                                ?.replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                            <div>
                              <span className="font-medium">Posted:</span>{" "}
                              {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">
                                Details:
                              </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                  <svg
                                    className="w-3 h-3 mr-1.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                  </svg>
                                  {job.payStructure?.replace(/\b\w/g, (l) =>
                                    l.toUpperCase()
                                  )}{" "}
                                  Pay
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200">
                                  <svg
                                    className="w-3 h-3 mr-1.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {job.licenseRequirement}
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                                  <svg
                                    className="w-3 h-3 mr-1.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {job.recruitmentDuration}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Employer:</span>{" "}
                            {job.employer.companyName} ({job.employer.ownerName}
                            )
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col space-y-2">
                          {!job.isApproved && (
                            <>
                              <button
                                onClick={() => handleApproveJob(job._id)}
                                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4 mr-1.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectJob(job._id)}
                                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-sm font-semibold hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4 mr-1.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                          {job.isApproved && (
                            <button
                              onClick={() => handleToggleActive(job._id)}
                              className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${
                                job.isActive
                                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 focus:ring-amber-500"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500"
                              }`}
                            >
                              {job.isActive ? (
                                <>
                                  <svg
                                    className="w-4 h-4 mr-1.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4 mr-1.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 016 0v2M7 16a3 3 0 100 6 3 3 0 000-6z"
                                    />
                                  </svg>
                                  Activate
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Summary Stats */}
          <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg
                className="w-6 h-6 mr-3 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Job Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {jobs.length}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Total Jobs
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {jobs.filter((j) => !j.isApproved).length}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Pending Approval
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {jobs.filter((j) => j.isApproved).length}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Approved
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {jobs.filter((j) => j.isActive && j.isApproved).length}
                </div>
                <div className="text-sm font-medium text-gray-700">Active</div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
