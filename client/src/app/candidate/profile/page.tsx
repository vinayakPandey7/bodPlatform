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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CandidateProfilePage() {
  const router = useRouter();
  const { data: currentUserData } = useCurrentUser();
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

  // Initialize form data when profile loads
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile;
      setPersonalInfoForm(profile.personalInfo || {});
      setSocialLinksForm(profile.socialLinks || {});
      setPreferencesForm(profile.preferences || {});
    }
  }, [profileData]);

  const profile = profileData?.profile || {
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    socialLinks: {},
    preferences: {},
    resume: null,
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

  const handleViewResume = () => {
    setPdfViewError(false);
    setShowResumeModal(true);
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
      // Upload to Cloudinary only
      uploadResumeToCloudinary(file, {
        onSuccess: (data) => {
          console.log("Resume uploaded to Cloudinary:", data);
          // Update profile immediately and refetch
          updateProfile({
            resume: {
              cloudinaryUrl: data.cloudinaryUrl || data.url, // Use cloudinaryUrl from server response
              originalName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              uploadDate: new Date().toISOString(),
            },
          });
          refetch();
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
          // Update profile immediately and refetch
          updateProfile({
            resume: {
              cloudinaryUrl: data.secure_url,
              originalName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              uploadDate: new Date().toISOString(),
            },
          });
          refetch();
        },
        onError: (error) => {
          console.error("Cloudinary upload error:", error);
          alert("Failed to upload resume");
        },
      });
    }
  };

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

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-1 text-gray-600">
                Manage your professional information
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Profile Picture */}
              <div className="relative w-full lg:w-48 h-64 lg:h-auto bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group">
                <div className="relative">
                  <img
                    src={getAvatarUrl()}
                    alt="Profile Picture"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition-all duration-500 group-hover:opacity-60"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer">
                    {isUploadingAny ? (
                      <div className="text-center text-white">
                        <Loader className="h-6 w-6 mx-auto mb-1 animate-spin" />
                        <p className="text-xs font-medium">Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        {/* Upload Icon */}
                        <div className="flex flex-col items-center mb-2">
                          <Upload className="h-5 w-5 mx-auto mb-1" />
                          <p className="text-xs font-medium">Upload</p>
                        </div>

                        {/* Remove Button - Only show if profile picture exists */}
                        {/* {profile.personalInfo?.profilePicture
                          ?.cloudinaryUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveProfilePic();
                            }}
                            className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg transform hover:scale-110 duration-200"
                            disabled={isUpdating}
                            title="Remove Photo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )} */}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploadingAny}
                    />
                  </div>
                </div>

                {/* Name and Title on the card */}
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
              <div className="flex-1 p-6">
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

                {editingSection === "personal" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={personalInfoForm.location || ""}
                        onChange={(e) =>
                          setPersonalInfoForm({
                            ...personalInfoForm,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={personalInfoForm.zipCode || ""}
                        onChange={(e) =>
                          setPersonalInfoForm({
                            ...personalInfoForm,
                            zipCode: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={personalInfoForm.gender || ""}
                        onChange={(e) =>
                          setPersonalInfoForm({
                            ...personalInfoForm,
                            gender: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Headline
                      </label>
                      <input
                        type="text"
                        value={personalInfoForm.headline || ""}
                        onChange={(e) =>
                          setPersonalInfoForm({
                            ...personalInfoForm,
                            headline: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Senior Software Engineer with 5+ years experience"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Summary
                      </label>
                      <textarea
                        rows={4}
                        value={personalInfoForm.summary || ""}
                        onChange={(e) =>
                          setPersonalInfoForm({
                            ...personalInfoForm,
                            summary: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Write a brief summary of your professional background and goals..."
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
                          {profile.personalInfo?.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">
                          {profile.personalInfo?.location}{" "}
                          {profile.personalInfo?.zipCode}
                        </p>
                      </div>
                    </div>
                    {profile.personalInfo?.gender && (
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="font-medium capitalize">
                            {profile.personalInfo.gender.replace("-", " ")}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.personalInfo?.headline && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">
                          Professional Headline
                        </p>
                        <p className="font-medium">
                          {profile.personalInfo.headline}
                        </p>
                      </div>
                    )}
                    {profile.personalInfo?.summary && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">
                          Professional Summary
                        </p>
                        <p className="text-gray-700 mt-1">
                          {profile.personalInfo.summary}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Work Experience
                </h2>
                <button
                  onClick={handleAddExperience}
                  className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Experience
                </button>
              </div>

              <div className="space-y-6">
                {(profile.experience || []).map((exp: any, index: number) => (
                  <div
                    key={exp.id}
                    className="border-l-2 border-gray-200 pl-6 relative"
                  >
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>

                    {editingExperience === exp.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <div className="space-y-2">
                              <input
                                type="month"
                                value={
                                  experienceForm.current
                                    ? ""
                                    : experienceForm.endDate || ""
                                }
                                onChange={(e) =>
                                  setExperienceForm({
                                    ...experienceForm,
                                    endDate: e.target.value,
                                  })
                                }
                                disabled={experienceForm.current}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              />
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={experienceForm.current || false}
                                  onChange={(e) =>
                                    setExperienceForm({
                                      ...experienceForm,
                                      current: e.target.checked,
                                      endDate: "",
                                    })
                                  }
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-600">
                                  I currently work here
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
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
                            Save
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
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {exp.title}
                            </h3>
                            <p className="text-blue-600 font-medium">
                              {exp.company}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(exp.startDate)} -{" "}
                              {exp.current
                                ? "Present"
                                : formatDate(exp.endDate)}
                            </p>
                            {exp.location && (
                              <p className="text-sm text-gray-600">
                                {exp.location}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setExperienceForm(exp);
                                setEditingExperience(exp.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {editingExperience === "new" && (
                  <div className="border-l-2 border-gray-200 pl-6 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <div className="space-y-2">
                            <input
                              type="month"
                              value={
                                experienceForm.current
                                  ? ""
                                  : experienceForm.endDate || ""
                              }
                              onChange={(e) =>
                                setExperienceForm({
                                  ...experienceForm,
                                  endDate: e.target.value,
                                })
                              }
                              disabled={experienceForm.current}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            />
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={experienceForm.current || false}
                                onChange={(e) =>
                                  setExperienceForm({
                                    ...experienceForm,
                                    current: e.target.checked,
                                    endDate: "",
                                  })
                                }
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-600">
                                I currently work here
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
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
                          Save
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

                {(!profile.experience || profile.experience.length === 0) &&
                  editingExperience !== "new" && (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No work experience added yet</p>
                      <button
                        onClick={handleAddExperience}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first experience
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                <button
                  onClick={handleAddSkill}
                  className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(profile.skills || []).map((skill: any) => (
                  <div
                    key={skill.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    {editingSkill === skill.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Level
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveSkill}
                            disabled={isUpdating}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3 mr-1" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSkill(null)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {skill.name}
                            </h3>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(
                                skill.level
                              )}`}
                            >
                              {skill.level}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSkillForm(skill);
                                setEditingSkill(skill.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-blue-600 h-2 rounded-full ${getSkillLevelWidth(
                                skill.level
                              )}`}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {skill.years} years experience
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {editingSkill === "new" && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Skill Name
                        </label>
                        <input
                          type="text"
                          value={skillForm.name || ""}
                          onChange={(e) =>
                            setSkillForm({ ...skillForm, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Level
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveSkill}
                          disabled={isUpdating}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3 mr-1" />
                          )}
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSkill(null)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(!profile.skills || profile.skills.length === 0) &&
                editingSkill !== "new" && (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No skills added yet</p>
                    <button
                      onClick={handleAddSkill}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your first skill
                    </button>
                  </div>
                )}
            </div>

            {/* Resume */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Resume</h2>
                {profile.resume &&
                  (profile.resume.cloudinaryUrl ||
                    profile.resume.fileName ||
                    profile.resume.originalName) && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      ✓ Uploaded
                    </span>
                  )}
              </div>

              {profile.resume &&
              (profile.resume.cloudinaryUrl ||
                profile.resume.fileName ||
                profile.resume.originalName) ? (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {profile.resume.originalName ||
                          profile.resume.fileName ||
                          "Resume"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {profile.resume.uploadDate
                          ? `Uploaded ${formatDate(profile.resume.uploadDate)}`
                          : "Uploaded"}
                        {profile.resume.fileSize
                          ? ` • ${profile.resume.fileSize}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleViewResume}
                      className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {/* <button
                    onClick={handleDownloadResume}
                    className="inline-flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-700 font-medium border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button> */}
                    <label className="cursor-pointer inline-flex items-center px-3 py-2 text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                      <Upload className="h-4 w-4 mr-1" />
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploadingAny}
                      />
                    </label>
                    <button
                      onClick={handleRemoveResume}
                      className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  } ${isUploadingAny ? "pointer-events-none opacity-60" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploadingAny ? (
                    <div className="flex flex-col items-center">
                      <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-blue-600 font-medium">Uploading...</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Please wait while we upload your resume
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload
                        className={`h-12 w-12 mx-auto mb-4 ${
                          isDragOver ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <div className="space-y-2">
                        <h3
                          className={`text-lg font-medium ${
                            isDragOver ? "text-blue-700" : "text-gray-900"
                          }`}
                        >
                          {isDragOver
                            ? "Drop your resume here"
                            : "Upload your resume"}
                        </h3>
                        <p className="text-gray-600">
                          Drag and drop your file here, or click to browse
                        </p>
                      </div>

                      <div className="mt-6">
                        <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          <Upload className="h-5 w-5 mr-2" />
                          Choose File
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploadingAny}
                          />
                        </label>
                      </div>

                      <div className="mt-4 text-xs text-gray-500 space-y-1">
                        <p>Supported formats: PDF, DOC, DOCX</p>
                        <p>Maximum file size: 10MB</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Resume Modal */}
          {showResumeModal && profile.resume && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">
                    {profile.resume.originalName || profile.resume.fileName}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadResume}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={() => setShowResumeModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  {profile.resume?.cloudinaryUrl ? (
                    <div className="w-full h-full">
                      {/* Check if it's a PDF for inline viewing */}
                      {profile.resume.originalName
                        ?.toLowerCase()
                        .endsWith(".pdf") ? (
                        <div className="w-full h-full">
                          {!pdfViewError ? (
                            /* Try Google Docs Viewer first */
                            <iframe
                              src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                                profile.resume.cloudinaryUrl
                              )}&embedded=true`}
                              title="Resume Preview"
                              className="w-full h-full border rounded-lg"
                              onLoad={() => {
                                console.log(
                                  "PDF loaded successfully with Google Viewer"
                                );
                              }}
                              onError={(e) => {
                                console.error(
                                  "Failed to load PDF with Google Viewer:",
                                  e
                                );
                                setPdfViewError(true);
                              }}
                            />
                          ) : (
                            /* Fallback view when iframe fails */
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                              <div className="text-center">
                                <FileText className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                                <h3 className="text-lg font-semibold mb-2">
                                  PDF Preview Unavailable
                                </h3>
                                <p className="text-gray-600 mb-4">
                                  {profile.resume.originalName}
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                  Unable to preview this PDF in the browser. You
                                  can download it to view.
                                </p>
                              </div>
                              <div className="space-y-3">
                                <button
                                  onClick={handleDownloadResume}
                                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Download className="h-5 w-5 mr-2" />
                                  Download PDF
                                </button>
                                <button
                                  onClick={() =>
                                    window.open(
                                      profile.resume.cloudinaryUrl,
                                      "_blank"
                                    )
                                  }
                                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  Open in New Tab
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* For DOC/DOCX files, show message with download option */
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                          <div className="text-center">
                            <FileText className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                            <h3 className="text-lg font-semibold mb-2">
                              Document Preview
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {profile.resume.originalName}
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                              This file type cannot be previewed in the browser.
                              Click download to view the file.
                            </p>
                          </div>
                          <button
                            onClick={handleDownloadResume}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download className="h-5 w-5 mr-2" />
                            Download Resume
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>Resume not available for preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
