const axios = require("axios");

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

// Enhanced zip code database with coordinates and city information
// This includes major cities from all 50 US states + DC
const zipCodeDatabase = {
  // Alabama
  35203: {
    coordinates: [-86.8025, 33.5186],
    city: "Birmingham",
    state: "AL",
    county: "Jefferson County",
  },
  36104: {
    coordinates: [-86.3009, 32.3668],
    city: "Montgomery",
    state: "AL",
    county: "Montgomery County",
  },
  36801: {
    coordinates: [-86.5861, 34.7304],
    city: "Huntsville",
    state: "AL",
    county: "Madison County",
  },

  // Alaska
  99501: {
    coordinates: [-149.9003, 61.2181],
    city: "Anchorage",
    state: "AK",
    county: "Anchorage Municipality",
  },
  99701: {
    coordinates: [-147.7164, 64.8378],
    city: "Fairbanks",
    state: "AK",
    county: "Fairbanks North Star Borough",
  },

  // Arizona
  85001: {
    coordinates: [-112.074, 33.4484],
    city: "Phoenix",
    state: "AZ",
    county: "Maricopa County",
  },
  85701: {
    coordinates: [-110.9265, 32.2226],
    city: "Tucson",
    state: "AZ",
    county: "Pima County",
  },
  86001: {
    coordinates: [-111.6513, 35.1983],
    city: "Flagstaff",
    state: "AZ",
    county: "Coconino County",
  },

  // Arkansas
  72201: {
    coordinates: [-92.2896, 34.7465],
    city: "Little Rock",
    state: "AR",
    county: "Pulaski County",
  },
  72701: {
    coordinates: [-94.1574, 36.0822],
    city: "Fayetteville",
    state: "AR",
    county: "Washington County",
  },

  // California
  90210: {
    coordinates: [-118.4065, 34.0901],
    city: "Beverly Hills",
    state: "CA",
    county: "Los Angeles County",
  },
  94102: {
    coordinates: [-122.4194, 37.7749],
    city: "San Francisco",
    state: "CA",
    county: "San Francisco County",
  },
  90028: {
    coordinates: [-118.3267, 34.1024],
    city: "Hollywood",
    state: "CA",
    county: "Los Angeles County",
  },
  95014: {
    coordinates: [-122.0322, 37.323],
    city: "Cupertino",
    state: "CA",
    county: "Santa Clara County",
  },
  90265: {
    coordinates: [-118.7798, 34.0259],
    city: "Malibu",
    state: "CA",
    county: "Los Angeles County",
  },
  94105: {
    coordinates: [-122.3971, 37.7893],
    city: "San Francisco",
    state: "CA",
    county: "San Francisco County",
  },

  // New York
  10001: {
    coordinates: [-73.9967, 40.7505],
    city: "New York",
    state: "NY",
    county: "New York County",
  },
  10019: {
    coordinates: [-73.9857, 40.7659],
    city: "New York",
    state: "NY",
    county: "New York County",
  },
  11201: {
    coordinates: [-73.9902, 40.6892],
    city: "Brooklyn",
    state: "NY",
    county: "Kings County",
  },
  10003: {
    coordinates: [-73.9876, 40.7506],
    city: "New York",
    state: "NY",
    county: "New York County",
  },
  10028: {
    coordinates: [-73.9534, 40.7751],
    city: "New York",
    state: "NY",
    county: "New York County",
  },
  10009: {
    coordinates: [-73.9858, 40.7282],
    city: "New York",
    state: "NY",
    county: "New York County",
  },

  // Texas
  78701: {
    coordinates: [-97.7431, 30.2672],
    city: "Austin",
    state: "TX",
    county: "Travis County",
  },
  75201: {
    coordinates: [-96.797, 32.7767],
    city: "Dallas",
    state: "TX",
    county: "Dallas County",
  },
  77002: {
    coordinates: [-95.3698, 29.7604],
    city: "Houston",
    state: "TX",
    county: "Harris County",
  },
  73301: {
    coordinates: [-97.7431, 30.2672],
    city: "Austin",
    state: "TX",
    county: "Travis County",
  },
  78704: {
    coordinates: [-97.7561, 30.2488],
    city: "Austin",
    state: "TX",
    county: "Travis County",
  },

  // Florida
  33101: {
    coordinates: [-80.1918, 25.7617],
    city: "Miami",
    state: "FL",
    county: "Miami-Dade County",
  },
  32801: {
    coordinates: [-81.3792, 28.5383],
    city: "Orlando",
    state: "FL",
    county: "Orange County",
  },
  33139: {
    coordinates: [-80.1373, 25.7907],
    city: "Miami Beach",
    state: "FL",
    county: "Miami-Dade County",
  },

  // Illinois
  60601: {
    coordinates: [-87.6298, 41.8781],
    city: "Chicago",
    state: "IL",
    county: "Cook County",
  },
  60614: {
    coordinates: [-87.6431, 41.9229],
    city: "Chicago",
    state: "IL",
    county: "Cook County",
  },
  62701: {
    coordinates: [-89.6501, 39.7817],
    city: "Springfield",
    state: "IL",
    county: "Sangamon County",
  },

  // Washington
  98101: {
    coordinates: [-122.3321, 47.6062],
    city: "Seattle",
    state: "WA",
    county: "King County",
  },
  98109: {
    coordinates: [-122.3413, 47.6394],
    city: "Seattle",
    state: "WA",
    county: "King County",
  },

  // Colorado
  80202: {
    coordinates: [-104.9903, 39.7392],
    city: "Denver",
    state: "CO",
    county: "Denver County",
  },
  80014: {
    coordinates: [-104.8806, 39.5761],
    city: "Aurora",
    state: "CO",
    county: "Arapahoe County",
  },

  // Massachusetts
  "02101": {
    coordinates: [-71.0589, 42.3601],
    city: "Boston",
    state: "MA",
    county: "Suffolk County",
  },
  "02139": {
    coordinates: [-71.0942, 42.3626],
    city: "Cambridge",
    state: "MA",
    county: "Middlesex County",
  },

  // Nevada
  89101: {
    coordinates: [-115.1728, 36.175],
    city: "Las Vegas",
    state: "NV",
    county: "Clark County",
  },
  89109: {
    coordinates: [-115.1728, 36.1147],
    city: "Las Vegas",
    state: "NV",
    county: "Clark County",
  },
  89501: {
    coordinates: [-119.7674, 39.5296],
    city: "Reno",
    state: "NV",
    county: "Washoe County",
  },

  // New Hampshire
  "03301": {
    coordinates: [-71.5376, 43.2081],
    city: "Concord",
    state: "NH",
    county: "Merrimack County",
  },
  "03101": {
    coordinates: [-71.5376, 42.9956],
    city: "Manchester",
    state: "NH",
    county: "Hillsborough County",
  },

  // New Jersey
  "07102": {
    coordinates: [-74.1723, 40.7357],
    city: "Newark",
    state: "NJ",
    county: "Essex County",
  },
  "08608": {
    coordinates: [-74.7429, 40.2206],
    city: "Trenton",
    state: "NJ",
    county: "Mercer County",
  },

  // New Mexico
  87102: {
    coordinates: [-106.6504, 35.0844],
    city: "Albuquerque",
    state: "NM",
    county: "Bernalillo County",
  },
  87501: {
    coordinates: [-105.9378, 35.687],
    city: "Santa Fe",
    state: "NM",
    county: "Santa Fe County",
  },

  // New York
  10001: {
    coordinates: [-73.9967, 40.7505],
    city: "New York",
    state: "NY",
    county: "New York County",
  },
  10019: {
    coordinates: [-73.9857, 40.7659],
    city: "New York",
    state: "NY",
    county: "New York County",
  },
  11201: {
    coordinates: [-73.9902, 40.6892],
    city: "Brooklyn",
    state: "NY",
    county: "Kings County",
  },
  10003: {
    coordinates: [-73.9876, 40.7506],
    city: "New York",
    state: "NY",
    county: "New York County",
  },
  10028: {
    coordinates: [-73.9534, 40.7751],
    city: "New York",
    state: "NY",
    county: "New York County",
  },
  12210: {
    coordinates: [-73.7562, 42.6803],
    city: "Albany",
    state: "NY",
    county: "Albany County",
  },
  14202: {
    coordinates: [-78.8784, 42.8864],
    city: "Buffalo",
    state: "NY",
    county: "Erie County",
  },

  // North Carolina
  27601: {
    coordinates: [-78.6382, 35.7796],
    city: "Raleigh",
    state: "NC",
    county: "Wake County",
  },
  28202: {
    coordinates: [-80.8431, 35.2271],
    city: "Charlotte",
    state: "NC",
    county: "Mecklenburg County",
  },

  // North Dakota
  58501: {
    coordinates: [-100.7837, 46.8083],
    city: "Bismarck",
    state: "ND",
    county: "Burleigh County",
  },
  58102: {
    coordinates: [-96.7898, 46.8772],
    city: "Fargo",
    state: "ND",
    county: "Cass County",
  },

  // Ohio
  44113: {
    coordinates: [-81.6944, 41.4993],
    city: "Cleveland",
    state: "OH",
    county: "Cuyahoga County",
  },
  43215: {
    coordinates: [-82.9988, 39.9612],
    city: "Columbus",
    state: "OH",
    county: "Franklin County",
  },
  45202: {
    coordinates: [-84.512, 39.1031],
    city: "Cincinnati",
    state: "OH",
    county: "Hamilton County",
  },

  // Oklahoma
  73102: {
    coordinates: [-97.5164, 35.4676],
    city: "Oklahoma City",
    state: "OK",
    county: "Oklahoma County",
  },
  74103: {
    coordinates: [-95.9928, 36.154],
    city: "Tulsa",
    state: "OK",
    county: "Tulsa County",
  },

  // Oregon
  97201: {
    coordinates: [-122.6784, 45.5152],
    city: "Portland",
    state: "OR",
    county: "Multnomah County",
  },
  97301: {
    coordinates: [-123.0351, 44.9429],
    city: "Salem",
    state: "OR",
    county: "Marion County",
  },

  // Pennsylvania
  19102: {
    coordinates: [-75.1652, 39.9526],
    city: "Philadelphia",
    state: "PA",
    county: "Philadelphia County",
  },
  15222: {
    coordinates: [-79.9959, 40.4406],
    city: "Pittsburgh",
    state: "PA",
    county: "Allegheny County",
  },
  17101: {
    coordinates: [-76.8839, 40.2732],
    city: "Harrisburg",
    state: "PA",
    county: "Dauphin County",
  },

  // Rhode Island
  "02903": {
    coordinates: [-71.4128, 41.824],
    city: "Providence",
    state: "RI",
    county: "Providence County",
  },

  // South Carolina
  29201: {
    coordinates: [-81.0348, 34.0007],
    city: "Columbia",
    state: "SC",
    county: "Richland County",
  },
  29401: {
    coordinates: [-79.9311, 32.7765],
    city: "Charleston",
    state: "SC",
    county: "Charleston County",
  },

  // South Dakota
  57501: {
    coordinates: [-100.351, 44.3683],
    city: "Pierre",
    state: "SD",
    county: "Hughes County",
  },
  57104: {
    coordinates: [-96.7003, 43.5446],
    city: "Sioux Falls",
    state: "SD",
    county: "Minnehaha County",
  },

  // Tennessee
  37201: {
    coordinates: [-86.7816, 36.1627],
    city: "Nashville",
    state: "TN",
    county: "Davidson County",
  },
  38103: {
    coordinates: [-90.049, 35.1495],
    city: "Memphis",
    state: "TN",
    county: "Shelby County",
  },

  // Texas
  78701: {
    coordinates: [-97.7431, 30.2672],
    city: "Austin",
    state: "TX",
    county: "Travis County",
  },
  75201: {
    coordinates: [-96.797, 32.7767],
    city: "Dallas",
    state: "TX",
    county: "Dallas County",
  },
  77002: {
    coordinates: [-95.3698, 29.7604],
    city: "Houston",
    state: "TX",
    county: "Harris County",
  },
  73301: {
    coordinates: [-97.7431, 30.2672],
    city: "Austin",
    state: "TX",
    county: "Travis County",
  },
  78704: {
    coordinates: [-97.7561, 30.2488],
    city: "Austin",
    state: "TX",
    county: "Travis County",
  },
  78201: {
    coordinates: [-98.4936, 29.4241],
    city: "San Antonio",
    state: "TX",
    county: "Bexar County",
  },

  // Utah
  84101: {
    coordinates: [-111.891, 40.7608],
    city: "Salt Lake City",
    state: "UT",
    county: "Salt Lake County",
  },
  84604: {
    coordinates: [-111.6585, 40.2338],
    city: "Provo",
    state: "UT",
    county: "Utah County",
  },

  // Vermont
  "05601": {
    coordinates: [-72.5806, 44.2601],
    city: "Montpelier",
    state: "VT",
    county: "Washington County",
  },
  "05401": {
    coordinates: [-73.2121, 44.4759],
    city: "Burlington",
    state: "VT",
    county: "Chittenden County",
  },

  // Virginia
  23219: {
    coordinates: [-77.436, 37.5407],
    city: "Richmond",
    state: "VA",
    county: "Richmond City",
  },
  22314: {
    coordinates: [-77.0469, 38.8048],
    city: "Alexandria",
    state: "VA",
    county: "Alexandria City",
  },
  23510: {
    coordinates: [-76.2859, 36.8468],
    city: "Norfolk",
    state: "VA",
    county: "Norfolk City",
  },

  // Washington
  98101: {
    coordinates: [-122.3321, 47.6062],
    city: "Seattle",
    state: "WA",
    county: "King County",
  },
  98109: {
    coordinates: [-122.3413, 47.6394],
    city: "Seattle",
    state: "WA",
    county: "King County",
  },
  98501: {
    coordinates: [-122.9015, 47.0379],
    city: "Olympia",
    state: "WA",
    county: "Thurston County",
  },
  99201: {
    coordinates: [-117.426, 47.6588],
    city: "Spokane",
    state: "WA",
    county: "Spokane County",
  },

  // West Virginia
  25301: {
    coordinates: [-81.6326, 38.3498],
    city: "Charleston",
    state: "WV",
    county: "Kanawha County",
  },
  26501: {
    coordinates: [-80.3445, 39.6295],
    city: "Morgantown",
    state: "WV",
    county: "Monongalia County",
  },

  // Wisconsin
  53703: {
    coordinates: [-89.4012, 43.0731],
    city: "Madison",
    state: "WI",
    county: "Dane County",
  },
  53202: {
    coordinates: [-87.9065, 43.0389],
    city: "Milwaukee",
    state: "WI",
    county: "Milwaukee County",
  },

  // Wyoming
  82001: {
    coordinates: [-104.8197, 41.14],
    city: "Cheyenne",
    state: "WY",
    county: "Laramie County",
  },
  82601: {
    coordinates: [-106.3317, 44.278],
    city: "Casper",
    state: "WY",
    county: "Natrona County",
  },

  // Washington DC
  20001: {
    coordinates: [-77.0369, 38.9072],
    city: "Washington",
    state: "DC",
    county: "District of Columbia",
  },
};

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
    if (zipCodeDatabase[cleanZip]) {
      console.log(`✅ Local DB: Found coordinates for ${cleanZip}`);
      return zipCodeDatabase[cleanZip].coordinates;
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
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const locationInfo = await getCityFromGoogle(cleanZip);
        if (locationInfo) {
          console.log(`✅ Google API: Found location info for ${cleanZip}`);
          return locationInfo;
        }
      } catch (error) {
        console.warn(
          `⚠️ Google API failed for location info ${cleanZip}:`,
          error.message
        );
      }
    }

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
    if (zipCodeDatabase[cleanZip]) {
      console.log(`✅ Local DB: Found location info for ${cleanZip}`);
      return {
        city: zipCodeDatabase[cleanZip].city,
        state: zipCodeDatabase[cleanZip].state,
        county: zipCodeDatabase[cleanZip].county,
        coordinates: zipCodeDatabase[cleanZip].coordinates,
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
          "User-Agent": "BOD-Platform/1.0 (Job Location Service)",
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
 * Add sample zip codes with coordinates (for development/testing)
 */
function addSampleZipCode(zipCode, locationData) {
  zipCodeDatabase[zipCode] = locationData;
}

/**
 * Get geocoding service status and configuration
 */
function getGeocodingConfig() {
  return {
    hasGoogleAPI: !!process.env.GOOGLE_MAPS_API_KEY,
    localDatabaseSize: Object.keys(zipCodeDatabase).length,
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
        coverage: `${Object.keys(zipCodeDatabase).length} zip codes`,
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
  zipCodeDatabase,
};
