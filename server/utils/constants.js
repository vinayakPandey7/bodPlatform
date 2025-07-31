/**
 * Constants for the BOD Platform
 * Contains all constant values used across the application
 */

// Enhanced zip code database with coordinates and city information
// This includes major cities from all 50 US states + DC
const ZIP_CODE_DATABASE = {
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

  // New York (additional)
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

  // Texas (additional)
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

  // Washington (additional)
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

  // Additional major US cities and zip codes
  // New York (additional areas)
  10010: {
    coordinates: [-73.9851932, 40.7398623],
    city: "City of New York",
    state: "New York",
    county: "New York County",
  },
  10016: {
    coordinates: [-73.979711, 40.7455003],
    city: "City of New York",
    state: "New York",
    county: "New York County",
  },
  11101: {
    coordinates: [-73.9388371, 40.7484454],
    city: "City of New York",
    state: "New York",
    county: "Queens County",
  },
  11215: {
    coordinates: [-73.9838951, 40.6672913],
    city: "City of New York",
    state: "New York",
    county: "Kings County",
  },

  // Georgia (additional)
  30309: {
    coordinates: [-84.3864839, 33.7958137],
    city: "Atlanta",
    state: "Georgia",
    county: "Fulton County",
  },

  // Florida (additional)
  33401: {
    coordinates: [-80.0669797, 26.7147131],
    city: "West Palm Beach",
    state: "Florida",
    county: "Palm Beach County",
  },
  33602: {
    coordinates: [-82.466009, 27.958059],
    city: "Tampa",
    state: "Florida",
    county: "Hillsborough County",
  },

  // Illinois (additional)
  60602: {
    coordinates: [-87.6289105, 41.8829927],
    city: "Chicago",
    state: "Illinois",
    county: "Cook County",
  },
  60611: {
    coordinates: [-87.6227221, 41.8952113],
    city: "Chicago",
    state: "Illinois",
    county: "Cook County",
  },

  // Texas (additional)
  75202: {
    coordinates: [-96.8043875, 32.7808379],
    city: "Dallas",
    state: "Texas",
    county: "Dallas County",
  },
  77001: {
    coordinates: [-95.3832337, 29.7327726],
    city: "Houston",
    state: "Texas",
    county: "Harris County",
  },
  78205: {
    coordinates: [-98.487345, 29.4246505],
    city: "San Antonio",
    state: "Texas",
    county: "Bexar County",
  },
  78702: {
    coordinates: [-97.7173476, 30.2686216],
    city: "Austin",
    state: "Texas",
    county: "Travis County",
  },

  // Colorado (additional)
  80203: {
    coordinates: [-104.9827399, 39.7308036],
    city: "Denver",
    state: "Colorado",
    county: "Denver County",
  },

  // California (additional)
  90401: {
    coordinates: [-118.4947536, 34.0152662],
    city: "Santa Monica",
    state: "California",
    county: "Los Angeles County",
  },
  92101: {
    coordinates: [-117.1620751, 32.7206395],
    city: "San Diego",
    state: "California",
    county: "San Diego County",
  },
  94301: {
    coordinates: [-122.1594933, 37.4445523],
    city: "Palo Alto",
    state: "California",
    county: "Santa Clara County",
  },

  // Oregon (additional)
  97205: {
    coordinates: [-122.6926136, 45.5202941],
    city: "Portland",
    state: "Oregon",
    county: "Multnomah County",
  },

  // Washington (additional)
  98004: {
    coordinates: [-122.2051533, 47.6182732],
    city: "Bellevue",
    state: "Washington",
    county: "King County",
  },
  98102: {
    coordinates: [-122.3221424, 47.6340955],
    city: "Seattle",
    state: "Washington",
    county: "King County",
  },
};

// Geocoding API Configuration
const GEOCODING_CONFIG = {
  GOOGLE_API: {
    BASE_URL: "https://maps.googleapis.com/maps/api/geocode/json",
    TIMEOUT: 5000,
    RATE_LIMIT: null, // Based on API plan
  },
  OSM_API: {
    BASE_URL: "https://nominatim.openstreetmap.org/search",
    TIMEOUT: 5000,
    RATE_LIMIT: 1000, // 1 request per second
    USER_AGENT: "BOD-Platform/1.0 (Job Location Service)",
  },
};

// US Geographic Boundaries (approximate)
const US_BOUNDARIES = {
  // Continental US + Alaska + Hawaii
  MIN_LATITUDE: 18.9,
  MAX_LATITUDE: 71.4,
  MIN_LONGITUDE: -179.1,
  MAX_LONGITUDE: -66.9,
};

// Distance and Measurement Constants
const DISTANCE_CONSTANTS = {
  EARTH_RADIUS_MILES: 3959,
  EARTH_RADIUS_KM: 6371,
  METERS_PER_MILE: 1609.34,
  DEFAULT_SEARCH_RADIUS_MILES: 20,
  DEFAULT_SEARCH_RADIUS_METERS: 32186.8, // 20 miles in meters
};

// Application Configuration Constants
const APP_CONFIG = {
  DEFAULT_JOB_SEARCH_LIMIT: 20,
  MAX_JOB_SEARCH_LIMIT: 100,
  DEFAULT_PAGINATION_SIZE: 20,
  MAX_FILE_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ["pdf", "doc", "docx"],
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// User Roles and Permissions
const USER_ROLES = {
  ADMIN: "admin",
  SUB_ADMIN: "sub_admin",
  EMPLOYER: "employer",
  CANDIDATE: "candidate",
  RECRUITMENT_PARTNER: "recruitment_partner",
};

// Job Status Constants
const JOB_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  EXPIRED: "expired",
  DRAFT: "draft",
};

// Application Status Constants
const APPLICATION_STATUS = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  SHORTLISTED: "shortlisted",
  INTERVIEWED: "interviewed",
  HIRED: "hired",
  REJECTED: "rejected",
};

// Job Types
const JOB_TYPES = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  FREELANCE: "freelance",
  INTERNSHIP: "internship",
  TEMPORARY: "temporary",
};

// Work Modes
const WORK_MODES = {
  REMOTE: "remote",
  ON_SITE: "on-site",
  HYBRID: "hybrid",
};

// Experience Levels
const EXPERIENCE_LEVELS = {
  ENTRY: "entry",
  MID: "mid",
  SENIOR: "senior",
  EXECUTIVE: "executive",
};

// Currency Codes
const CURRENCIES = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  CAD: "CAD",
};

// Error Messages
const ERROR_MESSAGES = {
  ZIP_CODE_REQUIRED: "Zip code is required",
  INVALID_ZIP_CODE_FORMAT: "Invalid US zip code format. Must be 5 digits.",
  LOCATION_NOT_FOUND: "Location not found for the provided zip code",
  COORDINATES_REQUIRED: "Latitude and longitude are required",
  INVALID_COORDINATES: "Invalid coordinate format",
  COORDINATES_OUTSIDE_US: "Coordinates are outside United States boundaries",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Internal server error",
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOCATION_FOUND: "Location information found",
  COORDINATES_VALIDATED: "Coordinates validated successfully",
  DATA_SAVED: "Data saved successfully",
  DATA_UPDATED: "Data updated successfully",
  DATA_DELETED: "Data deleted successfully",
};

module.exports = {
  ZIP_CODE_DATABASE,
  GEOCODING_CONFIG,
  US_BOUNDARIES,
  DISTANCE_CONSTANTS,
  APP_CONFIG,
  USER_ROLES,
  JOB_STATUS,
  APPLICATION_STATUS,
  JOB_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
  CURRENCIES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
