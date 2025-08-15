"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Box, CircularProgress, Typography, Chip } from "@mui/material";
import { Phone, Comment } from "@mui/icons-material";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  GenericTable,
  TableColumn,
  TableAction,
} from "@/components/GenericTable";
import {
  createNameColumn,
  createActionsColumn,
} from "@/components/table/tableUtils";
import {
  SalesAgentHeader,
  CallStatusCards,
  UpdateStatusModal,
  ViewRemarksModal,
} from "@/components/sales";
import { useSalesAgentClients, SalesClient, SalesRemark } from "@/hooks/useSalesAgentClients";

const getCallStatusBadge = (status: SalesClient["callStatus"]) => {
  const statusConfig = {
    not_called: { color: "default" as const, label: "Not Called" },
    called: { color: "success" as const, label: "Called" },
    skipped: { color: "warning" as const, label: "Skipped" },
    unpicked: { color: "error" as const, label: "Unpicked" },
  };

  const config = statusConfig[status];
  return <Chip label={config.label} color={config.color} size="small" />;
};

export default function SalesAgentClientsPage() {
  const params = useParams();
  const agentId = params.id as string;

  const {
    agent,
    clients,
    loading,
    error,
    isUpdateStatusModalOpen,
    isViewRemarksModalOpen,
    selectedClient,
    statusForm,
    setStatusForm,
    handleUpdateCallStatus,
    handleViewRemarks,
    handleSubmitStatusUpdate,
    closeUpdateStatusModal,
    closeViewRemarksModal,
  } = useSalesAgentClients(agentId);

  const columns: TableColumn<SalesClient>[] = [
    createNameColumn("name", "Client Name"),
    {
      key: "phone",
      label: "Phone",
      type: "text",
      responsive: "md",
      searchable: true,
    },
    {
      key: "callStatus",
      label: "Call Status",
      type: "custom",
      responsive: "always",
      render: (value: SalesClient["callStatus"]) => getCallStatusBadge(value),
    },
    {
      key: "salesRemarks",
      label: "Remarks",
      type: "text",
      responsive: "md",
      render: (value: SalesRemark[]) => (
        <Chip
          label={`${value.length} remarks`}
          color="info"
          variant="outlined"
          size="small"
        />
      ),
    },
    createActionsColumn(),
  ];

  const actions: TableAction<SalesClient>[] = [
    {
      label: "Update Status",
      icon: <Phone sx={{ width: 16, height: 16 }} />,
      onClick: handleUpdateCallStatus,
      variant: "success",
    },
    {
      label: "View Remarks",
      icon: <Comment sx={{ width: 16, height: 16 }} />,
      onClick: handleViewRemarks,
      variant: "default",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={48} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          {/* Header Section */}
          <SalesAgentHeader agent={agent} />

          {/* Call Status Statistics Cards */}
          <CallStatusCards clients={clients} />

          {/* Clients Table */}
          <GenericTable
            data={clients}
            columns={columns}
            actions={actions}
            loading={loading}
            error={error}
            title="Client List"
            searchPlaceholder="Search clients..."
            tableHeight="auto"
            enableTableScroll={false}
            pagination={{
              enabled: true,
              pageSize: 15,
              pageSizeOptions: [10, 15, 25, 50, 100],
              showPageInfo: true,
              showPageSizeSelector: true,
            }}
          />

          {/* Update Status Modal */}
          <UpdateStatusModal
            open={isUpdateStatusModalOpen}
            onClose={closeUpdateStatusModal}
            client={selectedClient}
            statusForm={statusForm}
            onStatusFormChange={setStatusForm}
            onSubmit={handleSubmitStatusUpdate}
          />

          {/* View Remarks Modal */}
          <ViewRemarksModal
            open={isViewRemarksModalOpen}
            onClose={closeViewRemarksModal}
            client={selectedClient}
          />
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
