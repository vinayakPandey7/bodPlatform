import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Agent {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface SalesPerson {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  assignedAgents: Agent[];
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
      // Mock data - replace with actual API calls
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
    } catch (err: any) {
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

  const handleDelete = useCallback((salesPerson: SalesPerson) => {
    if (confirm(`Are you sure you want to delete ${salesPerson.name}?`)) {
      setSalesPersons((prev) =>
        prev.filter((sp) => sp._id !== salesPerson._id)
      );
      toast.success("Sales person deleted successfully");
    }
  }, []);

  const handleSubmitForm = useCallback(async (formData: FormData) => {
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
      setFormData({ name: "", email: "", password: "", phone: "" });
      setEditingSalesPerson(null);
    } catch (err) {
      toast.error("Failed to save sales person");
    }
  }, [editingSalesPerson]);

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
    setSelectedAgentIds(salesPerson.assignedAgents.map((agent) => agent._id));
    setIsAssignModalOpen(true);
  }, []);

  const handleAgentToggle = useCallback((agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgentIds(prev => [...prev, agentId]);
    } else {
      setSelectedAgentIds(prev => prev.filter(id => id !== agentId));
    }
  }, []);

  const handleAssignAgentsSubmit = useCallback(() => {
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
  }, [selectedSalesPerson, agents, selectedAgentIds]);

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