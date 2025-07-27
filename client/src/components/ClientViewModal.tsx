"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Client {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  industry: string;
  companySize: string;
  contractValue: number;
  activePositions: number;
  totalPlacements: number;
  successRate: number;
  lastActivity: string;
  status: "active" | "inactive" | "prospect";
  contractStartDate: string;
  contractEndDate: string;
  paymentTerms: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ClientViewModalProps {
  open: boolean;
  onClose: () => void;
  client: Client;
}

export default function ClientViewModal({
  open,
  onClose,
  client,
}: ClientViewModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Chip
            icon={<CheckCircle className="w-3 h-3" />}
            label="Active"
            size="small"
            sx={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              "& .MuiChip-icon": {
                color: "#166534",
              },
            }}
          />
        );
      case "inactive":
        return (
          <Chip
            icon={<Clock className="w-3 h-3" />}
            label="Inactive"
            size="small"
            sx={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
              "& .MuiChip-icon": {
                color: "#374151",
              },
            }}
          />
        );
      case "prospect":
        return (
          <Chip
            icon={<AlertCircle className="w-3 h-3" />}
            label="Prospect"
            size="small"
            sx={{
              backgroundColor: "#fef3c7",
              color: "#92400e",
              "& .MuiChip-icon": {
                color: "#92400e",
              },
            }}
          />
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon sx={{ color: "#3b82f6" }} />
            <Typography variant="h6" component="div">
              Client Details
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Company Header */}
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: "#1f2937", mb: 1 }}
            >
              {client.companyName}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                alignItems: "center",
              }}
            >
              {getStatusBadge(client.status)}
              <Typography variant="body2" color="text.secondary">
                {client.industry} • {client.companySize} employees
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Contact Information */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#374151", mb: 2 }}
            >
              Contact Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "250px",
                  }}
                >
                  <PersonIcon sx={{ color: "#6b7280" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contact Person
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {client.contactPerson}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "250px",
                  }}
                >
                  <EmailIcon sx={{ color: "#6b7280" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {client.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "250px",
                  }}
                >
                  <PhoneIcon sx={{ color: "#6b7280" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {client.phone}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "250px",
                  }}
                >
                  <LocationIcon sx={{ color: "#6b7280" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {client.city}, {client.state} {client.zipcode}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon sx={{ color: "#6b7280" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {client.address}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Contract Information */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#374151", mb: 2 }}
            >
              Contract Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "250px",
                  }}
                >
                  <MoneyIcon sx={{ color: "#6b7280" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contract Value
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#059669" }}
                    >
                      {formatCurrency(client.contractValue)}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "250px",
                  }}
                >
                  <CalendarIcon sx={{ color: "#6b7280" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Payment Terms
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {client.paymentTerms}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "250px",
                  }}
                >
                  <CalendarIcon sx={{ color: "#6b7280" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contract Start Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(client.contractStartDate)}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: "250px",
                  }}
                >
                  <CalendarIcon sx={{ color: "#6b7280" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contract End Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(client.contractEndDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Performance Metrics */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#374151", mb: 2 }}
            >
              Performance Metrics
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  minWidth: "150px",
                  flex: 1,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 600, color: "#3b82f6" }}
                >
                  {client.activePositions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Positions
                </Typography>
              </Box>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: "#f0fdf4",
                  borderRadius: "8px",
                  minWidth: "150px",
                  flex: 1,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 600, color: "#059669" }}
                >
                  {client.totalPlacements}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Placements
                </Typography>
              </Box>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: "#fefce8",
                  borderRadius: "8px",
                  minWidth: "150px",
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 600, color: "#ca8a04" }}
                  >
                    {client.successRate}%
                  </Typography>
                  <TrendingUp color="#ca8a04" size={24} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Additional Information */}
          {client.notes && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#374151", mb: 2 }}
                >
                  Additional Notes
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <DescriptionIcon sx={{ color: "#6b7280", mt: 0.5 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {client.notes}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {/* Timestamps */}
          <Divider />
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#374151", mb: 2 }}
            >
              Activity Information
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ minWidth: "200px" }}>
                <Typography variant="body2" color="text.secondary">
                  Last Activity
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(client.lastActivity)}
                </Typography>
              </Box>
              {client.createdAt && (
                <Box sx={{ minWidth: "200px" }}>
                  <Typography variant="body2" color="text.secondary">
                    Client Since
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(client.createdAt)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
