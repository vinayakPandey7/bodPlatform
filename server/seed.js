const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");
const Employer = require("./models/employer.model");
const RecruitmentPartner = require("./models/recruitmentPartner.model");
const Candidate = require("./models/candidate.model");
const Job = require("./models/job.model");
const {
  getCoordinatesFromZipCode,
  addSampleZipCode,
} = require("./utils/geoUtils");
require("dotenv").config();

// Add sample zip codes for testing
addSampleZipCode("10001", [-73.9967, 40.7505]); // New York, NY
addSampleZipCode("90210", [-118.4065, 34.0901]); // Beverly Hills, CA
addSampleZipCode("60601", [-87.6298, 41.8781]); // Chicago, IL
addSampleZipCode("77002", [-95.3698, 29.7604]); // Houston, TX
addSampleZipCode("33101", [-80.1918, 25.7617]); // Miami, FL
addSampleZipCode("98101", [-122.3321, 47.6062]); // Seattle, WA
addSampleZipCode("80202", [-104.9903, 39.7392]); // Denver, CO
addSampleZipCode("75201", [-96.797, 32.7767]); // Dallas, TX
addSampleZipCode("94102", [-122.4194, 37.7749]); // San Francisco, CA
addSampleZipCode("32801", [-81.3792, 28.5383]); // Orlando, FL

// US Cities with zip codes
const usCitiesWithZips = [
  { city: "New York", state: "NY", zipCode: "10001" },
  { city: "Los Angeles", state: "CA", zipCode: "90210" },
  { city: "Chicago", state: "IL", zipCode: "60601" },
  { city: "Houston", state: "TX", zipCode: "77002" },
  { city: "Miami", state: "FL", zipCode: "33101" },
  { city: "Seattle", state: "WA", zipCode: "98101" },
  { city: "Denver", state: "CO", zipCode: "80202" },
  { city: "Dallas", state: "TX", zipCode: "75201" },
  { city: "San Francisco", state: "CA", zipCode: "94102" },
  { city: "Orlando", state: "FL", zipCode: "32801" },
];

// Sample data arrays
const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Christopher",
  "Karen",
  "Charles",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Helen",
  "Mark",
  "Sandra",
  "Donald",
  "Donna",
  "Steven",
  "Carol",
  "Paul",
  "Ruth",
  "Andrew",
  "Sharon",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Laura",
  "Kevin",
  "Sarah",
  "Brian",
  "Kimberly",
  "George",
  "Deborah",
  "Timothy",
  "Dorothy",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
];

const companies = [
  "TechCorp Solutions",
  "Global Insurance Group",
  "NextGen Consulting",
  "Premier Financial",
  "DataFlow Systems",
  "CloudFirst Technologies",
  "Innovative Marketing",
  "Strategic Partners",
  "Digital Dynamics",
  "Future Vision",
  "Elite Services",
  "Quantum Analytics",
];

const jobTitles = [
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "Marketing Specialist",
  "Sales Representative",
  "Customer Service Rep",
  "Insurance Agent",
  "Claims Adjuster",
  "Business Analyst",
  "Project Manager",
  "UX Designer",
  "DevOps Engineer",
];

const cities = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
];

function getRandomCityWithZip() {
  return getRandomElement(usCitiesWithZips);
}

const adminUsers = [
  {
    email: "admin@bodportal.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
  },
  {
    email: "super.admin@bodportal.com",
    password: "superadmin123",
    firstName: "Super",
    lastName: "Admin",
  },
  {
    email: "manager@bodportal.com",
    password: "manager123",
    firstName: "Manager",
    lastName: "Admin",
  },
  {
    email: "director@bodportal.com",
    password: "director123",
    firstName: "Director",
    lastName: "Admin",
  },
  {
    email: "ceo@bodportal.com",
    password: "ceo123",
    firstName: "CEO",
    lastName: "Admin",
  },
];

