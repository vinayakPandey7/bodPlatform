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
  Divider,
} from "@mui/material";
import { Calendar, Clock, Building, MapPin, User, Mail } from "lucide-react";
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
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CircularProgress size={60} />
          <Typography variant="h6">Loading interview invitation...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !invitationData?.data) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Invalid or Expired Invitation
          </Typography>
          <Typography>
            This interview invitation link is invalid or has expired. Please contact the employer for a new invitation.
          </Typography>
        </Alert>
      </Container>
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Logo />
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
          Interview Invitation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You've been invited for an interview. Please select a convenient time slot below.
        </Typography>
      </Box>

      {/* Job Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {job.title}
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Building className="h-4 w-4 text-gray-500" />
                <Typography variant="body1">
                  <strong>Company:</strong> {employer.companyName}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <MapPin className="h-4 w-4 text-gray-500" />
                <Typography variant="body1">
                  <strong>Location:</strong> {job.location}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {job.description && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                {job.description.length > 200 
                  ? `${job.description.substring(0, 200)}...` 
                  : job.description
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Available Slots Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Interview Slots
          </Typography>
          
          {availableSlots && availableSlots.length > 0 ? (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                We found {availableSlots.length} available time slot(s) for your interview.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                startIcon={<Calendar />}
                onClick={() => setShowSlotSelector(true)}
                sx={{ mt: 2 }}
              >
                Select Interview Time
              </Button>
            </Box>
          ) : (
            <Alert severity="info">
              <Typography>
                No available interview slots found at the moment. Please contact the employer to schedule an interview.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            What to Expect
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Select a convenient time slot from the available options
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Provide your contact information for confirmation
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Receive confirmation emails with interview details
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Prepare for your interview and join on time
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Slot Selector Modal */}
      <InterviewSlotSelector
        open={showSlotSelector}
        onClose={() => setShowSlotSelector(false)}
        employerId={employer._id}
        jobId={job._id}
        invitationToken={token}
      />
    </Container>
  );
};

export default InterviewInvitationPage;
