"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/lib/queries";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
}

export default function EmployerNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Use TanStack Query hooks
  const {
    data: notificationsData,
    isLoading: loading,
    error,
  } = useNotifications();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.data || [];

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (err: any) {
      console.error("Error deleting notification:", err);
    }
  };

  const filteredNotifications = notifications.filter(
    (notification: Notification) => {
      if (filter === "all") return true;
      if (filter === "read") return notification.isRead;
      if (filter === "unread") return !notification.isRead;
      return true;
    }
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["employer"]}>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {markAllAsReadMutation.isPending ? "Marking..." : "Mark All Read"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error: {error?.message || String(error)}
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  className={`border rounded-lg p-4 ${
                    notification.isRead
                      ? "bg-gray-50"
                      : "bg-white border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          disabled={markAsReadMutation.isPending}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification._id)
                        }
                        disabled={deleteNotificationMutation.isPending}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
