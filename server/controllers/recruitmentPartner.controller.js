const RecruitmentPartner = require("../models/recruitmentPartner.model");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Candidate = require("../models/candidate.model");

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

    // Get statistics
    const totalActiveJobs = await Job.countDocuments({
      status: "active",
      isApproved: true,
      expires: { $gt: new Date() },
    });

    const totalPublishedJobs = await Job.countDocuments({
      isApproved: true,
    });

    const totalCandidates = await Candidate.countDocuments({
      recruitmentPartner: recruitmentPartner._id,
    });

    const selectedCandidates = await Candidate.countDocuments({
      recruitmentPartner: recruitmentPartner._id,
      status: "selected",
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
      stats: {
        totalActiveJobs,
        totalPublishedJobs,
        totalCandidates,
        selectedCandidates,
      },
      expiringJobs,
      recentJobs,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
