"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
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
          router.push("/login");
      }
    } else if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return null;
}
