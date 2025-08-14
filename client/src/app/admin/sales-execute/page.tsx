"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
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
  createActionsColumn,
  createEditAction,
  createDeleteAction,
} from "@/components/table/tableUtils";
import SalesPersonForm from "@/components/admin/SalesPersonForm";
import AgentAssignmentModal from "@/components/admin/AgentAssignmentModal";
import ClientsModal from "@/components/admin/ClientsModal";
import StatisticsCards from "@/components/admin/StatisticsCards";
import { useSalesPersonManagement } from "@/hooks/useSalesPersonManagement";
import { adminFetchers } from "@/lib/fetchers";
import { toast } from "sonner";
import { Users, UserCheck, Building2 } from "lucide-react";

interface Agent {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface AssignedAgent {
  agentId: string;
  agentName: string;
  agentEmail: string;
  assignedDate: string;
  isActive: boolean;
}

interface Client {
  _id?: string;
  name: string;
  phone: string;
  email: string;
  salesPersonId?: string;
  salesPersonName?: string;
  agentId?: string;
  agentIdString?: string;
  agentName?: string;
  status?: string;
  notes?: string;
  dateAdded?: string;
}

export default function SalesExecutePage() {
  const router = useRouter();

  // Sales person management hook
  const {
    salesPersons,
    agents,
    loading,
    error,
    isAddModalOpen,
    isEditModalOpen,
    editingSalesPerson,
    formData,
    isAssignModalOpen,
    selectedSalesPerson,
    selectedAgentIds,
    fetchData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmitForm,
    handleCloseModal,
    handleFormDataChange,
    handleAssignAgents,
    handleAgentToggle,
    handleAssignAgentsSubmit,
    handleCloseAssignModal,
  } = useSalesPersonManagement();

  // Client modal state and management
  const [isViewClientsModalOpen, setIsViewClientsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Fetch real client data
  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      console.log("Fetching all insurance clients...");
      
      const response = await adminFetchers.getAllInsuranceClients();
      console.log("Clients response:", response);
      
      // Transform client data to match expected interface
      const transformedClients: Client[] = (response.data || []).map((client: any) => ({
        _id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        salesPersonId: client.agentId?._id || client.agentId, // Use agent ID for mapping
        salesPersonName: client.agentId?.name || "Unassigned",
        // Store both ObjectId and string version of agent ID for comparison
        agentId: client.agentId?._id || client.agentId, // ObjectId version
        agentIdString: client.agentId?._id?.toString() || client.agentId?.toString(), // String version
        agentName: client.agentId?.name || "Unassigned",
        status: client.status || "pending",
        notes: client.notes || "",
        dateAdded: client.createdAt || new Date().toISOString(),
      }));
      
      console.log("Transformed clients:", transformedClients);
      setClients(transformedClients);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  // Handle client updates from CSV upload
  const handleClientsUpdate = (updatedClients: Client[]) => {
    setClients(updatedClients);
  };

  // Handle viewing all clients
  const handleViewAllClients = () => {
    setIsViewClientsModalOpen(true);
  };

  useEffect(() => {
    console.log("Sales Execute Page: Component mounted, fetching data...");
    fetchData();
    fetchClients();
  }, [fetchData, fetchClients]);

  // Debug: Log when clients or salesPersons change
  useEffect(() => {
    console.log("Sales Execute Page: Clients updated:", clients.length, clients);
  }, [clients]);

  useEffect(() => {
    console.log("Sales Execute Page: Sales persons updated:", salesPersons.length, salesPersons);
  }, [salesPersons]);

  // Memoized table columns
  const columns: TableColumn<any>[] = useMemo(
    () => [
      createNameColumn("name", "Sales Person"),
      createEmailColumn("email", "Email"),
      {
        key: "phone",
        label: "Phone",
        type: "text",
        responsive: "md",
        searchable: true,
      },
      {
        key: "assignedAgents",
        label: "Assigned Agents",
        type: "text",
        responsive: "lg",
        render: (value: AssignedAgent[]) => (
          <span className="text-sm text-gray-600">
            {value.length > 0
              ? `${value.length} agent(s)`
              : "No agents assigned"}
          </span>
        ),
      },
      {
        key: "clientsCount",
        label: "Clients",
        type: "text",
        responsive: "lg",
        render: (value: number, row: any) => {
          // Calculate total clients through assigned insurance agents
          const assignedAgents = row.assignedAgents || [];
          // Use agentId field from the embedded assignedAgents documents
          const assignedAgentIds = assignedAgents.map((agent: any) => agent.agentId);
          
          console.log(`Sales Execute: Calculating clients for ${row.name}:`, {
            assignedAgents: assignedAgents.length,
            assignedAgentIds,
            totalClients: clients.length,
            clients: clients.map(c => ({ name: c.name, agentId: c.agentId, agentIdString: c.agentIdString }))
          });
          
          // Count clients that belong to any of the assigned agents
          // Try matching with both ObjectId and string versions
          const totalClients = clients.filter((client) => 
            assignedAgentIds.includes(client.agentId) || 
            assignedAgentIds.includes(client.agentIdString)
          ).length;
          
          console.log(`Sales Execute: Found ${totalClients} clients for ${row.name}`);
          
          return (
            <span className="text-sm text-gray-600">
              {totalClients} client(s)
            </span>
          );
        },
      },
      createActionsColumn(),
    ],
    [clients]
  );

  // Memoized table actions
  const actions: TableAction<any>[] = useMemo(
    () => [
      createEditAction(handleEdit),
      {
        label: "Assign Agents",
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        onClick: handleAssignAgents,
        variant: "success",
      },
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
        onClick: handleViewAllClients,
        variant: "default",
      },
      createDeleteAction(handleDelete),
    ],
    [handleEdit, handleAssignAgents, handleDelete]
  );

  // Memoized statistics data
  const statisticsData = useMemo(
    () => [
      {
        title: "Total Sales Persons",
        value: salesPersons.length,
        icon: <Users className="w-6 h-6" />,
        color: "bg-blue-500",
      },
      {
        title: "Available Agents",
        value: agents.length,
        icon: <UserCheck className="w-6 h-6" />,
        color: "bg-green-500",
      },
      {
        title: "Total Clients",
        value: clients.length,
        icon: <Building2 className="w-6 h-6" />,
        color: "bg-purple-500",
      },
    ],
    [salesPersons.length, agents.length, clients.length]
  );

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sales Execute Management
              </h1>
              <p className="text-gray-600">
                Manage sales persons and assign agents to them
              </p>
            </div>
            
          </div>

          {/* Statistics Cards */}
          <StatisticsCards stats={statisticsData} />

          {/* Sales Persons Table */}
          <GenericTable
            data={salesPersons}
            columns={columns}
            actions={actions}
            loading={loading}
            error={error}
            title="Sales Persons"
            searchPlaceholder="Search sales persons..."
            addButton={{ label: "ADD SALES PERSON", onClick: handleAdd }}
            tableHeight="auto"
            enableTableScroll={false}
          />

          {/* Modals */}
          <SalesPersonForm
            open={isAddModalOpen || isEditModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitForm}
            editingPerson={editingSalesPerson}
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />

          <AgentAssignmentModal
            open={isAssignModalOpen}
            onClose={handleCloseAssignModal}
            onSubmit={handleAssignAgentsSubmit}
            salesPerson={selectedSalesPerson}
            agents={agents}
            selectedAgentIds={selectedAgentIds}
            onAgentToggle={handleAgentToggle}
          />

          <ClientsModal
            open={isViewClientsModalOpen}
            onClose={() => setIsViewClientsModalOpen(false)}
            clients={clients}
            onClientsUpdate={handleClientsUpdate}
            salesPersons={salesPersons}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
