"use client";
import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import CandidateModal from "@/components/CandidateModal";
import ResumePreviewModal from "@/components/ResumePreviewModal";
import api from "@/lib/api";

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  resume: string;
  resumeUrl?: string;
  resumeData?: {
    fileName: string;
    originalName: string;
    url: string;
    uploadDate: string;
    fileSize: string;
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    storageType?: string;
  };
  job: {
    _id: string;
    title: string;
    location: string;
  };
  isSaved: boolean;
  createdAt: string;
}

export default function RecruitmentPartnerCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState("");
  const [currentCandidateName, setCurrentCandidateName] = useState("");

  useEffect(() => {
    // Initial load
    resetAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCandidates = async (currentPage = 1, currentLimit = 20, append = false) => {
    try {
      const response = await api.get("/recruitment-partner/candidates", {
        params: { page: currentPage, limit: currentLimit },
      });
      const list = response.data.candidates || [];
      setTotal(response.data.total || 0);
      setHasMore(currentPage * currentLimit < (response.data.total || 0));
      if (append) {
        // De-duplicate by _id when appending
        setCandidates((prev) => {
          const combined = [...prev, ...list];
          const map = new Map<string, any>();
          combined.forEach((item: any) => {
            if (item && item._id) {
              map.set(item._id, item);
            }
          });
          return Array.from(map.values());
        });
      } else {
        setCandidates(list);
      }
    } catch (error: any) {
      setError("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const resetAndLoad = async () => {
    setLoading(true);
    setError("");
    setPage(1);
    setHasMore(true);
    await fetchCandidates(1, limit, false);
  };

  const handleAddCandidate = () => {
    setSelectedCandidate(null);
    setModalOpen(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleModalSuccess = () => {
    // Reset and load first page to include newly added/updated entries at top
    resetAndLoad();
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && !loadingMore && hasMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          fetchCandidates(nextPage, limit, true).finally(() => {
            setPage(nextPage);
            setLoadingMore(false);
          });
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [page, limit, loading, loadingMore, hasMore]);

  const previewResume = (candidate: Candidate) => {
    console.log("previewResume called with candidate:", candidate);
    console.log("candidate.resumeData:", candidate.resumeData);
    console.log("candidate.resumeUrl:", candidate.resumeUrl);
    console.log("candidate.resume:", candidate.resume);

    // Priority order: cloudinaryUrl > url > local file path
    const resumeUrl =
      candidate.resumeData?.cloudinaryUrl ||
      candidate.resumeData?.url ||
      candidate.resumeUrl ||
      (candidate.resume ? `/api/uploads/resumes/${candidate.resume}` : null);

    console.log("Final resumeUrl:", resumeUrl);

    if (resumeUrl) {
      setCurrentResumeUrl(resumeUrl);
      setCurrentCandidateName(candidate.name);
      setShowResumeModal(true);
    } else {
      console.error("No resume URL available for candidate:", candidate);
    }
  };

  const downloadResume = (candidate: Candidate) => {
    // Priority order: cloudinaryUrl > url > local file path
    const resumeUrl =
      candidate.resumeData?.cloudinaryUrl ||
      candidate.resumeData?.url ||
      candidate.resumeUrl ||
      (candidate.resume ? `/api/uploads/resumes/${candidate.resume}` : null);
    const fileName =
      candidate.resumeData?.originalName || `${candidate.name}-resume.pdf`;

    if (resumeUrl) {
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("No resume URL available for download:", candidate);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      shortlist: "bg-blue-100 text-blue-800",
      assessment: "bg-yellow-100 text-yellow-800",
      phone_interview: "bg-purple-100 text-purple-800",
      in_person_interview: "bg-indigo-100 text-indigo-800",
      background_check: "bg-orange-100 text-orange-800",
      selected: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      stand_by: "bg-gray-100 text-gray-800",
      no_response: "bg-gray-100 text-gray-600",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["recruitment_partner"]}>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
    <ProtectedRoute allowedRoles={["recruitment_partner"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Candidates
              </h1>
              <p className="mt-1 text-gray-600">
                Manage your candidate pool and track their progress
              </p>
            </div>
            <button
              onClick={handleAddCandidate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add New Candidate
            </button>
          </div>

          {/* Total count */}
          <div className="text-sm text-gray-600">Total: {total}</div>

          

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No candidates yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start building your candidate database by adding new profiles.
              </p>
              <button
                onClick={handleAddCandidate}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add Your First Candidate
              </button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            candidate.status
                          )}`}
                        >
                          {candidate.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    {candidate.isSaved && (
                      <div className="text-yellow-500">
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {candidate.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {candidate.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6"
                        />
                      </svg>
                      {candidate.job.title}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {candidate.job.location}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-500 mb-4">
                      Added on{" "}
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {(candidate.resume ||
                      candidate.resumeData ||
                      candidate.resumeUrl) && (
                      <>
                        <button
                          onClick={() => previewResume(candidate)}
                          className="flex-1 bg-indigo-600 text-white text-sm py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors text-center"
                        >
                          View Resume
                        </button>
                        <button
                          onClick={() => downloadResume(candidate)}
                          className="bg-green-600 text-white text-sm py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Download
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEditCandidate(candidate)}
                      className="bg-gray-600 text-white text-sm py-2 px-3 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Infinite scroll sentinel and loader (bottom) */}
            {hasMore && <div ref={sentinelRef} className="h-1" />}
            {loadingMore && (
              <div className="py-4 text-center text-gray-500">Loading more…</div>
            )}
            </>
          )}
        </div>

        {/* Candidate Modal */}
        <CandidateModal
          open={modalOpen}
          onClose={handleModalClose}
          candidate={selectedCandidate}
          onSuccess={handleModalSuccess}
        />

        {/* Resume Preview Modal */}
        <ResumePreviewModal
          isOpen={showResumeModal}
          onClose={() => setShowResumeModal(false)}
          resumeUrl={currentResumeUrl}
          candidateName={currentCandidateName}
          onDownload={() => {
            // Find the candidate with current resume URL and download
            const candidate = candidates.find(
              (c) =>
                c.resumeData?.cloudinaryUrl === currentResumeUrl ||
                c.resumeData?.url === currentResumeUrl ||
                c.resumeUrl === currentResumeUrl
            );
            if (candidate) {
              downloadResume(candidate);
            }
          }}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