const testEmployers = [
  {
    email: "employer1@test.com",
    password: "employer123",
    firstName: "John",
    lastName: "Smith",
    companyName: "TechCorp Solutions",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  },
  {
    email: "employer2@test.com",
    password: "employer123",
    firstName: "Sarah",
    lastName: "Johnson",
    companyName: "Global Insurance Group",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
  },
  {
    email: "employer3@test.com",
    password: "employer123",
    firstName: "Michael",
    lastName: "Brown",
    companyName: "NextGen Consulting",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
  },
];

const testRecruiters = [
  {
    email: "recruiter1@test.com",
    password: "recruiter123",
    firstName: "Emily",
    lastName: "Davis",
    companyName: "Elite Recruiting Services",
  },
  {
    email: "recruiter2@test.com",
    password: "recruiter123",
    firstName: "David",
    lastName: "Wilson",
    companyName: "Premier Talent Solutions",
  },
];

const testCandidates = [
  {
    email: "candidate1@test.com",
    password: "candidate123",
    firstName: "Jennifer",
    lastName: "Garcia",
  },
  {
    email: "candidate2@test.com",
    password: "candidate123",
    firstName: "Robert",
    lastName: "Martinez",
  },
];

const statuses = [
  "shortlist",
  "assessment",
  "phone_interview",
  "in_person_interview",
  "background_check",
  "selected",
  "rejected",
  "stand_by",
  "no_response",
];
const genders = ["male", "female", "other"];
const jobTypes = [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
];
const workModes = ["office", "remote", "hybrid"];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function getRandomPhoneNumber() {
  return `+1-555-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getRandomEmail(firstName, lastName, index = "") {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "email.com",
  ];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${
    index ? "." + index : ""
  }@${getRandomElement(domains)}`;
}

async function createTestEmployers() {
  console.log("\n🏢 Creating test employers...");

  let created = 0;
  const createdEmployers = [];

  for (const empData of testEmployers) {
    try {
      const existingUser = await User.findOne({ email: empData.email });

      if (existingUser) {
        console.log(`⚠️  Employer already exists: ${empData.email}`);
        continue;
      }

      // Get coordinates for the zip code
      const coordinates = await getCoordinatesFromZipCode(empData.zipCode);

      const employerUser = new User({
        email: empData.email,
        password: empData.password,
        role: "employer",
        isActive: true,
      });
      await employerUser.save();

      const employer = new Employer({
        user: employerUser._id,
        ownerName: `${empData.firstName} ${empData.lastName}`,
        companyName: empData.companyName,
        email: empData.email,
        phoneNumber: getRandomPhoneNumber(),
        address: `${Math.floor(100 + Math.random() * 9900)} Business St`,
        city: empData.city,
        state: empData.state,
        zipCode: empData.zipCode,
        country: "United States",
        location: {
          type: "Point",
          coordinates: coordinates,
        },
        locationDetected: true,
        jobPosting: "manual",
        isApproved: true,
      });
      await employer.save();
      createdEmployers.push(employer);

      console.log(
        `✅ Created test employer: ${empData.firstName} ${empData.lastName} (${empData.companyName})`
      );
      created++;
    } catch (error) {
      console.log(`❌ Failed to create ${empData.email}: ${error.message}`);
    }
  }

  console.log(`\n📊 Test Employer Summary: ${created} created`);
  return createdEmployers;
}

