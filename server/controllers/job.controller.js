const Job = require("../models/job.model");
const Employer = require("../models/employer.model");
const RecruitmentPartner = require("../models/recruitmentPartner.model");
const Candidate = require("../models/candidate.model");
const {
  getCoordinatesFromZipCode,
  calculateDistance,
  isWithinUSBounds,
} = require("../utils/geoUtils");

// Create a new job post
exports.createJob = async (req, res) => {
  try {
    let poster = null;
    let posterId = null;
    let postedBy = null;

    // Check if user is an employer or recruitment partner
    if (req.user.role === "employer") {
      poster = await Employer.findOne({ user: req.user.id });
      if (!poster) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      posterId = poster._id;
      postedBy = "employer";
    } else if (req.user.role === "recruitment_partner") {
      poster = await RecruitmentPartner.findOne({ user: req.user.id });
      if (!poster) {
        return res
          .status(404)
          .json({ message: "Recruitment partner profile not found" });
      }
      posterId = poster._id;
      postedBy = "recruitment_partner";
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to create job posts" });
    }

    // Validate required US location fields
    const { zipCode, city, state, country = "United States" } = req.body;

    if (!zipCode) {
      return res.status(400).json({
        message: "Zip code is mandatory for job posting in the United States",
      });
    }

    if (!city || !state) {
      return res.status(400).json({
        message: "City and state are required for job posting",
      });
    }

    // Validate country is US
    if (country !== "United States" && country !== "USA" && country !== "US") {
      return res.status(400).json({
        message: "Only job postings in the United States are supported",
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

    const jobData = {
      ...req.body,
      postedBy,
      zipCode,
      city,
      state,
      country: "United States",
      geoLocation: {
        type: "Point",
        coordinates: coordinates,
      },
    };

    // Set the appropriate poster reference
    if (postedBy === "employer") {
      jobData.employer = posterId;
    } else {
      jobData.recruitmentPartner = posterId;
    }

    // Handle licensed candidate data if present
    if (req.body.licensedCandidateData) {
      const licensedData = req.body.licensedCandidateData;
      jobData.candidateType = licensedData.candidateTypes || [];
      jobData.workSchedule = licensedData.workSchedule;
      jobData.partTimeWorkDays = licensedData.partTimeWorkDays || [];
      jobData.officeRequirement = licensedData.officeRequirement;
      jobData.officeDetails = licensedData.officeDetails;
      jobData.remoteWorkDays = licensedData.remoteWorkDays;
      jobData.remoteWorkPreferredDays =
        licensedData.remoteWorkPreferredDays || [];
      jobData.payStructureType = licensedData.payStructureType;
      jobData.hourlyPay = licensedData.hourlyPay;
      jobData.payDays = licensedData.payDays;
      jobData.employeeBenefits = licensedData.employeeBenefits || [];
      jobData.freeParking = licensedData.freeParking;
      jobData.roleType = licensedData.roleType;
      jobData.qualifications = licensedData.qualifications || [];
      jobData.additionalRequirements =
        licensedData.additionalRequirements || [];
    }

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

    // Handle enum fields with empty string validation
    if (!jobData.officeRequirement || jobData.officeRequirement === "") {
      delete jobData.officeRequirement; // Let schema default handle it
    }
    if (!jobData.freeParking || jobData.freeParking === "") {
      delete jobData.freeParking; // Let schema default handle it
    }
    if (!jobData.payStructureType || jobData.payStructureType === "") {
      delete jobData.payStructureType; // Let schema default handle it
    }
    if (!jobData.roleType || jobData.roleType === "") {
      delete jobData.roleType; // Let schema default handle it
    }
    if (!jobData.workSchedule || jobData.workSchedule === "") {
      delete jobData.workSchedule; // Let schema default handle it
    }

    // Set approval status - Auto-approve all jobs by default
    jobData.isApproved = true;

    // TODO: Uncomment below code for future manual approval workflow
    // Set approval status based on employer's job posting setting
    // if (employer.jobPosting === "automatic") {
    //   jobData.isApproved = true;
    // } else {
    //   jobData.isApproved = false; // Require manual approval
    // }

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

// Get all active jobs for recruitment partners with location-based filtering
exports.getActiveJobs = async (req, res) => {
  try {
    const { location, search, zipCode, page = 1, limit = 10 } = req.query;
    const filter = {
      status: "active",
      isApproved: true,
      expires: { $gt: new Date() },
    };

    let jobs;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // If candidate provides zip code, find jobs within 5 miles
    if (zipCode) {
      try {
        // Get candidate's coordinates
        const candidateCoords = await getCoordinatesFromZipCode(zipCode);

        // Use MongoDB geospatial query to find jobs within 5 miles (8047 meters)
        const nearbyJobs = await Job.find({
          ...filter,
          geoLocation: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: candidateCoords,
              },
              $maxDistance: 8047, // 5 miles in meters
            },
          },
        })
          .populate("employer", "companyName")
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 });

        const totalNearbyJobs = await Job.countDocuments({
          ...filter,
          geoLocation: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: candidateCoords,
              },
              $maxDistance: 8047,
            },
          },
        });

        return res.json({
          jobs: nearbyJobs,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalNearbyJobs / limitNum),
            totalJobs: totalNearbyJobs,
            hasNext: pageNum * limitNum < totalNearbyJobs,
            hasPrev: pageNum > 1,
          },
          searchType: "location-based",
          searchRadius: "4 miles",
          candidateLocation: zipCode,
        });
      } catch (error) {
        console.error("Error finding jobs by location:", error);
        // Fall back to regular search if geolocation fails
      }
    }

    // Regular search without location filtering
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    jobs = await Job.find(filter)
      .populate("employer", "companyName")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalJobs = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalJobs / limitNum),
        totalJobs: totalJobs,
        hasNext: pageNum * limitNum < totalJobs,
        hasPrev: pageNum > 1,
      },
      searchType: "general",
    });
  } catch (error) {
    console.error("Get active jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get job details
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("employer", "companyName ownerName")
      .populate("recruitmentPartner", "companyName ownerName");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
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

// Get jobs for candidates based on their location (within 4 miles)
exports.getJobsForCandidates = async (req, res) => {
  try {
    const {
      zipCode,
      page = 1,
      limit = 20,
      search,
      jobType,
      experience,
    } = req.query;

    if (!zipCode) {
      return res.status(400).json({
        message: "Zip code is required to find jobs near your location",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Base filter for active, approved jobs
    const baseFilter = {
      status: "active",
      isApproved: true,
      expires: { $gt: new Date() },
    };

    // Add additional filters
    if (search) {
      baseFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (jobType) {
      baseFilter.jobType = jobType;
    }

    if (experience) {
      baseFilter.experience = experience;
    }

    try {
      // Get candidate's coordinates
      const candidateCoords = await getCoordinatesFromZipCode(zipCode);

      // Find jobs within 4 miles using geospatial query
      const nearbyJobs = await Job.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: candidateCoords,
            },
            distanceField: "distance",
            maxDistance: 6437, // 4 miles in meters (4 * 1609.34 = 6437.36)
            spherical: true,
            query: baseFilter,
          },
        },
        {
          $lookup: {
            from: "employers",
            localField: "employer",
            foreignField: "_id",
            as: "employer",
          },
        },
        {
          $unwind: "$employer",
        },
        {
          $project: {
            title: 1,
            description: 1,
            requirements: 1,
            skills: 1,
            experience: 1,
            location: 1,
            zipCode: 1,
            city: 1,
            state: 1,
            jobType: 1,
            workMode: 1,
            salaryMin: 1,
            salaryMax: 1,
            currency: 1,
            benefits: 1,
            department: 1,
            contactNumber: 1,
            urgency: 1,
            createdAt: 1,
            expires: 1,
            // Enhanced Licensed Candidate Search fields
            candidateType: 1,
            workSchedule: 1,
            partTimeWorkDays: 1,
            officeRequirement: 1,
            officeDetails: 1,
            remoteWorkDays: 1,
            remoteWorkPreferredDays: 1,
            payStructureType: 1,
            hourlyPay: 1,
            payDays: 1,
            employeeBenefits: 1,
            freeParking: 1,
            roleType: 1,
            qualifications: 1,
            additionalRequirements: 1,
            startDate: 1,
            distance: { $round: [{ $divide: ["$distance", 1609.34] }, 2] }, // Convert to miles
            "employer.companyName": 1,
            "employer.city": 1,
            "employer.state": 1,
          },
        },
        {
          $sort: { distance: 1, createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limitNum,
        },
      ]);

      // Get total count for pagination
      const totalCount = await Job.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: candidateCoords,
            },
            distanceField: "distance",
            maxDistance: 8047,
            spherical: true,
            query: baseFilter,
          },
        },
        {
          $count: "total",
        },
      ]);

      const totalJobs = totalCount.length > 0 ? totalCount[0].total : 0;

      res.json({
        jobs: nearbyJobs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalJobs / limitNum),
          totalJobs: totalJobs,
          hasNext: pageNum * limitNum < totalJobs,
          hasPrev: pageNum > 1,
          limit: limitNum,
        },
        searchCriteria: {
          zipCode,
          searchRadius: "4 miles",
          search: search || null,
          jobType: jobType || null,
          experience: experience || null,
        },
        message:
          totalJobs > 0
            ? `Found ${totalJobs} jobs within 5 miles of ${zipCode}`
            : `No jobs found within 4 miles of ${zipCode}`,
      });
    } catch (geoError) {
      console.error("Geolocation error:", geoError);
      return res.status(400).json({
        message: "Invalid zip code or unable to determine location coordinates",
      });
    }
  } catch (error) {
    console.error("Get jobs for candidates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all jobs posted by a recruitment partner
exports.getRecruitmentPartnerJobs = async (req, res) => {
  try {
    const recruitmentPartner = await RecruitmentPartner.findOne({
      user: req.user.id,
    });

    if (!recruitmentPartner) {
      return res
        .status(404)
        .json({ message: "Recruitment partner profile not found" });
    }

    const jobs = await Job.find({
      recruitmentPartner: recruitmentPartner._id,
      postedBy: "recruitment_partner",
    })
      .populate("recruitmentPartner", "ownerName companyName")
      .sort({ createdAt: -1 });

    res.json({
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("Get recruitment partner jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
