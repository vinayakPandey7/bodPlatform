import { useMutation } from "@tanstack/react-query";
import { uploadFetchers } from "../fetchers";

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
