import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobFetchers, JobFilters } from "../fetchers";
import { QUERY_KEYS } from "../constants";

export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOBS.LIST(filters),
    queryFn: () => jobFetchers.getJobs(filters),
    placeholderData: (previousData: any) => previousData,
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
    onSuccess: (_data: any, { id, data }: { id: string; data: any }) => {
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
    onSuccess: (_data: any, { jobId, data }: { jobId: string; data: any }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.JOBS.APPLICATIONS(jobId),
      });
    },
  });
};

export const useJobsForCandidates = (params?: {
  zipCode?: string;
  page?: number;
  limit?: number;
  search?: string;
  jobType?: string;
  experience?: string;
}) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOBS.FOR_CANDIDATES(params),
    queryFn: () => jobFetchers.getJobsForCandidates(params),
    enabled: !!params?.zipCode, // Only run query if zipCode is provided
    placeholderData: (previousData: any) => previousData,
  });
};
