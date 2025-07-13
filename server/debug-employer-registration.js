const express = require("express");
const app = express();
app.use(express.json());

// Simulate the exact controller logic
const mockReq = {
  body: {
    email: "test@example.com",
    password: "password123",
    ownerName: "John Doe",
    companyName: "Test Company",
    phoneNumber: "1234567890",
    address: "123 Test St",
    city: "Test City",
    state: "CA",
    zipCode: "90210",
    country: "United States",
    locationDetected: false,
  },
};

console.log("🔍 Debugging Employer Registration");
console.log("📄 Request body:", JSON.stringify(mockReq.body, null, 2));

// Test the destructuring logic from the controller
const {
  email,
  password,
  ownerName,
  companyName,
  phoneNumber,
  address,
  city,
  state,
  zipCode,
  country = "United States",
  locationDetected = false,
  detectedCoordinates = null,
} = mockReq.body;

console.log("\n✅ Destructured fields:");
console.log("- email:", email);
console.log("- password:", password);
console.log("- ownerName:", ownerName);
console.log("- companyName:", companyName);
console.log("- phoneNumber:", phoneNumber);
console.log("- address:", address);
console.log("- city:", city);
console.log("- state:", state);
console.log("- zipCode:", zipCode);
console.log("- country:", country);
console.log("- locationDetected:", locationDetected);

// Test the validation logic
const requiredFields = [
  email,
  password,
  ownerName,
  companyName,
  phoneNumber,
  address,
];
const missingFields = requiredFields.filter((field) => !field);

if (missingFields.length > 0) {
  console.log("\n❌ Missing required fields");
} else {
  console.log("\n✅ All required fields present");
}

console.log("\n🧪 This should match the controller logic exactly");
