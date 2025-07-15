import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationFetchers } from "../fetchers";
import { QUERY_KEYS } from "../constants";

export const useNotifications = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(params),
    queryFn: () => notificationFetchers.getNotifications(params),
    placeholderData: (previousData: any) => previousData,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationFetchers.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(),
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationFetchers.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(),
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationFetchers.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(),
      });
    },
  });
};
