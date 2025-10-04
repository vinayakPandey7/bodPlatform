"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function HomePage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [statsCount, setStatsCount] = useState({ jobs: 0, candidates: 0, companies: 0 });
  const [heroTextIndex, setHeroTextIndex] = useState(0);

  const heroTexts = [
    "Your Complete Recruitment Ecosystem",
    "Where Talent Meets Opportunity",
    "The Future of Professional Networking",
    "Connect. Recruit. Succeed."
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "HR Director, TechCorp",
      avatar: "SC",
      quote: "CIERO transformed our hiring process. We filled 15 positions in just 2 months!",
      company: "TechCorp",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Marcus Johnson",
      role: "Software Engineer",
      avatar: "MJ", 
      quote: "Found my dream job through CIERO's smart matching. The experience was seamless!",
      company: "StartupXYZ",
      gradient: "from-green-500 to-blue-500"
    },
    {
      name: "Elena Rodriguez",
      role: "Recruitment Partner",
      avatar: "ER",
      quote: "Increased my placements by 300% using CIERO's platform. It's a game-changer!",
      company: "Elite Recruiting",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const stats = [
    { label: "Jobs Posted", target: 12547, current: 0 },
    { label: "Candidates Hired", target: 8392, current: 0 },
    { label: "Partner Companies", target: 2156, current: 0 }
  ];

  const trustedCompanies = [
    "TechCorp", "StartupXYZ", "Global Solutions", "InnovateLab", "FutureWorks", "DataDrive"
  ];

  useEffect(() => {
    // Auth check logic
    const checkAuthStatus = async () => {
      if (typeof window === "undefined") {
        setIsCheckingAuth(false);
        return;
      }

      const token =
        localStorage.getItem("TOKEN") || localStorage.getItem("token");

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            "https://theciero.com/api"
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
            router.push("/dashboard");
            return;
          }
        } else if (response.status === 401) {
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

  // Hero text rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Testimonials rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animated stats counter
  useEffect(() => {
    const animateStats = () => {
      stats.forEach((stat, index) => {
        const increment = stat.target / 100;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.target) {
            current = stat.target;
            clearInterval(timer);
          }
          setStatsCount(prev => ({
            ...prev,
            [index === 0 ? 'jobs' : index === 1 ? 'candidates' : 'companies']: Math.floor(current)
          }));
        }, 30);
      });
    };

    const timer = setTimeout(animateStats, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 w-full h-full"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed"></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/employers"
                className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105"
              >
                For Employers
              </Link>
              <Link
                href="/register?type=candidate"
                className="text-gray-600 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105"
              >
                Find Jobs
              </Link>
              <Link
                href="/register?type=recruitment-partner"
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                Recruiters
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
        <div className="text-center">
          <div className="mb-6 h-16 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-gray-900 transition-all duration-500 transform">
              {heroTexts[heroTextIndex]}
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto animate-fade-in">
            Whether you're an employer looking to hire, a job seeker finding
            opportunities, a recruitment partner building placements - CIERO
            connects everyone in the hiring process.
          </p>
          
          {/* Animated Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600">{statsCount.jobs.toLocaleString()}+</div>
              <div className="text-gray-600">Jobs Posted</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-green-600">{statsCount.candidates.toLocaleString()}+</div>
              <div className="text-gray-600">Candidates Hired</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold text-purple-600">{statsCount.companies.toLocaleString()}+</div>
              <div className="text-gray-600">Partner Companies</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Link
              href="/register?type=employer"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center transform hover:scale-105 hover:shadow-xl"
            >
              <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                I'm an Employer
              </span>
            </Link>
            <Link
              href="/register?type=candidate"
              className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl text-base font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 text-center transform hover:scale-105 hover:shadow-xl"
            >
              <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                I'm Job Seeking
              </span>
            </Link>
            <Link
              href="/register?type=recruitment-partner"
              className="group bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl text-base font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-center transform hover:scale-105 hover:shadow-xl"
            >
              <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                I'm a Recruiter
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Rotating Testimonials Section */}
      <div className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              See what our community is saying about their CIERO experience
            </p>
          </div>
          
          <div className="relative h-64 overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 transform ${
                  index === currentTestimonial 
                    ? 'translate-x-0 opacity-100' 
                    : index < currentTestimonial 
                      ? '-translate-x-full opacity-0' 
                      : 'translate-x-full opacity-0'
                }`}
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg mr-4`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-lg text-gray-700 italic">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trusted Companies */}
      <div className="py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-gray-500 text-sm font-medium mb-8">
            TRUSTED BY LEADING COMPANIES
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {trustedCompanies.map((company, index) => (
              <div
                key={index}
                className="text-center opacity-60 hover:opacity-100 transition-all duration-300 transform hover:scale-105"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="font-semibold text-gray-700 text-sm">{company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced User Type Sections */}
      <div className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Every Role in Recruitment
            </h2>
            <p className="text-xl text-gray-600">
              Tailored experiences for all stakeholders in the hiring process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Employers */}
            <div className="group text-center p-8 border border-gray-200 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm hover:bg-white">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-blue-600"
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                For Employers
              </h3>
              <p className="text-gray-600 mb-6">
                Post jobs, manage applications, review candidates, and build
                your dream team with powerful hiring tools.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Job posting & management
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Candidate screening
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Application tracking
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Hiring analytics
                </li>
              </ul>
              <Link
                href="/employers"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group-hover:scale-105 transition-all duration-300"
              >
                Learn More
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Job Seekers */}
            <div className="group text-center p-8 border border-gray-200 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm hover:bg-white">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-green-600"
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                For Job Seekers
              </h3>
              <p className="text-gray-600 mb-6">
                Find your dream job, apply to positions, track applications, and
                connect with top employers.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Job search & filtering
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Profile & resume builder
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Application tracking
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Career resources
                </li>
              </ul>
              <Link
                href="/register?type=candidate"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium group-hover:scale-105 transition-all duration-300"
              >
                Start Job Search
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Recruitment Partners */}
            <div className="group text-center p-8 border border-gray-200 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm hover:bg-white">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-purple-600"
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                For Recruiters
              </h3>
              <p className="text-gray-600 mb-6">
                Manage candidates, browse job opportunities, build
                relationships, and grow your recruitment business.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Candidate management
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Job opportunity access
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Placement tracking
                </li>
                <li className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Performance analytics
                </li>
              </ul>
              <Link
                href="/register?type=recruitment-partner"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium group-hover:scale-105 transition-all duration-300"
              >
                Join Network
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CIERO?
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive solutions for the entire recruitment ecosystem
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Smart Matching
              </h3>
              <p className="text-gray-600">
                AI-powered algorithms connect the right candidates with the
                right opportunities, benefiting employers, job seekers, and
                recruiters alike.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Verified Network
              </h3>
              <p className="text-gray-600">
                All users are verified to ensure quality interactions, creating
                a trusted environment for all stakeholders.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-purple-600"
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
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

      {/* Enhanced Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Career or Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who trust CIERO for their
            recruitment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?type=employer"
              className="group bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                Start Hiring
              </span>
            </Link>
            <Link
              href="/register?type=candidate"
              className="group bg-blue-700/50 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-800/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                Find Jobs
              </span>
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
                <Logo size="md" />
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
                  <Link href="/employers" className="hover:text-white transition-colors duration-300">
                    Post Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/employers" className="hover:text-white transition-colors duration-300">
                    Find Talent
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=employer"
                    className="hover:text-white transition-colors duration-300"
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
                    className="hover:text-white transition-colors duration-300"
                  >
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=candidate"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Career Resources
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=candidate"
                    className="hover:text-white transition-colors duration-300"
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
                    className="hover:text-white transition-colors duration-300"
                  >
                    Join Network
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=recruitment-partner"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Manage Candidates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=recruitment-partner"
                    className="hover:text-white transition-colors duration-300"
                  >
                    View Opportunities
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite 3s;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
