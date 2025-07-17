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

    // Get all candidates that applied to this specific job
    const applications = await Candidate.find({ job: jobId })
      .populate({
        path: "job",
        select: "title location description status",
      })
      .populate({
        path: "recruitmentPartner",
        select: "companyName contactPersonName",
      })
      .sort({ createdAt: -1 });

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
