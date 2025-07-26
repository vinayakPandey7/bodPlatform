"use client";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  Upload as UploadIcon,
  LinkedIn as LinkedInIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import api from "@/lib/api";
import { toast } from "sonner";

interface CandidateSubmissionData {
  name: string;
  email: string;
  phone: string;
  currentPosition: string;
  currentCompany: string;
  experience: string;
  education: string;
  skills: string[];
  expectedSalary: string;
  zipcode: string;
  address: string;
  city: string;
  state: string;
  linkedIn: string;
  portfolio: string;
  resume: File | null;
  coverLetter: string;
  availability: string;
  noticePeriod: string;
  notes: string;
}

interface SubmitCandidateModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  onSuccess: () => void;
}

// Validation schema
const CandidateSubmissionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number")
    .required("Phone number is required"),
  currentPosition: Yup.string()
    .min(2, "Current position must be at least 2 characters")
    .max(100, "Current position must be less than 100 characters")
    .required("Current position is required"),
  currentCompany: Yup.string()
    .min(2, "Current company must be at least 2 characters")
    .max(100, "Current company must be less than 100 characters")
    .required("Current company is required"),
  experience: Yup.string()
    .required("Experience is required"),
  education: Yup.string()
    .required("Education is required"),
  skills: Yup.array()
    .min(1, "At least one skill is required")
    .required("Skills are required"),
  expectedSalary: Yup.string()
    .required("Expected salary is required"),
  zipcode: Yup.string()
    .matches(/^\d{5}$/, "Zipcode must be 5 digits")
    .required("Zipcode is required"),
  address: Yup.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters")
    .required("Address is required"),
  city: Yup.string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters")
    .required("City is required"),
  state: Yup.string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be less than 50 characters")
    .required("State is required"),
  linkedIn: Yup.string()
    .url("Invalid LinkedIn URL")
    .required("LinkedIn URL is required"),
  portfolio: Yup.string()
    .url("Invalid portfolio URL"),
  resume: Yup.mixed()
    .required("Resume is required"),
  coverLetter: Yup.string()
    .min(50, "Cover letter must be at least 50 characters")
    .max(2000, "Cover letter must be less than 2000 characters")
    .required("Cover letter is required"),
  availability: Yup.string()
    .required("Availability is required"),
  noticePeriod: Yup.string()
    .required("Notice period is required"),
  notes: Yup.string()
    .max(500, "Notes must be less than 500 characters"),
});

// Availability options
const availabilityOptions = [
  "Immediate",
  "1 week",
  "2 weeks",
  "1 month",
  "2 months",
  "3 months",
  "Flexible"
];

// Notice period options
const noticePeriodOptions = [
  "No notice required",
  "1 week",
  "2 weeks",
  "1 month",
  "2 months",
  "3 months"
];

