const Candidate = require("../models/candidate.model");
const RecruitmentPartner = require("../models/recruitmentPartner.model");
const Job = require("../models/job.model");
const Employer = require("../models/employer.model");
const {
  getCoordinatesFromZipCode,
  isWithinUSBounds,
} = require("../utils/geoUtils");

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

    candidate.status = status;
    if (interviewDate) {
      candidate.interviewDate = interviewDate;
    }
    candidate.updatedAt = Date.now();

    await candidate.save();

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
