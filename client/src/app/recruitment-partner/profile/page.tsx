"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { toast } from "sonner";

interface RecruitmentPartner {
  _id: string;
  companyName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  specializations: string[];
  website: string;
  description: string;
  isVerified: boolean;
  createdAt: string;
}

export default function RecruitmentPartnerProfilePage() {
  const [profile, setProfile] = useState<RecruitmentPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<RecruitmentPartner>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/recruitment-partner/profile");
      setProfile(response.data.profile);
      setFormData(response.data.profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecializationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const specializations = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setFormData((prev) => ({
      ...prev,
      specializations,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.put("/recruitment-partner/profile", formData);
      setProfile(response.data.profile);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    }
  };

  const cancelEdit = () => {
    setFormData(profile || {});
    setEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
        <DashboardLayout>
          <div className="text-center py-12">
            <div className="text-red-600 text-lg">Profile not found</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["recruitment_partner"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Management
              </h1>
              <p className="mt-1 text-gray-600">
                Manage your recruitment partner profile information
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {profile.isVerified && (
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Verified
                </span>
              )}
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}



          <div className="bg-white rounded-lg shadow">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Company Name *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.companyName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactPersonName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Person Name *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      id="contactPersonName"
                      name="contactPersonName"
                      value={formData.contactPersonName || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {profile.contactPersonName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Email *
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Phone *
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.contactPhone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Website
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="specializations"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Specializations (comma-separated)
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      id="specializations"
                      name="specializations"
                      value={formData.specializations?.join(", ") || ""}
                      onChange={handleSpecializationsChange}
                      placeholder="e.g., IT, Healthcare, Finance"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <div className="py-2">
                      {profile.specializations &&
                      profile.specializations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No specializations added
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address
                </label>
                {editing ? (
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profile.address || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Description
                </label>
                {editing ? (
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your recruitment services and expertise..."
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profile.description || "No description provided"}
                  </p>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
                    <p className="text-gray-900 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {profile.isVerified
                          ? "Verified"
                          : "Pending Verification"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <p className="text-gray-900 py-2">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
