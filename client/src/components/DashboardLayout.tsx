"use client";
import { useState, useEffect } from "react";
import { useCurrentUser, useLogout } from "@/lib/hooks/auth.hooks";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/components/Logo";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  // Extract user from the data object (matches /auth/me response structure)
  const user = data?.user;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    console.log("Logout button clicked");
    logout(undefined, {
      onSuccess: () => {
        console.log("Logout onSuccess callback called, redirecting to login");
        router.push("/login");
      },
      onError: (error) => {
        console.error("Logout onError callback called:", error);
        // Even if logout fails, redirect to login since local data is cleared
        router.push("/login");
      },
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 w-full h-full"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  const getNavigationItems = () => {
    if (user?.role === "candidate") {
      return [
        {
          name: "Dashboard",
          href: "/candidate/dashboard",
          current: pathname === "/candidate/dashboard",
        },
        {
          name: "Find Jobs",
          href: "/candidate/jobs",
          current: pathname === "/candidate/jobs",
        },
        {
          name: "My Applications",
          href: "/candidate/applications",
          current: pathname === "/candidate/applications",
        },
        {
          name: "Saved Jobs",
          href: "/candidate/saved-jobs",
          current: pathname === "/candidate/saved-jobs",
        },
        {
          name: "Profile",
          href: "/candidate/profile",
          current: pathname === "/candidate/profile",
        },
      ];
    } else if (user?.role === "employer") {
      return [
        {
          name: "Dashboard",
          href: "/employer/dashboard",
          current: pathname === "/employer/dashboard",
        },
        {
          name: "My Jobs",
          href: "/employer/jobs",
          current: pathname === "/employer/jobs",
        },
        {
          name: "Applications",
          href: "/employer/applications",
          current: pathname === "/employer/applications",
        },
        {
          name: "Saved Candidates",
          href: "/employer/saved-candidates",
          current: pathname === "/employer/saved-candidates",
        },
        {
          name: "Notifications",
          href: "/employer/notifications",
          current: pathname === "/employer/notifications",
        },
        {
          name: "Profile",
          href: "/employer/profile",
          current: pathname === "/employer/profile",
        },
      ];
    } else if (user?.role === "recruitment_partner") {
      return [
        {
          name: "Dashboard",
          href: "/recruitment-partner/dashboard",
          current: pathname === "/recruitment-partner/dashboard",
        },
        {
          name: "Browse Jobs",
          href: "/recruitment-partner/jobs",
          current: pathname === "/recruitment-partner/jobs",
        },
        {
          name: "My Applications",
          href: "/recruitment-partner/applications",
          current: pathname === "/recruitment-partner/applications",
        },
        {
          name: "Candidates",
          href: "/recruitment-partner/candidates",
          current: pathname === "/recruitment-partner/candidates",
        },
        {
          name: "Notifications",
          href: "/recruitment-partner/notifications",
          current: pathname === "/recruitment-partner/notifications",
        },
        {
          name: "Profile",
          href: "/recruitment-partner/profile",
          current: pathname === "/recruitment-partner/profile",
        },
      ];
    } else if (user?.role === "admin" || user?.role === "sub_admin") {
      return [
        {
          name: "Dashboard",
          href: "/admin/dashboard",
          current: pathname === "/admin/dashboard",
        },
        {
          name: "Employers",
          href: "/admin/employers",
          current: pathname === "/admin/employers",
        },
        {
          name: "Recruitment Partners",
          href: "/admin/recruitment-partners",
          current: pathname === "/admin/recruitment-partners",
        },
        {
          name: "Jobs Management",
          href: "/admin/jobs",
          current: pathname === "/admin/jobs",
        },
        {
          name: "Candidates",
          href: "/admin/candidates",
          current: pathname === "/admin/candidates",
        },
        {
          name: "Notifications",
          href: "/admin/notifications",
          current: pathname === "/admin/notifications",
        },
        {
          name: "Profile",
          href: "/admin/profile",
          current: pathname === "/admin/profile",
        },
      ];
    }
    return [];
  };

  const navigation = getNavigationItems();

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <Logo />
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? "bg-indigo-100 text-indigo-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.email}
                  </p>
                  <p className="text-xs font-medium text-gray-500 capitalize">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-2 w-full text-left text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === "candidate" && "Candidate Dashboard"}
              {user?.role === "employer" && "Employer Dashboard"}
              {user?.role === "recruitment_partner" &&
                "Recruitment Partner Dashboard"}
              {(user?.role === "admin" || user?.role === "sub_admin") &&
                "Admin Dashboard"}
            </h1>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
