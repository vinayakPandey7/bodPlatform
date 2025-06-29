// Re-export all hooks from the hooks file for backward compatibility
export * from './hooks';

// Legacy exports - these will be deprecated in favor of the new hooks
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useJobs,
  useJob,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useCandidates,
  useCandidate,
  useUpdateCandidate,
  useEmployers,
  useEmployer,
  useUpdateEmployer,
  useRecruitmentPartners,
  useRecruitmentPartner,
  useUpdateRecruitmentPartner,
  useAdminDashboard,
  useAdminUsers,
  useAdminJobs,
  useAdminCandidates,
  useAdminEmployers,
  useAdminRecruitmentPartners,
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from './hooks';

// Legacy named exports for backward compatibility
export {
  useCurrentUser as useAuth,
  useLogin as useLoginMutation,
  useRegister as useRegisterMutation,
  useLogout as useLogoutMutation,
  useJobs as useJobsQuery,
  useJob as useJobQuery,
  useCreateJob as useCreateJobMutation,
  useUpdateJob as useUpdateJobMutation,
  useDeleteJob as useDeleteJobMutation,
  useCandidates as useCandidatesQuery,
  useCandidate as useCandidateQuery,
  useUpdateCandidate as useUpdateCandidateMutation,
  useEmployers as useEmployersQuery,
  useEmployer as useEmployerQuery,
  useUpdateEmployer as useUpdateEmployerMutation,
  useRecruitmentPartners as useRecruitmentPartnersQuery,
  useRecruitmentPartner as useRecruitmentPartnerQuery,
  useUpdateRecruitmentPartner as useUpdateRecruitmentPartnerMutation,
  useAdminDashboard as useAdminDashboardQuery,
  useAdminUsers as useAdminUsersQuery,
  useAdminJobs as useAdminJobsQuery,
  useAdminCandidates as useAdminCandidatesQuery,
  useAdminEmployers as useAdminEmployersQuery,
  useAdminRecruitmentPartners as useAdminRecruitmentPartnersQuery,
  useNotifications as useNotificationsQuery,
  useMarkNotificationAsRead as useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsRead as useMarkAllNotificationsAsReadMutation,
  useDeleteNotification as useDeleteNotificationMutation,
};

// Query Keys
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    list: (params?: any) => ["jobs", "list", params] as const,
    detail: (id: string) => ["jobs", "detail", id] as const,
    applications: (jobId: string, params?: any) =>
      ["jobs", jobId, "applications", params] as const,
  },
  candidates: {
    all: ["candidates"] as const,
    list: (params?: any) => ["candidates", "list", params] as const,
    detail: (id: string) => ["candidates", "detail", id] as const,
    applications: (params?: any) =>
      ["candidates", "applications", params] as const,
  },
  employers: {
    all: ["employers"] as const,
    list: (params?: any) => ["employers", "list", params] as const,
    detail: (id: string) => ["employers", "detail", id] as const,
    jobs: (params?: any) => ["employers", "jobs", params] as const,
    savedCandidates: (params?: any) =>
      ["employers", "saved-candidates", params] as const,
  },
  recruitmentPartners: {
    all: ["recruitment-partners"] as const,
    list: (params?: any) => ["recruitment-partners", "list", params] as const,
    detail: (id: string) => ["recruitment-partners", "detail", id] as const,
    candidates: (params?: any) =>
      ["recruitment-partners", "candidates", params] as const,
    jobs: (params?: any) => ["recruitment-partners", "jobs", params] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    users: (params?: any) => ["admin", "users", params] as const,
    jobs: (params?: any) => ["admin", "jobs", params] as const,
  },
  notifications: {
    list: (params?: any) => ["notifications", params] as const,
  },
};

// Auth Hooks
export const useAuthMe = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      queryClient.clear();
    },
  });
};

// Jobs Hooks
export const useJobs = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => jobsApi.getJobs(params),
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => jobsApi.getJob(id),
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.jobs() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobsApi.updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.jobs() });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.jobs() });
    },
  });
};

export const useJobApplications = (jobId: string, params?: any) => {
  return useQuery({
    queryKey: queryKeys.jobs.applications(jobId, params),
    queryFn: () => jobsApi.getJobApplications(jobId, params),
    enabled: !!jobId,
  });
};

// Candidates Hooks
export const useCandidates = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.candidates.list(params),
    queryFn: () => candidatesApi.getCandidates(params),
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: queryKeys.candidates.detail(id),
    queryFn: () => candidatesApi.getCandidate(id),
    enabled: !!id,
  });
};

export const useUpdateCandidateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      candidatesApi.updateCandidateProfile(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.candidates.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

export const useUploadResume = () => {
  return useMutation({
    mutationFn: candidatesApi.uploadResume,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data?: any }) =>
      candidatesApi.applyToJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.candidates.applications(),
      });
    },
  });
};

export const useCandidateApplications = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.candidates.applications(params),
    queryFn: () => candidatesApi.getApplications(params),
  });
};

// Employers Hooks
export const useEmployers = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.employers.list(params),
    queryFn: () => employersApi.getEmployers(params),
  });
};

export const useEmployer = (id: string) => {
  return useQuery({
    queryKey: queryKeys.employers.detail(id),
    queryFn: () => employersApi.getEmployer(id),
    enabled: !!id,
  });
};

export const useUpdateEmployerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      employersApi.updateEmployerProfile(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employers.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

export const useEmployerJobs = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.employers.jobs(params),
    queryFn: () => employersApi.getPostedJobs(params),
  });
};

export const useSavedCandidates = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.employers.savedCandidates(params),
    queryFn: () => employersApi.getSavedCandidates(params),
  });
};

export const useSaveCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employersApi.saveCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employers.savedCandidates(),
      });
    },
  });
};

export const useUnsaveCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employersApi.unsaveCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employers.savedCandidates(),
      });
    },
  });
};

// Recruitment Partners Hooks
export const useRecruitmentPartners = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.recruitmentPartners.list(params),
    queryFn: () => recruitmentPartnersApi.getRecruitmentPartners(params),
  });
};

export const useRecruitmentPartner = (id: string) => {
  return useQuery({
    queryKey: queryKeys.recruitmentPartners.detail(id),
    queryFn: () => recruitmentPartnersApi.getRecruitmentPartner(id),
    enabled: !!id,
  });
};

export const useUpdateRecruitmentPartnerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      recruitmentPartnersApi.updateRecruitmentPartnerProfile(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recruitmentPartners.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

export const useAddCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recruitmentPartnersApi.addCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recruitmentPartners.candidates(),
      });
    },
  });
};

export const useManagedCandidates = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.recruitmentPartners.candidates(params),
    queryFn: () => recruitmentPartnersApi.getManagedCandidates(params),
  });
};

export const useAssignedJobs = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.recruitmentPartners.jobs(params),
    queryFn: () => recruitmentPartnersApi.getAssignedJobs(params),
  });
};

// Admin Hooks
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: adminApi.getDashboardStats,
  });
};

export const useAdminUsers = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminApi.getAllUsers(params),
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
};

export const useAdminJobs = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.admin.jobs(params),
    queryFn: () => adminApi.getAllJobs(params),
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) =>
      adminApi.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.jobs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};

// Notifications Hooks
export const useNotifications = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
    },
  });
};
