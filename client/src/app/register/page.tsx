"use client";
import { useState, useEffect, Suspense, useRef } from "react";
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
  CircularProgress,
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
  Users,
  Briefcase,
  Target,
  Check,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/PhoneNumberInput";

// Compact Input Component
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

const CompactInput: React.FC<InputProps> = ({
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
        size="medium"
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
  );
};

// Compact Select Component
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

const CompactSelect: React.FC<SelectProps> = ({
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
      <FormControl fullWidth error={touched && Boolean(error)} size="medium">
        <InputLabel
          required={required}
          sx={{ fontSize: "16px", fontWeight: 500, color: "#64748b" }}
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
            borderRadius: "8px",
            backgroundColor: "white",
            fontSize: "16px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e2e8f0",
            },
          }}
        >
          {children}
        </Select>
        {touched && error && (
          <FormHelperText sx={{ fontSize: "14px" }}>{error}</FormHelperText>
        )}
      </FormControl>
    </div>
  );
};

// Validation schemas
const step1ValidationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Min 6 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
});

const step2ValidationSchema = Yup.object({
  role: Yup.string().required("Required"),
  // Role-specific validations will be added dynamically
});

const step3ValidationSchema = Yup.object({
  // Address validations will be added based on role
});

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("type");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  // Loading states for zipcode lookup
  const [zipcodeLoading, setZipcodeLoading] = useState(false);

  const [initialValues, setInitialValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: currentRole,
    // Employer fields
    companyName: "",
    ownerName: "",
    phoneNumber: "",
    website: "",
    industry: "",
    companySize: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    // Recruitment Partner fields
    partnerCompanyName: "",
    partnerContactPersonName: "",
    partnerPhone: "",
    partnerWebsite: "",
    partnerAddress: "",
    partnerCity: "",
    partnerState: "",
    partnerZipCode: "",
    yearsOfExperience: "",
    specialization: "",
    // Candidate fields
    candidateFirstName: "",
    candidateLastName: "",
    candidatePhone: "",
    candidateAddress: "",
    candidateCity: "",
    candidateState: "",
    candidateZipCode: "",
  });

  // Handle ZIP code change for auto-population
  const handleZipCodeChange = async (
    zipCode: string,
    setFieldValue: (field: string, value: any) => void,
    prefix: string = ""
  ) => {
    if (zipCode.length === 5 && /^\d{5}$/.test(zipCode)) {
      setZipcodeLoading(true);
      try {
        const response = await fetch("/api/location/lookup-zipcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zipCode }),
        });

        const data = await response.json();
        if (response.ok && data.city) {
          const cityField = prefix ? `${prefix}City` : "city";
          const stateField = prefix ? `${prefix}State` : "state";
          setFieldValue(cityField, data.city);
          setFieldValue(stateField, data.state || "");
          setError("");
        }
      } catch (err) {
        console.error("Error looking up ZIP code:", err);
      } finally {
        setZipcodeLoading(false);
      }
    } else {
      setZipcodeLoading(false);
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

      let requestBody;

      if (values.role === "employer") {
        requestBody = {
          email: values.email,
          password: values.password,
          role: values.role,
          employerData: {
            companyName: values.companyName,
            ownerName: values.ownerName,
            phoneNumber: values.phoneNumber,
            website: values.website,
            industry: values.industry,
            companySize: values.companySize,
            address: values.address,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            country: "United States", // Default to US for now
          },
          coordinates:
            coordinates.lat && coordinates.lng ? coordinates : undefined,
        };
      } else if (values.role === "recruitment_partner") {
        requestBody = {
          email: values.email,
          password: values.password,
          role: values.role,
          recruitmentPartnerData: {
            companyName: values.partnerCompanyName,
            ownerName: values.partnerContactPersonName,
            phoneNumber: values.partnerPhone,
            website: values.partnerWebsite,
            address: values.partnerAddress,
            city: values.partnerCity,
            state: values.partnerState,
            zipCode: values.partnerZipCode,
            country: "United States", // Default to US for now
            yearsOfExperience: values.yearsOfExperience,
            specialization: values.specialization,
          },
          coordinates:
            coordinates.lat && coordinates.lng ? coordinates : undefined,
        };
      } else if (values.role === "candidate") {
        requestBody = {
          email: values.email,
          password: values.password,
          role: values.role,
          candidateData: {
            firstName: values.candidateFirstName,
            lastName: values.candidateLastName,
            phone: values.candidatePhone,
            address: values.candidateAddress,
            city: values.candidateCity,
            state: values.candidateState,
            zipCode: values.candidateZipCode,
          },
          coordinates:
            coordinates.lat && coordinates.lng ? coordinates : undefined,
        };
      } else {
        requestBody = {
          ...values,
          coordinates:
            coordinates.lat && coordinates.lng ? coordinates : undefined,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  // Steps data
  const steps = [
    {
      number: 1,
      title: "Your details",
      description: "Provide an email and password",
      icon: <User className="w-5 h-5" />,
      isCompleted: currentStep > 1,
      isActive: currentStep === 1,
    },
    {
      number: 2,
      title: "Account details",
      description: "Choose your role and provide information",
      icon: <Briefcase className="w-5 h-5" />,
      isCompleted: currentStep > 2,
      isActive: currentStep === 2,
    },
    {
      number: 3,
      title: "Address information",
      description: "Add your location details",
      icon: <MapPin className="w-5 h-5" />,
      isCompleted: currentStep > 3,
      isActive: currentStep === 3,
    },
    {
      number: 4,
      title: "Welcome to CIERO!",
      description: "Get up and running in 3 minutes",
      icon: <Target className="w-5 h-5" />,
      isCompleted: false,
      isActive: currentStep === 4,
    },
  ];

  // Validation for current step
  const getValidationSchema = () => {
    switch (currentStep) {
      case 1:
        return step1ValidationSchema;
      case 2:
        return step2ValidationSchema;
      case 3:
        // Add role-specific address validation
        const baseSchema = step3ValidationSchema;
        if (currentRole === "employer") {
          return baseSchema.shape({
            zipCode: Yup.string()
              .matches(/^\d{5}$/, "5 digits required")
              .required("Required"),
            address: Yup.string().required("Required"),
          });
        } else if (currentRole === "recruitment_partner") {
          return baseSchema.shape({
            partnerZipCode: Yup.string()
              .matches(/^\d{5}$/, "5 digits required")
              .required("Required"),
            partnerAddress: Yup.string().required("Required"),
          });
        } else if (currentRole === "candidate") {
          return baseSchema.shape({
            candidateZipCode: Yup.string()
              .matches(/^\d{5}$/, "5 digits required")
              .required("Required"),
            candidateAddress: Yup.string().required("Required"),
          });
        }
        return baseSchema;
      default:
        return step1ValidationSchema;
    }
  };

  // Check if current step is valid
  const isStepValid = (values: any, errors: any) => {
    switch (currentStep) {
      case 1:
        return (
          values.email &&
          values.password &&
          values.confirmPassword &&
          !errors.email &&
          !errors.password &&
          !errors.confirmPassword
        );
      case 2:
        if (currentRole === "employer") {
          return (
            values.role &&
            values.companyName &&
            values.ownerName &&
            values.phoneNumber
          );
        } else if (currentRole === "recruitment_partner") {
          return (
            values.role &&
            values.partnerCompanyName &&
            values.partnerContactPersonName &&
            values.partnerPhone &&
            values.yearsOfExperience &&
            values.specialization
          );
        } else if (currentRole === "candidate") {
          return (
            values.role &&
            values.candidateFirstName &&
            values.candidateLastName &&
            values.candidatePhone
          );
        }
        return values.role;
      case 3:
        if (currentRole === "employer") {
          return values.zipCode && values.address;
        } else if (currentRole === "recruitment_partner") {
          return values.partnerZipCode && values.partnerAddress;
        } else if (currentRole === "candidate") {
          return values.candidateZipCode && values.candidateAddress;
        }
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Steps Process - Top on mobile, Left on desktop */}
      <div className="w-full lg:w-2/6 bg-white p-4 lg:p-8 flex flex-col">
        {/* Logo */}
        <div className="mb-6 lg:mb-12">
          <Logo size="md" showText={false} />
        </div>

        {/* Steps */}
        <div className="flex-1 relative">
          <div className="lg:space-y-8 relative z-10">
            {/* Mobile horizontal stepper */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  {/* Step indicator */}
                  <div className="flex-shrink-0">
                    {step.isCompleted ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          step.isActive
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step.number}
                      </div>
                    )}
                  </div>
                  {/* Connector line for mobile */}
                  {index < steps.length - 1 && (
                    <div className="h-px w-8 bg-gray-200 mx-2" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Desktop vertical stepper */}
            <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
              {/* Floating circles */}
              <div className="absolute top-20 right-20 w-32 h-32 bg-blue-100/640 rounded-full animate-float"></div>
              <div className="absolute top-60 left-10 w-24 h-24 bg-purple-100/30 rounded-full animate-float-delayed"></div>
              <div className="absolute bottom-40 right-32 w-20 h-20 bg-pink-100/40 rounded-full animate-float"></div>
              <div className="absolute top-40 right-60 w-16 h-16 bg-indigo-100/30 rounded-full animate-float-delayed"></div>
              <div className="absolute bottom-60 left-20 w-28 h-28 bg-cyan-100/20 rounded-full animate-float"></div>

              {/* Geometric shapes */}
              <div className="absolute top-32 left-32 w-12 h-12 bg-gradient-to-r from-blue-200/20 to-purple-200/30 transform rotate-45 animate-pulse"></div>
              <div className="absolute bottom-32 right-20 w-8 h-8 bg-gradient-to-r from-pink-200/30 to-blue-200/40 transform rotate-12 animate-pulse"></div>
              <div className="absolute top-80 right-40 w-6 h-6 bg-gradient-to-r from-indigo-200/20 to-cyan-200/30 transform -rotate-45 animate-pulse"></div>

              {/* Subtle gradient orbs */}
              <div className="absolute top-10 left-1/4 w-40 h-40 bg-gradient-radial from-blue-100/20 to-transparent rounded-full animate-float-slow"></div>
              <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-gradient-radial from-purple-100/15 to-transparent rounded-full animate-float-slow"></div>
              <div className="absolute top-1/2 left-10 w-32 h-32 bg-gradient-radial from-pink-100/20 to-transparent rounded-full animate-float-slow"></div>

              {/* Moving particles */}
              <div className="absolute top-16 right-12 w-2 h-2 bg-blue-200/60 rounded-full animate-bounce"></div>
              <div className="absolute top-72 left-16 w-1.5 h-1.5 bg-purple-200/50 rounded-full animate-pulse"></div>
              <div className="absolute bottom-24 left-1/3 w-2.5 h-2.5 bg-pink-200/40 rounded-full animate-bounce"></div>
              <div className="absolute top-96 right-24 w-1 h-1 bg-indigo-200/60 rounded-full animate-pulse"></div>
              <div className="absolute bottom-48 right-16 w-2 h-2 bg-cyan-200/50 rounded-full animate-bounce"></div>

              {/* Light rays effect */}
              <div className="absolute top-0 left-1/3 w-px h-20 bg-gradient-to-b from-blue-200/30 to-transparent animate-pulse"></div>
              <div className="absolute top-0 right-1/4 w-px h-16 bg-gradient-to-b from-purple-200/20 to-transparent animate-pulse"></div>
              <div className="absolute bottom-0 left-1/4 w-px h-24 bg-gradient-to-t from-pink-200/25 to-transparent animate-pulse"></div>
            </div>
            <div className="hidden lg:block">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-start space-x-4 mb-8">
                  {/* Step indicator */}
                  <div className="flex-shrink-0">
                    {step.isCompleted ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.isActive
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step.icon}
                      </div>
                    )}
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div className="w-px h-12 bg-gray-200 ml-4 mt-2" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium ${
                        step.isActive || step.isCompleted
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="pt-4 lg:pt-8 border-t border-gray-200 relative z-20">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 relative z-30"
            >
              ← Back to home
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 relative z-30"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Form section - Right on desktop, Bottom on mobile */}
      <div className="flex-1 flex">
        {/* Form section */}
        <div className="w-full bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 lg:border-l border-gray-200 overflow-y-auto relative">
          {/* Background Animation Elements - Hidden on mobile for performance */}
          <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating circles */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-blue-100/40 rounded-full animate-float"></div>
            <div className="absolute top-60 left-10 w-24 h-24 bg-purple-100/30 rounded-full animate-float-delayed"></div>
            <div className="absolute bottom-40 right-32 w-20 h-20 bg-pink-100/40 rounded-full animate-float"></div>
            <div className="absolute top-40 right-60 w-16 h-16 bg-indigo-100/30 rounded-full animate-float-delayed"></div>
            <div className="absolute bottom-60 left-20 w-28 h-28 bg-cyan-100/20 rounded-full animate-float"></div>

            {/* Geometric shapes */}
            <div className="absolute top-32 left-32 w-12 h-12 bg-gradient-to-r from-blue-200/20 to-purple-200/30 transform rotate-45 animate-pulse"></div>
            <div className="absolute bottom-32 right-20 w-8 h-8 bg-gradient-to-r from-pink-200/30 to-blue-200/40 transform rotate-12 animate-pulse"></div>
            <div className="absolute top-80 right-40 w-6 h-6 bg-gradient-to-r from-indigo-200/20 to-cyan-200/30 transform -rotate-45 animate-pulse"></div>

            {/* Subtle gradient orbs */}
            <div className="absolute top-10 left-1/4 w-40 h-40 bg-gradient-radial from-blue-100/30 to-transparent rounded-full animate-float-slow"></div>
            <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-gradient-radial from-purple-100/25 to-transparent rounded-full animate-float-slow"></div>
            <div className="absolute top-1/2 left-10 w-32 h-32 bg-gradient-radial from-pink-100/30 to-transparent rounded-full animate-float-slow"></div>

            {/* Moving particles */}
            <div className="absolute top-16 right-12 w-2 h-2 bg-blue-200/60 rounded-full animate-bounce"></div>
            <div className="absolute top-72 left-16 w-1.5 h-1.5 bg-purple-200/50 rounded-full animate-pulse"></div>
            <div className="absolute bottom-24 left-1/3 w-2.5 h-2.5 bg-pink-200/40 rounded-full animate-bounce"></div>
            <div className="absolute top-96 right-24 w-1 h-1 bg-indigo-200/60 rounded-full animate-pulse"></div>
            <div className="absolute bottom-48 right-16 w-2 h-2 bg-cyan-200/50 rounded-full animate-bounce"></div>

            {/* Light rays effect */}
            <div className="absolute top-0 left-1/3 w-px h-20 bg-gradient-to-b from-blue-200/30 to-transparent animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-px h-16 bg-gradient-to-b from-purple-200/20 to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 left-1/4 w-px h-24 bg-gradient-to-t from-pink-200/25 to-transparent animate-pulse"></div>
          </div>

          <div className="p-4 md:p-6 lg:p-8 mx-auto w-full md:w-3/4 lg:w-1/2 h-full relative z-10">
            <Formik
              initialValues={initialValues}
              validationSchema={getValidationSchema()}
              onSubmit={handleSubmit}
              enableReinitialize={false}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                setFieldValue,
                isSubmitting,
                setValues,
              }) => {
                return (
                  <Form className="h-full flex flex-col justify-center  backdrop-blur-sm transition-all duration-500">
                    {error && (
                      <Alert
                        severity="error"
                        className="rounded-lg text-sm mb-6"
                      >
                        {error}
                      </Alert>
                    )}

                    <div className="">
                      {/* Step 1: Email and Password */}
                      {currentStep === 1 && (
                        <div className="flex flex-col gap-6 lg:gap-10">
                          <div>
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                              Create your account
                            </h2>
                            <p className="text-gray-600">
                              Enter your email and create a secure password
                            </p>
                          </div>

                          <CompactInput
                            label="Email address"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.email as string}
                            touched={touched.email as boolean}
                            required
                            icon={<Mail size={20} className="text-gray-400" />}
                          />

                          <CompactInput
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.password as string}
                            touched={touched.password as boolean}
                            required
                            icon={<Lock size={20} className="text-gray-400" />}
                            endIcon={
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                size="small"
                              >
                                {showPassword ? (
                                  <EyeOff size={20} />
                                ) : (
                                  <Eye size={20} />
                                )}
                              </IconButton>
                            }
                          />

                          <CompactInput
                            label="Confirm password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.confirmPassword as string}
                            touched={touched.confirmPassword as boolean}
                            required
                            icon={<Lock size={20} className="text-gray-400" />}
                            endIcon={
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                size="small"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff size={20} />
                                ) : (
                                  <Eye size={20} />
                                )}
                              </IconButton>
                            }
                          />
                        </div>
                      )}

                      {/* Step 2: Account Details */}
                      {currentStep === 2 && (
                        <div className="space-y-4 lg:space-y-6">
                          <div className="flex flex-col">
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                              Account details
                            </h2>
                            <p className="text-gray-600">
                              Tell us about yourself and your role
                            </p>
                          </div>

                          <CompactSelect
                            label="Account Type"
                            name="role"
                            value={values.role}
                            onChange={(e) => {
                              handleChange(e);
                              setCurrentRole(e.target.value);
                              setFieldValue("role", e.target.value);
                              // Update initial values to match the new role
                              setInitialValues((prev) => ({
                                ...prev,
                                role: e.target.value,
                                // Preserve email and password
                                email: values.email || "",
                                password: values.password || "",
                                confirmPassword: values.confirmPassword || "",
                              }));
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
                          </CompactSelect>

                          {/* Role-specific fields */}
                          {values.role === "employer" && (
                            <>
                              <CompactInput
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
                                    className="text-gray-400"
                                  />
                                }
                              />

                              <CompactInput
                                label="Owner Name"
                                name="ownerName"
                                value={values.ownerName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.ownerName}
                                touched={touched.ownerName}
                                required
                                icon={
                                  <User size={20} className="text-gray-400" />
                                }
                              />

                              <PhoneNumberInput
                                label="Phone Number"
                                value={values.phoneNumber}
                                onChange={(value) =>
                                  setFieldValue("phoneNumber", value)
                                }
                                error={
                                  touched.phoneNumber &&
                                  Boolean(errors.phoneNumber)
                                }
                                helperText={
                                  touched.phoneNumber && errors.phoneNumber
                                    ? errors.phoneNumber
                                    : undefined
                                }
                                className="!py-5"
                                required
                              />

                              <CompactSelect
                                label="Industry"
                                name="industry"
                                value={values.industry}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.industry}
                                touched={touched.industry}
                                required
                              >
                                <MenuItem value="technology">
                                  Technology
                                </MenuItem>
                                <MenuItem value="healthcare">
                                  Healthcare
                                </MenuItem>
                                <MenuItem value="finance">Finance</MenuItem>
                                <MenuItem value="education">Education</MenuItem>
                                <MenuItem value="manufacturing">
                                  Manufacturing
                                </MenuItem>
                                <MenuItem value="retail">Retail</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                              </CompactSelect>

                              <CompactSelect
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
                              </CompactSelect>
                            </>
                          )}

                          {values.role === "recruitment_partner" && (
                            <>
                              <CompactInput
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
                                    className="text-gray-400"
                                  />
                                }
                              />

                              <CompactInput
                                label="Contact Person"
                                name="partnerContactPersonName"
                                value={values.partnerContactPersonName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.partnerContactPersonName}
                                touched={touched.partnerContactPersonName}
                                required
                                icon={
                                  <User size={20} className="text-gray-400" />
                                }
                              />

                              <PhoneNumberInput
                                label="Phone"
                                value={values.partnerPhone}
                                onChange={(value) =>
                                  setFieldValue("partnerPhone", value)
                                }
                                error={
                                  touched.partnerPhone &&
                                  Boolean(errors.partnerPhone)
                                }
                                helperText={
                                  touched.partnerPhone && errors.partnerPhone
                                    ? errors.partnerPhone
                                    : undefined
                                }
                                className="py-3"
                                required
                              />

                              <CompactInput
                                label="Experience (Years)"
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
                                    className="text-gray-400"
                                  />
                                }
                              />

                              <CompactInput
                                label="Specialization"
                                name="specialization"
                                value={values.specialization}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.specialization}
                                touched={touched.specialization}
                                required
                              />
                            </>
                          )}

                          {values.role === "candidate" && (
                            <>
                              <CompactInput
                                label="First Name"
                                name="candidateFirstName"
                                value={values.candidateFirstName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.candidateFirstName}
                                touched={touched.candidateFirstName}
                                required
                                icon={
                                  <User size={20} className="text-gray-400" />
                                }
                              />

                              <CompactInput
                                label="Last Name"
                                name="candidateLastName"
                                value={values.candidateLastName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.candidateLastName}
                                touched={touched.candidateLastName}
                                required
                                icon={
                                  <User size={20} className="text-gray-400" />
                                }
                              />

                              <PhoneNumberInput
                                label="Phone"
                                value={values.candidatePhone}
                                onChange={(value) =>
                                  setFieldValue("candidatePhone", value)
                                }
                                error={
                                  touched.candidatePhone &&
                                  Boolean(errors.candidatePhone)
                                }
                                helperText={
                                  touched.candidatePhone &&
                                  errors.candidatePhone
                                    ? errors.candidatePhone
                                    : undefined
                                }
                                className="py-3"
                                required
                              />
                            </>
                          )}
                        </div>
                      )}

                      {/* Step 3: Address Information */}
                      {currentStep === 3 && (
                        <div className="space-y-4 lg:space-y-6">
                          <div>
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                              Address information
                            </h2>
                            <p className="text-gray-600">
                              Add your location details
                            </p>
                          </div>

                          {values.role === "employer" && (
                            <>
                              <CompactInput
                                label="ZIP Code"
                                name="zipCode"
                                value={values.zipCode}
                                onChange={(e) => {
                                  handleChange(e);
                                  handleZipCodeChange(
                                    e.target.value,
                                    setFieldValue,
                                    ""
                                  );
                                }}
                                onBlur={handleBlur}
                                error={errors.zipCode}
                                touched={touched.zipCode}
                                required
                                icon={
                                  <MapPin size={20} className="text-gray-400" />
                                }
                              />

                              <CompactInput
                                label="City"
                                name="city"
                                value={values.city}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled
                                endIcon={
                                  zipcodeLoading ? (
                                    <CircularProgress size={20} />
                                  ) : null
                                }
                              />

                              <CompactInput
                                label="State"
                                name="state"
                                value={values.state}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled
                                endIcon={
                                  zipcodeLoading ? (
                                    <CircularProgress size={20} />
                                  ) : null
                                }
                              />

                              <CompactInput
                                label="Address"
                                name="address"
                                value={values.address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.address}
                                touched={touched.address}
                                required
                                icon={
                                  <MapPin size={20} className="text-gray-400" />
                                }
                              />
                            </>
                          )}

                          {values.role === "recruitment_partner" && (
                            <>
                              <CompactInput
                                label="ZIP Code"
                                name="partnerZipCode"
                                value={values.partnerZipCode}
                                onChange={(e) => {
                                  handleChange(e);
                                  handleZipCodeChange(
                                    e.target.value,
                                    setFieldValue,
                                    "partner"
                                  );
                                }}
                                onBlur={handleBlur}
                                error={errors.partnerZipCode}
                                touched={touched.partnerZipCode}
                                required
                                icon={
                                  <MapPin size={20} className="text-gray-400" />
                                }
                              />

                              <CompactInput
                                label="City"
                                name="partnerCity"
                                value={values.partnerCity}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled
                                endIcon={
                                  zipcodeLoading ? (
                                    <CircularProgress size={20} />
                                  ) : null
                                }
                              />

                              <CompactInput
                                label="State"
                                name="partnerState"
                                value={values.partnerState}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled
                                endIcon={
                                  zipcodeLoading ? (
                                    <CircularProgress size={20} />
                                  ) : null
                                }
                              />

                              <CompactInput
                                label="Address"
                                name="partnerAddress"
                                value={values.partnerAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.partnerAddress}
                                touched={touched.partnerAddress}
                                required
                                icon={
                                  <MapPin size={20} className="text-gray-400" />
                                }
                              />
                            </>
                          )}

                          {values.role === "candidate" && (
                            <>
                              <CompactInput
                                label="ZIP Code"
                                name="candidateZipCode"
                                value={values.candidateZipCode}
                                onChange={(e) => {
                                  handleChange(e);
                                  handleZipCodeChange(
                                    e.target.value,
                                    setFieldValue,
                                    "candidate"
                                  );
                                }}
                                onBlur={handleBlur}
                                error={errors.candidateZipCode}
                                touched={touched.candidateZipCode}
                                required
                                icon={
                                  <MapPin size={20} className="text-gray-400" />
                                }
                              />

                              <CompactInput
                                label="City"
                                name="candidateCity"
                                value={values.candidateCity}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled
                                endIcon={
                                  zipcodeLoading ? (
                                    <CircularProgress size={20} />
                                  ) : null
                                }
                              />

                              <CompactInput
                                label="State"
                                name="candidateState"
                                value={values.candidateState}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled
                                endIcon={
                                  zipcodeLoading ? (
                                    <CircularProgress size={20} />
                                  ) : null
                                }
                              />

                              <CompactInput
                                label="Address"
                                name="candidateAddress"
                                value={values.candidateAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.candidateAddress}
                                touched={touched.candidateAddress}
                                required
                                icon={
                                  <MapPin size={20} className="text-gray-400" />
                                }
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Navigation buttons */}
                    <div className="pt-4 lg:pt-6">
                      {currentStep < 3 ? (
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                          {currentStep > 1 && (
                            <button
                              type="button"
                              onClick={() => setCurrentStep(currentStep - 1)}
                              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Back
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (isStepValid(values, errors)) {
                                setCurrentStep(currentStep + 1);
                              }
                            }}
                            disabled={!isStepValid(values, errors)}
                            className="flex-1 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Continue
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={
                              isSubmitting ||
                              loading ||
                              !isStepValid(values, errors)
                            }
                            className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting || loading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Creating...</span>
                                <span className="sm:hidden">Creating...</span>
                              </div>
                            ) : (
                              <span>
                                <span className="hidden sm:inline">Create account</span>
                                <span className="sm:hidden">Create</span>
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
