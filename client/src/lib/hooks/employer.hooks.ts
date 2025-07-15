import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employerFetchers } from "../fetchers";
import { QUERY_KEYS } from "../constants";

export const useEmployers = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYERS.LIST(params),
    queryFn: () => employerFetchers.getEmployers(params),
    placeholderData: (previousData: any) => previousData,
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
    onSuccess: (_data: any, { id }: { id: string; data: any }) => {
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
    placeholderData: (previousData: any) => previousData,
  });
};

export const useSavedCandidates = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYERS.SAVED_CANDIDATES(params),
    queryFn: () => employerFetchers.getSavedCandidates(params),
    placeholderData: (previousData: any) => previousData,
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
