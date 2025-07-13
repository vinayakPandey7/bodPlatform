"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("type");

  const [formData, setFormData] = useState({
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
        : "candidate", // default to candidate instead of employer
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });

  // Check if user needs location access when component mounts and role is employer or candidate
  useEffect(() => {
    if (
      (formData.role === "employer" || formData.role === "candidate") &&
      !locationDetected
    ) {
      setShowLocationModal(true);
    }
  }, [formData.role, locationDetected]);

  // Request location access
  const requestLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Validate coordinates with backend
            const response = await fetch("/api/location/validate-coordinates", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ latitude: lat, longitude: lng }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
              // Coordinates are valid and within US
              setCoordinates({ lat, lng });
              setLocationDetected(true);
              setFormData((prev) => ({
                ...prev,
                country: "United States",
                // Keep existing city/state/zip if already filled, otherwise let user fill manually
              }));
              setShowLocationModal(false);
              setError("");
            } else {
              // Coordinates are outside US or invalid
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

  // Handle ZIP code change for auto-population (employer)
  const handleZipCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const zipCode = e.target.value;
    setFormData((prev) => ({ ...prev, zipCode }));

    // Auto-populate city when ZIP code has 5 digits
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
          setFormData((prev) => ({
            ...prev,
            city: data.city,
            state: data.state || "",
            country: "United States",
          }));
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

  // Handle ZIP code change for auto-population (candidate)
  const handleCandidateZipCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const zipCode = e.target.value;
    setFormData((prev) => ({ ...prev, candidateZipCode: zipCode }));

    // Auto-populate city when ZIP code has 5 digits
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
          setFormData((prev) => ({
            ...prev,
            candidateCity: data.city,
            candidateState: data.state || "",
            candidateCountry: "United States",
          }));
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add role-specific data
      if (formData.role === "employer") {
        // For employer registration, use the enhanced endpoint with root-level fields
        Object.assign(payload, {
          ownerName: formData.ownerName,
          companyName: formData.companyName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country || "United States",
        });

        // Add location data if detected
        if (locationDetected && coordinates.lat && coordinates.lng) {
          payload.locationDetected = true;
          payload.detectedCoordinates = [coordinates.lng, coordinates.lat];
        }
      } else if (formData.role === "candidate") {
        // For candidate registration
        Object.assign(payload, {
          firstName: formData.candidateFirstName,
          lastName: formData.candidateLastName,
          phoneNumber: formData.candidatePhone,
          address: formData.candidateAddress,
          city: formData.candidateCity,
          state: formData.candidateState,
          zipCode: formData.candidateZipCode,
          country: formData.candidateCountry || "United States",
        });

        // Add location data if detected
        if (locationDetected && coordinates.lat && coordinates.lng) {
          payload.locationDetected = true;
          payload.detectedCoordinates = [coordinates.lng, coordinates.lat];
        }
      } else if (formData.role === "recruitment_partner") {
        payload.recruitmentPartnerData = {
          companyName: formData.partnerCompanyName,
          contactPersonName: formData.partnerContactPersonName,
          contactPersonTitle: formData.partnerContactPersonTitle,
          phone: formData.partnerPhone,
          website: formData.partnerWebsite,
          address: formData.partnerAddress,
          city: formData.partnerCity,
          state: formData.partnerState,
          zipCode: formData.partnerZipCode,
          country: formData.partnerCountry,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          specialization: formData.specialization,
        };
      }

      // Use different endpoints based on role
      const endpoint =
        formData.role === "employer"
          ? "/api/auth/register/employer"
          : formData.role === "candidate"
          ? "/api/auth/register/candidate"
          : "/api/auth/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(
        formData.role === "candidate"
          ? "Registration successful! You can now log in and start searching for jobs."
          : "Registration successful! Your account is pending approval. You will be notified once approved."
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Logo className="mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow">
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Basic Account Information */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Account Information
              </h3>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Account Type *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="candidate">Job Seeker</option>
                  <option value="employer">Employer</option>
                  <option value="recruitment_partner">
                    Recruitment Partner
                  </option>
                </select>
              </div>
            </div>

            {/* Employer Specific Fields */}
            {formData.role === "employer" && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Company Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company Name *
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ownerName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Person Name *
                    </label>
                    <input
                      id="ownerName"
                      name="ownerName"
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactPersonTitle"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Person Title
                    </label>
                    <input
                      id="contactPersonTitle"
                      name="contactPersonTitle"
                      type="text"
                      value={formData.contactPersonTitle}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="industry"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Industry
                    </label>
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="companySize"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company Size
                    </label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ZIP Code {formData.role === "employer" ? "*" : ""}
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      required={formData.role === "employer"}
                      value={formData.zipCode}
                      onChange={handleZipCodeChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter 5-digit ZIP code"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Recruitment Partner Specific Fields */}
            {formData.role === "recruitment_partner" && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Recruitment Partner Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="partnerCompanyName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company Name *
                    </label>
                    <input
                      id="partnerCompanyName"
                      name="partnerCompanyName"
                      type="text"
                      required
                      value={formData.partnerCompanyName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerContactPersonName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Person Name *
                    </label>
                    <input
                      id="partnerContactPersonName"
                      name="partnerContactPersonName"
                      type="text"
                      required
                      value={formData.partnerContactPersonName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerContactPersonTitle"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Person Title
                    </label>
                    <input
                      id="partnerContactPersonTitle"
                      name="partnerContactPersonTitle"
                      type="text"
                      value={formData.partnerContactPersonTitle}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerPhone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="partnerPhone"
                      name="partnerPhone"
                      type="tel"
                      required
                      value={formData.partnerPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerWebsite"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Website
                    </label>
                    <input
                      id="partnerWebsite"
                      name="partnerWebsite"
                      type="url"
                      value={formData.partnerWebsite}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="yearsOfExperience"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Years of Experience
                    </label>
                    <input
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      type="number"
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="specialization"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Specialization
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      placeholder="e.g., IT, Healthcare, Finance"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerAddress"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      id="partnerAddress"
                      name="partnerAddress"
                      type="text"
                      value={formData.partnerAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerCity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <input
                      id="partnerCity"
                      name="partnerCity"
                      type="text"
                      value={formData.partnerCity}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerState"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State
                    </label>
                    <input
                      id="partnerState"
                      name="partnerState"
                      type="text"
                      value={formData.partnerState}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerZipCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ZIP Code
                    </label>
                    <input
                      id="partnerZipCode"
                      name="partnerZipCode"
                      type="text"
                      value={formData.partnerZipCode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partnerCountry"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <input
                      id="partnerCountry"
                      name="partnerCountry"
                      type="text"
                      value={formData.partnerCountry}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Candidate Specific Fields */}
            {formData.role === "candidate" && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="candidateFirstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name *
                    </label>
                    <input
                      id="candidateFirstName"
                      name="candidateFirstName"
                      type="text"
                      required
                      value={formData.candidateFirstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="candidateLastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name *
                    </label>
                    <input
                      id="candidateLastName"
                      name="candidateLastName"
                      type="text"
                      required
                      value={formData.candidateLastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="candidatePhone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="candidatePhone"
                      name="candidatePhone"
                      type="tel"
                      required
                      value={formData.candidatePhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="candidateAddress"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      id="candidateAddress"
                      name="candidateAddress"
                      type="text"
                      value={formData.candidateAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="candidateZipCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ZIP Code *
                    </label>
                    <input
                      id="candidateZipCode"
                      name="candidateZipCode"
                      type="text"
                      required
                      value={formData.candidateZipCode}
                      onChange={handleCandidateZipCodeChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter 5-digit ZIP code"
                      maxLength={5}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll use this to show you jobs within 4 miles of your
                      location
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="candidateCity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <input
                      id="candidateCity"
                      name="candidateCity"
                      type="text"
                      value={formData.candidateCity}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      readOnly
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="candidateState"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State
                    </label>
                    <input
                      id="candidateState"
                      name="candidateState"
                      type="text"
                      value={formData.candidateState}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      readOnly
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="candidateCountry"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <input
                      id="candidateCountry"
                      name="candidateCountry"
                      type="text"
                      value={formData.candidateCountry}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </form>

        {/* Location Access Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  Location Access Required
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    To ensure accurate job matching and compliance with regional
                    regulations, we need to verify your location. This helps us
                    connect you with candidates in your area and ensures all job
                    postings meet local requirements.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={requestLocationAccess}
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-2"
                  >
                    Allow Location Access
                  </button>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Enter ZIP Code Manually
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
