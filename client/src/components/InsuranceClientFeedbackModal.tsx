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
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  ChatBubble as ChatBubbleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  joinedDate: string;
  lastPayment: string;
  feedback: ClientFeedback[];
}

interface ClientFeedback {
  _id: string;
  message: string;
  addedBy: string;
  addedAt: string;
  type: "positive" | "negative" | "neutral" | "important";
}

interface InsuranceClientFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
}

const getFeedbackTypeConfig = (type: string) => {
  switch (type) {
    case "positive":
      return {
        color: "success" as const,
        bgColor: "success.light",
        borderColor: "success.main",
      };
    case "negative":
      return {
        color: "error" as const,
        bgColor: "error.light",
        borderColor: "error.main",
      };
    case "important":
      return {
        color: "warning" as const,
        bgColor: "warning.light",
        borderColor: "warning.main",
      };
    case "neutral":
    default:
      return {
        color: "default" as const,
        bgColor: "grey.100",
        borderColor: "grey.400",
      };
  }
};

export default function InsuranceClientFeedbackModal({
  open,
  onClose,
  client,
}: InsuranceClientFeedbackModalProps) {
  if (!client) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const sortedFeedback = [...client.feedback].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
            <ChatBubbleIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" component="div">
              Client Remarks - {client.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Client Info Summary */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              bgcolor: client.isActive ? "success.50" : "error.50",
              border: 1,
              borderColor: client.isActive ? "success.200" : "error.200"
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {client.name}
              </Typography>
              <Chip
                label={client.isActive ? "Active" : "Inactive"}
                color={client.isActive ? "success" : "error"}
                variant="filled"
                size="small"
              />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`Total Remarks: ${client.feedback.length}`}
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Positive: ${client.feedback.filter(f => f.type === "positive").length}`}
                color="success"
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Important: ${client.feedback.filter(f => f.type === "important").length}`}
                color="warning"
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Negative: ${client.feedback.filter(f => f.type === "negative").length}`}
                color="error"
                variant="outlined"
                size="small"
              />
            </Box>
          </Paper>

          {/* Remarks History */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              All Remarks ({client.feedback.length})
            </Typography>
            
            {client.feedback.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  No remarks available for this client yet.
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2, 
                maxHeight: '60vh', 
                overflowY: 'auto',
                pr: 1
              }}>
                {sortedFeedback.map((feedback) => {
                  const typeConfig = getFeedbackTypeConfig(feedback.type);
                  
                  return (
                    <Paper
                      key={feedback._id}
                      elevation={1}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        borderLeft: 4,
                        borderLeftColor: typeConfig.borderColor,
                        bgcolor: typeConfig.bgColor,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          elevation: 2,
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip
                          label={feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}
                          color={typeConfig.color}
                          size="small"
                          variant="filled"
                        />
                        <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
                          <ScheduleIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">
                            {formatDate(feedback.addedAt)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {feedback.message}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Added by:{" "}
                          <Typography component="span" variant="caption" fontWeight="bold">
                            {feedback.addedBy}
                          </Typography>
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 