"use client";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCurrentUser } from "@/lib/hooks/auth.hooks";
import {
  useCandidateProfile,
  useUpdateCandidateProfile,
} from "@/lib/hooks/candidate.hooks";
import {
  useUploadResumeToCloudinary,
  useUploadProfilePicture,
} from "@/lib/hooks/cloudinary.hooks";
import defaultProfileImage from "/public/default_pp_img.png";
import {
  AlertCircle,
  Briefcase,
  Download,
  Edit,
  FileText,
  Loader,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Star,
  Trash2,
  Upload,
  User,
  X,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Settings,
  Bell,
  Globe,
  GraduationCap,
  Users,
  Key,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CandidateProfilePage() {
  const router = useRouter();
  const {
    data: currentUserData,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useCandidateProfile();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateCandidateProfile();
  const {
    mutate: uploadResumeToCloudinary,
    isPending: isUploadingToCloudinary,
  } = useUploadResumeToCloudinary();
  const { mutate: uploadProfilePicture, isPending: isUploadingProfilePicture } =
    useUploadProfilePicture();

  // Use only Cloudinary storage
  const isUploadingAny = isUploadingToCloudinary || isUploadingProfilePicture;

  // Editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<string | null>(
    null
  );
  const [editingEducation, setEditingEducation] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pdfViewError, setPdfViewError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [profilePicDragOver, setProfilePicDragOver] = useState(false);

  // Form data states
  const [personalInfoForm, setPersonalInfoForm] = useState<any>({});
  const [experienceForm, setExperienceForm] = useState<any>({});
  const [educationForm, setEducationForm] = useState<any>({});
  const [skillForm, setSkillForm] = useState<any>({});
  const [socialLinksForm, setSocialLinksForm] = useState<any>({});
  const [preferencesForm, setPreferencesForm] = useState<any>({});

  // New features state
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
  // const [privacySettings, setPrivacySettings] = useState({
  //   profileVisibility: "public",
  //   contactVisibility: "authenticated",
  //   emailNotifications: true,
  //   smsNotifications: false,
  // });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile;
      setPersonalInfoForm(profile.personalInfo || {});
      setSocialLinksForm(profile.socialLinks || {});
      setPreferencesForm(profile.preferences || {});
    }
  }, [profileData]);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (
        tabParam &&
        ["profile", "security", "help"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Debug user data
  useEffect(() => {
    console.log("Candidate User data:", currentUserData);
    console.log("Candidate User loading:", userLoading);
    console.log("Candidate User error:", userError);
  }, [currentUserData, userLoading, userError]);

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (userLoading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
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
      <ProtectedRoute allowedRoles={["candidate"]}>
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

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <DashboardLayout>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load profile
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error loading your profile.
            </p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Extract user data safely
  const userData = currentUserData?.user || currentUserData;
  const userEmail = userData?.email || "No email available";
  const userRole = userData?.role || "No role available";

  const profile = profileData?.profile || {
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    socialLinks: {},
    preferences: {},
    resume: null,
  };

  const handleViewResume = () => {
    setPdfViewError(false);
    setShowResumeModal(true);
  };

  const handleDownloadResume = () => {
    if (profile.resume?.cloudinaryUrl) {
      const link = document.createElement("a");
      link.href = profile.resume.cloudinaryUrl;
      link.download = profile.resume.originalName || "resume";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRemoveResume = async () => {
    if (
      confirm(
        "Are you sure you want to remove your resume? This action cannot be undone."
      )
    ) {
      try {
        await updateProfile({
          resume: null,
        });
        refetch();
      } catch (error) {
        console.error("Error removing resume:", error);
        alert("Failed to remove resume");
      }
    }
  };

  const handleProfilePicUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file (JPG, PNG, etc.)");
        return;
      }

      // Validate file type (images only)
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file (JPG, PNG, GIF)");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      uploadProfilePicture(file, {
        onSuccess: (data) => {
          console.log("Profile picture uploaded to Cloudinary:", data);
          console.log("Current profile before update:", profile);

          const updatedPersonalInfo = {
            ...profile.personalInfo,
            profilePicture: {
              cloudinaryUrl: data.cloudinaryUrl,
              publicId: data.publicId,
              originalName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              uploadDate: new Date().toISOString(),
            },
          };

          console.log("Updated personal info:", updatedPersonalInfo);

          updateProfile({
            personalInfo: updatedPersonalInfo,
          });
          refetch();
        },
        onError: (error) => {
          console.error("Failed to upload profile picture:", error);
          alert("Failed to upload profile picture");
        },
      });
    }
  };

  const handleProfilePicDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setProfilePicDragOver(true);
  };

  const handleProfilePicDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setProfilePicDragOver(false);
  };

  const handleProfilePicDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setProfilePicDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file (JPG, PNG, etc.)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      uploadProfilePicture(file, {
        onSuccess: (data) => {
          console.log("Profile picture uploaded to Cloudinary:", data);
          console.log("Current profile before update:", profile);

          const updatedPersonalInfo = {
            ...profile.personalInfo,
            profilePicture: {
              cloudinaryUrl: data.cloudinaryUrl,
              publicId: data.publicId,
              originalName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              uploadDate: new Date().toISOString(),
            },
          };

          console.log("Updated personal info:", updatedPersonalInfo);

          updateProfile({
            personalInfo: updatedPersonalInfo,
          });
          refetch();
        },
        onError: (error) => {
          console.error("Failed to upload profile picture:", error);
          alert("Failed to upload profile picture");
        },
      });
    }
  };

  const handleRemoveProfilePic = async () => {
    if (confirm("Are you sure you want to remove your profile picture?")) {
      try {
        await updateProfile({
          personalInfo: {
            ...profile.personalInfo,
            profilePicture: null,
          },
        });
        refetch();
      } catch (error) {
        console.error("Error removing profile picture:", error);
        alert("Failed to remove profile picture");
      }
    }
  };

  const getAvatarUrl = () => {
    if (profile.personalInfo?.profilePicture?.cloudinaryUrl) {
      return profile.personalInfo.profilePicture.cloudinaryUrl;
    }

    // Use the default profile image
    return "https://res.cloudinary.com/dbeii9aot/image/upload/v1752680789/profile-pictures/zcay0rbjehnqpvwyesfn.png";
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-green-100 text-green-800";
      case "advanced":
        return "bg-blue-100 text-blue-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "beginner":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSkillLevelWidth = (level: string) => {
    switch (level) {
      case "expert":
        return "w-full";
      case "advanced":
        return "w-3/4";
      case "intermediate":
        return "w-1/2";
      case "beginner":
        return "w-1/4";
      default:
        return "w-1/4";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  // Handle form submissions
  const handleUpdatePersonalInfo = () => {
    updateProfile(
      {
        personalInfo: personalInfoForm,
      },
      {
        onSuccess: () => {
          setEditingSection(null);
          refetch();
        },
        onError: (error) => {
          console.error("Failed to update personal info:", error);
        },
      }
    );
  };

  const handleUpdateSocialLinks = () => {
    updateProfile(
      {
        socialLinks: socialLinksForm,
      },
      {
        onSuccess: () => {
          setEditingSection(null);
          refetch();
        },
        onError: (error) => {
          console.error("Failed to update social links:", error);
        },
      }
    );
  };

  const handleUpdatePreferences = () => {
    updateProfile(
      {
        preferences: preferencesForm,
      },
      {
        onSuccess: () => {
          setEditingSection(null);
          refetch();
        },
        onError: (error) => {
          console.error("Failed to update preferences:", error);
        },
      }
    );
  };

  const handleAddExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setExperienceForm(newExperience);
    setEditingExperience("new");
  };

  const handleSaveExperience = () => {
    const updatedExperience =
      editingExperience === "new"
        ? [...(profile.experience || []), experienceForm]
        : (profile.experience || []).map((exp: any) =>
            exp.id === editingExperience ? experienceForm : exp
          );

    updateProfile(
      {
        experience: updatedExperience,
      },
      {
        onSuccess: () => {
          setEditingExperience(null);
          setExperienceForm({});
          refetch();
        },
        onError: (error) => {
          console.error("Failed to update experience:", error);
        },
      }
    );
  };

  const handleDeleteExperience = (expId: string) => {
    const updatedExperience = (profile.experience || []).filter(
      (exp: any) => exp.id !== expId
    );
    updateProfile(
      {
        experience: updatedExperience,
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          console.error("Failed to delete experience:", error);
        },
      }
    );
  };

  const handleAddEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    };
    setEducationForm(newEducation);
    setEditingEducation("new");
  };

  const handleSaveEducation = () => {
    const updatedEducation =
      editingEducation === "new"
        ? [...(profile.education || []), educationForm]
        : (profile.education || []).map((edu: any) =>
            edu.id === editingEducation ? educationForm : edu
          );

    updateProfile(
      {
        education: updatedEducation,
      },
      {
        onSuccess: () => {
          setEditingEducation(null);
          setEducationForm({});
          refetch();
        },
        onError: (error) => {
          console.error("Failed to update education:", error);
        },
      }
    );
  };

  const handleDeleteEducation = (eduId: string) => {
    const updatedEducation = (profile.education || []).filter(
      (edu: any) => edu.id !== eduId
    );
    updateProfile(
      {
        education: updatedEducation,
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          console.error("Failed to delete education:", error);
        },
      }
    );
  };

  const handleAddSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: "",
      level: "beginner",
      years: 0,
    };
    setSkillForm(newSkill);
    setEditingSkill("new");
  };

  const handleSaveSkill = () => {
    const updatedSkills =
      editingSkill === "new"
        ? [...(profile.skills || []), skillForm]
        : (profile.skills || []).map((skill: any) =>
            skill.id === editingSkill ? skillForm : skill
          );

    updateProfile(
      {
        skills: updatedSkills,
      },
      {
        onSuccess: () => {
          setEditingSkill(null);
          setSkillForm({});
          refetch();
        },
        onError: (error) => {
          console.error("Failed to update skills:", error);
        },
      }
    );
  };

  const handleDeleteSkill = (skillId: string) => {
    const updatedSkills = (profile.skills || []).filter(
      (skill: any) => skill.id !== skillId
    );
    updateProfile(
      {
        skills: updatedSkills,
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          console.error("Failed to delete skill:", error);
        },
      }
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only PDF, DOC, or DOCX files");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      // Upload to Cloudinary
      uploadResumeToCloudinary(file, {
        onSuccess: (data) => {
          console.log("Resume uploaded to Cloudinary:", data);
          // Update profile with the resume data
          updateProfile(
            {
              resume: {
                cloudinaryUrl: data.url, // Use url from response
                originalName: file.name,
                fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                uploadDate: new Date().toISOString(),
              },
            },
            {
              onSuccess: () => {
                refetch();
                alert("Resume uploaded successfully!");
              },
              onError: (error) => {
                console.error("Failed to update profile with resume:", error);
                alert("Failed to save resume to profile");
              },
            }
          );
        },
        onError: (error) => {
          console.error("Cloudinary upload error:", error);
          alert("Failed to upload resume");
        },
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only PDF, DOC, or DOCX files");
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      // Upload to Cloudinary
      uploadResumeToCloudinary(file, {
        onSuccess: (data) => {
          console.log("Resume uploaded to Cloudinary:", data);
          // Update profile with the resume data
          updateProfile(
            {
              resume: {
                cloudinaryUrl: data.url, // Use url from response
                originalName: file.name,
                fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                uploadDate: new Date().toISOString(),
              },
            },
            {
              onSuccess: () => {
                refetch();
                alert("Resume uploaded successfully!");
              },
              onError: (error) => {
                console.error("Failed to update profile with resume:", error);
                alert("Failed to save resume to profile");
              },
            }
          );
        },
        onError: (error) => {
          console.error("Cloudinary upload error:", error);
          alert("Failed to upload resume");
        },
      });
    }
  };

  // New handler functions for enhanced features
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

  // const handlePrivacyUpdate = async () => {
  //   try {
  //     // This would be an API call to update privacy settings
  //     // await updateProfile({ privacySettings });
  //     alert("Privacy settings updated successfully");
  //   } catch (error) {
  //     console.error("Error updating privacy settings:", error);
  //     alert("Failed to update privacy settings");
  //   }
  // };

  console.log("profileprofile", profile);

  // FAQ data
  const faqData = [
    {
      question: "How do I make my profile more visible to employers?",
      answer:
        "Complete all sections of your profile, add a professional photo, upload your resume, and keep your skills updated. Profiles that are 90%+ complete get 5x more views.",
    },
    {
      question: "Can I control who sees my profile?",
      answer:
        "Yes! In your privacy settings, you can choose to make your profile public, visible only to authenticated employers, or private. You can also control visibility of your contact information separately.",
    },
    {
      question: "How do I update my resume?",
      answer:
        "Click on the 'Resume' section and either drag & drop your new resume file or click 'Upload Resume'. We support PDF, DOC, and DOCX formats up to 10MB.",
    },
    {
      question: "What should I include in my professional summary?",
      answer:
        "Write 2-3 sentences highlighting your key skills, experience, and career goals. Focus on what makes you unique and what value you bring to potential employers.",
    },
    {
      question: "How often should I update my profile?",
      answer:
        "Update your profile whenever you gain new skills, complete projects, or change your career goals. We recommend reviewing and updating at least once every 3 months.",
    },
    {
      question: "Can I export my profile data?",
      answer:
        "Yes, you can download your profile data anytime by contacting our support team. We'll provide a complete export of your information within 48 hours.",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-1 text-gray-600">
                Manage your professional information and account settings
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-md border border-white/20 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="relative">
            <div className="flex space-x-1   rounded-lg p-1">
              {[
                { id: "profile", label: "Profile", icon: User },
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
                  {/* Personal Information */}
                  <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left side - Profile Picture */}
                      <div className="relative lg:w-80 h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl overflow-hidden flex-shrink-0">
                        <img
                          src={getAvatarUrl()}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://res.cloudinary.com/dbeii9aot/image/upload/v1752680789/profile-pictures/zcay0rbjehnqpvwyesfn.png";
                          }}
                        />

                        {/* Upload overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-50 transition-opacity duration-600 flex items-center justify-center">
                          <div className="text-center">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePicUpload}
                                className="hidden"
                              />
                              <div className=" bg-opacity-10 rounded-lg p-3 mb-2">
                                <Upload className="h-6 w-6 text-white mx-auto" />
                              </div>
                              <p className="text-white text-sm font-medium">
                                Change Photo
                              </p>
                            </label>
                          </div>
                        </div>

                        {/* Profile info overlay */}
                        <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                          <h3 className="font-semibold text-lg drop-shadow-lg">
                            {profile.personalInfo?.firstName || "First"}{" "}
                            {profile.personalInfo?.lastName || "Last"}
                          </h3>
                          <p className="text-sm opacity-90 drop-shadow">
                            {profile.personalInfo?.headline ||
                              "Add your professional headline"}
                          </p>
                        </div>
                      </div>

                      {/* Right side - Personal Information */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-lg font-semibold text-gray-900">
                            Personal Information
                          </h2>
                          <button
                            onClick={() =>
                              editingSection === "personal"
                                ? setEditingSection(null)
                                : setEditingSection("personal")
                            }
                            className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {editingSection === "personal" ? (
                              <X className="h-4 w-4 mr-1" />
                            ) : (
                              <Edit className="h-4 w-4 mr-1" />
                            )}
                            {editingSection === "personal" ? "Cancel" : "Edit"}
                          </button>
                        </div>

                        {/* Personal Info Content - keeping existing form logic */}
                        {editingSection === "personal" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Existing personal info form fields */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                              </label>
                              <input
                                type="text"
                                value={personalInfoForm.firstName || ""}
                                onChange={(e) =>
                                  setPersonalInfoForm({
                                    ...personalInfoForm,
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
                                value={personalInfoForm.lastName || ""}
                                onChange={(e) =>
                                  setPersonalInfoForm({
                                    ...personalInfoForm,
                                    lastName: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                              </label>
                              <input
                                type="email"
                                value={personalInfoForm.email || ""}
                                onChange={(e) =>
                                  setPersonalInfoForm({
                                    ...personalInfoForm,
                                    email: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                              </label>
                              <input
                                type="tel"
                                value={personalInfoForm.phone || ""}
                                onChange={(e) =>
                                  setPersonalInfoForm({
                                    ...personalInfoForm,
                                    phone: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-2 flex space-x-3">
                              <button
                                onClick={handleUpdatePersonalInfo}
                                disabled={isUpdating}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingSection(null)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium">
                                  {profile.personalInfo?.firstName}{" "}
                                  {profile.personalInfo?.lastName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Mail className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">
                                  {profile.personalInfo?.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Phone className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium">
                                  {profile.personalInfo?.phone ||
                                    "Not provided"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  Location
                                </p>
                                <p className="font-medium">
                                  {profile.personalInfo?.location}{" "}
                                  {profile.personalInfo?.zipCode}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resume Section */}
                  <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Resume
                          </h2>
                          <p className="text-sm text-gray-600">
                            Upload and manage your resume
                          </p>
                        </div>
                      </div>
                    </div>

                    {profile.resume ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800">
                                {profile.resume.originalName}
                              </p>
                              <p className="text-sm text-green-600">
                                {profile.resume.fileSize} • Uploaded{" "}
                                {formatDate(profile.resume.uploadDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleViewResume}
                              className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={handleDownloadResume}
                              className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                            <button
                              onClick={handleRemoveResume}
                              className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDragOver
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-4">
                          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                                Click to upload
                              </label>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, DOC, or DOCX (max 10MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="resume-upload"
                          />
                          <label
                            htmlFor="resume-upload"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            {isUploadingAny ? (
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            {isUploadingAny ? "Uploading..." : "Upload Resume"}
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Experience Section */}
                  <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Work Experience
                          </h2>
                          <p className="text-sm text-gray-600">
                            Add your professional experience
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleAddExperience}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </button>
                    </div>

                    <div className="space-y-4">
                      {profile.experience?.map((exp: any) => (
                        <div
                          key={exp.id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          {editingExperience === exp.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Title
                                  </label>
                                  <input
                                    type="text"
                                    value={experienceForm.title || ""}
                                    onChange={(e) =>
                                      setExperienceForm({
                                        ...experienceForm,
                                        title: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company
                                  </label>
                                  <input
                                    type="text"
                                    value={experienceForm.company || ""}
                                    onChange={(e) =>
                                      setExperienceForm({
                                        ...experienceForm,
                                        company: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                  </label>
                                  <input
                                    type="text"
                                    value={experienceForm.location || ""}
                                    onChange={(e) =>
                                      setExperienceForm({
                                        ...experienceForm,
                                        location: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                  </label>
                                  <input
                                    type="month"
                                    value={experienceForm.startDate || ""}
                                    onChange={(e) =>
                                      setExperienceForm({
                                        ...experienceForm,
                                        startDate: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                {!experienceForm.current && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      End Date
                                    </label>
                                    <input
                                      type="month"
                                      value={experienceForm.endDate || ""}
                                      onChange={(e) =>
                                        setExperienceForm({
                                          ...experienceForm,
                                          endDate: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                )}
                                <div>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={experienceForm.current || false}
                                      onChange={(e) =>
                                        setExperienceForm({
                                          ...experienceForm,
                                          current: e.target.checked,
                                          endDate: e.target.checked ? "" : experienceForm.endDate,
                                        })
                                      }
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                      I currently work here
                                    </span>
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Description
                                </label>
                                <textarea
                                  rows={4}
                                  value={experienceForm.description || ""}
                                  onChange={(e) =>
                                    setExperienceForm({
                                      ...experienceForm,
                                      description: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Describe your role and achievements..."
                                />
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  onClick={handleSaveExperience}
                                  disabled={isUpdating}
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                  )}
                                  Save Experience
                                </button>
                                <button
                                  onClick={() => setEditingExperience(null)}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {exp.title}
                                  </h3>
                                  <p className="text-blue-600 font-medium">
                                    {exp.company}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {exp.location} • {formatDate(exp.startDate)} -{" "}
                                    {exp.current ? "Present" : formatDate(exp.endDate)}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setExperienceForm(exp);
                                      setEditingExperience(exp.id);
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExperience(exp.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {exp.description && (
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {editingExperience === "new" && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Job Title
                                </label>
                                <input
                                  type="text"
                                  value={experienceForm.title || ""}
                                  onChange={(e) =>
                                    setExperienceForm({
                                      ...experienceForm,
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Company
                                </label>
                                <input
                                  type="text"
                                  value={experienceForm.company || ""}
                                  onChange={(e) =>
                                    setExperienceForm({
                                      ...experienceForm,
                                      company: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  value={experienceForm.location || ""}
                                  onChange={(e) =>
                                    setExperienceForm({
                                      ...experienceForm,
                                      location: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Start Date
                                </label>
                                <input
                                  type="month"
                                  value={experienceForm.startDate || ""}
                                  onChange={(e) =>
                                    setExperienceForm({
                                      ...experienceForm,
                                      startDate: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              {!experienceForm.current && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                  </label>
                                  <input
                                    type="month"
                                    value={experienceForm.endDate || ""}
                                    onChange={(e) =>
                                      setExperienceForm({
                                        ...experienceForm,
                                        endDate: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              )}
                              <div>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={experienceForm.current || false}
                                    onChange={(e) =>
                                      setExperienceForm({
                                        ...experienceForm,
                                        current: e.target.checked,
                                        endDate: e.target.checked ? "" : experienceForm.endDate,
                                      })
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    I currently work here
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                              </label>
                              <textarea
                                rows={4}
                                value={experienceForm.description || ""}
                                onChange={(e) =>
                                  setExperienceForm({
                                    ...experienceForm,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe your role and achievements..."
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleSaveExperience}
                                disabled={isUpdating}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Experience
                              </button>
                              <button
                                onClick={() => setEditingExperience(null)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {(!profile.experience || profile.experience.length === 0) && editingExperience !== "new" && (
                        <div className="text-center py-8 text-gray-500">
                          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No work experience added yet</p>
                          <p className="text-sm">Add your professional experience to showcase your career journey</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Education
                          </h2>
                          <p className="text-sm text-gray-600">
                            Add your educational background
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleAddEducation}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </button>
                    </div>

                    <div className="space-y-4">
                      {profile.education?.map((edu: any) => (
                        <div
                          key={edu.id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          {editingEducation === edu.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Degree
                                  </label>
                                  <input
                                    type="text"
                                    value={educationForm.degree || ""}
                                    onChange={(e) =>
                                      setEducationForm({
                                        ...educationForm,
                                        degree: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School/University
                                  </label>
                                  <input
                                    type="text"
                                    value={educationForm.school || ""}
                                    onChange={(e) =>
                                      setEducationForm({
                                        ...educationForm,
                                        school: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                  </label>
                                  <input
                                    type="text"
                                    value={educationForm.location || ""}
                                    onChange={(e) =>
                                      setEducationForm({
                                        ...educationForm,
                                        location: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GPA (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={educationForm.gpa || ""}
                                    onChange={(e) =>
                                      setEducationForm({
                                        ...educationForm,
                                        gpa: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                  </label>
                                  <input
                                    type="month"
                                    value={educationForm.startDate || ""}
                                    onChange={(e) =>
                                      setEducationForm({
                                        ...educationForm,
                                        startDate: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                  </label>
                                  <input
                                    type="month"
                                    value={educationForm.endDate || ""}
                                    onChange={(e) =>
                                      setEducationForm({
                                        ...educationForm,
                                        endDate: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Description (Optional)
                                </label>
                                <textarea
                                  rows={3}
                                  value={educationForm.description || ""}
                                  onChange={(e) =>
                                    setEducationForm({
                                      ...educationForm,
                                      description: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Relevant coursework, projects, or achievements..."
                                />
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  onClick={handleSaveEducation}
                                  disabled={isUpdating}
                                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                  )}
                                  Save Education
                                </button>
                                <button
                                  onClick={() => setEditingEducation(null)}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {edu.degree}
                                  </h3>
                                  <p className="text-purple-600 font-medium">
                                    {edu.school}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {edu.location} • {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                    {edu.gpa && (
                                      <span className="ml-2 font-medium">• GPA: {edu.gpa}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setEducationForm(edu);
                                      setEditingEducation(edu.id);
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEducation(edu.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {edu.description && (
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {editingEducation === "new" && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Degree
                                </label>
                                <input
                                  type="text"
                                  value={educationForm.degree || ""}
                                  onChange={(e) =>
                                    setEducationForm({
                                      ...educationForm,
                                      degree: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  School/University
                                </label>
                                <input
                                  type="text"
                                  value={educationForm.school || ""}
                                  onChange={(e) =>
                                    setEducationForm({
                                      ...educationForm,
                                      school: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  value={educationForm.location || ""}
                                  onChange={(e) =>
                                    setEducationForm({
                                      ...educationForm,
                                      location: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  GPA (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={educationForm.gpa || ""}
                                  onChange={(e) =>
                                    setEducationForm({
                                      ...educationForm,
                                      gpa: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Start Date
                                </label>
                                <input
                                  type="month"
                                  value={educationForm.startDate || ""}
                                  onChange={(e) =>
                                    setEducationForm({
                                      ...educationForm,
                                      startDate: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  End Date
                                </label>
                                <input
                                  type="month"
                                  value={educationForm.endDate || ""}
                                  onChange={(e) =>
                                    setEducationForm({
                                      ...educationForm,
                                      endDate: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                              </label>
                              <textarea
                                rows={3}
                                value={educationForm.description || ""}
                                onChange={(e) =>
                                  setEducationForm({
                                    ...educationForm,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Relevant coursework, projects, or achievements..."
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleSaveEducation}
                                disabled={isUpdating}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Education
                              </button>
                              <button
                                onClick={() => setEditingEducation(null)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {(!profile.education || profile.education.length === 0) && editingEducation !== "new" && (
                        <div className="text-center py-8 text-gray-500">
                          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No education added yet</p>
                          <p className="text-sm">Add your educational background to strengthen your profile</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Star className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Skills
                          </h2>
                          <p className="text-sm text-gray-600">
                            Add your technical and professional skills
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleAddSkill}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </button>
                    </div>

                    <div className="space-y-4">
                      {profile.skills?.map((skill: any) => (
                        <div
                          key={skill.id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          {editingSkill === skill.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Skill Name
                                  </label>
                                  <input
                                    type="text"
                                    value={skillForm.name || ""}
                                    onChange={(e) =>
                                      setSkillForm({
                                        ...skillForm,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proficiency Level
                                  </label>
                                  <select
                                    value={skillForm.level || "beginner"}
                                    onChange={(e) =>
                                      setSkillForm({
                                        ...skillForm,
                                        level: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Years of Experience
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={skillForm.years || 0}
                                    onChange={(e) =>
                                      setSkillForm({
                                        ...skillForm,
                                        years: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  onClick={handleSaveSkill}
                                  disabled={isUpdating}
                                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                  )}
                                  Save Skill
                                </button>
                                <button
                                  onClick={() => setEditingSkill(null)}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900">
                                      {skill.name}
                                    </h3>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          setSkillForm(skill);
                                          setEditingSkill(skill.id);
                                        }}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSkill(skill.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(
                                        skill.level
                                      )}`}
                                    >
                                      {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {skill.years} year{skill.years !== 1 ? 's' : ''} of experience
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`bg-green-500 h-2 rounded-full transition-all duration-300 ${getSkillLevelWidth(
                                        skill.level
                                      )}`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {editingSkill === "new" && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Skill Name
                                </label>
                                <input
                                  type="text"
                                  value={skillForm.name || ""}
                                  onChange={(e) =>
                                    setSkillForm({
                                      ...skillForm,
                                      name: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Proficiency Level
                                </label>
                                <select
                                  value={skillForm.level || "beginner"}
                                  onChange={(e) =>
                                    setSkillForm({
                                      ...skillForm,
                                      level: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="beginner">Beginner</option>
                                  <option value="intermediate">Intermediate</option>
                                  <option value="advanced">Advanced</option>
                                  <option value="expert">Expert</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Years of Experience
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={skillForm.years || 0}
                                  onChange={(e) =>
                                    setSkillForm({
                                      ...skillForm,
                                      years: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleSaveSkill}
                                disabled={isUpdating}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Skill
                              </button>
                              <button
                                onClick={() => setEditingSkill(null)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {(!profile.skills || profile.skills.length === 0) && editingSkill !== "new" && (
                        <div className="text-center py-8 text-gray-500">
                          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No skills added yet</p>
                          <p className="text-sm">Add your skills to showcase your expertise</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
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

              {/* Privacy Tab - Commented out for now */}
              {/* {activeTab === "privacy" && (
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
                          Control who can see your information
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Profile Visibility
                        </label>
                        <div className="space-y-2">
                          {[
                            {
                              value: "public",
                              label: "Public",
                              desc: "Anyone can view your profile",
                            },
                            {
                              value: "authenticated",
                              label: "Authenticated Users Only",
                              desc: "Only verified employers can view",
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
                                name="profileVisibility"
                                value={option.value}
                                checked={
                                  privacySettings.profileVisibility ===
                                  option.value
                                }
                                onChange={(e) =>
                                  setPrivacySettings({
                                    ...privacySettings,
                                    profileVisibility: e.target.value,
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
                                  Get job alerts and updates via email
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
                  <div className="relative bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-3xl p-8 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                          <HelpCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white">
                            Career Support Center
                          </h2>
                          <p className="text-white/90 text-lg">
                            Everything you need to advance your career
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold">100K+</div>
                          <div className="text-sm text-white/80">
                            Job Opportunities
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold">90%</div>
                          <div className="text-sm text-white/80">
                            Profile Match Rate
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold">24/7</div>
                          <div className="text-sm text-white/80">
                            Career Support
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
                    <div className="group relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <Users className="h-8 w-8 mb-3" />
                        <h3 className="text-xl font-bold mb-2">
                          Career Coaching
                        </h3>
                        <p className="text-white/90">
                          Get personalized career guidance
                        </p>
                      </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <User className="h-8 w-8 mb-3" />
                        <h3 className="text-xl font-bold mb-2">
                          Profile Review
                        </h3>
                        <p className="text-white/90">
                          Optimize your profile for success
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced FAQ Section */}
                  <div className="relative bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Frequently Asked Questions
                      </h3>
                      <p className="text-gray-600">
                        Find instant answers to boost your career
                      </p>
                    </div>

                    <div className="space-y-4">
                      {faqData.map((faq, index) => (
                        <div key={index} className="group">
                          <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                            <button
                              onClick={() => toggleFAQ(index)}
                              className="w-full px-6 py-5 text-left flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white/50 hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-300"
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`p-2 rounded-xl transition-all duration-300 ${
                                    expandedFAQ === index
                                      ? "bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-lg"
                                      : "bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                  }`}
                                >
                                  <HelpCircle className="h-5 w-5" />
                                </div>
                                <span className="font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors">
                                  {faq.question}
                                </span>
                              </div>
                              <div
                                className={`p-2 rounded-xl transition-all duration-300 ${
                                  expandedFAQ === index
                                    ? "bg-emerald-100 text-emerald-600 rotate-180"
                                    : "bg-gray-100 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"
                                }`}
                              >
                                <ChevronDown className="h-5 w-5" />
                              </div>
                            </button>

                            {expandedFAQ === index && (
                              <div className="px-6 py-5 bg-gradient-to-r from-emerald-50/30 to-blue-50/30 border-t border-gray-200/30 animate-in slide-in-from-top-2 duration-300">
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
                      <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-800 rounded-2xl p-8 text-white relative overflow-hidden">
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
                                Our career success team is here to support you
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30">
                              Live Chat
                            </button>
                            <button className="px-6 py-3 bg-white text-emerald-600 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg">
                              Get Career Help
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

        {/* Resume Modal */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full h-3/4 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Resume Preview</h3>
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 p-4">
                {profile.resume?.cloudinaryUrl ? (
                  pdfViewError ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
                      <p className="text-gray-600 mb-4">
                        Unable to preview this file format.
                      </p>
                      <button
                        onClick={handleDownloadResume}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full">
                      {/* Try Google Docs Viewer first */}
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(
                          profile.resume.cloudinaryUrl
                        )}&embedded=true`}
                        className="w-full h-full border rounded"
                        onError={() => {
                          // If Google viewer fails, try direct PDF display
                          const iframe = document.querySelector(
                            'iframe[title="Resume Preview"]'
                          ) as HTMLIFrameElement;
                          if (iframe) {
                            iframe.src = `${profile.resume.cloudinaryUrl}#view=FitH&toolbar=0&navpanes=0`;
                            iframe.onload = () => {
                              // If still fails after trying direct PDF, show error
                              setTimeout(() => {
                                try {
                                  if (
                                    iframe.contentDocument?.title === "" ||
                                    iframe.contentDocument?.readyState !==
                                      "complete"
                                  ) {
                                    setPdfViewError(true);
                                  }
                                } catch (e) {
                                  setPdfViewError(true);
                                }
                              }, 3000);
                            };
                            iframe.onerror = () => setPdfViewError(true);
                          }
                        }}
                        title="Resume Preview"
                      >
                        <p>This browser does not support PDF preview.</p>
                      </iframe>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No resume uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
