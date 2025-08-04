const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const Employer = require("../models/employer.model");
const RecruitmentPartner = require("../models/recruitmentPartner.model");
const SalesPerson = require("../models/salesPerson.model");
const { sendPasswordResetEmail } = require("../utils/email");
const {
  getCoordinatesFromZipCode,
  isWithinUSBounds,
} = require("../utils/geoUtils");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, role, employerData, recruitmentPartnerData } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create user
    const user = new User({
      email,
      password,
      role,
      status: "pending", // Set to pending by default for approval
    });

    await user.save();

    // Create role-specific profile
    if (role === "employer" && employerData) {
      const employer = new Employer({
        user: user._id,
        ...employerData,
        status: "pending",
      });
      await employer.save();
    } else if (role === "recruitment_partner" && recruitmentPartnerData) {
      const recruitmentPartner = new RecruitmentPartner({
        user: user._id,
        ...recruitmentPartnerData,
        status: "pending",
      });
      await recruitmentPartner.save();
    }

    res.status(201).json({
      message: "Registration successful. Your account is pending approval.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Handle user login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "Your account has been deactivated" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user);

    // Get user profile based on role
    let profile = null;
    if (user.role === "employer") {
      profile = await Employer.findOne({ user: user._id });
    } else if (user.role === "recruitment_partner") {
      profile = await RecruitmentPartner.findOne({ user: user._id });
    } else if (user.role === "sales_person") {
      profile = await SalesPerson.findOne({ user: user._id });
    }

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Handle forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expiry (30 minutes)
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save();

    // Create reset url pointing to frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send email with reset link
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.firstName || user.email.split("@")[0]
    );

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      console.log(
        "🔗 DEVELOPMENT: Password reset URL for",
        user.email,
        ":",
        resetUrl
      );
      // Don't reveal email sending failure to user for security
    } else {
      console.log("✅ Password reset email sent successfully to:", user.email);
    }

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Handle reset password
exports.resetPassword = async (req, res) => {
  try {
    // Hash token from URL
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    // Find user with token and valid expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user profile based on role
    let profile = null;
    if (user.role === "employer") {
      profile = await Employer.findOne({ user: user._id });
    } else if (user.role === "recruitment_partner") {
      profile = await RecruitmentPartner.findOne({ user: user._id });
    } else if (user.role === "sales_person") {
      profile = await SalesPerson.findOne({ user: user._id });
    }

    // For candidates, include applications to check applied jobs
    let userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      zipCode: user.zipCode,
      profile,
      profilePicture: user.personalInfo?.profilePicture || null,
    };

    // Add applications for candidates
    if (user.role === "candidate" && user.applications) {
      userResponse.applications = user.applications;
    }

    res.json({
      user: userResponse,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Since JWT tokens are stateless, we just return a success response
    // The client will handle clearing the token from storage
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Dedicated Employer Registration with mandatory location validation
exports.registerEmployer = async (req, res) => {
  let user = null; // Declare user variable in outer scope for cleanup

  try {
    const {
      email,
      password,
      ownerName,
      companyName,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country = "United States",
      locationDetected = false,
      detectedCoordinates = null, // GPS coordinates from browser location detection
    } = req.body;

    // Validate required fields (city and state may be auto-populated from zip code or GPS)
    if (
      !email ||
      !password ||
      !ownerName ||
      !companyName ||
      !phoneNumber ||
      !address
    ) {
      return res.status(400).json({
        message:
          "All basic fields are required: email, password, ownerName, companyName, phoneNumber, address",
      });
    }

    // Validate US-only registration
    if (country !== "United States" && country !== "USA" && country !== "US") {
      return res.status(400).json({
        message:
          "Only employers from the United States can register on this platform",
        error: "INVALID_COUNTRY",
      });
    }

    let finalCity = city;
    let finalState = state;
    let finalZipCode = zipCode;
    let coordinates;
    let locationValidation = {
      zipCodeProvided: false,
      coordinatesGenerated: false,
      locationDetected: locationDetected,
      withinUSBounds: false,
      method: "none",
    };

    // Handle location detection scenarios
    if (locationDetected && detectedCoordinates) {
      // Scenario 1: GPS location was detected and provided
      console.log("Processing GPS-detected location...");

      // Validate coordinates are within US bounds
      const { isWithinUSBounds } = require("../utils/geoUtils");
      const withinBounds = isWithinUSBounds(detectedCoordinates);

      if (!withinBounds) {
        return res.status(400).json({
          message: "Detected location is outside United States boundaries",
          error: "LOCATION_OUTSIDE_US",
        });
      }

      coordinates = detectedCoordinates;
      locationValidation.coordinatesGenerated = true;
      locationValidation.withinUSBounds = true;
      locationValidation.method = "gps";

      // For GPS detection, we still need basic city/state info
      if (!city || !state) {
        return res.status(400).json({
          message: "City and state are required even with GPS location",
          error: "CITY_STATE_REQUIRED",
        });
      }
    } else {
      // Scenario 2: Manual entry - zip code is mandatory
      if (!zipCode || zipCode.trim() === "") {
        return res.status(400).json({
          message:
            "Zip code is mandatory for employer registration when location detection is not available",
          error: "ZIP_CODE_REQUIRED",
        });
      }

      // Validate and get coordinates from zip code
      const {
        getCoordinatesFromZipCode,
        getCityFromZipCode,
      } = require("../utils/geoUtils");

      try {
        // Auto-populate city and state from zip code if not provided
        if (!city || !state) {
          console.log("Auto-populating city/state from zip code...");
          const cityInfo = await getCityFromZipCode(zipCode);

          if (cityInfo) {
            finalCity = finalCity || cityInfo.city;
            finalState = finalState || cityInfo.state;
            console.log(`Auto-populated: ${finalCity}, ${finalState}`);
          } else {
            // If we can't get city info, it's an invalid zip code
            return res.status(400).json({
              message:
                "Invalid or unsupported zip code. Please use a valid US zip code.",
              error: "INVALID_ZIP_CODE",
            });
          }
        }

        coordinates = await getCoordinatesFromZipCode(zipCode);
        locationValidation.zipCodeProvided = true;
        locationValidation.coordinatesGenerated = true;
        locationValidation.method = "zipcode";

        // Validate coordinates are within US bounds
        const { isWithinUSBounds } = require("../utils/geoUtils");
        locationValidation.withinUSBounds = isWithinUSBounds(coordinates);
      } catch (error) {
        return res.status(400).json({
          message: "Invalid zip code or unable to get location coordinates",
          error: "INVALID_ZIP_CODE",
        });
      }

      // Final validation for city and state
      if (!finalCity || !finalState) {
        return res.status(400).json({
          message: "City and state are required when zip code lookup fails",
          error: "CITY_STATE_REQUIRED",
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        error: "USER_EXISTS",
      });
    }

    // Early validation: Check if zip code exists in our database
    if (!locationDetected && zipCode) {
      const { getCityFromZipCode } = require("../utils/geoUtils");
      try {
        const cityInfo = await getCityFromZipCode(zipCode);
        if (!cityInfo) {
          return res.status(400).json({
            message:
              "Invalid or unsupported zip code. Please use a valid US zip code.",
            error: "INVALID_ZIP_CODE",
          });
        }
      } catch (error) {
        return res.status(400).json({
          message:
            "Invalid or unsupported zip code. Please use a valid US zip code.",
          error: "INVALID_ZIP_CODE",
        });
      }
    }

    // Create user account
    user = new User({
      email,
      password,
      role: "employer",
      isActive: true, // Auto-activate for employer registration
    });

    await user.save();

    // Prepare employer profile data
    const employerData = {
      user: user._id,
      ownerName,
      companyName,
      email,
      phoneNumber,
      address,
      city: finalCity,
      state: finalState,
      zipCode: finalZipCode || "",
      country: "United States",
      locationDetected,
      jobPosting: "manual", // Default to manual job posting
      isApproved: false, // Requires admin approval
    };

    // Add location coordinates if available
    if (coordinates) {
      employerData.location = {
        type: "Point",
        coordinates: coordinates,
      };
    }

    // Create employer profile
    const employer = new Employer(employerData);
    await employer.save();

    // Generate token for immediate login
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message:
        "Employer registration successful! Your account is pending admin approval for job posting privileges.",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: employer,
      },
      locationValidation: locationValidation,
    });
  } catch (error) {
    console.error("Employer registration error:", error);

    // If user was created but employer profile failed, clean up the user
    if (user && user._id) {
      try {
        await User.findByIdAndDelete(user._id);
        console.log("Cleaned up orphaned user record:", user.email);
      } catch (cleanupError) {
        console.error("Failed to cleanup orphaned user:", cleanupError);
      }
    }

    // Handle specific validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        error: "VALIDATION_ERROR",
      });
    }

    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// Dedicated Candidate Registration with mandatory location validation
