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
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
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
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import api from "@/lib/api";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/PhoneNumberInput";

interface ExistingCandidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  skills?: (string | { name: string; [key: string]: any })[];
  experience?: string;
  createdAt?: string;
}

interface CandidateSubmissionData {
  // Mode selection
  submissionMode: "existing" | "new";
  selectedCandidateId?: string;

  // Existing form fields
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

// Enhanced validation schema that adapts based on submission mode
const CandidateSubmissionSchema = Yup.object().shape({
  submissionMode: Yup.string().oneOf(["existing", "new"]).required(),
  selectedCandidateId: Yup.string().when("submissionMode", {
    is: "existing",
    then: (schema) => schema.required("Please select a candidate"),
    otherwise: (schema) => schema.notRequired(),
  }),
  // For new candidates, require basic info
  name: Yup.string().when("submissionMode", {
    is: "new",
    then: (schema) => schema.required("Name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: Yup.string().when("submissionMode", {
    is: "new",
    then: (schema) =>
      schema.email("Invalid email").required("Email is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  // Resume is only required for new candidates
  resume: Yup.mixed().when("submissionMode", {
    is: "new",
    then: (schema) => schema.required("Resume is required for new candidates"),
    otherwise: (schema) => schema.notRequired(),
  }),
  // Common fields that are always required regardless of mode
  coverLetter: Yup.string().required("Cover letter is required"),
  availability: Yup.string().required("Availability is required"),
  noticePeriod: Yup.string().required("Notice period is required"),
  // Optional fields
  phone: Yup.string(),
  currentPosition: Yup.string(),
  currentCompany: Yup.string(),
  experience: Yup.string(),
  education: Yup.string(),
  skills: Yup.array(),
  expectedSalary: Yup.string(),
  zipcode: Yup.string(),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  linkedIn: Yup.string().url("Invalid LinkedIn URL"),
  portfolio: Yup.string().url("Invalid portfolio URL"),
  notes: Yup.string(),
});

// Availability options
const availabilityOptions = [
  "Immediate",
  "1 week",
  "2 weeks",
  "1 month",
  "2 months",
  "3 months",
  "Flexible",
];

// Notice period options
const noticePeriodOptions = [
  "No notice required",
  "1 week",
  "2 weeks",
  "1 month",
  "2 months",
  "3 months",
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
  const [existingCandidates, setExistingCandidates] = useState<
    ExistingCandidate[]
  >([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");

  // Fetch existing candidates when modal opens
  useEffect(() => {
    if (open) {
      fetchExistingCandidates();
    }
  }, [open]);

  const fetchExistingCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const response = await api.get("/recruitment-partner/candidates");
      setExistingCandidates(response.data.candidates || []);
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to fetch existing candidates");
      setExistingCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  // Filter candidates based on search
  const filteredCandidates = existingCandidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      candidate.email.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  // Initial values
  const getInitialValues = (): CandidateSubmissionData => {
    return {
      submissionMode: "new",
      selectedCandidateId: "",
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

  // Handle candidate selection and populate form with existing data
  const handleCandidateSelect = (
    candidate: ExistingCandidate,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue("selectedCandidateId", candidate._id);

    // Populate form with existing candidate data
    setFieldValue("name", candidate.name || "");
    setFieldValue("email", candidate.email || "");
    setFieldValue("phone", candidate.phone || "");
    if (candidate.city) setFieldValue("city", candidate.city);
    if (candidate.state) setFieldValue("state", candidate.state);
    if (candidate.zipCode) setFieldValue("zipcode", candidate.zipCode);
    if (candidate.skills && candidate.skills.length > 0) {
      // Convert skills to string array if they are objects
      const skillsArray = candidate.skills.map((skill) =>
        typeof skill === "string" ? skill : skill.name || String(skill)
      );
      setFieldValue("skills", skillsArray);
    }
    if (candidate.experience) setFieldValue("experience", candidate.experience);

    toast.success(`Selected ${candidate.name} for submission`);
  };

  // Check which fields are missing for an existing candidate
  const getMissingFields = (values: CandidateSubmissionData) => {
    const missing = [];

    if (!values.name) missing.push("Full Name");
    if (!values.email) missing.push("Email");
    if (!values.phone) missing.push("Phone");
    if (!values.currentPosition) missing.push("Current Position");
    if (!values.currentCompany) missing.push("Current Company");
    if (!values.experience) missing.push("Experience");
    if (!values.education) missing.push("Education");
    if (!values.skills || values.skills.length === 0) missing.push("Skills");
    if (!values.expectedSalary) missing.push("Expected Salary");
    if (!values.zipcode) missing.push("Zipcode");
    if (!values.address) missing.push("Address");
    if (!values.city) missing.push("City");
    if (!values.state) missing.push("State");

    return missing;
  };

  // Check if we should show additional fields for existing candidate
  const shouldShowAdditionalFields = (values: CandidateSubmissionData) => {
    if (values.submissionMode !== "existing" || !values.selectedCandidateId) {
      return false;
    }

    const missingFields = getMissingFields(values);
    return missingFields.length > 0;
  };

  // Handle zipcode lookup
  const handleZipcodeLookup = async (
    zipcode: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
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
  const handleResumeUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("resume", file);
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async (
    values: CandidateSubmissionData,
    { setSubmitting, resetForm }: any
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Handle submission based on mode
      if (values.submissionMode === "existing") {
        // For existing candidates, use their ID and basic info
        formData.append("candidateId", values.selectedCandidateId || "");
        formData.append("submissionType", "existing");
      } else {
        // For new candidates, include all form data
        formData.append("submissionType", "new");
        Object.keys(values).forEach((key) => {
          if (key === "resume" && values.resume) {
            formData.append("resume", values.resume);
          } else if (key === "skills") {
            formData.append("skills", JSON.stringify(values.skills));
          } else if (
            key !== "resume" &&
            key !== "submissionMode" &&
            key !== "selectedCandidateId"
          ) {
            formData.append(key, (values as any)[key]);
          }
        });
      }

      // Add common submission data
      formData.append("jobId", jobId);
      formData.append("jobTitle", jobTitle);
      formData.append("companyName", companyName);
      formData.append("coverLetter", values.coverLetter);
      formData.append("availability", values.availability);
      formData.append("noticePeriod", values.noticePeriod);
      formData.append("notes", values.notes);

      const response = await api.post(
        "/recruitment-partner/submit-candidate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Candidate submitted successfully!");
      onSuccess();
      onClose();
      resetForm();
      setResumeFileName("");
    } catch (error: any) {
      console.error("Error submitting candidate:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit candidate"
      );
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
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          isSubmitting,
        }) => {
          return (
            <Form>
              <DialogContent sx={{ pt: 0 }}>
                {/* Show validation guidance instead of errors */}
                {Object.keys(errors).length > 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Please Complete Required Information
                    </Typography>
                    <Typography variant="body2">
                      To submit this candidate, please fill in the following
                      mandatory details:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>
                        {Object.keys(errors)
                          .map((key) => {
                            switch (key) {
                              case "selectedCandidateId":
                                return "Select a candidate";
                              case "coverLetter":
                                return "Cover letter";
                              case "availability":
                                return "Availability";
                              case "noticePeriod":
                                return "Notice period";
                              case "resume":
                                return "Resume upload";
                              case "name":
                                return "Full name";
                              case "email":
                                return "Email address";
                              default:
                                return key
                                  .replace(/([A-Z])/g, " $1")
                                  .toLowerCase();
                            }
                          })
                          .join(", ")}
                      </strong>
                    </Typography>
                  </Alert>
                )}

                {/* Submission Mode Selection */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Choose Submission Method
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={values.submissionMode}
                      onChange={(e) => {
                        setFieldValue("submissionMode", e.target.value);
                        // Reset form when switching modes
                        if (e.target.value === "new") {
                          setFieldValue("selectedCandidateId", "");
                        }
                      }}
                    >
                      <FormControlLabel
                        value="existing"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PeopleIcon />
                            <span>Select Existing Candidate</span>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="new"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PersonAddIcon />
                            <span>Add New Candidate</span>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Existing Candidate Selection */}
                {values.submissionMode === "existing" && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Select Candidate
                    </Typography>

                    {/* Search Field */}
                    <TextField
                      placeholder="Search candidates by name or email..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    {/* Candidates List */}
                    <Card
                      variant="outlined"
                      sx={{ maxHeight: 300, overflow: "auto" }}
                    >
                      {candidatesLoading ? (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <CircularProgress size={24} />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Loading candidates...
                          </Typography>
                        </Box>
                      ) : filteredCandidates.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            {existingCandidates.length === 0
                              ? "No candidates found. Add candidates first or use 'Add New Candidate' option."
                              : "No candidates match your search."}
                          </Typography>
                        </Box>
                      ) : (
                        <List sx={{ p: 0 }}>
                          {filteredCandidates.map((candidate, index) => (
                            <ListItem key={candidate._id} disablePadding>
                              <ListItemButton
                                selected={
                                  values.selectedCandidateId === candidate._id
                                }
                                onClick={() =>
                                  handleCandidateSelect(
                                    candidate,
                                    setFieldValue
                                  )
                                }
                                sx={{
                                  "&.Mui-selected": {
                                    backgroundColor: "#e3f2fd",
                                    "&:hover": {
                                      backgroundColor: "#bbdefb",
                                    },
                                  },
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: "#1976d2" }}>
                                    {candidate.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={candidate.name}
                                  secondary={
                                    <span>
                                      <span
                                        style={{
                                          fontSize: "0.875rem",
                                          color: "#666",
                                          display: "block",
                                        }}
                                      >
                                        {candidate.email}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "0.875rem",
                                          color: "#666",
                                          display: "block",
                                        }}
                                      >
                                        {candidate.phone || "No phone"} •{" "}
                                        {candidate.city && candidate.state
                                          ? `${candidate.city}, ${candidate.state}`
                                          : "No location"}
                                      </span>
                                      {candidate.skills &&
                                        candidate.skills.length > 0 && (
                                          <Box sx={{ mt: 0.5 }}>
                                            {candidate.skills
                                              .slice(0, 3)
                                              .map((skill, skillIndex) => (
                                                <Chip
                                                  key={skillIndex}
                                                  label={
                                                    typeof skill === "string"
                                                      ? skill
                                                      : skill.name || skill
                                                  }
                                                  size="small"
                                                  variant="outlined"
                                                  sx={{
                                                    mr: 0.5,
                                                    mb: 0.5,
                                                    fontSize: "10px",
                                                    height: 20,
                                                  }}
                                                />
                                              ))}
                                            {candidate.skills.length > 3 && (
                                              <Chip
                                                label={`+${
                                                  candidate.skills.length - 3
                                                } more`}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                  mr: 0.5,
                                                  mb: 0.5,
                                                  fontSize: "10px",
                                                  height: 20,
                                                }}
                                              />
                                            )}
                                          </Box>
                                        )}
                                    </span>
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Card>

                    {/* Show validation error for candidate selection */}
                    {touched.selectedCandidateId &&
                      errors.selectedCandidateId && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: "block" }}
                        >
                          {errors.selectedCandidateId}
                        </Typography>
                      )}

                    {/* Show missing fields alert for existing candidate */}
                    {values.selectedCandidateId &&
                      shouldShowAdditionalFields(values) && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            Complete Missing Information
                          </Typography>
                          <Typography variant="body2">
                            Some required fields are missing for this candidate.
                            Please fill them below:
                            <br />
                            <strong>
                              {getMissingFields(values).join(", ")}
                            </strong>
                          </Typography>
                        </Alert>
                      )}
                  </Box>
                )}

                {/* Candidate Information Form - Show for new candidates OR existing candidates with missing fields */}
                {(values.submissionMode === "new" ||
                  (values.submissionMode === "existing" &&
                    shouldShowAdditionalFields(values))) && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {/* Header for the section */}
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#374151" }}
                    >
                      {values.submissionMode === "new"
                        ? "New Candidate Information"
                        : "Complete Missing Information"}
                    </Typography>

                    {/* Basic Information */}
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "#374151", mb: -2 }}
                    >
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
                        disabled={
                          values.submissionMode === "existing" && values.name
                        }
                        InputProps={{
                          startAdornment: (
                            <PersonIcon sx={{ mr: 1, color: "#9ca3af" }} />
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor:
                              values.submissionMode === "existing" &&
                              values.name
                                ? "#f8fafc"
                                : "white",
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
                        disabled={
                          values.submissionMode === "existing" && values.email
                        }
                        InputProps={{
                          startAdornment: (
                            <EmailIcon sx={{ mr: 1, color: "#9ca3af" }} />
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor:
                              values.submissionMode === "existing" &&
                              values.email
                                ? "#f8fafc"
                                : "white",
                            fontSize: "16px",
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <PhoneNumberInput
                        label="Phone"
                        value={values.phone}
                        onChange={(value) => setFieldValue("phone", value)}
                        error={touched.phone && Boolean(errors.phone)}
                        helperText={touched.phone && errors.phone ? errors.phone : undefined}
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
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "#374151", mt: 2, mb: -2 }}
                    >
                      Professional Information
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Field
                        as={TextField}
                        name="currentPosition"
                        label="Current Position"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={
                          touched.currentPosition &&
                          Boolean(errors.currentPosition)
                        }
                        helperText={
                          touched.currentPosition && errors.currentPosition
                        }
                        onChange={handleChange}
                        onBlur={handleBlur}
                        InputProps={{
                          startAdornment: (
                            <WorkIcon sx={{ mr: 1, color: "#9ca3af" }} />
                          ),
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
                        label="Current Company"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={
                          touched.currentCompany &&
                          Boolean(errors.currentCompany)
                        }
                        helperText={
                          touched.currentCompany && errors.currentCompany
                        }
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
                        label="Years of Experience"
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
                        label="Expected Salary"
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={
                          touched.expectedSalary &&
                          Boolean(errors.expectedSalary)
                        }
                        helperText={
                          touched.expectedSalary && errors.expectedSalary
                        }
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., $80,000"
                        InputProps={{
                          startAdornment: (
                            <MoneyIcon sx={{ mr: 1, color: "#9ca3af" }} />
                          ),
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
                      label="Education"
                      fullWidth
                      variant="outlined"
                      size="small"
                      error={touched.education && Boolean(errors.education)}
                      helperText={touched.education && errors.education}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., Bachelor's in Computer Science"
                      InputProps={{
                        startAdornment: (
                          <SchoolIcon sx={{ mr: 1, color: "#9ca3af" }} />
                        ),
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
                      label="Skills (comma-separated)"
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
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "#374151", mt: 2, mb: -2 }}
                    >
                      Location Information
                    </Typography>

                    <Field
                      as={TextField}
                      name="zipcode"
                      label="Zipcode"
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
                        startAdornment: (
                          <LocationIcon sx={{ mr: 1, color: "#9ca3af" }} />
                        ),
                        endAdornment: locationLoading && (
                          <CircularProgress size={16} />
                        ),
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
                        label="Address"
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
                        label="City"
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
                        label="State"
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

                    {/* Resume Upload for New Candidates */}
                    {values.submissionMode === "new" && (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 2, fontWeight: 600, color: "#374151" }}
                        >
                          Resume Upload
                        </Typography>
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleResumeUpload(e, setFieldValue)}
                          style={{ display: "none" }}
                        />
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
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
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, display: "block" }}
                          >
                            {errors.resume}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Common Fields for Both Modes */}
                <Box sx={{ mt: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#374151", mb: 3 }}
                  >
                    Submission Details
                  </Typography>

                  {/* Availability Information */}
                  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <FormControl
                      fullWidth
                      size="small"
                      error={
                        touched.availability && Boolean(errors.availability)
                      }
                    >
                      <InputLabel>Availability *</InputLabel>
                      <Field
                        as={Select}
                        name="availability"
                        value={values.availability}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Availability *"
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
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {errors.availability}
                        </Typography>
                      )}
                    </FormControl>

                    <FormControl
                      fullWidth
                      size="small"
                      error={
                        touched.noticePeriod && Boolean(errors.noticePeriod)
                      }
                    >
                      <InputLabel>Notice Period *</InputLabel>
                      <Field
                        as={Select}
                        name="noticePeriod"
                        value={values.noticePeriod}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Notice Period *"
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
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {errors.noticePeriod}
                        </Typography>
                      )}
                    </FormControl>
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
                      mb: 3,
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
          );
        }}
      </Formik>
    </Dialog>
  );
}
