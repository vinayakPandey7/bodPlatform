"use client";
import { useEffect, useMemo, useState } from "react";
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
import { Users, UserCheck, Building2 } from "lucide-react";

interface Agent {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface Client {
  _id?: string;
  name: string;
  phone: string;
  email: string;
  salesPersonId?: string;
  salesPersonName?: string;
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
  const [clients, setClients] = useState<Client[]>([
    {
      _id: "c1",
      name: "Client One",
      phone: "+1-555-0201",
      email: "client1@example.com",
      salesPersonId: "sp1",
      salesPersonName: "John Doe",
      status: "active",
      dateAdded: new Date().toISOString(),
    },
    {
      _id: "c2",
      name: "Client Two",
      phone: "+1-555-0202",
      email: "client2@example.com",
      salesPersonId: "sp1",
      salesPersonName: "John Doe",
      status: "pending",
      dateAdded: new Date().toISOString(),
    },
  ]);

  // Handle client updates from CSV upload
  const handleClientsUpdate = (updatedClients: Client[]) => {
    setClients(updatedClients);
  };

  // Handle viewing all clients
  const handleViewAllClients = () => {
    setIsViewClientsModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        render: (value: Agent[]) => (
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
          const salesPersonClients = clients.filter(
            (client) => client.salesPersonId === row._id
          );
          return (
            <span className="text-sm text-gray-600">
              {salesPersonClients.length} client(s)
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
            <div className="flex space-x-4">
              <button
                onClick={handleViewAllClients}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
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
                <span>Manage Clients</span>
              </button>
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
