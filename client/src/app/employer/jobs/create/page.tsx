"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCreateJob } from "@/lib/queries";
import { toast } from "sonner";

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

export default function CreateJobPage() {
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
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedGeneralRequirements, setSelectedGeneralRequirements] = useState<string[]>([]);
  const router = useRouter();

  // Skills data for bubble selection
  const availableSkills = [
    'Problem Solving',
    'Attention to Detail',
    'Logic & Reasoning',
    'Ethical',
    'Authentic',
    'Assertiveness',
    'Conscientiousness',
    'Emotional Intelligence',
    'Emotional Stability',
    'Optimism',
    'Persistence',
    'Sales Potential',
    'Service Orientation',
    'Teamwork'
  ];

  const generalRequirements = [
    'Problem Solving',
    'Attention to Detail',
    'Logic & Reasoning',
    'Ethical',
    'Authentic',
    'Assertiveness',
    'Conscientiousness',
    'Emotional Intelligence',
    'Emotional Stability',
    'Optimism',
    'Persistence',
    'Sales Potential',
    'Service Orientation',
    'Teamwork'
  ];

  // Bubble selector component for skills
  const BubbleSelector = ({ 
    options, 
    selected, 
    onChange, 
    placeholder = "Select items" 
  }: {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
  }) => {
    const toggleSelection = (item: string) => {
      if (selected.includes(item)) {
        onChange(selected.filter(skill => skill !== item));
      } else {
        onChange([...selected, item]);
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {options.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleSelection(item)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selected.includes(item)
                  ? 'bg-blue-600 text-white border-2 border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Selected:</p>
            <div className="flex flex-wrap gap-1">
              {selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => toggleSelection(item)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sync selected skills with form data
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: selectedSkills.join(', ')
    }));
  }, [selectedSkills]);

  // Sync selected general requirements with form data
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      additionalRequirements: selectedGeneralRequirements.join(', ')
    }));
  }, [selectedGeneralRequirements]);

  // Use TanStack Query mutation
  const createJobMutation = useCreateJob();

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
        officeRequirement: formData.officeRequirement,
        officeDetails: formData.officeDetails,
        remoteWorkDays: formData.remoteWorkDays,
        remoteWorkPreferredDays: formData.remoteWorkPreferredDays,
        payStructureType: formData.payStructureType,
        hourlyPay: formData.hourlyPay,
        payDays: formData.payDays,
        employeeBenefits: formData.employeeBenefits,
        freeParking: formData.freeParking,
        roleType: formData.roleType,
        qualifications: formData.qualifications,
        startDate: formData.startDate
          ? new Date(formData.startDate)
          : undefined,
        additionalRequirements: formData.additionalRequirements,
      };

      await createJobMutation.mutateAsync(jobData);
      toast.success("Licensed candidate job search created successfully!");
      router.push("/employer/jobs");
    } catch (error: any) {
      console.error("Error creating job:", error);
      setError(error?.message || "Failed to create job search");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Licensed Candidate Job Search
              </h1>
              <p className="mt-1 text-gray-600">
                Post a comprehensive job search request for licensed insurance
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

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 space-y-8"
          >
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
                    talent into the insurance industry. As such, we will always
                    aim to put forward licensed individuals to Agent Owners.
                    Service Provider will assist with getting promising
                    candidates licensed in Property & Casualty, however,
                    training may be needed by Client.
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
                      label: "Previous insurance experience, but not with SF**",
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
                        checked={formData.candidateType.includes(option.value)}
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

                  {(formData.workSchedule === "part_time" ||
                    formData.workSchedule === "full_time") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        If PT, what days would you want the employee to work? *
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
                  Office & Remote Work Requirements
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="officeRequirement"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Is there a requirement to work in the office? *
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
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {formData.officeRequirement === "yes" && (
                    <div>
                      <label
                        htmlFor="officeDetails"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        If 'yes', please provide details to how often employee
                        is required in the office: *
                      </label>
                      <textarea
                        id="officeDetails"
                        name="officeDetails"
                        value={formData.officeDetails}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe office requirements..."
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="remoteWorkDays"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        If you are willing to have the employee work remotely or
                        from home some days of the week, please advise:
                        <br />
                        How many days per week?
                      </label>
                      <input
                        type="text"
                        id="remoteWorkDays"
                        name="remoteWorkDays"
                        value={formData.remoteWorkDays}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 2-3 days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Which days would you prefer?
                      </label>
                      <div className="space-y-2">
                        {daysOfWeek.map((day) => (
                          <label
                            key={day.value}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={formData.remoteWorkPreferredDays.includes(
                                day.value
                              )}
                              onChange={(e) =>
                                handleDayToggle(
                                  "remoteWorkPreferredDays",
                                  day.value
                                )
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
                  </div>
                </div>
              </div>

              {/* Pay Structure */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  Pay Structure
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="payStructureType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      What is the pay structure? For example, is the role paid
                      hourly? *
                    </label>
                    <select
                      id="payStructureType"
                      name="payStructureType"
                      value={formData.payStructureType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select pay structure</option>
                      <option value="hourly">Hourly</option>
                      <option value="yearly">Yearly</option>
                      <option value="commission">Commission</option>
                      <option value="base_plus_commission">
                        Base + Commission
                      </option>
                    </select>
                  </div>

                  {formData.payStructureType === "hourly" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="hourlyPay"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          If so, what is the hourly pay? *
                        </label>
                        <input
                          type="text"
                          id="hourlyPay"
                          name="hourlyPay"
                          value={formData.hourlyPay}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., $18-22/hour"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="payDays"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          When are the pay days? *
                        </label>
                        <input
                          type="text"
                          id="payDays"
                          name="payDays"
                          value={formData.payDays}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Bi-weekly, 1st and 15th"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are the benefits the employee will receive? For example:
                  *
                </label>
                <div className="bg-blue-50 p-3 rounded mb-3">
                  <p className="text-sm text-gray-600 mb-1">• Paid time off</p>
                  <p className="text-sm text-gray-600 mb-1">• 401k</p>
                  <p className="text-sm text-gray-600 mb-1">
                    • Medical insurance
                  </p>
                  <p className="text-sm text-gray-600">
                    • Please list anything else
                  </p>
                </div>
                <textarea
                  name="employeeBenefits"
                  value={formData.employeeBenefits.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("employeeBenefits", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="List all benefits (comma-separated)"
                  required
                />
              </div>

              {/* Additional Requirements */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="freeParking"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Is there free parking for employees? *
                  </label>
                  <select
                    id="freeParking"
                    name="freeParking"
                    value={formData.freeParking}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select parking availability</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="paid_parking">Paid parking available</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="roleType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Will the role be a service-only role, sales-only role, or a
                    mix of both? *
                  </label>
                  <select
                    id="roleType"
                    name="roleType"
                    value={formData.roleType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select role type</option>
                    <option value="service_only">Service-only role</option>
                    <option value="sales_only">Sales-only role</option>
                    <option value="mixed">Mix of both</option>
                  </select>
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What qualifications are required by the employee? For example:
                  *
                </label>
                <div className="bg-blue-50 p-3 rounded mb-3">
                  <p className="text-sm text-gray-600 mb-1">• P&C</p>
                  <p className="text-sm text-gray-600 mb-1">• L&H</p>
                  <p className="text-sm text-gray-600">
                    • Please list if anything else
                  </p>
                </div>
                <textarea
                  name="qualifications"
                  value={formData.qualifications.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("qualifications", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="List required qualifications (comma-separated)"
                  required
                />
              </div>

              {/* Start Date */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  What is the desired start date? *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  If you have any additional recruitment requirements, please
                  list them here:
                </label>
                <textarea
                  name="additionalRequirements"
                  value={formData.additionalRequirements}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter any additional requirements here..."
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Basic Job Information
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
                    placeholder="e.g., Licensed Insurance Agent"
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
                    placeholder="e.g., Insurance, Sales"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., +1 (555) 123-4567"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Candidates will use this number to contact you directly
                    about this job
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Job Location - Zip Code *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 90210"
                      maxLength={5}
                      pattern="\d{5}"
                      required
                    />
                    {locationLoading && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      </div>
                    )}
                  </div>
                  {locationError && (
                    <p className="text-red-600 text-sm mt-1">{locationError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a 5-digit US zip code. City and state will be
                    auto-populated.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Auto-populated from zip code"
                    readOnly
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Auto-populated from zip code"
                    readOnly
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Auto-populated: City, State"
                    readOnly
                    required
                  />
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
                Pay Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="salaryMin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Minimum
                  </label>
                  <input
                    type="number"
                    id="salaryMin"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="40000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="salaryMax"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Maximum
                  </label>
                  <input
                    type="number"
                    id="salaryMax"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="60000"
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
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Job Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Additional Job Details
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
                  placeholder="Describe the role, responsibilities, and what you're looking for in a licensed insurance professional..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Required Skills
                </label>
                <BubbleSelector
                  options={availableSkills}
                  selected={selectedSkills}
                  onChange={setSelectedSkills}
                  placeholder="Select required skills"
                />
              </div>

              <div>
                <label
                  htmlFor="requirements"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  General Requirements
                </label>
                <BubbleSelector
                  options={generalRequirements}
                  selected={selectedGeneralRequirements}
                  onChange={setSelectedGeneralRequirements}
                  placeholder="Select general requirements"
                />
              </div>

              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Years of Experience Required
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No specific requirement</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-8">5-8 years</option>
                  <option value="8-12">8-12 years</option>
                  <option value="12+">12+ years</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="benefits"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Additional Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  id="benefits"
                  name="benefits"
                  value={benefitsInput}
                  onChange={(e) => setBenefitsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Performance bonuses, Professional development, Company car"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple benefits with commas
                </p>
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
                {createJobMutation.isPending
                  ? "Creating..."
                  : "Create a New Job"}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
