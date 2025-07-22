const axios = require("axios");
const {
  ZIP_CODE_DATABASE,
  GEOCODING_CONFIG,
  US_BOUNDARIES,
  DISTANCE_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("./constants");

/**
 * Enhanced Geocoding Service with multiple providers
 * Supports:
 * - Google Geocoding API (Primary - most accurate)
 * - OpenStreetMap Nominatim (Free fallback)
 * - Local database (Offline fallback)
 *
 * To use Google API, set GOOGLE_MAPS_API_KEY in your .env file
 * Get your API key from: https://developers.google.com/maps/documentation/geocoding/get-api-key
 */

/**
 * Get coordinates for a US zip code using multiple geocoding services
 * @param {string} zipCode - US zip code
 * @returns {Promise<[number, number]>} - [longitude, latitude]
 */
async function getCoordinatesFromZipCode(zipCode) {
  try {
    // Clean zip code (remove any extra formatting)
    const cleanZip = zipCode.replace(/[^0-9]/g, "").slice(0, 5);

    // Validate zip code format first
    if (!validateUSZipCode(cleanZip)) {
      throw new Error(`Invalid zip code format: ${zipCode}`);
    }

    // 1. Try Google Geocoding API first (most accurate)
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const coordinates = await getCoordinatesFromGoogle(cleanZip);
        if (coordinates) {
          console.log(`✅ Google API: Found coordinates for ${cleanZip}`);
          return coordinates;
        }
      } catch (error) {
        console.warn(`⚠️ Google API failed for ${cleanZip}:`, error.message);
      }
    }

    // 2. Try OpenStreetMap Nominatim (free but rate limited)
    try {
      const coordinates = await getCoordinatesFromOSM(cleanZip);
      if (coordinates) {
        console.log(`✅ OSM: Found coordinates for ${cleanZip}`);
        return coordinates;
      }
    } catch (error) {
      console.warn(`⚠️ OSM failed for ${cleanZip}:`, error.message);
    }

    // 3. Check local database as fallback
    if (ZIP_CODE_DATABASE[cleanZip]) {
      console.log(`✅ Local DB: Found coordinates for ${cleanZip}`);
      return ZIP_CODE_DATABASE[cleanZip].coordinates;
    }
    console.log(`❌ No coordinates found for zip code: ${cleanZip}`);

    // If all methods fail, throw an error
    console.error(`❌ No coordinates found for zip code: ${cleanZip}`);
    throw new Error(`Invalid or unsupported zip code: ${cleanZip}`);
  } catch (error) {
    console.error("Error getting coordinates for zip code:", error.message);
    throw error;
  }
}

/**
 * Get coordinates using Google Geocoding API
 * @param {string} zipCode - Cleaned zip code
 * @returns {Promise<[number, number]|null>} - [longitude, latitude] or null
 */
async function getCoordinatesFromGoogle(zipCode) {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: zipCode + ", USA",
          key: process.env.GOOGLE_MAPS_API_KEY,
          components: "country:US",
          region: "us",
        },
        timeout: 5000,
      }
    );

    if (
      response.data.status === "OK" &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const result = response.data.results[0];
      const location = result.geometry.location;

      // Validate it's actually a zip code result
      const hasPostalCode = result.types.includes("postal_code");
      if (hasPostalCode) {
        return [location.lng, location.lat];
      }
    }

    if (response.data.status === "ZERO_RESULTS") {
      throw new Error(`Zip code not found: ${zipCode}`);
    }

    if (response.data.status === "OVER_QUERY_LIMIT") {
      throw new Error("Google API quota exceeded");
    }

    throw new Error(`Google API error: ${response.data.status}`);
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("Google API timeout");
    }
    throw error;
  }
}

/**
 * Get coordinates using OpenStreetMap Nominatim (free service)
 * @param {string} zipCode - Cleaned zip code
 * @returns {Promise<[number, number]|null>} - [longitude, latitude] or null
 */
