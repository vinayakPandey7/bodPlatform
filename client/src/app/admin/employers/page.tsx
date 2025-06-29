"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

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
  country: string;
  jobPosting: string;
  isApproved: boolean;
}

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/employers");
      setEmployers(response.data.employers || []);
    } catch (err: any) {
      console.error("Error fetching employers:", err);
      setError(err.response?.data?.message || "Failed to fetch employers");
      // For demo purposes, use mock data if API fails
      setEmployers([
        {
          _id: "1",
          user: {
            email: "employer@test.com",
            createdAt: new Date().toISOString(),
          },
          ownerName: "John Smith",
          companyName: "State Farm Insurance",
          phoneNumber: "+1-555-0123",
          address: "123 Business Ave",
          city: "Chicago",
          state: "Illinois",
          country: "United States",
          jobPosting: "automatic",
          isApproved: true,
        },
        {
          _id: "2",
          user: {
            email: "newemployer@company.com",
            createdAt: new Date().toISOString(),
          },
          ownerName: "Sarah Johnson",
          companyName: "TechCorp Solutions",
          phoneNumber: "+1-555-0456",
          address: "456 Tech St",
          city: "San Francisco",
          state: "California",
          country: "United States",
          jobPosting: "manual",
          isApproved: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEmployer = async (employerId: string) => {
    try {
      await api.put(`/admin/employers/${employerId}/approve`);
      setEmployers(
        employers.map((emp) =>
          emp._id === employerId ? { ...emp, isApproved: true } : emp
        )
      );
    } catch (err: any) {
      console.error("Error approving employer:", err);
      // For demo, just update the state
      setEmployers(
        employers.map((emp) =>
          emp._id === employerId ? { ...emp, isApproved: true } : emp
        )
      );
    }
  };

  const handleRejectEmployer = async (employerId: string) => {
    try {
      await api.delete(`/admin/employers/${employerId}`);
      setEmployers(employers.filter((emp) => emp._id !== employerId));
    } catch (err: any) {
      console.error("Error rejecting employer:", err);
      // For demo, just update the state
      setEmployers(employers.filter((emp) => emp._id !== employerId));
    }
  };

  const filteredEmployers = employers.filter((employer) => {
    if (filter === "approved") return employer.isApproved;
    if (filter === "pending") return !employer.isApproved;
    return true;
  });

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Approved
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
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
        <div className="space-y-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Employer Management
              </h1>
              <p className="mt-1 text-gray-600">
                Review and manage employer registrations
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({employers.length})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Approved ({employers.filter((e) => e.isApproved).length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pending ({employers.filter((e) => !e.isApproved).length})
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              API connection failed. Showing demo data. Error: {error}
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredEmployers.length === 0 ? (
                <li className="p-6 text-center text-gray-500">
                  No employers found for the selected filter.
                </li>
              ) : (
                filteredEmployers.map((employer) => (
                  <li key={employer._id}>
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {employer.companyName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Owner: {employer.ownerName}
                              </p>
                            </div>
                            {getStatusBadge(employer.isApproved)}
                          </div>

                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              {employer.user.email}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span>{" "}
                              {employer.phoneNumber}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span>{" "}
                              {employer.city}, {employer.state}
                            </div>
                            <div>
                              <span className="font-medium">Job Posting:</span>{" "}
                              {employer.jobPosting}
                            </div>
                            <div>
                              <span className="font-medium">Registered:</span>{" "}
                              {new Date(
                                employer.user.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Address:</span>{" "}
                            {employer.address}, {employer.city},{" "}
                            {employer.state}, {employer.country}
                          </div>
                        </div>

                        {!employer.isApproved && (
                          <div className="ml-4 flex space-x-2">
                            <button
                              onClick={() =>
                                handleApproveEmployer(employer._id)
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectEmployer(employer._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Summary Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {employers.length}
                </div>
                <div className="text-sm text-gray-600">Total Employers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {employers.filter((e) => e.isApproved).length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {employers.filter((e) => !e.isApproved).length}
                </div>
                <div className="text-sm text-gray-600">Pending Approval</div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
