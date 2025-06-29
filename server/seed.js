const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");
const Employer = require("./models/employer.model");
const RecruitmentPartner = require("./models/recruitmentPartner.model");
const Candidate = require("./models/candidate.model");
const Job = require("./models/job.model");
require("dotenv").config();

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
  "Pinnacle Group",
  "Velocity Solutions",
  "Horizon Enterprises",
  "Apex Technologies",
  "Meridian Consulting",
  "Summit Strategies",
  "Nexus Corporation",
  "Catalyst Systems",
  "Vanguard Solutions",
  "Phoenix Technologies",
  "Stellar Consulting",
  "Matrix Corporation",
  "Infinity Group",
  "Zenith Solutions",
  "Axiom Technologies",
  "Vector Consulting",
  "Prism Corporation",
  "Synergy Systems",
  "Titan Technologies",
  "Oracle Solutions",
  "Genesis Group",
  "Nova Corporation",
  "Alpha Systems",
  "Beta Technologies",
  "Gamma Solutions",
  "Delta Corporation",
  "Epsilon Group",
  "Zeta Systems",
  "Theta Technologies",
  "Lambda Solutions",
  "Sigma Corporation",
  "Omega Group",
  "Pi Systems",
  "Tau Technologies",
  "Phi Solutions",
  "Chi Corporation",
  "Psi Group",
  "Upsilon Systems",
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
  "QA Tester",
  "Technical Writer",
  "Account Manager",
  "HR Specialist",
  "Financial Analyst",
  "Operations Manager",
  "Research Analyst",
  "Social Media Manager",
  "Content Creator",
  "System Administrator",
  "Database Administrator",
  "Network Engineer",
  "Security Analyst",
  "Web Developer",
  "Mobile Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Cloud Architect",
  "Solutions Architect",
  "Technical Lead",
  "Team Lead",
  "Scrum Master",
  "Product Owner",
  "Brand Manager",
  "Digital Marketing Manager",
  "SEO Specialist",
  "Email Marketing Specialist",
  "Graphic Designer",
  "Video Editor",
  "Copy Writer",
  "Legal Counsel",
  "Compliance Officer",
  "Risk Analyst",
  "Investment Advisor",
  "Loan Officer",
  "Underwriter",
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
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "Charlotte, NC",
  "San Francisco, CA",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Washington, DC",
  "Boston, MA",
  "El Paso, TX",
  "Nashville, TN",
  "Detroit, MI",
  "Oklahoma City, OK",
  "Portland, OR",
  "Las Vegas, NV",
  "Memphis, TN",
  "Louisville, KY",
  "Baltimore, MD",
  "Milwaukee, WI",
  "Albuquerque, NM",
  "Tucson, AZ",
  "Fresno, CA",
  "Sacramento, CA",
  "Kansas City, MO",
  "Mesa, AZ",
  "Atlanta, GA",
  "Omaha, NE",
  "Colorado Springs, CO",
  "Raleigh, NC",
  "Miami, FL",
  "Cleveland, OH",
  "Tulsa, OK",
  "Oakland, CA",
  "Minneapolis, MN",
  "Wichita, KS",
  "Arlington, TX",
  "Tampa, FL",
  "New Orleans, LA",
];

