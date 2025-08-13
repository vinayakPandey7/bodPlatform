"use client";
import { useState, useEffect, useRef } from "react";
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
import { Users, Building2 } from "lucide-react";
import PhoneNumberInput from "@/components/PhoneNumberInput";

interface InsuranceAgent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  clientsCount: number;
  joinedDate: string;
}

interface Client {
  _id?: string;
  name: string;
  phone: string;
  email: string;
  agentId: string;
  agentName: string;
  status: "pending" | "contacted" | "converted" | "declined";
  notes?: string;
  dateAdded: string;
}

export default function InsuranceAgentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [insuranceAgents, setInsuranceAgents] = useState<InsuranceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<InsuranceAgent | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
          isActive: true,
          clientsCount: 45,
          joinedDate: "2024-01-15",
        },
        {
          _id: "2",
          name: "Emily Rodriguez",
          email: "emily.rodriguez@insurance.com",
          phone: "+1-555-1002",
          isActive: true,
          clientsCount: 32,
          joinedDate: "2024-02-20",
        },
        {
          _id: "3",
          name: "David Thompson",
          email: "david.thompson@insurance.com",
          phone: "+1-555-1003",
          isActive: false,
          clientsCount: 28,
          joinedDate: "2024-01-08",
        },
        {
          _id: "4",
          name: "Lisa Wang",
          email: "lisa.wang@insurance.com",
          phone: "+1-555-1004",
          isActive: true,
          clientsCount: 67,
          joinedDate: "2023-11-12",
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
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (agent: InsuranceAgent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
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
      });
      setEditingAgent(null);
    } catch (err) {
      toast.error("Failed to save insurance agent");
    }
  };

  // CSV handling functions
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const newClients: Client[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length >= 3 && values[0]) {
          const nameIndex = headers.findIndex((h) => h.includes("name"));
          const phoneIndex = headers.findIndex((h) => h.includes("phone"));
          const emailIndex = headers.findIndex((h) => h.includes("email"));
          const agentIndex = headers.findIndex((h) => h.includes("agent"));
          const statusIndex = headers.findIndex((h) => h.includes("status"));
          const notesIndex = headers.findIndex((h) => h.includes("notes"));

          // Find agent by name or assign to first agent if no agent specified
          let agentId = "";
          let agentName = "";
          const agentNameValue = values[agentIndex] || "";

          if (agentNameValue) {
            const foundAgent = insuranceAgents.find((agent) =>
              agent.name.toLowerCase().includes(agentNameValue.toLowerCase())
            );
            if (foundAgent) {
              agentId = foundAgent._id;
              agentName = foundAgent.name;
            }
          }

          // If no agent found or specified, assign to first available agent
          if (!agentId && insuranceAgents.length > 0) {
            agentId = insuranceAgents[0]._id;
            agentName = insuranceAgents[0].name;
          }

          if (agentId) {
            newClients.push({
              _id: Date.now().toString() + i,
              name: values[nameIndex] || "",
              phone: values[phoneIndex] || "",
              email: values[emailIndex] || "",
              agentId,
              agentName,
              status: (values[statusIndex] as any) || "pending",
              notes: values[notesIndex] || "",
              dateAdded: new Date().toISOString(),
            });
          }
        }
      }

      setClients((prev) => [...prev, ...newClients]);

      // Update agent client counts
      const agentClientCounts: { [key: string]: number } = {};
      newClients.forEach((client) => {
        agentClientCounts[client.agentId] =
          (agentClientCounts[client.agentId] || 0) + 1;
      });

      setInsuranceAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          clientsCount:
            agent.clientsCount + (agentClientCounts[agent._id] || 0),
        }))
      );

      toast.success(`Successfully imported ${newClients.length} clients`);
    };

    reader.readAsText(file);
  };

  const handleCSVDownload = () => {
    const csvContent = [
      ["Name", "Phone", "Email", "Agent", "Status", "Notes", "Date Added"].join(
        ","
      ),
      ...clients.map((client) =>
        [
          client.name,
          client.phone,
          client.email,
          client.agentName,
          client.status,
          client.notes || "",
          new Date(client.dateAdded).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent_clients.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewAllClients = () => {
    // Navigate to a clients view page or show modal
    toast.info("Clients view functionality coming soon!");
  };

  const handleDownloadClientList = (agent: InsuranceAgent) => {
    // Generate mock client data for the specific agent
    const mockClients = [
      {
        name: "John Williams",
        email: "john.williams@email.com",
        phone: "+1-555-2001",
        address: "123 Main St, New York, NY 10001",
        joinedDate: "2024-01-15",
        lastPayment: "2024-01-01",
        status: "Active",
      },
      {
        name: "Sarah Davis",
        email: "sarah.davis@email.com",
        phone: "+1-555-2002",
        address: "456 Oak Ave, Los Angeles, CA 90210",
        joinedDate: "2024-02-20",
        lastPayment: "2024-02-01",
        status: "Active",
      },
      {
        name: "Robert Brown",
        email: "robert.brown@email.com",
        phone: "+1-555-2003",
        address: "789 Pine Rd, Chicago, IL 60601",
        joinedDate: "2023-12-10",
        lastPayment: "2023-12-01",
        status: "Inactive",
      },
    ];

    if (mockClients.length === 0) {
      toast.info(`No clients found for ${agent.name}`);
      return;
    }

    const csvHeaders = [
      "name",
      "email",
      "phone",
      "address",
      "joinedDate",
      "lastPayment",
      "status",
    ];
    const csvData = [
      csvHeaders,
      ...mockClients.map((client) => [
        client.name,
        client.email,
        client.phone,
        client.address,
        client.joinedDate,
        client.lastPayment,
        client.status,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${agent.name.replace(/\s+/g, "_")}_clients_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success(`Client list for ${agent.name} downloaded successfully`);
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
    {
      label: "Download List",
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      onClick: handleDownloadClientList,
      variant: "default",
    },
    createEditAction(handleEdit),
    createDeleteAction(handleDeleteAgent),
  ];

  const activeAgents = insuranceAgents.filter((agent) => agent.isActive);
  const totalClients = insuranceAgents.reduce(
    (sum, agent) => sum + agent.clientsCount,
    0
  );

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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-green-500 to-green-600">
                  <Users className="w-6 h-6 text-white" />
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
                <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Building2 className="w-6 h-6 text-white" />
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
                <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <svg
                    className="w-6 h-6 text-white"
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
                    {clients.length}
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
            tableHeight="auto"
            enableTableScroll={false}
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
                    <PhoneNumberInput
                      label="Phone"
                      value={formData.phone}
                      onChange={(value) =>
                        setFormData({ ...formData, phone: value })
                      }
                      className="!py-5"
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
