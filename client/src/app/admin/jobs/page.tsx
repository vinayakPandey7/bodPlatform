"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminFetchers, jobFetchers } from "@/lib/fetchers";
import { toast } from "sonner";
import {
  GenericTable,
  TableColumn,
  TableAction,
  StatCard,
} from "@/components/GenericTable";
import {
  jobStatusBadgeConfig,
  jobActiveBadgeConfig,
  createNameColumn,
  createActionsColumn,
  createEditAction,
  createViewAction,
  createDeleteAction,
} from "@/components/table/tableUtils";

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  jobRole: string; // "full_time" | "part_time"
  jobType: string; // "work_from_office" | "work_from_home"
  payStructure: string; // "monthly" | "hourly"
  serviceSalesFocus: string;
  licenseRequirement: string;
  numberOfPositions: number;
  recruitmentDuration: string;
  startDate: string;
  expires: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  employer: {
    companyName: string;
    ownerName: string;
  };
  salary?: string;
  requirements?: string;
  benefits?: string;
}

interface ProfileModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

interface JobFormData {
  title: string;
  description: string;
  location: string;
  jobRole: string;
  jobType: string;
  payStructure: string;
  serviceSalesFocus: string;
  licenseRequirement: string;
  numberOfPositions: number;
  recruitmentDuration: string;
  startDate: string;
  expires: string;
  salary: string;
  requirements: string;
  benefits: string;
  isApproved: boolean;
  isActive: boolean;
}

interface JobFormModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: JobFormData) => void;
  mode: "add" | "edit";
}

