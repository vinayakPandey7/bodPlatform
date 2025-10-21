"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
  Briefcase,
  TrendingUp,
  Users,
  Target,
  Plus,
  Eye,
  Settings,
  Calendar,
  Clock,
} from "lucide-react";

interface DashboardStats {
  totalPublishedJobs: number;
  totalActiveJobs: number;
  totalSelectedCandidates: number;
  totalPositionsPublished: number;
  upcomingInterviews: number;
  totalInterviews: number;
}

export default function EmployerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPublishedJobs: 0,
    totalActiveJobs: 0,
    totalSelectedCandidates: 0,
    totalPositionsPublished: 0,
    upcomingInterviews: 0,
    totalInterviews: 0,
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
          upcomingInterviews: 0, // This would need a separate API call
          totalInterviews: 0, // This would need a separate API call
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback to placeholder data
        setStats({
          totalPublishedJobs: 8,
          totalActiveJobs: 8,
          totalSelectedCandidates: 0,
          totalPositionsPublished: 8,
          upcomingInterviews: 3,
          totalInterviews: 12,
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
    router.push("/employer/saved-candidates");
  };

  const handleManageJobs = () => {
    router.push("/employer/jobs");
  };

  const handleManageInterviews = () => {
    router.push("/employer/interviews");
  };

  const handleCalendar = () => {
    router.push("/employer/calendar");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["employer"]}>
        <DashboardLayout>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200/50 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200/50 rounded w-1/2"></div>
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
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Published Jobs */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {stats.totalPublishedJobs}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Total Published Jobs
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">All job postings</p>
                </div>
              </div>
            </div>

            {/* Active Jobs */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                      {stats.totalActiveJobs}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Active Jobs
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Currently hiring</p>
                </div>
              </div>
            </div>

            {/* Selected Candidates */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">
                      {stats.totalSelectedCandidates}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Selected Candidates
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Hired this month</p>
                </div>
              </div>
            </div>

            {/* Total Positions */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                      {stats.totalPositionsPublished}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Total Positions
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Available roles</p>
                </div>
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">
                      {stats.upcomingInterviews}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Upcoming Interviews
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Scheduled this week</p>
                </div>
              </div>
            </div>

            {/* Total Interviews */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {stats.totalInterviews}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Total Interviews
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Post New Job */}
              <button
                onClick={handlePostNewJob}
                className="group relative bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center cursor-pointer">
                  <div className="p-4 bg-white/20 rounded-xl w-fit mx-auto mb-4">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Post New Job</h3>
                  <p className="text-blue-100">
                    Create and publish a new job posting
                  </p>
                </div>
              </button>

           

              {/* Manage Jobs */}
              <button
                onClick={handleManageJobs}
                className="group relative bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="p-4 bg-white/20 rounded-xl w-fit mx-auto mb-4">
                    <Settings className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Manage Jobs</h3>
                  <p className="text-orange-100">
                    Edit and manage existing jobs
                  </p>
                </div>
              </button>


                 {/* View Applications */}
                 <button
                onClick={handleViewApplications}
                className="group relative bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="p-4 bg-white/20 rounded-xl w-fit mx-auto mb-4">
                    <Eye className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Saved Candidates</h3>
                  <p className="text-green-100">
                    Review candidate applications
                  </p>
                </div>
              </button>

                            {/* Interview Calendar */}
              <button
                onClick={handleCalendar}
                className="group relative bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="p-4 bg-white/20 rounded-xl w-fit mx-auto mb-4">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Interview Calendar</h3>
                  <p className="text-teal-100">
                    Manage your interview schedule
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