async function createTestRecruiters() {
  console.log("\n🤝 Creating test recruiters...");

  let created = 0;
  const createdRecruiters = [];

  for (const recData of testRecruiters) {
    try {
      const existingUser = await User.findOne({ email: recData.email });

      if (existingUser) {
        console.log(`⚠️  Recruiter already exists: ${recData.email}`);
        continue;
      }

      const recruitmentPartnerUser = new User({
        email: recData.email,
        password: recData.password,
        role: "recruitment_partner",
        isActive: true,
      });
      await recruitmentPartnerUser.save();

      const recruitmentPartner = new RecruitmentPartner({
        user: recruitmentPartnerUser._id,
        ownerName: `${recData.firstName} ${recData.lastName}`,
        companyName: recData.companyName,
        phoneNumber: getRandomPhoneNumber(),
        address: `${Math.floor(100 + Math.random() * 9900)} Recruiting Ave`,
        city: getRandomElement(cities).split(", ")[0],
        state: getRandomElement(cities).split(", ")[1] || "CA",
        country: "United States",
      });
      await recruitmentPartner.save();
      createdRecruiters.push(recruitmentPartner);

      console.log(
        `✅ Created test recruiter: ${recData.firstName} ${recData.lastName} (${recData.companyName})`
      );
      created++;
    } catch (error) {
      console.log(`❌ Failed to create ${recData.email}: ${error.message}`);
    }
  }

  console.log(`\n📊 Test Recruiter Summary: ${created} created`);
  return createdRecruiters;
}

async function createTestCandidates() {
  console.log("\n👥 Creating test candidates (as users only)...");

  let created = 0;

  for (const candData of testCandidates) {
    try {
      const existingUser = await User.findOne({ email: candData.email });

      if (existingUser) {
        console.log(`⚠️  Candidate already exists: ${candData.email}`);
        continue;
      }

      const candidateUser = new User({
        email: candData.email,
        password: candData.password,
        firstName: candData.firstName,
        lastName: candData.lastName,
        role: "candidate",
        isActive: true,
      });
      await candidateUser.save();

      console.log(
        `✅ Created test candidate: ${candData.firstName} ${candData.lastName}`
      );
      created++;
    } catch (error) {
      console.log(`❌ Failed to create ${candData.email}: ${error.message}`);
    }
  }

  console.log(`\n📊 Test Candidate Summary: ${created} created`);
  return created;
}

async function createAdmins() {
  console.log("\n🚀 Creating admin users...");

  let created = 0;
  let existing = 0;

  for (const adminData of adminUsers) {
    try {
      const existingUser = await User.findOne({ email: adminData.email });

      if (existingUser) {
        console.log(`⚠️  Admin already exists: ${adminData.email}`);
        existing++;
        continue;
      }

      const newAdmin = new User({
        email: adminData.email,
        password: adminData.password, // Will be hashed by pre-save middleware
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: "admin",
        isActive: true,
      });

      await newAdmin.save();
      console.log(
        `✅ Created admin: ${adminData.firstName} ${adminData.lastName}`
      );
      created++;
    } catch (error) {
      console.log(`❌ Failed to create ${adminData.email}: ${error.message}`);
    }
  }

  console.log(
    `\n📊 Admin Summary: ${created} created, ${existing} already existed`
  );
  return { created, existing };
}

async function createAdmins() {
  console.log("\n🚀 Creating admin users...");

  let created = 0;
  let existing = 0;

  for (const adminData of adminUsers) {
    try {
      const existingUser = await User.findOne({ email: adminData.email });

      if (existingUser) {
        console.log(`⚠️  Admin already exists: ${adminData.email}`);
        existing++;
        continue;
      }

      const newAdmin = new User({
        email: adminData.email,
        password: adminData.password, // Will be hashed by pre-save middleware
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: "admin",
        isActive: true,
      });

      await newAdmin.save();
      console.log(
        `✅ Created admin: ${adminData.firstName} ${adminData.lastName}`
      );
      created++;
    } catch (error) {
      console.log(`❌ Failed to create ${adminData.email}: ${error.message}`);
    }
  }

  console.log(
    `\n📊 Admin Summary: ${created} created, ${existing} already existed`
  );
  return { created, existing };
}

