"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCurrentUser } from "@/lib/hooks";
import api from "@/lib/api";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/PhoneNumberInput";
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
  Briefcase,
  Target,
  Award,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";

interface RecruitmentPartner {
  _id: string;
  companyName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  specializations: string[];
  website: string;
  description: string;
  isVerified: boolean;
  createdAt: string;
}

export default function RecruitmentPartnerProfilePage() {
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();
  const [profile, setProfile] = useState<RecruitmentPartner | null>(null);
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/recruitment-partner/profile");
      if (response.data?.profile) {
        setProfile(response.data.profile);
      } else {
        // Create a default profile structure if none exists
        const defaultProfile: RecruitmentPartner = {
          _id: "",
          companyName: "",
          contactPersonName: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          specializations: [],
          website: "",
          description: "",
          isVerified: false,
          createdAt: new Date().toISOString(),
        };
        setProfile(defaultProfile);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      // Create a default profile structure on error
      const defaultProfile: RecruitmentPartner = {
        _id: "",
        companyName: "",
        contactPersonName: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        specializations: [],
        website: "",
        description: "",
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      setProfile(defaultProfile);
      setError("Failed to fetch profile. You can still create your profile below.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => prev ? ({
      ...prev,
      [name]: value,
    }) : null);
  };

  const handleSpecializationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const specializations = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setProfile((prev) => prev ? ({
      ...prev,
      specializations,
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await api.put("/recruitment-partner/profile", profile);
      if (response.data?.profile) {
        setProfile(response.data.profile);
        toast.success(profile?._id ? "Profile updated successfully" : "Profile created successfully");
      } else {
        toast.success(profile?._id ? "Profile updated successfully" : "Profile created successfully");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
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

  // FAQ data for recruitment partners
  const faqData = [
    {
      question: "How do I add new candidates to my database?",
      answer:
        "Navigate to the 'Candidates' section and click 'Add Candidate'. Fill out all required fields including personal information, skills, experience, and contact details. You can also upload resumes and documents for better candidate management.",
    },
    {
      question: "How can I match candidates with job opportunities?",
      answer:
        "Use the 'Browse Jobs' feature to find relevant opportunities. You can filter jobs by location, industry, and requirements. Once you find a suitable match, you can submit your candidate's profile for consideration.",
    },
    {
      question: "What's the process for successful placements?",
      answer:
        "After submitting a candidate for a job, the employer will review the profile. If selected, an interview will be scheduled. Upon successful placement, you'll receive commission based on your agreement. Track all placements in the 'Placements' section.",
    },
    {
      question: "How do I manage client relationships?",
      answer:
        "Access the 'Clients' section to view all your client relationships. You can track communication history, placement success rates, and manage ongoing partnerships. Regular updates help maintain strong client relationships.",
    },
    {
      question: "What are the commission structures?",
      answer:
        "Commission rates vary based on the placement type and agreement with clients. Typically, you'll receive 15-25% of the candidate's first-year salary. Commission is paid after the candidate completes their probation period.",
    },
    {
      question: "How can I improve my success rate?",
      answer:
        "Focus on quality candidate screening, maintain detailed candidate profiles, provide excellent client service, and stay updated with industry trends. Regular training and networking also help improve placement success rates.",
    },
  ];

  if (loading || userLoading) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
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
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
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

  // Remove the profile not found check since we now create a default profile

  // Ensure profile exists
  if (!profile) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Extract user data safely
  const localStorageUserData = getUserDataFromStorage();
  const userData = user?.user || user;
  const userEmail =
    localStorageUserData?.email || userData?.email || profile.contactEmail || "No email available";
  const userRole =
    localStorageUserData?.role || userData?.role || "recruitment_partner";

  return (
    <ProtectedRoute allowedRoles={["recruitment_partner"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Recruitment Partner Profile
              </h1>
              <p className="mt-1 text-gray-600">
                Manage your recruitment agency profile and account settings
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
          <div className="relative">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 ">
              {[
                { id: "profile", label: "Profile", icon: Building2 },
                { id: "security", label: "Security", icon: Shield },
                { id: "help", label: "Help & FAQ", icon: HelpCircle },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
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
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${profile.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {profile.isVerified ? "Verified" : "Pending Verification"}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}

                    {!profile._id && (
                      <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                        <p className="font-medium">Welcome! Please complete your profile to get started.</p>
                        <p className="text-sm mt-1">Fill in your company details below to create your recruitment partner profile.</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextField
                          label="Company Name *"
                          name="companyName"
                          value={profile.companyName || ""}
                          onChange={handleInputChange}
                          required
                          fullWidth
                          variant="outlined"
                          size="small"
                        />

                        <TextField
                          label="Contact Person Name *"
                          name="contactPersonName"
                          value={profile.contactPersonName || ""}
                          onChange={handleInputChange}
                          required
                          fullWidth
                          variant="outlined"
                          size="small"
                        />

                        <TextField
                          label="Contact Email *"
                          name="contactEmail"
                          type="email"
                          value={profile.contactEmail || ""}
                          onChange={handleInputChange}
                          required
                          fullWidth
                          variant="outlined"
                          size="small"
                        />

                        <PhoneNumberInput
                          label="Contact Phone *"
                          value={profile.contactPhone || ""}
                          onChange={(value) => {
                            if (profile) {
                              setProfile({ ...profile, contactPhone: value });
                            }
                          }}
                          required
                        />

                        <TextField
                          label="Website"
                          name="website"
                          type="url"
                          value={profile.website || ""}
                          onChange={handleInputChange}
                          fullWidth
                          variant="outlined"
                          size="small"
                        />

                        <TextField
                          label="Specializations (comma-separated)"
                          name="specializations"
                          value={profile.specializations?.join(", ") || ""}
                          onChange={handleSpecializationsChange}
                          placeholder="e.g., IT, Healthcare, Finance"
                          fullWidth
                          variant="outlined"
                          size="small"
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <TextField
                          label="Address"
                          name="address"
                          value={profile.address || ""}
                          onChange={handleInputChange}
                          multiline
                          rows={3}
                          fullWidth
                          variant="outlined"
                          size="small"
                        />

                        <TextField
                          label="Company Description"
                          name="description"
                          value={profile.description || ""}
                          onChange={handleInputChange}
                          multiline
                          rows={4}
                          placeholder="Describe your recruitment services and expertise..."
                          fullWidth
                          variant="outlined"
                          size="small"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex cursor-pointer items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                  <div className="relative">
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
                        <TextField
                          label="Current Password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Enter current password"
                          fullWidth
                          variant="outlined"
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            ),
                          }}
                        />

                        <TextField
                          label="New Password"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Enter new password (min 8 characters)"
                          fullWidth
                          variant="outlined"
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            ),
                          }}
                        />

                        <TextField
                          label="Confirm New Password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirm new password"
                          fullWidth
                          variant="outlined"
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            ),
                          }}
                        />

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

              {/* Help & FAQ Tab */}
              {activeTab === "help" && (
                <div className="space-y-8">
                  {/* Modern Header with Gradient */}
                  <div className="relative bg-gradient-to-br from-purple-400 via-pink-500 to-orange-600 rounded-3xl p-8 text-white overflow-hidden">
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
                            Everything you need to succeed as a recruitment partner
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
                          <div className="text-2xl font-bold">1000+</div>
                          <div className="text-sm text-white/80">
                            Active Partners
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
                    <div className="group relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
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

                    <div className="group relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <Award className="h-8 w-8 mb-3" />
                        <h3 className="text-xl font-bold mb-2">
                          Partner Training
                        </h3>
                        <p className="text-white/90">
                          Access training materials and best practices
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced FAQ Section */}
                  <div className="relative">
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
                              className="w-full px-6 py-5 text-left flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white/50 hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300"
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`p-2 rounded-xl transition-all duration-300 ${expandedFAQ === index
                                      ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg"
                                      : "bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600"
                                    }`}
                                >
                                  <HelpCircle className="h-5 w-5" />
                                </div>
                                <span className="font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">
                                  {faq.question}
                                </span>
                              </div>
                              <div
                                className={`p-2 rounded-xl transition-all duration-300 ${expandedFAQ === index
                                    ? "bg-purple-100 text-purple-600 rotate-180"
                                    : "bg-gray-100 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500"
                                  }`}
                              >
                                <ChevronDown className="h-5 w-5" />
                              </div>
                            </button>

                            {expandedFAQ === index && (
                              <div className="px-6 py-5 bg-gradient-to-r from-purple-50/30 to-pink-50/30 border-t border-gray-200/30 animate-in slide-in-from-top-2 duration-300">
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
                      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl p-8 text-white relative overflow-hidden">
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
                                Our dedicated partner success team is here for you
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30">
                              Live Chat
                            </button>
                            <button className="px-6 py-3 bg-white text-purple-600 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg">
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
