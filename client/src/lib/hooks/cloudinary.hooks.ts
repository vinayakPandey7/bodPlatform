import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

// Upload profile picture to Cloudinary
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await api.post("/upload/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch candidate profile
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
    },
  });
};

// Upload resume to Cloudinary
export const useUploadResumeToCloudinary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post("/upload/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch candidate profile
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
    },
  });
};
