"use client";

// @ts-nocheck

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Autocomplete,
  Divider,
  Card,
  CardContent,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  InputAdornment,
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Preview as PreviewIcon,
  Publish as PublishIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useCreateJob } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Loader";
import PhoneNumberInput from "@/components/PhoneNumberInput";

// Language options
const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Spanish",
  "Portuguese",
  "Mandarin",
  "Russian",
  "Tagalo",
];

// Employee Benefits options
const EMPLOYEE_BENEFITS_OPTIONS = [
  "Health Insurance",
  "Dental Insurance",
  "Vision Insurance",
  "401(k) Plan",
  "Retirement Plan",
  "Paid Time Off",
  "Sick Leave",
  "Vacation Days",
  "Flexible Schedule",
  "Remote Work Options",
  "Life Insurance",
  "Disability Insurance",
  "Tuition Reimbursement",
  "Professional Development",
  "Training Programs",
  "Employee Discounts",
  "Gym Membership",
  "Wellness Programs",
  "Commuter Benefits",
  "Stock Options",
  "Profit Sharing",
  "Bonus Programs",
  "Free Parking",
  "Lunch Provided",
  "Equipment Provided",
];

// Skills options
const SKILLS_OPTIONS = [
  "Communication",
  "Customer Service",
  "Sales",
  "Insurance Knowledge",
  "Risk Assessment",
  "Claims Processing",
  "Underwriting",
  "Policy Administration",
  "Financial Analysis",
  "Relationship Building",
  "Problem Solving",
  "Attention to Detail",
  "Time Management",
  "Microsoft Office",
  "CRM Software",
  "Data Entry",
  "Multi-tasking",
  "Team Collaboration",
  "Leadership",
  "Training",
];

// Qualifications options
const QUALIFICATIONS_OPTIONS = [
  "High School Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Insurance License (P&C)",
  "Insurance License (L&H)",
  "All Insurance Licenses",
  "State Farm Experience",
  "Previous Insurance Experience",
  "Banking Experience",
  "Sales Experience",
  "Customer Service Experience",
  "Bilingual Abilities",
  "Professional Certification",
  "Clean Driving Record",
  "Background Check",
  "Drug Test",
];

interface FormData {
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
  contactNumber: string;
  urgency: string;
  numberOfPositions: number;
  expires: string;
  languagePreference: string[];
  candidateType: string[];
  workSchedule: string;
  partTimeWorkDays: string[];
  officeRequirement: string;
  officeDetails: string;
  remoteWorkDays: string;
  remoteWorkPreferredDays: string[];
  payStructureType: string;
  hourlyPay: string;
  payDays: string;
  employeeBenefits: string[];
  freeParking: string;
  roleType: string;
  qualifications: string[];
  additionalRequirements: string[];
  serviceSalesFocus: string;
  licenseRequirement: string;
  otherLicenseRequirement: string;
  startDate: string;
  additionalInfo: string;
  recruitmentDuration: string;
  assessmentLink: string;
}

interface FormErrors {
  [key: string]: string;
}

interface JobTemplate {
  name: string;
  title: string;
  description: string;
  jobType: string;
  workMode: string;
  experience: string;
  skills: string[];
  licenseRequirement: string;
  salaryMin: string;
  salaryMax: string;
}

