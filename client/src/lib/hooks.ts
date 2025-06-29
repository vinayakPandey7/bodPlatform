import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./constants";
import {
  authFetchers,
  jobFetchers,
  candidateFetchers,
  employerFetchers,
  recruitmentPartnerFetchers,
  adminFetchers,
  notificationFetchers,
  uploadFetchers,
  type LoginCredentials,
  type RegisterData,
  type JobFilters,
} from "./fetchers";

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: authFetchers.login,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authFetchers.register,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authFetchers.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useCurrentUser = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: authFetchers.getMe,
    enabled,
    retry: false,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authFetchers.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authFetchers.resetPassword(token, password),
  });
};

// Job hooks
export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOBS.LIST(filters),
    queryFn: () => jobFetchers.getJobs(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useJob = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOBS.DETAIL(id),
    queryFn: () => jobFetchers.getJob(id),
    enabled: enabled && !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobFetchers.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.ALL });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobFetchers.updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.DETAIL(id) });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobFetchers.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS.ALL });
    },
  });
};

export const useJobApplications = (jobId: string, params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOBS.APPLICATIONS(jobId, params),
    queryFn: () => jobFetchers.getJobApplications(jobId, params),
    enabled: !!jobId,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: any }) =>
      jobFetchers.applyToJob(jobId, data),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.JOBS.APPLICATIONS(jobId),
      });
    },
  });
};

// Candidate hooks
export const useCandidates = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.LIST(params),
    queryFn: () => candidateFetchers.getCandidates(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCandidate = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.DETAIL(id),
    queryFn: () => candidateFetchers.getCandidate(id),
    enabled: enabled && !!id,
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      candidateFetchers.updateCandidate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CANDIDATES.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CANDIDATES.DETAIL(id),
      });
    },
  });
};

export const useCandidateApplications = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.APPLICATIONS(params),
    queryFn: () => candidateFetchers.getCandidateApplications(params),
    placeholderData: (previousData) => previousData,
  });
};

// Employer hooks
export const useEmployers = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYERS.LIST(params),
    queryFn: () => employerFetchers.getEmployers(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useEmployer = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYERS.DETAIL(id),
    queryFn: () => employerFetchers.getEmployer(id),
    enabled: enabled && !!id,
  });
};

export const useUpdateEmployer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      employerFetchers.updateEmployer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYERS.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EMPLOYERS.DETAIL(id),
      });
    },
  });
};

export const useEmployerJobs = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYERS.JOBS(params),
    queryFn: () => employerFetchers.getEmployerJobs(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useSavedCandidates = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYERS.SAVED_CANDIDATES(params),
    queryFn: () => employerFetchers.getSavedCandidates(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useSaveCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employerFetchers.saveCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EMPLOYERS.SAVED_CANDIDATES(),
      });
    },
  });
};

export const useUnsaveCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employerFetchers.unsaveCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EMPLOYERS.SAVED_CANDIDATES(),
      });
    },
  });
};

// Recruitment Partner hooks
export const useRecruitmentPartners = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.LIST(params),
    queryFn: () => recruitmentPartnerFetchers.getRecruitmentPartners(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useRecruitmentPartner = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.DETAIL(id),
    queryFn: () => recruitmentPartnerFetchers.getRecruitmentPartner(id),
    enabled: enabled && !!id,
  });
};

export const useUpdateRecruitmentPartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      recruitmentPartnerFetchers.updateRecruitmentPartner(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.ALL,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.DETAIL(id),
      });
    },
  });
};

export const useRecruitmentPartnerCandidates = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.CANDIDATES(params),
    queryFn: () =>
      recruitmentPartnerFetchers.getRecruitmentPartnerCandidates(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useRecruitmentPartnerJobs = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.JOBS(params),
    queryFn: () => recruitmentPartnerFetchers.getRecruitmentPartnerJobs(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useAddCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentPartnerFetchers.addCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.CANDIDATES(),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CANDIDATES.ALL });
    },
  });
};

// Admin hooks
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
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminJobs = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.JOBS(params),
    queryFn: () => adminFetchers.getAdminJobs(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminCandidates = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.LIST(params),
    queryFn: () => adminFetchers.getAdminCandidates(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminEmployers = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYERS.LIST(params),
    queryFn: () => adminFetchers.getAdminEmployers(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminRecruitmentPartners = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.LIST(params),
    queryFn: () => adminFetchers.getAdminRecruitmentPartners(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminNotifications = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(params),
    queryFn: () => adminFetchers.getAdminNotifications(params),
    placeholderData: (previousData) => previousData,
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

// Notification hooks
export const useNotifications = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(params),
    queryFn: () => notificationFetchers.getNotifications(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationFetchers.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(),
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationFetchers.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(),
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationFetchers.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(),
      });
    },
  });
};

// Upload hooks
export const useUploadResume = () => {
  return useMutation({
    mutationFn: uploadFetchers.uploadResume,
  });
};

export const useUploadProfileImage = () => {
  return useMutation({
    mutationFn: uploadFetchers.uploadProfileImage,
  });
};

export const useUploadCompanyLogo = () => {
  return useMutation({
    mutationFn: uploadFetchers.uploadCompanyLogo,
  });
};
