"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import {
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
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Upload as UploadIcon,
  LinkedIn as LinkedInIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  zipcode: string;
  address: string;
  city: string;
  state: string;
  expectedSalary: string;
  salaryType: string;
  currentCompany: string;
  currentPosition: string;
  noticePeriod: string;
  linkedIn: string;
  portfolio: string;
  notes: string;
  resume: File | null;
  attachments: File[];
}

interface LocationData {
  city: string;
  state: string;
  country: string;
}

export default function AddCandidatePage() {
  const [formData, setFormData] = useState<CandidateFormData>({
    name: "",
    email: "",
    phone: "",
    skills: [],
    experience: "",
    education: "",
    zipcode: "",
    address: "",
    city: "",
    state: "",
    expectedSalary: "",
    salaryType: "yearly",
    currentCompany: "",
    currentPosition: "",
    noticePeriod: "",
    linkedIn: "",
    portfolio: "",
    notes: "",
    resume: null,
    attachments: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [linkedInLoading, setLinkedInLoading] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle zipcode validation and auto-population (following signup form pattern)
    if (name === "zipcode") {
      // Clear previous location error
      setError("");

      // Validate zipcode format (5 digits)
      if (value && !/^\d{5}$/.test(value)) {
        setError("Zipcode must be 5 digits");
        return;
      }

      // Auto-populate city and state if valid zipcode
      if (value.length === 5) {
        handleZipcodeLookup(value);
      } else {
        // Clear city/state if zipcode is incomplete
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
        }));
      }
    }
  };

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Allow only numbers and decimal point for salary
    const numericValue = value.replace(/[^0-9.]/g, '');
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    setFormData((prev) => ({
      ...prev,
      skills,
    }));
  };

  const handleZipcodeLookup = async (zipcode: string) => {
    if (!zipcode || zipcode.length !== 5) {
      setError("");
      return;
    }

    setLocationLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/location/validate?zipCode=${zipcode}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setFormData((prev) => ({
          ...prev,
          city: data.city,
          state: data.state,
        }));
        setError("");
      } else {
        setError(data.message || "Invalid zipcode");
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
        }));
      }
    } catch (error) {
      console.error("Zipcode validation error:", error);
      setError("Unable to validate zipcode");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newAttachments = [...attachmentFiles, ...files].slice(0, 5); // Limit to 5 files
      setAttachmentFiles(newAttachments);
      setFormData((prev) => ({
        ...prev,
        attachments: newAttachments,
        resume: newAttachments[0] || null, // Set first file as resume for backward compatibility
      }));
    }
  };


  const removeAttachment = (index: number) => {
    const newAttachments = attachmentFiles.filter((_, i) => i !== index);
    setAttachmentFiles(newAttachments);
    setFormData((prev) => ({
      ...prev,
      attachments: newAttachments,
      resume: newAttachments[0] || null, // Update resume to first file or null
    }));
  };

  const handleLinkedInImport = async () => {
    if (!formData.linkedIn) {
      toast.error("Please enter a LinkedIn URL first");
      return;
    }

    setLinkedInLoading(true);
    try {
      // Validate LinkedIn URL format
      const linkedInUrlPattern =
        /^https?:\/\/(www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-]+)\/?(\?.*)?$/;
      const match = formData.linkedIn.match(linkedInUrlPattern);

      if (!match) {
        throw new Error(
          "Invalid LinkedIn URL format. Please use a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)"
        );
      }

      const username = match[2];

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Extract name from username (basic parsing)
      const nameFromUsername = username
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .replace(/\d+/g, "") // Remove numbers
        .trim();

      // Create placeholder data based on the LinkedIn URL
      const placeholderData = {
        name: nameFromUsername || "LinkedIn User",
        currentCompany: "Company not available - Please update manually",
        currentPosition: "Position not available - Please update manually",
        skills: [], // Empty skills array to be filled manually
        experience: "Experience details not available - Please update manually",
        education: "Education details not available - Please update manually",
      };

      setFormData((prev) => ({
        ...prev,
        name: placeholderData.name,
        currentCompany: placeholderData.currentCompany,
        currentPosition: placeholderData.currentPosition,
        skills: placeholderData.skills,
        experience: placeholderData.experience,
        education: placeholderData.education,
      }));

      toast.success(
        `LinkedIn URL processed! Extracted name: "${nameFromUsername}". Please verify and complete the remaining information manually.`
      );
      toast.info(
        "Note: Full LinkedIn integration requires LinkedIn API access. Currently showing placeholder data."
      );
    } catch (error) {
      console.error("Error importing LinkedIn data:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process LinkedIn URL"
      );
    } finally {
      setLinkedInLoading(false);
    }
  };

  const clearLinkedInData = () => {
    setFormData((prev) => ({
      ...prev,
      name: "",
      currentCompany: "",
      currentPosition: "",
      skills: [],
      experience: "",
      education: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "skills") {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === "resume" && value) {
          formDataToSend.append(key, value);
        } else if (key === "attachments") {
          // Handle multiple attachments
          if (Array.isArray(value)) {
            value.forEach((file, index) => {
              formDataToSend.append(`attachment_${index}`, file);
            });
          }
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      await api.post("/recruitment-partner/candidates", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/recruitment-partner/candidates");
    } catch (error: any) {
      console.error("Error adding candidate:", error);
      setError(error.response?.data?.message || "Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["recruitment_partner"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Candidate
              </h1>
              <p className="mt-1 text-gray-600">
                Add a new candidate to your talent pool
              </p>
            </div>
            <Button
              onClick={() => router.back()}
              variant="outlined"
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Back
            </Button>
          </div>

          {error && (
            <Alert severity="error" className="rounded">
              {error}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 space-y-6"
          >
            {/* LinkedIn Import Section */}
            {/* <Box className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Typography variant="h6" className="text-blue-800 mb-3">
                <LinkedInIcon className="mr-2" />
                LinkedIn Import (Optional)
              </Typography>
              <div className="flex gap-2 items-center">
                <TextField
                  label="LinkedIn Profile URL"
                  name="linkedIn"
                  type="url"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  onClick={handleLinkedInImport}
                  disabled={!formData.linkedIn || linkedInLoading}
                  variant="contained"
                  size="small"
                  startIcon={<SearchIcon />}
                  sx={{ backgroundColor: "#0077b5" }}
                >
                  {linkedInLoading ? "Importing..." : "Import"}
                </Button>
                <IconButton
                  onClick={clearLinkedInData}
                  size="small"
                  color="error"
                >
                  <ClearIcon />
                </IconButton>
              </div>
              <Typography
                variant="caption"
                className="text-blue-600 mt-2 block"
              >
                Import basic information from LinkedIn profile to auto-fill the
                form
              </Typography>
            </Box> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <PhoneNumberInput
                label="Phone *"
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                required
              />

              {/* Resume and Documents Upload */}
              <Box className="flex flex-col gap-2">
                <Typography
                  variant="body2"
                  className="text-gray-700 font-medium"
                >
                  Resume and Documents Upload * (Select multiple files - up to 5)
                </Typography>
                <Typography
                  variant="caption"
                  className="text-gray-500"
                >
                  You can select multiple files at once (resume, cover letter, certificates, etc.)
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    fullWidth
                    disabled={attachmentFiles.length >= 5}
                    sx={{
                      borderColor: "#e2e8f0",
                      color: "#64748b",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    {attachmentFiles.length >= 5 
                      ? "Maximum 5 files uploaded" 
                      : attachmentFiles.length === 0 
                        ? "Upload Resume & Documents (Up to 5 files)"
                        : `Upload More Files (${attachmentFiles.length}/5)`
                    }
                  </Button>
                </label>
                {attachmentFiles.length > 0 && (
                  <Box className="flex flex-wrap gap-1 mt-2">
                    {attachmentFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => removeAttachment(index)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </Box>


              {/* Zipcode with auto-lookup */}
              <TextField
                label="Zipcode *"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="e.g., 90210"
                inputProps={{
                  maxLength: 5,
                  pattern: "\\d{5}",
                }}
                error={!!error && error.includes("zipcode")}
                helperText={
                  error && error.includes("zipcode")
                    ? error
                    : "Enter a 5-digit US zipcode. City and state will be auto-populated."
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="Address *"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="Street address"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="Auto-populated from zipcode"
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="Auto-populated from zipcode"
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <FormControl fullWidth size="medium">
                <InputLabel
                  required
                  sx={{ fontSize: "16px", fontWeight: 500, color: "#64748b" }}
                >
                  Years of Experience *
                </InputLabel>
                <Select
                  name="experience"
                  value={formData.experience}
                  onChange={handleSelectChange}
                  label="Years of Experience *"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="">Select experience</MenuItem>
                  <MenuItem value="0-1">0-1 years</MenuItem>
                  <MenuItem value="1-3">1-3 years</MenuItem>
                  <MenuItem value="3-5">3-5 years</MenuItem>
                  <MenuItem value="5-8">5-8 years</MenuItem>
                  <MenuItem value="8-12">8-12 years</MenuItem>
                  <MenuItem value="12+">12+ years</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel
                  sx={{ fontSize: "16px", fontWeight: 500, color: "#64748b" }}
                >
                  Salary Type
                </InputLabel>
                <Select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleSelectChange}
                  label="Salary Type"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Expected Salary"
                name="expectedSalary"
                type="text"
                value={formData.expectedSalary}
                onChange={handleNumberInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                placeholder={formData.salaryType === "hourly" ? "e.g., 25" : "e.g., 50000"}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.salaryType === "hourly" ? "/hour" : "/year"}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="Current Company"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="Current Position"
                name="currentPosition"
                value={formData.currentPosition}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <FormControl fullWidth size="medium">
                <InputLabel
                  sx={{ fontSize: "16px", fontWeight: 500, color: "#64748b" }}
                >
                  Notice Period
                </InputLabel>
                <Select
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleSelectChange}
                  label="Notice Period"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                    },
                  }}
                >
                  <MenuItem value="">Select notice period</MenuItem>
                  <MenuItem value="Immediate">Immediate</MenuItem>
                  <MenuItem value="15 days">15 days</MenuItem>
                  <MenuItem value="1 month">1 month</MenuItem>
                  <MenuItem value="2 months">2 months</MenuItem>
                  <MenuItem value="3 months">3 months</MenuItem>
                  <MenuItem value="More than 3 months">
                    More than 3 months
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Portfolio/Website"
                name="portfolio"
                type="url"
                value={formData.portfolio}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="https://portfolio.com"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <TextField
                label="Skills (comma-separated) *"
                name="skills"
                value={formData.skills.join(", ")}
                onChange={handleSkillsChange}
                required
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="e.g., JavaScript, React, Node.js, Python"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="Education *"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                size="medium"
                multiline
                rows={3}
                placeholder="e.g., Bachelor's in Computer Science from XYZ University (2020)"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />

              <TextField
                label="Additional Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                multiline
                rows={4}
                placeholder="Any additional information about the candidate..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#64748b",
                  },
                }}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outlined"
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
                sx={{
                  backgroundColor: "#4f46e5",
                  "&:hover": {
                    backgroundColor: "#4338ca",
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                {loading ? "Adding..." : "Add Candidate"}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
