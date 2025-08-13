"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminFetchers, jobFetchers } from "@/lib/fetchers";
import { toast } from "sonner";

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
                  {job.employer.companyName}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminFetchers.getAdminJobs();

      console.log("Raw API response:", response);
      console.log("Response type:", typeof response);
      console.log(
        "Response keys:",
        response ? Object.keys(response) : "No response"
      );

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
      console.log("Number of jobs:", jobsData.length);

      if (jobsData.length > 0) {
        console.log("First job sample:", jobsData[0]);
        setJobs(jobsData);
      } else {
        console.log("No jobs data found");
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

  const handleToggleApproval = async (jobId: string) => {
    try {
      const job = jobs.find((j) => j._id === jobId);
      if (!job) return;

      const newApprovalStatus = !job.isApproved;
      const status = newApprovalStatus ? "approved" : "pending";

      await adminFetchers.updateJobStatus(jobId, status);

      setJobs(
        jobs.map((j) =>
          j._id === jobId ? { ...j, isApproved: newApprovalStatus } : j
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

  const handleToggleActive = async (jobId: string) => {
    try {
      const job = jobs.find((j) => j._id === jobId);
      if (!job) return;

      const newActiveStatus = !job.isActive;
      const status = newActiveStatus ? "active" : "inactive";

      await adminFetchers.updateJobStatus(jobId, status);

      setJobs(
        jobs.map((j) =>
          j._id === jobId ? { ...j, isActive: newActiveStatus } : j
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

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await jobFetchers.deleteJob(jobId);
      setJobs(jobs.filter((j) => j._id !== jobId));
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

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Total jobs:", jobs.length);
  console.log("Filtered jobs:", filteredJobs.length);
  console.log("Search term:", searchTerm);
  console.log("Jobs array:", jobs);
  console.log("Filtered jobs array:", filteredJobs);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-600 mt-4">
                Loading Jobs...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we fetch job data
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="min-h-screen">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Job Management
              </h1>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleAddNew}
              >
                ADD NEW
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden min-h-[600px]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-16 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          {jobs.length === 0
                            ? "No jobs found. Please check the API response or add some jobs."
                            : "No jobs found matching your search."}
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job, index) => {
                        console.log("Rendering job:", job);
                        return (
                          <tr key={job._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="w-48 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate">
                              {job.title}
                            </td>
                            <td className="w-48 px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
                              {job?.employer?.companyName}
                            </td>
                            <td className="w-48 px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
                              {job.location}
                            </td>
                            <td className="w-48 px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
                              {job.jobRole.replace("_", " ")} •{" "}
                              {job.jobType.replace("_", " ")}
                            </td>
                            <td className="w-48 px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
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
                            </td>
                            <td className="w-40 px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div
                                className="relative"
                                data-dropdown-id={job._id}
                              >
                                <button
                                  onClick={() =>
                                    setActiveDropdown(
                                      activeDropdown === job._id
                                        ? null
                                        : job._id
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

                                {activeDropdown === job._id && (
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          handleEditJob(job);
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
                                        Edit Job
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleViewProfile(job);
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
                                        View Details
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleToggleApproval(job._id);
                                          setActiveDropdown(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-3 text-purple-500"
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
                                        {job.isApproved ? "Reject" : "Approve"}
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleToggleActive(job._id);
                                          setActiveDropdown(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-3 text-yellow-500"
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
                                        {job.isActive
                                          ? "Deactivate"
                                          : "Activate"}
                                      </button>

                                      <div className="border-t border-gray-100 my-1"></div>

                                      <button
                                        onClick={() => {
                                          handleDeleteJob(job._id);
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
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                        Delete Job
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

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
