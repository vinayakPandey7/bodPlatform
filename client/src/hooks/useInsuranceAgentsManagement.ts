import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetchers } from "../lib/fetchers";
import { QUERY_KEYS } from "../lib/constants";
import { toast } from "sonner";

export interface InsuranceAgent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  clientsCount: number;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceAgentFormData {
  name: string;
  email: string;
  phone: string;
  isActive?: boolean;
}

export const useInsuranceAgentsManagement = () => {
  const queryClient = useQueryClient();

  // Get insurance agents
  const {
    data: agents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.INSURANCE_AGENTS.LIST(),
    queryFn: () => adminFetchers.getInsuranceAgents({ limit: 1000, page: 1 }),
    select: (data) => data.data || [],
  });

  // Create insurance agent mutation
  const createMutation = useMutation({
    mutationFn: (data: InsuranceAgentFormData) =>
      adminFetchers.createInsuranceAgent(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INSURANCE_AGENTS.LIST(),
      });
      toast.success(response.message || "Insurance agent created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create insurance agent");
    },
  });

  // Update insurance agent mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsuranceAgentFormData }) =>
      adminFetchers.updateInsuranceAgent(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INSURANCE_AGENTS.LIST(),
      });
      toast.success(response.message || "Insurance agent updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update insurance agent");
    },
  });

  // Delete insurance agent mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFetchers.deleteInsuranceAgent(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INSURANCE_AGENTS.LIST(),
      });
      toast.success(response.message || "Insurance agent deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete insurance agent");
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => adminFetchers.toggleInsuranceAgentStatus(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INSURANCE_AGENTS.LIST(),
      });
      toast.success(response.message || "Agent status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update agent status");
    },
  });

  // Form handling
  const [formData, setFormData] = useState<InsuranceAgentFormData>({
    name: "",
    email: "",
    phone: "",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<InsuranceAgent | null>(null);

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (agent: InsuranceAgent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (agent: InsuranceAgent) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${agent.name}? This will also affect their ${agent.clientsCount} clients.`
      )
    ) {
      deleteMutation.mutate(agent._id);
    }
  };

  const handleToggleStatus = (agent: InsuranceAgent) => {
    toggleStatusMutation.mutate(agent._id);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAgent) {
        await updateMutation.mutateAsync({
          id: editingAgent._id,
          data: formData,
        });
        setIsEditModalOpen(false);
      } else {
        await createMutation.mutateAsync(formData);
        setIsAddModalOpen(false);
      }
      
      setFormData({
        name: "",
        email: "",
        phone: "",
      });
      setEditingAgent(null);
    } catch (error) {
      // Error handling is done in mutation onError callbacks
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingAgent(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
  };

  return {
    agents,
    isLoading,
    error,
    refetch,
    
    // Form state
    formData,
    setFormData,
    isAddModalOpen,
    isEditModalOpen,
    editingAgent,
    
    // Mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
    
    // Actions
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    handleSubmitForm,
    handleCloseModal,
  };
};
