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

interface SalesPerson {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  assignedAgents: Agent[];
  createdAt: string;
}

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
}

export default function SalesExecutePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewClientsModalOpen, setIsViewClientsModalOpen] = useState(false);
  const [selectedSalesPerson, setSelectedSalesPerson] =
    useState<SalesPerson | null>(null);
  const [editingSalesPerson, setEditingSalesPerson] =
    useState<SalesPerson | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      setSalesPersons([
        {
          _id: "1",
          name: "John Smith",
          email: "john.smith@example.com",
          phone: "+1-555-0101",
          isActive: true,
          assignedAgents: [
            {
              _id: "a1",
              name: "Agent Alice",
              email: "alice@example.com",
              isActive: true,
            },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          phone: "+1-555-0102",
          isActive: true,
          assignedAgents: [],
          createdAt: new Date().toISOString(),
        },
      ]);

      setAgents([
        {
          _id: "a1",
          name: "Agent Alice",
          email: "alice@example.com",
          isActive: true,
        },
        {
          _id: "a2",
          name: "Agent Bob",
          email: "bob@example.com",
          isActive: true,
        },
        {
          _id: "a3",
          name: "Agent Charlie",
          email: "charlie@example.com",
          isActive: true,
        },
      ]);

      setClients([
        {
          _id: "c1",
          name: "Client One",
          phone: "+1-555-0201",
          email: "client1@example.com",
        },
        {
          _id: "c2",
          name: "Client Two",
          phone: "+1-555-0202",
          email: "client2@example.com",
        },
      ]);
    } catch (err: any) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: "", email: "", phone: "" });
    setIsAddModalOpen(true);
  };

  const handleEdit = (salesPerson: SalesPerson) => {
    setEditingSalesPerson(salesPerson);
    setFormData({
      name: salesPerson.name,
      email: salesPerson.email,
      phone: salesPerson.phone,
    });
    setIsEditModalOpen(true);
  };

  const handleAssignAgents = (salesPerson: SalesPerson) => {
    setSelectedSalesPerson(salesPerson);
    setSelectedAgentIds(salesPerson.assignedAgents.map((agent) => agent._id));
    setIsAssignModalOpen(true);
  };

  const handleViewClients = () => {
    setIsViewClientsModalOpen(true);
  };

  const handleDeleteSalesPerson = (salesPerson: SalesPerson) => {
    if (confirm(`Are you sure you want to delete ${salesPerson.name}?`)) {
      setSalesPersons((prev) =>
        prev.filter((sp) => sp._id !== salesPerson._id)
      );
      toast.success("Sales person deleted successfully");
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSalesPerson) {
        // Update existing sales person
        setSalesPersons((prev) =>
          prev.map((sp) =>
            sp._id === editingSalesPerson._id ? { ...sp, ...formData } : sp
          )
        );
        toast.success("Sales person updated successfully");
        setIsEditModalOpen(false);
      } else {
        // Add new sales person
        const newSalesPerson: SalesPerson = {
          _id: Date.now().toString(),
          ...formData,
          isActive: true,
          assignedAgents: [],
          createdAt: new Date().toISOString(),
        };
        setSalesPersons((prev) => [...prev, newSalesPerson]);
        toast.success("Sales person added successfully");
        setIsAddModalOpen(false);
      }
      setFormData({ name: "", email: "", phone: "" });
      setEditingSalesPerson(null);
    } catch (err) {
      toast.error("Failed to save sales person");
    }
  };

  const handleAssignAgentsSubmit = () => {
    if (!selectedSalesPerson) return;

    const assignedAgents = agents.filter((agent) =>
      selectedAgentIds.includes(agent._id)
    );
    setSalesPersons((prev) =>
      prev.map((sp) =>
        sp._id === selectedSalesPerson._id ? { ...sp, assignedAgents } : sp
      )
    );

    toast.success("Agents assigned successfully");
    setIsAssignModalOpen(false);
    setSelectedSalesPerson(null);
    setSelectedAgentIds([]);
  };

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

          newClients.push({
            _id: Date.now().toString() + i,
            name: values[nameIndex] || "",
            phone: values[phoneIndex] || "",
            email: values[emailIndex] || "",
          });
        }
      }

      setClients((prev) => [...prev, ...newClients]);
      toast.success(`Successfully imported ${newClients.length} clients`);
    };

    reader.readAsText(file);
  };

  const handleCSVDownload = () => {
    const csvContent = [
      ["Name", "Phone", "Email"].join(","),
      ...clients.map((client) =>
        [client.name, client.phone, client.email].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: TableColumn<SalesPerson>[] = [
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
          {value.length > 0 ? `${value.length} agent(s)` : "No agents assigned"}
        </span>
      ),
    },
    createStatusColumn("isActive", "Status"),
    createActionsColumn(),
  ];

  const actions: TableAction<SalesPerson>[] = [
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
    createDeleteAction(handleDeleteSalesPerson),
  ];

  const clientColumns: TableColumn<Client>[] = [
    createNameColumn("name", "Client Name"),
    {
      key: "phone",
      label: "Phone",
      type: "text",
      responsive: "md",
      searchable: true,
    },
    createEmailColumn("email", "Email"),
  ];

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
              {/* CSV Upload/Download Section */}
              <div className="flex space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload CSV
                </button>
                <button
                  onClick={handleCSVDownload}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download CSV
                </button>
                <button
                  onClick={handleViewClients}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Clients
                </button>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    Total Sales Persons
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {salesPersons.length}
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Available Agents
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agents.length}
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
                    {clients.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

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
          />

          {/* Add/Edit Sales Person Modal */}
          {(isAddModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingSalesPerson
                    ? "Edit Sales Person"
                    : "Add Sales Person"}
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
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setEditingSalesPerson(null);
                        setFormData({ name: "", email: "", phone: "" });
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingSalesPerson ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Assign Agents Modal */}
          {isAssignModalOpen && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  Assign Agents to {selectedSalesPerson?.name}
                </h2>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {agents.map((agent) => (
                    <label
                      key={agent._id}
                      className="flex items-center space-x-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAgentIds.includes(agent._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAgentIds([
                              ...selectedAgentIds,
                              agent._id,
                            ]);
                          } else {
                            setSelectedAgentIds(
                              selectedAgentIds.filter((id) => id !== agent._id)
                            );
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </p>
                        <p className="text-xs text-gray-500">{agent.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsAssignModalOpen(false);
                      setSelectedSalesPerson(null);
                      setSelectedAgentIds([]);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignAgentsSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Assign ({selectedAgentIds.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Clients Modal */}
          {isViewClientsModalOpen && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Client Database</h2>
                  <button
                    onClick={() => setIsViewClientsModalOpen(false)}
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
                <GenericTable
                  data={clients}
                  columns={clientColumns}
                  searchPlaceholder="Search clients..."
                  emptyMessage="No clients found. Upload a CSV file to add clients."
                />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
