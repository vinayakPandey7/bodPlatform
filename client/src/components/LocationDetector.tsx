"use client";
import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";

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

interface LocationDetectorProps {
  onLocationChange?: (location: LocationInfo | null) => void;
  className?: string;
}

export default function LocationDetector({
  onLocationChange,
  className = "",
}: LocationDetectorProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(
    null
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [zipCodeInput, setZipCodeInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setCurrentLocation(location);
        onLocationChange?.(location);
      } catch (e) {
        console.error("Error parsing saved location:", e);
      }
    }
  }, [onLocationChange]);

  const detectCurrentLocation = async () => {
    setIsDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Use a reverse geocoding service to get location details
          const response = await fetch("/api/location/validate-coordinates", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude: latitude,
              longitude: longitude,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("cvbcvb", data);
            if (data.success) {
              const locationInfo: LocationInfo = {
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                fullLocation: data.fullLocation,
                coordinates: { lat: latitude, lng: longitude },
              };

              setCurrentLocation(locationInfo);
              localStorage.setItem(
                "userLocation",
                JSON.stringify(locationInfo)
              );
              onLocationChange?.(locationInfo);
              // Dispatch custom event for same-tab updates
              window.dispatchEvent(new Event("locationUpdated"));
            } else {
              toast.success(data?.message);
            }
          } else {
            throw new Error("Failed to validate coordinates");
          }
        } catch (error) {
          console.error("Error getting location details:", error);
          setError(
            "Unable to get location details. Please try searching by zip code."
          );
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to detect location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please search by zip code.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setError(errorMessage);
        setIsDetecting(false);
      }
    );
  };

  const searchByZipCode = async () => {
    if (!zipCodeInput.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/location/validate?zipCode=${encodeURIComponent(zipCodeInput)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("cvbcvb", response);
      if (response.ok && data.success) {
        const locationInfo: LocationInfo = {
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          fullLocation: data.fullLocation,
          coordinates: data.coordinates,
        };

        setCurrentLocation(locationInfo);
        localStorage.setItem("userLocation", JSON.stringify(locationInfo));
        onLocationChange?.(locationInfo);
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event("locationUpdated"));
        setShowSearch(false);
        setZipCodeInput("");
      } else {
        setError(data.message || "Invalid zip code");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setError("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchByZipCode();
    }
  };

  const clearLocation = () => {
    setCurrentLocation(null);
    localStorage.removeItem("userLocation");
    onLocationChange?.(null);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("locationUpdated"));
  };

  return (
    <div className={`relative ${className}`}>
      {currentLocation ? (
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {currentLocation.fullLocation}
          </span>
          <button
            onClick={() => setShowSearch(true)}
            className="text-xs text-green-600 hover:text-green-800 underline ml-2"
          >
            Change
          </button>
          <button
            onClick={clearLocation}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={detectCurrentLocation}
              disabled={isDetecting}
              className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span>{isDetecting ? "Detecting..." : "Detect my location"}</span>
            </button>

            <span className="text-sm text-gray-500">or</span>

            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search by zip code</span>
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>
      )}

      {showSearch && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Zip Code
              </label>
              <input
                type="text"
                value={zipCodeInput}
                onChange={(e) => setZipCodeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 10001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={5}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={searchByZipCode}
                disabled={isSearching || !zipCodeInput.trim()}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setZipCodeInput("");
                  setError(null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
