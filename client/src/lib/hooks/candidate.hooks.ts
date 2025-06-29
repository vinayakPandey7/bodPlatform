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
