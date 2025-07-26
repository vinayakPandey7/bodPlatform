"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ClientModal from "@/components/ClientModal";
import api from "@/lib/api";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Collapse,
  InputAdornment,
} from "@mui/material";
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
  ChevronDown,
  ChevronUp,
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
  const [companySizeFilter, setCompanySizeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [contractValueFilter, setContractValueFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
    const matchesCompanySize = companySizeFilter === "all" || client.companySize === companySizeFilter;
    const matchesLocation = !locationFilter || 
      client.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
      client.state.toLowerCase().includes(locationFilter.toLowerCase());
    
    let matchesContractValue = true;
    if (contractValueFilter !== "all") {
      const value = client.contractValue;
      switch (contractValueFilter) {
        case "0-25k":
          matchesContractValue = value <= 25000;
          break;
        case "25k-50k":
          matchesContractValue = value > 25000 && value <= 50000;
          break;
        case "50k-100k":
          matchesContractValue = value > 50000 && value <= 100000;
          break;
        case "100k+":
          matchesContractValue = value > 100000;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesIndustry && matchesCompanySize && matchesLocation && matchesContractValue;
  });

  const handleAddClient = () => {
    setSelectedClient(null);
    setModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  const handleModalSuccess = () => {
    fetchClients(); // Refresh the clients list
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      setClients(clients.filter(c => c._id !== clientId));
    }
  };

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
      case 'inactive':
        return <Chip 
          icon={<Clock className="w-3 h-3" />}
          label="Inactive" 
          size="small"
          sx={{
            backgroundColor: '#f3f4f6',
            color: '#374151',
            '& .MuiChip-icon': {
              color: '#374151',
            }
          }}
        />;
      case 'prospect':
        return <Chip 
          icon={<AlertCircle className="w-3 h-3" />}
          label="Prospect" 
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
            <Button
              onClick={handleAddClient}
              variant="contained"
              startIcon={<Plus className="w-5 h-5" />}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                padding: '12px 24px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              Add New Client
            </Button>
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
              <TextField
                placeholder="Search clients..."
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
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "14px", color: "#64748b" }}>
                  Industry
                </InputLabel>
                <Select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  label="Industry"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="all">All Industries</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                  <MenuItem value="Retail">Retail</MenuItem>
                </Select>
              </FormControl>

              <Button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                variant="outlined"
                startIcon={<Filter className="w-4 h-4" />}
                endIcon={showMoreFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                More Filters
              </Button>
            </div>

            {/* More Filters Section */}
            <Collapse in={showMoreFilters}>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: "14px", color: "#64748b" }}>
                      Company Size
                    </InputLabel>
                    <Select
                      value={companySizeFilter}
                      onChange={(e) => setCompanySizeFilter(e.target.value)}
                      label="Company Size"
                      variant="outlined"
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e2e8f0",
                        },
                      }}
                    >
                      <MenuItem value="all">All Sizes</MenuItem>
                      <MenuItem value="1-10">1-10 employees</MenuItem>
                      <MenuItem value="10-50">10-50 employees</MenuItem>
                      <MenuItem value="50-100">50-100 employees</MenuItem>
                      <MenuItem value="100-500">100-500 employees</MenuItem>
                      <MenuItem value="500+">500+ employees</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    placeholder="Location (City/State)"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
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
                      Contract Value
                    </InputLabel>
                    <Select
                      value={contractValueFilter}
                      onChange={(e) => setContractValueFilter(e.target.value)}
                      label="Contract Value"
                      variant="outlined"
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e2e8f0",
                        },
                      }}
                    >
                      <MenuItem value="all">All Values</MenuItem>
                      <MenuItem value="0-25k">$0 - $25k</MenuItem>
                      <MenuItem value="25k-50k">$25k - $50k</MenuItem>
                      <MenuItem value="50k-100k">$50k - $100k</MenuItem>
                      <MenuItem value="100k+">$100k+</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </Collapse>
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
                          <Button
                            onClick={() => handleViewClient(client)}
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
                            onClick={() => handleEditClient(client)}
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
                            onClick={() => handleDeleteClient(client._id)}
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
                  <Button
                    onClick={handleAddClient}
                    variant="contained"
                    startIcon={<Plus className="w-4 h-4" />}
                    sx={{
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      },
                    }}
                  >
                    Add Client
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Client Modal */}
        <ClientModal
          open={modalOpen}
          onClose={handleModalClose}
          client={selectedClient}
          onSuccess={handleModalSuccess}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
} 