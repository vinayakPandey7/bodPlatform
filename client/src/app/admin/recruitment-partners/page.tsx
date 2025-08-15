"use client";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { adminFetchers } from "@/lib/fetchers";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/PhoneNumberInput";
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

interface RecruitmentPartner {
  _id: string;
  user: {
    email: string;
    createdAt: string;
  };
  ownerName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  isApproved: boolean;
  website?: string;
  description?: string;
  specializations?: string[];
  createdAt: string;
}

interface PartnerFormModalProps {
  partner: RecruitmentPartner | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PartnerFormData {
  ownerName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  description: string;
  specializations: string;
  isApproved: boolean;
}

interface PartnerFormModalProps {
  partner: RecruitmentPartner | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (partnerData: PartnerFormData) => void;
  mode: "add" | "edit";
}

interface ProfileModalProps {
  partner: RecruitmentPartner | null;
  isOpen: boolean;
  onClose: () => void;
}

const PartnerFormModal = ({
  partner,
  isOpen,
  onClose,
  onSave,
  mode,
}: PartnerFormModalProps) => {
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
    website: "",
    description: "",
    specializations: "",
    isApproved: true,
  });

  useEffect(() => {
    if (mode === "edit" && partner) {
      setFormData({
        ownerName: partner.ownerName,
        companyName: partner.companyName,
        email: partner.user?.email || "",
        phoneNumber: partner.phoneNumber,
        address: partner.address,
        city: partner.city,
        state: partner.state,
        zipCode: partner.zipCode || "",
        country: partner.country,
        website: partner.website || "",
        description: partner.description || "",
        specializations: partner.specializations?.join(", ") || "",
        isApproved: partner.isApproved,
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
        website: "",
        description: "",
        specializations: "",
        isApproved: true,
      });
    }
  }, [partner, mode, isOpen]);

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
              {mode === "add"
                ? "Add New Recruitment Partner"
                : "Edit Recruitment Partner"}
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
                <PhoneNumberInput
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: value }))
                  }
                  required
                  className="!py-2"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specializations (comma-separated)
              </label>
              <textarea
                name="specializations"
                value={formData.specializations}
                onChange={handleInputChange}
                rows={2}
                placeholder="e.g., IT, Healthcare, Finance"
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
                {mode === "add" ? "Add Partner" : "Update Partner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProfileModal = ({ partner, isOpen, onClose }: ProfileModalProps) => {
  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Recruitment Partner Profile
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
                  {partner.ownerName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {partner.companyName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {partner.user?.email || "No email"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {partner.phoneNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    partner.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {partner.isApproved ? "Active" : "Deactivated"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {partner.address}, {partner.city}, {partner.state},{" "}
                {partner.zipCode}, {partner.country}
              </p>
            </div>

            {partner.website && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <p className="mt-1 text-sm text-gray-900">{partner.website}</p>
              </div>
            )}

            {partner.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {partner.description}
                </p>
              </div>
            )}

            {partner.specializations && partner.specializations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specializations
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {partner.specializations.join(", ")}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registered Date
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(partner?.createdAt).toLocaleDateString()}
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

export default function AdminRecruitmentPartnersPage() {
  const [partners, setPartners] = useState<RecruitmentPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPartner, setSelectedPartner] =
    useState<RecruitmentPartner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] =
    useState<RecruitmentPartner | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminFetchers.getAdminRecruitmentPartners();

      if (response.recruitmentPartners) {
        console.log(
          "API returned data:",
          response.recruitmentPartners.length,
          "recruitment partners"
        );
        setPartners(response.recruitmentPartners);
      } else {
        console.log("API returned no data");
        setPartners([]);
      }
    } catch (err: any) {
      console.error("Error fetching recruitment partners:", err);
      setError(
        err.response?.data?.message || "Failed to fetch recruitment partners"
      );
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (partner: RecruitmentPartner) => {
    try {
      const newStatus = !partner.isApproved;

      if (newStatus) {
        await adminFetchers.approveRecruitmentPartner(partner._id);
      } else {
        // For deactivating, we'll update the partner directly
        await adminFetchers.updateRecruitmentPartner(partner._id, {
          isApproved: false,
        });
      }

      setPartners(
        partners.map((emp) =>
          emp._id === partner._id ? { ...emp, isApproved: newStatus } : emp
        )
      );

      toast.success(
        `Recruitment Partner ${
          newStatus ? "approved" : "deactivated"
        } successfully!`
      );
    } catch (err: any) {
      console.error("Error updating recruitment partner status:", err);
      toast.error("Failed to update recruitment partner status");
    }
  };

  const handleDeletePartner = async (partner: RecruitmentPartner) => {
    if (!confirm("Are you sure you want to delete this recruitment partner?"))
      return;

    try {
      await adminFetchers.deleteRecruitmentPartner(partner._id);
      setPartners(partners.filter((emp) => emp._id !== partner._id));
      toast.success("Recruitment Partner deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting recruitment partner:", err);
      toast.error("Failed to delete recruitment partner");
    }
  };

  const handleViewProfile = (partner: RecruitmentPartner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleEditPartner = (partner: RecruitmentPartner) => {
    setEditingPartner(partner);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  const handleSavePartner = async (partnerData: PartnerFormData) => {
    try {
      if (isEditModalOpen && editingPartner) {
        // Update existing partner
        const updateData = {
          ownerName: partnerData.ownerName,
          companyName: partnerData.companyName,
          email: partnerData.email,
          phoneNumber: partnerData.phoneNumber,
          address: partnerData.address,
          city: partnerData.city,
          state: partnerData.state,
          zipCode: partnerData.zipCode,
          country: partnerData.country,
          isApproved: partnerData.isApproved,
          website: partnerData.website,
          description: partnerData.description,
          specializations: partnerData.specializations
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
        };

        await adminFetchers.updateRecruitmentPartner(
          editingPartner._id,
          updateData
        );

        const updatedPartner = {
          ...editingPartner,
          ...updateData,
          user: {
            ...editingPartner.user,
            email: partnerData.email,
          },
        };

        setPartners(
          partners.map((emp) =>
            emp._id === editingPartner._id ? updatedPartner : emp
          )
        );

        setIsEditModalOpen(false);
        setEditingPartner(null);
        toast.success("Recruitment Partner updated successfully!");
      } else if (isAddModalOpen) {
        // Add new partner
        const createData = {
          ownerName: partnerData.ownerName,
          companyName: partnerData.companyName,
          email: partnerData.email,
          phoneNumber: partnerData.phoneNumber,
          address: partnerData.address,
          city: partnerData.city,
          state: partnerData.state,
          zipCode: partnerData.zipCode,
          country: partnerData.country,
          isApproved: partnerData.isApproved,
          website: partnerData.website,
          description: partnerData.description,
          specializations: partnerData.specializations
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
        };

        const response = await adminFetchers.createRecruitmentPartner(
          createData
        );

        // Refresh the partners list to get the latest data
        fetchPartners();

        setIsAddModalOpen(false);
        toast.success("Recruitment Partner added successfully!");
      }
    } catch (err: any) {
      console.error("Error saving recruitment partner:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Error saving recruitment partner. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Table columns configuration
  const columns: TableColumn<RecruitmentPartner>[] = [
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
      responsive: "md",
      searchable: true,
      width: "64",
      className: "truncate",
      render: (value: any, row: RecruitmentPartner) => row.user?.email || "No email",
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
  const actions: TableAction<RecruitmentPartner>[] = [
    createEditAction(handleEditPartner),
    createViewAction(handleViewProfile),
    {
      label: "Toggle Status",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: handleToggleStatus,
      variant: "warning",
    },
    createDeleteAction(handleDeletePartner),
  ];

  // Statistics
  const totalPartners = partners.length;
  const activePartners = partners.filter(partner => partner.isApproved).length;
  const pendingPartners = partners.filter(partner => !partner.isApproved).length;

  // Statistics cards
  const statCards: StatCard[] = [
    {
      title: "Total Partners",
      value: totalPartners,
      subtitle: "All registered",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      variant: "primary",
    },
    {
      title: "Active",
      value: activePartners,
      subtitle: "Approved partners",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      variant: "success",
    },
    {
      title: "Pending",
      value: pendingPartners,
      subtitle: "Awaiting approval",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      variant: "warning",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <GenericTable
          data={partners}
          columns={columns}
          actions={actions}
          loading={loading}
          error={error || null}
          title="Recruitment Partner Management"
          searchPlaceholder="Search recruitment partners..."
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
          partner={selectedPartner}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Add Partner Modal */}
        <PartnerFormModal
          partner={null}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSavePartner}
          mode="add"
        />

        {/* Edit Partner Modal */}
        <PartnerFormModal
          partner={editingPartner}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSavePartner}
          mode="edit"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
