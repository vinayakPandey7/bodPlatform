"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Clock,
  Building2,
  Star,
} from "lucide-react";

interface ReportData {
  monthlyRevenue: { month: string; revenue: number }[];
  placementTrends: { month: string; placements: number }[];
  clientPerformance: { client: string; placements: number; revenue: number }[];
  candidateSuccess: { candidate: string; interviews: number; placements: number; successRate: number }[];
  industryBreakdown: { industry: string; placements: number; percentage: number }[];
  timeToPlace: { role: string; averageDays: number }[];
}

interface ReportStats {
  totalRevenue: number;
  totalPlacements: number;
  averageCommission: number;
  successRate: number;
  averageTimeToPlace: number;
  activeClients: number;
  totalCandidates: number;
  thisMonthGrowth: number;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    monthlyRevenue: [],
    placementTrends: [],
    clientPerformance: [],
    candidateSuccess: [],
    industryBreakdown: [],
    timeToPlace: [],
  });
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalPlacements: 0,
    averageCommission: 0,
    successRate: 0,
    averageTimeToPlace: 0,
    activeClients: 0,
    totalCandidates: 0,
    thisMonthGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last12months");

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      // Mock data
      const mockReportData: ReportData = {
        monthlyRevenue: [
          { month: "Jan", revenue: 45000 },
          { month: "Feb", revenue: 52000 },
          { month: "Mar", revenue: 48000 },
          { month: "Apr", revenue: 61000 },
          { month: "May", revenue: 55000 },
          { month: "Jun", revenue: 67000 },
          { month: "Jul", revenue: 59000 },
          { month: "Aug", revenue: 72000 },
          { month: "Sep", revenue: 65000 },
          { month: "Oct", revenue: 78000 },
          { month: "Nov", revenue: 71000 },
          { month: "Dec", revenue: 85000 },
        ],
        placementTrends: [
          { month: "Jan", placements: 3 },
          { month: "Feb", placements: 4 },
          { month: "Mar", placements: 3 },
          { month: "Apr", placements: 5 },
          { month: "May", placements: 4 },
          { month: "Jun", placements: 6 },
          { month: "Jul", placements: 5 },
          { month: "Aug", placements: 7 },
          { month: "Sep", placements: 6 },
          { month: "Oct", placements: 8 },
          { month: "Nov", placements: 7 },
          { month: "Dec", placements: 9 },
        ],
        clientPerformance: [
          { client: "TechCorp", placements: 8, revenue: 95000 },
          { client: "InnovateLab", placements: 5, revenue: 120000 },
          { client: "DesignStudio", placements: 3, revenue: 85000 },
          { client: "CloudTech", placements: 4, revenue: 88000 },
          { client: "StartupXYZ", placements: 2, revenue: 25000 },
        ],
        candidateSuccess: [
          { candidate: "John Smith", interviews: 5, placements: 1, successRate: 20 },
          { candidate: "Sarah Johnson", interviews: 3, placements: 1, successRate: 33 },
          { candidate: "Mike Wilson", interviews: 4, placements: 1, successRate: 25 },
          { candidate: "Emily Chen", interviews: 2, placements: 1, successRate: 50 },
          { candidate: "David Brown", interviews: 3, placements: 0, successRate: 0 },
        ],
        industryBreakdown: [
          { industry: "Technology", placements: 12, percentage: 40 },
          { industry: "Healthcare", placements: 8, percentage: 27 },
          { industry: "Finance", placements: 5, percentage: 17 },
          { industry: "Manufacturing", placements: 3, percentage: 10 },
          { industry: "Retail", placements: 2, percentage: 6 },
        ],
        timeToPlace: [
          { role: "Software Engineer", averageDays: 18 },
          { role: "Product Manager", averageDays: 25 },
          { role: "UX Designer", averageDays: 22 },
          { role: "DevOps Engineer", averageDays: 20 },
          { role: "Data Scientist", averageDays: 28 },
        ],
      };

      setReportData(mockReportData);

      // Calculate stats
      const totalRevenue = mockReportData.monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
      const totalPlacements = mockReportData.placementTrends.reduce((sum, item) => sum + item.placements, 0);
      const averageCommission = totalRevenue / totalPlacements;
      const successRate = 78; // Mock value
      const averageTimeToPlace = 23; // Mock value
      const activeClients = 8; // Mock value
      const totalCandidates = 247; // Mock value
      const thisMonthGrowth = 12; // Mock value

      setStats({
        totalRevenue,
        totalPlacements,
        averageCommission,
        successRate,
        averageTimeToPlace,
        activeClients,
        totalCandidates,
        thisMonthGrowth,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Track your performance and business insights</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="last12months">Last 12 Months</option>
                <option value="last6months">Last 6 Months</option>
                <option value="last3months">Last 3 Months</option>
                <option value="thisyear">This Year</option>
                <option value="lastyear">Last Year</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">${(stats.totalRevenue / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="flex items-center justify-end mt-1">
                    {getGrowthIcon(stats.thisMonthGrowth)}
                    <span className="text-xs text-gray-500 ml-1">{stats.thisMonthGrowth}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Placements */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalPlacements}</div>
                  <div className="text-sm text-gray-600">Total Placements</div>
                  <div className="flex items-center justify-end mt-1">
                    {getGrowthIcon(8)}
                    <span className="text-xs text-gray-500 ml-1">8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.successRate}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="flex items-center justify-end mt-1">
                    {getGrowthIcon(5)}
                    <span className="text-xs text-gray-500 ml-1">5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Time to Place */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.averageTimeToPlace}</div>
                  <div className="text-sm text-gray-600">Avg Days to Place</div>
                  <div className="flex items-center justify-end mt-1">
                    {getGrowthIcon(-3)}
                    <span className="text-xs text-gray-500 ml-1">-3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Trend */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <LineChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-end justify-between space-x-2">
                {reportData.monthlyRevenue.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t"
                      style={{ height: `${(item.revenue / 85000) * 200}px` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Monthly revenue over the last 12 months</p>
              </div>
            </div>

            {/* Placement Trends */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Placement Trends</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-end justify-between space-x-2">
                {reportData.placementTrends.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-600 rounded-t"
                      style={{ height: `${(item.placements / 9) * 200}px` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Monthly placements over the last 12 months</p>
              </div>
            </div>
          </div>

          {/* Performance Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Clients */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Clients</h3>
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {reportData.clientPerformance.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{client.client}</div>
                      <div className="text-sm text-gray-500">{client.placements} placements</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${(client.revenue / 1000).toFixed(0)}k</div>
                      <div className="text-sm text-gray-500">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Breakdown */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Industry Breakdown</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {reportData.industryBreakdown.map((industry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{
                          backgroundColor: [
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6'
                          ][index % 5]
                        }}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900">{industry.industry}</div>
                        <div className="text-sm text-gray-500">{industry.placements} placements</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{industry.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidate Success Rates */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Candidate Success Rates</h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {reportData.candidateSuccess.map((candidate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{candidate.candidate}</div>
                      <div className="text-sm text-gray-500">{candidate.interviews} interviews</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{candidate.successRate}%</div>
                      <div className="text-sm text-gray-500">{candidate.placements} placements</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time to Place by Role */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Time to Place by Role</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {reportData.timeToPlace.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{role.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{role.averageDays} days</div>
                      <div className="text-sm text-gray-500">Average</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 