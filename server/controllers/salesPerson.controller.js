const SalesPerson = require("../models/salesPerson.model");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Get all sales persons (admin only)
exports.getAllSalesPersons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, isActive } = req.query;
    
    // Build filter object
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const salesPersons = await SalesPerson.find(filter)
      .populate("user", "email isActive")
      .populate("managerId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await SalesPerson.countDocuments(filter);

    res.json({
      salesPersons,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get all sales persons error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new sales person (admin only)
exports.createSalesPerson = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create user account with password
    const user = await User.create({
      email,
      password,
      role: "sales_person",
      isActive: true,
    });

    // Create sales person profile
    const employeeId = "SP" + Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    const salesPersonData = {
      user: user._id,
      name,
      email,
      phone: phone || "",
      employeeId,
      isActive: true,
      isApproved: true,
    };

    const salesPerson = await SalesPerson.create(salesPersonData);

    // Populate user data before sending response
    const populatedSalesPerson = await SalesPerson.findById(salesPerson._id)
      .populate("user", "email isActive");

    res.status(201).json({
      message: "Sales person created successfully",
      salesPerson: populatedSalesPerson,
    });
  } catch (error) {
    console.error("Create sales person error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get sales person by ID
exports.getSalesPersonById = async (req, res) => {
  try {
    const salesPerson = await SalesPerson.findById(req.params.id)
      .populate("user", "email isActive lastLogin")
      .populate("managerId", "name email");

    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person not found" });
    }

    res.json(salesPerson);
  } catch (error) {
    console.error("Get sales person error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current sales person profile
exports.getMyProfile = async (req, res) => {
  try {
    const salesPerson = await SalesPerson.findOne({ user: req.user.id })
      .populate("user", "email lastLogin")
      .populate("managerId", "name email");

    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person profile not found" });
    }

    res.json(salesPerson);
  } catch (error) {
    console.error("Get my profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update sales person profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      department,
      territory,
    } = req.body;

    const salesPerson = await SalesPerson.findOne({ user: req.user.id });
    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person profile not found" });
    }

    // Update allowed fields
    if (firstName) salesPerson.firstName = firstName;
    if (lastName) salesPerson.lastName = lastName;
    if (phoneNumber) salesPerson.phoneNumber = phoneNumber;
    if (department) salesPerson.department = department;
    if (territory) salesPerson.territory = territory;

    await salesPerson.save();

    res.json({
      message: "Profile updated successfully",
      salesPerson,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign agents to sales person (admin only)
exports.assignAgents = async (req, res) => {
  try {
    const { id } = req.params;
    const { agents } = req.body;

    if (!agents || !Array.isArray(agents)) {
      return res.status(400).json({ message: "Agents array is required" });
    }

    const salesPerson = await SalesPerson.findById(id);
    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person not found" });
    }

    // Add new agents
    agents.forEach(agent => {
      const existingAgent = salesPerson.assignedAgents.find(
        a => a.agentId === agent.agentId
      );
      
      if (!existingAgent) {
        salesPerson.assignedAgents.push({
          agentId: agent.agentId,
          agentName: agent.agentName,
          agentEmail: agent.agentEmail,
          assignedDate: new Date(),
          isActive: true
        });
      }
    });

    await salesPerson.save();

    res.json({
      message: "Agents assigned successfully",
      assignedAgents: salesPerson.assignedAgents,
    });
  } catch (error) {
    console.error("Assign agents error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get assigned agents for current sales person
exports.getMyAgents = async (req, res) => {
  try {
    const salesPerson = await SalesPerson.findOne({ user: req.user.id });
    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person profile not found" });
    }

    const activeAgents = salesPerson.assignedAgents.filter(agent => agent.isActive);

    res.json({
      agents: activeAgents,
      total: activeAgents.length,
    });
  } catch (error) {
    console.error("Get my agents error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update performance metrics (admin only)
exports.updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { callsMade, clientsContacted, salesClosed, commission } = req.body;

    const salesPerson = await SalesPerson.findById(id);
    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person not found" });
    }

    // Update performance metrics
    if (callsMade !== undefined) salesPerson.performance.callsMade = callsMade;
    if (clientsContacted !== undefined) salesPerson.performance.clientsContacted = clientsContacted;
    if (salesClosed !== undefined) salesPerson.performance.salesClosed = salesClosed;
    if (commission !== undefined) salesPerson.performance.commission = commission;

    await salesPerson.save();

    res.json({
      message: "Performance updated successfully",
      performance: salesPerson.performance,
    });
  } catch (error) {
    console.error("Update performance error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve/disapprove sales person (admin only)
exports.updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const salesPerson = await SalesPerson.findById(id);
    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person not found" });
    }

    salesPerson.isApproved = isApproved;
    
    // Also update user isActive status
    await User.findByIdAndUpdate(salesPerson.user, { isActive: isApproved });
    
    await salesPerson.save();

    res.json({
      message: `Sales person ${isApproved ? 'approved' : 'disapproved'} successfully`,
      salesPerson,
    });
  } catch (error) {
    console.error("Update approval status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update sales person (admin only)
exports.updateSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone } = req.body;

    const salesPerson = await SalesPerson.findById(id).populate("user");
    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person not found" });
    }

    // Update sales person profile
    if (name) salesPerson.name = name;
    if (phone) salesPerson.phone = phone;

    await salesPerson.save();

    // Update user account if password is provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(salesPerson.user._id, {
        password: hashedPassword,
      });
    }

    // Return updated sales person with populated user data
    const updatedSalesPerson = await SalesPerson.findById(id)
      .populate("user", "email isActive");

    res.json({
      message: "Sales person updated successfully",
      salesPerson: updatedSalesPerson,
    });
  } catch (error) {
    console.error("Update sales person error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete sales person (admin only)
exports.deleteSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;

    const salesPerson = await SalesPerson.findById(id);
    if (!salesPerson) {
      return res.status(404).json({ message: "Sales person not found" });
    }

    // Delete associated user account
    await User.findByIdAndDelete(salesPerson.user);
    
    // Delete sales person profile
    await SalesPerson.findByIdAndDelete(id);

    res.json({ message: "Sales person deleted successfully" });
  } catch (error) {
    console.error("Delete sales person error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}; 