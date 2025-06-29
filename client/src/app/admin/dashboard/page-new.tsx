"use client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAdminDashboard } from "@/lib/queries";

interface DashboardStats {
  totalEmployers: number;
  totalRecruitmentPartners: number;
  totalJobs: number;
  totalCandidates: number;
}

export default function AdminDashboard() {
  const router = useRouter();

  // Use TanStack Query hook
  const {
    data: dashboardData,
    isLoading: loading,
    error,
  } = useAdminDashboard();

  const stats = dashboardData || {
    totalEmployers: 0,
    totalRecruitmentPartners: 0,
    totalJobs: 0,
    totalCandidates: 0,
  };

  const handleEmployersClick = () => {
    router.push("/admin/employers");
  };

  const handlePartnersClick = () => {
    router.push("/admin/recruitment-partners");
  };

  const handleJobsClick = () => {
    router.push("/admin/jobs");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage employers, recruitment partners, and job postings
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error: {error?.message || String(error)}
              </p>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={handleEmployersClick}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Employers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEmployers}
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handlePartnersClick}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Recruitment Partners
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRecruitmentPartners}
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handleJobsClick}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500 bg-opacity-10">
                  <svg
                    className="w-6 h-6 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalJobs}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Candidates
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalCandidates}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/admin/employers")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium text-gray-900">Manage Employers</h3>
                <p className="text-sm text-gray-600">
                  View and manage employer accounts
                </p>
              </button>
              <button
                onClick={() => router.push("/admin/recruitment-partners")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium text-gray-900">
                  Manage Recruitment Partners
                </h3>
                <p className="text-sm text-gray-600">
                  View and manage recruitment partner accounts
                </p>
              </button>
              <button
                onClick={() => router.push("/admin/jobs")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium text-gray-900">Manage Jobs</h3>
                <p className="text-sm text-gray-600">
                  Review and approve job postings
                </p>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
