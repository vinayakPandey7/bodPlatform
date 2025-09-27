import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { toast } from "sonner";

// Types
export interface SalesPersonProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  department: string;
  territory: string;
  bio?: string;
  profilePicture?: string;
  managerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  workAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
    fieldOfStudy?: string;
  }>;
  assignedAgents: Array<{
    agentId: string;
    agentName: string;
    agentEmail: string;
    assignedDate: string;
    isActive: boolean;
  }>;
  salesQuota: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  performance: {
    callsMade: number;
    clientsContacted: number;
    salesClosed: number;
    commission: number;
  };
  permissions: string[];
  isActive: boolean;
  isApproved: boolean;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSalesPersonData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  territory?: string;
  bio?: string;
  profilePicture?: string;
  workAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
    fieldOfStudy?: string;
  }>;
}

// API functions
const fetchSalesPersonProfile = async (): Promise<SalesPersonProfile> => {
  const { data } = await api.get("/salesPerson/profile/me");
  return data;
};

const updateSalesPersonProfile = async (
  updateData: UpdateSalesPersonData
): Promise<SalesPersonProfile> => {
  const { data } = await api.put("/salesPerson/profile/me", updateData);
  return data.salesPerson;
};

const fetchAssignedAgents = async () => {
  const { data } = await api.get("/salesPerson/agents/me");
  return data;
};

// Hooks
export const useSalesPersonProfile = () => {
  // TEMPORARY: Return mock data for sales person development
  const mockSalesPersonProfile: any = {
    _id: "mock_sales_profile_id",
    firstName: "John",
    lastName: "Doe",
    email: "sales@test.com",
    phoneNumber: "+1-555-0123",
    employeeId: "EMP001",
    department: "sales",
    territory: "West Coast",
    bio: "Experienced sales professional with 5+ years in the insurance industry.",
    profilePicture: "",
    managerId: {
      _id: "manager_id",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@company.com",
    },
    assignedAgents: [
      {
        agentId: "agent1",
        agentName: "Alice Johnson",
        agentEmail: "alice@insurance.com",
        assignedDate: "2024-01-15",
        isActive: true,
      },
      {
        agentId: "agent2",
        agentName: "Bob Smith",
        agentEmail: "bob@insurance.com",
        assignedDate: "2024-02-01",
        isActive: true,
      },
    ],
    salesQuota: {
      monthly: 50000,
      quarterly: 150000,
      yearly: 600000,
    },
    performance: {
      callsMade: 125,
      clientsContacted: 89,
      salesClosed: 23,
      commission: 15000,
    },
    permissions: ["view_agents", "manage_clients", "make_calls"],
    isActive: true,
    isApproved: true,
    startDate: "2024-01-01",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
    workAddress: {
      street: "123 Business Ave",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
    },
    skills: ["Sales Management", "Customer Relationship Management", "Lead Generation", "Insurance Products", "Negotiation"],
    certifications: [
      {
        name: "Certified Sales Professional",
        issuer: "Sales Institute",
        issueDate: "2023-06-15",
        credentialId: "CSP-2023-001",
      },
      {
        name: "Insurance Sales Certification",
        issuer: "Insurance Academy",
        issueDate: "2022-08-20",
        expiryDate: "2025-08-20",
        credentialId: "ISC-2022-456",
      },
    ],
    experience: [
      {
        title: "Senior Sales Representative",
        company: "ABC Insurance Corp",
        startDate: "2022-01-01",
        isCurrent: true,
        description: "Leading sales efforts in the insurance sector, managing key client relationships and driving revenue growth.",
      },
      {
        title: "Sales Associate",
        company: "XYZ Insurance",
        startDate: "2020-06-15",
        endDate: "2021-12-31",
        isCurrent: false,
        description: "Developed new client relationships and achieved 120% of sales targets consistently.",
      },
    ],
    education: [
      {
        degree: "Bachelor of Business Administration",
        institution: "State University",
        startDate: "2018-09-01",
        endDate: "2022-05-15",
        fieldOfStudy: "Marketing",
        gpa: 3.8,
      },
    ],
  };

  return {
    data: mockSalesPersonProfile,
    isLoading: false,
    error: null as Error | null,
    refetch: () => Promise.resolve({ data: mockSalesPersonProfile }),
  };

  // Original API call (commented out for development)
  /*
  return useQuery({
    queryKey: ["salesPersonProfile"],
    queryFn: fetchSalesPersonProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  */
};

export const useUpdateSalesPersonProfile = () => {
  const queryClient = useQueryClient();

  // TEMPORARY: Mock update for development
  return {
    mutate: (data: any, options?: any) => {
      // Simulate successful update
      setTimeout(() => {
        toast.success("Profile updated successfully");
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      }, 500);
    },
    isPending: false,
  };

  // Original mutation (commented out for development)
  /*
  return useMutation({
    mutationFn: updateSalesPersonProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["salesPersonProfile"], data);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    },
  });
  */
};

export const useAssignedAgents = () => {
  return useQuery({
    queryKey: ["assignedAgents"],
    queryFn: fetchAssignedAgents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper hooks for specific operations
export const useAddExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experience: UpdateSalesPersonData["experience"]) => {
      const currentProfile = queryClient.getQueryData<SalesPersonProfile>([
        "salesPersonProfile",
      ]);
      if (!currentProfile) throw new Error("No profile data available");

      const updatedExperience = [...(currentProfile.experience || []), ...experience!];
      return updateSalesPersonProfile({ experience: updatedExperience });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["salesPersonProfile"], data);
      toast.success("Experience added successfully");
    },
    onError: (error: any) => {
      console.error("Add experience error:", error);
      toast.error(error.response?.data?.message || "Failed to add experience");
    },
  });
};

export const useAddEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (education: UpdateSalesPersonData["education"]) => {
      const currentProfile = queryClient.getQueryData<SalesPersonProfile>([
        "salesPersonProfile",
      ]);
      if (!currentProfile) throw new Error("No profile data available");

      const updatedEducation = [...(currentProfile.education || []), ...education!];
      return updateSalesPersonProfile({ education: updatedEducation });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["salesPersonProfile"], data);
      toast.success("Education added successfully");
    },
    onError: (error: any) => {
      console.error("Add education error:", error);
      toast.error(error.response?.data?.message || "Failed to add education");
    },
  });
};

export const useAddCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (certification: UpdateSalesPersonData["certifications"]) => {
      const currentProfile = queryClient.getQueryData<SalesPersonProfile>([
        "salesPersonProfile",
      ]);
      if (!currentProfile) throw new Error("No profile data available");

      const updatedCertifications = [...(currentProfile.certifications || []), ...certification!];
      return updateSalesPersonProfile({ certifications: updatedCertifications });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["salesPersonProfile"], data);
      toast.success("Certification added successfully");
    },
    onError: (error: any) => {
      console.error("Add certification error:", error);
      toast.error(error.response?.data?.message || "Failed to add certification");
    },
  });
};

export const useUpdateSkills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skills: string[]) => {
      return updateSalesPersonProfile({ skills });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["salesPersonProfile"], data);
      toast.success("Skills updated successfully");
    },
    onError: (error: any) => {
      console.error("Update skills error:", error);
      toast.error(error.response?.data?.message || "Failed to update skills");
    },
  });
}; 