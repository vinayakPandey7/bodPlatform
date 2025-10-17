"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUpdateJob, useJob } from "@/lib/queries";
import { toast } from "sonner";
import api from "@/lib/api";

interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  location: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
  jobType: string;
  workMode: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  benefits: string[];
  department: string;
  urgency: string;
  expires: string;
  contactNumber: string;

  // Licensed Candidate Search Requirements
  candidateType: string[];
  workSchedule: string;
  partTimeWorkDays: string[];
  hybridOfficeDays: string[];
  officeRequirement: string;
  officeDetails: string;
  remoteWorkDays: string;
  remoteWorkPreferredDays: string[];
  payStructureType: string;
  salaryType: string;
  salaryRange: string;
  hourlyPay: string;
  payDays: string;
  employeeBenefits: string[];
  otherBenefits: string;
  freeParking: string;
  roleType: string;
  qualifications: string[];
  experienceLevel: string;
  specificExperience: string;
  educationLevel: string;
  preferredFieldOfStudy: string;
  requiredCertifications: string;
  requiredSkills: string;
  preferredSkills: string;
  startDate: string;
  startDateType: string;
  specificStartDate: string;
  travelRequirements: string;
  backgroundCheckRequired: boolean;
  drugTestRequired: boolean;
  additionalRequirements: string;
  applicationInstructions: string;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  console.log("EditJobPage params:", params, "jobId:", jobId);

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: [],
    skills: [],
    experience: "",
    location: "",
    zipCode: "",
    city: "",
    state: "",
    country: "United States",
    jobType: "full_time",
    workMode: "office",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    benefits: [],
    department: "",
    urgency: "normal",
    expires: "",
    contactNumber: "",

    // Licensed Candidate Search Requirements
    candidateType: [],
    workSchedule: "",
    partTimeWorkDays: [],
    hybridOfficeDays: [],
    officeRequirement: "",
    officeDetails: "",
    remoteWorkDays: "",
    remoteWorkPreferredDays: [],
    payStructureType: "",
    salaryType: "",
    salaryRange: "",
    hourlyPay: "",
    payDays: "",
    employeeBenefits: [],
    otherBenefits: "",
    freeParking: "",
    roleType: "",
    qualifications: [],
    experienceLevel: "",
    specificExperience: "",
    educationLevel: "",
    preferredFieldOfStudy: "",
    requiredCertifications: "",
    requiredSkills: "",
    preferredSkills: "",
    startDate: "",
    startDateType: "",
    specificStartDate: "",
    travelRequirements: "",
    backgroundCheckRequired: false,
    drugTestRequired: false,
    additionalRequirements: "",
    applicationInstructions: "",
  });

  const [benefitsInput, setBenefitsInput] = useState("");
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use TanStack Query hooks
  const updateJobMutation = useUpdateJob();
  const {
    data: jobData,
    isLoading: loading,
    error: jobError,
  } = useJob(jobId, !!jobId);

  // Debug logging
  console.log("EditJobPage Debug:", {
    jobId,
    jobData,
    loading,
    jobError,
    hasJobData: !!jobData,
  });

  // Days of the week options for multi-select
  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  // Employee benefits options
  const employeeBenefitOptions = [
    { value: "health_insurance", label: "Health Insurance" },
    { value: "dental_insurance", label: "Dental Insurance" },
    { value: "vision_insurance", label: "Vision Insurance" },
    { value: "retirement_plan", label: "Retirement Plan (401k)" },
    { value: "paid_time_off", label: "Paid Time Off" },
    { value: "sick_leave", label: "Sick Leave" },
    { value: "life_insurance", label: "Life Insurance" },
    { value: "disability_insurance", label: "Disability Insurance" },
    { value: "flexible_schedule", label: "Flexible Schedule" },
    { value: "professional_development", label: "Professional Development" },
    { value: "tuition_reimbursement", label: "Tuition Reimbursement" },
    { value: "employee_discounts", label: "Employee Discounts" },
    { value: "commuter_benefits", label: "Commuter Benefits" },
    { value: "wellness_programs", label: "Wellness Programs" },
    { value: "other", label: "Other" },
  ];

  // Update form data when job data is loaded
  useEffect(() => {
    console.log("useEffect triggered with jobData:", jobData);

    if (jobData) {
      const jobDataAny = jobData as any;

      // Handle different possible response structures
      let job;
      if (jobDataAny.job) {
        job = jobDataAny.job; // If response has { job: {...} }
      } else if (jobDataAny.data && jobDataAny.data.job) {
        job = jobDataAny.data.job; // If response has { data: { job: {...} } }
      } else {
        job = jobDataAny; // If response is directly the job object
      }

      console.log("Setting form data with job:", job);

      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || [],
        skills: job.skills || [],
        experience: job.experience || "",
        location: job.location || "",
        zipCode: job.zipCode || "",
        city: job.city || "",
        state: job.state || "",
        country: job.country || "United States",
        jobType: job.jobType || "full_time",
        workMode: job.workMode || "office",
        salaryMin: job.salaryMin ? job.salaryMin.toString() : "",
        salaryMax: job.salaryMax ? job.salaryMax.toString() : "",
        currency: job.currency || "USD",
        benefits: job.benefits || [],
        department: job.department || "",
        urgency: job.urgency || "normal",
        expires: job.expires
          ? new Date(job.expires).toISOString().split("T")[0]
          : "",
        contactNumber: job.contactNumber || "",

        // Licensed Candidate Search Requirements
        candidateType: job.candidateType || [],
        workSchedule: job.workSchedule || "",
        partTimeWorkDays: job.partTimeWorkDays || [],
        hybridOfficeDays: job.hybridOfficeDays || [],
        officeRequirement: job.officeRequirement || "",
        officeDetails: job.officeDetails || "",
        remoteWorkDays: job.remoteWorkDays || "",
        remoteWorkPreferredDays: job.remoteWorkPreferredDays || [],
        payStructureType: job.payStructureType || "",
        salaryType: job.salaryType || "",
        salaryRange: job.salaryRange || "",
        hourlyPay: job.hourlyPay || "",
        payDays: job.payDays || "",
        employeeBenefits: job.employeeBenefits || [],
        otherBenefits: job.otherBenefits || "",
        freeParking: job.freeParking || "",
        roleType: job.roleType || "",
        qualifications: job.qualifications || [],
        experienceLevel: job.experienceLevel || "",
        specificExperience: job.specificExperience || "",
        educationLevel: job.educationLevel || "",
        preferredFieldOfStudy: job.preferredFieldOfStudy || "",
        requiredCertifications: job.requiredCertifications || "",
        requiredSkills: job.requiredSkills || "",
        preferredSkills: job.preferredSkills || "",
        startDate: job.startDate
          ? new Date(job.startDate).toISOString().split("T")[0]
          : "",
        startDateType: job.startDateType || "",
        specificStartDate: job.specificStartDate
          ? new Date(job.specificStartDate).toISOString().split("T")[0]
          : "",
        travelRequirements: job.travelRequirements || "",
        backgroundCheckRequired: job.backgroundCheckRequired || false,
        drugTestRequired: job.drugTestRequired || false,
        additionalRequirements: job.additionalRequirements || "",
        applicationInstructions: job.applicationInstructions || "",
      });

      // Set benefits input
      if (job.benefits && job.benefits.length > 0) {
        setBenefitsInput(job.benefits.join(", "));
      }
    }
  }, [jobData]);

  // Handle job loading error
  useEffect(() => {
    if (jobError) {
      setError("Failed to fetch job details");
    }
  }, [jobError]);

  // Test direct API call
  useEffect(() => {
    if (jobId && !jobData && !loading) {
      console.log("Testing direct API call for jobId:", jobId);
      api
        .get(`/jobs/${jobId}`)
        .then((response: any) => {
          console.log("Direct API response:", response.data);
        })
        .catch((error: any) => {
          console.log("Direct API error:", error);
        });
    }
  }, [jobId, jobData, loading]);

  // Handle multi-select for days
  const handleDayToggle = (
    field: "partTimeWorkDays" | "remoteWorkPreferredDays" | "hybridOfficeDays",
    day: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(day)
        ? prev[field].filter((d) => d !== day)
        : [...prev[field], day],
    }));
  };

  // Handle employee benefits toggle
  const handleBenefitToggle = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      employeeBenefits: prev.employeeBenefits.includes(benefit)
        ? prev.employeeBenefits.filter((b) => b !== benefit)
        : [...prev.employeeBenefits, benefit],
    }));
  };

  // Function to validate zip code and auto-populate city/state
  const validateZipCode = async (zipCode: string) => {
    if (!zipCode || zipCode.length !== 5) {
      setLocationError("");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    try {
      const response = await fetch(`/api/location/validate?zipCode=${zipCode}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setFormData((prev) => ({
          ...prev,
          city: data.city,
          state: data.state,
          location: `${data.city}, ${data.state}`,
        }));
        setLocationError("");
      } else {
        setLocationError(data.message || "Invalid zip code");
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
          location: "",
        }));
      }
    } catch (error) {
      console.error("Zip code validation error:", error);
      setLocationError("Unable to validate zip code");
    } finally {
      setLocationLoading(false);
    }
  };

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

    // Handle zip code validation and auto-population
    if (name === "zipCode") {
      // Clear previous location error
      setLocationError("");

      // Validate zip code format (5 digits)
      if (value && !/^\d{5}$/.test(value)) {
        setLocationError("Zip code must be 5 digits");
        return;
      }

      // Auto-populate city and state if valid zip code
      if (value.length === 5) {
        validateZipCode(value);
      } else {
        // Clear city/state if zip code is incomplete
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
          location: "",
        }));
      }
    }
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
    setLocationError("");

    // Validate required location fields
    if (!formData.zipCode) {
      setLocationError("Zip code is required for job posting");
      return;
    }

    if (!formData.city || !formData.state) {
      setLocationError(
        "City and state are required. Please enter a valid zip code."
      );
      return;
    }

    // Validate contact number
    if (!formData.contactNumber) {
      setError("Contact number is required");
      return;
    }

    // Basic phone number validation (allows various formats)
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{10,}$/;
    if (!phoneRegex.test(formData.contactNumber.trim())) {
      setError("Please provide a valid contact number (minimum 10 digits)");
      return;
    }

    // Validate licensed candidate search requirements
    if (formData.candidateType.length === 0) {
      setError("Please select at least one candidate type");
      return;
    }

    if (!formData.workSchedule) {
      setError("Please select work schedule (Full-Time or Part-Time)");
      return;
    }

    if (
      formData.workSchedule === "part_time" &&
      formData.partTimeWorkDays.length === 0
    ) {
      setError("Please select part-time work days");
      return;
    }

    if (!formData.officeRequirement) {
      setError("Please specify office requirement");
      return;
    }

    if (formData.officeRequirement === "yes" && !formData.officeDetails) {
      setError("Please provide office requirement details");
      return;
    }

    if (!formData.payStructureType) {
      setError("Please specify pay structure type");
      return;
    }

    if (
      formData.payStructureType === "hourly" &&
      (!formData.hourlyPay || !formData.payDays)
    ) {
      setError("Please provide hourly pay and pay days information");
      return;
    }

    if (formData.employeeBenefits.length === 0) {
      setError("Please specify employee benefits");
      return;
    }

    if (!formData.freeParking) {
      setError("Please specify parking availability");
      return;
    }

    if (!formData.roleType) {
      setError("Please specify role type (service-only, sales-only, or mixed)");
      return;
    }

    if (formData.qualifications.length === 0) {
      setError("Please specify required qualifications");
      return;
    }

    if (!formData.startDate) {
      setError("Please specify desired start date");
      return;
    }

    try {
      setIsSubmitting(true);

      // Process benefits from the input string
      const benefitsArray = benefitsInput
        .split(",")
        .map((benefit) => benefit.trim())
        .filter((benefit) => benefit.length > 0);

      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        skills: formData.skills,
        experience: formData.experience,
        location: formData.location,
        zipCode: formData.zipCode,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        jobType: formData.jobType,
        workMode: formData.workMode,
        salaryMin: formData.salaryMin
          ? parseInt(formData.salaryMin)
          : undefined,
        salaryMax: formData.salaryMax
          ? parseInt(formData.salaryMax)
          : undefined,
        currency: formData.currency,
        benefits: benefitsArray,
        department: formData.department,
        urgency: formData.urgency,
        expires: formData.expires ? new Date(formData.expires) : undefined,
        contactNumber: formData.contactNumber,

        // Licensed Candidate Search Requirements
        candidateType: formData.candidateType,
        workSchedule: formData.workSchedule,
        partTimeWorkDays: formData.partTimeWorkDays,
        hybridOfficeDays: formData.hybridOfficeDays,
        officeRequirement: formData.officeRequirement,
        officeDetails: formData.officeDetails,
        remoteWorkDays: formData.remoteWorkDays,
        remoteWorkPreferredDays: formData.remoteWorkPreferredDays,
        payStructureType: formData.payStructureType,
        salaryType: formData.salaryType,
        salaryRange: formData.salaryRange,
        hourlyPay: formData.hourlyPay,
        payDays: formData.payDays,
        employeeBenefits: formData.employeeBenefits,
        otherBenefits: formData.otherBenefits,
        freeParking: formData.freeParking,
        roleType: formData.roleType,
        qualifications: formData.qualifications,
        experienceLevel: formData.experienceLevel,
        specificExperience: formData.specificExperience,
        educationLevel: formData.educationLevel,
        preferredFieldOfStudy: formData.preferredFieldOfStudy,
        requiredCertifications: formData.requiredCertifications,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        startDate: formData.startDate
          ? new Date(formData.startDate)
          : undefined,
        startDateType: formData.startDateType,
        specificStartDate: formData.specificStartDate
          ? new Date(formData.specificStartDate)
          : undefined,
        travelRequirements: formData.travelRequirements,
        backgroundCheckRequired: formData.backgroundCheckRequired,
        drugTestRequired: formData.drugTestRequired,
        additionalRequirements: formData.additionalRequirements,
        applicationInstructions: formData.applicationInstructions,
      };

      await updateJobMutation.mutateAsync({ id: jobId, data: jobData });
      toast.success("Licensed candidate job search updated successfully!");
      router.push("/employer/jobs");
    } catch (error: any) {
      console.error("Error updating job:", error);
      setError(error?.message || "Failed to update job search");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Licensed Candidate Job Search
              </h1>
              <p className="mt-1 text-gray-600">
                Update your job search request for licensed insurance
                professionals
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

          {jobError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading job: {jobError.message || "Unknown error"}
            </div>
          )}

          {loading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow p-6 space-y-8"
            >
              {/* Debug Info - Remove in production */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Debug Info:
                </h4>
                <p className="text-xs text-yellow-700">Job ID: {jobId}</p>
                <p className="text-xs text-yellow-700">
                  Loading: {loading ? "Yes" : "No"}
                </p>
                <p className="text-xs text-yellow-700">
                  Has Job Data: {!!jobData ? "Yes" : "No"}
                </p>
                <p className="text-xs text-yellow-700">
                  Form Title: {formData.title}
                </p>
                <p className="text-xs text-yellow-700">
                  Form Contact: {formData.contactNumber}
                </p>
              </div>
              {/* Licensed Candidate Search Requirements - Priority Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-indigo-600 border-b pb-2">
                  Licensed Candidate Search Requirements
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Please provide ALL the following details:</strong>
                    <br />
                    <span className="text-xs text-blue-600">
                      **Please note: Service Provider aims to bring new, great
                      talent into the insurance industry. As such, we will
                      always aim to put forward licensed individuals to Agent
                      Owners. Service Provider will assist with getting
                      promising candidates licensed in Property & Casualty,
                      however, training may be needed by Client.
                    </span>
                  </p>
                </div>

                {/* Candidate Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What candidates are you wanting to see: *
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        value: "previous_sf_experience",
                        label: "Previous experience with SF**",
                      },
                      {
                        value: "previous_insurance_not_sf",
                        label:
                          "Previous insurance experience, but not with SF**",
                      },
                      {
                        value: "licensed_no_insurance_banking",
                        label:
                          "Licensed, no insurance experience, but previous banking experience**",
                      },
                      {
                        value: "licensed_no_experience",
                        label: "Licensed but no insurance experience**",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={formData.candidateType.includes(
                            option.value
                          )}
                          onChange={(e) => {
                            const newCandidateTypes = e.target.checked
                              ? [...formData.candidateType, option.value]
                              : formData.candidateType.filter(
                                  (type) => type !== option.value
                                );
                            setFormData((prev) => ({
                              ...prev,
                              candidateType: newCandidateTypes,
                            }));
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Schedule */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Work Schedule Requirements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="workSchedule"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Is the role Full-Time (FT) or Part-Time (PT)? *
                      </label>
                      <select
                        id="workSchedule"
                        name="workSchedule"
                        value={formData.workSchedule}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select schedule type</option>
                        <option value="full_time">Full-Time (FT)</option>
                        <option value="part_time">Part-Time (PT)</option>
                      </select>
                    </div>

                    {formData.workSchedule === "part_time" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          If PT, what days would you want the employee to work?
                          *
                        </label>
                        <div className="space-y-2">
                          {daysOfWeek.map((day) => (
                            <label
                              key={day.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.partTimeWorkDays.includes(
                                  day.value
                                )}
                                onChange={(e) =>
                                  handleDayToggle("partTimeWorkDays", day.value)
                                }
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {day.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Office Requirements */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Office Requirements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="officeRequirement"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Will the role require the employee to be on-site or can
                        they work from home? *
                      </label>
                      <select
                        id="officeRequirement"
                        name="officeRequirement"
                        value={formData.officeRequirement}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select office requirement</option>
                        <option value="onsite">On-site</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    {formData?.officeRequirement === "hybrid" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          If Hybrid, which days will the employee be required to
                          be in the office? *
                        </label>
                        <div className="space-y-2">
                          {daysOfWeek.map((day) => (
                            <label
                              key={day.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData?.hybridOfficeDays.includes(
                                  day.value
                                )}
                                onChange={(e) =>
                                  handleDayToggle("hybridOfficeDays", day.value)
                                }
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {day.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pay Structure and Employee Benefits */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Pay Structure and Employee Benefits
                  </h4>
                  <div className="space-y-6">
                    {/* Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="salaryType"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Salary Type *
                        </label>
                        <select
                          id="salaryType"
                          name="salaryType"
                          value={formData.salaryType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="">Select salary type</option>
                          <option value="hourly">Hourly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="salaryRange"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Salary Range *
                        </label>
                        <input
                          type="text"
                          id="salaryRange"
                          name="salaryRange"
                          value={formData.salaryRange}
                          onChange={handleInputChange}
                          placeholder="e.g., $50,000 - $60,000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Employee Benefits */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Benefits (select all that apply) *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {employeeBenefitOptions.map((benefit) => (
                          <label
                            key={benefit.value}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={formData.employeeBenefits.includes(
                                benefit.value
                              )}
                              onChange={(e) =>
                                handleBenefitToggle(benefit.value)
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              {benefit.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Other Benefits */}
                    {formData.employeeBenefits.includes("other") && (
                      <div>
                        <label
                          htmlFor="otherBenefits"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Please specify other benefits *
                        </label>
                        <textarea
                          id="otherBenefits"
                          name="otherBenefits"
                          value={formData.otherBenefits}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Please describe other benefits..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Experience */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Professional Experience
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="experienceLevel"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Experience Level *
                      </label>
                      <select
                        id="experienceLevel"
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select experience level</option>
                        <option value="entry">Entry Level (0-2 years)</option>
                        <option value="mid">Mid Level (3-5 years)</option>
                        <option value="senior">Senior Level (6+ years)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="specificExperience"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Specific Experience Requirements
                      </label>
                      <textarea
                        id="specificExperience"
                        name="specificExperience"
                        value={formData.specificExperience}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe specific experience required..."
                      />
                    </div>
                  </div>
                </div>

                {/* Educational Requirements */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Educational Requirements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="educationLevel"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Education Level *
                      </label>
                      <select
                        id="educationLevel"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select education level</option>
                        <option value="high_school">High School</option>
                        <option value="associates">Associates Degree</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="doctorate">Doctorate</option>
                        <option value="certification">
                          Professional Certification
                        </option>
                        <option value="none">
                          No Formal Education Required
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="preferredFieldOfStudy"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Preferred Field of Study
                      </label>
                      <input
                        type="text"
                        id="preferredFieldOfStudy"
                        name="preferredFieldOfStudy"
                        value={formData.preferredFieldOfStudy}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Business, Engineering, Healthcare"
                      />
                    </div>
                  </div>
                </div>

                {/* Licenses and Certifications */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Licenses and Certifications
                  </h4>
                  <div>
                    <label
                      htmlFor="requiredCertifications"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Required Licenses/Certifications
                    </label>
                    <textarea
                      id="requiredCertifications"
                      name="requiredCertifications"
                      value={formData.requiredCertifications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="List any required licenses or certifications..."
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Skills</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="requiredSkills"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Required Skills *
                      </label>
                      <textarea
                        id="requiredSkills"
                        name="requiredSkills"
                        value={formData.requiredSkills}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="List required skills (one per line or comma-separated)..."
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="preferredSkills"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Preferred/Nice-to-Have Skills
                      </label>
                      <textarea
                        id="preferredSkills"
                        name="preferredSkills"
                        value={formData.preferredSkills}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="List preferred skills (one per line or comma-separated)..."
                      />
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Start Date</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="startDateType"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Start Date Type *
                      </label>
                      <select
                        id="startDateType"
                        name="startDateType"
                        value={formData.startDateType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select start date type</option>
                        <option value="immediate">Immediate</option>
                        <option value="specific">Specific Date</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>

                    {formData.startDateType === "specific" && (
                      <div>
                        <label
                          htmlFor="specificStartDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Specific Start Date *
                        </label>
                        <input
                          type="date"
                          id="specificStartDate"
                          name="specificStartDate"
                          value={formData.specificStartDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Requirements */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Additional Requirements
                  </h4>
                  <div className="space-y-6">
                    {/* Travel Requirements */}
                    <div>
                      <label
                        htmlFor="travelRequirements"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Travel Requirements
                      </label>
                      <select
                        id="travelRequirements"
                        name="travelRequirements"
                        value={formData.travelRequirements}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select travel requirement</option>
                        <option value="none">No Travel Required</option>
                        <option value="minimal">Minimal (0-10%)</option>
                        <option value="occasional">Occasional (10-25%)</option>
                        <option value="frequent">Frequent (25-50%)</option>
                        <option value="extensive">Extensive (50%+)</option>
                      </select>
                    </div>

                    {/* Background Check */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="backgroundCheckRequired"
                          checked={formData.backgroundCheckRequired}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Background check required
                        </span>
                      </label>
                    </div>

                    {/* Drug Test */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="drugTestRequired"
                          checked={formData.drugTestRequired}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Drug test required
                        </span>
                      </label>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label
                        htmlFor="additionalRequirements"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Additional Requirements/Notes
                      </label>
                      <textarea
                        id="additionalRequirements"
                        name="additionalRequirements"
                        value={formData.additionalRequirements}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Any additional requirements or notes for candidates..."
                      />
                    </div>
                  </div>
                </div>

                {/* Application Instructions */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Application Instructions
                  </h4>
                  <div>
                    <label
                      htmlFor="applicationInstructions"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Special Application Instructions
                    </label>
                    <textarea
                      id="applicationInstructions"
                      name="applicationInstructions"
                      value={formData.applicationInstructions}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Any special instructions for applicants (e.g., portfolio requirements, cover letter topics, etc.)..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating..." : "Update Job"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
