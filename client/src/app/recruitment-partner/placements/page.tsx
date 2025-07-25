"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Award,
  DollarSign,
  Calendar,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  BarChart3,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface Placement {
  _id: string;
  candidateName: string;
  candidateRole: string;
  clientName: string;
  clientCompany: string;
  placementDate: string;
  startDate: string;
  salary: number;
  commission: number;
  commissionPercentage: number;
  status: 'active' | 'completed' | 'terminated' | 'pending';
  contractDuration: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  notes: string;
  performanceRating: number;
  lastContact: string;
}

interface PlacementStats {
  totalPlacements: number;
  activePlacements: number;
  totalRevenue: number;
  averageCommission: number;
  thisMonthPlacements: number;
  thisMonthRevenue: number;
  successRate: number;
  averageTimeToPlace: number;
}

export default function PlacementsPage() {
  const router = useRouter();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [stats, setStats] = useState<PlacementStats>({
    totalPlacements: 0,
    activePlacements: 0,
    totalRevenue: 0,
    averageCommission: 0,
    thisMonthPlacements: 0,
    thisMonthRevenue: 0,
    successRate: 0,
    averageTimeToPlace: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      // Mock data
      const mockPlacements: Placement[] = [
        {
          _id: "1",
          candidateName: "John Smith",
          candidateRole: "Senior Software Engineer",
          clientName: "TechCorp Solutions",
          clientCompany: "TechCorp",
          placementDate: "2024-01-15",
          startDate: "2024-02-01",
          salary: 95000,
          commission: 9500,
          commissionPercentage: 10,
          status: "active",
          contractDuration: "12 months",
          paymentStatus: "paid",
          notes: "Excellent candidate, great fit for the role",
          performanceRating: 5,
          lastContact: "2024-01-20"
        },
        {
          _id: "2",
          candidateName: "Sarah Johnson",
          candidateRole: "Product Manager",
          clientName: "InnovateLab",
          clientCompany: "InnovateLab",
          placementDate: "2024-01-12",
          startDate: "2024-01-25",
          salary: 120000,
          commission: 12000,
          commissionPercentage: 10,
          status: "active",
          contractDuration: "18 months",
          paymentStatus: "paid",
          notes: "Strong leadership skills, perfect for the position",
          performanceRating: 5,
          lastContact: "2024-01-18"
        },
        {
          _id: "3",
          candidateName: "Mike Wilson",
          candidateRole: "DevOps Engineer",
          clientName: "CloudTech",
          clientCompany: "CloudTech",
          placementDate: "2024-01-10",
          startDate: "2024-01-20",
          salary: 88000,
          commission: 8800,
          commissionPercentage: 10,
          status: "active",
          contractDuration: "12 months",
          paymentStatus: "pending",
          notes: "Technical expert, great addition to the team",
          performanceRating: 4,
          lastContact: "2024-01-15"
        }
      ];

      setPlacements(mockPlacements);

      // Calculate stats
      const totalPlacements = mockPlacements.length;
      const activePlacements = mockPlacements.filter(p => p.status === 'active').length;
      const totalRevenue = mockPlacements.reduce((sum, p) => sum + p.commission, 0);
      const averageCommission = totalRevenue / totalPlacements;
      const thisMonthPlacements = mockPlacements.filter(p => {
        const placementDate = new Date(p.placementDate);
        const now = new Date();
        return placementDate.getMonth() === now.getMonth() && placementDate.getFullYear() === now.getFullYear();
      }).length;
      const thisMonthRevenue = mockPlacements.filter(p => {
        const placementDate = new Date(p.placementDate);
        const now = new Date();
        return placementDate.getMonth() === now.getMonth() && placementDate.getFullYear() === now.getFullYear();
      }).reduce((sum, p) => sum + p.commission, 0);
      const successRate = (activePlacements / totalPlacements) * 100;

      setStats({
        totalPlacements,
        activePlacements,
        totalRevenue,
        averageCommission,
        thisMonthPlacements,
        thisMonthRevenue,
        successRate,
        averageTimeToPlace: 23,
      });
    } catch (error) {
      console.error("Error fetching placements:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlacements = placements.filter((placement) => {
    const matchesSearch =
      placement.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      placement.candidateRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      placement.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || placement.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || placement.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Award className="w-3 h-3 mr-1" />
          Completed
        </span>;
      case 'terminated':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Terminated
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Paid
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Overdue
        </span>;
      default:
        return null;
    }
  };

  const getPerformanceStars = (rating: number) => {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Placements</h1>
              <p className="text-gray-600">Track your successful placements and revenue</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Placements */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalPlacements}</div>
                  <div className="text-sm text-gray-600">Total Placements</div>
                </div>
              </div>
            </div>

            {/* Active Placements */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.activePlacements}</div>
                  <div className="text-sm text-gray-600">Active Placements</div>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">${(stats.totalRevenue / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.successRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
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
                  placeholder="Search placements..."
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="terminated">Terminated</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>

          {/* Placements Table */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Placement List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary & Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placement Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlacements.map((placement) => (
                    <tr key={placement._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{placement.candidateName}</div>
                          <div className="text-sm text-gray-500">{placement.candidateRole}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{placement.clientName}</div>
                          <div className="text-sm text-gray-500">{placement.clientCompany}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(placement.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">${placement.salary.toLocaleString()}</div>
                          <div className="text-sm text-green-600 font-medium">${placement.commission.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{placement.commissionPercentage}% commission</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(placement.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPerformanceStars(placement.performanceRating)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(placement.placementDate).toLocaleDateString()}
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
          {filteredPlacements.length === 0 && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No placements found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Start tracking your successful placements."}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 