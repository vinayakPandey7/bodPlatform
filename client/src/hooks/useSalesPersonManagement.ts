import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { adminFetchers } from '../lib/fetchers';

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

interface SalesPerson {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  assignedAgents: AssignedAgent[];
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export const useSalesPersonManagement = () => {
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSalesPerson, setEditingSalesPerson] = useState<SalesPerson | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch sales persons - get all records for client-side pagination
      const salesPersonsResponse = await adminFetchers.getAdminSalesPersons({ 
        limit: 1000, // Get all records for client-side pagination
        page: 1 
      });
      console.log("Sales persons response:", salesPersonsResponse);
      
      // Handle the response structure
      const salesPersonsData = salesPersonsResponse.salesPersons || salesPersonsResponse.data || [];
      console.log("Sales persons data extracted:", salesPersonsData.length, salesPersonsData);
      setSalesPersons(salesPersonsData);
      
      // Fetch insurance agents dynamically
      try {
        const agentsResponse = await adminFetchers.getInsuranceAgents();
        const agentsData = agentsResponse.data || [];
        
        // Map insurance agents to the expected Agent interface
        const mappedAgents = agentsData.map((agent: any) => ({
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          isActive: agent.isActive || true,
        }));
        
        setAgents(mappedAgents);
      } catch (agentsError) {
        console.error("Failed to fetch agents:", agentsError);
        // Fallback to empty array if agents fetch fails
        setAgents([]);
        toast.error("Failed to load agents list");
      }
      
    } catch (err: any) {
      console.error("Fetch data error:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setFormData({ name: "", email: "", password: "", phone: "" });
    setIsAddModalOpen(true);
  }, []);

  const handleEdit = useCallback((salesPerson: SalesPerson) => {
    setEditingSalesPerson(salesPerson);
    setFormData({
      name: salesPerson.name,
      email: salesPerson.email,
      password: "",
      phone: salesPerson.phone,
    });
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (salesPerson: SalesPerson) => {
    if (confirm(`Are you sure you want to delete ${salesPerson.name}?`)) {
      try {
        await adminFetchers.deleteSalesPerson(salesPerson._id);
        setSalesPersons((prev) =>
          prev.filter((sp) => sp._id !== salesPerson._id)
        );
        toast.success("Sales person deleted successfully");
      } catch (err: any) {
        console.error("Delete error:", err);
        toast.error(err.response?.data?.message || err.message || "Failed to delete sales person");
      }
    }
  }, []);

  const handleSubmitForm = useCallback(async (formData: FormData) => {
    try {
      if (editingSalesPerson) {
        // Update existing sales person
        const response = await adminFetchers.updateSalesPerson(editingSalesPerson._id, formData);
        setSalesPersons((prev) =>
          prev.map((sp) =>
            sp._id === editingSalesPerson._id ? { ...sp, ...response.data } : sp
          )
        );
        toast.success("Sales person updated successfully");
        setIsEditModalOpen(false);
      } else {
        // Add new sales person
        console.log("Creating sales person with data:", formData);
        const response = await adminFetchers.createSalesPerson(formData);
        console.log("Create response:", response);
        
        // Refresh the data to get the updated list
        fetchData();
        toast.success("Sales person created successfully");
        setIsAddModalOpen(false);
      }
      setFormData({ name: "", email: "", password: "", phone: "" });
      setEditingSalesPerson(null);
    } catch (err: any) {
      console.error("Submit form error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to save sales person");
    }
  }, [editingSalesPerson, fetchData]);

  const handleCloseModal = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingSalesPerson(null);
    setFormData({ name: "", email: "", password: "", phone: "" });
  }, []);

  const handleFormDataChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Agent assignment functionality
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<SalesPerson | null>(null);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  const handleAssignAgents = useCallback((salesPerson: SalesPerson) => {
    setSelectedSalesPerson(salesPerson);
    // Map AssignedAgent[] to agent IDs for the selection
    setSelectedAgentIds(salesPerson.assignedAgents.map((assignedAgent) => assignedAgent.agentId));
    setIsAssignModalOpen(true);
  }, []);

  const handleAgentToggle = useCallback((agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgentIds(prev => [...prev, agentId]);
    } else {
      setSelectedAgentIds(prev => prev.filter(id => id !== agentId));
    }
  }, []);

  const handleAssignAgentsSubmit = useCallback(async () => {
    if (!selectedSalesPerson) return;

    try {
      console.log("Starting agent assignment...");
      console.log("Selected Sales Person:", selectedSalesPerson.name);
      console.log("Selected Agent IDs:", selectedAgentIds);
      
      // Call the API to assign agents to the sales person
      const selectedAgents = agents.filter((agent) =>
        selectedAgentIds.includes(agent._id)
      );

      console.log("Selected Agents:", selectedAgents);

      // Map the agents data to the format expected by the backend
      const agentsToAssign = selectedAgents.map((agent) => ({
        agentId: agent._id,
        agentName: agent.name,
        agentEmail: agent.email,
      }));

      console.log("Agents to assign (backend format):", agentsToAssign);

      const response = await adminFetchers.assignAgentsToSalesPerson(selectedSalesPerson._id, agentsToAssign);
      console.log("Backend response:", response);

      // Update local state with the response data from backend
      const updatedAssignedAgents: AssignedAgent[] = response.assignedAgents || agentsToAssign.map(agent => ({
        agentId: agent.agentId,
        agentName: agent.agentName,
        agentEmail: agent.agentEmail,
        assignedDate: new Date().toISOString(),
        isActive: true,
      }));

      console.log("Updated assigned agents:", updatedAssignedAgents);

      setSalesPersons((prev) =>
        prev.map((sp) =>
          sp._id === selectedSalesPerson._id 
            ? { ...sp, assignedAgents: updatedAssignedAgents } 
            : sp
        )
      );

      toast.success(`Successfully assigned ${updatedAssignedAgents.length} agent(s)`);
      setIsAssignModalOpen(false);
      setSelectedSalesPerson(null);
      setSelectedAgentIds([]);
      
      // Refresh the data to ensure consistency
      await fetchData();
    } catch (error: any) {
      console.error("Assign agents error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to assign agents");
    }
  }, [selectedSalesPerson, agents, selectedAgentIds, fetchData]);

  const handleCloseAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
    setSelectedSalesPerson(null);
    setSelectedAgentIds([]);
  }, []);

  return {
    // State
    salesPersons,
    agents,
    loading,
    error,
    isAddModalOpen,
    isEditModalOpen,
    editingSalesPerson,
    formData,

    // Agent assignment state
    isAssignModalOpen,
    selectedSalesPerson,
    selectedAgentIds,

    // Actions
    fetchData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmitForm,
    handleCloseModal,
    handleFormDataChange,

    // Agent assignment actions
    handleAssignAgents,
    handleAgentToggle,
    handleAssignAgentsSubmit,
    handleCloseAssignModal,
  };
}; 