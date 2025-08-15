"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import {
  useCurrentUser,
  useSalesPersonProfile,
  useUpdateSalesPersonProfile,
} from "@/lib/hooks";
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
  MapPin,
  Briefcase,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Mail,
  IdCard,
  DollarSign,
  BarChart3,
  GraduationCap,
} from "lucide-react";

interface SalesPersonProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  department: string;
  territory: string;
  managerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedAgents: Array<{
    agentId: string;
    agentName: string;
    agentEmail: string;
    assignedDate: string;
    isActive: boolean;
  }>;
  salesQuota: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  performance: {
    callsMade: number;
    clientsContacted: number;
    salesClosed: number;
    commission: number;
  };
  permissions: string[];
  isActive: boolean;
  isApproved: boolean;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function SalesProfilePage() {
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  const {
    data: profile,
    isLoading: loading,
    error: profileError,
    refetch: fetchProfile,
  } = useSalesPersonProfile();
  const { mutate: updateProfile, isPending: saving } =
    useUpdateSalesPersonProfile();

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
    profileVisibility: "team",
    contactVisibility: "authenticated",
    emailNotifications: true,
    smsNotifications: false,
    performanceVisibility: "manager",
  });

  // Editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Tab configuration
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  // Function to get user data from localStorage
  const getUserDataFromStorage = () => {
    try {
      if (typeof window !== "undefined") {
        const storedUserData = localStorage.getItem("user");
        if (storedUserData) {
          return JSON.parse(storedUserData);
        }
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  // Handle URL parameters for tab navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (
        tabParam &&
        ["profile", "security", "privacy", "help"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phoneNumber: profile.phoneNumber || "",
        department: profile.department || "sales",
        territory: profile.territory || "",
        bio: profile.bio || "",
        workAddress: profile.workAddress || {},
        socialLinks: profile.socialLinks || {},
        skills: profile.skills || [],
        certifications: profile.certifications || [],
        experience: profile.experience || [],
        education: profile.education || [],
      });
    }
  }, [profile]);

  const handleSaveSection = async (section: string) => {
    updateProfile(formData, {
      onSuccess: () => {
        setEditingSection(null);
      },
    });
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      toast.success("Password changed successfully");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const updateTab = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDepartmentLabel = (department: string) => {
    const labels: { [key: string]: string } = {
      sales: "Sales",
      business_development: "Business Development",
      account_management: "Account Management",
      inside_sales: "Inside Sales",
    };
    return labels[department] || department;
  };

  // FAQ Data
  const faqData = [
    {
      question: "How do I update my sales quotas?",
      answer:
        "Sales quotas are set by your manager or admin. Contact your supervisor to discuss quota adjustments.",
    },
    {
      question: "Can I view my performance metrics?",
      answer:
        "Yes, your current performance metrics are displayed in your profile. These include calls made, clients contacted, sales closed, and commission earned.",
    },
    {
      question: "How do I manage my assigned agents?",
      answer:
        "You can view and manage your assigned insurance agents from the main dashboard. Click on 'My Agents' to see detailed information.",
    },
    {
      question: "What permissions do I have?",
      answer:
        "Your permissions are set by the admin and determine what actions you can perform in the system. These are displayed in your profile.",
    },
    {
      question: "How do I change my territory?",
      answer:
        "Territory assignments are managed by administrators. Please contact your manager to request territory changes.",
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["sales_person"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (profileError && !profile) {
    return (
      <ProtectedRoute allowedRoles={["sales_person"]}>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">
              {profileError?.message || "Failed to load profile"}
            </p>
            <button
              onClick={() => fetchProfile()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const localStorageUserData = getUserDataFromStorage();
  const userData = user || localStorageUserData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Profile</h1>
            <p className="mt-1 text-gray-600">
              Manage your sales profile and account settings
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => fetchProfile()}
              className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-md border border-white/20 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-white/20">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => updateTab(tab.id)}
                  className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Account Status */}
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Account Information
                      </h2>
                      <p className="text-sm text-gray-600">
                        Your account details and status
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Status
                          </p>
                          <p
                            className={`text-lg font-semibold ${
                              profile?.isApproved
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {profile?.isApproved ? "Approved" : "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IdCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Employee ID
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {profile?.employeeId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Start Date
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {profile?.startDate &&
                              formatDate(profile.startDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Personal Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Your basic profile information
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (editingSection === "personal") {
                          setEditingSection(null);
                        } else {
                          setEditingSection("personal");
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      {editingSection === "personal" ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  {editingSection === "personal" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <PhoneNumberInput
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChange={(value) =>
                              setFormData({
                                ...formData,
                                phoneNumber: value,
                              })
                            }
                            className="!py-5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                          </label>
                          <select
                            value={formData.department}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                department: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="sales">Sales</option>
                            <option value="business_development">
                              Business Development
                            </option>
                            <option value="account_management">
                              Account Management
                            </option>
                            <option value="inside_sales">Inside Sales</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Territory
                        </label>
                        <input
                          type="text"
                          value={formData.territory}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              territory: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., West Coast, Northeast, etc."
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleSaveSection("personal")}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Full Name
                            </p>
                            <p className="text-gray-900">
                              {profile?.firstName} {profile?.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Email
                            </p>
                            <p className="text-gray-900">{profile?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Phone
                            </p>
                            <p className="text-gray-900">
                              {profile?.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Department
                            </p>
                            <p className="text-gray-900">
                              {profile?.department &&
                                getDepartmentLabel(profile.department)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Territory
                            </p>
                            <p className="text-gray-900">
                              {profile?.territory || "Not assigned"}
                            </p>
                          </div>
                        </div>
                        {profile?.managerId && (
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Manager
                              </p>
                              <p className="text-gray-900">
                                {profile.managerId.firstName}{" "}
                                {profile.managerId.lastName}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sales Quotas */}
                {/* <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sales Quotas
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your assigned sales targets
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            Monthly
                          </p>
                          <p className="text-2xl font-bold text-blue-900">
                            $
                            {profile?.salesQuota?.monthly?.toLocaleString() ||
                              0}
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">
                            Quarterly
                          </p>
                          <p className="text-2xl font-bold text-purple-900">
                            $
                            {profile?.salesQuota?.quarterly?.toLocaleString() ||
                              0}
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            Yearly
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            $
                            {profile?.salesQuota?.yearly?.toLocaleString() || 0}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Performance Metrics */}
                {/* <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Award className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Performance Metrics
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your current performance statistics
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">
                        {profile?.performance?.callsMade || 0}
                      </p>
                      <p className="text-sm text-blue-600">Calls Made</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">
                        {profile?.performance?.clientsContacted || 0}
                      </p>
                      <p className="text-sm text-purple-600">
                        Clients Contacted
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-900">
                        {profile?.performance?.salesClosed || 0}
                      </p>
                      <p className="text-sm text-green-600">Sales Closed</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-xl">
                      <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-900">
                        $
                        {profile?.performance?.commission?.toLocaleString() ||
                          0}
                      </p>
                      <p className="text-sm text-yellow-600">Commission</p>
                    </div>
                  </div>
                </div> */}

                {/* Assigned Agents */}
                {/* <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Assigned Agents
                      </h3>
                      <p className="text-sm text-gray-600">
                        Insurance agents under your management
                      </p>
                    </div>
                  </div>

                  {profile?.assignedAgents &&
                  profile.assignedAgents.length > 0 ? (
                    <div className="space-y-3">
                      {profile.assignedAgents.map(
                        (agent: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-indigo-100 rounded-full">
                                <User className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {agent.agentName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {agent.agentEmail}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Assigned: {formatDate(agent.assignedDate)}
                              </p>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  agent.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {agent.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No agents assigned yet</p>
                    </div>
                  )}
                </div> */}

                {/* Skills */}
                {/* <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Award className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Skills
                        </h3>
                        <p className="text-sm text-gray-600">
                          Your professional skills and competencies
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (editingSection === "skills") {
                          setEditingSection(null);
                        } else {
                          setEditingSection("skills");
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      {editingSection === "skills" ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  {editingSection === "skills" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills (one per line)
                        </label>
                        <textarea
                          value={formData.skills?.join("\n") || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: e.target.value
                                .split("\n")
                                .filter((skill) => skill.trim()),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={6}
                          placeholder="e.g., Sales Management&#10;Customer Relationship Management&#10;Lead Generation"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleSaveSection("skills")}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Skills"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill: any, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">
                          No skills added yet
                        </p>
                      )}
                    </div>
                  )}
                </div> */}

                {/* Experience
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Work Experience
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your professional work history
                      </p>
                    </div>
                  </div>

                  {profile?.experience && profile.experience.length > 0 ? (
                    <div className="space-y-4">
                      {profile.experience.map((exp: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {exp.title}
                              </h4>
                              <p className="text-blue-600 font-medium">
                                {exp.company}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(exp.startDate)} -{" "}
                                {exp.isCurrent
                                  ? "Present"
                                  : exp.endDate
                                  ? formatDate(exp.endDate)
                                  : "N/A"}
                              </p>
                              {exp.description && (
                                <p className="text-gray-700 mt-2">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No work experience added yet</p>
                    </div>
                  )}
                </div>

                {/* Education */}
                {/* <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Education
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your educational background
                      </p>
                    </div>
                  </div>

                  {profile?.education && profile.education.length > 0 ? (
                    <div className="space-y-4">
                      {profile.education.map((edu: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {edu.degree}
                              </h4>
                              <p className="text-purple-600 font-medium">
                                {edu.institution}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(edu.startDate)} -{" "}
                                {edu.endDate
                                  ? formatDate(edu.endDate)
                                  : "Present"}
                              </p>
                              {edu.fieldOfStudy && (
                                <p className="text-gray-700 mt-1">
                                  Field: {edu.fieldOfStudy}
                                </p>
                              )}
                              {edu.gpa && (
                                <p className="text-gray-700">
                                  GPA: {edu.gpa}/4.0
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No education records added yet</p>
                    </div>
                  )}
                </div> */}

                {/* Certifications */}
                {/* <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Certifications
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your professional certifications and credentials
                      </p>
                    </div>
                  </div>

                  {profile?.certifications &&
                  profile.certifications.length > 0 ? (
                    <div className="space-y-4">
                      {profile.certifications.map(
                        (cert: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {cert.name}
                                </h4>
                                <p className="text-yellow-600 font-medium">
                                  {cert.issuer}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Issued: {formatDate(cert.issueDate)}
                                  {cert.expiryDate &&
                                    ` - Expires: ${formatDate(
                                      cert.expiryDate
                                    )}`}
                                </p>
                                {cert.credentialId && (
                                  <p className="text-gray-700 mt-1 font-mono text-sm">
                                    ID: {cert.credentialId}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No certifications added yet</p>
                    </div>
                  )}
                </div>  */}

                {/* Permissions */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Permissions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your system access permissions
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile?.permissions?.map(
                      (permission: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
                        >
                          <div className="p-1 bg-green-100 rounded-full">
                            <Shield className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-green-800">
                            {permission
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l: any) => l.toUpperCase())}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Lock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Password & Security
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage your account security settings
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Password</p>
                          <p className="text-sm text-gray-600">
                            Last changed: Never
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        {showPasswordForm ? "Cancel" : "Change Password"}
                      </button>
                    </div>

                    {showPasswordForm && (
                      <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  newPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
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
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Updating..." : "Update Password"}
                          </button>
                          <button
                            onClick={() => setShowPasswordForm(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Privacy Settings
                      </h3>
                      <p className="text-sm text-gray-600">
                        Control your profile visibility and privacy
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Profile Visibility
                        </p>
                        <p className="text-sm text-gray-600">
                          Who can see your profile information
                        </p>
                      </div>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) =>
                          setPrivacySettings({
                            ...privacySettings,
                            profileVisibility: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="public">Public</option>
                        <option value="team">Team Only</option>
                        <option value="manager">Manager Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Contact Information
                        </p>
                        <p className="text-sm text-gray-600">
                          Who can see your contact details
                        </p>
                      </div>
                      <select
                        value={privacySettings.contactVisibility}
                        onChange={(e) =>
                          setPrivacySettings({
                            ...privacySettings,
                            contactVisibility: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="authenticated">
                          Authenticated Users
                        </option>
                        <option value="team">Team Only</option>
                        <option value="manager">Manager Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    {/* 
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Performance Metrics
                        </p>
                        <p className="text-sm text-gray-600">
                          Who can view your performance data
                        </p>
                      </div>
                      <select
                        value={privacySettings.performanceVisibility}
                        onChange={(e) =>
                          setPrivacySettings({
                            ...privacySettings,
                            performanceVisibility: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="manager">Manager Only</option>
                        <option value="team">Team Only</option>
                        <option value="admin">Admin Only</option>
                      </select>
                    </div> */}
                  </div>
                </div>

                {/* <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Bell className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notification Preferences
                      </h3>
                      <p className="text-sm text-gray-600">
                        Choose how you want to receive notifications
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Email Notifications
                        </p>
                        <p className="text-sm text-gray-600">
                          Receive updates via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.emailNotifications}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          SMS Notifications
                        </p>
                        <p className="text-sm text-gray-600">
                          Receive updates via text message
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.smsNotifications}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              smsNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div> */}
              </div>
            )}

            {/* Help Tab */}
            {activeTab === "help" && (
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <HelpCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Frequently Asked Questions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Get answers to common questions
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {faqData.map((faq, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedFAQ(expandedFAQ === index ? null : index)
                          }
                          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-900">
                            {faq.question}
                          </span>
                          {expandedFAQ === index ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        {expandedFAQ === index && (
                          <div className="px-4 py-3 bg-white border-t border-gray-200">
                            <p className="text-gray-700">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Need More Help?
                      </h3>
                      <p className="text-sm text-gray-600">
                        Contact our support team for additional assistance
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">
                            Email Support
                          </p>
                          <p className="text-sm text-blue-600">
                            support@company.com
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">
                            Phone Support
                          </p>
                          <p className="text-sm text-green-600">
                            +1 (555) 123-4567
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
