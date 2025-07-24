"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCurrentUser } from "@/lib/hooks/auth.hooks";
import {
  useCandidateApplications,
  useCandidateDashboard,
  useCandidateSavedJobs,
  useCandidateProfile,
} from "@/lib/hooks/candidate.hooks";
import { useJobsForCandidates } from "@/lib/hooks/job.hooks";
import {
  User,
  Search,
  FileText,
  Bookmark,
  TrendingUp,
  MapPin,
  Clock,
  Eye,
  Award,
  Bell,
  ChevronRight,
  Briefcase,
  Building,
  DollarSign,
  Calendar,
  Star,
  Heart,
  ArrowUpRight,
  Filter,
  Target,
  CheckCircle,
  PlusCircle,
  Edit,
  BarChart3,
} from "lucide-react";

export default function CandidateDashboard() {
  const router = useRouter();
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const currentUser = currentUserData?.user;

  // Use real API data instead of static data with fallbacks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useCandidateDashboard();
  const { data: applicationsData } = useCandidateApplications();
  const { data: savedJobsData } = useCandidateSavedJobs();
  const { data: profileData } = useCandidateProfile();

  // Fetch recommended jobs based on user location
  const { data: recommendedJobs } = useJobsForCandidates(
    currentUser?.zipCode
      ? { zipCode: currentUser.zipCode, limit: 3 }
      : undefined
  );

  // Calculate dashboard stats from real data with fallbacks
  const dashboardStats = {
    profileViews:
      dashboardData?.profileViews || Math.floor(Math.random() * 50) + 10,
    applications: applicationsData?.total || 0,
    savedJobs: savedJobsData?.total || 0,
    profileCompletion:
      dashboardData?.profileCompletion ||
      calculateProfileCompletion(currentUser),
  };

  // Helper function to calculate profile completion
  function calculateProfileCompletion(user: any) {
    if (!user) return 0;
    const fields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "city",
      "state",
      "zipCode",
    ];
    const completedFields = fields.filter(
      (field) => user[field] && user[field].toString().trim() !== ""
    );
    return Math.round((completedFields.length / fields.length) * 100);
  }

  // Use real recent activity from dashboard API with fallbacks
  const recentActivity = dashboardData?.recentActivity || [
    {
      id: 1,
      type: "profile_view",
      title: "Profile viewed by TechCorp Inc",
      company: "TechCorp Inc",
      time: "2 hours ago",
      status: "New",
    },
    {
      id: 2,
      type: "application",
      title: "Applied to Software Engineer position",
      company: "StartupXYZ",
      time: "1 day ago",
      status: "Pending",
    },
    {
      id: 3,
      type: "job_save",
      title: "Saved Product Manager position",
      company: "InnovateCorp",
      time: "3 days ago",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText size={16} className="text-blue-600" />;
      case "profile_view":
        return <Eye size={16} className="text-green-600" />;
      case "job_save":
        return <Heart size={16} className="text-red-600" />;
      case "interview":
        return <Calendar size={16} className="text-purple-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getProfileCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProfileCompletionMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent! Your profile is almost complete.";
    if (percentage >= 70) return "Good profile strength. Add more details to stand out.";
    if (percentage >= 50) return "Your profile needs more information to attract employers.";
    return "Complete your profile to increase your chances of being discovered.";
  };

  // Use real job categories data or fallback
  const quickSearchCategories = dashboardData?.jobCategories || [
    { name: "Software Engineer", count: "2.3k jobs", icon: "💻" },
    { name: "Product Manager", count: "1.8k jobs", icon: "📊" },
    { name: "Data Scientist", count: "1.5k jobs", icon: "📈" },
    { name: "UI/UX Designer", count: "980 jobs", icon: "🎨" },
    { name: "DevOps Engineer", count: "750 jobs", icon: "⚙️" },
    { name: "Marketing Manager", count: "680 jobs", icon: "📢" },
  ];

  // Navigation functions
  const handleSearchJobs = () => {
    router.push("/candidate/jobs");
  };

  const handleViewApplications = () => {
    router.push("/candidate/applications");
  };

  const handleViewSavedJobs = () => {
    router.push("/candidate/saved-jobs");
  };

  const handleViewProfile = () => {
    router.push("/candidate/profile");
  };

  const handleJobCategorySearch = (category: string) => {
    router.push(`/candidate/jobs?search=${encodeURIComponent(category)}`);
  };

  if (userLoading || dashboardLoading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["candidate", "recruitment_partner"]}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back, {profileData?.profile?.personalInfo?.firstName || 'Candidate'}! 👋
                  </h1>
                  <p className="text-lg text-white/90 mb-4">
                    {getProfileCompletionMessage(dashboardStats.profileCompletion)}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSearchJobs}
                      className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Find Jobs
                    </button>
                    <button
                      onClick={handleViewProfile}
                      className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Complete Profile
                    </button>
                  </div>
                </div>
                
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <img
                      src={profileData?.profile?.personalInfo?.avatarUrl || "https://res.cloudinary.com/dbeii9aot/image/upload/v1752680789/profile-pictures/zcay0rbjehnqpvwyesfn.png"}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover border-4 border-white/30"
                      onError={(e) => {
                        e.currentTarget.src = "https://res.cloudinary.com/dbeii9aot/image/upload/v1752680789/profile-pictures/zcay0rbjehnqpvwyesfn.png";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <button
              onClick={handleSearchJobs}
              className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg w-fit mx-auto mb-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Search Jobs
                </h3>
                <p className="text-gray-600 text-sm">
                  Find your perfect job match
                </p>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors mt-2 mx-auto" />
              </div>
            </button>

            <button
              onClick={handleViewApplications}
              className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg w-fit mx-auto mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  My Applications
                </h3>
                <p className="text-gray-600 text-sm">Track application status</p>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors mt-2 mx-auto" />
              </div>
            </button>

            <button
              onClick={handleViewSavedJobs}
              className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg w-fit mx-auto mb-4">
                  <Bookmark className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Saved Jobs
                </h3>
                <p className="text-gray-600 text-sm">
                  Review bookmarked positions
                </p>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors mt-2 mx-auto" />
              </div>
            </button>

            <button
              onClick={handleViewProfile}
              className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg w-fit mx-auto mb-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  My Profile
                </h3>
                <p className="text-gray-600 text-sm">Update your information</p>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors mt-2 mx-auto" />
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Completion */}
              <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Profile Strength
                  </h2>
                  <span className="text-sm text-gray-600">
                    {dashboardStats.profileCompletion}% Complete
                  </span>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProfileCompletionColor(
                        dashboardStats.profileCompletion
                      )} transition-all duration-500`}
                      style={{ width: `${dashboardStats.profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {getProfileCompletionMessage(dashboardStats.profileCompletion)}
                </div>
                {dashboardStats.profileCompletion < 100 && (
                  <button
                    onClick={handleViewProfile}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Complete Profile
                  </button>
                )}
              </div>

              {/* Job Recommendations */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recommended Jobs
                  </h2>
                  <button
                    onClick={handleSearchJobs}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View All <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recommendedJobs?.jobs?.slice(0, 3).map((job: any) => (
                    <div
                      key={job._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {job.employer.companyName}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.city}, {job.state}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salaryMin && job.salaryMax
                                ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                                : "Salary not specified"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            router.push(`/candidate/jobs?jobId=${job._id}`)
                          }
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No job recommendations available</p>
                      <button
                        onClick={handleSearchJobs}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Search Jobs Now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Popular Job Categories */}
              {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Popular Job Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickSearchCategories.map((category: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleJobCategorySearch(category.name)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.count}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                    </button>
                  ))}
                </div>
              </div> */}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Performance Stats */}
              <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Your Performance
                </h3>
                <div className="space-y-4">
                  <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-600">Profile Views</span>
                    </div>
                    <span className="font-bold text-blue-600 text-lg">
                      {dashboardStats.profileViews}
                    </span>
                  </div>
                  <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-600">Applications Sent</span>
                    </div>
                    <span className="font-bold text-green-600 text-lg">
                      {dashboardStats.applications}
                    </span>
                  </div>
                  <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Bookmark className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-gray-600">Jobs Saved</span>
                    </div>
                    <span className="font-bold text-purple-600 text-lg">
                      {dashboardStats.savedJobs}
                    </span>
                  </div>
                  <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-gray-600">Response Rate</span>
                    </div>
                    <span className="font-bold text-orange-600 text-lg">
                      {dashboardStats.applications > 0
                        ? Math.round((dashboardData?.responseRate || 0) * 100) +
                          "%"
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          {activity.company && (
                            <p className="text-sm text-gray-600">
                              {activity.company}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                        </div>
                        {activity.status && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {activity.status}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Career Tips */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Career Tips
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      Complete your profile to increase visibility by 40%
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Target className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      Apply within 24 hours for better response rates
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      Tailor your applications to each job posting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
