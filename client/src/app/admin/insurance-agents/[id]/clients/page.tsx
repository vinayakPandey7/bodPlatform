"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  FileUpload as FileUploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import BreadcrumbNavigation from "@/components/BreadcrumbNavigation";
import InsuranceClientModal from "@/components/InsuranceClientModal";
import InsuranceClientDetailsModal from "@/components/InsuranceClientDetailsModal";
import InsuranceClientFeedbackModal from "@/components/InsuranceClientFeedbackModal";
import CSVUploadModal from "@/components/CSVUploadModal";
import {
  GenericTable,
  TableColumn,
  TableAction,
} from "@/components/GenericTable";
import {
  createNameColumn,
  createEmailColumn,
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
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function AgentClientsPage() {
  const params = useParams();
  const agentId = params.id as string;

  // State management
  const [agent, setAgent] = useState<InsuranceAgent | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCSVUploadModalOpen, setIsCSVUploadModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [feedbackClient, setFeedbackClient] = useState<Client | null>(null);

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
      };

      const mockClients: Client[] = [
        {
          _id: "c1",
          name: "John Williams",
          email: "john.williams@email.com",
          phone: "+1-555-2001",
          address: "123 Main St, New York, NY 10001",
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
    setEditingClient(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsAddEditModalOpen(true);
  };

  const handleView = (client: Client) => {
    setViewingClient(client);
    setIsDetailsModalOpen(true);
  };

  const handleViewFeedback = (client: Client) => {
    setFeedbackClient(client);
    setIsFeedbackModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      setClients((prev) => prev.filter((c) => c._id !== client._id));
      toast.success("Client deleted successfully");
    }
  };

  const handleSubmitClient = async (data: ClientFormData, isEdit: boolean) => {
    try {
      if (isEdit && editingClient) {
        // Update existing client
        setClients((prev) =>
          prev.map((client) =>
            client._id === editingClient._id
              ? { ...client, ...data }
              : client
          )
        );
      } else {
        // Add new client
        const newClient: Client = {
          _id: Date.now().toString(),
          ...data,
          isActive: true,
          joinedDate: new Date().toISOString().split("T")[0],
          lastPayment: new Date().toISOString().split("T")[0],
          feedback: [],
        };
        setClients((prev) => [...prev, newClient]);
      }
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
  };

  const handleCSVUpload = async (newClients: Omit<Client, '_id' | 'feedback'>[]) => {
    try {
      const clientsWithIds: Client[] = newClients.map(client => ({
        ...client,
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        feedback: [],
      }));
      
      setClients(prev => [...prev, ...clientsWithIds]);
      toast.success(`Successfully imported ${newClients.length} clients`);
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
  };

  const handleDownloadClients = () => {
    if (clients.length === 0) {
      toast.info("No clients to download");
      return;
    }

    const csvHeaders = ["name", "email", "phone", "address", "joinedDate", "lastPayment", "status"];
    const csvData = [
      csvHeaders,
      ...clients.map(client => [
        client.name,
        client.email,
        client.phone,
        client.address,
        client.joinedDate,
        client.lastPayment,
        client.isActive ? "Active" : "Inactive"
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${agent?.name || 'agent'}_clients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success("Client list downloaded successfully");
  };

  const breadcrumbItems = [
    { label: "Insurance Agents", href: "/admin/insurance-agents" },
    { label: agent?.name || "Agent", href: undefined },
    { label: "Clients" },
  ];

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
    createDeleteAction(handleDeleteClient),
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress size={60} />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Header Section */}
          <Box>
            <BreadcrumbNavigation items={breadcrumbItems} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {agent?.name} - Client Portfolio
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<FileUploadIcon />}
                  onClick={() => setIsCSVUploadModalOpen(true)}
                >
                  Import CSV
                </Button>
               
              </Box>
            </Box>
          </Box>

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
            tableHeight="auto"
            enableTableScroll={false}
          />

          {/* Modals */}
          <InsuranceClientModal
            open={isAddEditModalOpen}
            onClose={() => setIsAddEditModalOpen(false)}
            client={editingClient}
            onSubmit={handleSubmitClient}
          />

          <InsuranceClientDetailsModal
            open={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            client={viewingClient}
          />

          <InsuranceClientFeedbackModal
            open={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            client={feedbackClient}
          />

          <CSVUploadModal
            open={isCSVUploadModalOpen}
            onClose={() => setIsCSVUploadModalOpen(false)}
            onUpload={handleCSVUpload}
            agentName={agent?.name}
          />
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
