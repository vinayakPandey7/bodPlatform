"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAdminCandidates, useUpdateUserStatus } from "@/lib/queries";
import {
  GenericTable,
  TableColumn,
  TableAction,
  FilterButton,
  StatCard,
} from "@/components/GenericTable";
import {
  candidateStatusBadgeConfig,
  createNameColumn,
  createEmailColumn,
  createActionsColumn,
  createEditAction,
  createViewAction,
  createDeleteAction,
} from "@/components/table/tableUtils";

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
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${candidateStatusBadgeConfig.colorMap[candidate.status]} shadow-lg transform hover:scale-105 transition-all duration-300`}
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
                      d={candidateStatusBadgeConfig.iconMap?.[candidate.status] || "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"}
                    />
                  </svg>
                  {candidateStatusBadgeConfig.formatValue?.(candidate.status) || candidate.status}
                </span>
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
                Languages
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {candidate.languages?.length ? candidate.languages.join(", ") : "Not specified"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Applied For
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {candidate.job?.title && candidate.job?.employer?.companyName 
                  ? `${candidate.job.title} at ${candidate.job.employer.companyName}`
                  : "Not specified"
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recruitment Partner
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {candidate.recruitmentPartner?.name || "Not specified"}
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
                  className="mt-1 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
                  Download Resume
                </a>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <div className="space-y-1 text-sm">
                <div className="flex items-center">
                    <svg
                      className={`w-4 h-4 mr-2 ${
                        candidate.hasPreviousExperienceWithStateFarm
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {candidate.hasPreviousExperienceWithStateFarm ? (
                      <path
                        fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                      ) : (
                      <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    State Farm Experience
                  </div>
                  <div className="flex items-center">
                    <svg
                      className={`w-4 h-4 mr-2 ${
                        candidate.hasPreviousInsuranceExperience
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {candidate.hasPreviousInsuranceExperience ? (
                      <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                      <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    Insurance Experience
                  </div>
                </div>
              </div>

                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Licensing
                </label>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <svg
                      className={`w-4 h-4 mr-2 ${
                        candidate.isLicensedWithStateFarmTraining
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {candidate.isLicensedWithStateFarmTraining ? (
                      <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                    <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      )}
                  </svg>
                    State Farm Training
                </div>
                  <div className="flex items-center">
                    <svg
                      className={`w-4 h-4 mr-2 ${
                        candidate.isLicensedWithBankingExperience
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {candidate.isLicensedWithBankingExperience ? (
                      <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                    <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      )}
                  </svg>
                    Banking Experience
              </div>
                  <div className="flex items-center">
                    <svg
                      className={`w-4 h-4 mr-2 ${
                        candidate.isLicensedWithoutInsuranceExperience
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {candidate.isLicensedWithoutInsuranceExperience ? (
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      )}
                      </svg>
                    Licensed w/o Insurance
                    </div>
                  </div>
                                </div>
            </div>

            {(candidate.licenseType || candidate.otherLicense) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidate.licenseType && (
                                <div>
                    <label className="block text-sm font-medium text-gray-700">
                      License Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {candidate.licenseType}
                                  </p>
                                </div>
                )}
                {candidate.otherLicense && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Other License
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {candidate.otherLicense}
                    </p>
                              </div>
                )}
                            </div>
            )}

                        {candidate.interviewDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Interview Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {candidate.interviewDate 
                    ? new Date(candidate.interviewDate).toLocaleDateString()
                    : "No date set"
                  }
                </p>
              </div>
            )}

                        {candidate.notes?.length ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Notes
                </label>
                <div className="space-y-3">
                  {candidate.notes.map((note, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                    >
                                            <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-blue-600 uppercase">
                          {note.round || "General"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "No date"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{note.text || "No content"}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Date
                </label>
                                <p className="mt-1 text-sm text-gray-900">
                  {candidate.createdAt 
                    ? new Date(candidate.createdAt).toLocaleDateString()
                    : "No date available"
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {candidate.updatedAt 
                    ? new Date(candidate.updatedAt).toLocaleDateString()
                    : "No date available"
                  }
                </p>
                                  </div>
                                </div>
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
  const [activeFilter, setActiveFilter] = useState("all");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);

  const {
    data: candidatesData,
    isLoading,
    error,
    refetch,
  } = useAdminCandidates();

  const { mutate: updateStatus } = useUpdateUserStatus();

  const candidates = candidatesData?.candidates || [];

  // Filter candidates based on active filter
  const filteredCandidates = activeFilter === "all" 
    ? candidates 
    : candidates.filter((candidate: Candidate) => candidate.status === activeFilter);

  const handleStatusChange = (candidate: Candidate, newStatus: string) => {
    updateStatus(
      { userId: candidate._id, status: newStatus },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          console.error("Error updating status:", error);
        },
      }
    );
  };

  const handleViewProfile = (candidate: Candidate) => {
    setViewingCandidate(candidate);
    setIsProfileModalOpen(true);
  };

  const handleDownloadResume = (candidate: Candidate) => {
    if (candidate.resume) {
      const link = document.createElement("a");
      link.href = candidate.resume;
      link.download = `${candidate.name}_resume.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Table columns configuration
  const columns: TableColumn<Candidate>[] = [
    createNameColumn("name", "Candidate Name"),
    createEmailColumn("email", "Email"),
    {
      key: "phone",
      label: "Phone",
      type: "text",
      responsive: "md",
      searchable: true,
    },
    {
      key: "jobTitle",
      label: "Job",
      type: "text",
      responsive: "lg",
      searchable: true,
      render: (value: any, row: Candidate) => row.job?.title || "N/A",
    },
    {
      key: "jobCompany",
      label: "Company",
      type: "text",
      responsive: "lg",
      searchable: true,
      render: (value: any, row: Candidate) => row.job?.employer?.companyName || "N/A",
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
      responsive: "always",
      badgeConfig: candidateStatusBadgeConfig,
    },
    createActionsColumn(),
  ];

  // Table actions configuration
  const actions: TableAction<Candidate>[] = [
    createViewAction(handleViewProfile),
    {
      label: "Download Resume",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
      ),
      onClick: handleDownloadResume,
      variant: "default",
      show: (candidate: Candidate) => !!candidate.resume,
    },
    {
      label: "Update Status",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      onClick: (candidate: Candidate) => {
        // Create a simple status cycling logic
        const statusFlow = [
          "shortlist", "assessment", "phone_interview", 
          "in_person_interview", "background_check", "selected"
        ];
        const currentIndex = statusFlow.indexOf(candidate.status);
        const nextStatus = currentIndex >= 0 && currentIndex < statusFlow.length - 1 
          ? statusFlow[currentIndex + 1] 
          : "rejected";
        handleStatusChange(candidate, nextStatus);
      },
      variant: "warning",
    },
  ];

  // Statistics
  const totalCandidates = candidates.length;
  const shortlistCount = candidates.filter((c: Candidate) => c.status === "shortlist").length;
  const selectedCount = candidates.filter((c: Candidate) => c.status === "selected").length;
  const rejectedCount = candidates.filter((c: Candidate) => c.status === "rejected").length;

  // Get status count
  const getStatusCount = (status: string) => {
    return candidates.filter((c: Candidate) => c.status === status).length;
  };

  // Statistics cards
  const statCards: StatCard[] = [
    {
      title: "Total Candidates",
      value: totalCandidates,
      subtitle: "All applications",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
      ),
      variant: "primary",
    },
    {
      title: "Shortlisted",
      value: shortlistCount,
      subtitle: "In review",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      variant: "secondary",
    },
    {
      title: "Selected",
      value: selectedCount,
      subtitle: "Hired",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      variant: "success",
    },
    {
      title: "Rejected",
      value: rejectedCount,
      subtitle: "Not selected",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      variant: "danger",
    },
  ];

  // Filter buttons
  const filterButtons: FilterButton[] = [
    { key: "all", label: "All Candidates", count: totalCandidates, onClick: () => setActiveFilter("all"), variant: "primary" },
    { key: "shortlist", label: "Shortlisted", count: getStatusCount("shortlist"), onClick: () => setActiveFilter("shortlist"), variant: "secondary" },
    { key: "assessment", label: "Assessment", count: getStatusCount("assessment"), onClick: () => setActiveFilter("assessment"), variant: "warning" },
    { key: "phone_interview", label: "Phone Interview", count: getStatusCount("phone_interview"), onClick: () => setActiveFilter("phone_interview"), variant: "secondary" },
    { key: "in_person_interview", label: "In-Person", count: getStatusCount("in_person_interview"), onClick: () => setActiveFilter("in_person_interview"), variant: "warning" },
    { key: "background_check", label: "Background Check", count: getStatusCount("background_check"), onClick: () => setActiveFilter("background_check"), variant: "secondary" },
    { key: "selected", label: "Selected", count: getStatusCount("selected"), onClick: () => setActiveFilter("selected"), variant: "success" },
    { key: "rejected", label: "Rejected", count: getStatusCount("rejected"), onClick: () => setActiveFilter("rejected"), variant: "danger" },
    { key: "stand_by", label: "Stand By", count: getStatusCount("stand_by"), onClick: () => setActiveFilter("stand_by"), variant: "warning" },
    { key: "no_response", label: "No Response", count: getStatusCount("no_response"), onClick: () => setActiveFilter("no_response"), variant: "secondary" },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <GenericTable
          data={filteredCandidates}
          columns={columns}
          actions={actions}
          loading={isLoading}
          error={error ? "Failed to load candidates" : null}
          title="Candidate Management"
          searchPlaceholder="Search candidates by name, email, phone, job, or company..."
          filterButtons={filterButtons}
          activeFilter={activeFilter}
          statCards={statCards}
          tableHeight="auto"
          enableTableScroll={false}
          pagination={{
            enabled: true,
            pageSize: 15,
            pageSizeOptions: [10, 15, 25, 50, 100],
            showPageInfo: true,
            showPageSizeSelector: true,
          }}
        />

        <ProfileModal
          candidate={viewingCandidate}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
