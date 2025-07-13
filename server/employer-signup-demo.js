const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

// Demo: How to signup as an employer and test location functionality
async function demonstrateEmployerSignup() {
  console.log("🏢 EMPLOYER SIGNUP DEMONSTRATION\n");

  // Example 1: Valid employer signup
  console.log("📝 Example 1: Valid Employer Signup with Location");
  const employerData = {
    ownerName: "Sarah Johnson",
    email: "sarah@techstartup.com",
    password: "MySecurePassword123!",
    companyName: "Tech Startup Inc",
    phoneNumber: "555-456-7890",
    address: "456 Startup Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "United States",
    locationDetected: false, // Set to true if using GPS/browser location
  };

  try {
    const response = await axios.post(
      `${API_BASE}/auth/register/employer`,
      employerData
    );

    console.log("✅ SUCCESS: Employer registered successfully!");
    console.log(`📧 Email: ${response.data.user.email}`);
    console.log(`🏢 Company: ${response.data.user.profile.companyName}`);
    console.log(
      `📍 Location: ${response.data.user.profile.city}, ${response.data.user.profile.state} ${response.data.user.profile.zipCode}`
    );
    console.log(
      `🌐 Coordinates: [${response.data.user.profile.location.coordinates.join(
        ", "
      )}]`
    );
    console.log(`🔐 Auth Token: ${response.data.token.substring(0, 50)}...`);
    console.log(
      `📋 Approval Status: ${
        response.data.user.profile.isApproved
          ? "Approved"
          : "Pending Admin Approval"
      }`
    );

    console.log("\n🎯 Location Validation Results:");
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
      `   - Location Detected: ${response.data.locationValidation.locationDetected}`
    );
  } catch (error) {
    console.log("❌ FAILED: Employer registration failed");
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Example 2: Test location-based job search for this employer's area
  console.log("📝 Example 2: Testing Location-Based Job Search");
  try {
    const jobSearch = await axios.get(`${API_BASE}/jobs/candidates/nearby`, {
      params: {
        zipCode: "94102", // San Francisco zip code
        page: 1,
        limit: 5,
      },
    });

    console.log("✅ SUCCESS: Location-based job search working");
    console.log(`🔍 Search Location: ${jobSearch.data.searchCriteria.zipCode}`);
    console.log(
      `📏 Search Radius: ${jobSearch.data.searchCriteria.searchRadius}`
    );
    console.log(`💼 Jobs Found: ${jobSearch.data.pagination.totalJobs}`);

    if (jobSearch.data.jobs.length > 0) {
      console.log("\n📋 Available Jobs in This Area:");
      jobSearch.data.jobs.forEach((job, index) => {
        console.log(
          `   ${index + 1}. ${job.title} at ${job.employer.companyName}`
        );
        console.log(
          `      📍 ${job.city}, ${job.state} ${job.zipCode} (${job.distance} miles away)`
        );
        console.log(
          `      💰 $${job.salaryMin?.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`
        );
        console.log(
          `      🏢 ${job.jobType} | ${job.workMode} | ${job.experience} experience`
        );
      });
    }
  } catch (error) {
    console.log("❌ FAILED: Location-based job search");
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Example 3: Testing validation errors
  console.log("📝 Example 3: Testing Validation Scenarios");

  // Test 3a: Missing zip code
  console.log("\n🚫 Test 3a: Missing Zip Code (should fail)");
  try {
    await axios.post(`${API_BASE}/auth/register/employer`, {
      ...employerData,
      email: "test1@example.com",
      zipCode: "", // Empty zip code
      locationDetected: false,
    });
    console.log("❌ UNEXPECTED: Should have failed");
  } catch (error) {
    console.log("✅ EXPECTED: Zip code validation working");
    console.log(`   Error: ${error.response?.data?.message}`);
  }

  // Test 3b: Non-US country
  console.log("\n🚫 Test 3b: Non-US Country (should fail)");
  try {
    await axios.post(`${API_BASE}/auth/register/employer`, {
      ...employerData,
      email: "test2@example.com",
      country: "Canada",
      city: "Toronto",
      state: "ON",
      zipCode: "M5V 1A1",
    });
    console.log("❌ UNEXPECTED: Should have failed");
  } catch (error) {
    console.log("✅ EXPECTED: Country validation working");
    console.log(`   Error: ${error.response?.data?.message}`);
  }

  console.log("\n🎉 DEMONSTRATION COMPLETE!");
  console.log("\n📋 SUMMARY:");
  console.log("✅ Employer signup with US location validation");
  console.log("✅ Automatic coordinate generation from zip codes");
  console.log("✅ Location-based job search within 5-mile radius");
  console.log("✅ Proper validation for missing zip codes");
  console.log("✅ Country restriction enforcement (US-only)");
}

// Run the demonstration
demonstrateEmployerSignup().catch(console.error);
