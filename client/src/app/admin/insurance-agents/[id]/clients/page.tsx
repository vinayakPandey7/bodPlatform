"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  policyNumber: string;
  policyType: string;
  premium: number;
  isActive: boolean;
  joinedDate: string;
  lastPayment: string;
  feedback: ClientFeedback[];
}

interface ClientFeedback {
  _id: string;
  message: string;
  addedBy: string;
  addedAt: string;
  type: "positive" | "negative" | "neutral" | "important";
}

interface InsuranceAgent {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
}

export default function AgentClientsPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<InsuranceAgent | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [feedbackClient, setFeedbackClient] = useState<Client | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    policyType: "",
    premium: 0,
  });

  useEffect(() => {
    fetchAgentAndClients();
  }, [agentId]);

  const fetchAgentAndClients = async () => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API calls
      const mockAgent: InsuranceAgent = {
        _id: agentId,
        name:
          agentId === "1"
            ? "Michael Chen"
            : agentId === "2"
            ? "Emily Rodriguez"
            : agentId === "3"
            ? "David Thompson"
            : "Lisa Wang",
        email:
          agentId === "1"
            ? "michael.chen@insurance.com"
            : agentId === "2"
            ? "emily.rodriguez@insurance.com"
            : agentId === "3"
            ? "david.thompson@insurance.com"
            : "lisa.wang@insurance.com",
        licenseNumber: `INS-2024-00${agentId}`,
      };

      const mockClients: Client[] = [
        {
          _id: "c1",
          name: "John Williams",
          email: "john.williams@email.com",
          phone: "+1-555-2001",
          address: "123 Main St, New York, NY 10001",
          policyNumber: "POL-2024-001",
          policyType: "Life Insurance",
          premium: 250.0,
          isActive: true,
          joinedDate: "2024-01-15",
          lastPayment: "2024-01-01",
          feedback: [
            {
              _id: "f1",
              message:
                "Client is very satisfied with the service. Always pays on time.",
              addedBy: "Agent John Doe",
              addedAt: "2024-01-20",
              type: "positive",
            },
            {
              _id: "f2",
              message:
                "Requesting policy review due to change in circumstances.",
              addedBy: "Admin Sarah",
              addedAt: "2024-02-15",
              type: "neutral",
            },
          ],
        },
        {
          _id: "c2",
          name: "Sarah Davis",
          email: "sarah.davis@email.com",
          phone: "+1-555-2002",
          address: "456 Oak Ave, Los Angeles, CA 90210",
          policyNumber: "POL-2024-002",
          policyType: "Auto Insurance",
          premium: 150.0,
          isActive: true,
          joinedDate: "2024-02-20",
          lastPayment: "2024-02-01",
          feedback: [
            {
              _id: "f3",
              message:
                "Had concerns about claim process but resolved satisfactorily.",
              addedBy: "Customer Service",
              addedAt: "2024-02-25",
              type: "neutral",
            },
          ],
        },
        {
          _id: "c3",
          name: "Robert Brown",
          email: "robert.brown@email.com",
          phone: "+1-555-2003",
          address: "789 Pine Rd, Chicago, IL 60601",
          policyNumber: "POL-2024-003",
          policyType: "Home Insurance",
          premium: 300.0,
          isActive: false,
          joinedDate: "2023-12-10",
          lastPayment: "2023-12-01",
          feedback: [
            {
              _id: "f4",
              message:
                "Client requested policy cancellation due to financial constraints.",
              addedBy: "Agent Mike",
              addedAt: "2024-01-10",
              type: "important",
            },
            {
              _id: "f5",
              message: "Multiple late payments before cancellation.",
              addedBy: "Billing Department",
              addedAt: "2023-12-25",
              type: "negative",
            },
          ],
        },
        {
          _id: "c4",
          name: "Jennifer Martinez",
          email: "jennifer.martinez@email.com",
          phone: "+1-555-2004",
          address: "321 Elm St, Miami, FL 33101",
          policyNumber: "POL-2024-004",
          policyType: "Health Insurance",
          premium: 400.0,
          isActive: true,
          joinedDate: "2024-03-05",
          lastPayment: "2024-03-01",
          feedback: [
            {
              _id: "f6",
              message: "Excellent client, referred 3 new customers.",
              addedBy: "Agent Lisa",
              addedAt: "2024-03-10",
              type: "positive",
            },
          ],
        },
      ];

      setAgent(mockAgent);
      setClients(mockClients);
    } catch (err: any) {
      setError("Failed to fetch agent and clients data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      policyType: "",
      premium: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      policyType: client.policyType,
      premium: client.premium,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (client: Client) => {
    setViewingClient(client);
    setIsViewModalOpen(true);
  };

  const handleViewFeedback = (client: Client) => {
    setFeedbackClient(client);
    setIsFeedbackModalOpen(true);
  };

  const handleToggleStatus = (client: Client) => {
    setClients((prev) =>
      prev.map((c) =>
        c._id === client._id ? { ...c, isActive: !c.isActive } : c
      )
    );
    toast.success(
      `Client ${!client.isActive ? "activated" : "deactivated"} successfully`
    );
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      setClients((prev) => prev.filter((c) => c._id !== client._id));
      toast.success("Client deleted successfully");
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        // Update existing client
        setClients((prev) =>
          prev.map((client) =>
            client._id === editingClient._id
              ? { ...client, ...formData }
              : client
          )
        );
        toast.success("Client updated successfully");
        setIsEditModalOpen(false);
      } else {
        // Add new client
        const newClient: Client = {
          _id: Date.now().toString(),
          ...formData,
          policyNumber: `POL-${Date.now()}`,
          isActive: true,
          joinedDate: new Date().toISOString().split("T")[0],
          lastPayment: new Date().toISOString().split("T")[0],
          feedback: [],
        };
        setClients((prev) => [...prev, newClient]);
        toast.success("Client added successfully");
        setIsAddModalOpen(false);
      }
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        policyType: "",
        premium: 0,
      });
      setEditingClient(null);
    } catch (err) {
      toast.error("Failed to save client");
    }
  };

  const columns: TableColumn<Client>[] = [
    createNameColumn("name", "Client Name"),
    createEmailColumn("email", "Email"),
    {
      key: "phone",
      label: "Phone",
      type: "text",
      responsive: "md",
      searchable: true,
    },
    {
      key: "policyNumber",
      label: "Policy #",
      type: "text",
      responsive: "lg",
      searchable: true,
      className: "font-mono text-sm",
    },
    {
      key: "policyType",
      label: "Policy Type",
      type: "text",
      responsive: "md",
      searchable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {value}
        </span>
      ),
    },
    // {
    //   key: "premium",
    //   label: "Premium",
    //   type: "text",
    //   responsive: "lg",
    //   render: (value: number) => (
    //     <span className="text-sm font-medium text-gray-900">
    //       ${value.toFixed(2)}
    //     </span>
    //   ),
    // },
    {
      key: "feedback",
      label: "Remarks",
      type: "text",
      responsive: "md",
      render: (value: ClientFeedback[]) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value.length} remarks
        </span>
      ),
    },
    createStatusColumn("isActive", "Status"),
    createActionsColumn(),
  ];

  const actions: TableAction<Client>[] = [
    createViewAction(handleView),
    {
      label: "View Remarks",
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      onClick: handleViewFeedback,
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
    createDeleteAction(handleDeleteClient),
  ];

  const activeClients = clients.filter((client) => client.isActive);
  const totalPremiums = clients.reduce(
    (sum, client) => sum + client.premium,
    0
  );
  const policyTypes = [...new Set(clients.map((client) => client.policyType))];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <button
                  onClick={() => router.push("/admin/insurance-agents")}
                  className="hover:text-blue-600 transition-colors"
                >
                  Insurance Agents
                </button>
                <span>/</span>
                <span>{agent?.name}</span>
                <span>/</span>
                <span className="text-gray-900">Clients</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {agent?.name} - Client Portfolio
              </h1>
              <p className="text-gray-600">
                License: {agent?.licenseNumber} • Email: {agent?.email}
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{activeClients.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Premiums</p>
                  <p className="text-2xl font-bold text-gray-900">${totalPremiums.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Policy Types</p>
                  <p className="text-2xl font-bold text-gray-900">{policyTypes.length}</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Clients Table */}
          <GenericTable
            data={clients}
            columns={columns}
            actions={actions}
            loading={loading}
            error={error}
            title="Clients"
            searchPlaceholder="Search clients..."
            addButton={{ label: "ADD CLIENT", onClick: handleAdd }}
          />

          {/* Add/Edit Client Modal */}
          {(isAddModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingClient ? "Edit Client" : "Add Client"}
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
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Type
                    </label>
                    <select
                      value={formData.policyType}
                      onChange={(e) =>
                        setFormData({ ...formData, policyType: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Policy Type</option>
                      <option value="Life Insurance">Life Insurance</option>
                      <option value="Auto Insurance">Auto Insurance</option>
                      <option value="Home Insurance">Home Insurance</option>
                      <option value="Health Insurance">Health Insurance</option>
                      <option value="Business Insurance">
                        Business Insurance
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.premium}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          premium: parseFloat(e.target.value) || 0,
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
                        setEditingClient(null);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          address: "",
                          policyType: "",
                          premium: 0,
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
                      {editingClient ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Client Modal */}
          {isViewModalOpen && viewingClient && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Client Details</h2>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="text-gray-900">{viewingClient.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Policy Number
                      </label>
                      <p className="text-gray-900 font-mono">
                        {viewingClient.policyNumber}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-gray-900">{viewingClient.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p className="text-gray-900">{viewingClient.phone}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <p className="text-gray-900">{viewingClient.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Policy Type
                      </label>
                      <p className="text-gray-900">
                        {viewingClient.policyType}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Premium
                      </label>
                      <p className="text-gray-900">
                        ${viewingClient.premium.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Joined Date
                      </label>
                      <p className="text-gray-900">
                        {viewingClient.joinedDate}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Last Payment
                      </label>
                      <p className="text-gray-900">
                        {viewingClient.lastPayment}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingClient.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {viewingClient.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {isFeedbackModalOpen && feedbackClient && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    Client Remarks - {feedbackClient.name}
                  </h2>
                  <button
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Client Info Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Policy:</span>
                      <p className="font-medium">
                        {feedbackClient.policyNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{feedbackClient.policyType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Premium:</span>
                      <p className="font-medium">
                        ${feedbackClient.premium.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          feedbackClient.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {feedbackClient.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remarks History */}
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    All Remarks ({feedbackClient.feedback.length})
                  </h3>
                  {feedbackClient.feedback.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p>No remarks available for this client</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {feedbackClient.feedback
                        .sort(
                          (a, b) =>
                            new Date(b.addedAt).getTime() -
                            new Date(a.addedAt).getTime()
                        )
                        .map((feedback) => (
                          <div
                            key={feedback._id}
                            className={`p-4 rounded-lg border-l-4 ${
                              feedback.type === "positive"
                                ? "bg-green-50 border-green-400"
                                : feedback.type === "negative"
                                ? "bg-red-50 border-red-400"
                                : feedback.type === "important"
                                ? "bg-yellow-50 border-yellow-400"
                                : "bg-gray-50 border-gray-400"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    feedback.type === "positive"
                                      ? "bg-green-100 text-green-800"
                                      : feedback.type === "negative"
                                      ? "bg-red-100 text-red-800"
                                      : feedback.type === "important"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {feedback.type.charAt(0).toUpperCase() +
                                    feedback.type.slice(1)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {feedback.addedAt}
                              </div>
                            </div>
                            <p className="text-gray-900 mb-2">
                              {feedback.message}
                            </p>
                            <div className="text-sm text-gray-600">
                              Added by:{" "}
                              <span className="font-medium">
                                {feedback.addedBy}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