exports.registerCandidate = async (req, res) => {
  let user = null; // Declare user variable in outer scope for cleanup

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country = "United States",
      locationDetected = false,
      detectedCoordinates = null, // GPS coordinates from browser location detection
    } = req.body;

    // Validate required fields
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !zipCode
    ) {
      return res.status(400).json({
        message:
          "All required fields must be filled: email, password, first name, last name, phone number, and zip code",
      });
    }

    // Validate US-only registration
    if (country !== "United States" && country !== "USA" && country !== "US") {
      return res.status(400).json({
        message:
          "Only candidates from the United States can register on this platform",
        error: "INVALID_COUNTRY",
      });
    }

    let finalCity = city;
    let finalState = state;
    let coordinates;
    let locationValidation = {
      zipCodeProvided: !!zipCode,
      coordinatesGenerated: false,
      locationDetected: locationDetected,
      withinUSBounds: false,
      method: "none",
    };

    // Handle location detection scenarios
    if (locationDetected && detectedCoordinates) {
      // Scenario 1: GPS location was detected and provided
      console.log("Processing GPS-detected location for candidate...");

      // Validate coordinates are within US bounds
      const { isWithinUSBounds } = require("../utils/geoUtils");
      const withinBounds = isWithinUSBounds(detectedCoordinates);

      if (!withinBounds) {
        return res.status(400).json({
          message: "Detected location is outside United States boundaries",
          error: "LOCATION_OUTSIDE_US",
        });
      }

      coordinates = detectedCoordinates;
      locationValidation.coordinatesGenerated = true;
      locationValidation.withinUSBounds = true;
      locationValidation.method = "gps";
    }

    // Always process zip code for candidates (required for job matching)
    if (!zipCode || zipCode.trim() === "") {
      return res.status(400).json({
        message:
          "Zip code is mandatory for candidate registration to enable job matching within your area",
        error: "ZIP_CODE_REQUIRED",
      });
    }

    // Validate and get coordinates from zip code
    const {
      getCoordinatesFromZipCode,
      getCityFromZipCode,
    } = require("../utils/geoUtils");

    try {
      // Auto-populate city and state from zip code if not provided
      if (!finalCity || !finalState) {
        console.log(
          "Auto-populating city/state from zip code for candidate..."
        );
        const cityInfo = await getCityFromZipCode(zipCode);

        if (cityInfo) {
          finalCity = finalCity || cityInfo.city;
          finalState = finalState || cityInfo.state;
          console.log(`Auto-populated: ${finalCity}, ${finalState}`);
        } else {
          // If we can't get city info, it's an invalid zip code
          return res.status(400).json({
            message:
              "Invalid or unsupported zip code. Please use a valid US zip code.",
            error: "INVALID_ZIP_CODE",
          });
        }
      }

      // If coordinates weren't set from GPS, get them from zip code
      if (!coordinates) {
        coordinates = await getCoordinatesFromZipCode(zipCode);
        locationValidation.method = "zipcode";
      }

      locationValidation.coordinatesGenerated = true;

      // Validate coordinates are within US bounds
      const { isWithinUSBounds } = require("../utils/geoUtils");
      locationValidation.withinUSBounds = isWithinUSBounds(coordinates);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid zip code or unable to get location coordinates",
        error: "INVALID_ZIP_CODE",
        details: error.message,
      });
    }

    // Final validation for city and state
    if (!finalCity || !finalState) {
      return res.status(400).json({
        message: "City and state are required when zip code lookup fails",
        error: "CITY_STATE_REQUIRED",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        error: "USER_EXISTS",
      });
    }

    // Create user account with candidate-specific fields
    user = new User({
      email,
      password,
      role: "candidate",
      firstName,
      lastName,
      phoneNumber,
      zipCode,
      city: finalCity,
      state: finalState,
      country: "United States",
      locationDetected,
      isActive: true, // Auto-activate for candidates
    });

    // Add location coordinates if available
    if (coordinates) {
      user.location = {
        type: "Point",
        coordinates: coordinates,
      };
    }

    await user.save();

    // Generate token for immediate login
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message:
        "Candidate registration successful! You can now start searching for jobs in your area.",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        zipCode: user.zipCode,
        city: user.city,
        state: user.state,
        location: user.location,
      },
      locationValidation: locationValidation,
    });
  } catch (error) {
    console.error("Candidate registration error:", error);

    // If user was created but failed after, clean up the user
    if (user && user._id) {
      try {
        await User.findByIdAndDelete(user._id);
        console.log("Cleaned up orphaned user record:", user.email);
      } catch (cleanupError) {
        console.error("Failed to cleanup orphaned user:", cleanupError);
      }
    }

    // Handle specific validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        error: "VALIDATION_ERROR",
      });
    }

    res.status(500).json({
      message: "Server error during candidate registration",
      error: error.message,
    });
  }
};

