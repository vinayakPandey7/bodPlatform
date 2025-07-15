import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetchers } from "../fetchers";
import { QUERY_KEYS } from "../constants";

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.DASHBOARD,
    queryFn: adminFetchers.getDashboard,
  });
};

export const useAdminUsers = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.USERS(params),
    queryFn: () => adminFetchers.getUsers(params),
    placeholderData: (previousData: any) => previousData,
  });
};

export const useAdminJobs = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.JOBS(params),
    queryFn: () => adminFetchers.getAdminJobs(params),
    placeholderData: (previousData: any) => previousData,
  });
};

export const useAdminCandidates = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.LIST(params),
    queryFn: () => adminFetchers.getAdminCandidates(params),
    placeholderData: (previousData: any) => previousData,
  });
};

export const useAdminEmployers = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYERS.LIST(params),
    queryFn: () => adminFetchers.getAdminEmployers(params),
    placeholderData: (previousData: any) => previousData,
  });
};

export const useAdminRecruitmentPartners = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.LIST(params),
    queryFn: () => adminFetchers.getAdminRecruitmentPartners(params),
    placeholderData: (previousData: any) => previousData,
  });
};

export const useAdminNotifications = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(params),
    queryFn: () => adminFetchers.getAdminNotifications(params),
    placeholderData: (previousData: any) => previousData,
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) =>
      adminFetchers.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.JOBS() });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminFetchers.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS() });
    },
  });
};
