"use client";
import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Bell } from "lucide-react";

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

interface LocationBannerProps {
  currentLocation: LocationInfo | null;
  onLocationClick: () => void;
  className?: string;
  highlight?: boolean;
}

export default function LocationBanner({
  currentLocation,
  onLocationClick,
  className = "",
  highlight = false,
}: LocationBannerProps) {
  const [shouldPulse, setShouldPulse] = useState(highlight);

  useEffect(() => {
    if (highlight) {
      setShouldPulse(true);
      // Stop pulsing after 5 seconds
      const timer = setTimeout(() => setShouldPulse(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlight]);

  console.log("xbcv", currentLocation);

  return (
    <div className={`relative ${className}`}>
      {/* Highlight notification bar */}
      {highlight && !currentLocation && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <Bell className="h-4 w-4 animate-bounce" />
            <span>Please set your location to see jobs in your area!</span>
          </div>
        </div>
      )}

      {/* Delivery time estimate */}
    </div>
  );
}
