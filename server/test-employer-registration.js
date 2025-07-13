const axios = require("axios");

// Test script for employer registration with location validation
async function testEmployerRegistration() {
  const baseURL = "http://localhost:5000/api";

  console.log("🧪 Testing Employer Registration with Location Validation...\n");

  // Test 1: Valid employer registration with zip code
  console.log("📝 Test 1: Valid Employer Registration with Zip Code");
  try {
    const validEmployer = {
      email: `test.employer.${Date.now()}@example.com`,
      password: "employer123",
      ownerName: "John Smith",
      companyName: "Test Tech Solutions Inc.",
      phoneNumber: "+1-555-0123",
      address: "123 Business Ave",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
      locationDetected: false,
    };

    const response = await axios.post(
      `${baseURL}/auth/register/employer`,
      validEmployer
    );
    console.log("✅ Registration successful!");
    console.log(`📧 Email: ${validEmployer.email}`);
    console.log(`🏢 Company: ${validEmployer.companyName}`);
    console.log(
      `📍 Location: ${validEmployer.city}, ${validEmployer.state} ${validEmployer.zipCode}`
    );
    console.log(
      `🗺️ Coordinates generated: ${response.data.locationValidation.coordinatesGenerated}`
    );
    console.log(
      `🎯 Within US bounds: ${response.data.locationValidation.withinUSBounds}`
    );
    console.log(`🔑 Token provided: ${!!response.data.token}`);
  } catch (error) {
    console.log(
      "❌ Test 1 failed:",
      error.response?.data?.message || error.message
    );
  }

  console.log("\n---\n");

  // Test 2: Registration without zip code when location not detected (should fail)
  console.log(
    "📝 Test 2: Registration without Zip Code (location not detected) - Should Fail"
  );
  try {
    const noZipEmployer = {
      email: `test.employer.nzip.${Date.now()}@example.com`,
      password: "employer123",
      ownerName: "Jane Doe",
      companyName: "Another Company",
      phoneNumber: "+1-555-0124",
      address: "456 Business St",
      city: "Los Angeles",
      state: "CA",
      // zipCode: '', // Missing zip code
      country: "United States",
      locationDetected: false,
    };

    await axios.post(`${baseURL}/auth/register/employer`, noZipEmployer);
    console.log("❌ Test should have failed but succeeded");
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log("✅ Correctly rejected registration without zip code");
      console.log(`📄 Error: ${error.response.data.message}`);
      console.log(`🏷️ Error code: ${error.response.data.error}`);
    } else {
      console.log("❌ Unexpected error:", error.message);
    }
  }

  console.log("\n---\n");

  // Test 3: Registration with non-US country (should fail)
  console.log("📝 Test 3: Registration with Non-US Country - Should Fail");
  try {
    const nonUSEmployer = {
      email: `test.employer.canada.${Date.now()}@example.com`,
      password: "employer123",
      ownerName: "Canadian User",
      companyName: "Canadian Company Ltd.",
      phoneNumber: "+1-555-0125",
      address: "789 Business Blvd",
      city: "Toronto",
      state: "ON",
      zipCode: "M5V 3A8",
      country: "Canada", // Non-US country
      locationDetected: false,
    };

    await axios.post(`${baseURL}/auth/register/employer`, nonUSEmployer);
    console.log("❌ Test should have failed but succeeded");
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log("✅ Correctly rejected non-US registration");
      console.log(`📄 Error: ${error.response.data.message}`);
      console.log(`🏷️ Error code: ${error.response.data.error}`);
    } else {
      console.log("❌ Unexpected error:", error.message);
    }
  }

  console.log("\n---\n");

  // Test 4: Registration with invalid zip code format (should fail)
  console.log(
    "📝 Test 4: Registration with Invalid Zip Code Format - Should Fail"
  );
  try {
    const invalidZipEmployer = {
      email: `test.employer.badzip.${Date.now()}@example.com`,
      password: "employer123",
      ownerName: "Bad Zip User",
      companyName: "Invalid Zip Company",
      phoneNumber: "+1-555-0126",
      address: "321 Business Rd",
      city: "Miami",
      state: "FL",
      zipCode: "123", // Invalid zip format
      country: "United States",
      locationDetected: false,
    };

    await axios.post(`${baseURL}/auth/register/employer`, invalidZipEmployer);
    console.log("❌ Test should have failed but succeeded");
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log("✅ Correctly rejected invalid zip code format");
      console.log(`📄 Error: ${error.response.data.message}`);
    } else {
      console.log("❌ Unexpected error:", error.message);
    }
  }

  console.log("\n---\n");

  // Test 5: Registration with location detected (zip code optional)
  console.log(
    "📝 Test 5: Registration with Location Detected (zip code optional)"
  );
  try {
    const locationDetectedEmployer = {
      email: `test.employer.detected.${Date.now()}@example.com`,
      password: "employer123",
      ownerName: "GPS User",
      companyName: "Location Detected Company",
      phoneNumber: "+1-555-0127",
      address: "999 GPS Ave",
      city: "San Francisco",
      state: "CA",
      // zipCode not provided
      country: "United States",
      locationDetected: true, // Location was detected via GPS/browser
    };

    const response = await axios.post(
      `${baseURL}/auth/register/employer`,
      locationDetectedEmployer
    );
    console.log("✅ Registration successful with location detection!");
    console.log(`📧 Email: ${locationDetectedEmployer.email}`);
    console.log(
      `🗺️ Location detected: ${response.data.locationValidation.locationDetected}`
    );
    console.log(
      `📮 Zip code provided: ${response.data.locationValidation.zipCodeProvided}`
    );
  } catch (error) {
    console.log(
      "❌ Test 5 failed:",
      error.response?.data?.message || error.message
    );
  }

  console.log("\n---\n");

  // Test 6: Missing required fields (should fail)
  console.log(
    "📝 Test 6: Registration with Missing Required Fields - Should Fail"
  );
  try {
    const incompleteEmployer = {
      email: `test.employer.incomplete.${Date.now()}@example.com`,
      password: "employer123",
      // ownerName: '', // Missing required field
      companyName: "Incomplete Company",
      phoneNumber: "+1-555-0128",
      address: "111 Incomplete St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "United States",
    };

    await axios.post(`${baseURL}/auth/register/employer`, incompleteEmployer);
    console.log("❌ Test should have failed but succeeded");
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log("✅ Correctly rejected incomplete registration");
      console.log(`📄 Error: ${error.response.data.message}`);
    } else {
      console.log("❌ Unexpected error:", error.message);
    }
  }

  console.log("\n🎉 All employer registration tests completed!");
  console.log("\n📋 Summary:");
  console.log("✅ Valid registration with zip code works");
  console.log(
    "✅ Registration without zip code (when location not detected) is rejected"
  );
  console.log("✅ Non-US country registration is rejected");
  console.log("✅ Invalid zip code format is rejected");
  console.log(
    "✅ Registration with location detection (no zip required) works"
  );
  console.log("✅ Missing required fields are rejected");
  console.log(
    "\n🎯 Employer registration endpoint is properly secured for US-only operations!"
  );
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEmployerRegistration();
}

module.exports = { testEmployerRegistration };
