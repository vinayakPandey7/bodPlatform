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
import { adminFetchers } from "@/lib/fetchers";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  agentId: string;
  status: "pending" | "contacted" | "converted" | "declined";
  notes?: string;
  lastPayment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Keep feedback for UI compatibility
  feedback?: ClientFeedback[];
  // Map backend fields to UI expected fields
  joinedDate?: string;
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
  phone: string;
  isActive: boolean;
  clientsCount: number;
  joinedDate: string;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status?: "pending" | "contacted" | "converted" | "declined";
  notes?: string;
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

      // Fetch agent details
      const agentResponse = await adminFetchers.getInsuranceAgent(agentId);
      setAgent(agentResponse.data);

      // Fetch clients for this agent
      const clientsResponse = await fetch(`/api/insurance-clients/agent/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        const formattedClients = clientsData.data?.map((client: any) => ({
          ...client,
          // Map backend fields to UI expected fields for compatibility
          joinedDate: client.createdAt?.split('T')[0] || '',
          lastPayment: client.lastPayment || client.updatedAt?.split('T')[0] || '',
          feedback: client.notes ? [{
            _id: 'note_' + client._id,
            message: client.notes,
            addedBy: 'System',
            addedAt: client.updatedAt || client.createdAt,
            type: 'neutral' as const
          }] : [],
        })) || [];
        setClients(formattedClients);
      } else {
        throw new Error('Failed to fetch clients');
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch agent and clients data");
      toast.error("Failed to load agent and clients");
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

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/insurance-clients/${client._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setClients((prev) => prev.filter((c) => c._id !== client._id));
        toast.success("Client deleted successfully");
        
        // Update agent client count
        if (agent) {
          setAgent(prev => prev ? { ...prev, clientsCount: prev.clientsCount - 1 } : null);
        }
      } else {
        throw new Error('Failed to delete client');
      }
    } catch (error) {
      toast.error("Failed to delete client");
    }
  };

  const handleSubmitClient = async (data: ClientFormData, isEdit: boolean) => {
    try {
      const clientData = {
        ...data,
        agentId,
        status: data.status || 'pending',
      };

      let response;
      if (isEdit && editingClient) {
        // Update existing client
        response = await fetch(`/api/insurance-clients/${editingClient._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(clientData),
        });
      } else {
        // Create new client
        response = await fetch('/api/insurance-clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(clientData),
        });
      }

      if (response.ok) {
        const result = await response.json();
        const formattedClient = {
          ...result.data,
          joinedDate: result.data.createdAt?.split('T')[0] || '',
          lastPayment: result.data.lastPayment || result.data.updatedAt?.split('T')[0] || '',
          feedback: result.data.notes ? [{
            _id: 'note_' + result.data._id,
            message: result.data.notes,
            addedBy: 'System',
            addedAt: result.data.updatedAt || result.data.createdAt,
            type: 'neutral' as const
          }] : [],
        };
        
        if (isEdit && editingClient) {
          setClients(prev => prev.map(c => c._id === editingClient._id ? formattedClient : c));
          toast.success("Client updated successfully");
        } else {
          setClients(prev => [formattedClient, ...prev]);
          toast.success("Client added successfully");
          
          // Update agent client count
          if (agent) {
            setAgent(prev => prev ? { ...prev, clientsCount: prev.clientsCount + 1 } : null);
          }
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save client');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save client");
      throw error; // Let the modal handle the error display
    }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('csv', file);

      const response = await fetch(`/api/insurance-clients/agent/${agentId}/import-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        
        // Refresh the clients list
        await fetchAgentAndClients();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import CSV');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to import CSV");
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
      key: "status",
      label: "Status",
      type: "text",
      responsive: "sm",
      render: (value: string) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'contacted': return 'bg-blue-100 text-blue-800';
            case 'converted': return 'bg-green-100 text-green-800';
            case 'declined': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value || 'pending')}`}>
            {(value || 'pending').charAt(0).toUpperCase() + (value || 'pending').slice(1)}
          </span>
        );
      },
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
            agentId={agentId}
          />
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
