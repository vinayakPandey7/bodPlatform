"use client";
import { useEffect, useState, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/auth.hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Stable loading component that prevents layout shift
const LoadingComponent = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      {/* Simple Round Loader */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-16 h-16">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          
          {/* Inner pulse */}
          <div className="absolute inset-2 rounded-full bg-blue-600 animate-pulse opacity-20"></div>
          
          {/* Center dot */}
          <div className="absolute inset-6 rounded-full bg-blue-600 animate-bounce"></div>
        </div>
      </div>
    </div>
  </div>
));

LoadingComponent.displayName = 'LoadingComponent';

function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    data,
    isLoading,
    isSuccess: isAuthenticated,
    error,
  } = useCurrentUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Extract user from the data object (matches /auth/me response structure)
  const user = data?.user;

  // Memoize role check to prevent unnecessary recalculations
  const isAuthorizedRole = useMemo(() => {
    if (!allowedRoles || !user) return true; // If no roles specified or no user, don't block on role
    return allowedRoles.includes(user.role);
  }, [allowedRoles, user?.role]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    // Handle authentication errors or missing user
    if (error || (!isAuthenticated && !user)) {
      console.log("Redirecting to login - authentication failed or no user");
      router.push("/login");
      return;
    }

    // Handle role authorization
    if (user && allowedRoles && !isAuthorizedRole) {
      console.log("Redirecting to unauthorized - role not allowed");
      router.push("/unauthorized");
      return;
    }
  }, [mounted, isLoading, error, isAuthenticated, user, router, allowedRoles, isAuthorizedRole]);

  // Show loading only when needed and prevent layout shift
  if (!mounted || isLoading) {
    return <LoadingComponent />;
  }

  // Handle error state
  if (error) {
    console.error("Authentication error:", error);
    return <LoadingComponent />; // Show loading while redirecting
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    return <LoadingComponent />; // Show loading while redirecting
  }

  // Check authorization
  if (allowedRoles && !isAuthorizedRole) {
    return <LoadingComponent />; // Show loading while redirecting
  }

  return <>{children}</>;
}

export default memo(ProtectedRoute);