// Job templates for quick start
const JOB_TEMPLATES = [
  {
    name: "Insurance Agent",
    title: "Licensed Insurance Agent",
    description:
      "We are seeking a licensed insurance professional to join our growing team. The ideal candidate will have excellent communication skills and a passion for helping clients protect what matters most to them.",
    jobType: "full_time",
    workMode: "office",
    experience: "1-3",
    skills: [
      "Communication",
      "Customer Service",
      "Sales",
      "Insurance Knowledge",
    ],
    licenseRequirement: "P&C",
    salaryMin: "45000",
    salaryMax: "65000",
  },
  {
    name: "Customer Service Rep",
    title: "Customer Service Representative",
    description:
      "Join our customer service team and help provide exceptional support to our valued clients. Perfect for someone looking to start their career in insurance.",
    jobType: "full_time",
    workMode: "hybrid",
    experience: "0-1",
    skills: ["Communication", "Customer Service", "Problem Solving"],
    licenseRequirement: "Unlicensed Accepted",
    salaryMin: "35000",
    salaryMax: "45000",
  },
  {
    name: "Claims Specialist",
    title: "Claims Processing Specialist",
    description:
      "Process insurance claims with accuracy and efficiency while providing compassionate support to clients during difficult times.",
    jobType: "full_time",
    workMode: "office",
    experience: "1-3",
    skills: ["Claims Processing", "Attention to Detail", "Communication"],
    licenseRequirement: "P&C",
    salaryMin: "40000",
    salaryMax: "55000",
  },
];

const steps = [
  {
    label: "Job Basics",
    icon: <WorkIcon />,
    description: "Title, description, and job type",
  },
  {
    label: "Location & Pay",
    icon: <LocationIcon />,
    description: "Where and how much",
  },
  {
    label: "Requirements",
    icon: <PeopleIcon />,
    description: "Skills and qualifications",
  },
  {
    label: "Schedule & Benefits",
    icon: <ScheduleIcon />,
    description: "Work schedule and perks",
  },
  {
    label: "Review & Publish",
    icon: <PreviewIcon />,
    description: "Final review",
  },
];

