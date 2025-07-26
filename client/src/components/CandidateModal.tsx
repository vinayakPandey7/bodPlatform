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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const [linkedInLoading, setLinkedInLoading] = useState(false);

  // Reset form when modal opens/closes or candidate changes
  useEffect(() => {
    if (open) {
      if (candidate) {
        // Edit mode - populate with existing data
        setFormData({
          name: candidate.name || "",
          email: candidate.email || "",
          phone: candidate.phone || "",
          skills: candidate.skills || [],
          experience: candidate.experience || "",
          education: candidate.education || "",
          zipcode: candidate.zipcode || "",
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
        });
        setResumeFileName(candidate.resume ? "Existing resume" : "");
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
        });
        setResumeFileName("");
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
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
      setResumeFileName(file.name);
    }
  };

  const handleLinkedInImport = async () => {
    if (!formData.linkedIn) {
      toast.error("Please enter a LinkedIn URL first");
      return;
    }

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

      setFormData((prev) => ({
        ...prev,
        name: mockLinkedInData.name,
        currentPosition: mockLinkedInData.currentPosition,
        currentCompany: mockLinkedInData.currentCompany,
        experience: mockLinkedInData.experience,
        skills: mockLinkedInData.skills,
        education: mockLinkedInData.education,
      }));

      toast.success("LinkedIn data imported successfully!");
    } catch (error) {
      console.error("LinkedIn import error:", error);
      toast.error("Failed to import LinkedIn data");
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
        } else if (key === "skills") {
          formDataToSend.append("skills", JSON.stringify(formData.skills));
        } else if (key !== "resume") {
          formDataToSend.append(key, (formData as any)[key]);
        }
      });

      if (candidate) {
        // Edit existing candidate
        await api.put(`/recruitment-partner/candidates/${candidate._id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
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
            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#374151" }}>
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
                  startIcon={linkedInLoading ? <CircularProgress size={16} /> : <LinkedInIcon />}
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
            </Box>

            {/* Basic Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
              Basic Information
            </Typography>
            
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Phone *"
                name="phone"
                value={formData.phone}
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

            {/* Resume Upload */}
            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#374151" }}>
                Resume Upload
              </Typography>
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
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
                  sx={{ minWidth: "auto", px: 2 }}
                >
                  Upload Resume
                </Button>
                {resumeFileName && (
                  <Chip
                    label={resumeFileName}
                    onDelete={() => {
                      setFormData((prev) => ({ ...prev, resume: null }));
                      setResumeFileName("");
                    }}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            {/* Professional Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
              Professional Information
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
              helperText={error && error.includes("zipcode") ? error : "Enter a 5-digit US zipcode. City and state will be auto-populated."}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "white",
                  fontSize: "16px",
                },
              }}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
            {loading ? "Saving..." : candidate ? "Update Candidate" : "Add Candidate"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 