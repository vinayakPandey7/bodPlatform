"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface DashboardStats {
  totalPublishedJobs: number;
  totalActiveJobs: number;
  totalSelectedCandidates: number;
  totalPositionsPublished: number;
}

export default function EmployerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPublishedJobs: 0,
    totalActiveJobs: 0,
    totalSelectedCandidates: 0,
    totalPositionsPublished: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/jobs/employer/my-jobs");
        const jobs = response.data.jobs || [];

        setStats({
          totalPublishedJobs: jobs.length,
          totalActiveJobs: jobs.filter((job: any) => job.isActive).length,
          totalSelectedCandidates: 0, // This would need a separate API call
          totalPositionsPublished: jobs.reduce(
            (sum: number, job: any) => sum + job.numberOfPositions,
            0
          ),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback to placeholder data
        setStats({
          totalPublishedJobs: 0,
          totalActiveJobs: 0,
          totalSelectedCandidates: 0,
          totalPositionsPublished: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handlePostNewJob = () => {
    router.push("/employer/jobs/create");
  };

  const handleViewApplications = () => {
    router.push("/employer/applications");
  };

  const handleManageJobs = () => {
    router.push("/employer/jobs");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["employer"]}>
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
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">J</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Published Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalPublishedJobs}
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
                    <span className="text-white font-bold">A</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalActiveJobs}
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
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Selected Candidates
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalSelectedCandidates}
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
                    <span className="text-white font-bold">P</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Positions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalPositionsPublished}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handlePostNewJob}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer justify-center"
                  >
                    Post New Job
                  </button>
                  <button
                    onClick={handleViewApplications}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md  text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer justify-center"
                  >
                    View Applications
                  </button>
                  <button
                    onClick={handleManageJobs}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md  text-white  bg-indigo-600 hover:bg-indigo-700 cursor-pointer justify-center"
                  >
                    Manage Jobs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
