"use client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CandidateDashboard() {
  const router = useRouter();

  return (
    <ProtectedRoute allowedRoles={["candidate", "recruitment_partner"]}>
      <DashboardLayout>
        <div className="space-y-6 text-black">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidate Dashboard
            </h1>
            <p className="mt-1 text-gray-600">
              Find and apply to jobs near your location
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => router.push("/candidate/jobs")}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
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
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Find Jobs
                  </h3>
                  <p className="text-gray-600">
                    Search for jobs near your location
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer opacity-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    My Applications
                  </h3>
                  <p className="text-gray-600">Track your job applications</p>
                  <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer opacity-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                  <p className="text-gray-600">
                    Update your profile and resume
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Search Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Job Search
            </h2>
            <p className="text-gray-600 mb-4">
              Enter your zip code to start finding jobs in your area within a
              5-mile radius.
            </p>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Enter your zip code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={5}
                pattern="\\d{5}"
              />
              <button
                onClick={() => router.push("/candidate/jobs")}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Search Jobs
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              How Job Search Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-semibold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Enter Your Location
                </h3>
                <p className="text-sm text-gray-600">
                  Provide your zip code to find jobs in your area
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-semibold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Browse Local Jobs
                </h3>
                <p className="text-sm text-gray-600">
                  See all available jobs within 5 miles of your location
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-semibold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Apply Directly
                </h3>
                <p className="text-sm text-gray-600">
                  Apply to jobs that match your skills and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
