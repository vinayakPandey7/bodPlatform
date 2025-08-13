import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface SalesClient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  premium: number;
  isActive: boolean;
  joinedDate: string;
  lastPayment: string;
  callStatus: "not_called" | "called" | "skipped" | "unpicked";
  lastCallDate?: string;
  salesRemarks: SalesRemark[];
}

export interface SalesRemark {
  _id: string;
  message: string;
  addedBy: string;
  addedAt: string;
  callOutcome: "answered" | "no_answer" | "callback_requested" | "not_interested" | "interested";
}

export interface InsuranceAgent {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
}

export interface StatusForm {
  callStatus: SalesClient["callStatus"];
  remarks: string;
  callOutcome: SalesRemark["callOutcome"];
}

export const useSalesAgentClients = (agentId: string) => {
  const [agent, setAgent] = useState<InsuranceAgent | null>(null);
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isViewRemarksModalOpen, setIsViewRemarksModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SalesClient | null>(null);

  // Form states
  const [statusForm, setStatusForm] = useState<StatusForm>({
    callStatus: "not_called",
    remarks: "",
    callOutcome: "answered",
  });

  const fetchAgentAndClients = async () => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API calls
      const mockAgent: InsuranceAgent = {
        _id: agentId,
        name: agentId === "1" ? "Michael Chen" : "Emily Rodriguez",
        email:
          agentId === "1"
            ? "michael.chen@insurance.com"
            : "emily.rodriguez@insurance.com",
        licenseNumber: `INS-2024-00${agentId}`,
      };

      const mockClients: SalesClient[] = [
        {
          _id: "c1",
          name: "John Williams",
          email: "john.williams@email.com",
          phone: "+1-555-2001",
          address: "123 Main St, New York, NY 10001",
          premium: 250.0,
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
          premium: 150.0,
          isActive: true,
          joinedDate: "2024-02-20",
          lastPayment: "2024-02-01",
          callStatus: "called",
          lastCallDate: "2024-02-25",
          salesRemarks: [
            {
              _id: "r1",
              message:
                "Client interested in upgrading policy. Scheduled follow-up call for next week.",
              addedBy: "Sales Person John",
              addedAt: "2024-02-25",
              callOutcome: "interested",
            },
          ],
        },
        {
          _id: "c3",
          name: "Robert Brown",
          email: "robert.brown@email.com",
          phone: "+1-555-2003",
          address: "789 Pine Rd, Chicago, IL 60601",
          premium: 300.0,
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
              callOutcome: "no_answer",
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
        addedAt: new Date().toISOString().split("T")[0],
        callOutcome: statusForm.callOutcome,
      };

      setClients((prev) =>
        prev.map((client) =>
          client._id === selectedClient._id
            ? {
                ...client,
                callStatus: statusForm.callStatus,
                lastCallDate:
                  statusForm.callStatus === "called"
                    ? new Date().toISOString().split("T")[0]
                    : client.lastCallDate,
                salesRemarks: statusForm.remarks.trim()
                  ? [...client.salesRemarks, newRemark]
                  : client.salesRemarks,
              }
            : client
        )
      );

      toast.success("Client status updated successfully");
      closeUpdateStatusModal();
    } catch (err) {
      toast.error("Failed to update client status");
    }
  };

  const closeUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(false);
    setSelectedClient(null);
    setStatusForm({
      callStatus: "not_called",
      remarks: "",
      callOutcome: "answered",
    });
  };

  const closeViewRemarksModal = () => {
    setIsViewRemarksModalOpen(false);
    setSelectedClient(null);
  };

  useEffect(() => {
    fetchAgentAndClients();
  }, [agentId]);

  return {
    // Data
    agent,
    clients,
    loading,
    error,
    
    // Modal states
    isUpdateStatusModalOpen,
    isViewRemarksModalOpen,
    selectedClient,
    
    // Form state
    statusForm,
    setStatusForm,
    
    // Actions
    handleUpdateCallStatus,
    handleViewRemarks,
    handleSubmitStatusUpdate,
    closeUpdateStatusModal,
    closeViewRemarksModal,
    fetchAgentAndClients,
  };
}; 