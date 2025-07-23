"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import CandidateProfileModal from "@/components/CandidateProfileModal";
import { User, Heart, Eye, MapPin, Mail, Phone } from "lucide-react";
import api from "@/lib/api";

interface SavedCandidate {
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      location?: string;
      headline?: string;
      profilePicture?: {
        cloudinaryUrl?: string;
      };
    };
    createdAt: string;
  };
  savedAt: string;
}

export default function EmployerSavedCandidatesPage() {
  const [candidates, setCandidates] = useState<SavedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchSavedCandidates();
  }, []);

  const fetchSavedCandidates = async () => {
    try {
      const response = await api.get("/employer/saved-candidates");
      setCandidates(response.data.savedCandidates || []);
    } catch (error: any) {
      console.error("Error fetching saved candidates:", error);
      setError("Failed to fetch saved candidates");
    } finally {
      setLoading(false);
    }
  };

  const removeCandidateFromSaved = async (candidateId: string) => {
    try {
      await api.put(`/employer/candidates/${candidateId}/save`);
      // Remove from local state
      setCandidates((prev) =>
        prev.filter((saved) => saved.candidate._id !== candidateId)
      );
    } catch (error: any) {
      console.error("Error removing candidate from saved:", error);
    }
  };

  const openCandidateProfile = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setIsProfileModalOpen(true);
  };

  const closeCandidateProfile = () => {
    setSelectedCandidateId(null);
    setIsProfileModalOpen(false);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["employer"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
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
    <ProtectedRoute allowedRoles={["employer"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Saved Candidates
            </h1>
            <p className="mt-1 text-gray-600">
              Candidates you&apos;ve saved for future consideration
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No saved candidates
              </h3>
              <p className="text-gray-600">
                Start saving candidates that interest you for future
                opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((savedCandidate) => {
                const candidate = savedCandidate.candidate;
                const personalInfo = candidate.personalInfo;
                const displayName = `${
                  personalInfo?.firstName || candidate.firstName || ""
                } ${personalInfo?.lastName || candidate.lastName || ""}`.trim();
                const displayEmail = personalInfo?.email || candidate.email;
                const displayPhone =
                  personalInfo?.phone || candidate.phoneNumber;

                return (
                  <div
                    key={candidate._id}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {personalInfo?.profilePicture?.cloudinaryUrl ? (
                            <img
                              src={personalInfo.profilePicture.cloudinaryUrl}
                              alt={displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {displayName || "Name Not Provided"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {personalInfo?.headline || "Professional"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCandidateFromSaved(candidate._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove from saved"
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {displayEmail || "Email not provided"}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {displayPhone || "Phone not provided"}
                      </div>

                      {personalInfo?.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {personalInfo.location}
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-2" />
                        Member since:{" "}
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <Heart className="w-4 h-4 mr-2" />
                        Saved on:{" "}
                        {new Date(savedCandidate.savedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => openCandidateProfile(candidate._id)}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Full Profile</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Candidate Profile Modal */}
        {selectedCandidateId && (
          <CandidateProfileModal
            candidateId={selectedCandidateId}
            isOpen={isProfileModalOpen}
            onClose={closeCandidateProfile}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
