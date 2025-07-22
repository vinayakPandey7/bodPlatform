import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Notification } from "@/lib/fetchers";
import { 
  FormControl, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  IconButton,
  Tooltip
} from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneAllIcon from '@mui/icons-material/DoneAll';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "info" | "success" | "warning" | "error">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredNotifications = notifications.filter((notification) => {
    const statusMatch =
      filter === "all" ||
      (filter === "read" && notification.read) ||
      (filter === "unread" && !notification.read);

    const typeMatch = typeFilter === "all" || notification.type === typeFilter;

    return statusMatch && typeMatch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleFilterChange = (event: SelectChangeEvent<"all" | "unread" | "read">) => {
    setFilter(event.target.value as "all" | "unread" | "read");
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<"all" | "info" | "success" | "warning" | "error">) => {
    setTypeFilter(event.target.value as "all" | "info" | "success" | "warning" | "error");
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center";
    const iconClasses = "w-5 h-5";
    
    switch (type) {
      case "info":
        return (
          <div className={`${baseClasses} bg-blue-50 text-blue-500`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "success":
        return (
          <div className={`${baseClasses} bg-green-50 text-green-500`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className={`${baseClasses} bg-yellow-50 text-yellow-500`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.694-.833-3.464 0l-6.928 12c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className={`${baseClasses} bg-red-50 text-red-500`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
            <p className="text-gray-500 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Tooltip title="Toggle filters">
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark all as read">
              <IconButton
                onClick={onMarkAllAsRead}
                className="text-primary hover:text-primary-dark"
              >
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-4 overflow-hidden"
            >
              <FormControl size="small" className="min-w-[150px]">
                <Select
                  value={filter}
                  onChange={handleFilterChange}
                  variant="outlined"
                  className="bg-white"
                >
                  <MenuItem value="all">All notifications</MenuItem>
                  <MenuItem value="unread">
                    Unread
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" className="min-w-[150px]">
                <Select
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  variant="outlined"
                  className="bg-white"
                >
                  <MenuItem value="all">All types</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "You're all caught up! Check back later for new notifications."
                : `No ${filter} notifications found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-6 flex items-start gap-4 ${
                  notification.read ? "bg-white" : "bg-blue-50/30"
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 leading-6">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <time className="text-xs text-gray-400 whitespace-nowrap">
                        {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                      </time>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification._id)}
                            className="text-sm text-primary hover:text-primary-dark transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(notification._id)}
                          className="text-sm text-red-500 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter; 