"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import DashboardLayout from "@/components/DashboardLayout";
import BreadcrumbNavigation from "@/components/BreadcrumbNavigation";
import {
  GenericTable,
  TableColumn,
  TableAction,
} from "@/components/GenericTable";
import { toast } from "sonner";
import {
  Users,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Eye,
  BarChart3,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Filter,
  Download,
  Plus,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface InsuranceAgent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  isActive: boolean;
  clientsCount: number;
  pendingClients: number;
  completedClients: number;
  commission: number;
  assignedDate: string;
  lastContactDate: string;
  territory: string;
  performance: {
    callsAnswered: number;
    appointmentsSet: number;
    policiesSold: number;
    satisfactionRating: number;
  };
  agentStatus: "active" | "inactive" | "pending" | "suspended";
}

export default function MyAgentsPage() {
  const router = useRouter();

  const [agents, setAgents] = useState<InsuranceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", href: "/sales/dashboard" },
    { label: "My Agents", isActive: true },
  ];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      // Mock data for assigned agents - replace with actual API call
      setAgents([
        {
          _id: "agent_001",
          name: "Alice Johnson",
          email: "alice.johnson@insurance.com",
          phone: "+1-555-1001",
          specialization: ["Auto Insurance", "Home Insurance"],
          isActive: true,
          clientsCount: 45,
          pendingClients: 8,
          completedClients: 37,
          commission: 12500,
          assignedDate: "2024-01-15",
          lastContactDate: "2024-01-20",
          territory: "San Francisco Bay Area",
          performance: {
            callsAnswered: 95,
            appointmentsSet: 23,
            policiesSold: 18,
            satisfactionRating: 4.8,
          },
          agentStatus: "active",
        },
        {
          _id: "agent_002",
          name: "Bob Smith",
          email: "bob.smith@insurance.com",
          phone: "+1-555-1002",
          specialization: [
            "Life Insurance",
            "Health Insurance",
            "Business Insurance",
          ],
          isActive: true,
          clientsCount: 32,
          pendingClients: 12,
          completedClients: 20,
          commission: 8750,
          assignedDate: "2024-02-01",
          lastContactDate: "2024-01-19",
          territory: "Los Angeles Area",
          performance: {
            callsAnswered: 87,
            appointmentsSet: 19,
            policiesSold: 14,
            satisfactionRating: 4.6,
          },
          agentStatus: "active",
        },
        {
          _id: "agent_003",
          name: "Carol Davis",
          email: "carol.davis@insurance.com",
          phone: "+1-555-1003",
          specialization: ["Auto Insurance", "Motorcycle Insurance"],
          isActive: false,
          clientsCount: 28,
          pendingClients: 5,
          completedClients: 23,
          commission: 6200,
          assignedDate: "2023-11-20",
          lastContactDate: "2024-01-10",
          territory: "San Diego Area",
          performance: {
            callsAnswered: 72,
            appointmentsSet: 15,
            policiesSold: 11,
            satisfactionRating: 4.3,
          },
          agentStatus: "inactive",
        },
        {
          _id: "agent_004",
          name: "David Wilson",
          email: "david.wilson@insurance.com",
          phone: "+1-555-1004",
          specialization: ["Commercial Insurance", "Liability Insurance"],
          isActive: true,
          clientsCount: 52,
          pendingClients: 15,
          completedClients: 37,
          commission: 15750,
          assignedDate: "2023-12-01",
          lastContactDate: "2024-01-21",
          territory: "Sacramento Area",
          performance: {
            callsAnswered: 98,
            appointmentsSet: 28,
            policiesSold: 22,
            satisfactionRating: 4.9,
          },
          agentStatus: "active",
        },
        {
          _id: "agent_005",
          name: "Emily Brown",
          email: "emily.brown@insurance.com",
          phone: "+1-555-1005",
          specialization: ["Health Insurance", "Dental Insurance"],
          isActive: true,
          clientsCount: 39,
          pendingClients: 9,
          completedClients: 30,
          commission: 9800,
          assignedDate: "2024-01-10",
          lastContactDate: "2024-01-18",
          territory: "Fresno Area",
          performance: {
            callsAnswered: 89,
            appointmentsSet: 21,
            policiesSold: 16,
            satisfactionRating: 4.7,
          },
          agentStatus: "active",
        },
      ]);
      setError("");
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("Failed to load agents");
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAgentDetails = (agent: InsuranceAgent) => {
    router.push(`/sales/agents/${agent._id}/clients`);
  };

  const handleContactAgent = (agent: InsuranceAgent) => {
    window.open(`mailto:${agent.email}`, "_blank");
  };

  const handleCallAgent = (agent: InsuranceAgent) => {
    window.open(`tel:${agent.phone}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      active: { color: "success" as const, label: "Active" },
      inactive: { color: "error" as const, label: "Inactive" },
      pending: { color: "warning" as const, label: "Pending" },
      suspended: { color: "default" as const, label: "Suspended" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
      />
    );
  };

  // Filter agents based on status and search term
  const filteredAgents = agents.filter((agent) => {
    const matchesStatus =
      filterStatus === "all" || agent.agentStatus === filterStatus;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.territory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Table columns configuration
  const columns: TableColumn<InsuranceAgent>[] = [
    {
      key: "name",
      label: "Agent",
      type: "custom",
      render: (value: string, agent: InsuranceAgent) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      type: "custom",
      render: (value: string, agent: InsuranceAgent) => (
        <div>
          <div className="text-sm text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{agent.phone}</div>
        </div>
      ),
    },
    {
      key: "territory",
      label: "Territory",
      type: "custom",
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: "clientsCount",
      label: "Clients",
      type: "custom",
      render: (value: number, agent: InsuranceAgent) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">
            {agent.pendingClients} pending, {agent.completedClients} complete
          </div>
        </div>
      ),
    },
    {
      key: "commission",
      label: "Commission",
      type: "custom",
      render: (value: number) => (
        <div className="text-sm font-medium text-green-600">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      key: "performance",
      label: "Performance",
      type: "custom",
      render: (value: any, agent: InsuranceAgent) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {agent.performance.satisfactionRating.toFixed(1)}★
          </div>
          <div className="text-xs text-gray-500">
            {agent.performance.policiesSold} policies sold
          </div>
        </div>
      ),
    },
    {
      key: "agentStatus",
      label: "Status",
      type: "custom",
      render: (value: string) => getStatusChip(value),
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
    },
  ];

  const actions: TableAction<InsuranceAgent>[] = [
    {
      label: "View Clients",
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewAgentDetails,
      variant: "default",
    },
    {
      label: "Email",
      icon: <Mail className="w-4 h-4" />,
      onClick: handleContactAgent,
      variant: "default",
    },
    {
      label: "Call",
      icon: <Phone className="w-4 h-4" />,
      onClick: handleCallAgent,
      variant: "success",
    },
  ];

  // Calculate summary statistics
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.agentStatus === "active").length;
  const totalClients = agents.reduce(
    (sum, agent) => sum + agent.clientsCount,
    0
  );
  const totalCommission = agents.reduce(
    (sum, agent) => sum + agent.commission,
    0
  );
  const avgSatisfaction =
    agents.length > 0
      ? (
          agents.reduce(
            (sum, agent) => sum + agent.performance.satisfactionRating,
            0
          ) / agents.length
        ).toFixed(1)
      : "0.0";

  const statisticsCards = [
    {
      title: "Total Agents",
      value: totalAgents.toString(),
      icon: <Users className="w-6 h-6" />,
      color: "primary" as const,
    },
    {
      title: "Active Agents",
      value: activeAgents.toString(),
      icon: <UserCheck className="w-6 h-6" />,
      color: "success" as const,
    },
    {
      title: "Total Clients",
      value: totalClients.toString(),
      icon: <Building2 className="w-6 h-6" />,
      color: "info" as const,
    },
    {
      title: "Total Commission",
      value: formatCurrency(totalCommission),
      icon: <DollarSign className="w-6 h-6" />,
      color: "warning" as const,
    },
    {
      title: "Avg Rating",
      value: `${avgSatisfaction}★`,
      icon: <BarChart3 className="w-6 h-6" />,
      color: "secondary" as const,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["sales_person"]}>
      <DashboardLayout>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Breadcrumbs */}
        <BreadcrumbNavigation items={breadcrumbItems} />

        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              My Agents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your assigned insurance agents and track their performance
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => fetchAgents()}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download className="h-4 w-4" />}
              onClick={() => {
                toast.info("Export feature coming soon!");
              }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 3,
          }}
        >
          {statisticsCards.map((card, index) => (
            <Card
              key={index}
              sx={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "50%",
                      backgroundColor: `${card.color}.light`,
                      color: `${card.color}.main`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Filters and Search */}
        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              gap={3}
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Filter className="h-5 w-5 text-gray-400" />
                <TextField
                  select
                  size="small"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  variant="outlined"
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </TextField>
              </Box>
              <TextField
                size="small"
                placeholder="Search agents by name, email, or territory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                sx={{ minWidth: 300, flexGrow: 1, maxWidth: 500 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Agents Table */}
        <GenericTable
          data={filteredAgents}
          columns={columns}
          actions={actions}
          loading={loading}
          error={error}
          title={`Insurance Agents (${filteredAgents.length})`}
          searchPlaceholder="Search agents..."
          onRowClick={handleViewAgentDetails}
          searchable={false} // We have custom search above
          tableHeight="auto"
          enableTableScroll={false}
        />
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
