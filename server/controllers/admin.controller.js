const User = require("../models/user.model");
const Employer = require("../models/employer.model");
const RecruitmentPartner = require("../models/recruitmentPartner.model");
const Job = require("../models/job.model");
const Candidate = require("../models/candidate.model");
const Notification = require("../models/notification.model");
const crypto = require("crypto");

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployers = await Employer.countDocuments();
    const totalRecruiters = await RecruitmentPartner.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalCandidates = await Candidate.countDocuments();

    res.json({
      stats: {
        totalEmployers,
        totalRecruiters,
        totalJobs,
        totalCandidates,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Employer Management
exports.getEmployers = async (req, res) => {
  try {
    const employers = await Employer.find()
      .populate("user", "email isActive createdAt")
      .sort({ createdAt: -1 });

    res.json({ employers });
  } catch (error) {
    console.error("Get employers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createEmployer = async (req, res) => {
  try {
    console.log("Create employer request body:", req.body);
    
    const {
      ownerName,
      companyName,
      email,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country,
      jobPosting = "manual",
      isApproved = true, // Default to true for admin-created employers
      website,
      description,
    } = req.body;

    console.log("Extracted isApproved value:", isApproved, typeof isApproved);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Generate password
    const password = generatePassword();

    // Create user
    const user = new User({
      email,
      password,
      role: "employer",
    });

    await user.save();

    console.log("Employer data to save:", {
      user: user._id,
      ownerName,
      companyName,
      email,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country,
      jobPosting,
      isApproved,
      website,
      description,
    });

    // Create employer profile
    const employer = new Employer({
      user: user._id,
      ownerName,
      companyName,
      email, // Add email field
      phoneNumber,
      address,
      city,
      state,
      zipCode, // Add zipCode field
      country,
      jobPosting,
      isApproved, // Add isApproved field
      website,
      description,
    });

    await employer.save();

    // Populate the user data for the response
    await employer.populate("user", "email isActive createdAt");

    // TODO: Send email with credentials

    res.status(201).json({
      message: "Employer created successfully",
      employer,
      credentials: { email, password }, // Remove this in production
    });
  } catch (error) {
    console.error("Create employer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    Object.assign(employer, req.body);
    employer.updatedAt = Date.now();

    await employer.save();

    res.json({
      message: "Employer updated successfully",
      employer,
    });
  } catch (error) {
    console.error("Update employer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    // Delete user account
    await User.findByIdAndDelete(employer.user);

    // Delete employer profile
    await Employer.findByIdAndDelete(req.params.id);

    res.json({ message: "Employer deleted successfully" });
  } catch (error) {
    console.error("Delete employer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve employer
exports.approveEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    employer.isApproved = true;
    await employer.save();

    // Also activate the user account
    await User.findByIdAndUpdate(employer.user, { isActive: true });

    res.json({
      message: "Employer approved successfully",
      employer,
    });
  } catch (error) {
    console.error("Approve employer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve recruitment partner
exports.approveRecruitmentPartner = async (req, res) => {
 
  try {
    const recruitmentPartner = await RecruitmentPartner.findById(req.params.id);

    if (!recruitmentPartner) {
      return res.status(404).json({ message: "Recruitment partner not found" });
    }

    recruitmentPartner.isApproved = true;
    await recruitmentPartner.save();

     
    // Also activate the user account
    await User.findByIdAndUpdate(recruitmentPartner.user, { isActive: true });

    res.json({
      message: "Recruitment partner approved successfully",
      recruitmentPartner,
    });
  } catch (error) {
    console.error("Approve recruitment partner error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
    

  



// Reject employer (same as delete for now)
exports.rejectEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    // Delete user account
    await User.findByIdAndDelete(employer.user);

    // Delete employer profile
    await Employer.findByIdAndDelete(req.params.id);

    res.json({ message: "Employer rejected and deleted successfully" });
  } catch (error) {
    console.error("Reject employer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Recruitment Partner Management
exports.getRecruitmentPartners = async (req, res) => {
  try {
    const recruitmentPartners = await RecruitmentPartner.find()
      .populate("user", "email isActive")
      .sort({ createdAt: -1 });

    res.json({ recruitmentPartners });
  } catch (error) {
    console.error("Get recruitment partners error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createRecruitmentPartner = async (req, res) => {
  try {
    const {
      ownerName,
      companyName,
      email,
      phoneNumber,
      address,
      city,
      state,
      country,
      zipCode,
      website,
      description,
      specializations,
      isApproved = true, // Default to approved for admin-created partners
    } = req.body;

    console.log("Creating recruitment partner with data:", req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Generate password
    const password = generatePassword();

    // Create user
    const user = new User({
      email,
      password,
      role: "recruitment_partner",
    });

    await user.save();

    // Create recruitment partner profile
    const recruitmentPartner = new RecruitmentPartner({
      user: user._id,
      ownerName,
      companyName,
      email,
      phoneNumber,
      address,
      city,
      state,
      country,
      zipCode,
      website,
      description,
      specializations: specializations ? specializations?.join(',').split(',').map(s => s.trim()) : [],
      isApproved,
    });

    await recruitmentPartner.save();

    // TODO: Send email with credentials

    res.status(201).json({
      message: "Recruitment partner created successfully",
      recruitmentPartner,
      credentials: { email, password }, // Remove this in production
    });
  } catch (error) {
    console.error("Create recruitment partner error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateRecruitmentPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerName, companyName, phoneNumber, address, city, state, country, zipCode, website, description, specializations, isApproved } = req.body;

    const recruitmentPartner = await RecruitmentPartner.findById(id);
    if (!recruitmentPartner) {
      return res.status(404).json({ message: "Recruitment partner not found" });
    }

    // Update recruitment partner fields
    recruitmentPartner.ownerName = ownerName || recruitmentPartner.ownerName;
    recruitmentPartner.companyName = companyName || recruitmentPartner.companyName;
    recruitmentPartner.phoneNumber = phoneNumber || recruitmentPartner.phoneNumber;
    recruitmentPartner.address = address || recruitmentPartner.address;
    recruitmentPartner.city = city || recruitmentPartner.city;
    recruitmentPartner.state = state || recruitmentPartner.state;
    recruitmentPartner.country = country || recruitmentPartner.country;
    recruitmentPartner.zipCode = zipCode || recruitmentPartner.zipCode;
    recruitmentPartner.website = website || recruitmentPartner.website;
    recruitmentPartner.description = description || recruitmentPartner.description;
    recruitmentPartner.specializations = specializations || recruitmentPartner.specializations;
    recruitmentPartner.isApproved = isApproved !== undefined ? isApproved : recruitmentPartner.isApproved;

    await recruitmentPartner.save();

    res.json({
      message: "Recruitment partner updated successfully",
      recruitmentPartner,
    });
  } catch (error) {
    console.error("Update recruitment partner error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteRecruitmentPartner = async (req, res) => {
  try {
    const { id } = req.params;

    const recruitmentPartner = await RecruitmentPartner.findById(id);
    if (!recruitmentPartner) {
      return res.status(404).json({ message: "Recruitment partner not found" });
    }

    // Delete the associated user account
    await User.findByIdAndDelete(recruitmentPartner.user);
    
    // Delete the recruitment partner
    await RecruitmentPartner.findByIdAndDelete(id);

    res.json({ message: "Recruitment partner deleted successfully" });
  } catch (error) {
    console.error("Delete recruitment partner error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Job Management
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate({
        path: "employer",
        select: "companyName ownerName",
        populate: {
          path: "user",
          select: "email",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getJobRequests = async (req, res) => {
  try {
    const jobRequests = await Job.find({ isApproved: false })
      .populate({
        path: "employer",
        populate: {
          path: "user",
          select: "email",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ jobRequests });
  } catch (error) {
    console.error("Get job requests error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isApproved = true;
    await job.save();

    res.json({
      message: "Job approved successfully",
      job,
    });
  } catch (error) {
    console.error("Approve job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job rejected and deleted successfully" });
  } catch (error) {
    console.error("Reject job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.toggleJobActive = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.json({
      message: `Job ${job.isActive ? "activated" : "deactivated"} successfully`,
      job,
    });
  } catch (error) {
    console.error("Toggle job active error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Notification Management
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("recipient", "email role")
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    console.error("Get all notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    notification.updatedAt = new Date();
    await notification.save();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true, updatedAt: new Date() }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin Profile Management
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Admin profile not found" });
    }

    // Add mock admin-specific fields if needed
    const profile = {
      ...user.toObject(),
      firstName: user.firstName || "John",
      lastName: user.lastName || "Admin",
      phoneNumber: user.phoneNumber || "+1-555-0123",
      department: user.department || "System Administration",
      permissions: user.permissions || [
        "manage_users",
        "manage_jobs",
        "manage_system",
        "view_analytics",
      ],
      lastLogin:
        user.lastLogin ||
        new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };

    res.json({ profile });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, department } = req.body;

    // Don't allow email changes for admin users to prevent login issues
    const updateData = {
      firstName,
      lastName,
      phoneNumber,
      department,
      updatedAt: new Date(),
    };

    // Only allow email change if it's different and not empty
    if (email && email !== req.user.email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email is already taken by another user" });
      }

      updateData.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Admin profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      profile: user,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already taken" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Candidate Management
exports.getCandidates = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const candidates = await Candidate.find(query)
      .populate("job", "title location")
      .populate("recruitmentPartner", "companyName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Candidate.countDocuments(query);

    res.json({
      candidates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get candidates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({ candidate, message: "Candidate status updated successfully" });
  } catch (error) {
    console.error("Update candidate status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findByIdAndDelete(id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Delete candidate error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id)
      .populate("job", "title location description requirements")
      .populate("recruitmentPartner", "companyName ownerName");

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({ candidate });
  } catch (error) {
    console.error("Get candidate by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
