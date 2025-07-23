"use client";
import { useSaveJob, useUnsaveJob } from "@/lib/hooks/candidate.hooks";
import { useApplyToJob, useJob } from "@/lib/hooks/job.hooks";
import {
  Briefcase,
  Building,
  Heart,
  MapPin,
  Send,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface JobDetailsModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobDetailsModal({
  jobId,
  isOpen,
  onClose,
}: JobDetailsModalProps) {
  const { data: jobResponse, isLoading, error } = useJob(jobId, isOpen);
  const { mutate: saveJob, isPending: isSaving } = useSaveJob();
  const { mutate: unsaveJob, isPending: isUnsaving } = useUnsaveJob();
  const { mutate: applyToJob, isPending: isApplying } = useApplyToJob();

  const [isAnimating, setIsAnimating] = useState(false);

  // Extract job data from response (backend returns { job: ... })
  const jobData = (jobResponse as any)?.job || jobResponse;

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSaveJob = () => {
    saveJob(jobId, {
      onSuccess: () => {
        toast.success("Job saved successfully");
      },
      onError: (error) => {
        console.error("Failed to save job:", error);
      },
    });
  };

  const handleApplyToJob = () => {
    applyToJob(
      { jobId, data: {} },
      {
        onSuccess: () => {
          toast.success("Application submitted successfully!");
        },
        onError: (error) => {
          console.error("Failed to apply to job:", error);
        },
      }
    );
  };

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return "Salary not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    if (min) return `$${min.toLocaleString()}+ ${currency}`;
    if (max) return `Up to $${max.toLocaleString()} ${currency}`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "very_urgent":
        return "bg-red-100 text-red-800";
      case "urgent":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  if (!isOpen) return null;

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
        relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden
        transform transition-all duration-200 flex flex-col ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 mb-4">Failed to load job details</p>
              <p className="text-gray-600 text-sm mb-4">
                {error.message ||
                  "There was an error loading the job information."}
              </p>
              <button
                onClick={handleClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          ) : !jobData ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">No job data available</p>
              <button
                onClick={handleClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Job Header */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {jobData.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-600 mb-3">
                      <span className="flex items-center space-x-1">
                        <Building className="h-5 w-5" />
                        <span className="font-medium">
                          {jobData.employer?.companyName || "Company Name"}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-5 w-5" />
                        <span>
                          {jobData.location ||
                            `${jobData.city}, ${jobData.state}`}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {jobData.status === "active"
                          ? "HIRING"
                          : jobData.status?.toUpperCase()}
                      </span>
                      {jobData.jobType && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {jobData.jobType.toUpperCase()}
                        </span>
                      )}
                      {jobData.workMode && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {jobData.workMode.toUpperCase()}
                        </span>
                      )}
                      {jobData.urgency && jobData.urgency !== "normal" && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(
                            jobData.urgency
                          )}`}
                        >
                          {jobData.urgency.replace("_", " ").toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {jobData.salaryType && jobData.salaryRange ? (
                        <div>
                          <div>
                            {jobData.salaryType}: {jobData.salaryRange}
                          </div>
                          <div className="text-sm text-gray-500">
                            (
                            {formatSalary(
                              jobData.salaryMin,
                              jobData.salaryMax,
                              jobData.currency
                            )}
                            )
                          </div>
                        </div>
                      ) : (
                        formatSalary(
                          jobData.salaryMin,
                          jobData.salaryMax,
                          jobData.currency
                        )
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Posted {new Date(jobData.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Job Type</h3>
                  </div>
                  <p className="text-gray-700 capitalize">
                    {jobData.jobType || "Not specified"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                      Experience Level
                    </h3>
                  </div>
                  <p className="text-gray-700 capitalize">
                    {jobData.experienceLevel ||
                      jobData.experience ||
                      "Not specified"}
                  </p>
                  {jobData.specificExperience && (
                    <p className="text-gray-600 text-sm mt-1">
                      Details: {jobData.specificExperience}
                    </p>
                  )}
                </div>

                {jobData.department && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        Department
                      </h3>
                    </div>
                    <p className="text-gray-700">{jobData.department}</p>
                  </div>
                )}

                {jobData.workMode && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Work Mode</h3>
                    </div>
                    <p className="text-gray-700 capitalize">
                      {jobData.workMode}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Job Description
                </h3>
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap">
                    {jobData.description ||
                      "No description available for this position."}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {jobData.requirements && jobData.requirements.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Requirements
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {jobData.requirements.map(
                      (requirement: string, index: number) => (
                        <li key={index}>{requirement}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {(jobData.skills?.length > 0 ||
                jobData.requiredSkills ||
                jobData.preferredSkills) && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Skills Requirements
                  </h3>

                  {/* Required Skills */}
                  {(jobData.requiredSkills || jobData.skills?.length > 0) && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Required Skills:
                      </h4>
                      {jobData.requiredSkills ? (
                        <p className="text-gray-700 mb-2">
                          {jobData.requiredSkills}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {jobData.skills?.map(
                            (skill: string, index: number) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preferred Skills */}
                  {jobData.preferredSkills && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Preferred Skills:
                      </h4>
                      <p className="text-gray-700">{jobData.preferredSkills}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Education & Certifications */}
              {(jobData.educationLevel ||
                jobData.preferredFieldOfStudy ||
                jobData.requiredCertifications) && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Education & Certifications
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobData.educationLevel && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Education Level:
                        </h4>
                        <p className="text-gray-700 capitalize">
                          {jobData.educationLevel}
                        </p>
                      </div>
                    )}

                    {jobData.preferredFieldOfStudy && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Preferred Field of Study:
                        </h4>
                        <p className="text-gray-700">
                          {jobData.preferredFieldOfStudy}
                        </p>
                      </div>
                    )}
                  </div>

                  {jobData.requiredCertifications && (
                    <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        Required Certifications:
                      </h4>
                      <p className="text-yellow-700">
                        {jobData.requiredCertifications}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Benefits */}
              {(jobData.benefits?.length > 0 ||
                jobData.employeeBenefits?.length > 0 ||
                jobData.otherBenefits) && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Benefits & Perks
                  </h3>

                  {/* Standard Benefits */}
                  {jobData.benefits?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Additional Benefits:
                      </h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {jobData.benefits.map(
                          (benefit: string, index: number) => (
                            <li key={index}>{benefit}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Employee Benefits */}
                  {jobData.employeeBenefits?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Employee Benefits Package:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {jobData.employeeBenefits.map(
                          (benefit: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                            >
                              {benefit
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Other Benefits */}
                  {jobData.otherBenefits && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">
                        Additional Benefits:
                      </h4>
                      <p className="text-green-700">{jobData.otherBenefits}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Licensed Candidate Requirements */}
              {(jobData.candidateType?.length > 0 ||
                jobData.workSchedule ||
                jobData.payStructureType ||
                jobData.employeeBenefits?.length > 0 ||
                jobData.qualifications?.length > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">
                    🎯 Licensed Candidate Requirements
                  </h3>

                  {/* Candidate Types */}
                  {jobData.candidateType?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Preferred Candidate Experience:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {jobData.candidateType.map(
                          (type: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {type
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Work Schedule */}
                  {jobData.workSchedule && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Work Schedule:
                      </h4>
                      <p className="text-blue-700 mb-2 capitalize">
                        {jobData.workSchedule.replace("_", " ")}
                      </p>
                      {jobData.partTimeWorkDays?.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-blue-600">
                            Part-time days:{" "}
                          </span>
                          <span className="text-blue-700">
                            {jobData.partTimeWorkDays
                              .map(
                                (day: string) =>
                                  day.charAt(0).toUpperCase() + day.slice(1)
                              )
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      {jobData.hybridOfficeDays?.length > 0 && (
                        <div>
                          <span className="text-sm text-blue-600">
                            Hybrid office days:{" "}
                          </span>
                          <span className="text-blue-700">
                            {jobData.hybridOfficeDays
                              .map(
                                (day: string) =>
                                  day.charAt(0).toUpperCase() + day.slice(1)
                              )
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Office Requirements */}
                  {jobData.officeRequirement && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Office Requirements:
                      </h4>
                      <p className="text-blue-700 mb-1">
                        Office attendance required:{" "}
                        <span className="font-medium">
                          {jobData.officeRequirement}
                        </span>
                      </p>
                      {jobData.officeDetails && (
                        <p className="text-blue-600 text-sm">
                          {jobData.officeDetails}
                        </p>
                      )}
                      {jobData.remoteWorkDays && (
                        <p className="text-blue-600 text-sm mt-1">
                          Remote work: {jobData.remoteWorkDays}
                        </p>
                      )}
                      {jobData.remoteWorkPreferredDays?.length > 0 && (
                        <p className="text-blue-600 text-sm">
                          Preferred remote days:{" "}
                          {jobData.remoteWorkPreferredDays.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Pay Structure */}
                  {(jobData.payStructureType ||
                    jobData.salaryType ||
                    jobData.salaryRange) && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Pay Structure:
                      </h4>
                      {jobData.payStructureType && (
                        <p className="text-blue-700 mb-1 capitalize">
                          Structure:{" "}
                          {jobData.payStructureType.replace(/_/g, " ")}
                        </p>
                      )}
                      {jobData.salaryType && (
                        <p className="text-blue-700 mb-1">
                          Type: {jobData.salaryType}
                        </p>
                      )}
                      {jobData.salaryRange && (
                        <p className="text-blue-700 mb-1">
                          Range: {jobData.salaryRange}
                        </p>
                      )}
                      {jobData.hourlyPay && (
                        <p className="text-blue-600 text-sm">
                          Hourly rate: {jobData.hourlyPay}
                        </p>
                      )}
                      {jobData.payDays && (
                        <p className="text-blue-600 text-sm">
                          Pay schedule: {jobData.payDays}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Employee Benefits */}
                  {jobData.employeeBenefits?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Employee Benefits:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {jobData.employeeBenefits.map(
                          (benefit: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                            >
                              {benefit
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Travel & Background Requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {jobData.travelRequirements && (
                      <div>
                        <h4 className="font-semibold text-blue-800 text-sm">
                          Travel Requirements:
                        </h4>
                        <p className="text-blue-700 text-sm">
                          {jobData.travelRequirements}
                        </p>
                      </div>
                    )}
                    {(jobData.backgroundCheckRequired !== undefined ||
                      jobData.drugTestRequired !== undefined) && (
                      <div>
                        <h4 className="font-semibold text-blue-800 text-sm">
                          Background Checks:
                        </h4>
                        <div className="text-blue-700 text-sm space-y-1">
                          {jobData.backgroundCheckRequired && (
                            <p>✓ Background check required</p>
                          )}
                          {jobData.drugTestRequired && (
                            <p>✓ Drug test required</p>
                          )}
                          {!jobData.backgroundCheckRequired &&
                            !jobData.drugTestRequired && (
                              <p>No special checks required</p>
                            )}
                        </div>
                      </div>
                    )}
                    {jobData.freeParking && (
                      <div>
                        <h4 className="font-semibold text-blue-800 text-sm">
                          Parking:
                        </h4>
                        <p className="text-blue-700 text-sm capitalize">
                          {jobData.freeParking.replace("_", " ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {jobData.roleType && (
                      <div>
                        <h4 className="font-semibold text-blue-800 text-sm">
                          Role Focus:
                        </h4>
                        <p className="text-blue-700 text-sm capitalize">
                          {jobData.roleType.replace("_", " ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Required Qualifications */}
                  {jobData.qualifications?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Required Qualifications:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                        {jobData.qualifications.map(
                          (qual: string, index: number) => (
                            <li key={index}>{qual}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Additional Requirements */}
                  {jobData?.additionalRequirements && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Additional Requirements:
                      </h4>
                      <div className="bg-blue-100 p-3 rounded text-blue-700 text-sm whitespace-pre-wrap">
                        {jobData?.additionalRequirements}
                      </div>
                    </div>
                  )}

                  {/* Start Date Information */}
                  {(jobData.startDate ||
                    jobData.startDateType ||
                    jobData.specificStartDate) && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Start Date Information:
                      </h4>
                      <div className="text-blue-700 text-sm space-y-1">
                        {jobData.startDateType && (
                          <p>
                            Start Date Type:{" "}
                            <span className="capitalize">
                              {jobData.startDateType.replace("_", " ")}
                            </span>
                          </p>
                        )}
                        {jobData.startDate && (
                          <p>
                            Preferred Start Date:{" "}
                            {new Date(jobData.startDate).toLocaleDateString()}
                          </p>
                        )}
                        {jobData.specificStartDate && (
                          <p>
                            Specific Start Date:{" "}
                            {new Date(
                              jobData.specificStartDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Application Instructions */}
              {jobData.applicationInstructions &&
                jobData.applicationInstructions.trim() && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-indigo-900 mb-3">
                      📋 Application Instructions
                    </h3>
                    <div className="text-indigo-700 whitespace-pre-wrap">
                      {jobData.applicationInstructions}
                    </div>
                  </div>
                )}

              {/* Company Info */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  About the Company
                </h3>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {jobData.employer?.companyName || "Company Name"}
                  </p>
                  <p className="text-gray-600">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {jobData.location || `${jobData.city}, ${jobData.state}`}
                  </p>
                  {jobData.employer?.ownerName && (
                    <p className="text-gray-600">
                      <Users className="h-4 w-4 inline mr-1" />
                      Contact Person: {jobData.employer.ownerName}
                    </p>
                  )}
                  {jobData.contactNumber && (
                    <p className="text-gray-600 font-medium">
                      <span className="inline-block w-4 h-4 mr-1">📞</span>
                      Direct Contact: {jobData.contactNumber}
                    </p>
                  )}

                  {!jobData.contactNumber && (
                    <p className="text-gray-400 text-sm italic">
                      No direct contact number provided for this job
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {jobData && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Job ID: {jobData._id}</div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveJob}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Heart className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Job"}</span>
                </button>
                <button
                  onClick={handleApplyToJob}
                  disabled={isApplying}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isApplying ? "Applying..." : "Quick Apply"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
