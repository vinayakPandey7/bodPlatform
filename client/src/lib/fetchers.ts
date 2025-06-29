import { Client } from "./api";
import { API_ENDPOINTS } from "./constants";

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: "candidate" | "employer" | "recruitment_partner";
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  company: string;
  status: "active" | "paused" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  company?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employer {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentPartner {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// Auth fetchers
export const authFetchers = {
  login: async (credentials: LoginCredentials) => {
    console.log("authFetchers.login called with:", credentials);
    const response = await Client.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    console.log("Login API response:", response.data);

    const { token, user } = response.data;

    // Store token and user in localStorage
    if (typeof window !== "undefined" && token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Token and user stored in localStorage");
    }

    return response?.data;
  },

  register: async (data: RegisterData) => {
    const response = await Client.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  logout: async () => {
    try {
      const response = await Client.post(API_ENDPOINTS.AUTH.LOGOUT);

      // Clear token and user from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("TOKEN");
        localStorage.removeItem("user");
      }

      return response.data;
    } catch (error) {
      // If server logout fails, still clear local storage
      console.warn(
        "Server logout failed, clearing local storage anyway:",
        error
      );

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("TOKEN");
        localStorage.removeItem("user");
      }

      return { success: true, message: "Logged out locally" };
    }
  },

  getMe: async () => {
    const response = await Client.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await Client.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await Client.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password,
    });
    return response.data;
  },
};

// Job fetchers
export const jobFetchers = {
  getJobs: async (filters?: JobFilters): Promise<ListResponse<Job>> => {
    const response = await Client.get(API_ENDPOINTS.JOBS.LIST, {
      params: filters,
    });
    return response.data;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await Client.get(API_ENDPOINTS.JOBS.DETAIL(id));
    return response.data;
  },

  createJob: async (data: Partial<Job>) => {
    const response = await Client.post(API_ENDPOINTS.JOBS.CREATE, data);
    return response.data;
  },

  updateJob: async (id: string, data: Partial<Job>) => {
    const response = await Client.put(API_ENDPOINTS.JOBS.UPDATE(id), data);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await Client.delete(API_ENDPOINTS.JOBS.DELETE(id));
    return response.data;
  },

  getJobApplications: async (jobId: string, params?: any) => {
    const response = await Client.get(API_ENDPOINTS.JOBS.APPLICATIONS(jobId), {
      params,
    });
    return response.data;
  },

  applyToJob: async (jobId: string, data: any) => {
    const response = await Client.post(API_ENDPOINTS.JOBS.APPLY(jobId), data);
    return response.data;
  },
};

// Candidate fetchers
export const candidateFetchers = {
  getCandidates: async (params?: any): Promise<ListResponse<Candidate>> => {
    const response = await Client.get(API_ENDPOINTS.CANDIDATES.LIST, {
      params,
    });
    return response.data;
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    const response = await Client.get(API_ENDPOINTS.CANDIDATES.DETAIL(id));
    return response.data;
  },

  updateCandidate: async (id: string, data: Partial<Candidate>) => {
    const response = await Client.put(
      API_ENDPOINTS.CANDIDATES.UPDATE(id),
      data
    );
    return response.data;
  },

  getCandidateApplications: async (params?: any) => {
    const response = await Client.get(API_ENDPOINTS.CANDIDATES.APPLICATIONS, {
      params,
    });
    return response.data;
  },
};

// Employer fetchers
export const employerFetchers = {
  getEmployers: async (params?: any): Promise<ListResponse<Employer>> => {
    const response = await Client.get(API_ENDPOINTS.EMPLOYERS.LIST, { params });
    return response.data;
  },

  getEmployer: async (id: string): Promise<Employer> => {
    const response = await Client.get(API_ENDPOINTS.EMPLOYERS.DETAIL(id));
    return response.data;
  },

  updateEmployer: async (id: string, data: Partial<Employer>) => {
    const response = await Client.put(API_ENDPOINTS.EMPLOYERS.UPDATE(id), data);
    return response.data;
  },

  getEmployerJobs: async (params?: any) => {
    const response = await Client.get(API_ENDPOINTS.EMPLOYERS.JOBS, { params });
    return response.data;
  },

  getSavedCandidates: async (params?: any) => {
    const response = await Client.get(
      API_ENDPOINTS.EMPLOYERS.SAVED_CANDIDATES,
      { params }
    );
    return response.data;
  },

  saveCandidate: async (candidateId: string) => {
    const response = await Client.post(API_ENDPOINTS.EMPLOYERS.SAVE_CANDIDATE, {
      candidateId,
    });
    return response.data;
  },

  unsaveCandidate: async (candidateId: string) => {
    const response = await Client.post(
      API_ENDPOINTS.EMPLOYERS.UNSAVE_CANDIDATE,
      { candidateId }
    );
    return response.data;
  },
};

