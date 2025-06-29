const RecruitmentPartner = require("../models/recruitmentPartner.model");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Candidate = require("../models/candidate.model");

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