async function getCoordinatesFromOSM(zipCode) {
  try {
    // Be respectful with rate limiting (max 1 request per second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          postalcode: zipCode,
          country: "United States",
          format: "json",
          limit: 1,
          addressdetails: 1,
        },
        timeout: 5000,
        headers: {
          "User-Agent": "BOD-Platform/1.0 (Job Location Service)",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        return [lon, lat];
      }
    }

    throw new Error(`No results from OSM for zip code: ${zipCode}`);
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("OSM API timeout");
    }
    throw error;
  }
}

/**
 * Get city and state information from a US zip code using multiple geocoding services
 * @param {string} zipCode - US zip code
 * @returns {Promise<Object>} - {city, state, county, coordinates, zipCode}
 */
async function getCityFromZipCode(zipCode) {
  try {
    // Clean zip code (remove any extra formatting)
    const cleanZip = zipCode.replace(/[^0-9]/g, "").slice(0, 5);

    // Validate zip code format first
    if (!validateUSZipCode(cleanZip)) {
      throw new Error(`Invalid zip code format: ${zipCode}`);
    }

    // 1. Try Google Geocoding API first (most comprehensive address data)
    // if (process.env.GOOGLE_MAPS_API_KEY) {
    //   try {
    //     const locationInfo = await getCityFromGoogle(cleanZip);
    //     if (locationInfo) {
    //       console.log(`✅ Google API: Found location info for ${cleanZip}`);
    //       return locationInfo;
    //     }
    //   } catch (error) {
    //     console.warn(
    //       `⚠️ Google API failed for location info ${cleanZip}:`,
    //       error.message
    //     );
    //   }
    // }

    // 2. Try OpenStreetMap Nominatim
    try {
      const locationInfo = await getCityFromOSM(cleanZip);
      if (locationInfo) {
        console.log(`✅ OSM: Found location info for ${cleanZip}`);
        return locationInfo;
      }
    } catch (error) {
      console.warn(
        `⚠️ OSM failed for location info ${cleanZip}:`,
        error.message
      );
    }

    // 3. Check local database as fallback
    if (ZIP_CODE_DATABASE[cleanZip]) {
      console.log(`✅ Local DB: Found location info for ${cleanZip}`);
      return {
        city: ZIP_CODE_DATABASE[cleanZip].city,
        state: ZIP_CODE_DATABASE[cleanZip].state,
        county: ZIP_CODE_DATABASE[cleanZip].county,
        coordinates: ZIP_CODE_DATABASE[cleanZip].coordinates,
        zipCode: cleanZip,
      };
    }

    // If all methods fail, return null
    console.warn(`❌ No location information found for zip code: ${cleanZip}`);
    return null;
  } catch (error) {
    console.error(
      "Error getting city information for zip code:",
      error.message
    );
    throw error;
  }
}

/**
 * Get location info using Google Geocoding API
 * @param {string} zipCode - Cleaned zip code
 * @returns {Promise<Object|null>} - Location info object or null
 */
async function getCityFromGoogle(zipCode) {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: zipCode + ", USA",
          key: process.env.GOOGLE_MAPS_API_KEY,
          components: "country:US",
          region: "us",
        },
        timeout: 5000,
      }
    );

    if (
      response.data.status === "OK" &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const result = response.data.results[0];
      const location = result.geometry.location;

      // Extract address components
      const addressComponents = result.address_components;
      let city = "";
      let state = "";
      let county = "";

      addressComponents.forEach((component) => {
        if (component.types.includes("locality")) {
          city = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          state = component.short_name;
        } else if (component.types.includes("administrative_area_level_2")) {
          county = component.long_name;
        }
      });

      // Validate we have the essential information
      if (city && state) {
        return {
          city,
          state,
          county: county || `${city} County`,
          coordinates: [location.lng, location.lat],
          zipCode,
        };
      }
    }

    throw new Error(`Incomplete location data from Google for: ${zipCode}`);
  } catch (error) {
    throw error;
  }
}

