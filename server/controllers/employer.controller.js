const Employer = require("../models/employer.model");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Candidate = require("../models/candidate.model");
const { sendEmail } = require("../utils/email");
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
    }).populate([
      {
        path: "applications.job",
        select: "title location description status",
      },
      {
        path: "applications.employerNotes.addedBy",
        select: "firstName lastName email",
      },
    ]);

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
            employerNotes: app.employerNotes,
            notesCount: app.employerNotes.length,
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
  console.log("🎯 DEBUG: updateCandidateStatus called with:", {
    candidateId: req.params.candidateId,
    applicationId: req.params.applicationId,
    status: req.body.status,
    userId: req.user?.id
  });

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
      "withdrawn",
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

    // Store previous status for comparison
    const previousStatus = application.status;
    console.log("🔄 DEBUG: Status change detected:", { 
      previousStatus, 
      newStatus: status, 
      candidateEmail: user.email,
      applicationId: application._id 
    });

    // Update the application status
    application.status = status;
    application.statusUpdatedAt = new Date();
    await user.save();
    console.log("✅ DEBUG: Application status updated in database");

    // Send interview invitation for interview-related status changes
    const interviewStatuses = ['assessment', 'phone_interview', 'in_person_interview'];
    console.log("🔍 DEBUG: Checking if email should be sent:", {
      currentStatus: status,
      previousStatus,
      isInterviewStatus: interviewStatuses.includes(status),
      isStatusChanged: status !== previousStatus,
      shouldSendEmail: interviewStatuses.includes(status)
    });

    // Send email for any interview status (even if status hasn't changed, to allow re-sending invitations)
    if (interviewStatuses.includes(status)) {
      console.log("📧 DEBUG: Triggering interview invitation email...");
      try {
        const result = await sendInterviewInvitationForApplication(user, employer, application, status, candidateId);
        console.log("✅ DEBUG: Interview invitation completed successfully:", result);
      } catch (emailError) {
        console.error("❌ DEBUG: Error sending interview invitation:", {
          error: emailError.message,
          stack: emailError.stack,
          candidateEmail: user.email,
          status: status
        });
        // Don't fail the status update if email fails
      }
    } else {
      console.log("⏭️ DEBUG: Skipping email - not an interview status change");
    }

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

