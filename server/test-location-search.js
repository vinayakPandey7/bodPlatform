const axios = require("axios");

// Test script to verify the location-based job search functionality
async function testLocationBasedJobSearch() {
  const baseURL = "http://localhost:5000/api";

  console.log("🧪 Testing Location-Based Job Search...\n");

  try {
    // Test 1: Get jobs near New York (10001)
    console.log("📍 Test 1: Jobs near New York, NY (10001)");
    const nyResponse = await axios.get(`${baseURL}/jobs/candidates/nearby`, {
      params: {
        zipCode: "10001",
        page: 1,
        limit: 5,
      },
    });

    console.log(`✅ Found ${nyResponse.data.totalJobs} jobs near 10001`);
    console.log(
      `📄 Showing page ${nyResponse.data.pagination.currentPage} of ${nyResponse.data.pagination.totalPages}`
    );

    if (nyResponse.data.jobs.length > 0) {
      console.log("📋 Sample jobs:");
      nyResponse.data.jobs.slice(0, 3).forEach((job, index) => {
        console.log(
          `   ${index + 1}. ${job.title} at ${job.employer.companyName} (${
            job.distance
          } miles away)`
        );
        console.log(`      📍 ${job.city}, ${job.state} ${job.zipCode}`);
      });
    }

    console.log("\n---\n");

    // Test 2: Get jobs near Los Angeles (90210)
    console.log("📍 Test 2: Jobs near Los Angeles, CA (90210)");
    const laResponse = await axios.get(`${baseURL}/jobs/candidates/nearby`, {
      params: {
        zipCode: "90210",
        page: 1,
        limit: 5,
      },
    });

    console.log(
      `✅ Found ${laResponse.data.pagination.totalJobs} jobs near 90210`
    );

    if (laResponse.data.jobs.length > 0) {
      console.log("📋 Sample jobs:");
      laResponse.data.jobs.slice(0, 3).forEach((job, index) => {
        console.log(
          `   ${index + 1}. ${job.title} at ${job.employer.companyName} (${
            job.distance
          } miles away)`
        );
        console.log(`      📍 ${job.city}, ${job.state} ${job.zipCode}`);
      });
    }

    console.log("\n---\n");

    // Test 3: Test with filters
    console.log("📍 Test 3: Jobs near Chicago, IL (60601) with filters");
    const filteredResponse = await axios.get(
      `${baseURL}/jobs/candidates/nearby`,
      {
        params: {
          zipCode: "60601",
          search: "engineer",
          jobType: "full_time",
          page: 1,
          limit: 5,
        },
      }
    );

    console.log(
      `✅ Found ${filteredResponse.data.totalJobs} full-time engineering jobs near 60601`
    );

    if (filteredResponse.data.jobs.length > 0) {
      console.log("📋 Sample jobs:");
      filteredResponse.data.jobs.forEach((job, index) => {
        console.log(
          `   ${index + 1}. ${job.title} at ${job.employer.companyName} (${
            job.distance
          } miles away)`
        );
        console.log(`      💼 ${job.jobType} | 📍 ${job.city}, ${job.state}`);
      });
    }

    console.log("\n---\n");

    // Test 4: Test invalid zip code
    console.log("📍 Test 4: Invalid zip code test");
    try {
      await axios.get(`${baseURL}/jobs/candidates/nearby`, {
        params: {
          zipCode: "00000", // Invalid zip code
          page: 1,
          limit: 5,
        },
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(
          `✅ Invalid zip code properly rejected: ${error.response.data.message}`
        );
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }

    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.log("\n💡 Make sure your server is running on port 5000");
    console.log("   Run: npm run dev (in the server directory)");
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testLocationBasedJobSearch();
}

module.exports = { testLocationBasedJobSearch };
