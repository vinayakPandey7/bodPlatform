"use client";
import { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Github,
  Linkedin,
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Heart,
} from "lucide-react";
import api from "@/lib/api";

interface CandidateProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isSaved?: boolean;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    zipCode?: string;
    gender?: string;
    headline?: string;
    summary?: string;
    profilePicture?: {
      cloudinaryUrl?: string;
      publicId?: string;
      originalName?: string;
      fileSize?: string;
      uploadDate?: Date;
    };
  };
  experience?: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education?: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
    description: string;
  }>;
  skills?: Array<{
    id: string;
    name: string;
    level: string;
    years: number;
  }>;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  preferences?: {
    jobType?: string;
    salaryRange?: {
      min: number;
      max: number;
    };
    remote?: boolean;
    willingToRelocate?: boolean;
    availableStartDate?: string;
  };
  resume?: {
    fileName?: string;
    originalName?: string;
    uploadDate?: Date;
    fileSize?: string;
    url?: string;
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    storageType?: string;
  };
  createdAt: Date;
}

interface CandidateProfileModalProps {
  candidateId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CandidateProfileModal({
  candidateId,
  isOpen,
  onClose,
}: CandidateProfileModalProps) {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pdfViewError, setPdfViewError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (isOpen && candidateId) {
      setIsAnimating(true);
      fetchCandidateProfile();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, candidateId]);

