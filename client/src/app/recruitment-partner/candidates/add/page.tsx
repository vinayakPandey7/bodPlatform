"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
} from "@mui/material";

interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  location: string;
  expectedSalary: string;
  currentCompany: string;
  currentPosition: string;
  noticePeriod: string;
  linkedIn: string;
  portfolio: string;
  notes: string;
}

export default function AddCandidatePage() {
  const [formData, setFormData] = useState<CandidateFormData>({
    name: "",
    email: "",
    phone: "",
    skills: [],
    experience: "",
    education: "",
    location: "",
    expectedSalary: "",
    currentCompany: "",
    currentPosition: "",
    noticePeriod: "",
    linkedIn: "",
    portfolio: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/recruitment-partner/candidates", formData);
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

              <TextField
                label="Phone *"
                name="phone"
                type="tel"
                value={formData.phone}
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
                label="Location *"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="City, State/Country"
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

              <TextField
                label="Expected Salary"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="e.g., $50,000 - $70,000"
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
                  <MenuItem value="More than 3 months">More than 3 months</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="LinkedIn Profile"
                name="linkedIn"
                type="url"
                value={formData.linkedIn}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="https://linkedin.com/in/username"
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
