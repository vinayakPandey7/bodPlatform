"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { GenericTable, TableColumn, TableAction } from "@/components/GenericTable";
import {
  createNameColumn,
  createEmailColumn,
  createStatusColumn,
  createActionsColumn,
  createViewAction,
} from "@/components/table/tableUtils";
import { toast } from "sonner";

interface AssignedInsuranceAgent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  isActive: boolean;
  clientsCount: number;
  pendingClients: number;
  completedClients: number;
  commission: number;
  assignedDate: string;
}

export default function SalesDashboard() {
  const router = useRouter();
  
  const [assignedAgents, setAssignedAgents] = useState<AssignedInsuranceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignedAgents();
  }, []);

  const fetchAssignedAgents = async () => {
    try {
      setLoading(true);
      // Mock data for assigned agents - replace with actual API call
      setAssignedAgents([
        {
          _id: "1",
          name: "Michael Chen",
          email: "michael.chen@insurance.com",
          phone: "+1-555-1001",
          licenseNumber: "INS-2024-001",
          isActive: true,
          clientsCount: 45,
          pendingClients: 12,
          completedClients: 33,
          commission: 8.5,
          assignedDate: "2024-01-15",
        },
        {
          _id: "2",
          name: "Emily Rodriguez",
          email: "emily.rodriguez@insurance.com",
          phone: "+1-555-1002",
          licenseNumber: "INS-2024-002",
          isActive: true,
          clientsCount: 32,
          pendingClients: 8,
          completedClients: 24,
          commission: 7.5,
          assignedDate: "2024-02-01",
        },
      ]);
    } catch (err: any) {
      setError("Failed to fetch assigned agents");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClients = (agent: AssignedInsuranceAgent) => {
    router.push(`/sales/agents/${agent._id}/clients`);
  };

  const columns: TableColumn<AssignedInsuranceAgent>[] = [
    createNameColumn("name", "Agent Name"),
    createEmailColumn("email", "Email"),
    { key: "phone", label: "Phone", type: "text", responsive: "md", searchable: true },
    { 
      key: "licenseNumber", 
      label: "License #", 
      type: "text", 
      responsive: "lg", 
      searchable: true,
      className: "font-mono text-sm"
    },
    { 
      key: "clientsCount", 
      label: "Total Clients", 
      type: "number", 
      responsive: "md",
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value} clients
        </span>
      )
    },
    { 
      key: "pendingClients", 
      label: "Pending", 
      type: "number", 
      responsive: "lg",
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {value} pending
        </span>
      )
    },
    { 
      key: "completedClients", 
      label: "Completed", 
      type: "number", 
      responsive: "lg",
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value} done
        </span>
      )
    },
    createStatusColumn("isActive", "Status"),
    createActionsColumn(),
  ];

  const actions: TableAction<AssignedInsuranceAgent>[] = [
    {
      label: "Manage Clients",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      onClick: handleViewClients,
      variant: "success",
    },
  ];

  const totalClients = assignedAgents.reduce((sum, agent) => sum + agent.clientsCount, 0);
  const totalPending = assignedAgents.reduce((sum, agent) => sum + agent.pendingClients, 0);
  const totalCompleted = assignedAgents.reduce((sum, agent) => sum + agent.completedClients, 0);
  const completionRate = totalClients > 0 ? ((totalCompleted / totalClients) * 100).toFixed(1) : 0;

  return (
    <ProtectedRoute allowedRoles={["sales_person"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600">Manage your assigned insurance agents and their clients</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assigned Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{assignedAgents.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  if (assignedAgents.length > 0) {
                    router.push(`/sales/agents/${assignedAgents[0]._id}/clients`);
                  }
                }}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                disabled={assignedAgents.length === 0}
              >
                <h3 className="font-medium text-gray-900">Start Calling</h3>
                <p className="text-sm text-gray-600">
                  Begin calling clients from your assigned agents
                </p>
              </button>
              <button
                onClick={() => {
                  // Could implement a report or summary view
                  toast.info("Reports feature coming soon!");
                }}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium text-gray-900">View Reports</h3>
                <p className="text-sm text-gray-600">
                  Check your calling performance and statistics
                </p>
              </button>
            </div>
          </div>

          {/* Assigned Insurance Agents Table */}
          <GenericTable
            data={assignedAgents}
            columns={columns}
            actions={actions}
            loading={loading}
            error={error}
            title="Your Assigned Insurance Agents"
            searchPlaceholder="Search agents..."
            onRowClick={handleViewClients}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 