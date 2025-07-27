const Client = require("../models/client.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// Get all clients for a recruitment partner
const getClients = async (req, res) => {
  try {
    const recruitmentPartnerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { recruitmentPartnerId };

    // Apply filters if provided
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    if (req.query.industry && req.query.industry !== "all") {
      filter.industry = req.query.industry;
    }

    if (req.query.companySize && req.query.companySize !== "all") {
      filter.companySize = req.query.companySize;
    }

    if (req.query.contractValue && req.query.contractValue !== "all") {
      const value = req.query.contractValue;
      switch (value) {
        case "0-25k":
          filter.contractValue = { $lte: 25000 };
          break;
        case "25k-50k":
          filter.contractValue = { $gt: 25000, $lte: 50000 };
          break;
        case "50k-100k":
          filter.contractValue = { $gt: 50000, $lte: 100000 };
          break;
        case "100k+":
          filter.contractValue = { $gt: 100000 };
          break;
      }
    }

    if (req.query.location) {
      filter.$or = [
        { city: new RegExp(req.query.location, "i") },
        { state: new RegExp(req.query.location, "i") },
      ];
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
      sort = { [sortField]: sortOrder };
    }

    const clients = await Client.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    const total = await Client.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clients",
      error: error.message,
    });
  }
};

// Get client statistics
const getClientStats = async (req, res) => {
  try {
    const recruitmentPartnerId = req.user.id;
    const stats = await Client.getClientStats(recruitmentPartnerId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching client statistics",
      error: error.message,
    });
  }
};

// Get a single client by ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruitmentPartnerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID",
      });
    }

    const client = await Client.findOne({
      _id: id,
      recruitmentPartnerId,
    })
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching client",
      error: error.message,
    });
  }
};

// Create a new client
const createClient = async (req, res) => {
  try {
    const recruitmentPartnerId = req.user.id;
    const clientData = {
      ...req.body,
      recruitmentPartnerId,
      createdBy: recruitmentPartnerId,
    };

    // Check for duplicate company name for this recruitment partner
    const existingClient = await Client.findOne({
      recruitmentPartnerId,
      companyName: new RegExp(`^${req.body.companyName}$`, "i"),
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "A client with this company name already exists",
      });
    }

    // Check for duplicate email
    const existingEmail = await Client.findOne({
      recruitmentPartnerId,
      email: req.body.email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists",
      });
    }

    const client = new Client(clientData);
    await client.save();

    // Populate the created client
    await client.populate("createdBy", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    console.error("Error creating client:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating client",
      error: error.message,
    });
  }
};

// Update an existing client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const recruitmentPartnerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID",
      });
    }

    const client = await Client.findOne({
      _id: id,
      recruitmentPartnerId,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Check for duplicate company name (excluding current client)
    if (req.body.companyName && req.body.companyName !== client.companyName) {
      const existingClient = await Client.findOne({
        recruitmentPartnerId,
        companyName: new RegExp(`^${req.body.companyName}$`, "i"),
        _id: { $ne: id },
      });

      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: "A client with this company name already exists",
        });
      }
    }

    // Check for duplicate email (excluding current client)
    if (req.body.email && req.body.email.toLowerCase() !== client.email) {
      const existingEmail = await Client.findOne({
        recruitmentPartnerId,
        email: req.body.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "A client with this email already exists",
        });
      }
    }

    // Update the client
    const updateData = {
      ...req.body,
      updatedBy: recruitmentPartnerId,
    };

    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, recruitmentPartnerId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error.message,
    });
  }
};

// Delete a client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const recruitmentPartnerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID",
      });
    }

    const client = await Client.findOneAndDelete({
      _id: id,
      recruitmentPartnerId,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting client",
      error: error.message,
    });
  }
};

// Get client dashboard data
const getClientDashboard = async (req, res) => {
  try {
    const recruitmentPartnerId = req.user.id;

    // Get basic stats
    const stats = await Client.getClientStats(recruitmentPartnerId);

    // Get recent clients (last 5)
    const recentClients = await Client.find({ recruitmentPartnerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("companyName contactPerson status contractValue createdAt");

    // Get industry distribution
    const industryDistribution = await Client.aggregate([
      {
        $match: {
          recruitmentPartnerId: new mongoose.Types.ObjectId(
            recruitmentPartnerId
          ),
        },
      },
      {
        $group: {
          _id: "$industry",
          count: { $sum: 1 },
          totalValue: { $sum: "$contractValue" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get contract status distribution
    const contractStatusDistribution = await Client.aggregate([
      {
        $match: {
          recruitmentPartnerId: new mongoose.Types.ObjectId(
            recruitmentPartnerId
          ),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Client.aggregate([
      {
        $match: {
          recruitmentPartnerId: new mongoose.Types.ObjectId(
            recruitmentPartnerId
          ),
          contractStartDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$contractStartDate" },
            month: { $month: "$contractStartDate" },
          },
          revenue: { $sum: "$contractValue" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentClients,
        industryDistribution,
        contractStatusDistribution,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching client dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching client dashboard data",
      error: error.message,
    });
  }
};

// Export functions
module.exports = {
  getClients,
  getClientStats,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientDashboard,
};
