"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCurrentUser } from "@/lib/hooks";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  User,
  Shield,
  Lock,
  HelpCircle,
  Key,
  Eye,
  EyeOff,
  Save,
  ChevronDown,
  ChevronUp,
  Bell,
  Globe,
  Phone,
  Users,
  Building2,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Mail,
  MessageSquare,
  FileText,
  BookOpen,
  Headphones,
  Zap,
} from "lucide-react";

interface AdminProfile {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  permissions?: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProfilePage() {
  const { data: user } = useCurrentUser();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
  });

  // Enhanced features state
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "admin_only",
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    auditLogs: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/profile");
      setProfile(response.data.profile || response.data.user);
      setFormData({
        firstName: response.data.profile?.firstName || "",
        lastName: response.data.profile?.lastName || "",
        email: response.data.profile?.email || user?.email || "",
        phoneNumber: response.data.profile?.phoneNumber || "",
        department: response.data.profile?.department || "",
      });
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to fetch profile");
      // For demo purposes, use mock data if API fails
      const mockProfile = {
        _id: user?.id || "admin1",
        email: user?.email || "admin@ciero.com",
        role: user?.role || "admin",
        isActive: true,
        firstName: "John",
        lastName: "Admin",
        phoneNumber: "+1-555-0123",
        department: "System Administration",
        permissions: [
          "manage_users",
          "manage_jobs",
          "manage_system",
          "view_analytics",
        ],
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: "2024-01-15T08:00:00.000Z",
        updatedAt: new Date().toISOString(),
      };
      setProfile(mockProfile);
      setFormData({
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        email: mockProfile.email,
        phoneNumber: mockProfile.phoneNumber,
        department: mockProfile.department,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      const response = await api.put("/admin/profile", formData);
      setProfile({
        ...profile!,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
      // For demo, just update the state
      setProfile({
        ...profile!,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setEditing(false);
      toast.success("Profile updated successfully! (Demo mode)");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email,
        phoneNumber: profile.phoneNumber || "",
        department: profile.department || "",
      });
    }
    setEditing(false);
    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      sub_admin: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {role === "sub_admin"
          ? "Sub Admin"
          : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  // FAQ data for admins
  const faqData = [
    {
      question: "How do I manage user accounts?",
      answer:
        "Navigate to the 'Users' section to view all registered users. You can approve, suspend, or delete user accounts. Use the search and filter options to find specific users quickly.",
    },
    {
      question: "What are the different user roles and permissions?",
      answer:
        "Admin: Full system access including user management, system settings, and analytics. Sub-Admin: Limited admin access for specific departments or functions. Employers: Can post jobs and manage applications. Candidates: Can apply to jobs and manage profiles.",
    },
    {
      question: "How do I approve or reject job postings?",
      answer:
        "Go to the 'Jobs' section and review pending job postings. Click on any job to view details and use the approve/reject buttons. You can also edit job details before approval.",
    },
    {
      question: "How can I monitor system activity?",
      answer:
        "Use the Dashboard to view system analytics, recent activities, and key metrics. The audit logs section provides detailed activity tracking for security and compliance purposes.",
    },
    {
      question: "What security features are available?",
      answer:
        "Two-factor authentication, session management, login notifications, suspicious activity alerts, and comprehensive audit logs. You can configure these in the Security settings.",
    },
    {
      question: "How do I manage system notifications?",
      answer:
        "Configure notification preferences in the Privacy & Security tab. You can enable/disable email notifications, SMS alerts, and system-wide announcements.",
    },
    {
      question: "Can I export system data?",
      answer:
        "Yes, you can export user data, job listings, and system reports. Use the export functions in respective sections for data analysis and backup purposes.",
    },
    {
      question: "How do I handle user disputes or issues?",
      answer:
        "Use the Help Desk section to manage support tickets. You can assign tickets, track resolution progress, and communicate with users directly through the platform.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      // This would be an API call to change password
      await api.put("/admin/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Error changing password:", err);
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleSecurityUpdate = async () => {
    try {
      // This would be an API call to update security settings
      await api.put("/admin/security-settings", securitySettings);
      toast.success("Security settings updated successfully");
    } catch (err: any) {
      console.error("Error updating security settings:", err);
      toast.error("Failed to update security settings");
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      // This would be an API call to update privacy settings
      await api.put("/admin/privacy-settings", privacySettings);
      toast.success("Privacy settings updated successfully");
    } catch (err: any) {
      console.error("Error updating privacy settings:", err);
      toast.error("Failed to update privacy settings");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile not found
            </h2>
            <p className="text-gray-600 mt-2">
              Unable to load profile information.
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Profile
              </h1>
              <p className="mt-1 text-gray-600">
                Manage your administrative account settings and system
                preferences
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={fetchProfile}
                className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-md border border-white/20 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="relative">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "security", label: "Security", icon: Shield },
                { id: "privacy", label: "Privacy", icon: Lock },
                { id: "help", label: "Help & FAQ", icon: HelpCircle },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Profile Information
                      </h2>
                      <p className="text-sm text-gray-600">
                        Manage your account details and preferences
                      </p>
                    </div>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Picture and Basic Info */}
                        <div className="lg:col-span-1">
                          <div className="text-center">
                            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-4xl font-bold text-indigo-600">
                                {(
                                  profile.firstName?.[0] || profile.email[0]
                                ).toUpperCase()}
                                {(profile.lastName?.[0] || "").toUpperCase()}
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {profile.firstName || profile.lastName
                                ? `${profile.firstName || ""} ${
                                    profile.lastName || ""
                                  }`.trim()
                                : "Admin User"}
                            </h3>
                            <div className="mt-2">
                              {getRoleBadge(profile.role)}
                            </div>
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  profile.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {profile.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Profile Details */}
                        <div className="lg:col-span-2">
                          {editing ? (
                            <form className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  name="phoneNumber"
                                  value={formData.phoneNumber}
                                  onChange={handleChange}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Department
                                </label>
                                <input
                                  type="text"
                                  name="department"
                                  value={formData.department}
                                  onChange={handleChange}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>

                              <div className="flex space-x-3 pt-4">
                                <button
                                  type="button"
                                  onClick={handleSave}
                                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                  Save Changes
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancel}
                                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-500">
                                    First Name
                                  </label>
                                  <p className="mt-1 text-sm text-gray-900">
                                    {profile.firstName || "Not provided"}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-500">
                                    Last Name
                                  </label>
                                  <p className="mt-1 text-sm text-gray-900">
                                    {profile.lastName || "Not provided"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-500">
                                  Email Address
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                  {profile.email}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-500">
                                  Phone Number
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                  {profile.phoneNumber || "Not provided"}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-500">
                                  Department
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                  {profile.department || "Not specified"}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-500">
                                  Account Created
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                  {formatDate(profile.createdAt)}
                                </p>
                              </div>

                              {profile.lastLogin && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-500">
                                    Last Login
                                  </label>
                                  <p className="mt-1 text-sm text-gray-900">
                                    {formatDate(profile.lastLogin)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  {profile.permissions && profile.permissions.length > 0 && (
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Permissions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {profile.permissions.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center p-3 bg-gray-50 rounded-md"
                            >
                              <svg
                                className="w-4 h-4 text-green-500 mr-2"
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
                              <span className="text-sm text-gray-700">
                                {permission
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Password & Security
                      </h2>
                      <p className="text-sm text-gray-600">
                        Manage your account security settings
                      </p>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Change Password
                      </h3>
                      {!showPasswordForm ? (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                        >
                          Change Password
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Current Password
                            </label>
                            <div className="relative mt-1">
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    currentPassword: e.target.value,
                                  })
                                }
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              New Password
                            </label>
                            <div className="relative mt-1">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    newPassword: e.target.value,
                                  })
                                }
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Confirm New Password
                            </label>
                            <div className="relative mt-1">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <button
                              onClick={handlePasswordChange}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                            >
                              Update Password
                            </button>
                            <button
                              onClick={() => {
                                setShowPasswordForm(false);
                                setPasswordForm({
                                  currentPassword: "",
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Account Security
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Two-Factor Authentication
                            </h4>
                            <p className="text-sm text-gray-500">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setSecuritySettings({
                                ...securitySettings,
                                twoFactorAuth: !securitySettings.twoFactorAuth,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              securitySettings.twoFactorAuth
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                securitySettings.twoFactorAuth
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Login Notifications
                            </h4>
                            <p className="text-sm text-gray-500">
                              Get notified of new login attempts
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setSecuritySettings({
                                ...securitySettings,
                                loginNotifications:
                                  !securitySettings.loginNotifications,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              securitySettings.loginNotifications
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                securitySettings.loginNotifications
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Suspicious Activity Alerts
                            </h4>
                            <p className="text-sm text-gray-500">
                              Alert on unusual account activity
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setSecuritySettings({
                                ...securitySettings,
                                suspiciousActivityAlerts:
                                  !securitySettings.suspiciousActivityAlerts,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              securitySettings.suspiciousActivityAlerts
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                securitySettings.suspiciousActivityAlerts
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="pt-4">
                          <button
                            onClick={handleSecurityUpdate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Save Security Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Lock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Privacy Settings
                      </h2>
                      <p className="text-sm text-gray-600">
                        Control your privacy and notification preferences
                      </p>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Email Notifications
                            </h4>
                            <p className="text-sm text-gray-500">
                              Receive important updates via email
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setPrivacySettings({
                                ...privacySettings,
                                emailNotifications:
                                  !privacySettings.emailNotifications,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacySettings.emailNotifications
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacySettings.emailNotifications
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              System Alerts
                            </h4>
                            <p className="text-sm text-gray-500">
                              Get notified of system-wide announcements
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setPrivacySettings({
                                ...privacySettings,
                                systemAlerts: !privacySettings.systemAlerts,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacySettings.systemAlerts
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacySettings.systemAlerts
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Audit Logs
                            </h4>
                            <p className="text-sm text-gray-500">
                              Keep detailed activity logs for compliance
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setPrivacySettings({
                                ...privacySettings,
                                auditLogs: !privacySettings.auditLogs,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacySettings.auditLogs
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacySettings.auditLogs
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="pt-4">
                          <button
                            onClick={handlePrivacyUpdate}
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                          >
                            Save Privacy Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Help & FAQ Tab */}
              {activeTab === "help" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <HelpCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Help Center
                      </h2>
                      <p className="text-sm text-gray-600">
                        Get help and find answers to common questions
                      </p>
                    </div>
                  </div>

                  {/* Quick Help Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="ml-3 text-lg font-medium text-gray-900">
                          Contact Support
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Need immediate assistance? Contact our support team.
                      </p>
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Contact Support
                      </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="ml-3 text-lg font-medium text-gray-900">
                          Documentation
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Access comprehensive system documentation and guides.
                      </p>
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                        View Docs
                      </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Headphones className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="ml-3 text-lg font-medium text-gray-900">
                          Live Chat
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Chat with our support team in real-time.
                      </p>
                      <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                        Start Chat
                      </button>
                    </div>
                  </div>

                  {/* Enhanced FAQ Section */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-6">
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-4">
                        {faqData.map((faq, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg"
                          >
                            <button
                              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                              onClick={() => toggleFAQ(index)}
                            >
                              <div className="flex items-center">
                                <HelpCircle className="h-5 w-5 text-gray-400 mr-3" />
                                <span className="font-medium text-gray-900">
                                  {faq.question}
                                </span>
                              </div>
                              {expandedFAQ === index ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            {expandedFAQ === index && (
                              <div className="px-4 pb-4">
                                <div className="pt-2 text-gray-600 border-t border-gray-100">
                                  {faq.answer}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Still Need Help Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Still Need Help?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Can't find what you're looking for? Our support team is
                        here to help.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </button>
                        <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
