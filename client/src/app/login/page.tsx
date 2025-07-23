"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/hooks";
import Link from "next/link";
import Logo from "@/components/Logo";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { mutate: login, isPending: loading } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Login form submitted with:", { email, password });

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    console.log("About to call login mutation");

    login(
      { email, password },
      {
        onSuccess: (data) => {
          console.log("Login onSuccess callback called with data:", data);
          toast.success("Welcome back! Login successful");
          console.log("Attempting to redirect to /dashboard");

          // Try both router.push and window.location as a fallback
          try {
            router.push("/dashboard");
            console.log("router.push called successfully");
          } catch (error) {
            console.error("router.push failed:", error);
            // Fallback to window.location
            window.location.href = "/dashboard";
          }
        },
        onError: (err: any) => {
          console.error("Login onError callback called with error:", err);
          setError(err?.message || "Login failed");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <Logo size="md" showText={false} />

          {/* Header */}
          <div>
            <h2 className="text-4xl font-light text-blue-400 mb-2">
              Sign in
            </h2>
            <p className="text-gray-600 text-sm">
              Enter your detail below to access your account
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-gray-500 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  SIGNUP
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-3xl px-8">
            {/* Background decorative elements */}
            <div className="absolute top-16 left-12 w-24 h-24 opacity-20">
              <div className="w-full h-full border-4 border-blue-400 rounded-full relative">
                <div className="absolute inset-3 border-2 border-blue-500 rounded-full">
                  <div className="absolute inset-2 border-2 border-blue-600 rounded-full"></div>
                </div>
                {/* Gear teeth */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-blue-400"></div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-blue-400"></div>
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-4 h-2 bg-blue-400"></div>
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-4 h-2 bg-blue-400"></div>
              </div>
            </div>

            <div className="absolute top-32 right-16 w-16 h-16 opacity-20">
              <div className="w-full h-full border-3 border-indigo-400 rounded-full relative">
                <div className="absolute inset-2 border-2 border-indigo-500 rounded-full"></div>
                {/* Smaller gear teeth */}
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-3 bg-indigo-400"></div>
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-3 bg-indigo-400"></div>
                <div className="absolute -left-0.5 top-1/2 transform -translate-y-1/2 w-3 h-1.5 bg-indigo-400"></div>
                <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-3 h-1.5 bg-indigo-400"></div>
              </div>
            </div>

            {/* Main illustration container */}
            <div className="relative flex items-center justify-center min-h-[600px]">
              
              {/* Browser window with profiles */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl p-1 w-80 z-10">
                <div className="bg-gray-100 rounded-t-lg p-3 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1 bg-white rounded mx-3 px-3 py-1.5">
                    <div className="w-full h-2 bg-blue-500 rounded"></div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {/* Profile 1 */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 bg-orange-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  {/* Profile 2 */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 bg-pink-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* People illustrations */}
              <div className="flex items-end justify-center space-x-12 mt-32">
                
                {/* Person 1 - Sitting with laptop */}
                <div className="relative">
                  {/* Desk/Table */}
                  <div className="absolute bottom-0 w-24 h-2 bg-gray-400 rounded"></div>
                  {/* Laptop */}
                  <div className="absolute bottom-2 left-2 w-16 h-10 bg-gray-700 rounded-sm">
                    <div className="w-full h-6 bg-gray-300 rounded-t-sm"></div>
                  </div>
                  {/* Person */}
                  <div className="relative">
                    {/* Head */}
                    <div className="w-14 h-14 bg-peach-300 rounded-full mx-auto mb-2 relative">
                      <div className="absolute top-2 left-3 w-2 h-2 bg-gray-800 rounded-full"></div>
                      <div className="absolute top-2 right-3 w-2 h-2 bg-gray-800 rounded-full"></div>
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-gray-800 rounded"></div>
                      {/* Hair */}
                      <div className="absolute -top-1 left-1 w-12 h-8 bg-gray-800 rounded-t-full"></div>
                    </div>
                    {/* Body */}
                    <div className="w-18 h-20 bg-blue-600 rounded-t-lg mx-auto relative">
                      {/* Tie */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-12 bg-red-600"></div>
                      {/* Arms */}
                      <div className="absolute top-4 -left-2 w-6 h-3 bg-blue-600 rounded-full transform rotate-45"></div>
                      <div className="absolute top-4 -right-2 w-6 h-3 bg-blue-600 rounded-full transform -rotate-45"></div>
                    </div>
                    {/* Legs */}
                    <div className="flex justify-center space-x-1">
                      <div className="w-3 h-12 bg-gray-800 rounded-b-lg"></div>
                      <div className="w-3 h-12 bg-gray-800 rounded-b-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Person 2 - Standing (Woman) */}
                <div className="relative">
                  {/* Person */}
                  <div className="relative">
                    {/* Head */}
                    <div className="w-12 h-12 bg-peach-200 rounded-full mx-auto mb-2 relative">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-gray-800 rounded-full"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-gray-800 rounded-full"></div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-red-400 rounded"></div>
                      {/* Hair */}
                      <div className="absolute -top-1 left-0 w-12 h-10 bg-red-800 rounded-t-full"></div>
                    </div>
                    {/* Body */}
                    <div className="w-16 h-22 bg-red-500 rounded-lg mx-auto relative">
                      {/* Arms */}
                      <div className="absolute top-2 -left-2 w-5 h-3 bg-peach-200 rounded-full transform rotate-12"></div>
                      <div className="absolute top-2 -right-2 w-5 h-3 bg-peach-200 rounded-full transform -rotate-12"></div>
                    </div>
                    {/* Legs */}
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-14 bg-black rounded-b-lg"></div>
                      <div className="w-2 h-14 bg-black rounded-b-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Person 3 - With device/presentation */}
                <div className="relative">
                  {/* Device/Screen */}
                  <div className="absolute bottom-16 right-0 w-16 h-12 bg-gray-700 rounded">
                    <div className="w-full h-8 bg-blue-400 rounded-t">
                      <div className="p-2 space-y-1">
                        <div className="w-8 h-1 bg-white rounded"></div>
                        <div className="w-6 h-1 bg-white rounded"></div>
                        <div className="w-10 h-1 bg-white rounded"></div>
                      </div>
                    </div>
                  </div>
                  {/* Person */}
                  <div className="relative">
                    {/* Head */}
                    <div className="w-13 h-13 bg-peach-300 rounded-full mx-auto mb-2 relative">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-gray-800 rounded-full"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-gray-800 rounded-full"></div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-gray-800 rounded"></div>
                      {/* Hair */}
                      <div className="absolute -top-1 left-0 w-13 h-8 bg-gray-800 rounded-t-full"></div>
                    </div>
                    {/* Body */}
                    <div className="w-17 h-20 bg-blue-700 rounded-t-lg mx-auto relative">
                      {/* Tie */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-10 bg-blue-900"></div>
                      {/* Arms - one pointing */}
                      <div className="absolute top-4 -left-2 w-6 h-3 bg-peach-300 rounded-full transform rotate-0"></div>
                      <div className="absolute top-4 -right-2 w-6 h-3 bg-peach-300 rounded-full transform -rotate-45"></div>
                    </div>
                    {/* Legs */}
                    <div className="flex justify-center space-x-1">
                      <div className="w-3 h-12 bg-gray-800 rounded-b-lg"></div>
                      <div className="w-3 h-12 bg-gray-800 rounded-b-lg"></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating UI elements */}
              <div className="absolute top-40 right-20 w-10 h-10 bg-blue-500 rounded-full opacity-80 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              
              <div className="absolute bottom-32 left-20 w-8 h-8 bg-indigo-500 rounded-full opacity-70 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              
              <div className="absolute top-60 right-32 w-6 h-6 bg-purple-500 rounded-full opacity-60"></div>
              
              <div className="absolute bottom-40 right-16 w-12 h-12 bg-white rounded-lg shadow-lg p-2">
                <div className="w-full h-2 bg-blue-400 rounded mb-1"></div>
                <div className="w-3/4 h-2 bg-gray-300 rounded"></div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
