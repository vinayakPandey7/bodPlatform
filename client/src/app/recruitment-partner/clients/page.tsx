"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Client {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  industry: string;
  companySize: string;
  contractValue: number;
  activePositions: number;
  totalPlacements: number;
  successRate: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'prospect';
  contractStartDate: string;
  contractEndDate: string;
  paymentTerms: string;
  notes: string;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  averageContractValue: number;
  thisMonthRevenue: number;
  pendingContracts: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    averageContractValue: 0,
    thisMonthRevenue: 0,
    pendingContracts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // For now, we'll use placeholder data
      const mockClients: Client[] = [
        {
          _id: "1",
          companyName: "TechCorp Solutions",
          contactPerson: "John Smith",
          email: "john@techcorp.com",
          phone: "+1-555-0123",
          address: "123 Tech Street",
          city: "San Francisco",
          state: "CA",
          industry: "Technology",
          companySize: "100-500",
          contractValue: 50000,
          activePositions: 3,
          totalPlacements: 8,
          successRate: 85,
          lastActivity: "2024-01-15",
          status: "active",
          contractStartDate: "2023-06-01",
          contractEndDate: "2024-12-31",
          paymentTerms: "Net 30",
          notes: "Great client, very responsive"
        },
        {
          _id: "2",
          companyName: "InnovateLab",
          contactPerson: "Sarah Johnson",
          email: "sarah@innovatelab.com",
          phone: "+1-555-0124",
          address: "456 Innovation Ave",
          city: "Austin",
          state: "TX",
          industry: "Healthcare",
          companySize: "50-100",
          contractValue: 35000,
          activePositions: 2,
          totalPlacements: 5,
          successRate: 90,
          lastActivity: "2024-01-14",
          status: "active",
          contractStartDate: "2023-08-01",
          contractEndDate: "2024-08-31",
          paymentTerms: "Net 45",
          notes: "Growing company, good opportunities"
        },
        {
          _id: "3",
          companyName: "StartupXYZ",
          contactPerson: "Mike Wilson",
          email: "mike@startupxyz.com",
          phone: "+1-555-0125",
          address: "789 Startup Blvd",
          city: "Seattle",
          state: "WA",
          industry: "Finance",
          companySize: "10-50",
          contractValue: 25000,
          activePositions: 1,
          totalPlacements: 2,
          successRate: 75,
          lastActivity: "2024-01-10",
          status: "prospect",
          contractStartDate: "2024-01-01",
          contractEndDate: "2024-12-31",
          paymentTerms: "Net 30",
          notes: "New client, potential for growth"
        }
      ];

      setClients(mockClients);
      
      // Calculate stats
      const totalClients = mockClients.length;
      const activeClients = mockClients.filter(c => c.status === 'active').length;
      const totalRevenue = mockClients.reduce((sum, client) => sum + client.contractValue, 0);
      const averageContractValue = totalRevenue / totalClients;
      const thisMonthRevenue = mockClients.reduce((sum, client) => {
        const startDate = new Date(client.contractStartDate);
        const now = new Date();
        if (startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()) {
          return sum + client.contractValue;
        }
        return sum;
      }, 0);
      const pendingContracts = mockClients.filter(c => c.status === 'prospect').length;

      setStats({
        totalClients,
        activeClients,
        totalRevenue,
        averageContractValue,
        thisMonthRevenue,
        pendingContracts,
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesIndustry = industryFilter === "all" || client.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const handleAddClient = () => {
    setShowAddModal(true);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleEditClient = (client: Client) => {
    // Navigate to edit page or open edit modal
    console.log("Edit client:", client);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      setClients(clients.filter(c => c._id !== clientId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Inactive
        </span>;
      case 'prospect':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Prospect
        </span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
        <DashboardLayout>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Management</h1>
              <p className="text-gray-600">Manage your client relationships and contracts</p>
            </div>
            <button
              onClick={handleAddClient}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Client
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Clients */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalClients}</div>
                  <div className="text-sm text-gray-600">Total Clients</div>
                </div>
              </div>
            </div>

            {/* Active Clients */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.activeClients}</div>
                  <div className="text-sm text-gray-600">Active Clients</div>
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

            {/* Average Contract Value */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">${(stats.averageContractValue / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-gray-600">Avg Contract Value</div>
                </div>
              </div>
            </div>

            {/* This Month Revenue */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">${(stats.thisMonthRevenue / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-gray-600">This Month Revenue</div>
                </div>
              </div>
            </div>

            {/* Pending Contracts */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stats.pendingContracts}</div>
                  <div className="text-sm text-gray-600">Pending Contracts</div>
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
                  placeholder="Search clients..."
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
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Client List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contract Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.companyName}</div>
                          <div className="text-sm text-gray-500">{client.industry} • {client.companySize}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.contactPerson}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(client.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${client.contractValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{client.paymentTerms}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.totalPlacements}</div>
                        <div className="text-sm text-gray-500">{client.activePositions} active</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{client.successRate}%</div>
                          {client.successRate >= 80 ? (
                            <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 ml-1" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(client.lastActivity).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="text-green-600 hover:text-green-900 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
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
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" || industryFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Get started by adding your first client."}
              </p>
              {!searchTerm && statusFilter === "all" && industryFilter === "all" && (
                <div className="mt-6">
                  <button
                    onClick={handleAddClient}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
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