// API endpoint URLs
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // User management endpoints
  USERS: {
    LIST: "/admin/users",
    DETAIL: (id: string) => `/admin/users/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/users/${id}/status`,
    DELETE: (id: string) => `/admin/users/${id}`,
  },

  // Job endpoints
  JOBS: {
    LIST: "/jobs",
    DETAIL: (id: string) => `/jobs/${id}`,
    CREATE: "/jobs",
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
    APPLICATIONS: (jobId: string) => `/jobs/${jobId}/applications`,
    APPLY: (jobId: string) => `/jobs/${jobId}/apply`,
    FOR_CANDIDATES: "/jobs/candidates/nearby",
  },

  // Candidate endpoints
  CANDIDATES: {
    LIST: "/candidates",
    DETAIL: (id: string) => `/candidates/${id}`,
    UPDATE: (id: string) => `/candidates/${id}`,
    PROFILE: "/candidates/profile",
    UPDATE_PROFILE: "/candidates/profile",
    APPLICATIONS: "/candidates/applications",
    SAVED_JOBS: "/candidates/saved-jobs",
    SAVE_JOB: "/candidates/save-job",
    UNSAVE_JOB: "/candidates/unsave-job",
    DASHBOARD: "/candidates/dashboard",
  },

  // Employer endpoints
  EMPLOYERS: {
    LIST: "/employers",
    DETAIL: (id: string) => `/employers/${id}`,
    UPDATE: (id: string) => `/employers/${id}`,
    JOBS: "/employers/jobs",
    SAVED_CANDIDATES: "/employers/saved-candidates",
    SAVE_CANDIDATE: "/employers/save-candidate",
    UNSAVE_CANDIDATE: "/employers/unsave-candidate",
  },

  // Recruitment Partner endpoints
  RECRUITMENT_PARTNERS: {
    LIST: "/recruitment-partners",
    DETAIL: (id: string) => `/recruitment-partners/${id}`,
    UPDATE: (id: string) => `/recruitment-partners/${id}`,
    CANDIDATES: "/recruitment-partners/candidates",
    JOBS: "/recruitment-partners/jobs",
    ADD_CANDIDATE: "/recruitment-partners/candidates",
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    JOBS: "/admin/jobs",
    CANDIDATES: "/admin/candidates",
    EMPLOYERS: "/admin/employers",
    RECRUITMENT_PARTNERS: "/admin/recruitment-partners",
    NOTIFICATIONS: "/admin/notifications",
    UPDATE_JOB_STATUS: (jobId: string) => `/admin/jobs/${jobId}/status`,
    UPDATE_USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,
  },

  // Sales Person endpoints
  SALES_PERSONS: {
    LIST: "/admin/sales-persons",
    CREATE: "/admin/sales-persons",
    DETAIL: (id: string) => `/admin/sales-persons/${id}`,
    UPDATE: (id: string) => `/admin/sales-persons/${id}`,
    DELETE: (id: string) => `/admin/sales-persons/${id}`,
    ASSIGN_AGENTS: (id: string) => `/admin/sales-persons/${id}/assign-agents`,
    MY_AGENTS: "/sales-person/agents/me",
    MY_PROFILE: "/sales-person/profile/me",
  },

  // Insurance Agent endpoints
  INSURANCE_AGENTS: {
    LIST: "/insurance-agents",
    CREATE: "/insurance-agents",
    DETAIL: (id: string) => `/insurance-agents/${id}`,
    UPDATE: (id: string) => `/insurance-agents/${id}`,
    DELETE: (id: string) => `/insurance-agents/${id}`,
    TOGGLE_STATUS: (id: string) => `/insurance-agents/${id}/toggle-status`,
  },

  // Interview endpoints
  INTERVIEWS: {
    SET_AVAILABILITY: "/interviews/employer/availability",
    GET_SLOTS: "/interviews/slots",
    SCHEDULE: "/interviews/schedule",
    SEND_INVITATION: "/interviews/employer/invitation",
    GET_INVITATION: (token: string) => `/interviews/invitation/${token}`,
    GET_CALENDAR: "/interviews/employer/calendar",
    UPDATE_STATUS: (bookingId: string) => `/interviews/employer/interview/${bookingId}/status`,
  },

  // Insurance Client endpoints
  INSURANCE_CLIENTS: {
    LIST: "/insurance-clients",
    BY_AGENT: (agentId: string) => `/insurance-clients/agent/${agentId}`,
    DETAIL: (id: string) => `/insurance-clients/${id}`,
    CREATE: "/insurance-clients",
    UPDATE: (id: string) => `/insurance-clients/${id}`,
    DELETE: (id: string) => `/insurance-clients/${id}`,
    IMPORT_CSV: (agentId: string) => `/insurance-clients/agent/${agentId}/import-csv`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: "/notifications",
    DETAIL: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // Upload endpoints
  UPLOAD: {
    RESUME: "/upload/resume",
    PROFILE_IMAGE: "/upload/profile-image",
    COMPANY_LOGO: "/upload/company-logo",
  },
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  AUTH: {
    ME: ["auth", "me"] as const,
  },
  JOBS: {
    ALL: ["jobs"] as const,
    LIST: (params?: any) => ["jobs", "list", params] as const,
    DETAIL: (id: string) => ["jobs", "detail", id] as const,
    APPLICATIONS: (jobId: string, params?: any) =>
      ["jobs", jobId, "applications", params] as const,
    FOR_CANDIDATES: (params?: any) =>
      ["jobs", "for-candidates", params] as const,
  },
  CANDIDATES: {
    ALL: ["candidates"] as const,
    LIST: (params?: any) => ["candidates", "list", params] as const,
    DETAIL: (id: string) => ["candidates", "detail", id] as const,
    PROFILE: ["candidates", "profile"] as const,
    APPLICATIONS: (params?: any) =>
      ["candidates", "applications", params] as const,
    SAVED_JOBS: (params?: any) => 
      ["candidates", "saved-jobs", params] as const,
    DASHBOARD: ["candidates", "dashboard"] as const,
  },
  EMPLOYERS: {
    ALL: ["employers"] as const,
    LIST: (params?: any) => ["employers", "list", params] as const,
    DETAIL: (id: string) => ["employers", "detail", id] as const,
    JOBS: (params?: any) => ["employers", "jobs", params] as const,
    SAVED_CANDIDATES: (params?: any) =>
      ["employers", "saved-candidates", params] as const,
  },
  RECRUITMENT_PARTNERS: {
    ALL: ["recruitment-partners"] as const,
    LIST: (params?: any) => ["recruitment-partners", "list", params] as const,
    DETAIL: (id: string) => ["recruitment-partners", "detail", id] as const,
    CANDIDATES: (params?: any) =>
      ["recruitment-partners", "candidates", params] as const,
    JOBS: (params?: any) => ["recruitment-partners", "jobs", params] as const,
  },
  SALES_PERSONS: {
    ALL: ["sales-persons"] as const,
    LIST: (params?: any) => ["sales-persons", "list", params] as const,
    DETAIL: (id: string) => ["sales-persons", "detail", id] as const,
  },
  INSURANCE_AGENTS: {
    ALL: ["insurance-agents"] as const,
    LIST: (params?: any) => ["insurance-agents", "list", params] as const,
    DETAIL: (id: string) => ["insurance-agents", "detail", id] as const,
  },
  INTERVIEWS: {
    ALL: ["interviews"] as const,
    AVAILABILITY: ["interviews", "availability"] as const,
    SLOTS: (params?: any) => ["interviews", "slots", params] as const,
    CALENDAR: (params?: any) => ["interviews", "calendar", params] as const,
    INVITATION: (token: string) => ["interviews", "invitation", token] as const,
  },
  ADMIN: {
    DASHBOARD: ["admin", "dashboard"] as const,
    USERS: (params?: any) => ["admin", "users", params] as const,
    JOBS: (params?: any) => ["admin", "jobs", params] as const,
  },
  NOTIFICATIONS: {
    LIST: (params?: any) => ["notifications", params] as const,
  },
} as const;
