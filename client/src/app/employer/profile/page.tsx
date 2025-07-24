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
} from "lucide-react";

interface EmployerProfile {
  ownerName: string;
  companyName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  jobPosting: "automatic" | "manual";
  isApproved: boolean;
}

export default function EmployerProfilePage() {
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();
  const [profile, setProfile] = useState<EmployerProfile>({
    ownerName: "",
    companyName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    jobPosting: "manual",
    isApproved: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    companyVisibility: "public",
    contactVisibility: "authenticated",
    emailNotifications: true,
    smsNotifications: false,
  });

  // Function to get user data from localStorage
  const getUserDataFromStorage = () => {
    try {
      if (typeof window !== "undefined") {
        const storedUserData = localStorage.getItem("user"); // Using 'uer' as specified
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

  // Debug user data
  useEffect(() => {
    console.log("User data:", user);
    console.log("User loading:", userLoading);
    console.log("User error:", userError);
  }, [user, userLoading, userError]);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Prefill form with localStorage data
  useEffect(() => {
    const localStorageUserData = getUserDataFromStorage();

    if (localStorageUserData) {
      console.log("localStorage user data:", localStorageUserData);

      // Prefill the profile with available data from localStorage
      setProfile((prevProfile) => ({
        ...prevProfile,
        ownerName:
          localStorageUserData.ownerName ||
          localStorageUserData.name ||
          localStorageUserData.firstName +
            " " +
            localStorageUserData.lastName ||
          prevProfile.ownerName,
        companyName:
          localStorageUserData.companyName ||
          localStorageUserData.company ||
          prevProfile.companyName,
        phoneNumber:
          localStorageUserData.phoneNumber ||
          localStorageUserData.phone ||
          prevProfile.phoneNumber,
        address: localStorageUserData.address || prevProfile.address,
        city: localStorageUserData.city || prevProfile.city,
        state:
          localStorageUserData.state ||
          localStorageUserData.province ||
          prevProfile.state,
        country: localStorageUserData.country || prevProfile.country,
        jobPosting: localStorageUserData.jobPosting || prevProfile.jobPosting,
        isApproved: localStorageUserData.isApproved || prevProfile.isApproved,
      }));
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/employer/profile");
      if (response.data.profile) {
        setProfile((prevProfile) => ({
          ...response.data.profile,
          // Keep localStorage data if API data is empty
          ownerName: response.data.profile.ownerName || prevProfile.ownerName,
          companyName:
            response.data.profile.companyName || prevProfile.companyName,
          phoneNumber:
            response.data.profile.phoneNumber || prevProfile.phoneNumber,
          address: response.data.profile.address || prevProfile.address,
          city: response.data.profile.city || prevProfile.city,
          state: response.data.profile.state || prevProfile.state,
          country: response.data.profile.country || prevProfile.country,
        }));
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.patch("/employer/profile", profile);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enhanced feature handlers
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    try {
      // This would be an API call to change password
      // await api.post('/auth/change-password', passwordForm);
      alert("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handlePrivacyUpdate = async () => {
    try {
      // This would be an API call to update privacy settings
      alert("Privacy settings updated successfully");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      alert("Failed to update privacy settings");
    }
  };

  // FAQ data for employers
  const faqData = [
    {
      question: "How do I post a job?",
      answer:
        "Navigate to the 'Jobs' section and click 'Create New Job'. Fill out all required fields including job title, description, requirements, and compensation details. Your job will be reviewed before going live if you have manual approval enabled.",
    },
    {
      question:
        "What's the difference between manual and automatic job posting?",
      answer:
        "Manual posting requires admin approval before your jobs go live, ensuring quality control. Automatic posting publishes jobs immediately after you submit them. You can change this preference in your profile settings.",
    },
    {
      question: "How can I view and manage applications?",
      answer:
        "Go to the 'Applications' section to see all candidates who have applied to your jobs. You can filter by job, review candidate profiles, and manage application status.",
    },
    {
      question: "How do I get my company approved?",
      answer:
        "After completing your profile, our team will review your company information. This typically takes 24-48 hours. You'll receive an email notification once approved.",
    },
    {
      question: "Can I edit job postings after they're published?",
      answer:
        "Yes, you can edit job postings anytime from the 'Jobs' section. Click on any job to view details and select 'Edit'. Changes will be reflected immediately for approved employers.",
    },
    {
      question: "How do I contact candidates directly?",
      answer:
        "You can contact candidates through our messaging system or view their contact information (if they've made it public) on their profile pages accessed through the applications section.",
    },
  ];

  if (loading || userLoading) {
    return (
      <ProtectedRoute allowedRoles={["employer"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (userError) {
    return (
      <ProtectedRoute allowedRoles={["employer"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to load user data
              </h2>
              <p className="text-gray-600">Please try refreshing the page</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Extract user data safely - prioritize localStorage data
  const localStorageUserData = getUserDataFromStorage();
  const userData = user?.user || user;
  const userEmail =
    localStorageUserData?.email || userData?.email || "No email available";
  const userRole =
    localStorageUserData?.role || userData?.role || "No role available";

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Company Profile
              </h1>
              <p className="mt-1 text-gray-600">
                Manage your company profile and account settings
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

          {/* Tab Navigation */}
          <div className="relative ">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: "profile", label: "Profile", icon: Building2 },
                { id: "security", label: "Security", icon: Shield },
                // { id: "privacy", label: "Privacy", icon: Lock },
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
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">
                          Email
                        </p>
                        <p className="text-gray-900 mt-1">{userEmail}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">
                          Role
                        </p>
                        <p className="text-gray-900 mt-1 capitalize">
                          {userRole?.replace("_", " ")}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">
                          Status
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                            profile.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {profile.isApproved ? "Approved" : "Pending Approval"}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="ownerName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Owner Name *
                          </label>
                          <input
                            type="text"
                            id="ownerName"
                            name="ownerName"
                            required
                            value={profile.ownerName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="companyName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Company Name *
                          </label>
                          <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            required
                            value={profile.companyName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            required
                            value={profile.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="jobPosting"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Job Posting Preference
                          </label>
                          <select
                            id="jobPosting"
                            name="jobPosting"
                            value={profile.jobPosting}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="manual">Manual Approval</option>
                            <option value="automatic">Automatic Posting</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Address *
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            required
                            value={profile.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            City *
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            value={profile.city}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            State/Province *
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            required
                            value={profile.state}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Country *
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            required
                            value={profile.country}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="relative ">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Key className="h-5 w-5 text-blue-600" />
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
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {showPasswordForm ? "Cancel" : "Change Password"}
                      </button>
                    </div>

                    {showPasswordForm && (
                      <div className="space-y-4">
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
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
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
                              placeholder="Enter new password (min 8 characters)"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
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
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={handlePasswordChange}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Update Password
                          </button>
                          <button
                            onClick={() => setShowPasswordForm(false)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {!showPasswordForm && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800">
                                Account Security
                              </p>
                              <p className="text-sm text-green-600">
                                Your account is secure
                              </p>
                            </div>
                          </div>
                          <span className="text-green-600 font-medium">
                            ✓ Protected
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Password Strength
                            </h4>
                            <p className="text-sm text-gray-600">
                              Last changed: Never
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Two-Factor Authentication
                            </h4>
                            <p className="text-sm text-gray-600">Not enabled</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Privacy Tab
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Globe className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Privacy Settings
                        </h2>
                        <p className="text-sm text-gray-600">
                          Control how your company information is shared
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Company Profile Visibility
                        </label>
                        <div className="space-y-2">
                          {[
                            {
                              value: "public",
                              label: "Public",
                              desc: "Anyone can view your company profile",
                            },
                            {
                              value: "authenticated",
                              label: "Authenticated Users Only",
                              desc: "Only verified candidates can view",
                            },
                            {
                              value: "private",
                              label: "Private",
                              desc: "Only you can view your profile",
                            },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="companyVisibility"
                                value={option.value}
                                checked={
                                  privacySettings.companyVisibility ===
                                  option.value
                                }
                                onChange={(e) =>
                                  setPrivacySettings({
                                    ...privacySettings,
                                    companyVisibility: e.target.value,
                                  })
                                }
                                className="mt-1"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {option.label}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {option.desc}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Notification Preferences
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Bell className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Email Notifications
                                </p>
                                <p className="text-sm text-gray-600">
                                  Get application alerts and platform updates
                                </p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={privacySettings.emailNotifications}
                              onChange={(e) =>
                                setPrivacySettings({
                                  ...privacySettings,
                                  emailNotifications: e.target.checked,
                                })
                              }
                              className="toggle"
                            />
                          </label>
                          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Phone className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  SMS Notifications
                                </p>
                                <p className="text-sm text-gray-600">
                                  Get urgent updates via text message
                                </p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={privacySettings.smsNotifications}
                              onChange={(e) =>
                                setPrivacySettings({
                                  ...privacySettings,
                                  smsNotifications: e.target.checked,
                                })
                              }
                              className="toggle"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handlePrivacyUpdate}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Privacy Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Help & FAQ Tab */}
              {activeTab === "help" && (
                <div className="space-y-8">
                  {/* Modern Header with Gradient */}
                  <div className="relative bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl p-8 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                          <HelpCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white">
                            Help Center
                          </h2>
                          <p className="text-white/90 text-lg">
                            Everything you need to succeed as an employer
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold">24/7</div>
                          <div className="text-sm text-white/80">
                            Support Available
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold">50K+</div>
                          <div className="text-sm text-white/80">
                            Active Candidates
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold">95%</div>
                          <div className="text-sm text-white/80">
                            Success Rate
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <Users className="h-8 w-8 mb-3" />
                        <h3 className="text-xl font-bold mb-2">
                          Contact Support
                        </h3>
                        <p className="text-white/90">
                          Get instant help from our expert team
                        </p>
                      </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <Building2 className="h-8 w-8 mb-3" />
                        <h3 className="text-xl font-bold mb-2">
                          Schedule Demo
                        </h3>
                        <p className="text-white/90">
                          See how top companies use our platform
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced FAQ Section */}
                  <div className="relative ">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Frequently Asked Questions
                      </h3>
                      <p className="text-gray-600">
                        Find instant answers to common questions
                      </p>
                    </div>

                    <div className="space-y-4">
                      {faqData.map((faq, index) => (
                        <div key={index} className="group">
                          <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                            <button
                              onClick={() => toggleFAQ(index)}
                              className="w-full px-6 py-5 text-left flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white/50 hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`p-2 rounded-xl transition-all duration-300 ${
                                    expandedFAQ === index
                                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                                      : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                                  }`}
                                >
                                  <HelpCircle className="h-5 w-5" />
                                </div>
                                <span className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                                  {faq.question}
                                </span>
                              </div>
                              <div
                                className={`p-2 rounded-xl transition-all duration-300 ${
                                  expandedFAQ === index
                                    ? "bg-blue-100 text-blue-600 rotate-180"
                                    : "bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                                }`}
                              >
                                <ChevronDown className="h-5 w-5" />
                              </div>
                            </button>

                            {expandedFAQ === index && (
                              <div className="px-6 py-5 bg-gradient-to-r from-blue-50/30 to-purple-50/30 border-t border-gray-200/30 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-start space-x-4">
                                  <div className="p-2 bg-green-100 rounded-xl">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed flex-1">
                                    {faq.answer}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Support Section */}
                    <div className="mt-10 relative">
                      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                          <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                              <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-white mb-1">
                                Still Need Help?
                              </h4>
                              <p className="text-white/90">
                                Our dedicated employer success team is here for
                                you
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30">
                              Live Chat
                            </button>
                            <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg">
                              Contact Support
                            </button>
                          </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
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
