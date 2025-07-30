const mongoose = require("mongoose");
const User = require("./models/user.model");
const Employer = require("./models/employer.model");
const dotenv = require("dotenv");

dotenv.config();

async function debugEmployerModel() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Test data
    const timestamp = Date.now();
    const testData = {
      ownerName: "Jane Smith",
      companyName: "Test Integration Corp",
      email: `test.debug.${timestamp}@example.com`,
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

    console.log("Test data:", testData);

    // Create a fake user first
    const user = new User({
      email: testData.email,
      password: "test123",
      role: "employer",
    });

    await user.save();
    console.log("User created:", user._id);

    // Test employer creation
    const employer = new Employer({
      user: user._id,
      ...testData
    });

    console.log("Attempting to save employer with data:", employer.toObject());

    await employer.save();
    console.log("Employer saved successfully:", employer._id);

    // Clean up
    await User.findByIdAndDelete(user._id);
    await Employer.findByIdAndDelete(employer._id);
    console.log("Test data cleaned up");

  } catch (error) {
    console.error("Debug error:", error);
  } finally {
    mongoose.disconnect();
  }
}

debugEmployerModel();
