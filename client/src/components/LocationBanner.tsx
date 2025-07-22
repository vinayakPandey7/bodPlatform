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

      {/* Main location bar */}
      <div
        className={`
          bg-white border-b border-gray-200 px-4 py-3 cursor-pointer transition-all duration-300
          ${shouldPulse ? "animate-pulse bg-yellow-50 border-yellow-300" : ""}
          ${
            highlight && !currentLocation
              ? "border-l-4 border-l-orange-500 bg-orange-50"
              : ""
          }
          hover:bg-gray-50
        `}
        onClick={onLocationClick}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`
                p-2 rounded-lg transition-colors
                ${shouldPulse ? "bg-yellow-200" : "bg-gray-100"}
                ${highlight && !currentLocation ? "bg-orange-200" : ""}
              `}
            >
              <MapPin
                className={`
                  h-5 w-5 transition-colors
                  ${shouldPulse ? "text-yellow-700" : "text-gray-600"}
                  ${highlight && !currentLocation ? "text-orange-600" : ""}
                `}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {currentLocation ? "Location" : "Select your location"}
                </span>
                {highlight && !currentLocation && (
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
                      currentLocation
                        ? "text-green-600 font-medium"
                        : "text-gray-500"
                    }
                    ${highlight && !currentLocation ? "text-orange-600" : ""}
                  `}
                >
                  {currentLocation && currentLocation?.fullLocation?.length > 0
                    ? currentLocation.fullLocation
                    : "Choose your location to see nearby jobs"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery time estimate */}
    </div>
  );
}
