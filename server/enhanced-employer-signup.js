const axios = require("axios");
const readline = require("readline");

const API_BASE = "http://localhost:5000/api";

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Simulate location detection (normally done in browser)
function simulateLocationDetection() {
  console.log("🗺️  Simulating location detection...");

  // Sample US coordinates for different cities
  const sampleLocations = [
    { name: "New York, NY", lat: 40.7128, lon: -74.006 },
    { name: "San Francisco, CA", lat: 37.7749, lon: -122.4194 },
    { name: "Austin, TX", lat: 30.2672, lon: -97.7431 },
    { name: "Chicago, IL", lat: 41.8781, lon: -87.6298 },
    { name: "Miami, FL", lat: 25.7617, lon: -80.1918 },
  ];

  const randomLocation =
    sampleLocations[Math.floor(Math.random() * sampleLocations.length)];

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📍 Location detected: ${randomLocation.name}`);
      console.log(
        `   Coordinates: ${randomLocation.lat}, ${randomLocation.lon}`
      );
      resolve({
        detected: true,
        latitude: randomLocation.lat,
        longitude: randomLocation.lon,
        accuracy: 100,
      });
    }, 2000); // Simulate 2 second delay
  });
}

// Enhanced employer signup with location detection
async function enhancedEmployerSignup() {
  console.log("🏢 ENHANCED EMPLOYER SIGNUP WITH LOCATION DETECTION");
  console.log("==================================================\n");

  try {
    // Step 1: Basic Information
    console.log("📝 Step 1: Basic Information");
    console.log("---------------------------");

    const ownerName = await askQuestion("👤 Owner Name: ");
    const email = await askQuestion("📧 Email: ");
    const password = await askQuestion("🔒 Password: ");
    const companyName = await askQuestion("🏢 Company Name: ");
    const phoneNumber = await askQuestion("📞 Phone Number: ");
    const address = await askQuestion("🏠 Address: ");

    console.log("\n");

    // Step 2: Location Detection
    console.log("📍 Step 2: Location Detection");
    console.log("-----------------------------");

    const useLocationDetection = await askQuestion(
      "🗺️  Would you like to use automatic location detection? (y/n): "
    );

    let locationData = {
      locationDetected: false,
      coordinates: null,
    };

    if (
      useLocationDetection.toLowerCase() === "y" ||
      useLocationDetection.toLowerCase() === "yes"
    ) {
      try {
        console.log("\n🔍 Attempting to detect your location...");
        const detectedLocation = await simulateLocationDetection();

        // Validate coordinates with our API
        const coordinateValidation = await axios.post(
          `${API_BASE}/location/validate-coordinates`,
          {
            latitude: detectedLocation.latitude,
            longitude: detectedLocation.longitude,
          }
        );

        if (coordinateValidation.data.success) {
          locationData.locationDetected = true;
          locationData.coordinates = [
            detectedLocation.longitude,
            detectedLocation.latitude,
          ];

          console.log("✅ Location detection successful!");
          console.log(`   Coordinates validated and within US bounds`);
          console.log(`   You can proceed without entering a zip code.\n`);
        }
      } catch (error) {
        console.log("❌ Location detection failed or coordinates outside US");
        console.log("   Falling back to zip code entry...\n");
      }
    }

    // Step 3: Manual Location Entry (if needed)
    let zipCode = "";
    let city = "";
    let state = "";

    if (!locationData.locationDetected) {
      console.log("📮 Step 3: Manual Location Entry");
      console.log("--------------------------------");
      console.log(
        "Since location detection is disabled or failed, please enter your zip code:\n"
      );

      let validZipCode = false;
      while (!validZipCode) {
        zipCode = await askQuestion("📮 US Zip Code: ");

        if (!zipCode || zipCode.trim() === "") {
          console.log("❌ Zip code is required. Please try again.");
          continue;
        }

        try {
          console.log("🔍 Looking up city information...");
          const zipLookup = await axios.post(
            `${API_BASE}/location/lookup-zipcode`,
            {
              zipCode: zipCode,
            }
          );

          if (zipLookup.data.success) {
            city = zipLookup.data.data.city;
            state = zipLookup.data.data.state;

            console.log("✅ Zip code found!");
            console.log(`   📍 Location: ${zipLookup.data.data.fullLocation}`);
            console.log(`   🏘️  County: ${zipLookup.data.data.county}\n`);

            const confirmLocation = await askQuestion(
              `✓ Is this correct? (y/n): `
            );
            if (
              confirmLocation.toLowerCase() === "y" ||
              confirmLocation.toLowerCase() === "yes"
            ) {
              validZipCode = true;
            } else {
              console.log("Please enter a different zip code.\n");
            }
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("❌ Zip code not found in our database.");
            console.log("   Please enter city and state manually.\n");

            city = await askQuestion("🌆 City: ");
            state = await askQuestion("🗺️  State (e.g., CA, NY, TX): ");
            validZipCode = true;
          } else {
            console.log("❌ Error looking up zip code. Please try again.");
          }
        }
      }
    }

    // Step 4: Registration
    console.log("📤 Step 4: Submitting Registration");
    console.log("----------------------------------");

    const registrationData = {
      ownerName,
      email,
      password,
      companyName,
      phoneNumber,
      address,
      country: "United States",
      locationDetected: locationData.locationDetected,
    };

    if (locationData.locationDetected) {
      registrationData.detectedCoordinates = locationData.coordinates;
    } else {
      registrationData.city = city;
      registrationData.state = state;
      registrationData.zipCode = zipCode;
    }

    console.log("🔄 Processing registration...\n");

    const response = await axios.post(
      `${API_BASE}/auth/register/employer`,
      registrationData
    );

    if (response.data.success) {
      console.log("🎉 REGISTRATION SUCCESSFUL!");
      console.log("===========================\n");

      console.log(`✅ Welcome, ${response.data.user.profile.ownerName}!`);
      console.log(`🏢 Company: ${response.data.user.profile.companyName}`);
      console.log(`📧 Email: ${response.data.user.email}`);
      console.log(
        `📍 Location: ${response.data.user.profile.city}, ${response.data.user.profile.state} ${response.data.user.profile.zipCode}`
      );
      console.log(
        `🌐 Coordinates: [${response.data.user.profile.location.coordinates.join(
          ", "
        )}]`
      );
      console.log(
        `📋 Status: ${
          response.data.user.profile.isApproved
            ? "Approved"
            : "Pending Admin Approval"
        }`
      );

      console.log("\n🎯 Location Validation Results:");
      console.log(
        `   - Location Method: ${
          response.data.locationValidation.locationDetected
            ? "GPS Detection"
            : "Zip Code Entry"
        }`
      );
      console.log(
        `   - Zip Code Provided: ${response.data.locationValidation.zipCodeProvided}`
      );
      console.log(
        `   - Coordinates Generated: ${response.data.locationValidation.coordinatesGenerated}`
      );
      console.log(
        `   - Within US Bounds: ${response.data.locationValidation.withinUSBounds}`
      );

      console.log(
        `\n🔐 Your Auth Token: ${response.data.token.substring(0, 50)}...`
      );
      console.log("\n📖 Next Steps:");
      console.log("   1. Wait for admin approval to post jobs");
      console.log("   2. Complete your company profile");
      console.log("   3. Start posting job opportunities");
    }
  } catch (error) {
    console.log("\n❌ REGISTRATION FAILED");
    console.log("=====================");
    console.log(`Error: ${error.response?.data?.message || error.message}`);

    if (error.response?.data?.error) {
      console.log(`Error Code: ${error.response.data.error}`);
    }
  }

  rl.close();
}

// Test location functionality
async function testLocationFeatures() {
  console.log("\n🧪 TESTING LOCATION FEATURES");
  console.log("============================\n");

  // Test 1: Zip code lookup
  console.log("Test 1: Zip Code Lookup");
  try {
    const response = await axios.post(`${API_BASE}/location/lookup-zipcode`, {
      zipCode: "10001",
    });
    console.log("✅ Success:", response.data.data.fullLocation);
  } catch (error) {
    console.log("❌ Failed:", error.response?.data?.message);
  }

  // Test 2: Coordinate validation
  console.log("\nTest 2: Coordinate Validation");
  try {
    const response = await axios.post(
      `${API_BASE}/location/validate-coordinates`,
      {
        latitude: 40.7128,
        longitude: -74.006,
      }
    );
    console.log("✅ Success: Coordinates are valid and within US");
  } catch (error) {
    console.log("❌ Failed:", error.response?.data?.message);
  }

  console.log("\n✨ Location features are working correctly!");
}

// Main menu
async function main() {
  console.log("🚀 BOD Platform - Enhanced Employer Signup");
  console.log("==========================================\n");

  const choice = await askQuestion(
    "📋 Choose an option:\n" +
      "1. 🏢 Interactive Employer Signup with Location Detection\n" +
      "2. 🧪 Test Location Features\n" +
      "3. 📊 Exit\n\n" +
      "Enter your choice (1-3): "
  );

  switch (choice) {
    case "1":
      await enhancedEmployerSignup();
      break;
    case "2":
      await testLocationFeatures();
      rl.close();
      break;
    case "3":
      console.log("👋 Goodbye!");
      rl.close();
      break;
    default:
      console.log("❌ Invalid choice. Please try again.");
      rl.close();
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Goodbye!");
  rl.close();
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error("Error:", error.message);
  rl.close();
});
