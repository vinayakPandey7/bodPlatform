import React, { useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Box,
  Typography,
} from '@mui/material';

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

interface AgentAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  salesPerson: SalesPerson | null;
  agents: Agent[];
  selectedAgentIds: string[];
  onAgentToggle: (agentId: string, checked: boolean) => void;
}

const AgentAssignmentModal: React.FC<AgentAssignmentModalProps> = ({
  open,
  onClose,
  onSubmit,
  salesPerson,
  agents,
  selectedAgentIds,
  onAgentToggle,
}) => {
  const handleAgentChange = useCallback((agentId: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onAgentToggle(agentId, e.target.checked);
  }, [onAgentToggle]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 0,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        Assign Agents to {salesPerson?.name}
      </DialogTitle>
      <DialogContent>
        <FormGroup sx={{ maxHeight: 240, overflow: 'auto', mt: 1 }}>
          {agents.map((agent) => (
            <FormControlLabel
              key={agent._id}
              control={
                <Checkbox
                  checked={selectedAgentIds.includes(agent._id)}
                  onChange={handleAgentChange(agent._id)}
                  sx={{
                    color: '#3b82f6',
                    '&.Mui-checked': {
                      color: '#3b82f6',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {agent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {agent.email}
                  </Typography>
                </Box>
              }
              sx={{ mb: 1, alignItems: 'flex-start' }}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            borderColor: '#d1d5db',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f9fafb',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: '#2563eb',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          }}
        >
          Assign ({selectedAgentIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentAssignmentModal; 