"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAdminCandidates, useUpdateUserStatus } from "@/lib/queries";

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  languages: string[];
  resume: string;
  status:
    | "shortlist"
    | "assessment"
    | "phone_interview"
    | "in_person_interview"
    | "background_check"
    | "selected"
    | "rejected"
    | "stand_by"
    | "no_response";
  hasPreviousExperienceWithStateFarm: boolean;
  hasPreviousInsuranceExperience: boolean;
  isLicensedWithStateFarmTraining: boolean;
  isLicensedWithBankingExperience: boolean;
  isLicensedWithoutInsuranceExperience: boolean;
  licenseType?: string;
  otherLicense?: string;
  isSaved: boolean;
  interviewDate?: string;
  job: {
    _id: string;
    title: string;
    employer: {
      companyName: string;
    };
  };
  recruitmentPartner: {
    _id: string;
    name: string;
  };
  notes: Array<{
    round: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ProfileModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ candidate, isOpen, onClose }: ProfileModalProps) => {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-4xl font-medium text-gray-900">
              Candidate Profile
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <p className="mt-1 text-sm text-gray-900">{candidate.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">{candidate.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="mt-1 text-sm text-gray-900">{candidate.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {candidate.gender}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(candidate.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Status
                </label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {candidate.status.replace("_", " ")}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <p className="mt-1 text-sm text-gray-900">{candidate.address}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Application
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {candidate.job?.title} at {candidate.job?.employer?.companyName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recruitment Partner
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {candidate.recruitmentPartner?.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Languages
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {candidate.languages?.join(", ")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience
              </label>
              <div className="mt-1 text-sm text-gray-900">
                <p>
                  State Farm:{" "}
                  {candidate.hasPreviousExperienceWithStateFarm ? "Yes" : "No"}
                </p>
                <p>
                  Insurance:{" "}
                  {candidate.hasPreviousInsuranceExperience ? "Yes" : "No"}
                </p>
                <p>
                  Banking:{" "}
                  {candidate.isLicensedWithBankingExperience ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Application Date
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(candidate.createdAt).toLocaleDateString()}
              </p>
            </div>

            {candidate.resume && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Resume
                </label>
                <a
                  href={candidate.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-blue-600 hover:text-blue-500"
                >
                  View Resume
                </a>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminCandidatesPage() {
  const [filter, setFilter] = useState<
    "all" | "approved" | "pending" | "active"
  >("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Use TanStack Query hooks
  const {
    data: candidatesData,
    isLoading: loading,
    error,
    refetch,
  } = useAdminCandidates();

  const updateStatusMutation = useUpdateUserStatus();

  const candidates = candidatesData?.candidates || [];

  const filteredCandidates = candidates.filter((candidate: Candidate) => {
    switch (filter) {
      case "approved":
        return candidate.status === "selected";
      case "pending":
        return [
          "shortlist",
          "assessment",
          "phone_interview",
          "in_person_interview",
          "background_check",
        ].includes(candidate.status);
      case "active":
        return (
          candidate.status === "selected" ||
          candidate.status === "background_check"
        );
      default:
        return true;
    }
  });

  const getStatusBadge = (candidate: Candidate) => {
    const statusConfig = {
      shortlist: {
        bg: "from-blue-500 to-indigo-500",
        text: "white",
        border: "blue-300",
        label: "Shortlisted",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      assessment: {
        bg: "from-purple-500 to-pink-500",
        text: "white",
        border: "purple-300",
        label: "Assessment",
        icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
      },
      phone_interview: {
        bg: "from-cyan-500 to-blue-500",
        text: "white",
        border: "cyan-300",
        label: "Phone Interview",
        icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      },
      in_person_interview: {
        bg: "from-orange-500 to-amber-500",
        text: "white",
        border: "orange-300",
        label: "In-Person Interview",
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      },
      background_check: {
        bg: "from-indigo-500 to-purple-500",
        text: "white",
        border: "indigo-300",
        label: "Background Check",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      },
      selected: {
        bg: "from-emerald-500 to-green-500",
        text: "white",
        border: "emerald-300",
        label: "Selected",
        icon: "M5 13l4 4L19 7",
      },
      rejected: {
        bg: "from-red-500 to-rose-500",
        text: "white",
        border: "red-300",
        label: "Rejected",
        icon: "M6 18L18 6M6 6l12 12",
      },
      stand_by: {
        bg: "from-amber-500 to-yellow-500",
        text: "white",
        border: "amber-300",
        label: "Stand By",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      no_response: {
        bg: "from-gray-500 to-slate-500",
        text: "white",
        border: "gray-300",
        label: "No Response",
        icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728",
      },
    };

    const config = statusConfig[candidate.status] || statusConfig.shortlist;

    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${config.bg} text-${config.text} shadow-lg border border-${config.border} transform hover:scale-105 transition-all duration-300`}
      >
        <svg
          className="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d={config.icon}
          />
        </svg>
        {config.label}
      </span>
    );
  };

  const handleSelectCandidate = async (candidateId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        userId: candidateId,
        status: "selected",
      });
    } catch (err: any) {
      console.error("Error selecting candidate:", err);
    }
  };

  const handleRejectCandidate = async (candidateId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        userId: candidateId,
        status: "rejected",
      });
    } catch (err: any) {
      console.error("Error rejecting candidate:", err);
    }
  };

  const handleUpdateStatus = async (candidateId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        userId: candidateId,
        status: newStatus,
      });
    } catch (err: any) {
      console.error("Error updating candidate status:", err);
    }
  };

  const handleViewProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsProfileModalOpen(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsEditModalOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        const dropdownElement = document.querySelector(
          `[data-dropdown-id="${activeDropdown}"]`
        );

        if (dropdownElement && !dropdownElement.contains(target)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 text-black">
          {/* Header Section */}
          <div className="bg-white shadow-sm border-b border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Candidate Management
                </h1>
                <p className="mt-2 text-gray-600 text-lg">
                  Review and manage candidate applications
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    filter === "all"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400"
                  }`}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    filter === "pending"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : "bg-white text-amber-600 border-2 border-amber-200 hover:border-amber-400"
                  }`}
                >
                  Pending (
                  {
                    candidates.filter((c: Candidate) =>
                      [
                        "shortlist",
                        "assessment",
                        "phone_interview",
                        "in_person_interview",
                        "background_check",
                      ].includes(c.status)
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setFilter("approved")}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    filter === "approved"
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                      : "bg-white text-emerald-600 border-2 border-emerald-200 hover:border-emerald-400"
                  }`}
                >
                  Selected (
                  {
                    candidates.filter((c: Candidate) => c.status === "selected")
                      .length
                  }
                  )
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    filter === "active"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                      : "bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-400"
                  }`}
                >
                  Active (
                  {
                    candidates.filter(
                      (c: Candidate) =>
                        c.status === "selected" ||
                        c.status === "background_check"
                    ).length
                  }
                  )
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 space-y-6">
            {error && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-amber-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-amber-800 font-semibold text-lg">
                      API connection failed. Showing available data.
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      Error: {error?.message || String(error)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Cards - Celestial Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Total Candidates
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {candidates.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      All applications
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Pending Review
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      {
                        candidates.filter((c: Candidate) =>
                          [
                            "shortlist",
                            "assessment",
                            "phone_interview",
                            "in_person_interview",
                            "background_check",
                          ].includes(c.status)
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Awaiting decision
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Selected
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                      {
                        candidates.filter(
                          (c: Candidate) => c.status === "selected"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Hired candidates
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
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
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Active
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
                      {
                        candidates.filter(
                          (c: Candidate) =>
                            c.status === "selected" ||
                            c.status === "background_check"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Currently active
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidates Table - Celestial Style */}
            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <svg
                    className="w-7 h-7 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Candidate Applications
                </h2>
                <p className="text-purple-100 mt-2">
                  Manage and review all candidate submissions
                </p>
              </div>

              <div className="p-6 space-y-4">
                {filteredCandidates.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <svg
                        className="w-16 h-16 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No candidates found
                    </h3>
                    <p className="text-gray-500 text-lg">
                      No candidates match the selected filter criteria.
                    </p>
                  </div>
                ) : (
                  filteredCandidates.map(
                    (candidate: Candidate, index: number) => (
                      <div
                        key={candidate._id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Header Section */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                                  <span className="text-lg font-bold text-white">
                                    {candidate.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {candidate.name}
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    {candidate.email} • {candidate.phone}
                                  </p>
                                </div>
                              </div>
                              {getStatusBadge(candidate)}
                            </div>

                            {/* Compact Information Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                              {/* Personal Info */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  Personal
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="font-medium">DOB:</span>{" "}
                                    {new Date(
                                      candidate.dateOfBirth
                                    ).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Gender:</span>{" "}
                                    {candidate.gender?.charAt(0).toUpperCase() +
                                      candidate.gender?.slice(1)}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Address:
                                    </span>{" "}
                                    {candidate.address}
                                  </div>
                                </div>
                              </div>

                              {/* Job Info */}
                              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                                <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2"
                                    />
                                  </svg>
                                  Application
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="font-medium">
                                      Position:
                                    </span>{" "}
                                    {candidate.job?.title}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Company:
                                    </span>{" "}
                                    {candidate.job?.employer?.companyName}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Partner:
                                    </span>{" "}
                                    {candidate.recruitmentPartner?.name}
                                  </div>
                                </div>
                              </div>

                              {/* Experience */}
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                                <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                  </svg>
                                  Experience
                                </h4>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div className="flex items-center">
                                    <div
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        candidate.hasPreviousExperienceWithStateFarm
                                          ? "bg-green-500"
                                          : "bg-gray-300"
                                      }`}
                                    ></div>
                                    <span>State Farm</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        candidate.hasPreviousInsuranceExperience
                                          ? "bg-green-500"
                                          : "bg-gray-300"
                                      }`}
                                    ></div>
                                    <span>Insurance</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        candidate.isLicensedWithStateFarmTraining
                                          ? "bg-green-500"
                                          : "bg-gray-300"
                                      }`}
                                    ></div>
                                    <span>SF Training</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        candidate.isLicensedWithBankingExperience
                                          ? "bg-green-500"
                                          : "bg-gray-300"
                                      }`}
                                    ></div>
                                    <span>Banking</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Languages & Resume Row */}
                            <div className="flex flex-wrap justify-between items-center">
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-medium text-gray-700">
                                  Languages:
                                </span>
                                {candidate.languages?.map((language, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                                  >
                                    {language}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center space-x-3 mt-2 lg:mt-0">
                                <span className="text-xs text-gray-500">
                                  Applied:{" "}
                                  {new Date(
                                    candidate.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                {candidate.resume && (
                                  <a
                                    href={candidate.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                  >
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    Resume
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Compact Action Buttons */}
                          <div className="ml-6 flex flex-col space-y-2">
                            <div
                              className="relative"
                              data-dropdown-id={candidate._id}
                            >
                              <button
                                onClick={() =>
                                  setActiveDropdown(
                                    activeDropdown === candidate._id
                                      ? null
                                      : candidate._id
                                  )
                                }
                                className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-50 transition-colors"
                                title="Actions"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {activeDropdown === candidate._id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        handleViewProfile(candidate);
                                        setActiveDropdown(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-3 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      View Profile
                                    </button>

                                    <button
                                      onClick={() => {
                                        handleEditCandidate(candidate);
                                        setActiveDropdown(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-3 text-blue-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Edit Profile
                                    </button>

                                    {candidate.status !== "selected" &&
                                      candidate.status !== "rejected" && (
                                        <>
                                          <button
                                            onClick={() => {
                                              handleSelectCandidate(
                                                candidate._id
                                              );
                                              setActiveDropdown(null);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                          >
                                            <svg
                                              className="w-4 h-4 mr-3 text-green-500"
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
                                            Select
                                          </button>

                                          <button
                                            onClick={() => {
                                              handleRejectCandidate(
                                                candidate._id
                                              );
                                              setActiveDropdown(null);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                          >
                                            <svg
                                              className="w-4 h-4 mr-3 text-red-500"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                              />
                                            </svg>
                                            Reject
                                          </button>
                                        </>
                                      )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {(candidate.status === "selected" ||
                              candidate.status === "rejected") && (
                              <select
                                value={candidate.status}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    candidate._id,
                                    e.target.value
                                  )
                                }
                                className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 bg-white shadow-md text-xs font-semibold text-gray-700 hover:border-purple-400 transition-all duration-300"
                              >
                                <option value="shortlist">Shortlist</option>
                                <option value="assessment">Assessment</option>
                                <option value="phone_interview">
                                  Phone Interview
                                </option>
                                <option value="in_person_interview">
                                  In-Person Interview
                                </option>
                                <option value="background_check">
                                  Background Check
                                </option>
                                <option value="selected">Selected</option>
                                <option value="rejected">Rejected</option>
                                <option value="stand_by">Stand By</option>
                                <option value="no_response">No Response</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <ProfileModal
          candidate={selectedCandidate}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
