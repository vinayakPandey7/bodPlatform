"use client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAdminDashboard } from "@/lib/queries";
import { Users } from "lucide-react";

interface DashboardStats {
  totalEmployers: number;
  totalRecruitmentPartners: number;
  totalJobs: number;
  totalCandidates: number;
  totalSalesPersons: number;
  totalInsuranceAgents: number;
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
    totalSalesPersons: 0,
    totalInsuranceAgents: 0,
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

  const handleCandidateClick = () => {
    router.push("/admin/candidates");
  };

  const handleSalesExecuteClick = () => {
    router.push("/admin/sales-execute");
  };

  const handleInsuranceAgentsClick = () => {
    router.push("/admin/insurance-agents");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              {/* Modern Loading Animation */}
              <div className="relative">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-600 mt-4">
                Loading Dashboard...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we fetch the latest data
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 mr-4">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Manage employers, recruitment partners, job postings, sales
                execute, and insurance agents from your centralized control
                panel
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error: {error?.message || String(error)}
              </p>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={handleEmployersClick}
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden border border-blue-100/50"
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
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
                <div className="ml-5">
                  <p className="text-sm font-semibold text-blue-700 group-hover:text-blue-800 transition-colors">
                    Employers
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    {stats.totalEmployers}
                  </p>
                  <p className="text-xs text-blue-600/70 mt-1 group-hover:text-blue-700 transition-colors">
                    Total registered
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handlePartnersClick}
              className="group relative bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden border border-emerald-100/50"
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg group-hover:shadow-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
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
                <div className="ml-5">
                  <p className="text-sm font-semibold text-emerald-700 group-hover:text-emerald-800 transition-colors">
                    Recruitment Partners
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">
                    {stats.totalRecruitmentPartners}
                  </p>
                  <p className="text-xs text-emerald-600/70 mt-1 group-hover:text-emerald-700 transition-colors">
                    Active partners
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handleJobsClick}
              className="group relative bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden border border-purple-100/50"
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
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
                <div className="ml-5">
                  <p className="text-sm font-semibold text-purple-700 group-hover:text-purple-800 transition-colors">
                    Jobs
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-900 transition-colors">
                    {stats.totalJobs}
                  </p>
                  <p className="text-xs text-purple-600/70 mt-1 group-hover:text-purple-700 transition-colors">
                    Active postings
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handleCandidateClick}
              className="group relative bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden border border-amber-100/50"
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg group-hover:shadow-amber-500/25 group-hover:scale-110 transition-all duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-amber-700 group-hover:text-amber-800 transition-colors">
                    Candidates
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-amber-900 transition-colors">
                    {stats.totalCandidates}
                  </p>
                  <p className="text-xs text-amber-600/70 mt-1 group-hover:text-amber-700 transition-colors">
                    Registered users
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handleSalesExecuteClick}
              className="group relative bg-gradient-to-br from-rose-50 to-pink-100 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden border border-rose-100/50"
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg group-hover:shadow-rose-500/25 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-rose-700 group-hover:text-rose-800 transition-colors">
                    Sales Execute
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-rose-900 transition-colors">
                    {stats.totalSalesPersons}
                  </p>
                  <p className="text-xs text-rose-600/70 mt-1 group-hover:text-rose-700 transition-colors">
                    Sales team
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handleInsuranceAgentsClick}
              className="group relative bg-gradient-to-br from-cyan-50 to-teal-100 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden border border-cyan-100/50"
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg group-hover:shadow-cyan-500/25 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-cyan-700 group-hover:text-cyan-800 transition-colors">
                    Insurance Agents
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-cyan-900 transition-colors">
                    {stats.totalInsuranceAgents}
                  </p>
                  <p className="text-xs text-cyan-600/70 mt-1 group-hover:text-cyan-700 transition-colors">
                    Active agents
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
