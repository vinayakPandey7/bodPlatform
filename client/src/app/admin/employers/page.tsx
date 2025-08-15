"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEmployers } from "@/lib/hooks/employer.hooks";
import { adminFetchers } from "@/lib/fetchers";
import { toast } from "sonner";
import {
  GenericTable,
  TableColumn,
  TableAction,
  StatCard,
} from "@/components/GenericTable";
import {
  statusBadgeConfig,
  createNameColumn,
  createEmailColumn,
  createActionsColumn,
  createEditAction,
  createViewAction,
  createDeleteAction,
} from "@/components/table/tableUtils";

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
        email: employer.user?.email || "",
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
                  maxLength={5}
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
                  {employer.user?.email || "No email"}
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
                {employer.user?.createdAt
                  ? new Date(employer.user.createdAt).toLocaleDateString()
                  : "No date available"}
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
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);

  useEffect(() => {
    fetchEmployers();
  }, []);

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

  const handleToggleStatus = async (employer: Employer) => {
    try {
      const newStatus = !employer.isApproved;

      if (newStatus) {
        await adminFetchers.approveEmployer(employer._id);
      } else {
        // For deactivating, we'll update the employer directly
        await adminFetchers.updateEmployer(employer._id, { isApproved: false });
      }

      setEmployers(
        employers.map((emp) =>
          emp._id === employer._id ? { ...emp, isApproved: newStatus } : emp
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

  const handleDeleteEmployer = async (employer: Employer) => {
    if (!confirm("Are you sure you want to delete this employer?")) return;

    try {
      await adminFetchers.deleteEmployer(employer._id);
      setEmployers(employers.filter((emp) => emp._id !== employer._id));
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

  // Table columns configuration
  const columns: TableColumn<Employer>[] = [
    {
      key: "ownerName",
      label: "Owner Name",
      type: "text",
      responsive: "always",
      searchable: true,
    },
    {
      key: "companyName",
      label: "Company Name",
      type: "text",
      responsive: "always",
      searchable: true,
    },
    {
      key: "email",
      label: "Email",
      type: "text",
      responsive: "always",
      searchable: true,
      render: (value: any, row: Employer) => row.user?.email || "No email",
    },
    {
      key: "jobPosting",
      label: "Job Posting",
      type: "text",
      responsive: "lg",
      render: (value: string) => <span className="capitalize">{value}</span>,
    },
    {
      key: "isApproved",
      label: "Status",
      type: "badge",
      responsive: "always",
      badgeConfig: statusBadgeConfig,
    },
    createActionsColumn(),
  ];

  // Table actions configuration
  const actions: TableAction<Employer>[] = [
    createEditAction(handleEditEmployer),
    createViewAction(handleViewProfile),
    {
      label: "Toggle Status",
      icon: (
        <svg
          className="w-4 h-4"
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
      ),
      onClick: handleToggleStatus,
      variant: "warning",
    },
    createDeleteAction(handleDeleteEmployer),
  ];

  // Statistics
  const totalEmployers = employers.length;
  const activeEmployers = employers.filter((emp) => emp.isApproved).length;
  const pendingEmployers = employers.filter((emp) => !emp.isApproved).length;

  // Statistics cards
  const statCards: StatCard[] = [
    {
      title: "Total Employers",
      value: totalEmployers,
      subtitle: "All registered",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      variant: "primary",
    },
    {
      title: "Active",
      value: activeEmployers,
      subtitle: "Approved employers",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      variant: "success",
    },
    {
      title: "Pending",
      value: pendingEmployers,
      subtitle: "Awaiting approval",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      variant: "warning",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <GenericTable
          data={employers}
          columns={columns}
          actions={actions}
          loading={loading}
          error={error || null}
          title="Employer Management"
          searchPlaceholder="Search employers..."
          addButton={{ label: "ADD NEW", onClick: handleAddNew }}
          statCards={statCards}
          tableHeight="auto"
          enableTableScroll={false}
          pagination={{
            enabled: true,
            pageSize: 15,
            pageSizeOptions: [10, 15, 25, 50, 100],
            showPageInfo: true,
            showPageSizeSelector: true,
          }}
        />

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
