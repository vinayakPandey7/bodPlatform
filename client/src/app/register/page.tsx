"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  MapPin,
  Globe,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Generic Input Component
interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  required,
  icon,
  endIcon,
  placeholder,
  disabled,
}) => {
  return (
    <div className="w-full">
      <TextField
        fullWidth
        name={name}
        label={label}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={touched && Boolean(error)}
        helperText={touched && error}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        variant="outlined"
        InputProps={{
          startAdornment: icon && (
            <InputAdornment position="start">{icon}</InputAdornment>
          ),
          endAdornment: endIcon && (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "white",
            "& fieldset": {
              borderColor: "#e2e8f0",
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: "#cbd5e1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3b82f6",
            },
            "&.Mui-error fieldset": {
              borderColor: "#ef4444",
            },
          },
          "& .MuiInputLabel-root": {
            fontWeight: 500,
            color: "#64748b",
            "&.Mui-focused": {
              color: "#3b82f6",
            },
            "&.Mui-error": {
              color: "#ef4444",
            },
          },
        }}
      />
    </div>
  );
};

// Generic Select Component
interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

const SelectInput: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required,
  children,
}) => {
  return (
    <div className="w-full">
      <FormControl fullWidth error={touched && Boolean(error)}>
        <InputLabel
          required={required}
          sx={{ fontWeight: 500, color: "#64748b" }}
        >
          {label}
        </InputLabel>
        <Select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          label={label}
          variant="outlined"
          sx={{
            borderRadius: "12px",
            backgroundColor: "white",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e2e8f0",
              borderWidth: "2px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#cbd5e1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#3b82f6",
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ef4444",
            },
          }}
        >
          {children}
        </Select>
        {touched && error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </div>
  );
};

// Validation schemas
const baseValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  role: Yup.string().required("Please select an account type"),
});

const employerValidationSchema = baseValidationSchema.shape({
  companyName: Yup.string().required("Company name is required"),
  ownerName: Yup.string().required("Owner name is required"),
  contactPersonTitle: Yup.string().required("Contact person title is required"),
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  website: Yup.string().url("Please enter a valid website URL"),
  industry: Yup.string().required("Please select an industry"),
  companySize: Yup.string().required("Please select company size"),
  address: Yup.string().required("Address is required"),
  city: Yup.string(),
  state: Yup.string(),
  zipCode: Yup.string()
    .matches(/^\d{5}$/, "ZIP code must be 5 digits")
    .required("ZIP code is required"),
});

const recruitmentPartnerValidationSchema = baseValidationSchema.shape({
  partnerCompanyName: Yup.string().required("Company name is required"),
  partnerContactPersonName: Yup.string().required(
    "Contact person name is required"
  ),
  partnerContactPersonTitle: Yup.string().required(
    "Contact person title is required"
  ),
  partnerPhone: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  partnerWebsite: Yup.string().url("Please enter a valid website URL"),
  partnerAddress: Yup.string().required("Address is required"),
  partnerCity: Yup.string().required("City is required"),
  partnerState: Yup.string().required("State is required"),
  partnerZipCode: Yup.string()
    .matches(/^\d{5}$/, "ZIP code must be 5 digits")
    .required("ZIP code is required"),
  yearsOfExperience: Yup.string().required("Years of experience is required"),
  specialization: Yup.string().required("Specialization is required"),
});

