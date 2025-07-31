"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEmployers } from "@/lib/hooks/employer.hooks";
import { adminFetchers } from "@/lib/fetchers";
import { toast } from "sonner";

interface Employer {
  _id: string;
  user: {
    email: string;
    createdAt: string;
  };
  ownerName: string;
  companyName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  jobPosting: string;
  isApproved: boolean;
  website?: string;
  description?: string;
}

interface ProfileModalProps {
  employer: Employer | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EmployerFormData {
  ownerName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  jobPosting: string;
  website: string;
  description: string;
  isApproved: boolean;
}

interface EmployerFormModalProps {
  employer: Employer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employerData: EmployerFormData) => void;
  mode: "add" | "edit";
}

const EmployerFormModal = ({
  employer,
  isOpen,
  onClose,
  onSave,
  mode,
}: EmployerFormModalProps) => {
  const [formData, setFormData] = useState({
    ownerName: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    jobPosting: "automatic",
    website: "",
    description: "",
    isApproved: true,
  });

  useEffect(() => {
    if (mode === "edit" && employer) {
      setFormData({
        ownerName: employer.ownerName,
        companyName: employer.companyName,
        email: employer.user.email,
        phoneNumber: employer.phoneNumber,
        address: employer.address,
        city: employer.city,
        state: employer.state,
        zipCode: employer.zipCode || "",
        country: employer.country,
        jobPosting: employer.jobPosting,
        website: employer.website || "",
        description: employer.description || "",
        isApproved: employer.isApproved,
      });
    } else if (mode === "add") {
      setFormData({
        ownerName: "",
        companyName: "",
        email: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        jobPosting: "automatic",
        website: "",
        description: "",
        isApproved: true,
      });
    }
  }, [employer, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleZipCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const zipCode = e.target.value;

    // Update the zipCode field first
    setFormData((prev) => ({
      ...prev,
      zipCode: zipCode,
    }));

    // If zipCode is 5 digits, try to auto-fill city and state
    if (zipCode.length === 5 && /^\d{5}$/.test(zipCode)) {
      try {
        const response = await fetch(`/api/location/lookup-zipcode`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ zipCode }),
        });

        const data = await response.json();

        if (data.success && data.city && data.state) {
          setFormData((prev) => ({
            ...prev,
            city: data.city,
            state: data.state,
          }));
        }
      } catch (error) {
        console.error("Error looking up zip code:", error);
        // Don't show error to user, just silently fail
      }
    }
  };

  console.log("fdfdsdfsg", formData);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === "add" ? "Add New Employer" : "Edit Employer"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleZipCodeChange}
                  required
                  pattern="^\d{5}(-\d{4})?$"
                  placeholder="12345 or 12345-6789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Posting Type *
                </label>
                <select
                  name="jobPosting"
                  value={formData.jobPosting}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="isApproved"
                  value={formData.isApproved ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isApproved: e.target.value === "true",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Deactivated</option>
                </select>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {mode === "add" ? "Add Employer" : "Update Employer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProfileModal = ({ employer, isOpen, onClose }: ProfileModalProps) => {
  if (!isOpen || !employer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Employer Profile
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Owner Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {employer.ownerName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {employer.companyName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {employer.user.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {employer.phoneNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Posting
                </label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {employer.jobPosting}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employer.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {employer.isApproved ? "Active" : "Deactivated"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {employer.address}, {employer.city}, {employer.state},{" "}
                {employer.zipCode}, {employer.country}
              </p>
            </div>

            {employer.website && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <p className="mt-1 text-sm text-gray-900">{employer.website}</p>
              </div>
            )}

            {employer.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {employer.description}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registered Date
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(employer.user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        const dropdownElement = document.querySelector(
          `[data-dropdown-id="${activeDropdown}"]`
        );

        if (dropdownElement && !dropdownElement.contains(target)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminFetchers.getAdminEmployers();

      if (response.employers) {
        console.log(
          "API returned data:",
          response.employers.length,
          "employers"
        );
        setEmployers(response.employers);
      } else {
        console.log("API returned no data");
        setEmployers([]);
      }
    } catch (err: any) {
      console.error("Error fetching employers:", err);
      setError(err.response?.data?.message || "Failed to fetch employers");
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (employerId: string) => {
    try {
      const employer = employers.find((emp) => emp._id === employerId);
      if (!employer) return;

      const newStatus = !employer.isApproved;

      if (newStatus) {
        await adminFetchers.approveEmployer(employerId);
      } else {
        // For deactivating, we'll update the employer directly
        await adminFetchers.updateEmployer(employerId, { isApproved: false });
      }

      setEmployers(
        employers.map((emp) =>
          emp._id === employerId ? { ...emp, isApproved: newStatus } : emp
        )
      );

      toast.success(
        `Employer ${newStatus ? "approved" : "deactivated"} successfully!`
      );
    } catch (err: any) {
      console.error("Error updating employer status:", err);
      toast.error("Failed to update employer status");
    }
  };

  const handleDeleteEmployer = async (employerId: string) => {
    if (!confirm("Are you sure you want to delete this employer?")) return;

    try {
      await adminFetchers.deleteEmployer(employerId);
      setEmployers(employers.filter((emp) => emp._id !== employerId));
      toast.success("Employer deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting employer:", err);
      toast.error("Failed to delete employer");
    }
  };

  const handleViewProfile = (employer: Employer) => {
    setSelectedEmployer(employer);
    setIsModalOpen(true);
  };

  const handleEditEmployer = (employer: Employer) => {
    setEditingEmployer(employer);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveEmployer = async (employerData: EmployerFormData) => {
    try {
      if (isEditModalOpen && editingEmployer) {
        // Update existing employer
        const updateData = {
          ownerName: employerData.ownerName,
          companyName: employerData.companyName,
          phoneNumber: employerData.phoneNumber,
          address: employerData.address,
          city: employerData.city,
          state: employerData.state,
          zipCode: employerData.zipCode,
          country: employerData.country,
          jobPosting: employerData.jobPosting,
          isApproved: employerData.isApproved,
          website: employerData.website,
          description: employerData.description,
        };

        await adminFetchers.updateEmployer(editingEmployer._id, updateData);

        const updatedEmployer = {
          ...editingEmployer,
          ...updateData,
          user: {
            ...editingEmployer.user,
            email: employerData.email,
          },
        };

        setEmployers(
          employers.map((emp) =>
            emp._id === editingEmployer._id ? updatedEmployer : emp
          )
        );

        setIsEditModalOpen(false);
        setEditingEmployer(null);
        toast.success("Employer updated successfully!");
      } else if (isAddModalOpen) {
        // Add new employer
        const createData = {
          ownerName: employerData.ownerName,
          companyName: employerData.companyName,
          email: employerData.email,
          phoneNumber: employerData.phoneNumber,
          address: employerData.address,
          city: employerData.city,
          state: employerData.state,
          zipCode: employerData.zipCode,
          country: employerData.country,
          jobPosting: employerData.jobPosting,
          isApproved: employerData.isApproved,
          website: employerData.website,
          description: employerData.description,
        };

        const response = await adminFetchers.createEmployer(createData);

        // Refresh the employers list to get the latest data
        fetchEmployers();

        setIsAddModalOpen(false);
        toast.success("Employer added successfully!");
      }
    } catch (err: any) {
      console.error("Error saving employer:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Error saving employer. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Debug logging

  // console.log("Filtered employers:", filteredEmployers.length);

  const filteredEmployers = employers.filter(
    (employer) =>
      employer.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white shadow rounded-lg">
              <div className="h-16 bg-gray-200 rounded-t-lg mb-4"></div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 border-b border-gray-200"
                ></div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="min-h-screen">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Employer Management
              </h1>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleAddNew}
              >
                ADD NEW
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search employers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden min-h-[600px]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-16 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner Name
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Posting
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-1 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No employers found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployers.map((employer, index) => (
                        <tr key={employer._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="w-48 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate">
                            {employer.ownerName}
                          </td>
                          <td className="w-48 px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
                            {employer.companyName}
                          </td>
                          <td className="w-64 px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
                            {employer.user.email}
                          </td>
                          <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {employer.jobPosting}
                          </td>
                          <td className="w-48 px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  employer.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {employer.isApproved ? "Active" : "Deactivated"}
                              </span>
                              {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Verified
                              </span> */}
                            </div>
                          </td>
                          <td className="w-40 px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div
                              className="relative"
                              data-dropdown-id={employer._id}
                            >
                              <button
                                onClick={() =>
                                  setActiveDropdown(
                                    activeDropdown === employer._id
                                      ? null
                                      : employer._id
                                  )
                                }
                                className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-50 transition-colors"
                                title="Actions"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {activeDropdown === employer._id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        handleEditEmployer(employer);
                                        setActiveDropdown(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-3 text-blue-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Edit Employer
                                    </button>

                                    <button
                                      onClick={() => {
                                        handleViewProfile(employer);
                                        setActiveDropdown(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-3 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      View Profile
                                    </button>

                                    <button
                                      onClick={() => {
                                        handleToggleStatus(employer._id);
                                        setActiveDropdown(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-3 text-yellow-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      {employer.isApproved
                                        ? "Deactivate"
                                        : "Activate"}
                                    </button>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <button
                                      onClick={() => {
                                        handleDeleteEmployer(employer._id);
                                        setActiveDropdown(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-3 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete Employer
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Modal */}
        <ProfileModal
          employer={selectedEmployer}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Add Employer Modal */}
        <EmployerFormModal
          employer={null}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveEmployer}
          mode="add"
        />

        {/* Edit Employer Modal */}
        <EmployerFormModal
          employer={editingEmployer}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEmployer}
          mode="edit"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
