const Employer = require("../models/employer.model");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Candidate = require("../models/candidate.model");

// Get employer profile
exports.getProfile = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    res.json({ employer });
  } catch (error) {
    console.error("Get employer profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update employer profile
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

    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Update fields
    if (ownerName) employer.ownerName = ownerName;
    if (companyName) employer.companyName = companyName;
    if (phoneNumber) employer.phoneNumber = phoneNumber;
    if (address) employer.address = address;
    if (city) employer.city = city;
    if (state) employer.state = state;
    if (country) employer.country = country;

    employer.updatedAt = Date.now();

    await employer.save();

    res.json({
      message: "Employer profile updated successfully",
      employer,
    });
  } catch (error) {
    console.error("Update employer profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all applications for employer's jobs
exports.getApplications = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Get all jobs for this employer
    const jobs = await Job.find({ employer: employer._id });
    const jobIds = jobs.map((job) => job._id);

    // Get all candidates that applied to these jobs
    const applications = await Candidate.find({ job: { $in: jobIds } })
      .populate({
        path: "job",
        select: "title location",
      })
      .populate({
        path: "recruitmentPartner",
        select: "companyName contactPersonName",
      })
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error("Get employer applications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update candidate status
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find employer to verify they own this candidate (through their jobs)
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Get all jobs for this employer
    const jobs = await Job.find({ employer: employer._id });
    const jobIds = jobs.map((job) => job._id);

    // Find the candidate and verify they applied to this employer's job
    const candidate = await Candidate.findOne({
      _id: id,
      job: { $in: jobIds },
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found or not associated with your jobs",
      });
    }

    // Update the candidate status
    candidate.status = status;
    candidate.updatedAt = new Date();
    await candidate.save();

    res.json({
      candidate,
      message: "Candidate status updated successfully",
    });
  } catch (error) {
    console.error("Update candidate status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
