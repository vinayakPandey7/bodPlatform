import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetchers } from "../fetchers";
import { QUERY_KEYS } from "../constants";

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authFetchers.login,
    onSuccess: (data) => {
      console.log("useLogin onSuccess called with data:", data);

      // Set the user data in the cache immediately
      if (data?.user) {
        console.log("Login successful, user data:", data.user);
        // Match the structure that /auth/me endpoint returns: { user: {...} }
        queryClient.setQueryData(QUERY_KEYS.AUTH.ME, { user: data.user });
        console.log("User data set in cache");
      }

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });
      console.log("Queries invalidated");
    },
    onError: (error) => {
      console.error("useLogin onError called with error:", error);
    },
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
      console.log("Logout successful, clearing cache and storage");
      // Clear all query cache
      queryClient.clear();

      // Also ensure localStorage is cleared (as a backup)
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("TOKEN");
        localStorage.removeItem("user");
      }
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Even if logout fails on server, clear local data
      queryClient.clear();
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("TOKEN");
        localStorage.removeItem("user");
      }
    },
  });
};

export const useCurrentUser = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: authFetchers.getMe,
    enabled,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 401 (unauthorized) error
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
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