const candidateValidationSchema = baseValidationSchema.shape({
  candidateFirstName: Yup.string().required("First name is required"),
  candidateLastName: Yup.string().required("Last name is required"),
  candidatePhone: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  candidateAddress: Yup.string().required("Address is required"),
  candidateCity: Yup.string().required("City is required"),
  candidateState: Yup.string().required("State is required"),
  candidateZipCode: Yup.string()
    .matches(/^\d{5}$/, "ZIP code must be 5 digits")
    .required("ZIP code is required"),
});

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("type");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [currentRole, setCurrentRole] = useState(
    roleParam === "employer"
      ? "employer"
      : roleParam === "recruitment-partner"
      ? "recruitment_partner"
      : roleParam === "candidate"
      ? "candidate"
      : "candidate"
  );
  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
    role:
      roleParam === "employer"
        ? "employer"
        : roleParam === "recruitment-partner"
        ? "recruitment_partner"
        : roleParam === "candidate"
        ? "candidate"
        : "candidate",
    // Employer specific fields
    companyName: "",
    ownerName: "",
    contactPersonTitle: "",
    phoneNumber: "",
    website: "",
    industry: "",
    companySize: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    // Recruitment Partner specific fields
    partnerCompanyName: "",
    partnerContactPersonName: "",
    partnerContactPersonTitle: "",
    partnerPhone: "",
    partnerWebsite: "",
    partnerAddress: "",
    partnerCity: "",
    partnerState: "",
    partnerZipCode: "",
    partnerCountry: "United States",
    yearsOfExperience: "",
    specialization: "",
    // Candidate specific fields
    candidateFirstName: "",
    candidateLastName: "",
    candidatePhone: "",
    candidateAddress: "",
    candidateCity: "",
    candidateState: "",
    candidateZipCode: "",
    candidateCountry: "United States",
  };

  const getValidationSchema = (role: string) => {
    switch (role) {
      case "employer":
        return employerValidationSchema;
      case "recruitment_partner":
        return recruitmentPartnerValidationSchema;
      case "candidate":
        return candidateValidationSchema;
      default:
        return baseValidationSchema;
    }
  };

  // Request location access
  const requestLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const response = await fetch("/api/location/validate-coordinates", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ latitude: lat, longitude: lng }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
              setCoordinates({ lat, lng });
              setLocationDetected(true);
              setShowLocationModal(false);
              setError("");
            } else {
              setError(
                data.message ||
                  "Location detected outside the United States. Please enter your ZIP code manually."
              );
              setShowLocationModal(false);
            }
          } catch (err) {
            console.error("Error validating coordinates:", err);
            setError(
              "Error validating location. Please enter your ZIP code manually."
            );
            setShowLocationModal(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError(
            "Location access denied. Please enter your ZIP code manually."
          );
          setShowLocationModal(false);
        }
      );
    } else {
      setError(
        "Geolocation is not supported by this browser. Please enter your ZIP code manually."
      );
      setShowLocationModal(false);
    }
  };

  // Handle ZIP code change for auto-population
  const handleZipCodeChange = async (
    zipCode: string,
    setFieldValue: (field: string, value: any) => void,
    prefix: string = ""
  ) => {
    if (zipCode.length === 5 && /^\d{5}$/.test(zipCode)) {
      try {
        const response = await fetch("/api/location/lookup-zipcode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ zipCode }),
        });

        const data = await response.json();

        if (response.ok && data.city) {
          setFieldValue(`${prefix}city`, data.city);
          setFieldValue(`${prefix}state`, data.state || "");
          setFieldValue(`${prefix}country`, "United States");
          setError("");
        } else {
          setError("Invalid ZIP code. Please enter a valid US ZIP code.");
        }
      } catch (err) {
        console.error("Error looking up ZIP code:", err);
        setError(
          "Error looking up ZIP code. Please verify the ZIP code is correct."
        );
      }
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      const endpoint =
        values.role === "employer"
          ? "/api/auth/register/employer"
          : "/api/auth/register";

      const requestBody = {
        ...values,
        coordinates:
          coordinates.lat && coordinates.lng ? coordinates : undefined,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message || "Registration successful! Redirecting to login..."
        );
        // Increase timeout to make success message more visible
        setTimeout(() => {
          router.push("/login");
        }, 5000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "employer":
        return "Employer";
      case "recruitment_partner":
        return "Recruitment Partner";
      case "candidate":
        return "Job Seeker";
      default:
        return "Account";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "employer":
        return "from-blue-500 to-blue-600";
      case "recruitment_partner":
        return "from-green-500 to-green-600";
      case "candidate":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "employer":
        return <Building size={24} />;
      case "recruitment_partner":
        return <Building size={24} />;
      case "candidate":
        return <User size={24} />;
      default:
        return <User size={24} />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "employer":
        return "Set up your company account";
      case "recruitment_partner":
        return "Create your partnership profile";
      case "candidate":
        return "Build your job seeker profile";
      default:
        return "Create your account";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Logo className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Welcome to CIERO
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Create your account and unlock opportunities
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Sign in here
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <Formik
            initialValues={initialValues}
            validationSchema={getValidationSchema(currentRole)}
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
            }) => (
              <Form className="space-y-8">
                {error && (
                  <div className="max-w-2xl mx-auto">
                    <Alert severity="error" className="rounded-2xl">
                      {error}
                    </Alert>
                  </div>
                )}



                {/* Single Combined Form */}
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${getRoleColor(
                      values.role
                    )} p-6`}
                  >
                    <div className="flex items-center gap-4 text-white">
                      <div className="p-3 bg-white/20 rounded-xl">
                        {getRoleIcon(values.role)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {getRoleDisplayName(values.role)} Registration
                        </h2>
                        <p className="text-white/90">
                          {getRoleDescription(values.role)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Account Information Section */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <User size={20} className="text-slate-400" />
                          Account Information
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="lg:col-span-2">
                            <Input
                              label="Email Address"
                              name="email"
                              type="email"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.email}
                              touched={touched.email}
                              required
                              icon={
                                <Mail size={20} className="text-slate-400" />
                              }
                            />
                          </div>

                          <Input
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.password}
                            touched={touched.password}
                            required
                            icon={<Lock size={20} className="text-slate-400" />}
                            endIcon={
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <EyeOff size={20} />
                                ) : (
                                  <Eye size={20} />
                                )}
                              </IconButton>
                            }
                          />

                          <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.confirmPassword}
                            touched={touched.confirmPassword}
                            required
                            icon={<Lock size={20} className="text-slate-400" />}
                            endIcon={
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff size={20} />
                                ) : (
                                  <Eye size={20} />
                                )}
                              </IconButton>
                            }
                          />

                          <div className="lg:col-span-2">
                            <SelectInput
                              label="Account Type"
                              name="role"
                              value={values.role}
                              onChange={(e) => {
                                handleChange(e);
                                const newRole = e.target.value;
                                setCurrentRole(newRole);
                                if (
                                  (newRole === "employer" ||
                                    newRole === "candidate") &&
                                  !locationDetected
                                ) {
                                  setShowLocationModal(true);
                                }
                              }}
                              onBlur={handleBlur}
                              error={errors.role}
                              touched={touched.role}
                              required
                            >
                              <MenuItem value="candidate">Job Seeker</MenuItem>
                              <MenuItem value="employer">Employer</MenuItem>
                              <MenuItem value="recruitment_partner">
                                Recruitment Partner
                              </MenuItem>
                            </SelectInput>
                          </div>
                        </div>
                      </div>

                      {/* Role-specific fields */}
                      {values.role === "employer" && (
                        <div className="border-t border-slate-200 pt-6">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Building size={20} className="text-slate-400" />
                            Company Information
                          </h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                              label="Company Name"
                              name="companyName"
                              value={values.companyName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.companyName}
                              touched={touched.companyName}
                              required
                              icon={
                                <Building
                                  size={20}
                                  className="text-slate-400"
                                />
                              }
                            />

                            <Input
                              label="Owner Name"
                              name="ownerName"
                              value={values.ownerName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.ownerName}
                              touched={touched.ownerName}
                              required
                              icon={
                                <User size={20} className="text-slate-400" />
                              }
                            />

                            <Input
                              label="Contact Person Title"
                              name="contactPersonTitle"
                              value={values.contactPersonTitle}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.contactPersonTitle}
                              touched={touched.contactPersonTitle}
                              required
                            />

                            <Input
                              label="Phone Number"
                              name="phoneNumber"
                              value={values.phoneNumber}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.phoneNumber}
                              touched={touched.phoneNumber}
                              required
                              icon={
                                <Phone size={20} className="text-slate-400" />
                              }
                            />

                            <Input
                              label="Website"
                              name="website"
                              value={values.website}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.website}
                              touched={touched.website}
                              icon={
                                <Globe size={20} className="text-slate-400" />
                              }
                            />

                            <SelectInput
                              label="Industry"
                              name="industry"
                              value={values.industry}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.industry}
                              touched={touched.industry}
                              required
                            >
                              <MenuItem value="technology">Technology</MenuItem>
                              <MenuItem value="healthcare">Healthcare</MenuItem>
                              <MenuItem value="finance">Finance</MenuItem>
                              <MenuItem value="education">Education</MenuItem>
                              <MenuItem value="manufacturing">
                                Manufacturing
                              </MenuItem>
                              <MenuItem value="retail">Retail</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </SelectInput>

                            <div className="lg:col-span-2">
                              <SelectInput
                                label="Company Size"
                                name="companySize"
                                value={values.companySize}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.companySize}
                                touched={touched.companySize}
                                required
                              >
                                <MenuItem value="1-10">1-10 employees</MenuItem>
                                <MenuItem value="11-50">
                                  11-50 employees
                                </MenuItem>
                                <MenuItem value="51-200">
                                  51-200 employees
                                </MenuItem>
                                <MenuItem value="201-1000">
                                  201-1000 employees
                                </MenuItem>
                                <MenuItem value="1000+">
                                  1000+ employees
                                </MenuItem>
                              </SelectInput>
                            </div>
                          </div>
                        </div>
                      )}

                      {values.role === "recruitment_partner" && (
                        <div className="border-t border-slate-200 pt-6">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Building size={20} className="text-slate-400" />
                            Partner Information
                          </h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                              label="Company Name"
                              name="partnerCompanyName"
                              value={values.partnerCompanyName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.partnerCompanyName}
                              touched={touched.partnerCompanyName}
                              required
                              icon={
                                <Building
                                  size={20}
                                  className="text-slate-400"
                                />
                              }
                            />

                            <Input
                              label="Contact Person Name"
                              name="partnerContactPersonName"
                              value={values.partnerContactPersonName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.partnerContactPersonName}
                              touched={touched.partnerContactPersonName}
                              required
                              icon={
                                <User size={20} className="text-slate-400" />
                              }
                            />

                            <Input
                              label="Contact Person Title"
                              name="partnerContactPersonTitle"
                              value={values.partnerContactPersonTitle}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.partnerContactPersonTitle}
                              touched={touched.partnerContactPersonTitle}
                              required
                            />

                            <Input
                              label="Phone Number"
                              name="partnerPhone"
                              value={values.partnerPhone}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.partnerPhone}
                              touched={touched.partnerPhone}
                              required
                              icon={
                                <Phone size={20} className="text-slate-400" />
                              }
                            />

                            <Input
                              label="Website"
                              name="partnerWebsite"
                              value={values.partnerWebsite}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.partnerWebsite}
                              touched={touched.partnerWebsite}
                              icon={
                                <Globe size={20} className="text-slate-400" />
                              }
                            />

                            <Input
                              label="Years of Experience"
                              name="yearsOfExperience"
                              value={values.yearsOfExperience}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.yearsOfExperience}
                              touched={touched.yearsOfExperience}
                              required
                              icon={
                                <Calendar
                                  size={20}
                                  className="text-slate-400"
                                />
                              }
                            />

                            <div className="lg:col-span-2">
                              <Input
                                label="Specialization"
                                name="specialization"
                                value={values.specialization}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.specialization}
                                touched={touched.specialization}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {values.role === "candidate" && (
                        <div className="border-t border-slate-200 pt-6">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <User size={20} className="text-slate-400" />
                            Personal Information
                          </h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                              label="First Name"
                              name="candidateFirstName"
                              value={values.candidateFirstName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.candidateFirstName}
                              touched={touched.candidateFirstName}
                              required
                              icon={
                                <User size={20} className="text-slate-400" />
                              }
                            />

                            <Input
                              label="Last Name"
                              name="candidateLastName"
                              value={values.candidateLastName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.candidateLastName}
                              touched={touched.candidateLastName}
                              required
                              icon={
                                <User size={20} className="text-slate-400" />
                              }
                            />

                            <div className="lg:col-span-2">
                              <Input
                                label="Phone Number"
                                name="candidatePhone"
                                value={values.candidatePhone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.candidatePhone}
                                touched={touched.candidatePhone}
                                required
                                icon={
                                  <Phone size={20} className="text-slate-400" />
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Address Section */}
                      {(values.role === "employer" ||
                        values.role === "recruitment_partner" ||
                        values.role === "candidate") && (
                        <div className="border-t border-slate-200 pt-6">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-slate-400" />
                            Address Information
                          </h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Input
                                label="ZIP Code"
                                name={
                                  values.role === "employer"
                                    ? "zipCode"
                                    : values.role === "recruitment_partner"
                                    ? "partnerZipCode"
                                    : "candidateZipCode"
                                }
                                value={
                                  values.role === "employer"
                                    ? values.zipCode
                                    : values.role === "recruitment_partner"
                                    ? values.partnerZipCode
                                    : values.candidateZipCode
                                }
                                onChange={(e) => {
                                  handleChange(e);
                                  const prefix =
                                    values.role === "employer"
                                      ? ""
                                      : values.role === "recruitment_partner"
                                      ? "partner"
                                      : "candidate";
                                  handleZipCodeChange(
                                    e.target.value,
                                    setFieldValue,
                                    prefix
                                  );
                                }}
                                onBlur={handleBlur}
                                error={
                                  values.role === "employer"
                                    ? errors.zipCode
                                    : values.role === "recruitment_partner"
                                    ? errors.partnerZipCode
                                    : errors.candidateZipCode
                                }
                                touched={
                                  values.role === "employer"
                                    ? touched.zipCode
                                    : values.role === "recruitment_partner"
                                    ? touched.partnerZipCode
                                    : touched.candidateZipCode
                                }
                                required
                              />

                              <Input
                                label="City"
                                name={
                                  values.role === "employer"
                                    ? "city"
                                    : values.role === "recruitment_partner"
                                    ? "partnerCity"
                                    : "candidateCity"
                                }
                                value={
                                  values.role === "employer"
                                    ? values.city
                                    : values.role === "recruitment_partner"
                                    ? values.partnerCity
                                    : values.candidateCity
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                  values.role === "employer"
                                    ? errors.city
                                    : values.role === "recruitment_partner"
                                    ? errors.partnerCity
                                    : errors.candidateCity
                                }
                                touched={
                                  values.role === "employer"
                                    ? touched.city
                                    : values.role === "recruitment_partner"
                                    ? touched.partnerCity
                                    : touched.candidateCity
                                }
                                required={values.role !== "employer"}
                                disabled={values.role === "employer"}
                              />

                              <Input
                                label="State"
                                name={
                                  values.role === "employer"
                                    ? "state"
                                    : values.role === "recruitment_partner"
                                    ? "partnerState"
                                    : "candidateState"
                                }
                                value={
                                  values.role === "employer"
                                    ? values.state
                                    : values.role === "recruitment_partner"
                                    ? values.partnerState
                                    : values.candidateState
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                  values.role === "employer"
                                    ? errors.state
                                    : values.role === "recruitment_partner"
                                    ? errors.partnerState
                                    : errors.candidateState
                                }
                                touched={
                                  values.role === "employer"
                                    ? touched.state
                                    : values.role === "recruitment_partner"
                                    ? touched.partnerState
                                    : touched.candidateState
                                }
                                required={values.role !== "employer"}
                                disabled={values.role === "employer"}
                              />
                            </div>

                            <Input
                              label="Street Address"
                              name={
                                values.role === "employer"
                                  ? "address"
                                  : values.role === "recruitment_partner"
                                  ? "partnerAddress"
                                  : "candidateAddress"
                              }
                              value={
                                values.role === "employer"
                                  ? values.address
                                  : values.role === "recruitment_partner"
                                  ? values.partnerAddress
                                  : values.candidateAddress
                              }
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                values.role === "employer"
                                  ? errors.address
                                  : values.role === "recruitment_partner"
                                  ? errors.partnerAddress
                                  : errors.candidateAddress
                              }
                              touched={
                                values.role === "employer"
                                  ? touched.address
                                  : values.role === "recruitment_partner"
                                  ? touched.partnerAddress
                                  : touched.candidateAddress
                              }
                              required
                              icon={
                                <MapPin size={20} className="text-slate-400" />
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center py-8">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className={`px-12 py-4 bg-gradient-to-r ${getRoleColor(
                      values.role
                    )} text-white font-bold text-lg rounded-2xl 
                             hover:shadow-2xl hover:scale-105 transform transition-all duration-300 
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none`}
                  >
                    {isSubmitting || loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Enable Location Services
                </h3>
                <p className="text-slate-600">
                  We'd like to access your location to verify you're in the
                  United States and help auto-populate your address.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={requestLocationAccess}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl 
                           hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
                >
                  Allow Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
