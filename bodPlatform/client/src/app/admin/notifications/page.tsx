"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  recipient: {
    id: string;
    email: string;
    role: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "info" | "success" | "warning" | "error"
  >("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/notifications");
      setNotifications(response.data.notifications || []);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Failed to fetch notifications");
      // For demo purposes, use mock data if API fails
      setNotifications([
        {
          _id: "1",
          title: "New Employer Registration",
          message: "TechCorp Solutions has registered and is pending approval.",
          type: "info",
          recipient: {
            id: "admin1",
            email: "admin@bodportal.com",
            role: "admin",
          },
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "2",
          title: "Job Approved Successfully",
          message:
            "Senior Software Engineer position at State Farm Insurance has been approved and is now active.",
          type: "success",
          recipient: {
            id: "admin1",
            email: "admin@bodportal.com",
            role: "admin",
          },
          isRead: true,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "3",
          title: "System Maintenance Required",
          message:
            "Database optimization is recommended to improve performance.",
          type: "warning",
          recipient: {
            id: "admin1",
            email: "admin@bodportal.com",
            role: "admin",
          },
          isRead: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "4",
          title: "Failed Payment Processing",
          message:
            "Payment processing failed for subscription renewal of CloudTech Inc.",
          type: "error",
          recipient: {
            id: "admin1",
            email: "admin@bodportal.com",
            role: "admin",
          },
          isRead: false,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "5",
          title: "New Recruitment Partner",
          message:
            "Elite Talent Solutions has successfully registered and been approved.",
          type: "success",
          recipient: {
            id: "admin1",
            email: "admin@bodportal.com",
            role: "admin",
          },
          isRead: true,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.put(`/admin/notifications/${notificationId}/read`);
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      // For demo, just update the state
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/admin/notifications/mark-all-read");
      setNotifications(
        notifications.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
      // For demo, just update the state
      setNotifications(
        notifications.map((notif) => ({ ...notif, isRead: true }))
      );
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/admin/notifications/${notificationId}`);
      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId)
      );
    } catch (err: any) {
      console.error("Error deleting notification:", err);
      // For demo, just update the state
      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId)
      );
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const statusMatch =
      filter === "all" ||
      (filter === "read" && notification.isRead) ||
      (filter === "unread" && !notification.isRead);

    const typeMatch = typeFilter === "all" || notification.type === typeFilter;

    return statusMatch && typeMatch;
  });

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case "success":
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: Notification["type"]) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notification Management
              </h1>
              <p className="mt-1 text-gray-600">
                Monitor and manage system notifications
              </p>
            </div>
            <button
              onClick={handleMarkAllAsRead}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Mark All as Read
            </button>
          </div>

          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              API connection failed. Showing demo data. Error: {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === "unread"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Unread ({notifications.filter((n) => !n.isRead).length})
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === "read"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Read ({notifications.filter((n) => n.isRead).length})
                </button>
              </div>

              <div className="flex space-x-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                {["all", "info", "success", "warning", "error"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type as any)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      typeFilter === type
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    {type !== "all" &&
                      ` (${
                        notifications.filter((n) => n.type === type).length
                      })`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.length === 0 ? (
                <li className="p-6 text-center text-gray-500">
                  No notifications found for the selected filters.
                </li>
              ) : (
                filteredNotifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`${
                      !notification.isRead ? "bg-blue-50" : "bg-white"
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3
                                className={`text-sm font-medium ${
                                  !notification.isRead
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                                {!notification.isRead && (
                                  <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                                )}
                              </h3>
                              {getTypeBadge(notification.type)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              <span>To: {notification.recipient.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 flex space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteNotification(notification._id)
                            }
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Summary Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Notification Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {notifications.length}
                </div>
                <div className="text-sm text-gray-600">Total Notifications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {notifications.filter((n) => !n.isRead).length}
                </div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    notifications.filter(
                      (n) => n.type === "warning" || n.type === "error"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Require Attention</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter((n) => n.type === "success").length}
                </div>
                <div className="text-sm text-gray-600">Success</div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
