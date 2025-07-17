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
        transform transition-all duration-200 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
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
                      {formatSalary(
                        jobData.salaryMin,
                        jobData.salaryMax,
                        jobData.currency
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
                    {jobData.experience || "Not specified"}
                  </p>
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
              {jobData.skills && jobData.skills.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {jobData.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {jobData.benefits && jobData.benefits.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Benefits & Perks
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {jobData.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
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
                      Contact: {jobData.employer.ownerName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {jobData && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
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
