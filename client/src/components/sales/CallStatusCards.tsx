import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { 
  Phone, 
  PhoneDisabled, 
  SkipNext, 
  PhoneMissed, 
  CheckCircle 
} from '@mui/icons-material';

interface SalesClient {
  callStatus: "not_called" | "called" | "skipped" | "unpicked" | "completed";
}

interface CallStatusCardsProps {
  clients: SalesClient[];
}

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const statusConfigs: Record<SalesClient['callStatus'], StatusConfig> = {
  not_called: {
    label: 'Not Called',
    color: '#6b7280',
    icon: <PhoneDisabled />,
  },
  called: {
    label: 'Called',
    color: '#10b981',
    icon: <Phone />,
  },
  skipped: {
    label: 'Skipped',
    color: '#f59e0b',
    icon: <SkipNext />,
  },
  unpicked: {
    label: 'Unpicked',
    color: '#ef4444',
    icon: <PhoneMissed />,
  },
  completed: {
    label: 'Completed',
    color: '#3b82f6',
    icon: <CheckCircle />,
  },
};

export const CallStatusCards: React.FC<CallStatusCardsProps> = ({ clients }) => {
  const getStatusCount = (status: SalesClient['callStatus']) => {
    return clients.filter((client) => client.callStatus === status).length;
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Object.entries(statusConfigs).map(([status, config]) => {
        const count = getStatusCount(status as SalesClient['callStatus']);
        
        return (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={status}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    color: config.color,
                  }}
                >
                  {config.icon}
                </Box>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    color: config.color,
                    mb: 0.5,
                  }}
                >
                  {count}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {config.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}; 