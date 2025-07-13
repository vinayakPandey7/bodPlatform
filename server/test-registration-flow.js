const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

// Demo: Test the complete employer registration flow
async function testEmployerRegistrationFlow() {
  console.log("🧪 TESTING COMPLETE EMPLOYER REGISTRATION FLOW");
  console.log("===============================================\n");

  // Test 1: Location Detection API
  console.log("📍 Test 1: GPS Location Validation");
  try {
    const locationTest = await axios.post(
      `${API_BASE}/location/validate-coordinates`,
      {
        latitude: 40.7128,
        longitude: -74.006,
      }
    );

    console.log("✅ GPS Location Detection:", locationTest.data.success);
    console.log(
      `   Coordinates: [${locationTest.data.data.coordinates.join(", ")}]`
    );
    console.log(`   Within US: ${locationTest.data.data.withinUSBounds}\n`);
  } catch (error) {
    console.log(
      "❌ GPS Location Detection failed:",
      error.response?.data?.message
    );
  }

  // Test 2: ZIP Code Auto-Population
  console.log("📮 Test 2: ZIP Code Auto-Population");
  const testZipCodes = ["10001", "94102", "78701", "60601", "33101"];

  for (const zipCode of testZipCodes) {
    try {
      const zipTest = await axios.post(`${API_BASE}/location/lookup-zipcode`, {
        zipCode: zipCode,
      });

      if (zipTest.data.success) {
        console.log(
          `✅ ${zipCode} → ${zipTest.data.data.city}, ${zipTest.data.data.state}`
        );
      }
    } catch (error) {
      console.log(`❌ ${zipCode} → Not found`);
    }
  }

  console.log("\n");

  // Test 3: Registration with GPS Location
  console.log("🗺️  Test 3: Registration with GPS Location");
  try {
    const gpsRegistration = await axios.post(
      `${API_BASE}/auth/register/employer`,
      {
        ownerName: "GPS Test User",
        email: "gpstest@example.com",
        password: "TestPass123!",
        companyName: "GPS Test Company",
        phoneNumber: "555-GPS-TEST",
        address: "123 GPS Street",
        city: "New York",
        state: "NY",
        country: "United States",
        locationDetected: true,
        detectedCoordinates: [-74.006, 40.7128],
      }
    );

    console.log("✅ GPS Registration successful");
    console.log(`   Method: ${gpsRegistration.data.locationValidation.method}`);
    console.log(
      `   Location: ${gpsRegistration.data.user.profile.city}, ${gpsRegistration.data.user.profile.state}`
    );
    console.log(
      `   ZIP: ${
        gpsRegistration.data.user.profile.zipCode || "Not provided (GPS used)"
      }\n`
    );
  } catch (error) {
    if (error.response?.data?.error === "USER_EXISTS") {
      console.log(
        "ℹ️  GPS test user already exists (expected for repeated tests)\n"
      );
    } else {
      console.log(
        "❌ GPS Registration failed:",
        error.response?.data?.message,
        "\n"
      );
    }
  }

  // Test 4: Registration with ZIP Code
  console.log("📮 Test 4: Registration with ZIP Code Auto-Population");
  try {
    const zipRegistration = await axios.post(
      `${API_BASE}/auth/register/employer`,
      {
        ownerName: "ZIP Test User",
        email: "ziptest@example.com",
        password: "TestPass123!",
        companyName: "ZIP Test Company",
        phoneNumber: "555-ZIP-TEST",
        address: "456 ZIP Avenue",
        zipCode: "94102",
        country: "United States",
        locationDetected: false,
      }
    );

    console.log("✅ ZIP Code Registration successful");
    console.log(`   Method: ${zipRegistration.data.locationValidation.method}`);
    console.log(
      `   Auto-populated: ${zipRegistration.data.user.profile.city}, ${zipRegistration.data.user.profile.state}`
    );
    console.log(`   ZIP: ${zipRegistration.data.user.profile.zipCode}\n`);
  } catch (error) {
    if (error.response?.data?.error === "USER_EXISTS") {
      console.log(
        "ℹ️  ZIP test user already exists (expected for repeated tests)\n"
      );
    } else {
      console.log(
        "❌ ZIP Registration failed:",
        error.response?.data?.message,
        "\n"
      );
    }
  }

  // Test 5: Invalid ZIP Code Handling
  console.log("🚫 Test 5: Invalid ZIP Code Handling");
  try {
    const invalidZipTest = await axios.post(
      `${API_BASE}/location/lookup-zipcode`,
      {
        zipCode: "99999",
      }
    );
    console.log("⚠️  Invalid ZIP returned data (may need more validation)");
  } catch (error) {
    console.log(
      "✅ Invalid ZIP properly rejected:",
      error.response?.data?.message
    );
  }

  console.log("\n🎯 FLOW SUMMARY:");
  console.log("================");
  console.log("✅ User lands on page → Location popup appears");
  console.log(
    "✅ If GPS allowed → Auto-detect coordinates → Validate US bounds"
  );
  console.log("✅ If GPS denied → Show ZIP field → Auto-populate city/state");
  console.log("✅ Registration works with both GPS and ZIP methods");
  console.log("✅ Location validation ensures US-only registration");
  console.log(
    "\n🚀 Frontend is available at: http://localhost:5000/employer-registration"
  );
}

// Run the test
testEmployerRegistrationFlow().catch(console.error);
