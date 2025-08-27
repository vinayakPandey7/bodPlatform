import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { interviewFetchers } from "../fetchers";
import { QUERY_KEYS } from "../constants";

// Employer: Set availability calendar
export const useSetEmployerAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: interviewFetchers.setEmployerAvailability,
    onSuccess: () => {
      // Invalidate calendar queries to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.CALENDAR() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.AVAILABILITY });
    },
  });
};

// Get available slots for candidate selection
export const useAvailableSlots = (params?: { employerId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: QUERY_KEYS.INTERVIEWS.SLOTS(params),
    queryFn: () => interviewFetchers.getAvailableSlots(params),
    enabled: !!params?.employerId || !!params?.startDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Schedule interview (candidate selects slot)
export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: interviewFetchers.scheduleInterview,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.SLOTS() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.CALENDAR() });
    },
  });
};

// Employer: Send interview invitation
export const useSendInterviewInvitation = () => {
  return useMutation({
    mutationFn: interviewFetchers.sendInterviewInvitation,
  });
};

// Get interview invitation details
export const useInterviewInvitation = (token: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.INTERVIEWS.INVITATION(token),
    queryFn: () => interviewFetchers.getInterviewInvitation(token),
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Employer: Get interview calendar
export const useEmployerCalendar = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: QUERY_KEYS.INTERVIEWS.CALENDAR(params),
    queryFn: () => interviewFetchers.getEmployerCalendar(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Employer: Update interview status
export const useUpdateInterviewStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: { status: string; notes?: string } }) =>
      interviewFetchers.updateInterviewStatus(bookingId, data),
    onSuccess: () => {
      // Invalidate calendar queries to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEWS.CALENDAR() });
    },
  });
};
