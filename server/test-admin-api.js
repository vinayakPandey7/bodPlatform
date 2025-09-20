const mongoose = require("mongoose");
const User = require("./models/user.model");
const Employer = require("./models/employer.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

async function testAdminAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create or find admin user
    let adminUser = await User.findOne({ email: "admin@theciero.com" });
    
    if (!adminUser) {
      adminUser = new User({
        email: "admin@theciero.com",
        password: "admin123",
        role: "admin",
        firstName: "Admin",
        lastName: "User",
      });
      
      await adminUser.save();
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    console.log("JWT Token:", token);

    // Check if we have any employers
    const employersCount = await Employer.countDocuments();
    console.log("Current employers count:", employersCount);

    // If no employers, create a sample one
    if (employersCount === 0) {
      // Create a sample employer user
      const employerUser = new User({
        email: "employer@example.com",
        password: "employer123",
        role: "employer",
      });
      await employerUser.save();

      // Create employer profile
      const employer = new Employer({
        user: employerUser._id,
        ownerName: "John Doe",
        companyName: "Tech Solutions Inc",
        phoneNumber: "+1-555-123-4567",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        country: "United States",
        jobPosting: "automatic",
        isApproved: true,
        website: "https://techsolutions.com",
        description: "Leading technology solutions provider",
      });
      await employer.save();
      
      console.log("Sample employer created");
    }

    console.log("\nTest the API with this token:");
    console.log(`curl -X GET http://localhost:5000/api/admin/employers -H "Authorization: Bearer ${token}"`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

testAdminAPI();