// Add note to application
exports.addNoteToApplication = async (req, res) => {
  try {
    const { candidateId, applicationId } = req.params;
    const { noteText, interviewRound, rating } = req.body;

    // Validate input
    if (!noteText || noteText.trim().length === 0) {
      return res.status(400).json({ message: "Note text is required" });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Validate interview round if provided
    const validRounds = [
      "initial_review",
      "phone_screening",
      "phone_interview",
      "technical_assessment",
      "in_person_interview",
      "final_interview",
      "background_check",
      "reference_check",
      "general",
      "other",
    ];
    if (interviewRound && !validRounds.includes(interviewRound)) {
      return res.status(400).json({
        message:
          "Invalid interview round. Valid rounds are: " +
          validRounds.join(", "),
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

    // Find the user and application
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

    // Get the current user's name for the note
    const currentUser = await User.findById(req.user.id);
    const addedByName =
      `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
      currentUser.email;

    // Add the note
    const newNote = {
      note: noteText.trim(),
      addedBy: req.user.id,
      addedByName: addedByName,
      interviewRound: interviewRound || "general",
      rating: rating || null,
    };

    application.employerNotes.push(newNote);
    await user.save();

    // Populate the addedBy field for response
    await user.populate({
      path: "applications.employerNotes.addedBy",
      select: "firstName lastName email",
    });

    const addedNote =
      application.employerNotes[application.employerNotes.length - 1];

    res.status(201).json({
      message: "Note added successfully",
      note: addedNote,
    });
  } catch (error) {
    console.error("Add note to application error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get notes for application
exports.getApplicationNotes = async (req, res) => {
  try {
    const { candidateId, applicationId } = req.params;

    // Find employer to verify permissions
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Get all jobs for this employer
    const jobs = await Job.find({ employer: employer._id });
    const jobIds = jobs.map((job) => job._id.toString());

    // Find the user and application
    const User = require("../models/user.model");
    const user = await User.findById(candidateId).populate({
      path: "applications.employerNotes.addedBy",
      select: "firstName lastName email",
    });

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

    res.json({
      notes: application.employerNotes,
      totalNotes: application.employerNotes.length,
    });
  } catch (error) {
    console.error("Get application notes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update note in application
exports.updateApplicationNote = async (req, res) => {
  try {
    const { candidateId, applicationId, noteId } = req.params;
    const { noteText, interviewRound, rating } = req.body;

    // Validate input
    if (!noteText || noteText.trim().length === 0) {
      return res.status(400).json({ message: "Note text is required" });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Validate interview round if provided
    const validRounds = [
      "initial_review",
      "phone_screening",
      "phone_interview",
      "technical_assessment",
      "in_person_interview",
      "final_interview",
      "background_check",
      "reference_check",
      "general",
      "other",
    ];
    if (interviewRound && !validRounds.includes(interviewRound)) {
      return res.status(400).json({
        message:
          "Invalid interview round. Valid rounds are: " +
          validRounds.join(", "),
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

    // Find the user and application
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

    // Find the specific note
    const note = application.employerNotes.id(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Verify the note was added by the current user
    if (note.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized: You can only edit your own notes",
      });
    }

    // Update the note
    note.note = noteText.trim();
    if (interviewRound !== undefined) note.interviewRound = interviewRound;
    if (rating !== undefined) note.rating = rating;
    note.updatedAt = new Date();

    await user.save();

    // Populate the addedBy field for response
    await user.populate({
      path: "applications.employerNotes.addedBy",
      select: "firstName lastName email",
    });

    res.json({
      message: "Note updated successfully",
      note: note,
    });
  } catch (error) {
    console.error("Update application note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete note from application
exports.deleteApplicationNote = async (req, res) => {
  try {
    const { candidateId, applicationId, noteId } = req.params;

    // Find employer to verify permissions
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Get all jobs for this employer
    const jobs = await Job.find({ employer: employer._id });
    const jobIds = jobs.map((job) => job._id.toString());

    // Find the user and application
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

    // Find the specific note
    const note = application.employerNotes.id(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Verify the note was added by the current user
    if (note.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized: You can only delete your own notes",
      });
    }

    // Remove the note
    application.employerNotes.pull(noteId);
    await user.save();

    res.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete application note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to send interview invitation for application
const sendInterviewInvitationForApplication = async (user, employer, application, status, candidateId) => {
  console.log("🚀 DEBUG: sendInterviewInvitationForApplication called with:", {
    userEmail: user?.email,
    employerCompany: employer?.companyName,
    applicationId: application?._id,
    status: status
  });

  try {
    console.log("📧 DEBUG: Starting interview invitation process...");
    
    const { InterviewBooking, InterviewInvitation } = require("../models/interview.model");
    const { v4: uuidv4 } = require("uuid");
    console.log("✅ DEBUG: Required modules loaded successfully");

    // Get job details
    console.log("🔍 DEBUG: Fetching job details for application.job:", application.job);
    const job = await Job.findById(application.job);
    if (!job) {
      console.error("❌ DEBUG: Job not found for application.job:", application.job);
      throw new Error("Job not found for application");
    }
    console.log("✅ DEBUG: Job found:", { jobId: job._id, title: job.title });

    // Create a placeholder slot for invitation (since slot is required)
    console.log("📝 DEBUG: Creating placeholder interview slot...");
    const { InterviewSlot } = require("../models/interview.model");
    
    const placeholderSlot = await InterviewSlot.create({
      employer: employer._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      startTime: "09:00",
      endTime: "10:00",
      timezone: "America/New_York",
      isAvailable: true,
      maxCandidates: 1,
      currentBookings: 0
    });
    console.log("✅ DEBUG: Placeholder slot created:", placeholderSlot._id);

    // Generate tokens
    console.log("🔑 DEBUG: Generating tokens...");
    const invitationToken = uuidv4();
    const bookingToken = uuidv4(); // Generate unique booking token

    // Create a placeholder booking for invitation
    console.log("📝 DEBUG: Creating interview booking...");
    const bookingData = {
      slot: placeholderSlot._id,
      employer: employer._id,
      candidate: candidateId, // Use the candidateId from params
      job: application.job,
      candidateName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      candidateEmail: user.email,
      candidatePhone: user.phone || '',
      bookingToken: bookingToken, // Add unique booking token
      status: "scheduled",
    };
    console.log("📝 DEBUG: Booking data:", bookingData);
    
    const booking = await InterviewBooking.create(bookingData);
    console.log("✅ DEBUG: Interview booking created:", booking._id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    console.log("✅ DEBUG: Token generated:", invitationToken);

    console.log("📝 DEBUG: Creating interview invitation...");
    const invitationData = {
      booking: booking._id,
      invitationToken,
      candidateEmail: user.email,
      expiresAt,
    };
    console.log("📝 DEBUG: Invitation data:", invitationData);

    await InterviewInvitation.create(invitationData);
    console.log("✅ DEBUG: Interview invitation created successfully");

    // Send invitation email
    console.log("📧 DEBUG: Preparing to send email...");
    const statusMessages = {
      assessment: "Assessment",
      phone_interview: "Phone Interview",
      in_person_interview: "In-Person Interview"
    };

    const statusTitle = statusMessages[status] || status;
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/interview/schedule/${invitationToken}`;
    const candidateName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    console.log("📧 DEBUG: Email details:", {
      to: user.email,
      statusTitle,
      invitationLink,
      candidateName,
      companyName: employer.companyName,
      jobTitle: job.title
    });

    console.log("📧 DEBUG: Calling sendEmail function...");
    const emailResult = await sendEmail({
      to: user.email,
      subject: `Interview Invitation - ${statusTitle} | ${employer.companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .info-box { background-color: #e0f2fe; border-left: 4px solid #0288d1; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Interview Invitation</h1>
            </div>
            <div class="content">
              <p>Dear ${candidateName},</p>
              
              <p>Congratulations! Your application has been reviewed and we would like to invite you for an interview.</p>
              
              <div class="info-box">
                <p><strong>Company:</strong> ${employer.companyName}</p>
                <p><strong>Position:</strong> ${job.title}</p>
                <p><strong>Interview Type:</strong> ${statusTitle}</p>
                <p><strong>Location:</strong> ${job.city && job.state ? `${job.city}, ${job.state}` : 'TBD'}</p>
              </div>
              
              <p>Please click the button below to access your interview scheduling portal where you can select your preferred time slot:</p>
              
              <div style="text-align: center;">
                <a href="${invitationLink}" class="button" style="color: white !important;">Schedule Your Interview</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${invitationLink}</p>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Click the link above to access the scheduling portal</li>
                <li>Select your preferred interview time from available slots</li>
                <li>You will receive a calendar invitation once confirmed</li>
                <li>Prepare any required documents or portfolio items</li>
              </ul>
              
              <p>We look forward to speaking with you soon!</p>
              
              <p>Best regards,<br>
              ${employer.companyName} Hiring Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the BOD Platform.</p>
              <p>&copy; 2025 BOD Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Interview Invitation - ${statusTitle}
        
        Dear ${candidateName},
        
        Congratulations! Your application has been reviewed and we would like to invite you for an interview.
        
        Company: ${employer.companyName}
        Position: ${job.title}
        Interview Type: ${statusTitle}
        Location: ${job.city && job.state ? `${job.city}, ${job.state}` : 'TBD'}
        
        Please visit the following link to schedule your interview:
        ${invitationLink}
        
        We look forward to speaking with you soon!
        
        Best regards,
        ${employer.companyName} Hiring Team
        
        ---
        This is an automated message from the BOD Platform.
      `
    });

    console.log("✅ DEBUG: sendEmail function completed, result:", emailResult);
    console.log(`🎉 DEBUG: Interview invitation sent to ${user.email} for ${statusTitle} with token: ${invitationToken}`);
    return { success: true, invitationToken, bookingId: booking._id };
  } catch (error) {
    // vinayak 2
    console.error("❌ DEBUG: Error in sendInterviewInvitationForApplication:", {
      message: error.message,
      stack: error.stack,
      userEmail: user?.email,
      status: status
    });
    throw error;
  }
};

// Set employer availability slots
exports.setAvailability = async (req, res) => {
  try {
    const { slots } = req.body;
    
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "Slots array is required" });
    }

    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const { InterviewSlot } = require("../models/interview.model");
    
    // Create availability slots
    const createdSlots = [];
    for (const slot of slots) {
      const { date, startTime, endTime, timezone, maxCandidates } = slot;
      
      // Validate required fields
      if (!date || !startTime || !endTime) {
        return res.status(400).json({ 
          message: "Date, startTime, and endTime are required for each slot" 
        });
      }

      const newSlot = await InterviewSlot.create({
        employer: employer._id,
        date: new Date(date),
        startTime,
        endTime,
        timezone: timezone || "America/New_York",
        maxCandidates: maxCandidates || 1,
        isAvailable: true,
        currentBookings: 0
      });
      
      createdSlots.push(newSlot);
    }

    res.status(201).json({
      message: "Availability slots created successfully",
      slots: createdSlots
    });
  } catch (error) {
    console.error("Set availability error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get employer availability slots
exports.getAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const { InterviewSlot } = require("../models/interview.model");
    
    let query = { employer: employer._id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const slots = await InterviewSlot.find(query).sort({ date: 1, startTime: 1 });

    res.json({
      slots,
      total: slots.length
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get employer interview calendar
exports.getInterviewCalendar = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const { InterviewBooking } = require("../models/interview.model");
    
    let query = { employer: employer._id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      const { InterviewSlot } = require("../models/interview.model");
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      
      const slots = await InterviewSlot.find({ 
        employer: employer._id, 
        date: dateFilter 
      }).select('_id');
      
      query.slot = { $in: slots.map(s => s._id) };
    }

    const bookings = await InterviewBooking.find(query)
      .populate('slot', 'date startTime endTime timezone')
      .populate('job', 'title location')
      .populate('candidate', 'firstName lastName email phoneNumber')
      .sort({ 'slot.date': 1, 'slot.startTime': 1 });

    // Format the response to include all necessary booking details
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      candidateName: booking.candidateName,
      candidateEmail: booking.candidateEmail,
      candidatePhone: booking.candidatePhone,
      status: booking.status,
      interviewType: booking.interviewType,
      meetingLink: booking.meetingLink,
      notes: booking.notes,
      scheduledAt: booking.scheduledAt,
      completedAt: booking.completedAt,
      slot: booking.slot ? {
        _id: booking.slot._id,
        date: booking.slot.date,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        timezone: booking.slot.timezone
      } : null,
      job: booking.job ? {
        _id: booking.job._id,
        title: booking.job.title,
        location: booking.job.location
      } : null,
      candidate: booking.candidate ? {
        _id: booking.candidate._id,
        firstName: booking.candidate.firstName,
        lastName: booking.candidate.lastName,
        email: booking.candidate.email,
        phone: booking.candidate.phoneNumber
      } : {
        // Fallback to booking data if candidate reference is missing
        firstName: booking.candidateName.split(' ')[0] || '',
        lastName: booking.candidateName.split(' ').slice(1).join(' ') || '',
        email: booking.candidateEmail,
        phone: booking.candidatePhone
      }
    }));

    res.json({
      bookings: formattedBookings,
      total: formattedBookings.length
    });
  } catch (error) {
    console.error("Get interview calendar error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update interview booking status
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ["scheduled", "completed", "cancelled", "no_show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Valid statuses are: " + validStatuses.join(", ")
      });
    }

    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const { InterviewBooking } = require("../models/interview.model");
    
    const booking = await InterviewBooking.findOne({
      _id: bookingId,
      employer: employer._id
    });

    if (!booking) {
      return res.status(404).json({ 
        message: "Interview booking not found or unauthorized" 
      });
    }

    booking.status = status;
    if (notes) booking.notes = notes;
    if (status === "completed") booking.completedAt = new Date();
    
    await booking.save();

    res.json({
      message: "Interview status updated successfully",
      booking
    });
  } catch (error) {
    console.error("Update interview status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Send interview invitation manually
exports.sendInterviewInvitation = async (req, res) => {
  try {
    const { candidateId, jobId, recruitmentPartnerId } = req.body;
    
    if (!candidateId || !jobId) {
      return res.status(400).json({ 
        message: "candidateId and jobId are required" 
      });
    }

    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    // Verify job belongs to employer
    const job = await Job.findOne({ _id: jobId, employer: employer._id });
    if (!job) {
      return res.status(404).json({ 
        message: "Job not found or unauthorized" 
      });
    }

    // Find candidate
    const User = require("../models/user.model");
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Find candidate's application for this job
    const application = candidate.applications.find(
      app => app.job.toString() === jobId
    );
    
    if (!application) {
      return res.status(404).json({ 
        message: "Application not found for this candidate and job" 
      });
    }

    // Send invitation
    const result = await sendInterviewInvitationForApplication(
      candidate, 
      employer, 
      application, 
      "in_person_interview", 
      candidateId
    );

    res.json({
      message: "Interview invitation sent successfully",
      result
    });
  } catch (error) {
    console.error("Send interview invitation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Test email function - for debugging purposes
exports.testEmail = async (req, res) => {
  console.log("🧪 DEBUG: testEmail function called");
  try {
    const testResult = await sendEmail({
      to: "vinayak.pandey779@gmail.com",
      subject: "Test Email from BOD Platform - Debug",
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify email configuration is working.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>If you receive this, email sending is working correctly.</p>
      `,
      text: `
        Test Email
        
        This is a test email to verify email configuration is working.
        Timestamp: ${new Date().toISOString()}
        If you receive this, email sending is working correctly.
      `
    });

    console.log("✅ DEBUG: Test email result:", testResult);
    res.json({
      success: true,
      message: "Test email sent successfully",
      result: testResult
    });
  } catch (error) {
    console.error("❌ DEBUG: Test email failed:", error);
    res.status(500).json({
      success: false,
      message: "Test email failed",
      error: error.message
    });
  }
};
