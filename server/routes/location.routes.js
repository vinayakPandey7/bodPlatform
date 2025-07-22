const express = require("express");
const router = express.Router();
const { getCityFromZipCode, validateUSZipCode } = require("../utils/geoUtils");

/**
 * Validate zip code and get location information (GET endpoint for frontend)
 * GET /api/location/validate?zipCode=12345
 */
router.get("/validate", async (req, res) => {
  try {
    const { zipCode } = req.query;

    if (!zipCode) {
      return res.status(400).json({
        success: false,
        message: "Zip code is required",
        error: "ZIP_CODE_REQUIRED",
      });
    }

    // Validate zip code format
    if (!validateUSZipCode(zipCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid US zip code format. Must be 5 digits.",
        error: "INVALID_ZIP_CODE_FORMAT",
      });
    }

    // Get city information
    const locationInfo = await getCityFromZipCode(zipCode);

    if (!locationInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or unsupported zip code. Please use a valid US zip code.",
        error: "LOCATION_NOT_FOUND",
        zipCode: zipCode.replace(/[^0-9]/g, "").slice(0, 5),
      });
    }

    res.json({
      success: true,
      message: "Location information found",
      zipCode: locationInfo.zipCode || zipCode,
      city: locationInfo.city,
      state: locationInfo.state,
      county: locationInfo.county,
      coordinates: locationInfo.coordinates,
      fullLocation: `${locationInfo.city}, ${locationInfo.state}`,
    });
  } catch (error) {
    console.error("Error in zip code validation:", error);
    res.status(400).json({
      success: false,
      message:
        "Invalid or unsupported zip code. Please use a valid US zip code.",
      error: "VALIDATION_ERROR",
    });
  }
});

/**
 * Get location information from zip code
 * POST /api/location/lookup-zipcode
 */
router.post("/lookup-zipcode", async (req, res) => {
  try {
    const { zipCode } = req.body;

    if (!zipCode) {
      return res.status(400).json({
        success: false,
        message: "Zip code is required",
        error: "ZIP_CODE_REQUIRED",
      });
    }

    // Validate zip code format
    if (!validateUSZipCode(zipCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid US zip code format",
        error: "INVALID_ZIP_CODE_FORMAT",
      });
    }

    // Get city information
    const locationInfo = await getCityFromZipCode(zipCode);

    if (!locationInfo) {
      return res.status(404).json({
        success: false,
        message: "Location information not found for this zip code",
        error: "LOCATION_NOT_FOUND",
        zipCode: zipCode.replace(/[^0-9]/g, "").slice(0, 5),
      });
    }

    res.json({
      success: true,
      message: "Location information found",
      zipCode: locationInfo.zipCode,
      city: locationInfo.city,
      state: locationInfo.state,
      county: locationInfo.county,
      coordinates: locationInfo.coordinates,
      fullLocation: `${locationInfo.city}, ${locationInfo.state} ${locationInfo.zipCode}`,
      data: {
        zipCode: locationInfo.zipCode,
        city: locationInfo.city,
        state: locationInfo.state,
        county: locationInfo.county,
        coordinates: locationInfo.coordinates,
        fullLocation: `${locationInfo.city}, ${locationInfo.state} ${locationInfo.zipCode}`,
      },
    });
  } catch (error) {
    console.error("Error in zip code lookup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while looking up zip code",
      error: "INTERNAL_ERROR",
    });
  }
});

/**
 * Validate coordinates and reverse geocode
 * POST /api/location/validate-coordinates
 */
router.post("/validate-coordinates", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
        error: "COORDINATES_REQUIRED",
      });
    }

    // Validate coordinate format
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinate format",
        error: "INVALID_COORDINATES",
      });
    }

    // Check if coordinates are within US bounds
    const { isWithinUSBounds } = require("../utils/geoUtils");
    const withinUS = isWithinUSBounds([lon, lat]);

    if (!withinUS) {
      return res.status(200).json({
        success: false,
        message: "Coordinates are outside United States boundaries",
        error: "COORDINATES_OUTSIDE_US",
        coordinates: [lon, lat],
      });
    }

    res.json({
      success: true,
      message: "Coordinates are valid and within US boundaries",
      data: {
        coordinates: [lon, lat],
        latitude: lat,
        longitude: lon,
        withinUSBounds: true,
        locationDetected: true,
      },
    });
  } catch (error) {
    console.error("Error in coordinate validation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while validating coordinates",
      error: "INTERNAL_ERROR",
    });
  }
});

/**
 * Get geocoding service configuration and status
 * GET /api/location/config
 */
router.get("/config", (req, res) => {
  const { getGeocodingConfig } = require("../utils/geoUtils");

  try {
    const config = getGeocodingConfig();

    res.json({
      success: true,
      message: "Geocoding configuration retrieved successfully",
      ...config,
      instructions: {
        setupGuide: "See GEOCODING_SETUP.md for detailed setup instructions",
        googleApiSetup:
          "Add GOOGLE_MAPS_API_KEY to environment variables for best results",
        testEndpoints: {
          validate: "GET /api/location/validate?zipCode=90210",
          lookup: "POST /api/location/lookup-zipcode with { zipCode: '90210' }",
          coordinates:
            "POST /api/location/validate-coordinates with { latitude: 40.7128, longitude: -74.0060 }",
        },
      },
    });
  } catch (error) {
    console.error("Error getting geocoding config:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving geocoding configuration",
      error: "INTERNAL_ERROR",
    });
  }
});

/**
 * Test location detection capability
 * GET /api/location/test-detection
 */
router.get("/test-detection", (req, res) => {
  res.json({
    success: true,
    message: "Location detection endpoint available",
    instructions: {
      zipCodeLookup:
        "POST /api/location/lookup-zipcode with { zipCode: '12345' }",
      coordinateValidation:
        "POST /api/location/validate-coordinates with { latitude: 40.7128, longitude: -74.0060 }",
      browserLocationDetection:
        "Use navigator.geolocation.getCurrentPosition() in frontend, then validate coordinates",
    },
    supportedFeatures: [
      "US zip code to city/state lookup",
      "GPS coordinate validation",
      "US boundary checking",
      "Automatic location detection",
    ],
  });
});

module.exports = router;