export default function SubmitCandidateModal({
  open,
  onClose,
  jobId,
  jobTitle,
  companyName,
  onSuccess,
}: SubmitCandidateModalProps) {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const [linkedInLoading, setLinkedInLoading] = useState(false);

  // Initial values
  const getInitialValues = (): CandidateSubmissionData => {
    return {
      name: "",
      email: "",
      phone: "",
      currentPosition: "",
      currentCompany: "",
      experience: "",
      education: "",
      skills: [],
      expectedSalary: "",
      zipcode: "",
      address: "",
      city: "",
      state: "",
      linkedIn: "",
      portfolio: "",
      resume: null,
      coverLetter: "",
      availability: "",
      noticePeriod: "",
      notes: "",
    };
  };

  // Handle zipcode lookup
  const handleZipcodeLookup = async (zipcode: string, setFieldValue: (field: string, value: any) => void) => {
    if (!zipcode || zipcode.length !== 5) {
      return;
    }

    setLocationLoading(true);
    try {
      const response = await fetch(`/api/location/validate?zipCode=${zipcode}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setFieldValue("city", data.city);
        setFieldValue("state", data.state);
      }
    } catch (error) {
      console.error("Zipcode validation error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle resume upload
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("resume", file);
      setResumeFileName(file.name);
    }
  };

  // Handle LinkedIn import
  const handleLinkedInImport = async (setFieldValue: (field: string, value: any) => void) => {
    setLinkedInLoading(true);
    try {
      // Simulate LinkedIn data import (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Mock data - replace with actual LinkedIn API integration
      const mockLinkedInData = {
        name: "John Doe",
        currentPosition: "Senior Developer",
        currentCompany: "Tech Corp",
        experience: "5+ years in software development",
        skills: ["React", "Node.js", "TypeScript", "Python"],
        education: "Bachelor's in Computer Science",
      };

      setFieldValue("name", mockLinkedInData.name);
      setFieldValue("currentPosition", mockLinkedInData.currentPosition);
      setFieldValue("currentCompany", mockLinkedInData.currentCompany);
      setFieldValue("experience", mockLinkedInData.experience);
      setFieldValue("skills", mockLinkedInData.skills);
      setFieldValue("education", mockLinkedInData.education);

      toast.success("LinkedIn data imported successfully!");
    } catch (error) {
      console.error("LinkedIn import error:", error);
      toast.error("Failed to import LinkedIn data");
    } finally {
      setLinkedInLoading(false);
    }
  };

  // Clear LinkedIn data
  const clearLinkedInData = (setFieldValue: (field: string, value: any) => void) => {
    setFieldValue("name", "");
    setFieldValue("currentPosition", "");
    setFieldValue("currentCompany", "");
    setFieldValue("experience", "");
    setFieldValue("skills", []);
    setFieldValue("education", "");
    toast.info("LinkedIn data cleared");
  };

  const handleSubmit = async (values: CandidateSubmissionData, { setSubmitting, resetForm }: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(values).forEach((key) => {
        if (key === "resume" && values.resume) {
          formData.append("resume", values.resume);
        } else if (key === "skills") {
          formData.append("skills", JSON.stringify(values.skills));
        } else if (key !== "resume") {
          formData.append(key, (values as any)[key]);
        }
      });

      // Add job information
      formData.append("jobId", jobId);
      formData.append("jobTitle", jobTitle);
      formData.append("companyName", companyName);

      await api.post("/recruitment-partner/submit-candidate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Candidate submitted successfully!");
      onSuccess();
      onClose();
      resetForm();
      setResumeFileName("");
    } catch (error: any) {
      console.error("Error submitting candidate:", error);
      toast.error(error.response?.data?.message || "Failed to submit candidate");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon sx={{ color: "#3b82f6" }} />
            <Box>
              <Typography variant="h6" component="div">
                Submit Candidate
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {jobTitle} at {companyName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={CandidateSubmissionSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent sx={{ pt: 0 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* LinkedIn Import Section */}
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#374151" }}>
                    LinkedIn Import (Optional)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <TextField
                      label="LinkedIn URL"
                      name="linkedIn"
                      value={values.linkedIn}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder="https://linkedin.com/in/username"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "white",
                          fontSize: "14px",
                        },
                      }}
                    />
                    <Button
                      onClick={() => handleLinkedInImport(setFieldValue)}
                      disabled={!values.linkedIn || linkedInLoading}
                      variant="outlined"
                      size="small"
                      startIcon={linkedInLoading ? <CircularProgress size={16} /> : <LinkedInIcon />}
                      sx={{ minWidth: "auto", px: 2 }}
                    >
                      {linkedInLoading ? "Importing..." : "Import"}
                    </Button>
                    <Button
                      onClick={() => clearLinkedInData(setFieldValue)}
                      variant="outlined"
                      size="small"
                      startIcon={<ClearIcon />}
                      sx={{ minWidth: "auto", px: 2 }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Box>

                {/* Basic Information */}
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
                  Basic Information
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="name"
                    label="Full Name *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: "#9ca3af" }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="email"
                    label="Email *"
                    type="email"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: "#9ca3af" }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="phone"
                    label="Phone *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: "#9ca3af" }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="portfolio"
                    label="Portfolio URL"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.portfolio && Boolean(errors.portfolio)}
                    helperText={touched.portfolio && errors.portfolio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="https://portfolio.com"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                {/* Professional Information */}
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151", mt: 2 }}>
                  Professional Information
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="currentPosition"
                    label="Current Position *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.currentPosition && Boolean(errors.currentPosition)}
                    helperText={touched.currentPosition && errors.currentPosition}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: <WorkIcon sx={{ mr: 1, color: "#9ca3af" }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="currentCompany"
                    label="Current Company *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.currentCompany && Boolean(errors.currentCompany)}
                    helperText={touched.currentCompany && errors.currentCompany}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="experience"
                    label="Years of Experience *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.experience && Boolean(errors.experience)}
                    helperText={touched.experience && errors.experience}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., 5 years"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="expectedSalary"
                    label="Expected Salary *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.expectedSalary && Boolean(errors.expectedSalary)}
                    helperText={touched.expectedSalary && errors.expectedSalary}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., $80,000"
                    InputProps={{
                      startAdornment: <MoneyIcon sx={{ mr: 1, color: "#9ca3af" }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                <Field
                  as={TextField}
                  name="education"
                  label="Education *"
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={touched.education && Boolean(errors.education)}
                  helperText={touched.education && errors.education}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Bachelor's in Computer Science"
                  InputProps={{
                    startAdornment: <SchoolIcon sx={{ mr: 1, color: "#9ca3af" }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontSize: "16px",
                    },
                  }}
                />

                <Field
                  as={TextField}
                  name="skills"
                  label="Skills (comma-separated) *"
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={touched.skills && Boolean(errors.skills)}
                  helperText={touched.skills && errors.skills}
                  value={values.skills.join(", ")}
                  onChange={(e: any) => {
                    const skills = e.target.value
                      .split(",")
                      .map((skill: string) => skill.trim())
                      .filter((skill: string) => skill);
                    setFieldValue("skills", skills);
                  }}
                  onBlur={handleBlur}
                  placeholder="e.g., React, Node.js, TypeScript"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontSize: "16px",
                    },
                  }}
                />

                {/* Location Information */}
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151", mt: 2 }}>
                  Location Information
                </Typography>

                <Field
                  as={TextField}
                  name="zipcode"
                  label="Zipcode *"
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={touched.zipcode && Boolean(errors.zipcode)}
                  helperText={touched.zipcode && errors.zipcode}
                  onChange={(e: any) => {
                    handleChange(e);
                    if (e.target.value.length === 5) {
                      handleZipcodeLookup(e.target.value, setFieldValue);
                    }
                  }}
                  onBlur={handleBlur}
                  inputProps={{
                    maxLength: 5,
                    pattern: "\\d{5}",
                  }}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: "#9ca3af" }} />,
                    endAdornment: locationLoading && <CircularProgress size={16} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontSize: "16px",
                    },
                  }}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="address"
                    label="Address *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="city"
                    label="City *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.city && Boolean(errors.city)}
                    helperText={touched.city && errors.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="state"
                    label="State *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.state && Boolean(errors.state)}
                    helperText={touched.state && errors.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                {/* Availability Information */}
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151", mt: 2 }}>
                  Availability Information
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl fullWidth size="small" error={touched.availability && Boolean(errors.availability)}>
                    <InputLabel>Availability *</InputLabel>
                    <Field
                      as={Select}
                      name="availability"
                      label="Availability *"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      }}
                    >
                      {availabilityOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.availability && errors.availability && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                        {errors.availability}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl fullWidth size="small" error={touched.noticePeriod && Boolean(errors.noticePeriod)}>
                    <InputLabel>Notice Period *</InputLabel>
                    <Field
                      as={Select}
                      name="noticePeriod"
                      label="Notice Period *"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      }}
                    >
                      {noticePeriodOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.noticePeriod && errors.noticePeriod && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                        {errors.noticePeriod}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* Resume Upload */}
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#374151" }}>
                    Resume Upload *
                  </Typography>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleResumeUpload(e, setFieldValue)}
                    style={{ display: "none" }}
                  />
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Button
                      component="label"
                      htmlFor="resume-upload"
                      variant="outlined"
                      size="small"
                      startIcon={<UploadIcon />}
                      sx={{ minWidth: "auto", px: 2 }}
                    >
                      Upload Resume
                    </Button>
                    {resumeFileName && (
                      <Chip
                        label={resumeFileName}
                        onDelete={() => {
                          setFieldValue("resume", null);
                          setResumeFileName("");
                        }}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {touched.resume && errors.resume && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                      {errors.resume}
                    </Typography>
                  )}
                </Box>

                {/* Cover Letter */}
                <Field
                  as={TextField}
                  name="coverLetter"
                  label="Cover Letter *"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={touched.coverLetter && Boolean(errors.coverLetter)}
                  helperText={touched.coverLetter && errors.coverLetter}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Explain why this candidate is a great fit for this position..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontSize: "16px",
                    },
                  }}
                />

                {/* Additional Notes */}
                <Field
                  as={TextField}
                  name="notes"
                  label="Additional Notes"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={touched.notes && Boolean(errors.notes)}
                  helperText={touched.notes && errors.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Any additional information about the candidate..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontSize: "16px",
                    },
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || isSubmitting}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                sx={{
                  bgcolor: "#3b82f6",
                  "&:hover": { bgcolor: "#2563eb" },
                }}
              >
                {loading ? "Submitting..." : "Submit Candidate"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
} 