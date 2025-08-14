"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  agentId: string;
  status: "pending" | "contacted" | "converted" | "declined";
  notes?: string;
  lastPayment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Keep for UI compatibility
  joinedDate?: string;
  feedback?: ClientFeedback[];
}

interface ClientFeedback {
  _id: string;
  message: string;
  addedBy: string;
  addedAt: string;
  type: "positive" | "negative" | "neutral" | "important";
}

interface InsuranceClientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function InsuranceClientDetailsModal({
  open,
  onClose,
  client,
}: InsuranceClientDetailsModalProps) {
  if (!client) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" component="div">
              Client Details
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Status Badge */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {client.name}
            </Typography>
            <Chip
              label={client.isActive ? "Active" : "Inactive"}
              color={client.isActive ? "success" : "error"}
              variant="filled"
              sx={{ fontWeight: "bold" }}
            />
          </Box>

          <Divider />

          {/* Personal Information */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              Personal Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                <Box display="flex" alignItems="center" gap={1} flex={1}>
                  <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {client.email}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} flex={1}>
                  <PhoneIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {client.phone}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1}>
                <LocationIcon sx={{ color: "text.secondary", fontSize: 20, mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {client.address}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Account Information */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              Account Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              <Box display="flex" alignItems="center" gap={1} flex={1}>
                <CalendarIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Joined Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(client.joinedDate || client.createdAt)}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1} flex={1}>
                <PaymentIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Payment
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {client.lastPayment ? formatDate(client.lastPayment) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Feedback Summary */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              Feedback Summary
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={`Total Remarks: ${client.feedback?.length || 0}`}
                variant="outlined"
                color="default"
              />
              {client.feedback && client.feedback.length > 0 && (
                <>
                  <Chip
                    label={`Positive: ${client.feedback.filter(f => f.type === "positive").length}`}
                    variant="outlined"
                    color="success"
                  />
                  <Chip
                    label={`Important: ${client.feedback.filter(f => f.type === "important").length}`}
                    variant="outlined"
                    color="warning"
                  />
                  <Chip
                    label={`Negative: ${client.feedback.filter(f => f.type === "negative").length}`}
                    variant="outlined"
                    color="error"
                  />
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 