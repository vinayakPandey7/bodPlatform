const Job = require("../models/job.model");
const Employer = require("../models/employer.model");
const Candidate = require("../models/candidate.model");

// Create a new job post
exports.createJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const jobData = {
      ...req.body,
      employer: employer._id,
    };

    // Map frontend fields to legacy fields for backward compatibility
    if (jobData.jobType) {
      jobData.jobRole = jobData.jobType; // Map new jobType to legacy jobRole
    }

    if (jobData.workMode) {
      // Map workMode to legacy jobType field
      if (jobData.workMode === "office") {
        jobData.legacyJobType = "work_from_office";
      } else if (jobData.workMode === "remote") {
        jobData.legacyJobType = "work_from_home";
      } else if (jobData.workMode === "hybrid") {
        jobData.legacyJobType = "work_from_office"; // Default for hybrid
      }
    }

    // Set defaults for required legacy fields
    if (!jobData.payStructure) {
      jobData.payStructure = "monthly";
    }
    if (!jobData.serviceSalesFocus) {
      jobData.serviceSalesFocus = "both";
    }
    if (!jobData.licenseRequirement) {
      jobData.licenseRequirement = "Unlicensed Accepted";
    }
    if (!jobData.recruitmentDuration) {
      jobData.recruitmentDuration = "30 Days NE";
    }
    if (!jobData.startDate) {
      jobData.startDate = new Date();
    }

    // Set approval status based on employer's job posting setting
    if (employer.jobPosting === "automatic") {
      jobData.isApproved = true;
    }

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all jobs for employer
exports.getEmployerJobs = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const { status } = req.query;
    const filter = { employer: employer._id };

    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .populate("employer", "companyName")
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error("Get employer jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all active jobs for recruitment partners
exports.getActiveJobs = async (req, res) => {
  try {
    const { location, search } = req.query;
    const filter = {
      status: "active",
      isApproved: true,
      expires: { $gt: new Date() },
    };

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const jobs = await Job.find(filter)
      .populate("employer", "companyName")
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error("Get active jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get job details
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "companyName ownerName"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ job });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      employer: employer._id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    Object.assign(job, req.body);
    job.updatedAt = Date.now();

    await job.save();

    res.json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      employer: employer._id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggle job status (active/inactive)
exports.toggleJobStatus = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      employer: employer._id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isActive = !job.isActive;
    job.updatedAt = Date.now();

    await job.save();

    res.json({
      message: `Job ${job.isActive ? "activated" : "deactivated"} successfully`,
      job,
    });
  } catch (error) {
    console.error("Toggle job status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get job applications for employer
exports.getJobApplications = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      employer: employer._id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const candidates = await Candidate.find({ job: job._id })
      .populate("recruitmentPartner", "companyName")
      .sort({ createdAt: -1 });

    res.json({ candidates });
  } catch (error) {
    console.error("Get job applications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