const languages = [
  ["English"],
  ["English", "Spanish"],
  ["English", "French"],
  ["English", "Mandarin"],
  ["English", "German"],
  ["English", "Italian"],
  ["English", "Portuguese"],
  ["English", "Japanese"],
  ["English", "Korean"],
  ["English", "Arabic"],
  ["Spanish"],
  ["Spanish", "English"],
  ["French", "English"],
  ["Mandarin", "English"],
  ["German", "English"],
  ["Italian", "English"],
  ["Portuguese", "English"],
  ["Japanese", "English"],
  ["Korean", "English"],
  ["Arabic", "English"],
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
const jobRoles = ["full_time", "part_time"];
const jobTypes = [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
];
const workModes = ["office", "remote", "hybrid"];
const payStructures = ["hourly", "monthly"];
const serviceSalesFocus = ["service_focused", "sales_focused", "both"];
const licenseRequirements = [
  "Unlicensed Accepted",
  "P&C",
  "L&H",
  "All License",
];
const recruitmentDurations = ["15-20 Days TUE", "30 Days NE", "60 Days EE"];

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

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Employer.deleteMany({});
    await RecruitmentPartner.deleteMany({});
    await Candidate.deleteMany({});
    await Job.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const adminUser = new User({
      email: "admin@bodportal.com",
      password: "admin123",
      role: "admin",
    });
    await adminUser.save();

    console.log("Creating 50 employers...");
    // Create 50 employer users and profiles
    const employers = [];
    for (let i = 0; i < 50; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = getRandomEmail(firstName, lastName, `emp${i}`);

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
        phoneNumber: getRandomPhoneNumber(),
        address: `${Math.floor(100 + Math.random() * 9900)} Business St`,
        city: getRandomElement(cities).split(", ")[0],
        state: getRandomElement(cities).split(", ")[1] || "CA",
        country: "United States",
        jobPosting: Math.random() > 0.5 ? "automatic" : "manual",
        isApproved: Math.random() > 0.2, // 80% approved
      });
      await employer.save();
      employers.push(employer);
    }

    console.log("Creating 50 recruitment partners...");
    // Create 50 recruitment partner users and profiles
    const recruitmentPartners = [];
    for (let i = 0; i < 50; i++) {
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

    console.log("Creating 50 jobs...");
    // Create 50 jobs
    const jobs = [];
    for (let i = 0; i < 50; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // Start within next 30 days

      const expiryDate = new Date();
      expiryDate.setDate(
        expiryDate.getDate() + Math.floor(30 + Math.random() * 60)
      ); // Expires in 30-90 days

      const job = new Job({
        employer: getRandomElement(employers)._id,
        title: getRandomElement(jobTitles),
        description: `We are looking for a talented professional to join our team. This role offers excellent opportunities for career growth and development in a dynamic environment.`,
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
        location: getRandomElement(cities),
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
        jobRole: getRandomElement(jobRoles),
        payStructure: getRandomElement(payStructures),
        serviceSalesFocus: getRandomElement(serviceSalesFocus),
        licenseRequirement: getRandomElement(licenseRequirements),
        languagePreference: ["English"],
        startDate: startDate,
        numberOfPositions: Math.floor(1 + Math.random() * 10),
        recruitmentDuration: getRandomElement(recruitmentDurations),
        expires: expiryDate,
        isApproved: Math.random() > 0.3, // 70% approved
        isActive: Math.random() > 0.2, // 80% active
      });
      await job.save();
      jobs.push(job);
    }

    console.log("Creating 50 candidates...");
    // Create 50 candidates
    for (let i = 0; i < 50; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = getRandomEmail(firstName, lastName, `cand${i}`);

      const birthDate = getRandomDate(
        new Date("1970-01-01"),
        new Date("2000-12-31")
      );

      const candidate = new Candidate({
        job: getRandomElement(jobs)._id,
        recruitmentPartner: getRandomElement(recruitmentPartners)._id,
        name: `${firstName} ${lastName}`,
        phone: getRandomPhoneNumber(),
        dateOfBirth: birthDate,
        email: email,
        address: `${Math.floor(
          100 + Math.random() * 9900
        )} Candidate St, ${getRandomElement(cities)}`,
        gender: getRandomElement(genders),
        resume: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_resume.pdf`,
        status: getRandomElement(statuses),
        languages: getRandomElement(languages),
        hasPreviousExperienceWithStateFarm: Math.random() > 0.7, // 30% have State Farm experience
        hasPreviousInsuranceExperience: Math.random() > 0.5, // 50% have insurance experience
        isLicensedWithStateFarmTraining: Math.random() > 0.8, // 20% have State Farm training
        isLicensedWithBankingExperience: Math.random() > 0.6, // 40% have banking experience
        isLicensedWithoutInsuranceExperience: Math.random() > 0.5, // 50% licensed without insurance
        licenseType:
          Math.random() > 0.5
            ? getRandomElement(licenseRequirements)
            : undefined,
        isSaved: Math.random() > 0.8, // 20% saved
      });
      await candidate.save();
    }

    console.log("Database seeded successfully!");
    console.log("\nCreated:");
    console.log("- 1 Admin user");
    console.log("- 50 Employers");
    console.log("- 50 Recruitment Partners");
    console.log("- 50 Jobs");
    console.log("- 50 Candidates");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@bodportal.com / admin123");
    console.log("Employers: [generated emails] / employer123");
    console.log("Recruiters: [generated emails] / recruiter123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
