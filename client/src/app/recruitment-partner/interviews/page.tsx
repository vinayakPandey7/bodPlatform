"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Video,
  Phone,
  MapPin,
  Mail,
  MessageSquare,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";

interface Interview {
  _id: string;
  candidateName: string;
  candidateRole: string;
  clientName: string;
  clientCompany: string;
  interviewDate: string;
  interviewTime: string;
  duration: number;
  type: 'phone' | 'video' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  outcome: 'passed' | 'failed' | 'pending' | 'rescheduled';
  interviewer: string;
  interviewerEmail: string;
  location: string;
  notes: string;
  feedback: string;
  rating: number;
  nextSteps: string;
  followUpDate: string;
}

interface InterviewStats {
  totalInterviews: number;
  scheduledInterviews: number;
  completedInterviews: number;
  successRate: number;
  thisWeekInterviews: number;
  pendingFeedback: number;
  averageRating: number;
  upcomingInterviews: number;
}

export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<InterviewStats>({
    totalInterviews: 0,
    scheduledInterviews: 0,
    completedInterviews: 0,
    successRate: 0,
    thisWeekInterviews: 0,
    pendingFeedback: 0,
    averageRating: 0,
    upcomingInterviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      // Mock data
      const mockInterviews: Interview[] = [
        {
          _id: "1",
          candidateName: "John Smith",
          candidateRole: "Senior Software Engineer",
          clientName: "TechCorp Solutions",
          clientCompany: "TechCorp",
          interviewDate: "2024-01-25",
          interviewTime: "10:00 AM",
          duration: 60,
          type: "video",
          status: "scheduled",
          outcome: "pending",
          interviewer: "Sarah Johnson",
          interviewerEmail: "sarah@techcorp.com",
          location: "Zoom Meeting",
          notes: "Technical interview focusing on system design and coding",
          feedback: "",
          rating: 0,
          nextSteps: "Awaiting interview completion",
          followUpDate: "2024-01-26"
        },
        {
          _id: "2",
          candidateName: "Emily Chen",
          candidateRole: "UX Designer",
          clientName: "DesignStudio",
          clientCompany: "DesignStudio",
          interviewDate: "2024-01-24",
          interviewTime: "2:00 PM",
          duration: 45,
          type: "in-person",
          status: "completed",
          outcome: "passed",
          interviewer: "Mike Wilson",
          interviewerEmail: "mike@designstudio.com",
          location: "DesignStudio HQ, San Francisco",
          notes: "Portfolio review and design challenge discussion",
          feedback: "Excellent portfolio, strong design thinking, great cultural fit",
          rating: 5,
          nextSteps: "Move to final round with design team lead",
          followUpDate: "2024-01-30"
        },
        {
          _id: "3",
          candidateName: "David Brown",
          candidateRole: "Product Manager",
          clientName: "InnovateLab",
          clientCompany: "InnovateLab",
          interviewDate: "2024-01-23",
          interviewTime: "11:30 AM",
          duration: 90,
          type: "phone",
          status: "completed",
          outcome: "failed",
          interviewer: "Lisa Anderson",
          interviewerEmail: "lisa@innovatelab.com",
          location: "Phone Call",
          notes: "Product strategy and case study discussion",
          feedback: "Good communication skills but lacked depth in technical understanding",
          rating: 2,
          nextSteps: "Not proceeding to next round",
          followUpDate: "2024-01-24"
        }
      ];

      setInterviews(mockInterviews);

      // Calculate stats
      const totalInterviews = mockInterviews.length;
      const scheduledInterviews = mockInterviews.filter(i => i.status === 'scheduled').length;
      const completedInterviews = mockInterviews.filter(i => i.status === 'completed').length;
      const passedInterviews = mockInterviews.filter(i => i.outcome === 'passed').length;
      const successRate = completedInterviews > 0 ? (passedInterviews / completedInterviews) * 100 : 0;
      const thisWeekInterviews = mockInterviews.filter(i => {
        const interviewDate = new Date(i.interviewDate);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return interviewDate >= weekStart && interviewDate <= weekEnd;
      }).length;
      const pendingFeedback = mockInterviews.filter(i => i.status === 'completed' && i.feedback === '').length;
      const averageRating = mockInterviews.filter(i => i.rating > 0).reduce((sum, i) => sum + i.rating, 0) / 
                           mockInterviews.filter(i => i.rating > 0).length || 0;
      const upcomingInterviews = mockInterviews.filter(i => {
        const interviewDate = new Date(i.interviewDate);
        const now = new Date();
        return interviewDate > now && i.status === 'scheduled';
      }).length;

      setStats({
        totalInterviews,
        scheduledInterviews,
        completedInterviews,
        successRate,
        thisWeekInterviews,
        pendingFeedback,
        averageRating,
        upcomingInterviews,
      });
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.candidateRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    const matchesType = typeFilter === "all" || interview.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </span>;
      case 'rescheduled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rescheduled
        </span>;
      case 'no-show':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          No Show
        </span>;
      default:
        return null;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'passed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Passed
        </span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Failed
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>;
      case 'rescheduled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Rescheduled
        </span>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Management</h1>
              <p className="text-gray-600">Schedule and track candidate interviews</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Schedule Interview
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Interviews */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalInterviews}</div>
                  <div className="text-sm text-gray-600">Total Interviews</div>
                </div>
              </div>
            </div>

            {/* Scheduled Interviews */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.scheduledInterviews}</div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.successRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* This Week Interviews */}
            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.thisWeekInterviews}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.upcomingInterviews}</p>
                </div>
              </div>
            </div>

            {/* Pending Feedback */}
            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending Feedback</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.pendingFeedback}</p>
                </div>
              </div>
            </div>

            {/* Completed Interviews */}
            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.completedInterviews}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="no-show">No Show</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="phone">Phone</option>
                <option value="in-person">In-Person</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>

          {/* Interviews Table */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Interview List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate & Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInterviews.map((interview) => (
                    <tr key={interview._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{interview.candidateName}</div>
                          <div className="text-sm text-gray-500">{interview.candidateRole}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{interview.clientName}</div>
                          <div className="text-sm text-gray-500">{interview.clientCompany}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(interview.interviewDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">{interview.interviewTime}</div>
                          <div className="text-xs text-gray-400">{interview.duration} min</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-1 bg-gray-100 rounded mr-2">
                            {getTypeIcon(interview.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">{interview.type}</div>
                            <div className="text-sm text-gray-500">{interview.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(interview.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getOutcomeBadge(interview.outcome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.rating > 0 ? (
                          <div className="flex items-center">
                            {getRatingStars(interview.rating)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredInterviews.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Start scheduling interviews for your candidates."}
              </p>
              {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 