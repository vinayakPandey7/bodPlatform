const RecruitmentPartner = require("../models/recruitmentPartner.model");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Candidate = require("../models/candidate.model");
const Client = require("../models/client.model");
const mongoose = require("mongoose");

// Add new candidate
exports.addCandidate = async (req, res) => {
  try {
    console.log("Add candidate request body:", req.body);
    console.log("Add candidate request file:", req.file);

    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    const {
      name,
      email,
      phone,
      skills,
      experience,
      education,
      zipcode,
      address,
      city,
      state,
      expectedSalary,
      currentCompany,
      currentPosition,
      noticePeriod,
      linkedIn,
      portfolio,
      notes,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !zipcode) {
      return res.status(400).json({
        message: "Name, email, phone, and zipcode are required fields",
      });
    }

    // Check if candidate with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "A candidate with this email already exists",
      });
    }

    // Parse skills if it's a string
    let parsedSkills = [];
    if (skills) {
      try {
        parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills;
      } catch (error) {
        console.log("Error parsing skills:", error);
        parsedSkills = Array.isArray(skills) ? skills : [skills];
      }
    }

    // Create candidate user account
    const candidateUser = new User({
      email,
      password: "TempPassword123!", // Temporary password - candidate should reset
      role: "candidate",
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || "",
      phoneNumber: phone,
      zipCode: zipcode,
      city,
      state,
      country: "United States",
      isActive: true,
      // Track which recruitment partner added this candidate
      addedByRecruitmentPartner: recruitmentPartner._id,
      // Add comprehensive profile data
      personalInfo: {
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        email,
        phone,
        location: city && state ? `${city}, ${state}` : "",
        zipCode: zipcode,
        headline: currentPosition || "",
        summary: notes || "",
      },
      experience: experience
        ? [
            {
              id: Date.now().toString(),
              title: currentPosition || "Previous Position",
              company: currentCompany || "Previous Company",
              location: city && state ? `${city}, ${state}` : "",
              startDate: "",
              endDate: "",
              current: !!currentCompany,
              description: `${experience} years of experience`,
            },
          ]
        : [],
      education: education
        ? [
            {
              id: Date.now().toString(),
              degree: education,
              school: "Educational Institution",
              location: "",
              startDate: "",
              endDate: "",
              gpa: "",
              description: "",
            },
          ]
        : [],
      skills: parsedSkills.map((skill, index) => ({
        id: (Date.now() + index).toString(),
        name: skill,
        level: "intermediate",
        years: 1,
      })),
      socialLinks: {
        linkedin: linkedIn || "",
        portfolio: portfolio || "",
      },
      preferences: {
        salaryRange: {
          min: expectedSalary ? parseInt(expectedSalary) * 1000 : 0,
          max: expectedSalary ? parseInt(expectedSalary) * 1000 * 1.5 : 0,
        },
        availableStartDate: noticePeriod ? `${noticePeriod} weeks` : "",
      },
    });

    // Handle resume upload if present
    if (req.file) {
      candidateUser.resume = {
        fileName: req.file.filename, // Cloudinary public_id
        originalName: req.file.originalname,
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date(),
        cloudinaryPublicId: req.file.filename,
        cloudinaryUrl: req.file.path, // Cloudinary URL
        storageType: "cloudinary",
      };
    }

    await candidateUser.save();

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      candidate: {
        id: candidateUser._id,
        name,
        email,
        phone,
        skills: parsedSkills,
        experience,
        education,
        zipcode,
        city,
        state,
        currentCompany,
        currentPosition,
        recruitmentPartner: recruitmentPartner._id,
        resume: candidateUser.resume,
      },
    });
  } catch (error) {
    console.error("Add candidate error:", error);
    res.status(500).json({
      message: "Server error while adding candidate",
      error: error.message,
    });
  }
};

