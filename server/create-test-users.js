const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user.model");
const Employer = require("./models/employer.model");
const RecruitmentPartner = require("./models/recruitmentPartner.model");

// Load environment variables
dotenv.config();

const testUsers = [
  // Admin User
  {
    email: "admin@test.com",
    password: "admin123",
    role: "admin",
    isActive: true,
    additionalData: null,
  },

  // Employer User
  {
    email: "employer@test.com",
    password: "employer123",
    role: "employer",
    isActive: true,
    additionalData: {
      ownerName: "John Smith",
      companyName: "TechCorp Inc",
      email: "employer@test.com",
      phoneNumber: "555-0123",
      address: "123 Business Ave",
      city: "New York",
      state: "New York",
      zipCode: "10001",
      country: "United States",
      website: "https://techcorp.com",
      industry: "Technology",
      companySize: "50-200",
      description: "Leading technology company providing innovative solutions",
      jobPosting: "manual",
      isApproved: true,
      location: {
        type: "Point",
        coordinates: [-73.994007, 40.7484379], // NYC coordinates
      },
    },
  },

  // Recruitment Partner User
  {
    email: "recruiter@test.com",
    password: "recruiter123",
    role: "recruitment_partner",
    isActive: true,
    additionalData: {
      ownerName: "Sarah Johnson",
      companyName: "Elite Recruitment Partners",
      phoneNumber: "555-0456",
      address: "456 Recruitment Blvd",
      city: "Los Angeles",
      state: "California",
      country: "United States",
    },
  },

  // Candidate User
  {
    email: "candidate@test.com",
    password: "candidate123",
    role: "candidate",
    isActive: true,
    firstName: "Jane",
    lastName: "Doe",
    phoneNumber: "555-0789",
    address: "789 Residential St",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60601",
    country: "United States",
    location: {
      type: "Point",
      coordinates: [-87.6298, 41.8781], // Chicago coordinates
    },
    additionalData: null,
  },
];

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🧹 Cleaning existing test users...");

    // Delete existing test users
    await User.deleteMany({
      email: { $in: testUsers.map((u) => u.email) },
    });

    // Delete existing test employer and recruitment partner profiles
    await Employer.deleteMany({
      email: {
        $in: testUsers.filter((u) => u.role === "employer").map((u) => u.email),
      },
    });

    await RecruitmentPartner.deleteMany({
      email: {
        $in: testUsers
          .filter((u) => u.role === "recruitment_partner")
          .map((u) => u.email),
      },
    });

    console.log("👥 Creating test users...");

    for (const userData of testUsers) {
      const {
        additionalData,
        firstName,
        lastName,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        country,
        location,
        ...userFields
      } = userData;

      // Create user
      const user = new User({
        ...userFields,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber && { phoneNumber }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
        ...(country && { country }),
        ...(location && { location }),
      });

      await user.save();
      console.log(`   ✅ Created user: ${user.email} (${user.role})`);

      // Create role-specific profiles
      if (userData.role === "employer" && additionalData) {
        const employer = new Employer({
          user: user._id,
          ...additionalData,
        });
        await employer.save();
        console.log(`   ✅ Created employer profile for: ${user.email}`);
      }

      if (userData.role === "recruitment_partner" && additionalData) {
        const recruitmentPartner = new RecruitmentPartner({
          user: user._id,
          ...additionalData,
        });
        await recruitmentPartner.save();
        console.log(
          `   ✅ Created recruitment partner profile for: ${user.email}`
        );
      }
    }

    console.log("");
    console.log("🎉 All test users created successfully!");
    console.log("");
    console.log("📋 LOGIN CREDENTIALS:");
    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log("│                    TEST USER CREDENTIALS                │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ ADMIN:                                                  │");
    console.log("│   Email: admin@test.com                                 │");
    console.log("│   Password: admin123                                    │");
    console.log("│   Access: Full admin dashboard and controls             │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ EMPLOYER:                                               │");
    console.log("│   Email: employer@test.com                              │");
    console.log("│   Password: employer123                                 │");
    console.log("│   Company: TechCorp Inc                                 │");
    console.log("│   Location: New York, NY 10001                         │");
    console.log("│   Access: Post jobs, view applications                  │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ RECRUITMENT PARTNER:                                    │");
    console.log("│   Email: recruiter@test.com                             │");
    console.log("│   Password: recruiter123                                │");
    console.log("│   Company: Elite Recruitment Partners                   │");
    console.log("│   Location: Los Angeles, CA 90210                      │");
    console.log("│   Access: Manage candidates, view jobs                  │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ CANDIDATE:                                              │");
    console.log("│   Email: candidate@test.com                             │");
    console.log("│   Password: candidate123                                │");
    console.log("│   Name: Jane Doe                                        │");
    console.log("│   Location: Chicago, IL 60601                          │");
    console.log("│   Access: Search jobs within 4-mile radius             │");
    console.log("└─────────────────────────────────────────────────────────┘");
    console.log("");
    console.log("🌐 Frontend URL: http://localhost:3002/login");
    console.log("🔧 Backend URL: http://localhost:5000");
    console.log("");
  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📴 Disconnected from MongoDB");
  }
}

// Run the script
createTestUsers();
