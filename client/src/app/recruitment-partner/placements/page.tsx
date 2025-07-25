"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  InputAdornment,
} from "@mui/material";
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
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [commissionFilter, setCommissionFilter] = useState("all");

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
    
    let matchesDateRange = true;
    if (dateRangeFilter !== "all") {
      const placementDate = new Date(placement.placementDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - placementDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRangeFilter) {
        case "last_7_days":
          matchesDateRange = daysDiff <= 7;
          break;
        case "last_30_days":
          matchesDateRange = daysDiff <= 30;
          break;
        case "last_90_days":
          matchesDateRange = daysDiff <= 90;
          break;
        case "this_year":
          matchesDateRange = placementDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    let matchesCommission = true;
    if (commissionFilter !== "all") {
      switch (commissionFilter) {
        case "0-5k":
          matchesCommission = placement.commission <= 5000;
          break;
        case "5k-10k":
          matchesCommission = placement.commission > 5000 && placement.commission <= 10000;
          break;
        case "10k-20k":
          matchesCommission = placement.commission > 10000 && placement.commission <= 20000;
          break;
        case "20k+":
          matchesCommission = placement.commission > 20000;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDateRange && matchesCommission;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip 
          icon={<CheckCircle className="w-3 h-3" />}
          label="Active" 
          size="small"
          sx={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            '& .MuiChip-icon': {
              color: '#166534',
            }
          }}
        />;
      case 'completed':
        return <Chip 
          icon={<Award className="w-3 h-3" />}
          label="Completed" 
          size="small"
          sx={{
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            '& .MuiChip-icon': {
              color: '#1e40af',
            }
          }}
        />;
      case 'terminated':
        return <Chip 
          icon={<AlertCircle className="w-3 h-3" />}
          label="Terminated" 
          size="small"
          sx={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            '& .MuiChip-icon': {
              color: '#dc2626',
            }
          }}
        />;
      case 'pending':
        return <Chip 
          icon={<Clock className="w-3 h-3" />}
          label="Pending" 
          size="small"
          sx={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            '& .MuiChip-icon': {
              color: '#92400e',
            }
          }}
        />;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Chip 
          label="Paid" 
          size="small"
          sx={{
            backgroundColor: '#dcfce7',
            color: '#166534',
          }}
        />;
      case 'pending':
        return <Chip 
          label="Pending" 
          size="small"
          sx={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
          }}
        />;
      case 'overdue':
        return <Chip 
          label="Overdue" 
          size="small"
          sx={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
          }}
        />;
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
              <Button
                variant="outlined"
                startIcon={<Download className="w-4 h-4" />}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  borderColor: "#e2e8f0",
                  color: "#374151",
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<BarChart3 className="w-4 h-4" />}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#eff6ff",
                  borderColor: "#3b82f6",
                  color: "#1d4ed8",
                  "&:hover": {
                    backgroundColor: "#dbeafe",
                    borderColor: "#2563eb",
                  },
                }}
              >
                Analytics
              </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <TextField
                placeholder="Search placements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="w-5 h-5 text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                }}
              />

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "14px", color: "#64748b" }}>
                  Status
                </InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "14px", color: "#64748b" }}>
                  Payment Status
                </InputLabel>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  label="Payment Status"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="all">All Payment Status</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "14px", color: "#64748b" }}>
                  Date Range
                </InputLabel>
                <Select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  label="Date Range"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="last_7_days">Last 7 Days</MenuItem>
                  <MenuItem value="last_30_days">Last 30 Days</MenuItem>
                  <MenuItem value="last_90_days">Last 90 Days</MenuItem>
                  <MenuItem value="this_year">This Year</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "14px", color: "#64748b" }}>
                  Commission Range
                </InputLabel>
                <Select
                  value={commissionFilter}
                  onChange={(e) => setCommissionFilter(e.target.value)}
                  label="Commission Range"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="all">All Commissions</MenuItem>
                  <MenuItem value="0-5k">$0 - $5k</MenuItem>
                  <MenuItem value="5k-10k">$5k - $10k</MenuItem>
                  <MenuItem value="10k-20k">$10k - $20k</MenuItem>
                  <MenuItem value="20k+">$20k+</MenuItem>
                </Select>
              </FormControl>
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
                          <Button
                            size="small"
                            sx={{
                              minWidth: 'auto',
                              padding: '4px',
                              color: '#2563eb',
                              '&:hover': {
                                color: '#1d4ed8',
                                backgroundColor: 'rgba(37, 99, 235, 0.04)',
                              },
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="small"
                            sx={{
                              minWidth: 'auto',
                              padding: '4px',
                              color: '#059669',
                              '&:hover': {
                                color: '#047857',
                                backgroundColor: 'rgba(5, 150, 105, 0.04)',
                              },
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="small"
                            sx={{
                              minWidth: 'auto',
                              padding: '4px',
                              color: '#dc2626',
                              '&:hover': {
                                color: '#b91c1c',
                                backgroundColor: 'rgba(220, 38, 38, 0.04)',
                              },
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                {searchTerm || statusFilter !== "all" || paymentFilter !== "all" || dateRangeFilter !== "all" || commissionFilter !== "all"
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