"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface DashboardStats {
  totalEmployers: number;
  totalRecruitmentPartners: number;
  totalJobs: number;
  totalCandidates: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployers: 0,
    totalRecruitmentPartners: 0,
    totalJobs: 0,
    totalCandidates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employersRes, partnersRes, jobsRes, candidatesRes] =
          await Promise.all([
            api.get("/admin/employers"),
            api.get("/admin/recruitment-partners"),
            api.get("/admin/jobs"),
            api.get("/admin/candidates"),
          ]);

        setStats({
          totalEmployers: employersRes.data.employers?.length || 0,
          totalRecruitmentPartners:
            partnersRes.data.recruitmentPartners?.length || 0,
          totalJobs: jobsRes.data.jobs?.length || 0,
          totalCandidates: candidatesRes.data.candidates?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback to placeholder data on error
        setStats({
          totalEmployers: 0,
          totalRecruitmentPartners: 0,
          totalJobs: 0,
          totalCandidates: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleManageEmployers = () => {
    router.push("/admin/employers");
  };

  const handleManagePartners = () => {
    router.push("/admin/recruitment-partners");
  };

  const handleReviewJobs = () => {
    router.push("/admin/jobs");
  };

  const handleSystemSettings = () => {
    // For now, show an alert. This could be expanded to a settings page
    alert("System Settings feature coming soon!");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
        <div className="space-y-6 text-black">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-gray-600">
              Monitor and manage the entire recruitment platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">E</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Employers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalEmployers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">R</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Recruitment Partners
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalRecruitmentPartners}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">J</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Jobs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalJobs}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">C</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Candidates
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalCandidates}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
                <div className="mt-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          New employer registered: TechCorp Inc.
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">1 hour ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          Job posting approved: Senior Developer
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          New recruitment partner: TalentBridge
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">3 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          System maintenance completed
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">5 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Pending Actions
                </h3>
                <div className="mt-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          3 employers awaiting approval
                        </p>
                        <p className="text-xs text-yellow-600">
                          Review pending registrations
                        </p>
                      </div>
                      <button
                        onClick={handleManageEmployers}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
                      >
                        Review
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          5 job postings to review
                        </p>
                        <p className="text-xs text-blue-600">
                          Approve or reject new jobs
                        </p>
                      </div>
                      <button
                        onClick={handleReviewJobs}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        Review
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          2 reported issues
                        </p>
                        <p className="text-xs text-red-600">
                          Address user complaints
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          alert("Issue tracking system coming soon!")
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Management Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Management Actions
              </h3>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={handleManageEmployers}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Manage Employers
                </button>
                <button
                  onClick={handleManagePartners}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Manage Partners
                </button>
                <button
                  onClick={handleReviewJobs}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Review Jobs
                </button>
                <button
                  onClick={handleSystemSettings}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
