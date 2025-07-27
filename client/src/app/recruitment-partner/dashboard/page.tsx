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
  BarChart3,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Building2,
  UserPlus,
  FileText,
  MessageSquare,
  Star,
  Award,
  TrendingDown,
  Activity,
} from "lucide-react";

interface DashboardStats {
  totalCandidates: number;
  activePlacements: number;
  totalRevenue: number;
  successRate: number;
  pendingInterviews: number;
  activeClients: number;
  thisMonthPlacements: number;
  averageTimeToPlace: number;
}

interface RecentActivity {
  id: string;
  type: "placement" | "interview" | "application" | "client" | "candidate";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "pending" | "warning" | "info";
}

interface TopPerformer {
  id: string;
  name: string;
  role: string;
  company: string;
  placementDate: string;
  revenue: number;
}

export default function RecruitmentPartnerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    activePlacements: 0,
    totalRevenue: 0,
    successRate: 0,
    pendingInterviews: 0,
    activeClients: 0,
    thisMonthPlacements: 0,
    averageTimeToPlace: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        console.log("Fetching dashboard data...");

        // Fetch real dashboard data from API
        const response = await api.get("/recruitment-partner/dashboard");

        console.log("Dashboard API Response:", response.data);

        if (response.data.success) {
          const { stats, recentActivity, topPerformers } = response.data.data;

          console.log("Stats from API:", stats);
          console.log("Recent Activity from API:", recentActivity);
          console.log("Top Performers from API:", topPerformers);

          setStats({
            totalCandidates: stats.totalCandidates || 0,
            activePlacements: stats.activePlacements || 0,
            totalRevenue: stats.totalRevenue || 0,
            successRate: stats.successRate || 0,
            pendingInterviews: stats.pendingInterviews || 0,
            activeClients: stats.activeClients || 0,
            thisMonthPlacements: stats.thisMonthPlacements || 0,
            averageTimeToPlace: stats.averageTimeToPlace || 0,
          });

          // Format recent activity timestamps
          const formattedActivity =
            recentActivity?.map((activity: any) => ({
              ...activity,
              timestamp: formatTimestamp(activity.timestamp),
            })) || [];

          setRecentActivity(formattedActivity);
          setTopPerformers(topPerformers || []);
        } else {
          console.error("API returned success: false", response.data);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        console.error("Error details:", error.response?.data || error.message);

        // Fallback to placeholder data if API fails
        setStats({
          totalCandidates: 0,
          activePlacements: 0,
          totalRevenue: 0,
          successRate: 0,
          pendingInterviews: 0,
          activeClients: 0,
          thisMonthPlacements: 0,
          averageTimeToPlace: 0,
        });

        setRecentActivity([]);
        setTopPerformers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  const handleAddCandidate = () => {
    router.push("/recruitment-partner/candidates/add");
  };

  const handleBrowseJobs = () => {
    router.push("/recruitment-partner/jobs");
  };

  const handleViewClients = () => {
    router.push("/recruitment-partner/clients");
  };

  const handleViewPlacements = () => {
    router.push("/recruitment-partner/placements");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "placement":
        return <CheckCircle className="h-4 w-4" />;
      case "interview":
        return <Calendar className="h-4 w-4" />;
      case "application":
        return <FileText className="h-4 w-4" />;
      case "client":
        return <Building2 className="h-4 w-4" />;
      case "candidate":
        return <UserPlus className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "warning":
        return "text-red-600 bg-red-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
        <DashboardLayout>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
    <ProtectedRoute allowedRoles={["recruitment_partner"]}>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Recruiter Dashboard
            </h1>
            <p className="text-gray-600">
              Track your placements, manage candidates, and grow your business
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Candidates */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {stats.totalCandidates}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Total Candidates
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">In your database</p>
                </div>
              </div>
            </div>

            {/* Active Placements */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                      {stats.activePlacements}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Active Placements
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently working
                  </p>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            {/* <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-yellow-600 transition-colors">
                      ${(stats.totalRevenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Total Revenue
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">This year</p>
                </div>
              </div>
            </div> */}

            {/* Success Rate */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                      {stats.successRate}%
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                    Success Rate
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Placement success
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending Interviews */}
            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Pending Interviews
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.pendingInterviews}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Clients */}
            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Active Clients
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.activeClients}
                  </p>
                </div>
              </div>
            </div>

            {/* This Month Placements */}
            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.thisMonthPlacements}
                  </p>
                </div>
              </div>
            </div>

            {/* Avg Time to Place */}
            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Time to Place
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.averageTimeToPlace} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Add Candidate */}
              <button
                onClick={handleAddCandidate}
                className="group relative bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mx-auto mb-3">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Add Candidate</h3>
                  <p className="text-blue-100 text-sm">
                    Add new candidate to database
                  </p>
                </div>
              </button>

              {/* Browse Jobs */}
              <button
                onClick={handleBrowseJobs}
                className="group relative bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mx-auto mb-3">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Browse Jobs</h3>
                  <p className="text-green-100 text-sm">
                    Find opportunities for candidates
                  </p>
                </div>
              </button>

              {/* View Clients */}
              <button
                onClick={handleViewClients}
                className="group relative bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mx-auto mb-3">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Manage Clients</h3>
                  <p className="text-orange-100 text-sm">
                    View and manage client relationships
                  </p>
                </div>
              </button>

              {/* View Placements */}
              <button
                onClick={handleViewPlacements}
                className="group relative bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mx-auto mb-3">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">View Placements</h3>
                  <p className="text-purple-100 text-sm">
                    Track successful placements
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
            <div className="lg:col-span-2">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Recent Activity
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`p-2 rounded-lg ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No recent activity
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Activity will appear here as you work with candidates
                        and clients.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

           
            <div className="lg:col-span-1">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Recent Placements
                  </h3>
                  <button
                    onClick={handleViewPlacements}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {topPerformers.length > 0 ? (
                    topPerformers.map((performer, index) => (
                      <div
                        key={performer.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {performer.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {performer.role}
                          </p>
                          <p className="text-xs text-gray-500">
                            {performer.company}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            ${performer.revenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              performer.placementDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No placements yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Successful placements will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
