"use client";
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
import { Users, Building2 } from "lucide-react";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { useInsuranceAgentsManagement, InsuranceAgent } from "@/hooks/useInsuranceAgentsManagement";

export default function InsuranceAgentsPage() {
  const router = useRouter();
  const {
    agents,
    isLoading,
    error,
    formData,
    setFormData,
    isAddModalOpen,
    isEditModalOpen,
    editingAgent,
    isCreating,
    isUpdating,
    isDeleting,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmitForm,
    handleCloseModal,
  } = useInsuranceAgentsManagement();

  const handleViewClients = (agent: InsuranceAgent) => {
    router.push(`/admin/insurance-agents/${agent._id}/clients`);
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
    createEditAction(handleEdit),
    createDeleteAction(handleDelete),
  ];

  const totalClients = agents.reduce(
    (sum: number, agent: InsuranceAgent) => sum + agent.clientsCount,
    0
  );

  console.log("vcbcvbvcb",editingAgent)

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {agents.length}
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
          </div>

          {/* Insurance Agents Table */}
          <GenericTable
            data={agents}
            columns={columns}
            actions={actions}
            loading={isLoading}
            error={error ? error.message || "An error occurred" : null}
            title="Insurance Agents"
            searchPlaceholder="Search insurance agents..."
            addButton={{ label: "ADD INSURANCE AGENT", onClick: handleAdd }}
            onRowClick={handleViewClients}
            tableHeight="auto"
            enableTableScroll={false}
            pagination={{
              enabled: true,
              pageSize: 10,
              pageSizeOptions: [5, 10, 25, 50],
              showPageInfo: true,
              showPageSizeSelector: true,
            }}
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
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingAgent ? 'opacity-80 bg-gray-100' : ''}`}
                      required
                      disabled={Boolean(isEditModalOpen)}
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
                      disabled={isCreating || isUpdating}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      disabled={isCreating || isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={isCreating || isUpdating}
                    >
                      {isCreating || isUpdating ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {editingAgent ? 'Updating...' : 'Adding...'}
                        </span>
                      ) : (
                        editingAgent ? "Update" : "Add"
                      )}
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
