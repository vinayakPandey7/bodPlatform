"use client";
import { useState, useEffect } from "react";
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
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Upload as UploadIcon,
  LinkedIn as LinkedInIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import api from "@/lib/api";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/PhoneNumberInput";

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
  currentCompany: string;
  currentPosition: string;
  noticePeriod: string;
  linkedIn: string;
  portfolio: string;
  notes: string;
  resume: File | null;
  attachments: File[];
}

interface CandidateModalProps {
  open: boolean;
  onClose: () => void;
  candidate?: any; // For editing existing candidate
  onSuccess: () => void;
}

export default function CandidateModal({
  open,
  onClose,
  candidate,
  onSuccess,
}: CandidateModalProps) {
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
  const [resumeFileName, setResumeFileName] = useState("");
  const [linkedInLoading, setLinkedInLoading] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  // Reset form when modal opens/closes or candidate changes
  useEffect(() => {
    if (open) {
      if (candidate) {
        // Edit mode - populate with existing data
        // Extract skills from objects if they are objects
        let skillsArray = [];
        if (candidate.skills && Array.isArray(candidate.skills)) {
          skillsArray = candidate.skills.map((skill:any) => {
            if (typeof skill === "string") return skill;
            if (typeof skill === "object" && skill.name) return skill.name;
            return String(skill);
          });
        }

        // Extract experience description from objects
        let experienceText = "";
        if (candidate.experience) {
          if (typeof candidate.experience === "string") {
            experienceText = candidate.experience;
          } else if (Array.isArray(candidate.experience) && candidate.experience.length > 0) {
            // Get description from first experience entry
            experienceText = candidate.experience[0].description || "";
          } else if (typeof candidate.experience === "object" && candidate.experience.description) {
            experienceText = candidate.experience.description;
          }
        }

        // Extract education degree from objects
        let educationText = "";
        if (candidate.education) {
          if (typeof candidate.education === "string") {
            educationText = candidate.education;
          } else if (Array.isArray(candidate.education) && candidate.education.length > 0) {
            // Get degree from first education entry
            educationText = candidate.education[0].degree || "";
          } else if (typeof candidate.education === "object" && candidate.education.degree) {
            educationText = candidate.education.degree;
          }
        }

        setFormData({
          name: candidate.name || "",
          email: candidate.email || "",
          phone: candidate.phone || "",
          skills: skillsArray,
          experience: experienceText,
          education: educationText,
          zipcode: candidate.zipCode || candidate.zipcode || "",
          address: candidate.address || "",
          city: candidate.city || "",
          state: candidate.state || "",
          expectedSalary: candidate.expectedSalary || "",
          currentCompany: candidate.currentCompany || "",
          currentPosition: candidate.currentPosition || "",
          noticePeriod: candidate.noticePeriod || "",
          linkedIn: candidate.linkedIn || "",
          portfolio: candidate.portfolio || "",
          notes: candidate.notes || "",
          resume: null,
          attachments: [],
        });
        setResumeFileName(candidate.resume ? "Existing resume" : "");
        setAttachmentFiles([]);
      } else {
        // Add mode - reset form
        setFormData({
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
          currentCompany: "",
          currentPosition: "",
          noticePeriod: "",
          linkedIn: "",
          portfolio: "",
          notes: "",
          resume: null,
          attachments: [],
        });
        setResumeFileName("");
        setAttachmentFiles([]);
      }
      setError("");
    }
  }, [open, candidate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle zipcode validation and auto-population
    if (name === "zipcode") {
      setError("");

      if (value && !/^\d{5}$/.test(value)) {
        setError("Zipcode must be 5 digits");
        return;
      }

      if (value.length === 5) {
        handleZipcodeLookup(value);
      } else {
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
        }));
      }
    }
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
        currentPosition: "Position not available - Please update manually",
        currentCompany: "Company not available - Please update manually",
        experience: "Experience details not available - Please update manually",
        skills: [], // Empty skills array to be filled manually
        education: "Education details not available - Please update manually",
      };

      setFormData((prev) => ({
        ...prev,
        name: placeholderData.name,
        currentPosition: placeholderData.currentPosition,
        currentCompany: placeholderData.currentCompany,
        experience: placeholderData.experience,
        skills: placeholderData.skills,
        education: placeholderData.education,
      }));

      toast.success(
        `LinkedIn URL processed! Extracted name: "${nameFromUsername}". Please verify and complete the remaining information manually.`
      );
      toast.info(
        "Note: Full LinkedIn integration requires LinkedIn API access. Currently showing placeholder data."
      );
    } catch (error) {
      console.error("LinkedIn import error:", error);
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
      currentPosition: "",
      currentCompany: "",
      experience: "",
      skills: [],
      education: "",
    }));
    toast.info("LinkedIn data cleared");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "resume" && formData.resume) {
          formDataToSend.append("resume", formData.resume);
        } else if (key === "attachments") {
          // Handle multiple attachments
          if (Array.isArray(formData.attachments)) {
            formData.attachments.forEach((file, index) => {
              formDataToSend.append(`attachment_${index}`, file);
            });
          }
        } else if (key === "skills") {
          formDataToSend.append("skills", JSON.stringify(formData.skills));
        } else if (key !== "resume" && key !== "attachments") {
          formDataToSend.append(key, (formData as any)[key]);
        }
      });

      if (candidate) {
        // Edit existing candidate
        await api.put(
          `/recruitment-partner/candidates/${candidate._id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Candidate updated successfully!");
      } else {
        // Add new candidate
        await api.post("/recruitment-partner/candidates", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Candidate added successfully!");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving candidate:", error);
      setError(error.response?.data?.message || "Failed to save candidate");
    } finally {
      setLoading(false);
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
          <Typography variant="h6" component="div">
            {candidate ? "Edit Candidate" : "Add New Candidate"}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "grid", gap: 3 }}>
            {/* LinkedIn Import Section */}
            {/* <Box
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
                LinkedIn Import (Optional)
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <TextField
                  label="LinkedIn URL"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
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
                  onClick={handleLinkedInImport}
                  disabled={!formData.linkedIn || linkedInLoading}
                  variant="outlined"
                  size="small"
                  startIcon={
                    linkedInLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <LinkedInIcon />
                    )
                  }
                  sx={{ minWidth: "auto", px: 2 }}
                >
                  {linkedInLoading ? "Importing..." : "Import"}
                </Button>
                <Button
                  onClick={clearLinkedInData}
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  sx={{ minWidth: "auto", px: 2 }}
                >
                  Clear
                </Button>
              </Box>
            </Box> */}

            {/* Basic Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
              Basic Information
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
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
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                  },
                }}
              />
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <PhoneNumberInput
                label="Phone *"
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                required
              />
              <TextField
                label="Portfolio URL"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
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

            {/* Resume and Documents Upload */}
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
                Resume and Documents Upload * (Select multiple files - up to 5)
              </Typography>
              <Typography
                variant="caption"
                sx={{ mb: 2, color: "#6b7280", display: "block" }}
              >
                You can select multiple files at once (resume, cover letter, certificates, etc.)
              </Typography>
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                onChange={handleResumeUpload}
                style={{ display: "none" }}
              />
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Button
                  component="label"
                  htmlFor="resume-upload"
                  variant="outlined"
                  size="small"
                  startIcon={<UploadIcon />}
                  disabled={attachmentFiles.length >= 5}
                  sx={{ minWidth: "auto", px: 2 }}
                >
                  {attachmentFiles.length >= 5 
                    ? "Maximum 5 files uploaded" 
                    : attachmentFiles.length === 0 
                      ? "Upload Resume & Documents (Up to 5 files)"
                      : `Upload More Files (${attachmentFiles.length}/5)`
                  }
                </Button>
              </Box>
              {attachmentFiles.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                  {attachmentFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => removeAttachment(index)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Professional Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
              Professional Information
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="Current Position"
                name="currentPosition"
                value={formData.currentPosition}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
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
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                  },
                }}
              />
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="Years of Experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g., 5 years"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                  },
                }}
              />
              <TextField
                label="Expected Salary"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g., $80,000"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                  },
                }}
              />
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="Notice Period"
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g., 2 weeks"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                  },
                }}
              />
              <TextField
                label="Education"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g., Bachelor's in Computer Science"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "16px",
                  },
                }}
              />
            </Box>

            <TextField
              label="Skills (comma-separated)"
              name="skills"
              value={formData.skills.join(", ")}
              onChange={handleSkillsChange}
              fullWidth
              variant="outlined"
              size="small"
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
              Location Information
            </Typography>

            <TextField
              label="Zipcode *"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleInputChange}
              required
              fullWidth
              variant="outlined"
              size="small"
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
                },
              }}
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Auto-populated from zipcode"
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
              <TextField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Auto-populated from zipcode"
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

            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Street address"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "white",
                  fontSize: "16px",
                },
              }}
            />

            {/* Additional Notes */}
            <TextField
              label="Additional Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              size="small"
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            {loading
              ? "Saving..."
              : candidate
              ? "Update Candidate"
              : "Add Candidate"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
