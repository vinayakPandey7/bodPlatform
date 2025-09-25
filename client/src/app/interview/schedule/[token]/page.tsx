"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import { Calendar, Clock, Building, MapPin, User, Mail, CheckCircle, ArrowRight } from "lucide-react";
import { useInterviewInvitation } from "@/lib/hooks/interview.hooks";
import InterviewSlotSelector from "@/components/InterviewSlotSelector";
import Logo from "@/components/Logo";

const InterviewInvitationPage = () => {
  const params = useParams();
  const token = params.token as string;
  const [showSlotSelector, setShowSlotSelector] = useState(false);

  const { data: invitationData, isLoading, error } = useInterviewInvitation(token);

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Paper elevation={1} sx={{ 
          p: 6, 
          borderRadius: 2, 
          textAlign: 'center',
          backgroundColor: 'white'
        }}>
          <CircularProgress size={50} sx={{ color: '#3b82f6', mb: 3 }} />
          <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
            Loading interview invitation...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error || !invitationData?.data) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Paper elevation={1} sx={{ 
          p: 6, 
          borderRadius: 2, 
          textAlign: 'center',
          backgroundColor: 'white',
          maxWidth: 500
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 500, mb: 2 }}>
              Invalid Invitation
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6 }}>
              This interview invitation link is invalid or has expired. Please contact the employer for a new invitation.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  const { invitation, availableSlots } = invitationData.data;
  const { booking } = invitation;
  const { employer, job } = booking;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        py: 4
      }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Logo />
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                mt: 3, 
                mb: 2, 
                color: '#1e293b', 
                fontWeight: 600
              }}
            >
              Interview Invitation
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b', 
                fontWeight: 400,
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Please select your preferred interview time from the available slots below.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* Job Details Card */}
        <Paper 
          elevation={1} 
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ 
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            p: 3
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
              {job.title}
            </Typography>
            <Chip 
              label="Interview Opportunity" 
              size="small"
              sx={{ 
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                fontWeight: 500,
                fontSize: '0.75rem'
              }} 
            />
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(12, 1fr)' }}>
              <Grid item xs={12} sm={6}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={2} 
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#f1f5f9'
                    }
                  }}
                >
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    backgroundColor: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease-in-out'
                  }}>
                    <Building size={18} style={{ color: '#0369a1' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5, fontSize: '0.75rem' }}>
                      Company
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                      {employer.companyName}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Grid item xs={12} sm={6}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={2}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#f1f5f9'
                    }
                  }}
                >
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    backgroundColor: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease-in-out'
                  }}>
                    <MapPin size={18} style={{ color: '#d97706' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5, fontSize: '0.75rem' }}>
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                      {job.location}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {job.description && (
              <Box mt={2}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontWeight: 500, fontSize: '0.75rem' }}>
                  About this role
                </Typography>
                <Typography variant="body2" sx={{ 
                  lineHeight: 1.6, 
                  color: '#475569',
                  backgroundColor: '#f8fafc',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  {job.description.length > 200 
                    ? `${job.description.substring(0, 200)}...` 
                    : job.description
                  }
                </Typography>
              </Box>
            )}
          </CardContent>
        </Paper>

        {/* Available Slots Card */}
        <Paper 
          elevation={1} 
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease-in-out'
              }}>
                <Calendar size={20} style={{ color: '#16a34a' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Choose Your Interview Time
              </Typography>
            </Box>
            
            {availableSlots && availableSlots.length > 0 ? (
              <Box>
                <Box sx={{ 
                  backgroundColor: '#f0f9ff', 
                  border: '1px solid #e0f2fe',
                  borderRadius: 1, 
                  p: 2, 
                  mb: 3 
                }}>
                  <Typography variant="body2" sx={{ 
                    color: '#0369a1', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CheckCircle size={16} />
                    {availableSlots.length} available time slot{availableSlots.length > 1 ? 's' : ''} found
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  size="medium"
                  endIcon={<ArrowRight size={16} />}
                  onClick={() => setShowSlotSelector(true)}
                  sx={{ 
                    backgroundColor: '#3b82f6',
                    borderRadius: 1,
                    py: 1,
                    px: 3,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Select Interview Time
                </Button>
              </Box>
            ) : (
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 1,
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  '& .MuiAlert-icon': {
                    color: '#d97706'
                  }
                }}
              >
                <Typography sx={{ color: '#92400e', fontSize: '0.875rem' }}>
                  No available interview slots found at the moment. Please contact the employer to schedule an interview.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Paper>

        {/* Instructions Card */}
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 2, 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={20} style={{ color: '#d97706' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                What to Expect
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {[
                { step: '1', text: 'Select a convenient time slot from the available options' },
                { step: '2', text: 'Provide your contact information for confirmation' },
                { step: '3', text: 'Receive confirmation emails with interview details' },
                { step: '4', text: 'Prepare for your interview and join on time' }
              ].map((item, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2,
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    borderColor: '#cbd5e1',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Box sx={{ 
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    {item.step}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: '#475569', 
                      fontWeight: 400,
                      lineHeight: 1.5
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Paper>
      </Container>

      {/* Slot Selector Modal */}
      <InterviewSlotSelector
        open={showSlotSelector}
        onClose={() => setShowSlotSelector(false)}
        employerId={employer._id}
        jobId={job._id}
        invitationToken={token}
      />
    </Box>
  );
};

export default InterviewInvitationPage;
