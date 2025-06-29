"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks";

export default function DashboardRedirect() {
  const { data, isLoading: loading, isError } = useCurrentUser();
  const router = useRouter();

  // Extract user from the data object (matches /auth/me response structure)
  const user = data?.user;

  useEffect(() => {
    console.log(
      "Dashboard redirect - Loading:",
      loading,
      "Error:",
      isError,
      "User:",
      user
    );

    if (loading) return; // Wait for loading to complete

    if (isError || !user) {
      // If there's an error or no user, redirect to login
      console.log("Redirecting to login - no user or error");
      router.push("/login");
      return;
    }

    if (user) {
      console.log(
        "User role:",
        user.role,
        "Redirecting to role-specific dashboard"
      );
      // Redirect based on user role
      switch (user.role) {
        case "employer":
          router.push("/employer/dashboard");
          break;
        case "recruitment_partner":
          router.push("/recruitment-partner/dashboard");
          break;
        case "admin":
        case "sub_admin":
          router.push("/admin/dashboard");
          break;
        default:
          console.log("Unknown role, redirecting to login");
          router.push("/login");
      }
    }
  }, [user, loading, isError, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 w-full h-full"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
