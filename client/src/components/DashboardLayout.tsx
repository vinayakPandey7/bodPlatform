"use client";
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { useCurrentUser, useLogout } from "@/lib/hooks/auth.hooks";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  User,
  Briefcase,
  Building2,
  Bell,
  Users,
  UserPlus,
  Settings,
  HelpCircle,
  MessageSquare,
  BarChart3,
  Target,
  Clock,
  ChevronRight,
  LogOut,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Award,
  Calendar,
  Shield,
  TrendingUp,
} from "lucide-react";
import LocationDetector from "./LocationDetector";
import LocationBanner from "./LocationBanner";
import LocationModal from "./LocationModal";
import Tooltip from "./Tooltip";

interface LocationInfo {
  city: string;
  state: string;
  zipCode: string;
  fullLocation: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Memoized Navigation Item Component with stable props
const NavigationItem = memo(({ item }: { item: any }) => {
  const IconComponent = item.icon;

  return (
    <Link
      href={item.href}
      className={`group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        item.current
          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
      prefetch={true}
    >
      <div className="flex items-center">
        <IconComponent
          className={`mr-3 h-5 w-5 ${
            item.current
              ? "text-blue-600"
              : "text-gray-400 group-hover:text-gray-500"
          }`}
        />
        <span className="font-medium">{item.name}</span>
      </div>

      {item.badge && (
        <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-600 bg-blue-100 rounded-full">
          {item.badge}
        </span>
      )}

      {item.current && <ChevronRight className="h-4 w-4 text-blue-600" />}
    </Link>
  );
});

NavigationItem.displayName = "NavigationItem";

// Simple Profile Avatar Component
const ProfileAvatar = memo(
  ({ user, profileHref }: { user: any; profileHref: string }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    return (
      <div className="relative">
        <Link
          href={profileHref}
          onMouseEnter={(e) => {
            setShowTooltip(true);
            setAnchorEl(e.currentTarget);
          }}
          onMouseLeave={() => {
            setShowTooltip(false);
            setAnchorEl(null);
          }}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700">
              {user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace("_", " ") || "User"}
            </p>
          </div>
        </Link>

        <Tooltip
          text="Go to Profile"
          show={showTooltip}
          anchorEl={anchorEl}
          position="left"
        />
      </div>
    );
  }
);

ProfileAvatar.displayName = "ProfileAvatar";

interface LogoutButtonProps {
  onLogout: () => void;
}

// Simple Logout Button Component
const LogoutButton = memo(({ onLogout }: LogoutButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <div className="relative">
      <button
        onClick={onLogout}
        onMouseEnter={(e) => {
          setShowTooltip(true);
          setAnchorEl(e.currentTarget);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
          setAnchorEl(null);
        }}
        className="p-2 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none  text-gray-600 hover:text-red-600"
      >
        <LogOut className="h-5 w-5" />
      </button>

      <Tooltip
        text="Sign Out"
        show={showTooltip}
        anchorEl={anchorEl}
        position="right"
      />
    </div>
  );
});

LogoutButton.displayName = "LogoutButton";

// Memoized Sidebar Component with stable structure
const Sidebar = memo(
  ({
    user,
    navigation,
    profileHref,
  }: {
    user: any;
    navigation: any[];
    profileHref: string;
  }) => {
    return (
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-gray-100">
            <Logo />
          </div>

          {/* Navigation Section */}
          <div className="flex-grow flex flex-col py-6">
            <nav className="flex-1 px-3 space-y-1">
              {navigation.map((item) => (
                <NavigationItem key={item.href} item={item} />
              ))}
            </nav>
          </div>

          {/* General Section */}
          <div className="px-6 pb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              General
            </h2>
            <div className="space-y-1">
              <Link
                href={`${profileHref}?tab=security`}
                className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                <span className="font-medium">Settings</span>
              </Link>
              <Link
                href={`${profileHref}?tab=help`}
                className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <HelpCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                <span className="font-medium">Help Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Sidebar.displayName = "Sidebar";

// Mobile sidebar component
const MobileSidebar = memo(
  ({
    isOpen,
    onClose,
    user,
    navigation,
    profileHref,
  }: {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    navigation: any[];
    profileHref: string;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <Logo />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => (
              <NavigationItem key={item.href} item={item} />
            ))}
          </div>

          {/* General Section for Mobile */}
          <div className="px-6 pb-6 border-t border-gray-200">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-4">
              General
            </h2>
            <div className="space-y-1">
              <Link
                href={`${profileHref}?tab=security`}
                onClick={onClose}
                className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                <span className="font-medium">Settings</span>
              </Link>
              <Link
                href={`${profileHref}?tab=help`}
                onClick={onClose}
                className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <HelpCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                <span className="font-medium">Help Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MobileSidebar.displayName = "MobileSidebar";

// Static loading component to prevent layout shift
const LoadingLayout = memo(() => (
  <div className="h-screen flex overflow-hidden bg-gray-100">
    {/* Sidebar skeleton */}
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="ml-3">
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex-grow p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Main content skeleton */}
    <div className="flex flex-col flex-1 overflow-hidden">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-3.5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
      <main className="flex-1 relative overflow-y-auto">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  </div>
));

LoadingLayout.displayName = "LoadingLayout";

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data, isLoading, error } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [shouldHighlightLocation, setShouldHighlightLocation] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  // Load saved location from localStorage on mount and listen for changes
  useEffect(() => {
    const loadSavedLocation = () => {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          setUserLocation(location);
        } catch (e) {
          console.error("Error parsing saved location:", e);
        }
      } else {
        setUserLocation(null);
      }
    };

    // Load location on mount
    loadSavedLocation();

    // Listen for storage changes (from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userLocation") {
        loadSavedLocation();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events for same-tab updates
    const handleLocationUpdate = () => {
      loadSavedLocation();
    };

    window.addEventListener("locationUpdated", handleLocationUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("locationUpdated", handleLocationUpdate);
    };
  }, []);

  useEffect(() => {
    if (shouldHighlightLocation) {
      setShouldPulse(true);
      // Stop pulsing after 5 seconds
      const timer = setTimeout(() => setShouldPulse(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [shouldHighlightLocation]);

  // Extract user from the data object (matches /auth/me response structure)
  const user = data?.user;

  // Stable logout handler
  const handleLogout = useCallback(() => {
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
  }, [logout, router]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Memoize navigation items to prevent unnecessary recalculations
  const navigation = useMemo(() => {
    if (!user?.role) return [];

    const getNavigationItems = () => {
      if (user?.role === "candidate") {
        return [
          {
            name: "Dashboard",
            href: "/candidate/dashboard",
            current: pathname === "/candidate/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Find Jobs",
            href: "/candidate/jobs",
            current: pathname === "/candidate/jobs",
            icon: Search,
          },
          {
            name: "My Applications",
            href: "/candidate/applications",
            current: pathname === "/candidate/applications",
            icon: FileText,
          },
          {
            name: "Saved Jobs",
            href: "/candidate/saved-jobs",
            current: pathname === "/candidate/saved-jobs",
            icon: Bookmark,
          },
          {
            name: "Profile",
            href: "/candidate/profile",
            current: pathname === "/candidate/profile",
            icon: User,
          },
        ];
      } else if (user?.role === "employer") {
        return [
          {
            name: "Dashboard",
            href: "/employer/dashboard",
            current: pathname === "/employer/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "My Jobs",
            href: "/employer/jobs",
            current: pathname === "/employer/jobs",
            icon: Briefcase,
          },

          {
            name: "Saved Candidates",
            href: "/employer/saved-candidates",
            current: pathname === "/employer/saved-candidates",
            icon: Users,
          },
          {
            name: "Interview Calendar",
            href: "/employer/calendar",
            current: pathname === "/employer/calendar",
            icon: Calendar,
          },
          // {
          //   name: "Notifications",
          //   href: "/employer/notifications",
          //   current: pathname === "/employer/notifications",
          //   icon: Bell,
          //   badge: "3", // You can make this dynamic based on actual notification count
          // },
          {
            name: "Profile",
            href: "/employer/profile",
            current: pathname === "/employer/profile",
            icon: User,
          },
        ];
      } else if (user?.role === "recruitment_partner") {
        return [
          {
            name: "Dashboard",
            href: "/recruitment-partner/dashboard",
            current: pathname === "/recruitment-partner/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Candidates",
            href: "/recruitment-partner/candidates",
            current: pathname === "/recruitment-partner/candidates",
            icon: Users,
          },
          {
            name: "Clients",
            href: "/recruitment-partner/clients",
            current: pathname === "/recruitment-partner/clients",
            icon: Building2,
          },
          {
            name: "Jobs",
            href: "/recruitment-partner/jobs",
            current: pathname === "/recruitment-partner/jobs",
            icon: Briefcase,
          },
          // {
          //   name: "Placements",
          //   href: "/recruitment-partner/placements",
          //   current: pathname === "/recruitment-partner/placements",
          //   icon: Award,
          // },
          {
            name: "Applications",
            href: "/recruitment-partner/applications",
            current: pathname === "/recruitment-partner/applications",
            icon: FileText,
          },
          // {
          //   name: "Interviews",
          //   href: "/recruitment-partner/interviews",
          //   current: pathname === "/recruitment-partner/interviews",
          //   icon: Calendar,
          // },
          // {
          //   name: "Reports",
          //   href: "/recruitment-partner/reports",
          //   current: pathname === "/recruitment-partner/reports",
          //   icon: BarChart3,
          // },
          // {
          //   name: "Notifications",
          //   href: "/recruitment-partner/notifications",
          //   current: pathname === "/recruitment-partner/notifications",
          //   icon: Bell,
          //   badge: "3",
          // },
          {
            name: "Profile",
            href: "/recruitment-partner/profile",
            current: pathname === "/recruitment-partner/profile",
            icon: User,
          },
        ];
      } else if (user?.role === "sales_person") {
        return [
          {
            name: "Dashboard",
            href: "/sales/dashboard",
            current: pathname === "/sales/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "My Agents",
            href: "/sales/agents",
            current: pathname.startsWith("/sales/agents"),
            icon: Shield,
          },
          // {
          //   name: "Reports",
          //   href: "/sales/reports",
          //   current: pathname === "/sales/reports",s
          //   icon: BarChart3,
          // },
          {
            name: "Profile",
            href: "/sales/profile",
            current: pathname === "/sales/profile",
            icon: User,
          },
        ];
      } else if (user?.role === "admin" || user?.role === "sub_admin") {
        return [
          {
            name: "Dashboard",
            href: "/admin/dashboard",
            current: pathname === "/admin/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Employers",
            href: "/admin/employers",
            current: pathname === "/admin/employers",
            icon: Building2,
          },
          {
            name: "Recruitment Partners",
            href: "/admin/recruitment-partners",
            current: pathname === "/admin/recruitment-partners",
            icon: UserPlus,
          },
          {
            name: "Jobs Management",
            href: "/admin/jobs",
            current: pathname === "/admin/jobs",
            icon: Briefcase,
          },
          {
            name: "Candidates",
            href: "/admin/candidates",
            current: pathname === "/admin/candidates",
            icon: Users,
          },
          {
            name: "Sales Execute",
            href: "/admin/sales-execute",
            current: pathname.startsWith("/admin/sales-execute"),
            icon: TrendingUp,
          },
          {
            name: "Insurance Agents",
            href: "/admin/insurance-agents",
            current: pathname.startsWith("/admin/insurance-agents"),
            icon: Shield,
          },
          // {
          //   name: "Notifications",
          //   href: "/admin/notifications",
          //   current: pathname === "/admin/notifications",
          //   icon: Bell,
          // },
          {
            name: "Profile",
            href: "/admin/profile",
            current: pathname === "/admin/profile",
            icon: User,
          },
        ];
      }
      return [];
    };

    return getNavigationItems();
  }, [user?.role, pathname]);

  // Memoize dashboard title to prevent recalculation
  const dashboardTitle = useMemo(() => {
    // Find the current navigation item based on pathname
    const currentNavItem = navigation.find((item) => item.current);

    // Return the current section name if found, otherwise fallback to default
    if (currentNavItem) {
      return currentNavItem.name;
    }

    // Fallback for when no navigation item matches
    if (!user?.role) return "Dashboard";

    switch (user.role) {
      case "candidate":
        return "Dashboard";
      case "employer":
        return "Dashboard";
      case "recruitment_partner":
        return "Dashboard";
      case "admin":
      case "sub_admin":
        return "Dashboard";
      default:
        return "Dashboard";
    }
  }, [navigation, user?.role]);

  // Memoize profile href based on user role
  const profileHref = useMemo(() => {
    if (!user?.role) return "/profile";

    switch (user.role) {
      case "candidate":
        return "/candidate/profile";
      case "employer":
        return "/employer/profile";
      case "recruitment_partner":
        return "/recruitment-partner/profile";
      case "sales_person":
        return "/sales/profile";
      case "admin":
      case "sub_admin":
        return "/admin/profile";
      default:
        return "/profile";
    }
  }, [user?.role]);

  // Show loading layout that matches final layout structure
  if (isLoading || !user || !data) {
    return <LoadingLayout />;
  }

  // Handle errors gracefully
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-sm font-medium">
            Something went wrong
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar user={user} navigation={navigation} profileHref={profileHref} />

      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        user={user}
        navigation={navigation}
        profileHref={profileHref}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Location Banner for Candidates */}
        {user?.role === "candidate" && (
          <LocationBanner
            currentLocation={userLocation}
            onLocationClick={() => setShowLocationModal(true)}
            highlight={shouldHighlightLocation}
          />
        )}

        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-3.5 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-3"
                >
                  <Menu className="h-5 w-5" />
                </button>
                {user?.role === "candidate" ? (
                  <div className="flex-shrink-0 min-w-[400px]">
                    <div
                      className={`
                        bg-white cursor-pointer transition-all duration-300
                        ${
                          shouldPulse
                            ? "animate-pulse bg-yellow-50 border-yellow-300"
                            : ""
                        }
                        ${
                          shouldHighlightLocation && !userLocation
                            ? "border-l-4 border-l-orange-500 bg-orange-50"
                            : ""
                        }
                        hover:bg-gray-50
                      `}
                      onClick={() => setShowLocationModal(true)}
                    >
                      <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`
                              p-2 rounded-lg transition-colors
                              ${shouldPulse ? "bg-yellow-200" : "bg-gray-100"}
                              ${
                                shouldHighlightLocation && !userLocation
                                  ? "bg-orange-200"
                                  : ""
                              }
                            `}
                          >
                            <MapPin
                              className={`
                                h-5 w-5 transition-colors
                                ${
                                  shouldPulse
                                    ? "text-yellow-700"
                                    : "text-gray-600"
                                }
                                ${
                                  shouldHighlightLocation && !userLocation
                                    ? "text-orange-600"
                                    : ""
                                }
                              `}
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {userLocation
                                  ? "Location"
                                  : "Select your location"}
                              </span>
                              {shouldHighlightLocation && !userLocation && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <span
                                className={`
                                  text-sm transition-colors
                                  ${
                                    userLocation
                                      ? "text-green-600 font-medium"
                                      : "text-gray-500"
                                  }
                                  ${
                                    shouldHighlightLocation && !userLocation
                                      ? "text-orange-600"
                                      : ""
                                  }
                                `}
                              >
                                {userLocation &&
                                userLocation?.fullLocation?.length > 0
                                  ? userLocation.fullLocation
                                  : "Choose your location to see nearby jobs"}
                              </span>
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {dashboardTitle}
                  </h1>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Profile Avatar */}
                <ProfileAvatar user={user} profileHref={profileHref} />

                {/* Logout Button */}
                <LogoutButton onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>

      {/* Location Modal for Candidates */}
      {user?.role === "candidate" && (
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onLocationChange={(location) => {
            setUserLocation(location);
            if (location) {
              setShouldHighlightLocation(false);
            }
            // Dispatch custom event for same-tab updates
            window.dispatchEvent(new Event("locationUpdated"));
          }}
          userDefaultZipCode={user?.zipCode}
        />
      )}
    </div>
  );
}

export default memo(DashboardLayout);
