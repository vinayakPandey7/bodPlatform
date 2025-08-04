"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  GenericTable,
  TableColumn,
  TableAction,
} from "@/components/GenericTable";
import {
  createNameColumn,
  createEmailColumn,
  createStatusColumn,
  createActionsColumn,
  createEditAction,
  createViewAction,
  createDeleteAction,
} from "@/components/table/tableUtils";
import { toast } from "sonner";

interface InsuranceAgent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  isActive: boolean;
  clientsCount: number;
  joinedDate: string;
  commission: number;
}

export default function InsuranceAgentsPage() {
  const router = useRouter();

  const [insuranceAgents, setInsuranceAgents] = useState<InsuranceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<InsuranceAgent | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    commission: 0,
  });

  useEffect(() => {
    fetchInsuranceAgents();
  }, []);

  const fetchInsuranceAgents = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      setInsuranceAgents([
        {
          _id: "1",
          name: "Michael Chen",
          email: "michael.chen@insurance.com",
          phone: "+1-555-1001",
          licenseNumber: "INS-2024-001",
          isActive: true,
          clientsCount: 45,
          joinedDate: "2024-01-15",
          commission: 8.5,
        },
        {
          _id: "2",
          name: "Emily Rodriguez",
          email: "emily.rodriguez@insurance.com",
          phone: "+1-555-1002",
          licenseNumber: "INS-2024-002",
          isActive: true,
          clientsCount: 32,
          joinedDate: "2024-02-20",
          commission: 7.5,
        },
        {
          _id: "3",
          name: "David Thompson",
          email: "david.thompson@insurance.com",
          phone: "+1-555-1003",
          licenseNumber: "INS-2024-003",
          isActive: false,
          clientsCount: 28,
          joinedDate: "2024-01-08",
          commission: 9.0,
        },
        {
          _id: "4",
          name: "Lisa Wang",
          email: "lisa.wang@insurance.com",
          phone: "+1-555-1004",
          licenseNumber: "INS-2024-004",
          isActive: true,
          clientsCount: 67,
          joinedDate: "2023-11-12",
          commission: 10.0,
        },
      ]);
    } catch (err: any) {
      setError("Failed to fetch insurance agents");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      licenseNumber: "",
      commission: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (agent: InsuranceAgent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      licenseNumber: agent.licenseNumber,
      commission: agent.commission,
    });
    setIsEditModalOpen(true);
  };

  const handleViewClients = (agent: InsuranceAgent) => {
    router.push(`/admin/insurance-agents/${agent._id}/clients`);
  };

  const handleToggleStatus = (agent: InsuranceAgent) => {
    setInsuranceAgents((prev) =>
      prev.map((a) =>
        a._id === agent._id ? { ...a, isActive: !a.isActive } : a
      )
    );
    toast.success(
      `Agent ${!agent.isActive ? "activated" : "deactivated"} successfully`
    );
  };

  const handleDeleteAgent = (agent: InsuranceAgent) => {
    if (
      confirm(
        `Are you sure you want to delete ${agent.name}? This will also affect their ${agent.clientsCount} clients.`
      )
    ) {
      setInsuranceAgents((prev) => prev.filter((a) => a._id !== agent._id));
      toast.success("Insurance agent deleted successfully");
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        // Update existing agent
        setInsuranceAgents((prev) =>
          prev.map((agent) =>
            agent._id === editingAgent._id ? { ...agent, ...formData } : agent
          )
        );
        toast.success("Insurance agent updated successfully");
        setIsEditModalOpen(false);
      } else {
        // Add new agent
        const newAgent: InsuranceAgent = {
          _id: Date.now().toString(),
          ...formData,
          isActive: true,
          clientsCount: 0,
          joinedDate: new Date().toISOString().split("T")[0],
        };
        setInsuranceAgents((prev) => [...prev, newAgent]);
        toast.success("Insurance agent added successfully");
        setIsAddModalOpen(false);
      }
      setFormData({
        name: "",
        email: "",
        phone: "",
        licenseNumber: "",
        commission: 0,
      });
      setEditingAgent(null);
    } catch (err) {
      toast.error("Failed to save insurance agent");
    }
  };

  const columns: TableColumn<InsuranceAgent>[] = [
    createNameColumn("name", "Agent Name"),
    createEmailColumn("email", "Email"),
    {
      key: "phone",
      label: "Phone",
      type: "text",
      responsive: "md",
      searchable: true,
    },
    {
      key: "licenseNumber",
      label: "License #",
      type: "text",
      responsive: "lg",
      searchable: true,
      className: "font-mono text-sm",
    },
    {
      key: "clientsCount",
      label: "Clients",
      type: "number",
      responsive: "md",
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value} clients
        </span>
      ),
    },
    {
      key: "commission",
      label: "Commission",
      type: "text",
      responsive: "lg",
      render: (value: number) => (
        <span className="text-sm text-gray-900">{value}%</span>
      ),
    },
    createStatusColumn("isActive", "Status"),
    createActionsColumn(),
  ];

  const actions: TableAction<InsuranceAgent>[] = [
    {
      label: "View Clients",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      onClick: handleViewClients,
      variant: "success",
    },
    createEditAction(handleEdit),
    {
      label: "Toggle Status",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      onClick: handleToggleStatus,
      variant: "warning",
    },
    createDeleteAction(handleDeleteAgent),
  ];

  const activeAgents = insuranceAgents.filter((agent) => agent.isActive);
  const totalClients = insuranceAgents.reduce(
    (sum, agent) => sum + agent.clientsCount,
    0
  );
  const avgCommission =
    insuranceAgents.length > 0
      ? (
          insuranceAgents.reduce((sum, agent) => sum + agent.commission, 0) /
          insuranceAgents.length
        ).toFixed(1)
      : 0;

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Insurance Agents Management
              </h1>
              <p className="text-gray-600">
                Manage insurance agents and view their client portfolios
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Agents
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insuranceAgents.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Agents
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeAgents.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500 bg-opacity-10">
                  <svg
                    className="w-6 h-6 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Clients
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalClients}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Commission
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {avgCommission}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Agents Table */}
          <GenericTable
            data={insuranceAgents}
            columns={columns}
            actions={actions}
            loading={loading}
            error={error}
            title="Insurance Agents"
            searchPlaceholder="Search insurance agents..."
            addButton={{ label: "ADD INSURANCE AGENT", onClick: handleAdd }}
            onRowClick={handleViewClients}
          />

          {/* Add/Edit Insurance Agent Modal */}
          {(isAddModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingAgent
                    ? "Edit Insurance Agent"
                    : "Add Insurance Agent"}
                </h2>
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNumber: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.commission}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commission: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setEditingAgent(null);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          licenseNumber: "",
                          commission: 0,
                        });
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingAgent ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
