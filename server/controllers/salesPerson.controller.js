const SalesPerson = require("../models/salesPerson.model");
const User = require("../models/user.model");

// Get all sales persons (admin only)
exports.getAllSalesPersons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, isActive } = req.query;
    
    // Build filter object
    let filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const salesPersons = await SalesPerson.find(filter)
      .populate("user", "email isActive")
      .populate("managerId", "firstName lastName email")
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

// Get sales person by ID
exports.getSalesPersonById = async (req, res) => {
  try {
    const salesPerson = await SalesPerson.findById(req.params.id)
      .populate("user", "email isActive lastLogin")
      .populate("managerId", "firstName lastName email");

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
      .populate("managerId", "firstName lastName email");

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