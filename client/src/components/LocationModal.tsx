"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, X, Navigation, Loader2 } from "lucide-react";
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

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationChange: (location: LocationInfo | null) => void;
  userDefaultZipCode?: string;
  className?: string;
}

export default function LocationModal({
  isOpen,
  onClose,
  onLocationChange,
  userDefaultZipCode,
  className = "",
}: LocationModalProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(
    null
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [zipCodeInput, setZipCodeInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleFallbackLocation = useCallback(async () => {
    if (userDefaultZipCode) {
      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/location/validate?zipCode=${encodeURIComponent(
            userDefaultZipCode
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
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
          toast.success(`Using your default location: ${data.fullLocation}`);
        } else {
          // Final fallback to 10001
          await handleFinalFallback();
        }
      } catch (error) {
        console.error("Error using default zip code:", error);
        await handleFinalFallback();
      } finally {
        setIsSearching(false);
      }
    } else {
      await handleFinalFallback();
    }
  }, [userDefaultZipCode, onLocationChange]);

  const handleFinalFallback = useCallback(async () => {
    try {
      const response = await fetch(`/api/location/validate?zipCode=10001`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
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
        toast.info(`Using default location: ${data.fullLocation}`);
      }
    } catch (error) {
      console.error("Error with final fallback:", error);
      toast.error("Unable to set location. Please try again.");
    }
  }, [onLocationChange]);

  const handleClose = useCallback(() => {
    // If no location is set, fall back to user's default zip code
    if (!currentLocation) {
      handleFallbackLocation();
    }
    onClose();
  }, [currentLocation, onClose, handleFallbackLocation]);

  // Close modal on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  // Load saved location from localStorage on mount
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]); // Remove onLocationChange from dependencies

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
              toast.success(`Location detected: ${data.fullLocation}`);
              onClose();
            } else {
              setError(data.message || "Unable to detect location");
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
            errorMessage =
              "Location access denied. Please enter zip code manually.";
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
        setZipCodeInput("");
        toast.success(`Location set: ${data.fullLocation}`);
        onClose();
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
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <MapPin className="h-6 w-6" />
            <h2 className="text-xl font-bold">Select Location</h2>
          </div>
          <p className="text-green-100 text-sm">
            Please provide your delivery location to see products at nearby
            stores
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Location Display */}
          {currentLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Current Location:</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                {currentLocation.fullLocation}
              </p>
            </div>
          )}

          {/* Location Options */}
          <div className="space-y-4">
            {/* Detect Location Button */}
            <button
              onClick={detectCurrentLocation}
              disabled={isDetecting}
              className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-xl font-medium transition-colors"
            >
              {isDetecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Navigation className="h-5 w-5" />
              )}
              <span className="cursor-pointer">
                {isDetecting ? "Detecting..." : "Detect my location"}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center space-x-4">
              <hr className="flex-1 border-gray-300" />
              <span className="text-gray-500 text-sm font-medium">OR</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Manual Entry */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Enter your delivery zip code
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={zipCodeInput}
                    onChange={(e) => setZipCodeInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., 10001"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    maxLength={5}
                  />
                </div>
                <button
                  onClick={searchByZipCode}
                  disabled={isSearching || !zipCodeInput.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Fallback Info */}
            {userDefaultZipCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 text-sm">
                  <strong>Note:</strong> If you close this dialog without
                  selecting a location, we'll use your registered zip code (
                  {userDefaultZipCode}) as the default.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full py-2 px-4 cursor-pointer text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
