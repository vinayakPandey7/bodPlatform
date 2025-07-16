import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateFetchers } from "../fetchers";
import { QUERY_KEYS } from "../constants";

export const useCandidates = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.LIST(params),
    queryFn: () => candidateFetchers.getCandidates(params),
    placeholderData: (previousData: any) => previousData,
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
    onSuccess: (_data: any, { id }: { id: string; data: any }) => {
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
    placeholderData: (previousData: any) => previousData,
  });
};

export const useCandidateProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.PROFILE,
    queryFn: () => candidateFetchers.getCandidateProfile(),
  });
};

export const useUpdateCandidateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: candidateFetchers.updateCandidateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CANDIDATES.PROFILE,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });
    },
  });
};

export const useCandidateSavedJobs = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.SAVED_JOBS(params),
    queryFn: () => candidateFetchers.getCandidateSavedJobs(params),
    placeholderData: (previousData: any) => previousData,
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: candidateFetchers.saveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CANDIDATES.SAVED_JOBS(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CANDIDATES.DASHBOARD,
      });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: candidateFetchers.unsaveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CANDIDATES.SAVED_JOBS(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CANDIDATES.DASHBOARD,
      });
    },
  });
};

export const useCandidateDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.DASHBOARD,
    queryFn: () => candidateFetchers.getCandidateDashboard(),
  });
};
