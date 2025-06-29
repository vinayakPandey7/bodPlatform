"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/auth.hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    data,
    isLoading: loading,
    isSuccess: isAuthenticated,
  } = useCurrentUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Extract user from the data object (matches /auth/me response structure)
  const user = data?.user;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [mounted, loading, isAuthenticated, user, router, allowedRoles]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 w-full h-full"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
