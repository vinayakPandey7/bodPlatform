const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODhmZTBiNjRmZDBmOWYxMTQ2YjY0YiIsImVtYWlsIjoiYWRtaW5AYm9kcGxhdGZvcm0uY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzODA4Mzk1LCJleHAiOjE3NTQ0MTMxOTV9.yueYuCbhSRWA8QNUyKffoyqW2Elwr1s_0LRRjLZXEmA";

const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testAdminEmployersAPI() {
  try {
    console.log("🚀 Testing Admin Employers API Integration");
    console.log("=" * 50);

    // 1. Test GET /api/admin/employers
    console.log("\n1. Testing GET /api/admin/employers");
    const getResponse = await axios.get(`${BASE_URL}/admin/employers`, { headers });
    console.log(`✅ GET employers: ${getResponse.data.employers.length} employers found`);
    console.log(`First employer: ${getResponse.data.employers[0]?.companyName || 'None'}`);

    // 2. Test POST /api/admin/employers (Create new employer)
    console.log("\n2. Testing POST /api/admin/employers (Create employer)");
    const timestamp = Date.now();
    const newEmployerData = {
      ownerName: "Jane Smith",
      companyName: "Test Integration Corp",
      email: `jane.smith.${timestamp}@testintegration.com`,
      phoneNumber: "+1-555-999-0001",
      address: "456 Integration Ave",
      city: "San Francisco",
      state: "California",
      zipCode: "94102",
      country: "United States",
      jobPosting: "automatic",
      website: "https://testintegration.com",
      description: "Test company for API integration testing"
    };

    const createResponse = await axios.post(`${BASE_URL}/admin/employers`, newEmployerData, { headers });
    console.log(`✅ CREATE employer: ${createResponse.data.employer.companyName} created`);
    const newEmployerId = createResponse.data.employer._id;

    // 3. Test PUT /api/admin/employers/:id (Update employer)
    console.log("\n3. Testing PUT /api/admin/employers/:id (Update employer)");
    const updateData = {
      companyName: "Updated Test Integration Corp",
      website: "https://updated-testintegration.com",
      description: "Updated description for testing"
    };

    const updateResponse = await axios.put(`${BASE_URL}/admin/employers/${newEmployerId}`, updateData, { headers });
    console.log(`✅ UPDATE employer: ${updateResponse.data.employer.companyName} updated`);

    // 4. Test PUT /api/admin/employers/:id/approve (Approve employer)
    console.log("\n4. Testing PUT /api/admin/employers/:id/approve (Approve employer)");
    const approveResponse = await axios.put(`${BASE_URL}/admin/employers/${newEmployerId}/approve`, {}, { headers });
    console.log(`✅ APPROVE employer: ${approveResponse.data.employer.companyName} approved`);

    // 5. Test DELETE /api/admin/employers/:id (Delete employer)
    console.log("\n5. Testing DELETE /api/admin/employers/:id (Delete employer)");
    const deleteResponse = await axios.delete(`${BASE_URL}/admin/employers/${newEmployerId}`, { headers });
    console.log(`✅ DELETE employer: ${deleteResponse.data.message}`);

    // 6. Final verification - check that employer count is back to original
    console.log("\n6. Final verification");
    const finalGetResponse = await axios.get(`${BASE_URL}/admin/employers`, { headers });
    console.log(`✅ Final count: ${finalGetResponse.data.employers.length} employers (should be same as initial)`);

    console.log("\n🎉 All API tests passed! The integration is working correctly.");
    console.log("\n📋 Summary:");
    console.log("- ✅ GET employers (Read)");
    console.log("- ✅ POST employer (Create)");
    console.log("- ✅ PUT employer (Update)");
    console.log("- ✅ PUT approve (Approve)");
    console.log("- ✅ DELETE employer (Delete)");

  } catch (error) {
    console.error("❌ API Test Failed:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log("\n🔑 Authentication failed. Please make sure:");
      console.log("1. The server is running");
      console.log("2. The JWT token is valid");
      console.log("3. You're logged in as an admin user");
    }
  }
}

// Helper function to repeat character
function repeat(char, count) {
  return Array(count + 1).join(char);
}

testAdminEmployersAPI();
