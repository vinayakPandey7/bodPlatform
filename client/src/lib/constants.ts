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
    APPLICATIONS: "/candidates/applications",
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
    APPLICATIONS: (params?: any) =>
      ["candidates", "applications", params] as const,
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
  ADMIN: {
    DASHBOARD: ["admin", "dashboard"] as const,
    USERS: (params?: any) => ["admin", "users", params] as const,
    JOBS: (params?: any) => ["admin", "jobs", params] as const,
  },
  NOTIFICATIONS: {
    LIST: (params?: any) => ["notifications", params] as const,
  },
} as const;
