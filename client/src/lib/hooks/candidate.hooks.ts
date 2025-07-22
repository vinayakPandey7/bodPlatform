import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateFetchers } from "@/lib/fetchers";
import { QUERY_KEYS } from "@/lib/constants";

export const useCandidates = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.LIST(params),
    queryFn: () => candidateFetchers.getCandidates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData: any) => previousData,
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.DETAIL(id),
    queryFn: () => candidateFetchers.getCandidate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCandidateProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.PROFILE,
    queryFn: candidateFetchers.getCandidateProfile,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useCandidateApplications = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.APPLICATIONS(params),
    queryFn: () => candidateFetchers.getCandidateApplications(params),
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for applications
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData: any) => previousData,
    retry: 2,
  });
};

export const useCandidateSavedJobs = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.SAVED_JOBS(params),
    queryFn: () => candidateFetchers.getCandidateSavedJobs(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData: any) => previousData,
  });
};

export const useCandidateDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CANDIDATES.DASHBOARD,
    queryFn: candidateFetchers.getCandidateDashboard,
    staleTime: 60 * 1000, // 1 minute - dashboard data can be slightly stale
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useUpdateCandidateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: candidateFetchers.updateCandidateProfile,
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(QUERY_KEYS.CANDIDATES.PROFILE, data);
      // Invalidate dashboard to refresh stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CANDIDATES.DASHBOARD });
    },
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: candidateFetchers.saveJob,
    onSuccess: () => {
      // Invalidate saved jobs query to refresh the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CANDIDATES.SAVED_JOBS() });
      // Optionally invalidate dashboard if it shows saved jobs count
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CANDIDATES.DASHBOARD });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: candidateFetchers.unsaveJob,
    onSuccess: () => {
      // Invalidate saved jobs query to refresh the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CANDIDATES.SAVED_JOBS() });
      // Optionally invalidate dashboard if it shows saved jobs count
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CANDIDATES.DASHBOARD });
    },
  });
};
