import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { salesPersonFetchers } from '@/lib/fetchers';

export interface SalesClient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  premium?: number;
  isActive: boolean;
  joinedDate?: string;
  lastPayment?: string;
  callStatus: "not_called" | "called" | "skipped" | "unpicked";
  lastCallDate?: string;
  salesRemarks: SalesRemark[];
  // Additional fields from insurance client model
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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
  phone?: string;
  licenseNumber?: string;
  specialization?: string;
  dateOfBirth?: string;
  address?: string;
  isActive?: boolean;
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

      // Fetch agent and clients data using the new sales person specific endpoint
      const response = await salesPersonFetchers.getAgentClients(agentId, { limit: 1000, page: 1 });

      if (response.success) {
        // Set agent data
        if (response.agent) {
          setAgent({
            _id: response.agent._id,
            name: response.agent.name,
            email: response.agent.email,
            phone: response.agent.phone,
            licenseNumber: response.agent.licenseNumber,
            specialization: response.agent.specialization,
            isActive: response.agent.isActive,
          });
        }

        // Set clients data
        const clientsData = response.data || [];
        
        // Transform insurance client data to sales client format
        const transformedClients: SalesClient[] = clientsData.map((client: any) => ({
          _id: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address || "",
          premium: client.premium || 0,
          isActive: client.isActive !== false, // Default to true if not specified
          joinedDate: client.createdAt ? new Date(client.createdAt).toISOString().split('T')[0] : "",
          lastPayment: client.lastPayment ? new Date(client.lastPayment).toISOString().split('T')[0] : "",
          callStatus: client.callStatus || "not_called", // Default to not_called
          lastCallDate: client.lastCallDate,
          salesRemarks: client.salesRemarks || [], // Use existing remarks or empty array
          status: client.status,
          notes: client.notes,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        }));

        setClients(transformedClients);
      } else {
        setAgent(null);
        setClients([]);
        setError(response.message || "Failed to fetch data");
      }
    } catch (err: any) {
      console.error("Error fetching agent and clients:", err);
      setError(`Failed to fetch agent and clients data: ${err.message || err}`);
      // Set empty defaults on error
      setAgent(null);
      setClients([]);
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
      // Prepare the status update data
      const statusData = {
        callStatus: statusForm.callStatus,
        ...(statusForm.remarks.trim() && {
          remarks: statusForm.remarks.trim(),
          callOutcome: statusForm.callOutcome
        })
      };

      // Call the API to update client status
      const response = await salesPersonFetchers.updateClientCallStatus(
        agentId,
        selectedClient._id,
        statusData
      );

      if (response.success) {
        // Update local state with the response data
        const updatedClient = response.data;
        
        setClients((prev) =>
          prev.map((client) =>
            client._id === selectedClient._id
              ? {
                  ...client,
                  callStatus: updatedClient.callStatus,
                  lastCallDate: updatedClient.lastCallDate ? 
                    new Date(updatedClient.lastCallDate).toISOString().split("T")[0] : 
                    client.lastCallDate,
                  salesRemarks: updatedClient.salesRemarks || client.salesRemarks,
                }
              : client
          )
        );

        toast.success("Client status updated successfully");
        closeUpdateStatusModal();
      } else {
        toast.error(response.message || "Failed to update client status");
      }
    } catch (err: any) {
      console.error("Error updating client status:", err);
      toast.error(`Failed to update client status: ${err.message || err}`);
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