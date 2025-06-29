const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const Employer = require("../models/employer.model");
const RecruitmentPartner = require("../models/recruitmentPartner.model");

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

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;

    // Send email with reset link (implementation required)
    // ... send email code here

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
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile,
      },
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
