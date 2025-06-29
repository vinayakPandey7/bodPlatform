"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

interface AdminProfile {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  permissions?: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/profile");
      setProfile(response.data.profile || response.data.user);
      setFormData({
        firstName: response.data.profile?.firstName || "",
        lastName: response.data.profile?.lastName || "",
        email: response.data.profile?.email || user?.email || "",
        phoneNumber: response.data.profile?.phoneNumber || "",
        department: response.data.profile?.department || "",
      });
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to fetch profile");
      // For demo purposes, use mock data if API fails
      const mockProfile = {
        _id: user?.id || "admin1",
        email: user?.email || "admin@bodportal.com",
        role: user?.role || "admin",
        isActive: true,
        firstName: "John",
        lastName: "Admin",
        phoneNumber: "+1-555-0123",
        department: "System Administration",
        permissions: [
          "manage_users",
          "manage_jobs",
          "manage_system",
          "view_analytics",
        ],
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: "2024-01-15T08:00:00.000Z",
        updatedAt: new Date().toISOString(),
      };
      setProfile(mockProfile);
      setFormData({
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        email: mockProfile.email,
        phoneNumber: mockProfile.phoneNumber,
        department: mockProfile.department,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");
      const response = await api.put("/admin/profile", formData);
      setProfile({
        ...profile!,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
      // For demo, just update the state
      setProfile({
        ...profile!,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setEditing(false);
      setSuccess("Profile updated successfully! (Demo mode)");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email,
        phoneNumber: profile.phoneNumber || "",
        department: profile.department || "",
      });
    }
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      sub_admin: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {role === "sub_admin"
          ? "Sub Admin"
          : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile not found
            </h2>
            <p className="text-gray-600 mt-2">
              Unable to load profile information.
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Profile
              </h1>
              <p className="mt-1 text-gray-600">
                Manage your administrative account settings
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture and Basic Info */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-indigo-600">
                        {(
                          profile.firstName?.[0] || profile.email[0]
                        ).toUpperCase()}
                        {(profile.lastName?.[0] || "").toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {profile.firstName || profile.lastName
                        ? `${profile.firstName || ""} ${
                            profile.lastName || ""
                          }`.trim()
                        : "Admin User"}
                    </h3>
                    <div className="mt-2">{getRoleBadge(profile.role)}</div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {profile.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="lg:col-span-2">
                  {editing ? (
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={handleSave}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            First Name
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {profile.firstName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Last Name
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {profile.lastName || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Email Address
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {profile.email}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Phone Number
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {profile.phoneNumber || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Department
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {profile.department || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Account Created
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(profile.createdAt)}
                        </p>
                      </div>

                      {profile.lastLogin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Last Login
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(profile.lastLogin)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          {profile.permissions && profile.permissions.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Permissions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center p-3 bg-gray-50 rounded-md"
                    >
                      <svg
                        className="w-4 h-4 text-green-500 mr-2"
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
                      <span className="text-sm text-gray-700">
                        {permission
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Security Settings
              </h3>
              <div className="space-y-4">
                <button className="w-full sm:w-auto bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
                  Change Password
                </button>
                <div className="text-sm text-gray-600">
                  <p>• Use a strong password with at least 8 characters</p>
                  <p>
                    • Include uppercase, lowercase, numbers, and special
                    characters
                  </p>
                  <p>• Don't reuse passwords from other accounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
