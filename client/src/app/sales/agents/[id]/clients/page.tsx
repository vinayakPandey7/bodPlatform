"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { GenericTable, TableColumn, TableAction } from "@/components/GenericTable";
import {
  createNameColumn,
  createEmailColumn,
  createActionsColumn,
  createEditAction,
  createViewAction,
} from "@/components/table/tableUtils";
import { toast } from "sonner";

interface SalesClient {
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
  callStatus: "not_called" | "called" | "skipped" | "unpicked" | "completed";
  lastCallDate?: string;
  salesRemarks: SalesRemark[];
}

interface SalesRemark {
  _id: string;
  message: string;
  addedBy: string;
  addedAt: string;
  callOutcome: "answered" | "no_answer" | "callback_requested" | "not_interested" | "interested";
}

interface InsuranceAgent {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
}

export default function SalesAgentClientsPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<InsuranceAgent | null>(null);
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isViewRemarksModalOpen, setIsViewRemarksModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SalesClient | null>(null);

  // Form states
  const [statusForm, setStatusForm] = useState({
    callStatus: "not_called" as SalesClient["callStatus"],
    remarks: "",
    callOutcome: "answered" as SalesRemark["callOutcome"],
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
        name: agentId === "1" ? "Michael Chen" : "Emily Rodriguez",
        email: agentId === "1" ? "michael.chen@insurance.com" : "emily.rodriguez@insurance.com",
        licenseNumber: `INS-2024-00${agentId}`,
      };
      
      const mockClients: SalesClient[] = [
        {
          _id: "c1",
          name: "John Williams",
          email: "john.williams@email.com",
          phone: "+1-555-2001",
          address: "123 Main St, New York, NY 10001",
          policyNumber: "POL-2024-001",
          policyType: "Life Insurance",
          premium: 250.00,
          isActive: true,
          joinedDate: "2024-01-15",
          lastPayment: "2024-01-01",
          callStatus: "not_called",
          salesRemarks: [],
        },
        {
          _id: "c2",
          name: "Sarah Davis",
          email: "sarah.davis@email.com",
          phone: "+1-555-2002",
          address: "456 Oak Ave, Los Angeles, CA 90210",
          policyNumber: "POL-2024-002",
          policyType: "Auto Insurance",
          premium: 150.00,
          isActive: true,
          joinedDate: "2024-02-20",
          lastPayment: "2024-02-01",
          callStatus: "called",
          lastCallDate: "2024-02-25",
          salesRemarks: [
            {
              _id: "r1",
              message: "Client interested in upgrading policy. Scheduled follow-up call for next week.",
              addedBy: "Sales Person John",
              addedAt: "2024-02-25",
              callOutcome: "interested"
            }
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
          premium: 300.00,
          isActive: false,
          joinedDate: "2023-12-10",
          lastPayment: "2023-12-01",
          callStatus: "unpicked",
          lastCallDate: "2024-01-10",
          salesRemarks: [
            {
              _id: "r2",
              message: "No answer after 3 attempts. Will try again next week.",
              addedBy: "Sales Person John",
              addedAt: "2024-01-10",
              callOutcome: "no_answer"
            }
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

  const handleUpdateCallStatus = (client: SalesClient) => {
    setSelectedClient(client);
    setStatusForm({
      callStatus: client.callStatus,
      remarks: "",
      callOutcome: "answered",
    });
    setIsUpdateStatusModalOpen(true);
  };

  const handleViewRemarks = (client: SalesClient) => {
    setSelectedClient(client);
    setIsViewRemarksModalOpen(true);
  };

  const handleSubmitStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      const newRemark: SalesRemark = {
        _id: Date.now().toString(),
        message: statusForm.remarks.trim(),
        addedBy: "Current Sales Person", // In real app, get from authenticated user
        addedAt: new Date().toISOString().split('T')[0],
        callOutcome: statusForm.callOutcome,
      };

      setClients(prev => prev.map(client => 
        client._id === selectedClient._id 
          ? { 
              ...client, 
              callStatus: statusForm.callStatus,
              lastCallDate: statusForm.callStatus === "called" ? new Date().toISOString().split('T')[0] : client.lastCallDate,
              salesRemarks: statusForm.remarks.trim() ? [...client.salesRemarks, newRemark] : client.salesRemarks
            }
          : client
      ));

      toast.success("Client status updated successfully");
      setIsUpdateStatusModalOpen(false);
      setSelectedClient(null);
      setStatusForm({ callStatus: "not_called", remarks: "", callOutcome: "answered" });
    } catch (err) {
      toast.error("Failed to update client status");
    }
  };

  const getCallStatusBadge = (status: SalesClient["callStatus"]) => {
    const statusConfig = {
      not_called: { color: "bg-gray-100 text-gray-800", label: "Not Called" },
      called: { color: "bg-green-100 text-green-800", label: "Called" },
      skipped: { color: "bg-yellow-100 text-yellow-800", label: "Skipped" },
      unpicked: { color: "bg-red-100 text-red-800", label: "Unpicked" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns: TableColumn<SalesClient>[] = [
    createNameColumn("name", "Client Name"),
    { key: "phone", label: "Phone", type: "text", responsive: "md", searchable: true },
    { 
      key: "policyNumber", 
      label: "Policy #", 
      type: "text", 
      responsive: "lg", 
      searchable: true,
      className: "font-mono text-sm"
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
      )
    },
    { 
      key: "callStatus", 
      label: "Call Status", 
      type: "custom", 
      responsive: "always",
      render: (value: SalesClient["callStatus"]) => getCallStatusBadge(value)
    },
    { 
      key: "salesRemarks", 
      label: "Remarks", 
      type: "text", 
      responsive: "md",
      render: (value: SalesRemark[]) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value.length} remarks
        </span>
      )
    },
    createActionsColumn(),
  ];

  const actions: TableAction<SalesClient>[] = [
    {
      label: "Update Status",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      onClick: handleUpdateCallStatus,
      variant: "success",
    },
    {
      label: "View Remarks",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      onClick: handleViewRemarks,
      variant: "default",
    },
  ];

  const callStatusCounts = {
    not_called: clients.filter(c => c.callStatus === "not_called").length,
    called: clients.filter(c => c.callStatus === "called").length,
    skipped: clients.filter(c => c.callStatus === "skipped").length,
    unpicked: clients.filter(c => c.callStatus === "unpicked").length,
    completed: clients.filter(c => c.callStatus === "completed").length,
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["sales_person"]}>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["sales_person"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <button 
                  onClick={() => router.push("/sales/dashboard")}
                  className="hover:text-blue-600 transition-colors"
                >
                  Sales Dashboard
                </button>
                <span>/</span>
                <span>{agent?.name}</span>
                <span>/</span>
                <span className="text-gray-900">Clients</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {agent?.name} - Client Management
              </h1>
              <p className="text-gray-600">
                License: {agent?.licenseNumber} • Email: {agent?.email}
              </p>
            </div>
          </div>

          {/* Call Status Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{callStatusCounts.not_called}</div>
                <div className="text-sm text-gray-600">Not Called</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{callStatusCounts.called}</div>
                <div className="text-sm text-gray-600">Called</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{callStatusCounts.skipped}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{callStatusCounts.unpicked}</div>
                <div className="text-sm text-gray-600">Unpicked</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{callStatusCounts.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <GenericTable
            data={clients}
            columns={columns}
            actions={actions}
            loading={loading}
            error={error}
            title="Client List"
            searchPlaceholder="Search clients..."
          />

          {/* Update Status Modal */}
          {isUpdateStatusModalOpen && selectedClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  Update Call Status - {selectedClient.name}
                </h2>
                <form onSubmit={handleSubmitStatusUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Status</label>
                    <select
                      value={statusForm.callStatus}
                      onChange={(e) => setStatusForm({ ...statusForm, callStatus: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="not_called">Not Called</option>
                      <option value="called">Called</option>
                      <option value="skipped">Skipped</option>
                      <option value="unpicked">Unpicked</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  {(statusForm.callStatus === "called" || statusForm.callStatus === "unpicked") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Call Outcome</label>
                      <select
                        value={statusForm.callOutcome}
                        onChange={(e) => setStatusForm({ ...statusForm, callOutcome: e.target.value as any })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="answered">Answered</option>
                        <option value="no_answer">No Answer</option>
                        <option value="callback_requested">Callback Requested</option>
                        <option value="not_interested">Not Interested</option>
                        <option value="interested">Interested</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks (Optional)
                    </label>
                    <textarea
                      value={statusForm.remarks}
                      onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Add any notes about this call..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUpdateStatusModalOpen(false);
                        setSelectedClient(null);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Update Status
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Remarks Modal */}
          {isViewRemarksModalOpen && selectedClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    Sales Remarks - {selectedClient.name}
                  </h2>
                  <button
                    onClick={() => setIsViewRemarksModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Client Info Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Policy:</span>
                      <p className="font-medium">{selectedClient.policyNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{selectedClient.policyType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      {getCallStatusBadge(selectedClient.callStatus)}
                    </div>
                  </div>
                </div>

                {/* Sales Remarks History */}
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Sales Remarks ({selectedClient.salesRemarks.length})
                  </h3>
                  {selectedClient.salesRemarks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>No remarks available for this client</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedClient.salesRemarks
                        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
                        .map((remark) => (
                        <div
                          key={remark._id}
                          className={`p-4 rounded-lg border-l-4 ${
                            remark.callOutcome === 'interested' ? 'bg-green-50 border-green-400' :
                            remark.callOutcome === 'not_interested' ? 'bg-red-50 border-red-400' :
                            remark.callOutcome === 'no_answer' ? 'bg-yellow-50 border-yellow-400' :
                            'bg-gray-50 border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                remark.callOutcome === 'interested' ? 'bg-green-100 text-green-800' :
                                remark.callOutcome === 'not_interested' ? 'bg-red-100 text-red-800' :
                                remark.callOutcome === 'no_answer' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {remark.callOutcome.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {remark.addedAt}
                            </div>
                          </div>
                          <p className="text-gray-900 mb-2">{remark.message}</p>
                          <div className="text-sm text-gray-600">
                            Added by: <span className="font-medium">{remark.addedBy}</span>
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