const Candidate = require("../models/candidate.model");
const RecruitmentPartner = require("../models/recruitmentPartner.model");
const Job = require("../models/job.model");
const Employer = require("../models/employer.model");
const User = require("../models/user.model");
const { sendEmail } = require("../utils/email");
const {
  getCoordinatesFromZipCode,
  isWithinUSBounds,
} = require("../utils/geoUtils");

// Candidate user methods
// Get candidate dashboard data
exports.getCandidateDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user || user.role !== "candidate") {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    // Get candidate's applications count (simulated for now)
    const applicationsCount = 0; // TODO: Implement when job applications are ready

    // Get saved jobs count (simulated for now)
    const savedJobsCount = 0; // TODO: Implement when saved jobs are ready

    // Calculate profile completion
    let profileCompletion = 0;
    const fields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "city",
      "state",
      "zipCode",
    ];
    const completedFields = fields.filter(
      (field) => user[field] && user[field].toString().trim() !== ""
    );
    profileCompletion = Math.round(
      (completedFields.length / fields.length) * 100
    );

    // Mock recent activity
    const recentActivity = [
      {
        id: 1,
        type: "profile_view",
        title: "Profile viewed by TechCorp Inc",
        company: "TechCorp Inc",
        time: "2 hours ago",
        status: "New",
      },
      {
        id: 2,
        type: "application",
        title: "Applied to Software Engineer position",
        company: "StartupXYZ",
        time: "1 day ago",
        status: "Pending",
      },
    ];

    // Job categories with mock data
    const jobCategories = [
      { name: "Software Engineer", count: "2.3k jobs", icon: "💻" },
      { name: "Product Manager", count: "1.8k jobs", icon: "📊" },
      { name: "Data Scientist", count: "1.5k jobs", icon: "📈" },
      { name: "UI/UX Designer", count: "980 jobs", icon: "🎨" },
      { name: "DevOps Engineer", count: "750 jobs", icon: "⚙️" },
      { name: "Marketing Manager", count: "680 jobs", icon: "📢" },
    ];

    res.json({
      profileViews: Math.floor(Math.random() * 50) + 10, // Random profile views
      profileCompletion,
      recentActivity,
      jobCategories,
      responseRate: 0.15, // 15% response rate
    });
  } catch (error) {
    console.error("Get candidate dashboard error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get candidate profile
exports.getCandidateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user || user.role !== "candidate") {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    // Structure the profile data as expected by the frontend
    const profile = {
      personalInfo: user.personalInfo || {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        location: user.city && user.state ? `${user.city}, ${user.state}` : "",
        zipCode: user.zipCode,
        headline: "",
        summary: "",
      },
      experience: user.experience || [],
      education: user.education || [],
      skills: user.skills || [],
      socialLinks: user.socialLinks || {},
      preferences: user.preferences || {},
      resume: user.resume || null,
    };

    res.json({ profile });
  } catch (error) {
    console.error("Get candidate profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update candidate profile
exports.updateCandidateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "candidate") {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    console.log("Update profile request body:", req.body);

    // Update different sections of the profile
    if (req.body.personalInfo) {
      user.personalInfo = { ...user.personalInfo, ...req.body.personalInfo };

      // Also update basic user fields for backward compatibility
      if (req.body.personalInfo.firstName)
        user.firstName = req.body.personalInfo.firstName;
      if (req.body.personalInfo.lastName)
        user.lastName = req.body.personalInfo.lastName;
      if (req.body.personalInfo.phone) user.phone = req.body.personalInfo.phone;
      if (req.body.personalInfo.zipCode)
        user.zipCode = req.body.personalInfo.zipCode;
    }

    if (req.body.experience) {
      user.experience = req.body.experience;
    }

    if (req.body.education) {
      user.education = req.body.education;
    }

    if (req.body.skills) {
      user.skills = req.body.skills;
    }

    if (req.body.socialLinks) {
      user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
    }

    if (req.body.preferences) {
      user.preferences = { ...user.preferences, ...req.body.preferences };
    }

    if (req.body.resume) {
      user.resume = req.body.resume;
    }

    // Update basic fields if provided directly
    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    user.updatedAt = new Date();
    await user.save();

    console.log("Profile updated successfully for user:", user._id);

    // Return the updated profile in the expected format
    const updatedUser = await User.findById(req.user.id).select("-password");
    const profile = {
      personalInfo: updatedUser.personalInfo || {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location:
          updatedUser.city && updatedUser.state
            ? `${updatedUser.city}, ${updatedUser.state}`
            : "",
        zipCode: updatedUser.zipCode,
        headline: "",
        summary: "",
      },
      experience: updatedUser.experience || [],
      education: updatedUser.education || [],
      skills: updatedUser.skills || [],
      socialLinks: updatedUser.socialLinks || {},
      preferences: updatedUser.preferences || {},
      resume: updatedUser.resume || null,
    };

    res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update candidate profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get candidate applications
exports.getCandidateApplications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "candidate") {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    // Get applications from user's applications array and populate job details
    const userWithApplications = await User.findById(req.user.id)
      .populate({
        path: "applications.job",
        populate: {
          path: "employer",
          select: "companyName city state",
        },
      })
      .select("applications");

    // Filter out applications where job data might be missing and safely map
    const applications = userWithApplications.applications
      .filter((app) => app.job && app.job._id) // Only include applications with valid job data
      .map((app) => ({
        _id: app._id,
        jobId: app.job._id,
        jobTitle: app.job.title || "Title not available",
        companyName: app.job.employer?.companyName || "Company not available",
        location:
          app.job.city && app.job.state
            ? `${app.job.city}, ${app.job.state}`
            : "Location not available",
        jobType: app.job.jobType || "Not specified",
        appliedDate: app.appliedAt,
        status: app.status,
        coverLetter: app.coverLetter || "",
        priority: "medium", // Default priority
        salary: app.job.salary || app.job.salaryRange || null,
        // Keep the original job object for backward compatibility
        job: {
          _id: app.job._id,
          title: app.job.title || "Title not available",
          company: app.job.employer?.companyName || "Company not available",
          location:
            app.job.city && app.job.state
              ? `${app.job.city}, ${app.job.state}`
              : "Location not available",
          jobType: app.job.jobType || "Not specified",
        },
      }));

    const statusCounts = applications.reduce((counts, app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
      return counts;
    }, {});

    res.json({
      applications,
      total: applications.length,
      pending: statusCounts.pending || 0,
      reviewing: statusCounts.reviewing || 0,
      accepted: statusCounts.accepted || 0,
      rejected: statusCounts.rejected || 0,
    });
  } catch (error) {
    console.error("Get candidate applications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get candidate saved jobs
exports.getCandidateSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "candidate") {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    // Get saved jobs from user's savedJobs array and populate job details
    const userWithSavedJobs = await User.findById(req.user.id)
      .populate({
        path: "savedJobs.job",
        populate: {
          path: "employer",
          select: "companyName city state",
        },
      })
      .select("savedJobs");

    const savedJobs = userWithSavedJobs.savedJobs
      .filter((savedJob) => savedJob.job && savedJob.job._id) // Only include saved jobs with valid job data
      .map((savedJob) => ({
        _id: savedJob.job._id,
        title: savedJob.job.title || "Title not available",
        description: savedJob.job.description || "Description not available",
        company: savedJob.job.employer?.companyName || "Company not available",
        location:
          savedJob.job.city && savedJob.job.state
            ? `${savedJob.job.city}, ${savedJob.job.state}`
            : "Location not available",
        salaryMin: savedJob.job.salaryMin,
        salaryMax: savedJob.job.salaryMax,
        currency: savedJob.job.currency || "USD",
        jobType: savedJob.job.jobType || "Not specified",
        workMode: savedJob.job.workMode || "Not specified",
        skills: savedJob.job.skills || [],
        postedDate: savedJob.job.createdAt,
        savedDate: savedJob.savedAt,
        applied: savedJob.applied || false,
        priority: savedJob.priority || "medium",
        matchScore: savedJob.matchScore || Math.floor(Math.random() * 30) + 70,
        urgent:
          savedJob.job.urgency === "urgent" ||
          savedJob.job.urgency === "very_urgent",
      }));

    res.json({
      savedJobs,
      total: savedJobs.length,
    });
  } catch (error) {
    console.error("Get candidate saved jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save a job
exports.saveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "candidate") {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    const { jobId } = req.body;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if job is already saved
    const isAlreadySaved = user.savedJobs.some(
      (savedJob) => savedJob.job.toString() === jobId
    );

    if (isAlreadySaved) {
      return res.status(400).json({ message: "Job is already saved" });
    }

    // Add job to user's saved jobs
    user.savedJobs.push({
      job: jobId,
      savedAt: new Date(),
      priority: "medium",
      applied: false,
    });

    await user.save();

    res.json({
      message: "Job saved successfully",
    });
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Unsave a job
exports.unsaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "candidate") {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    const { jobId } = req.body;

    // Remove job from user's saved jobs
    user.savedJobs = user.savedJobs.filter(
      (savedJob) => savedJob.job.toString() !== jobId
    );

    await user.save();

    res.json({
      message: "Job unsaved successfully",
    });
  } catch (error) {
    console.error("Unsave job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    console.log("Apply to job request received:", {
      userId: req.user.id,
      jobId: req.params.id,
    });

    const user = await User.findById(req.user.id);
    console.log(
      "User found:",
      user ? "YES" : "NO",
      user ? `Role: ${user.role}` : ""
    );

    if (!user || user.role !== "candidate") {
      console.log("Candidate profile check failed:", {
        userExists: !!user,
        role: user?.role,
      });
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    const jobId = req.params.id;
    const { coverLetter, customFields } = req.body;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if already applied
    const hasApplied = user.applications.some(
      (app) => app.job.toString() === jobId
    );

    if (hasApplied) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    // Add application to user's applications
    user.applications.push({
      job: jobId,
      appliedAt: new Date(),
      status: "pending",
      coverLetter,
      customFields: customFields || [],
    });

    // Update saved job status if it exists
    const savedJobIndex = user.savedJobs.findIndex(
      (savedJob) => savedJob.job.toString() === jobId
    );
    if (savedJobIndex !== -1) {
      user.savedJobs[savedJobIndex].applied = true;
    }

    await user.save();
    console.log("Application saved successfully for job:", jobId);

    res.json({
      message: "Application submitted successfully",
      application: {
        job: jobId,
        appliedAt: new Date(),
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Apply to job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit candidate application (for recruitment partners)
exports.submitApplication = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    const job = await Job.findById(req.body.job);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Validate US location requirements for candidate
    const { zipCode, city, state, country = "United States" } = req.body;

    if (!zipCode) {
      return res.status(400).json({
        message:
          "Zip code is mandatory for candidate registration in the United States",
      });
    }

    if (!city || !state) {
      return res.status(400).json({
        message: "City and state are required for candidate registration",
      });
    }

    // Validate country is US
    if (country !== "United States" && country !== "USA" && country !== "US") {
      return res.status(400).json({
        message: "Only candidates from the United States are supported",
      });
    }

    // Get coordinates for the zip code
    let coordinates;
    try {
      coordinates = await getCoordinatesFromZipCode(zipCode);

      // Validate coordinates are within US bounds
      if (!isWithinUSBounds(coordinates)) {
        return res.status(400).json({
          message:
            "Invalid zip code: Location is outside United States boundaries",
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "Invalid zip code: Unable to determine location coordinates",
      });
    }

    const candidateData = {
      ...req.body,
      recruitmentPartner: recruitmentPartner._id,
      zipCode,
      city,
      state,
      country: "United States",
      location: {
        type: "Point",
        coordinates: coordinates,
      },
      locationDetected: true,
    };

    const candidate = new Candidate(candidateData);
    await candidate.save();

    res.status(201).json({
      message: "Candidate application submitted successfully",
      candidate,
    });
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get candidates for recruitment partner
exports.getPartnerCandidates = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    const candidates = await Candidate.find({
      recruitmentPartner: recruitmentPartner._id,
    })
      .populate("job", "title status")
      .populate({
        path: "job",
        populate: {
          path: "employer",
          select: "companyName",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ candidates });
  } catch (error) {
    console.error("Get partner candidates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update candidate status (for employers)
exports.updateCandidateStatus = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const candidate = await Candidate.findById(req.params.id).populate({
      path: "job",
      match: { employer: employer._id },
    });

    if (!candidate || !candidate.job) {
      return res
        .status(404)
        .json({ message: "Candidate not found or not authorized" });
    }

    const { status, interviewDate } = req.body;
    const previousStatus = candidate.status;

    candidate.status = status;
    if (interviewDate) {
      candidate.interviewDate = interviewDate;
    }
    candidate.updatedAt = Date.now();

    await candidate.save();

    // Send interview invitation for interview-related status changes
    const interviewStatuses = ['phone_interview', 'in_person_interview', 'assessment'];
    if (interviewStatuses.includes(status) && status !== previousStatus) {
      try {
        await sendInterviewInvitationForCandidate(candidate, employer, status);
      } catch (emailError) {
        console.error("Error sending interview invitation:", emailError);
        // Don't fail the status update if email fails
      }
    }

    res.json({
      message: "Candidate status updated successfully",
      candidate,
    });
  } catch (error) {
    console.error("Update candidate status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add note to candidate (for employers)
exports.addCandidateNote = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const candidate = await Candidate.findById(req.params.id).populate({
      path: "job",
      match: { employer: employer._id },
    });

    if (!candidate || !candidate.job) {
      return res
        .status(404)
        .json({ message: "Candidate not found or not authorized" });
    }

    const { round, text } = req.body;

    candidate.notes.push({
      round,
      text,
      createdAt: new Date(),
    });

    await candidate.save();

    res.json({
      message: "Note added successfully",
      candidate,
    });
  } catch (error) {
    console.error("Add candidate note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save candidate (for employers)
exports.saveCandidate = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const candidate = await Candidate.findById(req.params.id).populate({
      path: "job",
      match: { employer: employer._id },
    });

    if (!candidate || !candidate.job) {
      return res
        .status(404)
        .json({ message: "Candidate not found or not authorized" });
    }

    candidate.isSaved = !candidate.isSaved;
    await candidate.save();

    res.json({
      message: `Candidate ${
        candidate.isSaved ? "saved" : "unsaved"
      } successfully`,
      candidate,
    });
  } catch (error) {
    console.error("Save candidate error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get saved candidates (for employers)
exports.getSavedCandidates = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const candidates = await Candidate.find({
      isSaved: true,
    })
      .populate({
        path: "job",
        match: { employer: employer._id },
        select: "title",
      })
      .populate("recruitmentPartner", "companyName")
      .sort({ createdAt: -1 });

    // Filter out candidates where job is null (not belonging to this employer)
    const filteredCandidates = candidates.filter((candidate) => candidate.job);

    res.json({ candidates: filteredCandidates });
  } catch (error) {
    console.error("Get saved candidates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to send interview invitation for candidate
const sendInterviewInvitationForCandidate = async (candidate, employer, status) => {
  try {
    const { InterviewBooking, InterviewInvitation } = require("../models/interview.model");
    const { v4: uuidv4 } = require("uuid");

    // Generate tokens
    const invitationToken = uuidv4();
    const bookingToken = uuidv4();

    // Create a placeholder booking for invitation
    const booking = await InterviewBooking.create({
      employer: employer._id,
      job: candidate.job._id,
      candidate: candidate._id,
      recruitmentPartner: candidate.recruitmentPartner,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      bookingToken: bookingToken,
      status: "scheduled",
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await InterviewInvitation.create({
      booking: booking._id,
      invitationToken,
      candidateEmail: candidate.email,
      expiresAt,
    });

    // Send invitation email using the existing function
    const statusMessages = {
      phone_interview: "Phone Interview",
      in_person_interview: "In-Person Interview", 
      assessment: "Assessment"
    };

    const statusTitle = statusMessages[status] || status;
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/interview/schedule/${invitationToken}`;

    await sendEmail({
      to: candidate.email,
      subject: `Interview Invitation - ${statusTitle} | ${employer.companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .info-box { background-color: #e0f2fe; border-left: 4px solid #0288d1; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Interview Invitation</h1>
            </div>
            <div class="content">
              <p>Dear ${candidate.name},</p>
              
              <p>Congratulations! Your application has been reviewed and we would like to invite you for an interview.</p>
              
              <div class="info-box">
                <p><strong>Company:</strong> ${employer.companyName}</p>
                <p><strong>Position:</strong> ${candidate.job?.title || 'Position'}</p>
                <p><strong>Interview Type:</strong> ${statusTitle}</p>
                ${candidate.interviewDate ? `<p><strong>Scheduled Date:</strong> ${new Date(candidate.interviewDate).toLocaleDateString()}</p>` : ''}
              </div>
              
              <p>Please click the button below to access your interview scheduling portal where you can select your preferred time slot:</p>
              
              <div style="text-align: center;">
                <a href="${invitationLink}" class="button" style="color: white !important;">Schedule Your Interview</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${invitationLink}</p>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Click the link above to access the scheduling portal</li>
                <li>Select your preferred interview time from available slots</li>
                <li>You will receive a calendar invitation once confirmed</li>
                <li>Prepare any required documents or portfolio items</li>
              </ul>
              
              <p>We look forward to speaking with you soon!</p>
              
              <p>Best regards,<br>
              ${employer.companyName} Hiring Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the BOD Platform.</p>
              <p>&copy; 2025 BOD Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Interview Invitation - ${statusTitle}
        
        Dear ${candidate.name},
        
        Congratulations! Your application has been reviewed and we would like to invite you for an interview.
        
        Company: ${employer.companyName}
        Position: ${candidate.job?.title || 'Position'}
        Interview Type: ${statusTitle}
        ${candidate.interviewDate ? `Scheduled Date: ${new Date(candidate.interviewDate).toLocaleDateString()}` : ''}
        
        Please visit the following link to schedule your interview:
        ${invitationLink}
        
        We look forward to speaking with you soon!
        
        Best regards,
        ${employer.companyName} Hiring Team
        
        ---
        This is an automated message from the BOD Platform.
      `
    });

    console.log(`Interview invitation sent to ${candidate.email} for ${statusTitle} with token: ${invitationToken}`);
    return { success: true, invitationToken, bookingId: booking._id };
  } catch (error) {
    console.error("Error sending interview invitation for candidate:", error);
    throw error;
  }
};