async function seedDatabase() {
  try {
    console.log("🚀 Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Clear existing data
    console.log("\n🧹 Clearing existing data...");
    await User.deleteMany({});
    await Employer.deleteMany({});
    await RecruitmentPartner.deleteMany({});
    await Candidate.deleteMany({});
    await Job.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create admin users
    await createAdmins();

    // Create test users with known credentials
    const testEmployersList = await createTestEmployers();
    const testRecruitersList = await createTestRecruiters();
    await createTestCandidates();

    // Create employers
    console.log("\n👔 Creating 20 employers...");
    const employers = [];
    for (let i = 0; i < 20; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = getRandomEmail(firstName, lastName, `emp${i}`);
      const cityData = getRandomCityWithZip();
      const coordinates = await getCoordinatesFromZipCode(cityData.zipCode);

      const employerUser = new User({
        email: email,
        password: "employer123",
        role: "employer",
      });
      await employerUser.save();

      const employer = new Employer({
        user: employerUser._id,
        ownerName: `${firstName} ${lastName}`,
        companyName: getRandomElement(companies),
        email: email,
        phoneNumber: getRandomPhoneNumber(),
        address: `${Math.floor(100 + Math.random() * 9900)} Business St`,
        city: cityData.city,
        state: cityData.state,
        zipCode: cityData.zipCode,
        country: "United States",
        location: {
          type: "Point",
          coordinates: coordinates,
        },
        locationDetected: true,
        jobPosting: Math.random() > 0.5 ? "automatic" : "manual",
        isApproved: Math.random() > 0.2,
      });
      await employer.save();
      employers.push(employer);
    }

    // Create recruitment partners
    console.log("🤝 Creating 20 recruitment partners...");
    const recruitmentPartners = [];
    for (let i = 0; i < 20; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = getRandomEmail(firstName, lastName, `rec${i}`);

      const recruitmentPartnerUser = new User({
        email: email,
        password: "recruiter123",
        role: "recruitment_partner",
      });
      await recruitmentPartnerUser.save();

      const recruitmentPartner = new RecruitmentPartner({
        user: recruitmentPartnerUser._id,
        ownerName: `${firstName} ${lastName}`,
        companyName: `${getRandomElement(companies)} Recruiting`,
        phoneNumber: getRandomPhoneNumber(),
        address: `${Math.floor(100 + Math.random() * 9900)} Recruiting Ave`,
        city: getRandomElement(cities).split(", ")[0],
        state: getRandomElement(cities).split(", ")[1] || "CA",
        country: "United States",
      });
      await recruitmentPartner.save();
      recruitmentPartners.push(recruitmentPartner);
    }

    // Create jobs
    console.log("💼 Creating 30 jobs...");
    const jobs = [];
    for (let i = 0; i < 30; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));

      const expiryDate = new Date();
      expiryDate.setDate(
        expiryDate.getDate() + Math.floor(30 + Math.random() * 60)
      );

      const cityData = getRandomCityWithZip();
      const coordinates = await getCoordinatesFromZipCode(cityData.zipCode);

      const job = new Job({
        employer: getRandomElement(employers)._id,
        title: getRandomElement(jobTitles),
        description: `We are looking for a talented professional to join our team. This role offers excellent opportunities for career growth.`,
        requirements: [
          "Bachelor's degree or equivalent experience",
          "Strong communication skills",
          "Problem-solving abilities",
        ],
        skills: ["Communication", "Problem Solving", "Team Work"],
        experience: getRandomElement([
          "0-1",
          "1-3",
          "3-5",
          "5-8",
          "8-12",
          "12+",
        ]),
        location: `${cityData.city}, ${cityData.state}`,
        zipCode: cityData.zipCode,
        city: cityData.city,
        state: cityData.state,
        country: "United States",
        geoLocation: {
          type: "Point",
          coordinates: coordinates,
        },
        jobType: getRandomElement(jobTypes),
        workMode: getRandomElement(workModes),
        salaryMin: 50000 + Math.floor(Math.random() * 50000),
        salaryMax: 100000 + Math.floor(Math.random() * 100000),
        currency: "USD",
        benefits: ["Health Insurance", "401k", "Paid Time Off"],
        department: getRandomElement([
          "Engineering",
          "Sales",
          "Marketing",
          "HR",
          "Finance",
        ]),
        urgency: getRandomElement(["normal", "urgent", "very_urgent"]),
        startDate: startDate,
        numberOfPositions: Math.floor(1 + Math.random() * 5),
        expires: expiryDate,
        isApproved: Math.random() > 0.3,
        isActive: Math.random() > 0.2,
      });
      await job.save();
      jobs.push(job);
    }

    // Create candidates
    console.log("👥 Creating 40 candidates...");
    for (let i = 0; i < 40; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = getRandomEmail(firstName, lastName, `cand${i}`);
      const birthDate = getRandomDate(
        new Date("1970-01-01"),
        new Date("2000-12-31")
      );
      const cityData = getRandomCityWithZip();
      const coordinates = await getCoordinatesFromZipCode(cityData.zipCode);

      const candidate = new Candidate({
        job: getRandomElement(jobs)._id,
        recruitmentPartner: getRandomElement(recruitmentPartners)._id,
        name: `${firstName} ${lastName}`,
        phone: getRandomPhoneNumber(),
        dateOfBirth: birthDate,
        email: email,
        address: `${Math.floor(100 + Math.random() * 9900)} Candidate St`,
        zipCode: cityData.zipCode,
        city: cityData.city,
        state: cityData.state,
        country: "United States",
        location: {
          type: "Point",
          coordinates: coordinates,
        },
        locationDetected: true,
        gender: getRandomElement(genders),
        resume: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_resume.pdf`,
        status: getRandomElement(statuses),
        languages: ["English"],
        hasPreviousExperienceWithStateFarm: Math.random() > 0.7,
        hasPreviousInsuranceExperience: Math.random() > 0.5,
        isLicensedWithStateFarmTraining: Math.random() > 0.8,
        isLicensedWithBankingExperience: Math.random() > 0.6,
        isLicensedWithoutInsuranceExperience: Math.random() > 0.5,
        isSaved: Math.random() > 0.8,
      });
      await candidate.save();
    }

    // Final summary
    const finalCounts = {
      users: await User.countDocuments(),
      admins: await User.countDocuments({ role: "admin" }),
      employers: await Employer.countDocuments(),
      partners: await RecruitmentPartner.countDocuments(),
      jobs: await Job.countDocuments(),
      candidates: await Candidate.countDocuments(),
    };

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("📊 Final Counts:");
    console.log(`👤 Total Users: ${finalCounts.users}`);
    console.log(`👑 Admin Users: ${finalCounts.admins}`);
    console.log(`🏢 Employers: ${finalCounts.employers}`);
    console.log(`🤝 Recruitment Partners: ${finalCounts.partners}`);
    console.log(`💼 Jobs: ${finalCounts.jobs}`);
    console.log(`👥 Candidates: ${finalCounts.candidates}`);

    console.log("\n🔐 Admin Login Credentials:");
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} / ${admin.password}`);
    });

    console.log("\n🏢 Test Employer Login Credentials:");
    testEmployers.forEach((emp, index) => {
      console.log(
        `${index + 1}. ${emp.email} / ${emp.password} (${emp.companyName})`
      );
    });

    console.log("\n🤝 Test Recruiter Login Credentials:");
    testRecruiters.forEach((rec, index) => {
      console.log(
        `${index + 1}. ${rec.email} / ${rec.password} (${rec.companyName})`
      );
    });

    console.log("\n👥 Test Candidate Login Credentials:");
    testCandidates.forEach((cand, index) => {
      console.log(
        `${index + 1}. ${cand.email} / ${cand.password} (${cand.firstName} ${
          cand.lastName
        })`
      );
    });

    console.log(
      "\n✨ Database seeding completed! You can now start your application."
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

// Run the seeding
seedDatabase();
