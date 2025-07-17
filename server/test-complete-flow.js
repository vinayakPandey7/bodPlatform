const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

// Test data
const testZipCode = "10001"; // New York, NY
// Using existing user credentials
const employerCredentials = {
  email: "emp11@test.com", // Try different email format
  password: "123456789",
};

const candidateCredentials = {
  email: "cand1@test.com",
  password: "123456789",
};

const jobData = {
  title: "Senior Software Developer",
  description:
    "We are looking for an experienced software developer to join our team.",
  requirements: [
    "5+ years experience",
    "JavaScript/Node.js",
    "React experience",
  ],
  skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  experience: "5-8", // Fixed: valid enum value
  location: "New York, NY", // Fixed: simple string location
  jobType: "full_time", // Fixed: required field with valid enum
  workMode: "office", // Fixed: required field with valid enum
  salaryMin: 80000,
  salaryMax: 120000,
  benefits: ["Health insurance", "Remote work", "401k"],
  department: "Engineering",
};

let employerToken = "";
let candidateToken = "";
let jobId = "";
let applicationId = "";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkEmployerProfile() {
  try {
    console.log("🔍 Checking employer profile status...");
    const response = await axios.get(`${BASE_URL}/employer/profile`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    console.log("✅ Employer profile exists");
    return response.data;
  } catch (error) {
    console.log(
      "❌ Employer profile check failed:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function loginEmployer() {
  try {
    console.log("🔑 Logging in employer...");
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      employerCredentials
    );
    employerToken = response.data.token;
    console.log("✅ Employer logged in successfully");
    console.log("Employer user:", response.data.user);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Employer login failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function createJob() {
  try {
    console.log("📝 Creating job posting...");
    const jobPayload = {
      ...jobData,
      zipCode: employerRegistrationData.employerData.address.zipCode,
      city: employerRegistrationData.employerData.address.city,
      state: employerRegistrationData.employerData.address.state,
      country: "United States",
    };

    const response = await axios.post(`${BASE_URL}/jobs`, jobPayload, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    jobId = response.data.job._id;
    console.log("✅ Job created successfully with ID:", jobId);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Job creation failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function createJob() {
  try {
    console.log("\n📝 Creating job posting...");
    const jobPayload = {
      ...jobData,
      zipCode: testZipCode,
      city: "New York",
      state: "NY",
      country: "United States",
    };

    const response = await axios.post(`${BASE_URL}/jobs`, jobPayload, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    jobId = response.data.job._id;
    console.log("✅ Job created successfully with ID:", jobId);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Job creation failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function loginCandidate() {
  try {
    console.log("🔑 Logging in candidate...");
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      candidateCredentials
    );
    candidateToken = response.data.token;
    console.log("✅ Candidate logged in successfully");
    console.log("Candidate user:", response.data.user);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Candidate login failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function searchJobs() {
  try {
    console.log("\n🔍 Searching for jobs as candidate...");
    const response = await axios.get(
      `${BASE_URL}/jobs/search?zipCode=${testZipCode}&radius=25`,
      {
        headers: { Authorization: `Bearer ${candidateToken}` },
      }
    );
    console.log(`✅ Found ${response.data.jobs.length} jobs`);

    const ourJob = response.data.jobs.find((job) => job._id === jobId);
    if (ourJob) {
      console.log("✅ Our posted job is visible to candidate!");
      console.log("Job details:", {
        title: ourJob.title,
        company: ourJob.employer?.companyName,
        location: ourJob.location?.address?.city,
      });
    } else {
      console.log("❌ Our posted job is NOT visible to candidate");
      console.log(
        "Available jobs:",
        response.data.jobs.map((job) => ({
          id: job._id,
          title: job.title,
          company: job.employer?.companyName,
        }))
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ Job search failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function applyForJob() {
  try {
    console.log("\n📤 Applying for job...");
    const response = await axios.post(
      `${BASE_URL}/jobs/${jobId}/apply`,
      {
        coverLetter:
          "I am very interested in this position and believe my skills would be a great fit for your team.",
      },
      {
        headers: { Authorization: `Bearer ${candidateToken}` },
      }
    );
    console.log(
      "Full application response:",
      JSON.stringify(response.data, null, 2)
    );
    // Since the response doesn't include the application ID, we'll try to find it by the latest application
    applicationId = "latest"; // We'll use this as a marker to find the most recent application
    console.log("✅ Job application submitted successfully");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Job application failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function checkEmployerApplications() {
  try {
    console.log("\n📋 Checking employer applications...");
    const response = await axios.get(`${BASE_URL}/employer/applications`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    console.log(
      `✅ Found ${response.data.applications.length} total applications`
    );

    const ourApplication = response.data.applications.find(
      (app) => app.job._id === jobId
    );
    if (ourApplication) {
      console.log("✅ Application is visible in employer dashboard!");
      console.log("Application details:", {
        id: ourApplication._id,
        candidateName: `${ourApplication.candidate?.firstName} ${ourApplication.candidate?.lastName}`,
        jobTitle: ourApplication.job?.title,
        status: ourApplication.status,
        appliedAt: ourApplication.appliedAt,
      });
    } else {
      console.log("❌ Application is NOT visible in employer dashboard");
      console.log(
        "Available applications:",
        response.data.applications.map((app) => ({
          id: app._id,
          candidate: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
          job: app.job?.title,
        }))
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to get employer applications:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function checkJobSpecificApplications() {
  try {
    console.log("\n🎯 Checking job-specific applications...");
    const response = await axios.get(
      `${BASE_URL}/employer/jobs/${jobId}/applications`,
      {
        headers: { Authorization: `Bearer ${employerToken}` },
      }
    );
    console.log(
      `✅ Found ${response.data.applications.length} applications for this specific job`
    );

    const ourApplication = response.data.applications.find(
      (app) => app.job._id === jobId
    );
    if (ourApplication) {
      console.log("✅ Application is visible in job-specific applications!");
      console.log("Application details:", {
        id: ourApplication._id,
        candidateName: `${ourApplication.candidate?.firstName} ${ourApplication.candidate?.lastName}`,
        status: ourApplication.status,
        appliedAt: ourApplication.appliedAt,
        coverLetter: ourApplication.coverLetter,
      });
    } else {
      console.log("❌ Application is NOT visible in job-specific applications");
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to get job-specific applications:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function checkCandidateApplications() {
  try {
    console.log("\n📋 Checking candidate applications...");
    const response = await axios.get(`${BASE_URL}/candidates/applications`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    console.log(
      `✅ Found ${response.data.applications.length} applications for candidate`
    );

    const ourApplication = response.data.applications.find(
      (app) => app.job?.title === "Senior Software Developer"
    );
    if (ourApplication) {
      console.log("✅ Application is visible in candidate applications!");
      console.log("Application details:", {
        id: ourApplication._id,
        jobTitle: ourApplication.job?.title,
        company: ourApplication.job?.employer?.companyName,
        status: ourApplication.status,
        appliedAt: ourApplication.appliedAt,
      });
    } else {
      console.log("❌ Application is NOT visible in candidate applications");
      console.log(
        "Available applications:",
        response.data.applications.map((app) => ({
          id: app._id,
          job: app.job?.title,
          company: app.job?.employer?.companyName,
        }))
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to get candidate applications:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function updateApplicationStatus() {
  try {
    console.log("\n🔄 Testing application status update...");

    // We need to find the candidate ID and application ID from the previous steps
    // Let's get the applications again to find our test application
    const response = await axios.get(`${BASE_URL}/employer/applications`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });

    const testApplication = response.data.applications.find(
      (app) => app.job._id === jobId
    );
    if (!testApplication) {
      console.log("❌ Could not find test application for status update");
      return;
    }

    const candidateId = testApplication.candidate._id;
    const applicationId = testApplication._id;

    console.log(
      `Updating application ${applicationId} for candidate ${candidateId}`
    );

    const statusUpdateResponse = await axios.put(
      `${BASE_URL}/employer/candidates/${candidateId}/applications/${applicationId}/status`,
      { status: "shortlisted" },
      {
        headers: { Authorization: `Bearer ${employerToken}` },
      }
    );

    console.log("✅ Application status updated successfully!");
    console.log("Update response:", statusUpdateResponse.data);

    return statusUpdateResponse.data;
  } catch (error) {
    console.error(
      "❌ Status update failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function runCompleteTest() {
  try {
    console.log("🚀 Starting complete application flow test...\n");

    // Step 1: Login Employer (existing account)
    await loginEmployer();

    // Step 1.5: Check employer profile
    await checkEmployerProfile();

    // Step 2: Create Job
    await createJob();

    // Wait a moment for job to be saved
    await sleep(1000);

    // Step 3: Login Candidate (existing account)
    await loginCandidate();

    // Step 4: Apply for Job (skip search, apply directly)
    await applyForJob();

    // Wait a moment for application to be saved
    await sleep(1000);

    // Step 5: Check Employer Applications
    await checkEmployerApplications();

    // Step 6: Check Job-Specific Applications
    await checkJobSpecificApplications();

    // Step 7: Check Candidate Applications (NEW - to verify candidate can see their applications)
    await checkCandidateApplications();

    // Step 8: Test Status Update Functionality
    await updateApplicationStatus();

    console.log("\n🎉 Complete test finished! Check the results above.");
  } catch (error) {
    console.error("\n💥 Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
runCompleteTest();
