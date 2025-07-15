"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCurrentUser } from "@/lib/hooks/auth.hooks";
import { useCandidateProfile, useUpdateCandidateProfile } from "@/lib/hooks/candidate.hooks";
import { useUploadResume } from "@/lib/hooks/upload.hooks";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Upload,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Globe,
  Github,
  Linkedin,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Camera,
  CheckCircle,
  AlertCircle,
  Target,
  DollarSign,
  Clock,
  RefreshCw,
  Loader,
} from "lucide-react";

export default function CandidateProfilePage() {
  const router = useRouter();
  const { data: currentUserData } = useCurrentUser();
  const { data: profileData, isLoading, error, refetch } = useCandidateProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateCandidateProfile();
  const { mutate: uploadResume, isPending: isUploading } = useUploadResume();

  // Editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<string | null>(null);
  const [editingEducation, setEditingEducation] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);

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
    resume: null
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  // Handle form submissions
  const handleUpdatePersonalInfo = () => {
    updateProfile({
      personalInfo: personalInfoForm
    }, {
      onSuccess: () => {
        setEditingSection(null);
        refetch();
      },
      onError: (error) => {
        console.error("Failed to update personal info:", error);
      }
    });
  };

  const handleUpdateSocialLinks = () => {
    updateProfile({
      socialLinks: socialLinksForm
    }, {
      onSuccess: () => {
        setEditingSection(null);
        refetch();
      },
      onError: (error) => {
        console.error("Failed to update social links:", error);
      }
    });
  };

  const handleUpdatePreferences = () => {
    updateProfile({
      preferences: preferencesForm
    }, {
      onSuccess: () => {
        setEditingSection(null);
        refetch();
      },
      onError: (error) => {
        console.error("Failed to update preferences:", error);
      }
    });
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
      description: ""
    };
    setExperienceForm(newExperience);
    setEditingExperience("new");
  };

  const handleSaveExperience = () => {
    const updatedExperience = editingExperience === "new" 
      ? [...(profile.experience || []), experienceForm]
      : (profile.experience || []).map(exp => 
          exp.id === editingExperience ? experienceForm : exp
        );

    updateProfile({
      experience: updatedExperience
    }, {
      onSuccess: () => {
        setEditingExperience(null);
        setExperienceForm({});
        refetch();
      },
      onError: (error) => {
        console.error("Failed to update experience:", error);
      }
    });
  };

  const handleDeleteExperience = (expId: string) => {
    const updatedExperience = (profile.experience || []).filter(exp => exp.id !== expId);
    updateProfile({
      experience: updatedExperience
    }, {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error("Failed to delete experience:", error);
      }
    });
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
      description: ""
    };
    setEducationForm(newEducation);
    setEditingEducation("new");
  };

  const handleSaveEducation = () => {
    const updatedEducation = editingEducation === "new" 
      ? [...(profile.education || []), educationForm]
      : (profile.education || []).map(edu => 
          edu.id === editingEducation ? educationForm : edu
        );

    updateProfile({
      education: updatedEducation
    }, {
      onSuccess: () => {
        setEditingEducation(null);
        setEducationForm({});
        refetch();
      },
      onError: (error) => {
        console.error("Failed to update education:", error);
      }
    });
  };

  const handleDeleteEducation = (eduId: string) => {
    const updatedEducation = (profile.education || []).filter(edu => edu.id !== eduId);
    updateProfile({
      education: updatedEducation
    }, {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error("Failed to delete education:", error);
      }
    });
  };

  const handleAddSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: "",
      level: "beginner",
      years: 0
    };
    setSkillForm(newSkill);
    setEditingSkill("new");
  };

  const handleSaveSkill = () => {
    const updatedSkills = editingSkill === "new" 
      ? [...(profile.skills || []), skillForm]
      : (profile.skills || []).map(skill => 
          skill.id === editingSkill ? skillForm : skill
        );

    updateProfile({
      skills: updatedSkills
    }, {
      onSuccess: () => {
        setEditingSkill(null);
        setSkillForm({});
        refetch();
      },
      onError: (error) => {
        console.error("Failed to update skills:", error);
      }
    });
  };

  const handleDeleteSkill = (skillId: string) => {
    const updatedSkills = (profile.skills || []).filter(skill => skill.id !== skillId);
    updateProfile({
      skills: updatedSkills
    }, {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error("Failed to delete skill:", error);
      }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadResume(file, {
        onSuccess: (data) => {
          updateProfile({
            resume: {
              fileName: file.name,
              uploadDate: new Date().toISOString(),
              fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
              url: data.url
            }
          }, {
            onSuccess: () => {
              refetch();
            }
          });
        },
        onError: (error) => {
          console.error("Failed to upload resume:", error);
        }
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load profile</h3>
            <p className="text-gray-600 mb-4">There was an error loading your profile.</p>
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
              <p className="mt-1 text-gray-600">Manage your professional information</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <button
                onClick={() => editingSection === "personal" ? setEditingSection(null) : setEditingSection("personal")}
                className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {editingSection === "personal" ? <X className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
                {editingSection === "personal" ? "Cancel" : "Edit"}
              </button>
            </div>

            {editingSection === "personal" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={personalInfoForm.firstName || ""}
                    onChange={(e) => setPersonalInfoForm({...personalInfoForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={personalInfoForm.lastName || ""}
                    onChange={(e) => setPersonalInfoForm({...personalInfoForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={personalInfoForm.email || ""}
                    onChange={(e) => setPersonalInfoForm({...personalInfoForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={personalInfoForm.phone || ""}
                    onChange={(e) => setPersonalInfoForm({...personalInfoForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={personalInfoForm.location || ""}
                    onChange={(e) => setPersonalInfoForm({...personalInfoForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={personalInfoForm.zipCode || ""}
                    onChange={(e) => setPersonalInfoForm({...personalInfoForm, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Headline</label>
                  <input
                    type="text"
                    value={personalInfoForm.headline || ""}
                    onChange={(e) => setPersonalInfoForm({...personalInfoForm, headline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Senior Software Engineer with 5+ years experience"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                  <textarea
                    rows={4}
                    value={personalInfoForm.summary || ""}
                    onChange={(e) => setPersonalInfoForm({...personalInfoForm, summary: e.target.value})}
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
                    {isUpdating ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
                    <p className="font-medium">{profile.personalInfo?.firstName} {profile.personalInfo?.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{profile.personalInfo?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{profile.personalInfo?.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{profile.personalInfo?.location} {profile.personalInfo?.zipCode}</p>
                  </div>
                </div>
                {profile.personalInfo?.headline && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Professional Headline</p>
                    <p className="font-medium">{profile.personalInfo.headline}</p>
                  </div>
                )}
                {profile.personalInfo?.summary && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Professional Summary</p>
                    <p className="text-gray-700 mt-1">{profile.personalInfo.summary}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
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
                <div key={exp.id} className="border-l-2 border-gray-200 pl-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                  
                  {editingExperience === exp.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <input
                            type="text"
                            value={experienceForm.title || ""}
                            onChange={(e) => setExperienceForm({...experienceForm, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            value={experienceForm.company || ""}
                            onChange={(e) => setExperienceForm({...experienceForm, company: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="month"
                            value={experienceForm.startDate || ""}
                            onChange={(e) => setExperienceForm({...experienceForm, startDate: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <div className="space-y-2">
                            <input
                              type="month"
                              value={experienceForm.current ? "" : experienceForm.endDate || ""}
                              onChange={(e) => setExperienceForm({...experienceForm, endDate: e.target.value})}
                              disabled={experienceForm.current}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            />
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={experienceForm.current || false}
                                onChange={(e) => setExperienceForm({...experienceForm, current: e.target.checked, endDate: ""})}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-600">I currently work here</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={experienceForm.description || ""}
                          onChange={(e) => setExperienceForm({...experienceForm, description: e.target.value})}
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
                          {isUpdating ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
                          <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                          <p className="text-blue-600 font-medium">{exp.company}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                          </p>
                          {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
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
                        <p className="text-gray-700 mt-2">{exp.description}</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={experienceForm.title || ""}
                          onChange={(e) => setExperienceForm({...experienceForm, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={experienceForm.company || ""}
                          onChange={(e) => setExperienceForm({...experienceForm, company: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="month"
                          value={experienceForm.startDate || ""}
                          onChange={(e) => setExperienceForm({...experienceForm, startDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <div className="space-y-2">
                          <input
                            type="month"
                            value={experienceForm.current ? "" : experienceForm.endDate || ""}
                            onChange={(e) => setExperienceForm({...experienceForm, endDate: e.target.value})}
                            disabled={experienceForm.current}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={experienceForm.current || false}
                              onChange={(e) => setExperienceForm({...experienceForm, current: e.target.checked, endDate: ""})}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-600">I currently work here</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={experienceForm.description || ""}
                        onChange={(e) => setExperienceForm({...experienceForm, description: e.target.value})}
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
                        {isUpdating ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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

              {(!profile.experience || profile.experience.length === 0) && editingExperience !== "new" && (
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
                <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                  {editingSkill === skill.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                        <input
                          type="text"
                          value={skillForm.name || ""}
                          onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <select
                          value={skillForm.level || "beginner"}
                          onChange={(e) => setSkillForm({...skillForm, level: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <input
                          type="number"
                          min="0"
                          value={skillForm.years || 0}
                          onChange={(e) => setSkillForm({...skillForm, years: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveSkill}
                          disabled={isUpdating}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? <Loader className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
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
                          <h3 className="font-medium text-gray-900">{skill.name}</h3>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
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
                          <div className={`bg-blue-600 h-2 rounded-full ${getSkillLevelWidth(skill.level)}`}></div>
                        </div>
                        <p className="text-xs text-gray-600">{skill.years} years experience</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {editingSkill === "new" && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                      <input
                        type="text"
                        value={skillForm.name || ""}
                        onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                      <select
                        value={skillForm.level || "beginner"}
                        onChange={(e) => setSkillForm({...skillForm, level: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        value={skillForm.years || 0}
                        onChange={(e) => setSkillForm({...skillForm, years: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveSkill}
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? <Loader className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
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

            {(!profile.skills || profile.skills.length === 0) && editingSkill !== "new" && (
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
            </div>

            {profile.resume ? (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">{profile.resume.fileName}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded {formatDate(profile.resume.uploadDate)} • {profile.resume.fileSize}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View
                  </button>
                  <label className="cursor-pointer px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Upload your resume to increase your visibility</p>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  {isUploading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PDF, DOC, or DOCX files only</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 