// Dedicated Sales Person Registration
exports.registerSalesPerson = async (req, res) => {
  let user = null;

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      employeeId,
      department = "sales",
      territory,
      managerId,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phoneNumber || !employeeId) {
      return res.status(400).json({
        message: "All required fields must be filled: email, password, first name, last name, phone number, and employee ID",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
        error: "USER_EXISTS",
      });
    }

    // Check if employee ID already exists
    const existingSalesPerson = await SalesPerson.findOne({ employeeId });
    if (existingSalesPerson) {
      return res.status(400).json({
        message: "Employee ID already exists",
        error: "EMPLOYEE_ID_EXISTS",
      });
    }

    // Validate manager if provided
    let manager = null;
    if (managerId) {
      manager = await User.findById(managerId);
      if (!manager || (manager.role !== "admin" && manager.role !== "sales_person")) {
        return res.status(400).json({
          message: "Invalid manager ID. Manager must be an admin or sales person.",
          error: "INVALID_MANAGER",
        });
      }
    }

    // Create user account
    user = new User({
      email,
      password,
      role: "sales_person",
      isActive: false, // Requires admin approval
    });

    await user.save();

    // Create sales person profile
    const salesPersonData = {
      user: user._id,
      firstName,
      lastName,
      email,
      phoneNumber,
      employeeId,
      department,
      territory,
      managerId,
      isApproved: false, // Requires admin approval
    };

    const salesPerson = new SalesPerson(salesPersonData);
    await salesPerson.save();

    res.status(201).json({
      success: true,
      message: "Sales person registration successful! Your account is pending approval.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: {
          firstName: salesPerson.firstName,
          lastName: salesPerson.lastName,
          employeeId: salesPerson.employeeId,
          department: salesPerson.department,
          isApproved: salesPerson.isApproved,
        },
      },
    });
  } catch (error) {
    console.error("Sales person registration error:", error);

    // Clean up user if it was created but sales person creation failed
    if (user && user._id) {
      try {
        await User.findByIdAndDelete(user._id);
        console.log("Cleaned up user after sales person creation failure");
      } catch (cleanupError) {
        console.error("Error during user cleanup:", cleanupError);
      }
    }

    // Handle specific validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${duplicateField} already exists`,
        error: "DUPLICATE_VALUE",
      });
    }

    res.status(500).json({
      message: "Server error during sales person registration",
      error: error.message,
    });
  }
};