  // Handle escape key for PDF modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showResumeModal) {
        setShowResumeModal(false);
        setPdfViewError(false);
        setPdfLoading(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showResumeModal]);

  const fetchCandidateProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(
        `/employer/candidates/${candidateId}/profile`
      );
      setCandidate(response.data.candidate);
    } catch (error: any) {
      console.error("Error fetching candidate profile:", error);
      setError(
        error.response?.data?.message || "Failed to fetch candidate profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const downloadResume = () => {
    if (candidate?.resume?.cloudinaryUrl) {
      // Create a download link
      const link = document.createElement("a");
      // Add download parameter to force download
      link.href = candidate.resume.cloudinaryUrl + "?dl=1";
      link.download = candidate.resume.originalName || "resume.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (candidate?.resume?.url) {
      const link = document.createElement("a");
      link.href = candidate.resume.url;
      link.download = candidate.resume.originalName || "resume.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewResume = () => {
    if (candidate?.resume?.cloudinaryUrl || candidate?.resume?.url) {
      setPdfViewError(false);
      setPdfLoading(true);
      setShowResumeModal(true);
    }
  };

  const saveCandidate = async () => {
    if (!candidate) return;

    try {
      setIsSaving(true);
      // Use the correct endpoint for saving candidates
      const response = await api.put(
        `/employer/candidates/${candidate._id}/save`
      );

      // Update the local state
      setCandidate((prev) =>
        prev ? { ...prev, isSaved: response.data.isSaved } : null
      );

      console.log("Candidate save status updated:", response.data);
    } catch (error: any) {
      console.error("Error saving candidate:", error);
      // You might want to show a toast/notification here
    } finally {
      setIsSaving(false);
    }
  };

  const getSkillLevelColor = (level: string) => {
    const colors = {
      beginner: "bg-yellow-100 text-yellow-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-green-100 text-green-800",
      expert: "bg-purple-100 text-purple-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (!isOpen) return null;

  const personalInfo = candidate?.personalInfo;
  const displayName = `${
    personalInfo?.firstName || candidate?.firstName || ""
  } ${personalInfo?.lastName || candidate?.lastName || ""}`.trim();
  const displayEmail = personalInfo?.email || candidate?.email;
  const displayPhone = personalInfo?.phone || candidate?.phoneNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isAnimating ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`
        relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden
        transform transition-all duration-200 flex flex-col ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            Candidate Profile
          </h2>
          <div className="flex items-center space-x-2">
            {candidate && (
              <button
                onClick={saveCandidate}
                disabled={isSaving}
                className={`p-2 rounded-full transition-colors ${
                  candidate.isSaved
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                title={
                  candidate.isSaved ? "Remove from saved" : "Save candidate"
                }
              >
                <Heart
                  className={`h-5 w-5 ${
                    candidate.isSaved ? "fill-current" : ""
                  }`}
                />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 mb-4">
                Failed to load candidate profile
              </p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <button
                onClick={fetchCandidateProfile}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : !candidate ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">No candidate data available</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                      {personalInfo?.profilePicture?.cloudinaryUrl ? (
                        <img
                          src={personalInfo.profilePicture.cloudinaryUrl}
                          alt={displayName}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">
                        {displayName || "Name Not Provided"}
                      </h1>
                      <p className="text-indigo-100 text-lg mb-2">
                        {personalInfo?.headline || "Professional"}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-indigo-100">
                        {displayEmail && (
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {displayEmail}
                          </span>
                        )}
                        {displayPhone && (
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {displayPhone}
                          </span>
                        )}
                        {personalInfo?.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {personalInfo.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {(candidate.resume?.cloudinaryUrl ||
                    candidate.resume?.url ||
                    candidate.resume?.originalName) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={previewResume}
                        className="cursor-pointer bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={downloadResume}
                        className="cursor-pointer bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {personalInfo?.summary && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Professional Summary
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {personalInfo.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {candidate.experience && candidate.experience.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {candidate.experience.map((exp, index) => (
                      <div
                        key={exp.id || index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {exp.title}
                            </h4>
                            <p className="text-indigo-600 font-medium">
                              {exp.company}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {exp.location}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>
                              {formatDate(exp.startDate)} -{" "}
                              {exp.current
                                ? "Present"
                                : formatDate(exp.endDate)}
                            </p>
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {candidate.education && candidate.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {candidate.education.map((edu, index) => (
                      <div
                        key={edu.id || index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {edu.degree}
                            </h4>
                            <p className="text-indigo-600 font-medium">
                              {edu.school}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {edu.location}
                            </p>
                            {edu.gpa && (
                              <p className="text-gray-600 text-sm">
                                GPA: {edu.gpa}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>
                              {formatDate(edu.startDate)} -{" "}
                              {formatDate(edu.endDate)}
                            </p>
                          </div>
                        </div>
                        {edu.description && (
                          <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {candidate.skills.map((skill, index) => (
                      <div
                        key={skill.id || index}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">
                            {skill.name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(
                              skill.level
                            )}`}
                          >
                            {skill.level}
                          </span>
                        </div>
                        {skill.years > 0 && (
                          <p className="text-gray-600 text-sm">
                            {skill.years} year{skill.years !== 1 ? "s" : ""}{" "}
                            experience
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume */}
              {candidate.resume &&
                (candidate.resume.cloudinaryUrl ||
                  candidate.resume.url ||
                  candidate.resume.originalName) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <Download className="h-5 w-5 mr-2" />
                      Resume
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">
                          {candidate.resume.originalName || "Resume.pdf"}
                        </p>
                        <div className="text-sm text-blue-700 space-y-1">
                          {candidate.resume.fileSize && (
                            <p>File Size: {candidate.resume.fileSize}</p>
                          )}
                          {candidate.resume.uploadDate && (
                            <p>
                              Uploaded:{" "}
                              {new Date(
                                candidate.resume.uploadDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={previewResume}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={downloadResume}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Social Links & Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Social Links */}
                {candidate.socialLinks &&
                  Object.values(candidate.socialLinks).some((link) => link) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Social Links
                      </h3>
                      <div className="space-y-2">
                        {candidate.socialLinks.website && (
                          <a
                            href={candidate.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Website</span>
                          </a>
                        )}
                        {candidate.socialLinks.linkedin && (
                          <a
                            href={candidate.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {candidate.socialLinks.github && (
                          <a
                            href={candidate.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {candidate.socialLinks.portfolio && (
                          <a
                            href={candidate.socialLinks.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Portfolio</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                {/* Preferences */}
                {candidate.preferences && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Job Preferences
                    </h3>
                    <div className="space-y-2 text-sm">
                      {candidate.preferences.jobType && (
                        <p>
                          <span className="font-medium">Job Type:</span>{" "}
                          {candidate.preferences.jobType}
                        </p>
                      )}
                      {candidate.preferences.salaryRange && (
                        <p>
                          <span className="font-medium">Salary Range:</span>$
                          {candidate.preferences.salaryRange.min?.toLocaleString()}{" "}
                          - $
                          {candidate.preferences.salaryRange.max?.toLocaleString()}
                        </p>
                      )}
                      {candidate.preferences.remote !== undefined && (
                        <p>
                          <span className="font-medium">Remote Work:</span>{" "}
                          {candidate.preferences.remote ? "Yes" : "No"}
                        </p>
                      )}
                      {candidate.preferences.willingToRelocate !==
                        undefined && (
                        <p>
                          <span className="font-medium">
                            Willing to Relocate:
                          </span>{" "}
                          {candidate.preferences.willingToRelocate
                            ? "Yes"
                            : "No"}
                        </p>
                      )}
                      {candidate.preferences.availableStartDate && (
                        <p>
                          <span className="font-medium">
                            Available Start Date:
                          </span>{" "}
                          {candidate.preferences.availableStartDate}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-500 text-sm">
                  Member since{" "}
                  {new Date(candidate.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-4xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                Resume Preview - {candidate?.personalInfo?.firstName}{" "}
                {candidate?.personalInfo?.lastName}
              </h3>
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setPdfViewError(false);
                  setPdfLoading(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 p-4">
              {pdfLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}

              {pdfViewError && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-red-600 mb-4">
                      Unable to preview PDF in this browser.
                    </p>
                    <button
                      onClick={downloadResume}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download PDF Instead
                    </button>
                  </div>
                </div>
              )}

              {!pdfViewError && (
                <iframe
                  src={
                    candidate?.resume?.cloudinaryUrl
                      ? `https://docs.google.com/viewer?url=${encodeURIComponent(
                          candidate.resume.cloudinaryUrl
                        )}&embedded=true`
                      : candidate?.resume?.url
                      ? `https://docs.google.com/viewer?url=${encodeURIComponent(
                          candidate.resume.url
                        )}&embedded=true`
                      : ""
                  }
                  className="w-full h-full border-0 rounded"
                  title="Resume Preview"
                  onLoad={() => setPdfLoading(false)}
                  onError={() => {
                    setPdfViewError(true);
                    setPdfLoading(false);
                  }}
                  style={{ display: pdfLoading ? "none" : "block" }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
