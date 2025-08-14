import { authFetchers } from "./fetchers";

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: "employer" | "recruitment_partner" | "admin" | "sub_admin" | "sales_person";
  profile: any;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await authFetchers.login(data);
    const { token, user } = response;

    return { token, user };
  }

  // Logout
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const token = localStorage.getItem("token");
      return !!token;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return false;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    await authFetchers.forgotPassword(email);
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<void> {
    await authFetchers.resetPassword(token, password);
  }

  // Get user profile
  async getProfile(): Promise<User> {
    const response = await authFetchers.getMe();
    return response.user;
  }
}

export default new AuthService();
