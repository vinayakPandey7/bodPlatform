"use client";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotificationCenter from "@/components/NotificationCenter";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/lib/queries";
import { toast } from "sonner";

export default function EmployerNotificationsPage() {
  // Use TanStack Query hooks
  const {
    data: notificationsData,
    isLoading,
    error,
  } = useNotifications();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.data || [];

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      toast.success("Notification marked as read");
    } catch (err: any) {
      toast.error("Error marking notification as read");
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error("Error marking all notifications as read");
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      toast.success("Notification deleted successfully");
    } catch (err: any) {
      toast.error("Error deleting notification");
      console.error("Error deleting notification:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error: {error?.message || String(error)}
              </p>
            </div>
          )}

          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDeleteNotification}
            isLoading={isLoading}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