// Recruitment Partner fetchers
export const recruitmentPartnerFetchers = {
  getRecruitmentPartners: async (
    params?: any
  ): Promise<ListResponse<RecruitmentPartner>> => {
    const response = await Client.get(API_ENDPOINTS.RECRUITMENT_PARTNERS.LIST, {
      params,
    });
    return response.data;
  },

  getRecruitmentPartner: async (id: string): Promise<RecruitmentPartner> => {
    const response = await Client.get(
      API_ENDPOINTS.RECRUITMENT_PARTNERS.DETAIL(id)
    );
    return response.data;
  },

  updateRecruitmentPartner: async (
    id: string,
    data: Partial<RecruitmentPartner>
  ) => {
    const response = await Client.put(
      API_ENDPOINTS.RECRUITMENT_PARTNERS.UPDATE(id),
      data
    );
    return response.data;
  },

  getRecruitmentPartnerCandidates: async (params?: any) => {
    const response = await Client.get(
      API_ENDPOINTS.RECRUITMENT_PARTNERS.CANDIDATES,
      { params }
    );
    return response.data;
  },

  getRecruitmentPartnerJobs: async (params?: any) => {
    const response = await Client.get(API_ENDPOINTS.RECRUITMENT_PARTNERS.JOBS, {
      params,
    });
    return response.data;
  },

  addCandidate: async (data: any) => {
    const response = await Client.post(
      API_ENDPOINTS.RECRUITMENT_PARTNERS.ADD_CANDIDATE,
      data
    );
    return response.data;
  },
};

// Admin fetchers
export const adminFetchers = {
  getDashboard: async () => {
    const response = await Client.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    return response.data;
  },

  getUsers: async (params?: any) => {
    const response = await Client.get(API_ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  getAdminJobs: async (params?: any) => {
    const response = await Client.get(API_ENDPOINTS.ADMIN.JOBS, { params });
    return response.data;
  },

  getAdminCandidates: async (params?: any) => {
    const response = await Client.get(API_ENDPOINTS.ADMIN.CANDIDATES, {
      params,
    });
    return response.data;
  },

  getAdminEmployers: async (params?: any) => {
    const response = await Client.get(API_ENDPOINTS.ADMIN.EMPLOYERS, {
      params,
    });
    return response.data;
  },

  getAdminRecruitmentPartners: async (params?: any) => {
    const response = await Client.get(
      API_ENDPOINTS.ADMIN.RECRUITMENT_PARTNERS,
      { params }
    );
    return response.data;
  },

  getAdminNotifications: async (params?: any) => {
    const response = await Client.get(API_ENDPOINTS.ADMIN.NOTIFICATIONS, {
      params,
    });
    return response.data;
  },

  updateJobStatus: async (jobId: string, status: string) => {
    const response = await Client.put(
      API_ENDPOINTS.ADMIN.UPDATE_JOB_STATUS(jobId),
      { status }
    );
    return response.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const response = await Client.put(
      API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(userId),
      { status }
    );
    return response.data;
  },
};

// Notification fetchers
export const notificationFetchers = {
  getNotifications: async (
    params?: any
  ): Promise<ListResponse<Notification>> => {
    const response = await Client.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params,
    });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await Client.put(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await Client.put(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await Client.delete(
      API_ENDPOINTS.NOTIFICATIONS.DELETE(id)
    );
    return response.data;
  },
};

// Upload fetchers
export const uploadFetchers = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    const response = await Client.post(API_ENDPOINTS.UPLOAD.RESUME, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await Client.post(
      API_ENDPOINTS.UPLOAD.PROFILE_IMAGE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  uploadCompanyLogo: async (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await Client.post(
      API_ENDPOINTS.UPLOAD.COMPANY_LOGO,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