// Get recruitment partner profile
exports.getProfile = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    res.json({ recruitmentPartner });
  } catch (error) {
    console.error("Get recruitment partner profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update recruitment partner profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      ownerName,
      companyName,
      phoneNumber,
      address,
      city,
      state,
      country,
    } = req.body;

    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    // Update fields
    if (ownerName) recruitmentPartner.ownerName = ownerName;
    if (companyName) recruitmentPartner.companyName = companyName;
    if (phoneNumber) recruitmentPartner.phoneNumber = phoneNumber;
    if (address) recruitmentPartner.address = address;
    if (city) recruitmentPartner.city = city;
    if (state) recruitmentPartner.state = state;
    if (country) recruitmentPartner.country = country;

    recruitmentPartner.updatedAt = Date.now();

    await recruitmentPartner.save();

    res.json({
      message: "Profile updated successfully",
      recruitmentPartner,
    });
  } catch (error) {
    console.error("Update recruitment partner profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    // Get current date and date ranges
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const thirtyDaysAgo = new Date(
      currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    // Get basic statistics - candidates are stored in User collection
    const totalCandidates = await User.countDocuments({
      role: "candidate",
      addedByRecruitmentPartner: recruitmentPartner._id,
    });

    // For placement statistics, we need to check applications within candidates
    // Get all candidates and their application statuses
    const candidatesWithApplications = await User.find({
      role: "candidate",
      addedByRecruitmentPartner: recruitmentPartner._id,
    }).select("applications");

    // Count different application statuses
    let activePlacements = 0;
    let pendingInterviews = 0;
    let thisMonthPlacements = 0;
    let totalApplications = 0;

    candidatesWithApplications.forEach((candidate) => {
      if (candidate.applications && candidate.applications.length > 0) {
        candidate.applications.forEach((application) => {
          totalApplications++;

          if (application.status === "hired") {
            activePlacements++;

            // Check if hired this month
            if (
              application.appliedAt &&
              application.appliedAt >= startOfMonth
            ) {
              thisMonthPlacements++;
            }
          }

          if (
            ["phone_interview", "in_person_interview"].includes(
              application.status
            )
          ) {
            pendingInterviews++;
          }
        });
      }
    });

    // If no applications exist, show the candidate count as active candidates
    if (totalApplications === 0) {
      totalApplications = totalCandidates;
    }

    const successRate =
      totalApplications > 0
        ? Math.round((activePlacements / totalApplications) * 100)
        : 0;

    // Calculate average time to place by analyzing placement timeline
    let averageTimeToPlace = 0;

    try {
      // Get all candidates with hired applications
      const placedCandidates = await User.find({
        role: "candidate",
        addedByRecruitmentPartner: recruitmentPartner._id,
        "applications.status": "hired",
        createdAt: { $exists: true },
        updatedAt: { $exists: true },
      }).select("createdAt updatedAt applications");

      if (placedCandidates.length > 0) {
        let totalDays = 0;
        let placementCount = 0;

        placedCandidates.forEach((candidate) => {
          // Find hired applications for this candidate
          const hiredApplications = candidate.applications.filter(
            (app) => app.status === "hired"
          );

          hiredApplications.forEach((application) => {
            const timeDiff = application.appliedAt - candidate.createdAt;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            if (daysDiff > 0) {
              totalDays += daysDiff;
              placementCount++;
            }
          });
        });

        if (placementCount > 0) {
          averageTimeToPlace = Math.round(totalDays / placementCount);
        }
      }
    } catch (error) {
      console.log("Error calculating average time to place:", error.message);
      averageTimeToPlace = 0; // Use 0 instead of static value when error
    } // Try to get client stats if client model exists
    let activeClients = 0;
    let totalRevenue = 0;

    try {
      const Client = require("../models/client.model");

      // Count active clients - use the correct field name
      activeClients = await Client.countDocuments({
        recruitmentPartnerId: req.user.id, // Use user ID, not recruitment partner ID
        status: "active",
      });

      // Calculate total revenue from contracts
      const revenueAgg = await Client.aggregate([
        {
          $match: {
            recruitmentPartnerId: new mongoose.Types.ObjectId(req.user.id),
          },
        },
        { $group: { _id: null, total: { $sum: "$contractValue" } } },
      ]);

      totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
    } catch (error) {
      console.log("Client model not available or error:", error.message);
    }

    // Get recent activity (recent candidate additions and any application updates)
    const recentCandidates = await User.find({
      role: "candidate",
      addedByRecruitmentPartner: recruitmentPartner._id,
    })
      .select("firstName lastName updatedAt email applications createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // Format recent activity - prioritize application updates, then candidate additions
    const formattedActivity = [];

    recentCandidates.forEach((candidate) => {
      const candidateName =
        `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() ||
        candidate.email.split("@")[0];

      // Check for recent application updates
      if (candidate.applications && candidate.applications.length > 0) {
        const recentApplication = candidate.applications.sort(
          (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
        )[0];

        let type = "application";
        let title = "";
        let status = "info";

        switch (recentApplication.status) {
          case "hired":
            type = "placement";
            title = `${candidateName} successfully placed`;
            status = "success";
            break;
          case "phone_interview":
          case "in_person_interview":
            type = "interview";
            title = `Interview scheduled for ${candidateName}`;
            status = "pending";
            break;
          case "background_check":
            type = "application";
            title = `Background check for ${candidateName}`;
            status = "warning";
            break;
          default:
            title = `Application update for ${candidateName}`;
        }

        formattedActivity.push({
          id: candidate._id + "_app",
          type,
          title,
          description: `Application status: ${recentApplication.status}`,
          timestamp: recentApplication.appliedAt,
          status,
        });
      } else {
        // Show candidate addition if no applications
        formattedActivity.push({
          id: candidate._id,
          type: "candidate",
          title: `New candidate added: ${candidateName}`,
          description: "Candidate profile created",
          timestamp: candidate.createdAt,
          status: "info",
        });
      }
    });

    // Sort by timestamp and limit to 5
    const sortedActivity = formattedActivity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    // Get top performers (hired candidates or recent candidates if no hires)
    let topPerformers = await User.find({
      role: "candidate",
      addedByRecruitmentPartner: recruitmentPartner._id,
      "applications.status": "hired",
    })
      .select("firstName lastName updatedAt email applications")
      .sort({ updatedAt: -1 })
      .limit(5);

    // If no hired candidates, show recent candidates
    if (topPerformers.length === 0) {
      topPerformers = await User.find({
        role: "candidate",
        addedByRecruitmentPartner: recruitmentPartner._id,
      })
        .select("firstName lastName createdAt email")
        .sort({ createdAt: -1 })
        .limit(5);
    }

    const formattedTopPerformers = topPerformers.map((candidate, index) => {
      const candidateName =
        `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() ||
        candidate.email.split("@")[0];

      // Check if this candidate has hired applications
      const hasHiredApp =
        candidate.applications &&
        candidate.applications.some((app) => app.status === "hired");

      return {
        id: candidate._id,
        name: candidateName,
        role: hasHiredApp ? "Successfully Placed" : "Active Candidate",
        company: hasHiredApp ? "Client Company" : "Available",
        placementDate: candidate.updatedAt || candidate.createdAt,
        revenue: hasHiredApp ? 5000 : 0, // Only show revenue for actual placements
      };
    });

    // Get jobs statistics
    const totalActiveJobs = await Job.countDocuments({
      status: "active",
      isApproved: true,
      expires: { $gt: new Date() },
    });

    const totalPublishedJobs = await Job.countDocuments({
      isApproved: true,
    });

    // Get jobs expiring in 10 days
    const expiringJobs = await Job.find({
      status: "active",
      isApproved: true,
      expires: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    })
      .populate("employer", "companyName")
      .select("title location numberOfPositions recruitmentDuration expires")
      .limit(5);

    // Get recently posted jobs
    const recentJobs = await Job.find({
      status: "active",
      isApproved: true,
      expires: { $gt: new Date() },
    })
      .populate("employer", "companyName")
      .select("title location numberOfPositions recruitmentDuration")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalCandidates,
          activePlacements,
          totalRevenue,
          successRate,
          pendingInterviews,
          activeClients,
          thisMonthPlacements,
          averageTimeToPlace,
          totalActiveJobs,
          totalPublishedJobs,
        },
        recentActivity: sortedActivity,
        topPerformers: formattedTopPerformers,
        expiringJobs,
        recentJobs,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get jobs applied by recruitment partner
exports.getAppliedJobs = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    const appliedJobs = await Candidate.aggregate([
      {
        $match: { recruitmentPartner: recruitmentPartner._id },
      },
      {
        $group: {
          _id: "$job",
          candidateCount: { $sum: 1 },
          candidates: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $lookup: {
          from: "employers",
          localField: "jobDetails.employer",
          foreignField: "_id",
          as: "employerDetails",
        },
      },
      {
        $unwind: "$jobDetails",
      },
      {
        $unwind: "$employerDetails",
      },
      {
        $project: {
          job: "$jobDetails",
          employer: "$employerDetails",
          candidateCount: 1,
          candidates: 1,
        },
      },
    ]);

    res.json({ appliedJobs });
  } catch (error) {
    console.error("Get applied jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get candidates added by recruitment partner
exports.getCandidates = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    console.log(
      "Looking for candidates with recruitment partner ID:",
      recruitmentPartner._id
    );

    // Find candidates created by this recruitment partner
    // Also include the specific candidate with email itm.vinayak@gmail.com for debugging
    const candidates = await User.find({
      role: "candidate",
      $or: [
        { addedByRecruitmentPartner: recruitmentPartner._id },
        { email: "itm.vinayak@gmail.com" }, // Temporary: include specific candidate for debugging
      ],
    })
      .select("-password")
      .sort({ createdAt: -1 });

    console.log("Found candidates:", candidates.length);
    console.log(
      "Candidate emails:",
      candidates.map((c) => c.email)
    );

    // For now, let's return all candidates and later we'll add proper filtering
    // based on the recruitment partner who added them
    const formattedCandidates = candidates.map((candidate) => {
      // Handle both local and Cloudinary resume storage
      let resumeUrl = null;
      if (candidate.resume) {
        if (candidate.resume.cloudinaryUrl) {
          // New Cloudinary format
          resumeUrl = candidate.resume.cloudinaryUrl;
        } else if (candidate.resume.url) {
          // Local storage format
          resumeUrl = candidate.resume.url;
        } else if (candidate.resume.fileName) {
          // Fallback: construct local URL from filename
          resumeUrl = `/api/uploads/resumes/${candidate.resume.fileName}`;
        }
      }

      return {
        _id: candidate._id,
        name:
          `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() ||
          candidate.email.split("@")[0],
        email: candidate.email,
        phone: candidate.phoneNumber || candidate.personalInfo?.phone || "N/A",
        status: "active", // Default status
        resume: candidate.resume?.fileName || null, // Keep for backward compatibility
        resumeUrl: resumeUrl,
        resumeData: candidate.resume || null, // Include full resume object for frontend
        job: {
          _id: "general",
          title: "General Application",
          location:
            candidate.city && candidate.state
              ? `${candidate.city}, ${candidate.state}`
              : "N/A",
        },
        isSaved: false,
        createdAt: candidate.createdAt,
        zipCode: candidate.zipCode,
        city: candidate.city,
        state: candidate.state,
        skills: candidate.skills || [],
        experience: candidate.experience || [],
        education: candidate.education || [],
        currentCompany: candidate.personalInfo?.currentCompany || "",
        currentPosition: candidate.personalInfo?.currentPosition || "",
      };
    });

    res.json({
      candidates: formattedCandidates,
      total: formattedCandidates.length,
    });
  } catch (error) {
    console.error("Get candidates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit candidate for a specific job
exports.submitCandidate = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }


  // Helper to get first value if array, else value
  const getString = (val) => Array.isArray(val) ? val[0] : val;

  const submissionType = getString(req.body.submissionType);
  const candidateId = getString(req.body.candidateId);
  const name = getString(req.body.name);
  const email = getString(req.body.email);
  const phone = getString(req.body.phone);
  const currentPosition = getString(req.body.currentPosition);
  const currentCompany = getString(req.body.currentCompany);
  const experience = getString(req.body.experience);
  const education = getString(req.body.education);
  const skills = req.body.skills; // skills may be array or stringified array, handled below
  const expectedSalary = getString(req.body.expectedSalary);
  const zipcode = getString(req.body.zipcode);
  const address = getString(req.body.address);
  const city = getString(req.body.city);
  const state = getString(req.body.state);
  const linkedIn = getString(req.body.linkedIn);
  const portfolio = getString(req.body.portfolio);
  const coverLetter = getString(req.body.coverLetter);
  const availability = getString(req.body.availability);
  const noticePeriod = getString(req.body.noticePeriod);
  const notes = getString(req.body.notes);
  const jobId = getString(req.body.jobId);
  const jobTitle = getString(req.body.jobTitle);
  const companyName = getString(req.body.companyName);

    // Validate required fields based on submission type
    if (!jobId || !coverLetter || !availability || !noticePeriod) {
      return res.status(400).json({
        message:
          "Job ID, cover letter, availability, and notice period are required",
      });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    let candidateUser;

    if (submissionType === "existing" && candidateId) {
      // Handle existing candidate submission

      candidateUser = await User.findById(candidateId);
      if (!candidateUser) {
        return res.status(404).json({
          message: "Selected candidate not found",
        });
      }

      // Verify the candidate belongs to this recruitment partner
      if (
        !candidateUser.addedByRecruitmentPartner ||
        candidateUser.addedByRecruitmentPartner.toString() !==
          recruitmentPartner._id.toString()
      ) {
        // Allow for debugging - temporary inclusion of itm.vinayak@gmail.com
        if (candidateUser.email !== "itm.vinayak@gmail.com") {
          return res.status(403).json({
            message: "You can only submit candidates you've added",
          });
        }
      }

      // Check if already applied to this job
      const existingApplication = candidateUser.applications.find(
        (app) => app.job.toString() === jobId
      );

      if (existingApplication) {
        return res.status(400).json({
          message: "This candidate has already been submitted for this job",
        });
      }

      // Add new application to existing candidate
      const newApplication = {
        job: jobId,
        appliedAt: new Date(),
        status: "pending",
        coverLetter: coverLetter || "",
        customFields: [
          {
            question: "Availability",
            answer: availability,
          },
          {
            question: "Notice Period",
            answer: noticePeriod,
          },
          {
            question: "Additional Notes",
            answer: notes || "",
          },
        ],
      };

      candidateUser.applications.push(newApplication);
      candidateUser.updatedAt = new Date();

      await candidateUser.save();
    } else {
      // Handle new candidate submission

      // For new candidates, validate required fields
      if (!name || !email) {
        return res.status(400).json({
          message: "Name and email are required for new candidates",
        });
      }

      // Parse skills if it's a string
      let parsedSkills = [];
      if (skills) {
        try {
          parsedSkills =
            typeof skills === "string" ? JSON.parse(skills) : skills;
        } catch (error) {
          console.log("Error parsing skills:", error);
          parsedSkills = Array.isArray(skills) ? skills : [skills];
        }
      }

      // Check if candidate with this email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message:
            "A candidate with this email already exists. Please use 'Select Existing Candidate' option.",
        });
      }

      candidateUser = new User({
        email,
        password: "TempPassword123!", // Temporary password - candidate should reset
        role: "candidate",
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        phoneNumber: phone,
        zipCode: zipcode,
        city,
        state,
        country: "United States",
        isActive: true,
        addedByRecruitmentPartner: recruitmentPartner._id,
        personalInfo: {
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" ") || "",
          email,
          phone,
          location: city && state ? `${city}, ${state}` : "",
          zipCode: zipcode,
          headline: currentPosition || "",
          summary: notes || "",
        },
        experience: experience
          ? [
              {
                id: Date.now().toString(),
                title: currentPosition || "Current Position",
                company: currentCompany || "Current Company",
                location: city && state ? `${city}, ${state}` : "",
                startDate: "",
                endDate: "",
                current: true,
                description: `${experience} years of experience`,
              },
            ]
          : [],
        education: education
          ? [
              {
                id: Date.now().toString(),
                degree: education,
                school: "Educational Institution",
                location: "",
                startDate: "",
                endDate: "",
                gpa: "",
                description: "",
              },
            ]
          : [],
        skills: parsedSkills.map((skill, index) => ({
          id: (Date.now() + index).toString(),
          name: skill,
          level: "intermediate",
          years: 1,
        })),
        socialLinks: {
          linkedin: linkedIn || "",
          portfolio: portfolio || "",
        },
        preferences: {
          salaryRange: {
            min: expectedSalary
              ? parseInt(expectedSalary.replace(/\D/g, ""))
              : 0,
            max: expectedSalary
              ? parseInt(expectedSalary.replace(/\D/g, "")) * 1.2
              : 0,
          },
          availableStartDate: availability || "",
        },
        applications: [
          {
            job: jobId,
            appliedAt: new Date(),
            status: "pending",
            coverLetter: coverLetter || "",
            customFields: [
              {
                question: "Expected Salary",
                answer: expectedSalary || "Not specified",
              },
              {
                question: "Current Position",
                answer: currentPosition || "Not specified",
              },
              {
                question: "Current Company",
                answer: currentCompany || "Not specified",
              },
              {
                question: "Experience",
                answer: experience || "Not specified",
              },
              {
                question: "Notice Period",
                answer: noticePeriod,
              },
              {
                question: "Availability",
                answer: availability,
              },
              {
                question: "Additional Notes",
                answer: notes || "",
              },
            ],
          },
        ],
      });

      // Handle resume upload if present
      if (req.file) {
        candidateUser.resume = {
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadDate: new Date(),
          cloudinaryPublicId: req.file.filename,
          cloudinaryUrl: req.file.path,
          storageType: "cloudinary",
        };
      }

      await candidateUser.save();
    }

    res.status(201).json({
      success: true,
      message: "Candidate submitted successfully for the job",
      data: {
        candidateId: candidateUser._id,
        jobId: jobId,
        jobTitle: jobTitle,
        companyName: companyName,
        applicationStatus: "pending",
        submittedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Submit candidate error:", error);
    res.status(500).json({
      message: "Server error while submitting candidate",
      error: error.message,
    });
  }
};

// Get applications submitted by recruitment partner
exports.getApplications = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    // Find all candidates submitted by this recruitment partner
    const candidates = await User.find({
      role: "candidate",
      addedByRecruitmentPartner: recruitmentPartner._id,
    })
      .select(
        "firstName lastName email phoneNumber applications personalInfo resume createdAt"
      )
      .populate({
        path: "applications.job",
        populate: {
          path: "employer",
          select: "companyName",
        },
      })
      .sort({ createdAt: -1 });

    // Transform the data to show all applications
    const applications = [];

    candidates.forEach((candidate) => {
      const candidateName =
        `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() ||
        candidate.email.split("@")[0];

      if (candidate.applications && candidate.applications.length > 0) {
        candidate.applications.forEach((application) => {
          applications.push({
            _id: application._id || `${candidate._id}_${application.job}`,
            candidate: {
              _id: candidate._id,
              name: candidateName,
              email: candidate.email,
              phone:
                candidate.phoneNumber || candidate.personalInfo?.phone || "N/A",
              status: application.status || "pending",
              resume: candidate.resume || null,
            },
            job: {
              _id: application.job?._id || application.job,
              title: application.job?.title || "Job Title Not Available",
              location: application.job?.location || "Location Not Specified",
              employer: {
                companyName:
                  application.job?.employer?.companyName ||
                  "Company Not Specified",
              },
            },
            status: application.status || "pending",
            appliedAt: application.appliedAt || candidate.createdAt,
            submittedAt: application.appliedAt || candidate.createdAt,
            coverLetter: application.coverLetter || "",
            customFields: application.customFields || [],
          });
        });
      } else {
        // Show candidates without applications as "awaiting placement"
        applications.push({
          _id: candidate._id,
          candidate: {
            _id: candidate._id,
            name: candidateName,
            email: candidate.email,
            phone:
              candidate.phoneNumber || candidate.personalInfo?.phone || "N/A",
            status: "awaiting_placement",
            resume: candidate.resume || null,
          },
          job: {
            _id: "no-job",
            title: "Awaiting Job Placement",
            location: "Various",
            employer: {
              companyName: "Seeking Opportunities",
            },
          },
          status: "awaiting_placement",
          appliedAt: candidate.createdAt,
          submittedAt: candidate.createdAt,
          coverLetter: "",
          customFields: [],
        });
      }
    });

    // Sort by submission date (most recent first)
    applications.sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
    );

    res.json({
      success: true,
      applications,
      total: applications.length,
      summary: {
        totalApplications: applications.length,
        pending: applications.filter((app) => app.status === "pending").length,
        shortlisted: applications.filter((app) => app.status === "shortlist")
          .length,
        interviewing: applications.filter((app) =>
          ["phone_interview", "in_person_interview"].includes(app.status)
        ).length,
        hired: applications.filter((app) => app.status === "hired").length,
        rejected: applications.filter((app) => app.status === "rejected")
          .length,
        awaitingPlacement: applications.filter(
          (app) => app.status === "awaiting_placement"
        ).length,
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications",
      error: error.message,
    });
  }
};

// Get submitted candidates with interview details
exports.getSubmittedCandidates = async (req, res) => {
  try {
    const { jobId } = req.query; // Get job ID from query parameters
    
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res.status(404).json({
        success: false,
        message: "Recruitment partner profile not found",
      });
    }

    // Build query to filter candidates
    let candidateQuery = {
      role: "candidate",
      addedByRecruitmentPartner: recruitmentPartner._id,
      "applications.0": { $exists: true }, // Only candidates with applications
    };

    // If jobId is provided, filter candidates who applied to that specific job
    if (jobId) {
      candidateQuery["applications.job"] = jobId;
    }

    // Get candidates submitted by this recruitment partner (optionally filtered by job)
    const candidates = await User.find(candidateQuery)
      .populate({
        path: "applications.job",
        populate: {
          path: "employer",
          select: "companyName ownerName",
        },
      })
      .select("firstName lastName email phoneNumber applications createdAt resume")
      .sort({ updatedAt: -1 });

    // Import InterviewBooking model
    const InterviewBooking = require("../models/interview.model").InterviewBooking;

    // Format candidates with interview details
    const submittedCandidates = [];

    for (const candidate of candidates) {
      const candidateName = `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || candidate.email.split("@")[0];

      // Filter applications by jobId if provided
      const applicationsToProcess = jobId 
        ? candidate.applications.filter(app => app.job._id.toString() === jobId)
        : candidate.applications;

      for (const application of applicationsToProcess) {
        // Check for interview bookings for this candidate and job
        const interviewBookings = await InterviewBooking.find({
          candidate: candidate._id,
          job: application.job._id,
        })
          .populate("slot", "date startTime endTime timezone")
          .populate("job", "title location")
          .sort({ createdAt: 1 });

        const candidateData = {
          _id: candidate._id,
          name: candidateName,
          email: candidate.email,
          phone: candidate.phoneNumber || "N/A",
          resume: candidate.resume || null,
          submittedAt: application.appliedAt,
          job: {
            _id: application.job._id,
            title: application.job.title,
            location: application.job.location,
            employer: {
              companyName: application.job.employer?.companyName || "Company Not Specified",
            },
          },
          applicationStatus: application.status,
          coverLetter: application.coverLetter || "",
          customFields: application.customFields || [],
          // Interview details
          interviews: interviewBookings.map(booking => ({
            _id: booking._id,
            status: booking.status,
            interviewType: booking.interviewType,
            meetingLink: booking.meetingLink,
            notes: booking.notes,
            scheduledAt: booking.scheduledAt,
            slot: booking.slot ? {
              date: booking.slot.date,
              startTime: booking.slot.startTime,
              endTime: booking.slot.endTime,
              timezone: booking.slot.timezone,
            } : null,
          })),
          hasScheduledInterview: interviewBookings.some(booking => booking.status === "scheduled"),
          latestInterviewStatus: interviewBookings.length > 0 ? interviewBookings[interviewBookings.length - 1].status : null,
        };

        submittedCandidates.push(candidateData);
      }
    }

    // Sort by submission date (most recent first)
    submittedCandidates.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Generate summary statistics
    const summary = {
      totalSubmitted: submittedCandidates.length,
      withScheduledInterviews: submittedCandidates.filter(c => c.hasScheduledInterview).length,
      applicationStatuses: {
        pending: submittedCandidates.filter(c => c.applicationStatus === "pending").length,
        shortlisted: submittedCandidates.filter(c => c.applicationStatus === "shortlist").length,
        interviewing: submittedCandidates.filter(c => 
          ["phone_interview", "in_person_interview"].includes(c.applicationStatus)
        ).length,
        hired: submittedCandidates.filter(c => c.applicationStatus === "hired").length,
        rejected: submittedCandidates.filter(c => c.applicationStatus === "rejected").length,
      },
      interviewStatuses: {
        scheduled: submittedCandidates.filter(c => c.latestInterviewStatus === "scheduled").length,
        completed: submittedCandidates.filter(c => c.latestInterviewStatus === "completed").length,
        cancelled: submittedCandidates.filter(c => c.latestInterviewStatus === "cancelled").length,
        no_show: submittedCandidates.filter(c => c.latestInterviewStatus === "no_show").length,
      },
    };

    res.json({
      success: true,
      candidates: submittedCandidates,
      total: submittedCandidates.length,
      summary,
    });

  } catch (error) {
    console.error("Get submitted candidates error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submitted candidates",
      error: error.message,
    });
  }
};
