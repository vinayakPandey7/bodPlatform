const {
  getCoordinatesFromZipCode,
  isWithinUSBounds,
} = require("../utils/geoUtils");

/**
 * Middleware to validate US location requirements
 * This middleware checks if the provided location data is valid for US-only operations
 */
const validateUSLocation = async (req, res, next) => {
  try {
    const { zipCode, city, state, country = "United States" } = req.body;

    // Check if country is US
    if (
      country &&
      country !== "United States" &&
      country !== "USA" &&
      country !== "US"
    ) {
      return res.status(400).json({
        message: "Only United States locations are supported on this platform",
        error: "INVALID_COUNTRY",
      });
    }

    // If zip code is provided, validate it
    if (zipCode) {
      try {
        const coordinates = await getCoordinatesFromZipCode(zipCode);

        // Check if coordinates are within US bounds
        if (!isWithinUSBounds(coordinates)) {
          return res.status(400).json({
            message:
              "Invalid zip code: Location is outside United States boundaries",
            error: "LOCATION_OUTSIDE_US",
          });
        }

        // Add coordinates to request for use in controllers
        req.locationData = {
          coordinates,
          zipCode,
          city,
          state,
          country: "United States",
        };
      } catch (error) {
        return res.status(400).json({
          message: "Invalid zip code: Unable to determine location coordinates",
          error: "INVALID_ZIP_CODE",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Location validation error:", error);
    res.status(500).json({
      message: "Error validating location data",
      error: error.message,
    });
  }
};

/**
 * Middleware to require zip code when location detection is not available
 * Used specifically for employer registration
 */
const requireZipCodeForEmployers = (req, res, next) => {
  const { locationDetected = false, zipCode } = req.body;

  // If location is not detected, zip code becomes mandatory
  if (!locationDetected && (!zipCode || zipCode.trim() === "")) {
    return res.status(400).json({
      message:
        "Zip code is mandatory for employer registration when location detection is not available",
      error: "ZIP_CODE_REQUIRED",
    });
  }

  next();
};

/**
 * Middleware to ensure zip code is provided for job posting
 */
const requireZipCodeForJobs = (req, res, next) => {
  const { zipCode, city, state } = req.body;

  if (!zipCode || zipCode.trim() === "") {
    return res.status(400).json({
      message: "Zip code is mandatory for job posting in the United States",
      error: "ZIP_CODE_REQUIRED",
    });
  }

  if (!city || city.trim() === "" || !state || state.trim() === "") {
    return res.status(400).json({
      message: "City and state are required for job posting",
      error: "CITY_STATE_REQUIRED",
    });
  }

  next();
};

/**
 * Middleware to ensure zip code is provided for candidate registration
 */
const requireZipCodeForCandidates = (req, res, next) => {
  const { zipCode, city, state } = req.body;

  if (!zipCode || zipCode.trim() === "") {
    return res.status(400).json({
      message:
        "Zip code is mandatory for candidate registration in the United States",
      error: "ZIP_CODE_REQUIRED",
    });
  }

  if (!city || city.trim() === "" || !state || state.trim() === "") {
    return res.status(400).json({
      message: "City and state are required for candidate registration",
      error: "CITY_STATE_REQUIRED",
    });
  }

  next();
};

module.exports = {
  validateUSLocation,
  requireZipCodeForEmployers,
  requireZipCodeForJobs,
  requireZipCodeForCandidates,
};
