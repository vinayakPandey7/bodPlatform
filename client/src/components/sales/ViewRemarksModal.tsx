import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import { Close, ChatBubbleOutline } from '@mui/icons-material';
import { format } from 'date-fns';

interface SalesClient {
  _id: string;
  name: string;
  phone: string;
  callStatus: "not_called" | "called" | "skipped" | "unpicked" | "completed";
  salesRemarks: SalesRemark[];
}

interface SalesRemark {
  _id: string;
  message: string;
  addedBy: string;
  addedAt: string;
  callOutcome: "answered" | "no_answer" | "callback_requested" | "not_interested" | "interested";
}

interface ViewRemarksModalProps {
  open: boolean;
  onClose: () => void;
  client: SalesClient | null;
}

const getCallStatusBadge = (status: SalesClient["callStatus"]) => {
  const statusConfig = {
    not_called: { color: "default" as const, label: "Not Called" },
    called: { color: "success" as const, label: "Called" },
    skipped: { color: "warning" as const, label: "Skipped" },
    unpicked: { color: "error" as const, label: "Unpicked" },
    completed: { color: "info" as const, label: "Completed" },
  };

  const config = statusConfig[status];
  return <Chip label={config.label} color={config.color} size="small" />;
};

const getOutcomeChip = (outcome: SalesRemark["callOutcome"]) => {
  const outcomeConfig = {
    interested: { color: "success" as const, label: "INTERESTED" },
    not_interested: { color: "error" as const, label: "NOT INTERESTED" },
    no_answer: { color: "warning" as const, label: "NO ANSWER" },
    answered: { color: "info" as const, label: "ANSWERED" },
    callback_requested: { color: "secondary" as const, label: "CALLBACK REQUESTED" },
  };

  const config = outcomeConfig[outcome];
  return <Chip label={config.label} color={config.color} size="small" />;
};

const getRemarkCardColor = (outcome: SalesRemark["callOutcome"]) => {
  const colorMap = {
    interested: { bg: '#f0f9ff', border: '#0ea5e9' },
    not_interested: { bg: '#fef2f2', border: '#ef4444' },
    no_answer: { bg: '#fffbeb', border: '#f59e0b' },
    answered: { bg: '#f0f9ff', border: '#6b7280' },
    callback_requested: { bg: '#faf5ff', border: '#a855f7' },
  };
  
  return colorMap[outcome] || { bg: '#f9fafb', border: '#6b7280' };
};

export const ViewRemarksModal: React.FC<ViewRemarksModalProps> = ({
  open,
  onClose,
  client,
}) => {
  if (!client) return null;

  const sortedRemarks = [...client.salesRemarks].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div">
              Sales Remarks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {client.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Client Info Summary */}
        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {client.phone}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getCallStatusBadge(client.callStatus)}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Sales Remarks */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sales Remarks ({client.salesRemarks.length})
          </Typography>
          
          {sortedRemarks.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: 'text.secondary',
              }}
            >
              <ChatBubbleOutline sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1">
                No remarks available for this client
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sortedRemarks.map((remark) => {
                const colors = getRemarkCardColor(remark.callOutcome);
                
                return (
                  <Card
                    key={remark._id}
                    sx={{
                      bgcolor: colors.bg,
                      borderLeft: `4px solid ${colors.border}`,
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                  >
                    <CardContent sx={{ pb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          {getOutcomeChip(remark.callOutcome)}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(remark.addedAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {remark.message}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="caption" color="text.secondary">
                        Added by:{' '}
                        <Typography component="span" variant="caption" fontWeight="medium">
                          {remark.addedBy}
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 