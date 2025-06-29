"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCreateJob } from "@/lib/queries";

interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  benefits: string[];
  department: string;
  urgency: string;
  expires: string;
}

export default function CreateJobPage() {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: [],
    skills: [],
    experience: "",
    location: "",
    jobType: "full_time",
    workMode: "office",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    benefits: [],
    department: "",
    urgency: "normal",
    expires: "",
  });
  const [benefitsInput, setBenefitsInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Use TanStack Query mutation
  const createJobMutation = useCreateJob();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInputChange = (field: keyof JobFormData, value: string) => {
    const arrayValue = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData((prev) => ({
      ...prev,
      [field]: arrayValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Process benefits from the input string
      const benefitsArray = benefitsInput
        .split(",")
        .map((benefit) => benefit.trim())
        .filter((benefit) => benefit.length > 0);

      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.join(", "),
        location: formData.location,
        jobType: formData.jobType,
        salaryRange:
          formData.salaryMin && formData.salaryMax
            ? `${formData.salaryMin}-${formData.salaryMax} ${formData.currency}`
            : "",
        company: "Your Company", // This should come from user profile
      };

      await createJobMutation.mutateAsync(jobData);
      router.push("/employer/jobs");
    } catch (error: any) {
      console.error("Error creating job:", error);
      setError(error?.message || "Failed to create job");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Job
              </h1>
              <p className="mt-1 text-gray-600">
                Post a new job opening to attract top talent
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Engineering, Marketing"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., San Francisco, CA"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="jobType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Job Type *
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="workMode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Work Mode *
                  </label>
                  <select
                    id="workMode"
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="office">Office</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Experience Required *
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years (Entry Level)</option>
                    <option value="1-3">1-3 years (Junior)</option>
                    <option value="3-5">3-5 years (Mid Level)</option>
                    <option value="5-8">5-8 years (Senior)</option>
                    <option value="8-12">8-12 years (Lead)</option>
                    <option value="12+">12+ years (Principal/Director)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="urgency"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Urgency
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="very_urgent">Very Urgent</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="expires"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="expires"
                    name="expires"
                    value={formData.expires}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Salary Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="salaryMin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryMin"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="salaryMax"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryMax"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="80000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Job Details
              </h3>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="requirements"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Requirements (comma-separated) *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("requirements", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Bachelor's degree in Computer Science, 3+ years experience, Strong problem-solving skills"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Required Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("skills", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="benefits"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  id="benefits"
                  name="benefits"
                  value={benefitsInput}
                  onChange={(e) => setBenefitsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Health insurance, 401k, Flexible hours, Remote work"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple benefits with commas
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createJobMutation.isPending}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {createJobMutation.isPending ? "Creating..." : "Create Job"}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