const JobFormModal = ({
  job,
  isOpen,
  onClose,
  onSave,
  mode,
}: JobFormModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobRole: "full_time",
    jobType: "work_from_office",
    payStructure: "monthly",
    serviceSalesFocus: "",
    licenseRequirement: "",
    numberOfPositions: 1,
    recruitmentDuration: "",
    startDate: "",
    expires: "",
    salary: "",
    requirements: "",
    benefits: "",
    isApproved: true,
    isActive: true,
  });

  useEffect(() => {
    if (mode === "edit" && job) {
      setFormData({
        title: job.title,
        description: job.description,
        location: job.location,
        jobRole: job.jobRole,
        jobType: job.jobType,
        payStructure: job.payStructure,
        serviceSalesFocus: job.serviceSalesFocus,
        licenseRequirement: job.licenseRequirement,
        numberOfPositions: job.numberOfPositions,
        recruitmentDuration: job.recruitmentDuration,
        startDate: job.startDate,
        expires: job.expires,
        salary: job.salary || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        isApproved: job.isApproved,
        isActive: job.isActive,
      });
    } else if (mode === "add") {
      setFormData({
        title: "",
        description: "",
        location: "",
        jobRole: "full_time",
        jobType: "work_from_office",
        payStructure: "monthly",
        serviceSalesFocus: "",
        licenseRequirement: "",
        numberOfPositions: 1,
        recruitmentDuration: "",
        startDate: "",
        expires: "",
        salary: "",
        requirements: "",
        benefits: "",
        isApproved: true,
        isActive: true,
      });
    }
  }, [job, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-4/5 xl:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === "add" ? "Add New Job" : "Edit Job"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role *
                </label>
                <select
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type *
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="work_from_office">Work From Office</option>
                  <option value="work_from_home">Work From Home</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Structure *
                </label>
                <select
                  name="payStructure"
                  value={formData.payStructure}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                  <option value="yearly">Yearly</option>
                  <option value="project_based">Project Based</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Positions *
                </label>
                <input
                  type="number"
                  name="numberOfPositions"
                  value={formData.numberOfPositions}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g., $50,000 - $70,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recruitment Duration
                </label>
                <input
                  type="text"
                  name="recruitmentDuration"
                  value={formData.recruitmentDuration}
                  onChange={handleInputChange}
                  placeholder="e.g., 30 days, 2 weeks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires
                </label>
                <input
                  type="date"
                  name="expires"
                  value={formData.expires}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Requirement
                </label>
                <input
                  type="text"
                  name="licenseRequirement"
                  value={formData.licenseRequirement}
                  onChange={handleInputChange}
                  placeholder="e.g., Required, Not Required"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Sales Focus
                </label>
                <input
                  type="text"
                  name="serviceSalesFocus"
                  value={formData.serviceSalesFocus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Status
                </label>
                <select
                  name="isApproved"
                  value={formData.isApproved ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isApproved: e.target.value === "true",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Active Status
                </label>
                <select
                  name="isActive"
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.value === "true",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benefits
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {mode === "add" ? "Add Job" : "Update Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProfileModal = ({ job, isOpen, onClose }: ProfileModalProps) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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
                  Job Title
                </label>
                <p className="mt-1 text-sm text-gray-900">{job.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <p className="mt-1 text-sm text-gray-900">{job.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Role
                </label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {job.jobRole.replace("_", " ")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Type
                </label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {job.jobType.replace("_", " ")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pay Structure
                </label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {job.payStructure.replace("_", " ")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Positions
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {job.numberOfPositions}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employer
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {job.employer?.companyName || "No company specified"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1 flex space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.isApproved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {job.isApproved ? "Approved" : "Pending"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.isActive
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <p className="mt-1 text-sm text-gray-900">{job.description}</p>
            </div>

            {job.salary && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Salary Range
                </label>
                <p className="mt-1 text-sm text-gray-900">{job.salary}</p>
              </div>
            )}

            {job.requirements && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Requirements
                </label>
                <p className="mt-1 text-sm text-gray-900">{job.requirements}</p>
              </div>
            )}

            {job.benefits && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Benefits
                </label>
                <p className="mt-1 text-sm text-gray-900">{job.benefits}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Posted Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              {job.expires && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expires
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(job.expires).toLocaleDateString()}
                  </p>
                </div>
              )}
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

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminFetchers.getAdminJobs();

      console.log("Raw API response:", response);

      // Handle different response structures
      let jobsData = [];
      if (response && Array.isArray(response)) {
        jobsData = response;
      } else if (response && response.jobs && Array.isArray(response.jobs)) {
        jobsData = response.jobs;
      } else if (response && response.data && Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (
        response &&
        response.results &&
        Array.isArray(response.results)
      ) {
        jobsData = response.results;
      }

      console.log("Processed jobs data:", jobsData);

      if (jobsData.length > 0) {
        setJobs(jobsData);
      } else {
        setJobs([]);
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.response?.data?.message || "Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (job: Job) => {
    try {
      const newApprovalStatus = !job.isApproved;
      const status = newApprovalStatus ? "approved" : "pending";

      await adminFetchers.updateJobStatus(job._id, status);

      setJobs(
        jobs.map((j) =>
          j._id === job._id ? { ...j, isApproved: newApprovalStatus } : j
        )
      );

      toast.success(
        `Job ${newApprovalStatus ? "approved" : "rejected"} successfully!`
      );
    } catch (err: any) {
      console.error("Error updating job approval:", err);
      toast.error("Failed to update job approval status");
    }
  };

  const handleToggleActive = async (job: Job) => {
    try {
      const newActiveStatus = !job.isActive;
      const status = newActiveStatus ? "active" : "inactive";

      await adminFetchers.updateJobStatus(job._id, status);

      setJobs(
        jobs.map((j) =>
          j._id === job._id ? { ...j, isActive: newActiveStatus } : j
        )
      );

      toast.success(
        `Job ${newActiveStatus ? "activated" : "deactivated"} successfully!`
      );
    } catch (err: any) {
      console.error("Error updating job status:", err);
      toast.error("Failed to update job status");
    }
  };

  const handleDeleteJob = async (job: Job) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await jobFetchers.deleteJob(job._id);
      setJobs(jobs.filter((j) => j._id !== job._id));
      toast.success("Job deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job");
    }
  };

  const handleViewProfile = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveJob = async (jobData: JobFormData) => {
    try {
      if (isEditModalOpen && editingJob) {
        // Update existing job via API
        await jobFetchers.updateJob(editingJob._id, jobData);

        // Refresh the jobs list to get the latest data
        fetchJobs();

        setIsEditModalOpen(false);
        setEditingJob(null);
        toast.success("Job updated successfully!");
      } else if (isAddModalOpen) {
        // Add new job via API
        await jobFetchers.createJob(jobData);

        // Refresh the jobs list to get the latest data
        fetchJobs();

        setIsAddModalOpen(false);
        toast.success("Job added successfully!");
      }
    } catch (err: any) {
      console.error("Error saving job:", err);
      const errorMessage =
        err.response?.data?.message || "Error saving job. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Table columns configuration
  const columns: TableColumn<Job>[] = [
    createNameColumn("title", "Job Title"),
    {
      key: "employer",
      label: "Company",
      type: "text",
      responsive: "sm",
      searchable: true,
      render: (value: any) => value?.companyName || "N/A",
    },
    {
      key: "location",
      label: "Location",
      type: "text",
      responsive: "md",
      searchable: true,
    },
    {
      key: "jobRole",
      label: "Type",
      type: "text",
      responsive: "lg",
      render: (value: string, row: Job) => (
        <span className="text-sm">
          {value.replace("_", " ") || row.jobType.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "isApproved",
      label: "Approval",
      type: "badge",
      responsive: "always",
      badgeConfig: jobStatusBadgeConfig,
    },
    {
      key: "isActive",
      label: "Status",
      type: "badge",
      responsive: "always",
      badgeConfig: jobActiveBadgeConfig,
    },
    createActionsColumn(),
  ];

  // Table actions configuration
  const actions: TableAction<Job>[] = [
    createEditAction(handleEditJob),
    createViewAction(handleViewProfile),
    {
      label: "Toggle Approval",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      onClick: handleToggleApproval,
      variant: "default",
    },
    {
      label: "Toggle Active",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      onClick: handleToggleActive,
      variant: "warning",
    },
    createDeleteAction(handleDeleteJob),
  ];

  // Statistics
  const totalJobs = jobs.length;
  const approvedJobs = jobs.filter((job) => job.isApproved).length;
  const activeJobs = jobs.filter((job) => job.isActive).length;
  const pendingJobs = jobs.filter((job) => !job.isApproved).length;

  // Statistics cards
  const statCards: StatCard[] = [
    {
      title: "Total Jobs",
      value: totalJobs,
      subtitle: "All posted",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v10l4-4 4 4V8M8 8H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V10a2 2 0 00-2-2h-4"
          />
        </svg>
      ),
      variant: "primary",
    },
    {
      title: "Approved",
      value: approvedJobs,
      subtitle: "Ready to publish",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      variant: "success",
    },
    {
      title: "Active",
      value: activeJobs,
      subtitle: "Currently live",
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      variant: "secondary",
    },
    {
      title: "Pending",
      value: pendingJobs,
      subtitle: "Awaiting approval",
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      variant: "warning",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <GenericTable
          data={jobs}
          columns={columns}
          actions={actions}
          loading={loading}
          error={error || null}
          title="Job Management"
          searchPlaceholder="Search jobs..."
          addButton={{ label: "ADD NEW", onClick: handleAddNew }}
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
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <JobFormModal
          job={null}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveJob}
          mode="add"
        />

        <JobFormModal
          job={editingJob}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveJob}
          mode="edit"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
