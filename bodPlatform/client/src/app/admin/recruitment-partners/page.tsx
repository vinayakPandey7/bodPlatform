"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface RecruitmentPartner {
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
  isApproved: boolean;
}

export default function AdminRecruitmentPartnersPage() {
  const [partners, setPartners] = useState<RecruitmentPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/recruitment-partners");
      setPartners(response.data.recruitmentPartners || []);
    } catch (err: any) {
      console.error("Error fetching recruitment partners:", err);
      setError(
        err.response?.data?.message || "Failed to fetch recruitment partners"
      );
      // For demo purposes, use mock data if API fails
      setPartners([
        {
          _id: "1",
          user: {
            email: "recruiter@test.com",
            createdAt: new Date().toISOString(),
          },
          ownerName: "Jane Doe",
          companyName: "TalentBridge Recruiting",
          phoneNumber: "+1-555-0456",
          address: "456 Talent St",
          city: "New York",
          state: "New York",
          country: "United States",
          isApproved: true,
        },
        {
          _id: "2",
          user: {
            email: "newrecruiter@company.com",
            createdAt: new Date().toISOString(),
          },
          ownerName: "Mike Johnson",
          companyName: "Elite Talent Solutions",
          phoneNumber: "+1-555-0789",
          address: "789 Recruiter Ave",
          city: "Los Angeles",
          state: "California",
          country: "United States",
          isApproved: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePartner = async (partnerId: string) => {
    try {
      await api.put(`/admin/recruitment-partners/${partnerId}/approve`);
      setPartners(
        partners.map((partner) =>
          partner._id === partnerId ? { ...partner, isApproved: true } : partner
        )
      );
    } catch (err: any) {
      console.error("Error approving recruitment partner:", err);
      // For demo, just update the state
      setPartners(
        partners.map((partner) =>
          partner._id === partnerId ? { ...partner, isApproved: true } : partner
        )
      );
    }
  };

  const handleRejectPartner = async (partnerId: string) => {
    try {
      await api.delete(`/admin/recruitment-partners/${partnerId}/reject`);
      setPartners(partners.filter((partner) => partner._id !== partnerId));
    } catch (err: any) {
      console.error("Error rejecting recruitment partner:", err);
      // For demo, just update the state
      setPartners(partners.filter((partner) => partner._id !== partnerId));
    }
  };

  const filteredPartners = partners.filter((partner) => {
    if (filter === "approved") return partner.isApproved;
    if (filter === "pending") return !partner.isApproved;
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
                Recruitment Partner Management
              </h1>
              <p className="mt-1 text-gray-600">
                Review and manage recruitment partner registrations
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
                All ({partners.length})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Approved ({partners.filter((p) => p.isApproved).length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pending ({partners.filter((p) => !p.isApproved).length})
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
              {filteredPartners.length === 0 ? (
                <li className="p-6 text-center text-gray-500">
                  No recruitment partners found for the selected filter.
                </li>
              ) : (
                filteredPartners.map((partner) => (
                  <li key={partner._id}>
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {partner.companyName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Owner: {partner.ownerName}
                              </p>
                            </div>
                            {getStatusBadge(partner.isApproved)}
                          </div>

                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              {partner.user.email}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span>{" "}
                              {partner.phoneNumber}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span>{" "}
                              {partner.city}, {partner.state}
                            </div>
                            <div>
                              <span className="font-medium">Registered:</span>{" "}
                              {new Date(
                                partner.user.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Address:</span>{" "}
                            {partner.address}, {partner.city}, {partner.state},{" "}
                            {partner.country}
                          </div>
                        </div>

                        {!partner.isApproved && (
                          <div className="ml-4 flex space-x-2">
                            <button
                              onClick={() => handleApprovePartner(partner._id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectPartner(partner._id)}
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
                  {partners.length}
                </div>
                <div className="text-sm text-gray-600">Total Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {partners.filter((p) => p.isApproved).length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {partners.filter((p) => !p.isApproved).length}
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