/**
 * Get location info using OpenStreetMap Nominatim
 * @param {string} zipCode - Cleaned zip code
 * @returns {Promise<Object|null>} - Location info object or null
 */
async function getCityFromOSM(zipCode) {
  try {
    // Be respectful with rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          postalcode: zipCode,
          country: "United States",
          format: "json",
          limit: 1,
          addressdetails: 1,
        },
        timeout: 5000,
        headers: {
          "User-Agent": "CIERO/1.0 (Job Location Service)",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      if (!isNaN(lat) && !isNaN(lon) && result.address) {
        const address = result.address;
        const city =
          address.city || address.town || address.village || address.hamlet;
        const state = address.state;

        if (city && state) {
          return {
            city,
            state,
            county: address.county || `${city} County`,
            coordinates: [lon, lat],
            zipCode,
          };
        }
      }
    }

    throw new Error(`No location data from OSM for: ${zipCode}`);
  } catch (error) {
    throw error;
  }
}

/**
 * Validate US zip code format
 * @param {string} zipCode - US zip code
 * @returns {boolean}
 */
function validateUSZipCode(zipCode) {
  if (!zipCode) return false;

  // Clean zip code (remove any extra formatting)
  const cleanZip = zipCode.replace(/[^0-9]/g, "");

  // US zip codes are 5 digits
  return /^\d{5}$/.test(cleanZip);
}

/**
 * Calculate distance between two points in miles
 * @param {[number, number]} coords1 - [longitude, latitude]
 * @param {[number, number]} coords2 - [longitude, latitude]
 * @returns {number} - Distance in miles
 */
function calculateDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Validate if coordinates are within US boundaries (approximate)
 * @param {[number, number]} coordinates - [longitude, latitude]
 * @returns {boolean}
 */
function isWithinUSBounds(coordinates) {
  const [lon, lat] = coordinates;

  // Approximate US boundaries
  // Continental US: lat 24.5 to 49.4, lon -125 to -66.9
  // Including Alaska and Hawaii for broader coverage
  return lat >= 18.9 && lat <= 71.4 && lon >= -179.1 && lon <= -66.9;
}

/**
 * Add sample zip code to local database (for testing purposes)
 * Note: This modifies the imported constant - use with caution
 * @param {string} zipCode - zip code to add
 * @param {Object} locationData - location data with coordinates, city, state, county
 */
function addSampleZipCode(zipCode, locationData) {
  // Note: This modifies the imported ZIP_CODE_DATABASE
  // Consider using a separate mutable database for dynamic entries
  ZIP_CODE_DATABASE[zipCode] = locationData;
}

/**
 * Get geocoding service status and configuration
 */
function getGeocodingConfig() {
  return {
    hasGoogleAPI: !!process.env.GOOGLE_MAPS_API_KEY,
    localDatabaseSize: Object.keys(ZIP_CODE_DATABASE).length,
    supportedServices: [
      {
        name: "Google Geocoding API",
        enabled: !!process.env.GOOGLE_MAPS_API_KEY,
        priority: 1,
        coverage: "Comprehensive US + International",
        rateLimit: "Based on API plan",
      },
      {
        name: "OpenStreetMap Nominatim",
        enabled: true,
        priority: 2,
        coverage: "Good US coverage",
        rateLimit: "1 request/second",
      },
      {
        name: "Local Database",
        enabled: true,
        priority: 3,
        coverage: `${Object.keys(ZIP_CODE_DATABASE).length} zip codes`,
        rateLimit: "No limit",
      },
    ],
  };
}

module.exports = {
  getCoordinatesFromZipCode,
  getCityFromZipCode,
  validateUSZipCode,
  calculateDistance,
  isWithinUSBounds,
  addSampleZipCode,
  getGeocodingConfig,
  ZIP_CODE_DATABASE,
};
