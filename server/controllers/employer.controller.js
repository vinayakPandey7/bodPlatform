const Employer = require("../models/employer.model");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Candidate = require("../models/candidate.model");
const {
  getCoordinatesFromZipCode,
  isWithinUSBounds,
} = require("../utils/geoUtils");

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

// Update employer profile with location validation
exports.updateProfile = async (req, res) => {
  try {
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
      locationDetected = false,
    } = req.body;

    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Validate US-only registration
    if (
      country &&
      country !== "United States" &&
      country !== "USA" &&
      country !== "US"
    ) {
      return res.status(400).json({
        message:
          "Only employers from the United States can register on this platform",
      });
    }

    // If location is not detected, zip code becomes mandatory
    if (!locationDetected && (!zipCode || zipCode.trim() === "")) {
      return res.status(400).json({
        message:
          "Zip code is mandatory for employer registration when location detection is not available",
      });
    }

    // Validate and get coordinates for zip code if provided
    let coordinates;
    if (zipCode) {
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
    }

    // Update fields
    if (ownerName) employer.ownerName = ownerName;
    if (companyName) employer.companyName = companyName;
    if (email) employer.email = email;
    if (phoneNumber) employer.phoneNumber = phoneNumber;
    if (address) employer.address = address;
    if (city) employer.city = city;
    if (state) employer.state = state;
    if (zipCode) employer.zipCode = zipCode;
    if (country) employer.country = country;

    // Update location data
    employer.locationDetected = locationDetected;
    if (coordinates) {
      employer.location = {
        type: "Point",
        coordinates: coordinates,
      };
    }

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
    const jobIds = jobs.map((job) => job._id.toString());

    // Get all users with applications to these jobs
    const User = require("../models/user.model");
    const users = await User.find({
      role: "candidate",
      "applications.job": { $in: jobIds },
    }).populate({
      path: "applications.job",
      select: "title location",
    });

    // Extract applications for employer's jobs
    const applications = [];
    users.forEach((user) => {
      user.applications.forEach((app) => {
        if (jobIds.includes(app.job._id.toString())) {
          applications.push({
            _id: app._id,
            job: app.job,
            candidate: {
              _id: user._id,
              firstName: user.firstName || "Not Provided",
              lastName: user.lastName || "Not Provided",
              email: user.email,
              phone: user.phoneNumber,
            },
            status: app.status,
            appliedAt: app.appliedAt
              ? new Date(app.appliedAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Not Available",
            appliedAtRaw: app.appliedAt,
            coverLetter: app.coverLetter,
          });
        }
      });
    });

    // Sort by application date (newest first)
    applications.sort(
      (a, b) => new Date(b.appliedAtRaw) - new Date(a.appliedAtRaw)
    );

    res.json({ applications });
  } catch (error) {
    console.error("Get employer applications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get applications for a specific job
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const employer = await Employer.findOne({ user: req.user.id });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Verify the job belongs to this employer
    const job = await Job.findOne({ _id: jobId, employer: employer._id });
    if (!job) {
      return res.status(404).json({
        message:
          "Job not found or you don't have permission to view its applications",
      });
    }

    // Get all users with applications to this specific job
    const User = require("../models/user.model");
    const users = await User.find({
      role: "candidate",
      "applications.job": jobId,
    }).populate({
      path: "applications.job",
      select: "title location description status",
    });

    // Extract applications for this job
    const applications = [];
    users.forEach((user) => {
      user.applications.forEach((app) => {
        if (app.job._id.toString() === jobId) {
          applications.push({
            _id: app._id,
            job: app.job,
            candidate: {
              _id: user._id,
              firstName: user.firstName || "Not Provided",
              lastName: user.lastName || "Not Provided",
              email: user.email,
              phone: user.phoneNumber,
            },
            status: app.status,
            appliedAt: app.appliedAt
              ? new Date(app.appliedAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Not Available",
            appliedAtRaw: app.appliedAt,
            coverLetter: app.coverLetter,
          });
        }
      });
    });

    // Sort by application date (newest first)
    applications.sort(
      (a, b) => new Date(b.appliedAtRaw) - new Date(a.appliedAtRaw)
    );

    res.json({
      applications,
      job: {
        _id: job._id,
        title: job.title,
        location: job.location,
        description: job.description,
        status: job.status,
      },
    });
  } catch (error) {
    console.error("Get job applications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update application status
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { candidateId, applicationId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "reviewing", 
      "shortlisted",
      "assessment",
      "phone_interview",
      "in_person_interview", 
      "background_check",
      "hired",
      "rejected",
      "withdrawn"
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Valid statuses are: " + validStatuses.join(", "),
      });
    }

    // Find employer to verify permissions
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Get all jobs for this employer
    const jobs = await Job.find({ employer: employer._id });
    const jobIds = jobs.map((job) => job._id.toString());

    // Find the user and update their application status
    const User = require("../models/user.model");
    const user = await User.findById(candidateId);
    if (!user || user.role !== "candidate") {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Find the specific application
    const application = user.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify the application is for this employer's job
    if (!jobIds.includes(application.job.toString())) {
      return res.status(403).json({
        message: "Unauthorized: Application is not for your job",
      });
    }

    // Update the application status
    application.status = status;
    application.statusUpdatedAt = new Date();
    await user.save();

    res.json({
      message: "Application status updated successfully",
      application: {
        _id: application._id,
        status: application.status,
        statusUpdatedAt: application.statusUpdatedAt,
      },
    });
  } catch (error) {
    console.error("Update candidate status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get candidate profile for employer
exports.getCandidateProfile = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Find employer to verify permissions
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Get all jobs for this employer to verify they have permission to view this candidate
    const jobs = await Job.find({ employer: employer._id });
    const jobIds = jobs.map((job) => job._id.toString());

    // Find candidate to check if they have applied to any of the employer's jobs
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if the candidate has applied to any of this employer's jobs
    const hasAppliedToEmployerJobs = candidate.applications.some((app) =>
      jobIds.includes(app.job.toString())
    );

    if (!hasAppliedToEmployerJobs) {
      return res.status(403).json({
        message: "Unauthorized: Candidate has not applied to your jobs",
      });
    }

    // Check if this candidate is saved by the employer
    const isSaved = employer.savedCandidates.some(
      (saved) => saved.candidate.toString() === candidateId
    );

    // Return candidate profile data (excluding sensitive information)
    const candidateProfile = {
      _id: candidate._id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phoneNumber: candidate.phoneNumber,
      isSaved: isSaved,
      personalInfo: candidate.personalInfo,
      experience: candidate.experience,
      education: candidate.education,
      skills: candidate.skills,
      socialLinks: candidate.socialLinks,
      preferences: candidate.preferences,
      resume: candidate.resume,
      createdAt: candidate.createdAt,
    };

    res.json({
      candidate: candidateProfile,
    });
  } catch (error) {
    console.error("Get candidate profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save/Unsave candidate for employer
exports.saveCandidateForEmployer = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Find employer
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Verify the candidate exists and has applied to employer's jobs
    const jobs = await Job.find({ employer: employer._id });
    const jobIds = jobs.map((job) => job._id.toString());

    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const hasAppliedToEmployerJobs = candidate.applications.some((app) =>
      jobIds.includes(app.job.toString())
    );

    if (!hasAppliedToEmployerJobs) {
      return res.status(403).json({
        message: "Unauthorized: Candidate has not applied to your jobs",
      });
    }

    // Check if already saved
    const savedIndex = employer.savedCandidates.findIndex(
      (saved) => saved.candidate.toString() === candidateId
    );

    let action;
    if (savedIndex > -1) {
      // Remove from saved
      employer.savedCandidates.splice(savedIndex, 1);
      action = "unsaved";
    } else {
      // Add to saved
      employer.savedCandidates.push({
        candidate: candidateId,
        savedAt: new Date(),
      });
      action = "saved";
    }

    await employer.save();

    res.json({
      message: `Candidate ${action} successfully`,
      isSaved: action === "saved",
    });
  } catch (error) {
    console.error("Save candidate error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get saved candidates for employer
exports.getSavedCandidatesForEmployer = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.user.id }).populate({
      path: "savedCandidates.candidate",
      select: "firstName lastName email phoneNumber personalInfo createdAt",
    });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Format the response
    const savedCandidates = employer.savedCandidates.map((saved) => ({
      candidate: saved.candidate,
      savedAt: saved.savedAt,
    }));

    res.json({
      savedCandidates: savedCandidates,
      total: savedCandidates.length,
    });
  } catch (error) {
    console.error("Get saved candidates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
