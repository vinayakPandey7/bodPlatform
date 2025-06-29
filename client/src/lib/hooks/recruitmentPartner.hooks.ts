import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recruitmentPartnerFetchers } from "../fetchers";
import { QUERY_KEYS } from "../constants";

export const useRecruitmentPartners = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.LIST(params),
    queryFn: () => recruitmentPartnerFetchers.getRecruitmentPartners(params),
    placeholderData: (previousData: any) => previousData,
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
    onSuccess: (_data: any, { id }: { id: string; data: any }) => {
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
    placeholderData: (previousData: any) => previousData,
  });
};

export const useRecruitmentPartnerJobs = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT_PARTNERS.JOBS(params),
    queryFn: () => recruitmentPartnerFetchers.getRecruitmentPartnerJobs(params),
    placeholderData: (previousData: any) => previousData,
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