export default function CreateJobPageEnhanced() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [showTemplates, setShowTemplates] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<FormData>({
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
    jobType: "",
    workMode: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    benefits: [],
    department: "",
    contactNumber: "",
    urgency: "normal",
    numberOfPositions: 1,
    expires: "",
    languagePreference: ["English"],
    // Enhanced fields
    candidateType: [],
    workSchedule: "",
    partTimeWorkDays: [],
    officeRequirement: "",
    officeDetails: "",
    remoteWorkDays: "",
    remoteWorkPreferredDays: [],
    payStructureType: "",
    hourlyPay: "",
    payDays: "",
    employeeBenefits: [],
    freeParking: "",
    roleType: "",
    qualifications: [],
    additionalRequirements: [],
    serviceSalesFocus: "",
    licenseRequirement: "",
    otherLicenseRequirement: "",
    startDate: "",
    additionalInfo: "",
    recruitmentDuration: "",
    assessmentLink: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [newRequirement, setNewRequirement] = useState("");
  const [newAdditionalRequirement, setNewAdditionalRequirement] = useState("");

  const createJobMutation = useCreateJob();

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[] | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const applyTemplate = (template: JobTemplate) => {
    setFormData((prev) => ({
      ...prev,
      ...template,
    }));
    setShowTemplates(false);
    setActiveStep(0);
  };

  const addRequirement = () => {
    if (
      newRequirement.trim() &&
      !formData.requirements.includes(newRequirement.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req !== requirement),
    }));
  };

  const addAdditionalRequirement = () => {
    if (
      newAdditionalRequirement.trim() &&
      !formData.additionalRequirements.includes(newAdditionalRequirement.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        additionalRequirements: [
          ...prev.additionalRequirements,
          newAdditionalRequirement.trim(),
        ],
      }));
      setNewAdditionalRequirement("");
    }
  };

  const removeAdditionalRequirement = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalRequirements: prev.additionalRequirements.filter(
        (req) => req !== requirement
      ),
    }));
  };

  const validateStep = (stepIndex: number) => {
    const newErrors: FormErrors = {};

    switch (stepIndex) {
      case 0: // Job Basics
        if (!formData.title.trim()) newErrors.title = "Job title is required";
        if (!formData.description.trim())
          newErrors.description = "Job description is required";
        if (!formData.jobType) newErrors.jobType = "Job type is required";
        if (!formData.workMode) newErrors.workMode = "Work mode is required";
        break;

      case 1: // Location & Pay
        if (!formData.location.trim())
          newErrors.location = "Location is required";
        if (!formData.zipCode.trim())
          newErrors.zipCode = "Zip code is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.contactNumber.trim())
          newErrors.contactNumber = "Contact number is required";
        if (
          formData.salaryMin &&
          formData.salaryMax &&
          Number(formData.salaryMin) > Number(formData.salaryMax)
        ) {
          newErrors.salaryMax =
            "Maximum salary must be greater than minimum salary";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setCompletedSteps((prev) => new Set([...prev, activeStep]));
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= activeStep || completedSteps.has(stepIndex)) {
      setActiveStep(stepIndex);
    }
  };

  const getProgressPercentage = () => {
    return ((activeStep + 1) / steps.length) * 100;
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim())
      newErrors.description = "Job description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.jobType) newErrors.jobType = "Job type is required";
    if (!formData.workMode) newErrors.workMode = "Work mode is required";
    if (!formData.contactNumber.trim())
      newErrors.contactNumber = "Contact number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const jobData = {
      ...formData,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
      numberOfPositions: Number(formData.numberOfPositions),
      expires: formData.expires ? new Date(formData.expires) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
    };

    try {
      await createJobMutation.mutateAsync(jobData);
      router.push("/employer/jobs");
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  const renderTemplateSelection = () => (
    <Card
      sx={{
        mb: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Start with a template or create from scratch
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Save time by starting with one of our pre-built job templates, or
          create your own from scratch.
        </Typography>

        <Grid container spacing={2}>
          {JOB_TEMPLATES.map((template, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => applyTemplate(template)}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      color: theme.palette.primary.main,
                      fontWeight: "bold",
                    }}
                  >
                    {template.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, color: "text.secondary" }}
                  >
                    {template.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {template.description.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={template.jobType.replace("_", " ")}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip label={template.workMode} size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3, bgcolor: "rgba(255,255,255,0.2)" }} />

        <Button
          variant="outlined"
          size="large"
          onClick={() => setShowTemplates(false)}
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": {
              borderColor: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Start from scratch
        </Button>
      </CardContent>
    </Card>
  );

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return renderJobBasics();
      case 1:
        return renderLocationAndPay();
      case 2:
        return renderRequirements();
      case 3:
        return renderScheduleAndBenefits();
      case 4:
        return renderReviewAndPublish();
      default:
        return null;
    }
  };

  const renderJobBasics = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <WorkIcon color="primary" />
          Job Basics
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Title *"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              error={!!errors.title}
              helperText={
                errors.title ||
                "Be specific and clear. Examples: 'Licensed Insurance Agent', 'Customer Service Representative'"
              }
              placeholder="e.g. Licensed Insurance Agent"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Description *"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={!!errors.description}
              helperText={
                errors.description ||
                "Describe the role, responsibilities, and what makes this opportunity great. Be detailed but concise."
              }
              multiline
              rows={6}
              placeholder="Describe the role, responsibilities, company culture, and what makes this opportunity great..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.jobType}>
              <InputLabel>Job Type *</InputLabel>
              <Select
                value={formData.jobType}
                onChange={(e) => handleInputChange("jobType", e.target.value)}
                label="Job Type *"
              >
                <MenuItem value="full_time">Full Time</MenuItem>
                <MenuItem value="part_time">Part Time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="freelance">Freelance</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
              </Select>
              {errors.jobType && (
                <FormHelperText>{errors.jobType}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.workMode}>
              <InputLabel>Work Mode *</InputLabel>
              <Select
                value={formData.workMode}
                onChange={(e) => handleInputChange("workMode", e.target.value)}
                label="Work Mode *"
              >
                <MenuItem value="office">On-site</MenuItem>
                <MenuItem value="remote">Remote</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </Select>
              {errors.workMode && (
                <FormHelperText>{errors.workMode}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={formData.experience}
                onChange={(e) =>
                  handleInputChange("experience", e.target.value)
                }
                label="Experience Level"
              >
                <MenuItem value="">Any Experience</MenuItem>
                <MenuItem value="0-1">Entry Level (0-1 years)</MenuItem>
                <MenuItem value="1-3">Junior (1-3 years)</MenuItem>
                <MenuItem value="3-5">Mid-Level (3-5 years)</MenuItem>
                <MenuItem value="5-8">Senior (5-8 years)</MenuItem>
                <MenuItem value="8-12">Expert (8-12 years)</MenuItem>
                <MenuItem value="12+">Executive (12+ years)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              placeholder="e.g. Sales, Customer Service, Claims"
              helperText="Which department will this role be part of?"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Number of Positions"
              type="number"
              value={formData.numberOfPositions}
              onChange={(e) =>
                handleInputChange("numberOfPositions", e.target.value)
              }
              inputProps={{ min: 1 }}
              helperText="How many people are you looking to hire for this role?"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Urgency Level</InputLabel>
              <Select
                value={formData.urgency}
                onChange={(e) => handleInputChange("urgency", e.target.value)}
                label="Urgency Level"
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="very_urgent">Very Urgent</MenuItem>
              </Select>
              <FormHelperText>
                How quickly do you need to fill this position?
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderLocationAndPay = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <LocationIcon color="primary" />
          Location & Compensation
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Address *"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              error={!!errors.location}
              helperText={
                errors.location ||
                "Enter the complete address where employees will work"
              }
              placeholder="e.g. 123 Main Street, Suite 100"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City *"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              error={!!errors.city}
              helperText={errors.city}
              placeholder="e.g. Chicago"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="State *"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              error={!!errors.state}
              helperText={errors.state}
              placeholder="e.g. Illinois"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Zip Code *"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              error={!!errors.zipCode}
              helperText={errors.zipCode}
              placeholder="e.g. 60601"
            />
          </Grid>

          <Grid item xs={12}>
            <PhoneNumberInput
              label="Contact Phone Number *"
              value={formData.contactNumber}
              onChange={(value) => handleInputChange("contactNumber", value)}
              error={!!errors.contactNumber}
              helperText={
                errors.contactNumber ||
                "Phone number where candidates can reach you"
              }
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <MoneyIcon color="primary" />
              Compensation
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Salary"
              type="number"
              value={formData.salaryMin}
              onChange={(e) => handleInputChange("salaryMin", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              helperText="Annual salary minimum"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Maximum Salary"
              type="number"
              value={formData.salaryMax}
              onChange={(e) => handleInputChange("salaryMax", e.target.value)}
              error={!!errors.salaryMax}
              helperText={errors.salaryMax || "Annual salary maximum"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Pay Structure</InputLabel>
              <Select
                value={formData.payStructureType}
                onChange={(e) =>
                  handleInputChange("payStructureType", e.target.value)
                }
                label="Pay Structure"
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="salary">Salary</MenuItem>
                <MenuItem value="commission">Commission</MenuItem>
                <MenuItem value="base_plus_commission">
                  Base + Commission
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                label="Currency"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="CAD">CAD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderRequirements = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <PeopleIcon color="primary" />
          Requirements & Qualifications
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>License Requirement</InputLabel>
              <Select
                value={formData.licenseRequirement}
                onChange={(e) =>
                  handleInputChange("licenseRequirement", e.target.value)
                }
                label="License Requirement"
              >
                <MenuItem value="">No License Required</MenuItem>
                <MenuItem value="P&C">Property & Casualty License</MenuItem>
                <MenuItem value="L&H">Life & Health License</MenuItem>
                <MenuItem value="All License">All Insurance Licenses</MenuItem>
                <MenuItem value="Unlicensed Accepted">
                  Unlicensed Accepted
                </MenuItem>
                <MenuItem value="Other">Other License</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.licenseRequirement === "Other" && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Other License Requirement"
                value={formData.otherLicenseRequirement}
                onChange={(e) =>
                  handleInputChange("otherLicenseRequirement", e.target.value)
                }
                placeholder="Specify the required license"
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={SKILLS_OPTIONS}
              value={formData.skills}
              onChange={(event, newValue) =>
                handleInputChange("skills", newValue)
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Required Skills"
                  placeholder="Select skills"
                  helperText="Choose the key skills needed for this role"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={QUALIFICATIONS_OPTIONS}
              value={formData.qualifications}
              onChange={(event, newValue) =>
                handleInputChange("qualifications", newValue)
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Education & Qualifications"
                  placeholder="Select qualifications"
                  helperText="Choose required education and certifications"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Job Requirements
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add a requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="e.g. 2+ years of customer service experience"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={addRequirement}
                  disabled={!newRequirement.trim()}
                  sx={{ minWidth: "auto", px: 2 }}
                >
                  <AddIcon />
                </Button>
              </Box>
              {formData.requirements.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.requirements.map((requirement, index) => (
                    <Chip
                      key={index}
                      label={requirement}
                      onDelete={() => removeRequirement(requirement)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderScheduleAndBenefits = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <ScheduleIcon color="primary" />
          Schedule & Benefits
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Work Schedule</InputLabel>
              <Select
                value={formData.workSchedule}
                onChange={(e) =>
                  handleInputChange("workSchedule", e.target.value)
                }
                label="Work Schedule"
              >
                <MenuItem value="full_time">Full Time</MenuItem>
                <MenuItem value="part_time">Part Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Role Focus</InputLabel>
              <Select
                value={formData.roleType}
                onChange={(e) => handleInputChange("roleType", e.target.value)}
                label="Role Focus"
              >
                <MenuItem value="service_only">Service Only</MenuItem>
                <MenuItem value="sales_only">Sales Only</MenuItem>
                <MenuItem value="mixed">Service & Sales</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="When would you like the candidate to start?"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Application Deadline"
              type="date"
              value={formData.expires}
              onChange={(e) => handleInputChange("expires", e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="When do applications close?"
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={EMPLOYEE_BENEFITS_OPTIONS}
              value={formData.employeeBenefits}
              onChange={(event, newValue) =>
                handleInputChange("employeeBenefits", newValue)
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee Benefits"
                  placeholder="Select benefits"
                  helperText="Choose the benefits offered with this position"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={LANGUAGE_OPTIONS}
              value={formData.languagePreference}
              onChange={(event, newValue) =>
                handleInputChange("languagePreference", newValue)
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Language Preferences"
                  placeholder="Select languages"
                  helperText="Which languages should candidates be able to speak?"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Information"
              value={formData.additionalInfo}
              onChange={(e) =>
                handleInputChange("additionalInfo", e.target.value)
              }
              multiline
              rows={3}
              placeholder="Any additional information about the role, company culture, or application process..."
              helperText="Share any other relevant details about this opportunity"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderReviewAndPublish = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <PreviewIcon color="primary" />
          Review Your Job Posting
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Review your job posting carefully before publishing. You can edit it
            later if needed.
          </Alert>

          <Button
            variant="outlined"
            onClick={() => setShowPreview(true)}
            sx={{ mb: 2 }}
            startIcon={<PreviewIcon />}
          >
            Preview Job Posting
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                  Job Overview
                </Typography>
                <Typography>
                  <strong>Title:</strong> {formData.title || "Not specified"}
                </Typography>
                <Typography>
                  <strong>Type:</strong>{" "}
                  {formData.jobType?.replace("_", " ") || "Not specified"}
                </Typography>
                <Typography>
                  <strong>Mode:</strong> {formData.workMode || "Not specified"}
                </Typography>
                <Typography>
                  <strong>Experience:</strong>{" "}
                  {formData.experience || "Any level"}
                </Typography>
                <Typography>
                  <strong>Department:</strong>{" "}
                  {formData.department || "Not specified"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                  Location & Pay
                </Typography>
                <Typography>
                  <strong>Location:</strong>{" "}
                  {formData.city && formData.state
                    ? `${formData.city}, ${formData.state}`
                    : "Not specified"}
                </Typography>
                <Typography>
                  <strong>Zip Code:</strong>{" "}
                  {formData.zipCode || "Not specified"}
                </Typography>
                <Typography>
                  <strong>Salary:</strong>{" "}
                  {formData.salaryMin && formData.salaryMax
                    ? `$${formData.salaryMin} - $${formData.salaryMax}`
                    : "Not specified"}
                </Typography>
                <Typography>
                  <strong>Contact:</strong>{" "}
                  {formData.contactNumber || "Not specified"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                  Requirements Summary
                </Typography>
                <Typography>
                  <strong>License:</strong>{" "}
                  {formData.licenseRequirement || "None required"}
                </Typography>
                <Typography>
                  <strong>Skills:</strong>{" "}
                  {formData.skills.length > 0
                    ? formData.skills.join(", ")
                    : "None specified"}
                </Typography>
                <Typography>
                  <strong>Benefits:</strong>{" "}
                  {formData.employeeBenefits.length > 0
                    ? formData.employeeBenefits.length + " benefits selected"
                    : "None specified"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderJobPreview = () => (
    <Dialog
      open={showPreview}
      onClose={() => setShowPreview(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Job Preview
        <IconButton onClick={() => setShowPreview(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
              {formData.title || "Job Title"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {formData.jobType && (
                <Chip
                  label={formData.jobType.replace("_", " ")}
                  color="primary"
                />
              )}
              {formData.workMode && <Chip label={formData.workMode} />}
              {formData.experience && (
                <Chip label={`${formData.experience} years`} />
              )}
              {formData.urgency === "urgent" && (
                <Chip label="Urgent" color="warning" />
              )}
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>
              About this role
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
              {formData.description || "Job description will appear here..."}
            </Typography>

            {formData.requirements.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Requirements
                </Typography>
                <ul>
                  {formData.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </>
            )}

            {formData.skills.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Required Skills
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                  {formData.skills.map((skill, index) => (
                    <Chip key={index} label={skill} variant="outlined" />
                  ))}
                </Box>
              </>
            )}

            {formData.employeeBenefits.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Benefits
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                  {formData.employeeBenefits.map((benefit, index) => (
                    <Chip
                      key={index}
                      label={benefit}
                      color="success"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowPreview(false)}>Close</Button>
        <Button
          onClick={() => setShowPreview(false)}
          variant="contained"
          startIcon={<EditIcon />}
        >
          Continue Editing
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (showTemplates) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ ml: 2, fontWeight: "bold" }}>
            Create a New Job Posting
          </Typography>
        </Box>
        {renderTemplateSelection()}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 2, fontWeight: "bold" }}>
          Create a New Job Posting
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={getProgressPercentage()}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
          Step {activeStep + 1} of {steps.length} -{" "}
          {steps[activeStep]?.description}
        </Typography>
      </Box>

      {/* Step Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step
                key={step.label}
                completed={completedSteps.has(index)}
                sx={{
                  cursor:
                    index <= activeStep || completedSteps.has(index)
                      ? "pointer"
                      : "default",
                }}
              >
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  icon={
                    completedSteps.has(index) ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      step.icon
                    )
                  }
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {renderStepContent(activeStep)}

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
          >
            Back
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            {activeStep === steps.length - 1 ? (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createJobMutation.isPending}
                  startIcon={
                    createJobMutation.isPending ? (
                      <Spinner size="w-5 h-5" />
                    ) : (
                      <PublishIcon />
                    )
                  }
                  size="large"
                >
                  {createJobMutation.isPending
                    ? "Publishing..."
                    : "Publish Job"}
                </Button>
              </>
            ) : (
              <Button onClick={handleNext} variant="contained" size="large">
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>

      {renderJobPreview()}

      {createJobMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to create job. Please try again.
        </Alert>
      )}
    </Container>
  );
}
