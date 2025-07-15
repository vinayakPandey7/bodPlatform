"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function HomePage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only check if user is logged in if there's a token
    const checkAuthStatus = async () => {
      if (typeof window === "undefined") {
        setIsCheckingAuth(false);
        return;
      }

      const token =
        localStorage.getItem("TOKEN") || localStorage.getItem("token");

      if (!token) {
        // No token, show landing page
        setIsCheckingAuth(false);
        return;
      }

      try {
        // If there's a token, try to verify it
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            "https://bodplatform.onrender.com/api"
          }/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // User is authenticated, redirect to dashboard
            router.push("/dashboard");
            return;
          }
        } else if (response.status === 401) {
          // Token is invalid, clear it and show landing page
          localStorage.removeItem("TOKEN");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.log("Auth check failed, showing landing page");
      }

      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 w-full h-full"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Logo size="sm" />
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/employers"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                For Employers
              </Link>
              <Link
                href="/register?type=candidate"
                className="text-gray-600 hover:text-green-600 font-medium transition-colors"
              >
                Find Jobs
              </Link>
              <Link
                href="/register?type=recruitment-partner"
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                Recruiters
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Complete Recruitment Ecosystem
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Whether you're an employer looking to hire, a job seeker finding
            opportunities, a recruitment partner building placements, or an
            admin managing the platform - CIERO connects everyone
            in the hiring process.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link
              href="/register?type=employer"
              className="bg-blue-600 text-white px-6 py-4 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              I'm an Employer
            </Link>
            <Link
              href="/register?type=candidate"
              className="bg-green-600 text-white px-6 py-4 rounded-lg text-base font-semibold hover:bg-green-700 transition-colors text-center"
            >
              I'm Job Seeking
            </Link>
            <Link
              href="/register?type=recruitment-partner"
              className="bg-purple-600 text-white px-6 py-4 rounded-lg text-base font-semibold hover:bg-purple-700 transition-colors text-center"
            >
              I'm a Recruiter
            </Link>
            <Link
              href="/login"
              className="bg-gray-800 text-white px-6 py-4 rounded-lg text-base font-semibold hover:bg-gray-900 transition-colors text-center"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* User Type Sections */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Every Role in Recruitment
            </h2>
            <p className="text-xl text-gray-600">
              Tailored experiences for all stakeholders in the hiring process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Employers */}
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                For Employers
              </h3>
              <p className="text-gray-600 mb-4">
                Post jobs, manage applications, review candidates, and build
                your dream team with powerful hiring tools.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Job posting & management</li>
                <li>• Candidate screening</li>
                <li>• Application tracking</li>
                <li>• Hiring analytics</li>
              </ul>
              <Link
                href="/employers"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn More →
              </Link>
            </div>

            {/* Job Seekers */}
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                For Job Seekers
              </h3>
              <p className="text-gray-600 mb-4">
                Find your dream job, apply to positions, track applications, and
                connect with top employers.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Job search & filtering</li>
                <li>• Profile & resume builder</li>
                <li>• Application tracking</li>
                <li>• Career resources</li>
              </ul>
              <Link
                href="/register?type=candidate"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Start Job Search →
              </Link>
            </div>

            {/* Recruitment Partners */}
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                For Recruiters
              </h3>
              <p className="text-gray-600 mb-4">
                Manage candidates, browse job opportunities, build
                relationships, and grow your recruitment business.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Candidate management</li>
                <li>• Job opportunity access</li>
                <li>• Placement tracking</li>
                <li>• Performance analytics</li>
              </ul>
              <Link
                href="/register?type=recruitment-partner"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Join Network →
              </Link>
            </div>

            {/* Admins */}
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                For Admins
              </h3>
              <p className="text-gray-600 mb-4">
                Oversee platform operations, manage users, monitor activities,
                and ensure smooth platform functioning.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• User management</li>
                <li>• Platform oversight</li>
                <li>• Analytics & reporting</li>
                <li>• System administration</li>
              </ul>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Admin Login →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CIERO?
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive solutions for the entire recruitment ecosystem
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Matching
              </h3>
              <p className="text-gray-600">
                AI-powered algorithms connect the right candidates with the
                right opportunities, benefiting employers, job seekers, and
                recruiters alike.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verified Network
              </h3>
              <p className="text-gray-600">
                All users are verified to ensure quality interactions, creating
                a trusted environment for all stakeholders.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analytics & Insights
              </h3>
              <p className="text-gray-600">
                Comprehensive analytics help everyone make informed decisions
                and improve their recruitment performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Career or Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who trust CIERO for
            their recruitment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?type=employer"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Hiring
            </Link>
            <Link
              href="/register?type=candidate"
              className="bg-blue-700 text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Find Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Logo size="sm" />
              </div>
              <p className="text-gray-400">
                Your trusted partner in finding the right talent for your
                business.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/employers" className="hover:text-white">
                    Post Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/employers" className="hover:text-white">
                    Find Talent
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=employer"
                    className="hover:text-white"
                  >
                    Employer Registration
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/register?type=candidate"
                    className="hover:text-white"
                  >
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=candidate"
                    className="hover:text-white"
                  >
                    Career Resources
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=candidate"
                    className="hover:text-white"
                  >
                    Resume Help
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Recruiters</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/register?type=recruitment-partner"
                    className="hover:text-white"
                  >
                    Join Network
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=recruitment-partner"
                    className="hover:text-white"
                  >
                    Manage Candidates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=recruitment-partner"
                    className="hover:text-white"
                  >
                    View Opportunities
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                          <p>&copy; 2025 CIERO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
