import React from "react";
import { BadgeConfig, TableAction } from "../GenericTable";

// Common badge configurations
export const statusBadgeConfig: BadgeConfig = {
  colorMap: {
    true: "bg-green-100 text-green-800",
    false: "bg-red-100 text-red-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    deactivated: "bg-red-100 text-red-800",
  },
  formatValue: (value: any) => {
    if (typeof value === "boolean") {
      return value ? "Active" : "Deactivated";
    }
    return String(value);
  },
};

export const jobStatusBadgeConfig: BadgeConfig = {
  colorMap: {
    true: "bg-green-100 text-green-800",
    false: "bg-yellow-100 text-yellow-800",
  },
  formatValue: (value: any) => {
    return value ? "Approved" : "Pending";
  },
};

export const jobActiveBadgeConfig: BadgeConfig = {
  colorMap: {
    true: "bg-blue-100 text-blue-800",
    false: "bg-gray-100 text-gray-800",
  },
  formatValue: (value: any) => {
    return value ? "Active" : "Inactive";
  },
};

// Candidate status badge configuration with gradients and icons
export const candidateStatusBadgeConfig: BadgeConfig = {
  colorMap: {
    shortlist: "from-blue-500 to-indigo-500 text-white",
    assessment: "from-purple-500 to-pink-500 text-white",
    phone_interview: "from-cyan-500 to-blue-500 text-white",
    in_person_interview: "from-orange-500 to-amber-500 text-white", 
    background_check: "from-indigo-500 to-purple-500 text-white",
    selected: "from-emerald-500 to-green-500 text-white",
    rejected: "from-red-500 to-rose-500 text-white",
    stand_by: "from-amber-500 to-yellow-500 text-white",
    no_response: "from-gray-500 to-slate-500 text-white",
  },
  iconMap: {
    shortlist: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    assessment: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    phone_interview: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    in_person_interview: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    background_check: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    selected: "M5 13l4 4L19 7",
    rejected: "M6 18L18 6M6 6l12 12",
    stand_by: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    no_response: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728",
  },
  formatValue: (value: string) => {
    const labels = {
      shortlist: "Shortlisted",
      assessment: "Assessment",
      phone_interview: "Phone Interview",
      in_person_interview: "In-Person Interview",
      background_check: "Background Check",
      selected: "Selected",
      rejected: "Rejected",
      stand_by: "Stand By",
      no_response: "No Response",
    };
    return labels[value as keyof typeof labels] || value;
  },
};

// Common action icons
export const actionIcons = {
  edit: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  view: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  delete: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  toggle: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  approve: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

// Common action factory functions
export function createEditAction<T>(onEdit: (item: T) => void): TableAction<T> {
  return {
    label: "Edit",
    icon: actionIcons.edit,
    onClick: onEdit,
    variant: "default",
  };
}

export function createViewAction<T>(onView: (item: T) => void): TableAction<T> {
  return {
    label: "View Details",
    icon: actionIcons.view,
    onClick: onView,
    variant: "success",
  };
}

export function createDeleteAction<T>(onDelete: (item: T) => void): TableAction<T> {
  return {
    label: "Delete",
    icon: actionIcons.delete,
    onClick: onDelete,
    variant: "danger",
  };
}

export function createToggleStatusAction<T extends { isApproved: boolean }>(
  onToggle: (item: T) => void
): TableAction<T> {
  return {
    label: "Toggle Status",
    icon: actionIcons.toggle,
    onClick: onToggle,
    variant: "warning",
    show: () => true,
  };
}

// Common column factory functions
export function createSerialColumn() {
  return {
    key: "serial",
    label: "S.No",
    type: "number" as const,
    responsive: "always" as const,
    width: "16",
    render: (value: any, row: any, index: number) => (
      <span className="text-sm font-medium text-gray-900">{index + 1}</span>
    ),
  };
}

export function createNameColumn(key: string = "name", label: string = "Name") {
  return {
    key,
    label,
    type: "text" as const,
    responsive: "always" as const,
    searchable: true,
  };
}

export function createEmailColumn(key: string = "email", label: string = "Email") {
  return {
    key,
    label,
    type: "text" as const,
    responsive: "md" as const,
    searchable: true,
    width: "64",
    className: "truncate",
  };
}

export function createStatusColumn(key: string = "isApproved", label: string = "Status") {
  return {
    key,
    label,
    type: "badge" as const,
    responsive: "always" as const,
    badgeConfig: statusBadgeConfig,
    width: "48",
  };
}

export function createActionsColumn() {
  return {
    key: "actions",
    label: "Actions",
    type: "actions" as const,
    responsive: "always" as const,
    width: "40",
  };
} 