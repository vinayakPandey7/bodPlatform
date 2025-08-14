const mongoose = require("mongoose");

const salesPersonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  department: {
    type: String,
    enum: ["sales", "business_development", "account_management", "inside_sales"],
    default: "sales",
  },
  territory: {
    type: String,
    trim: true,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to another sales person or admin who is the manager
  },
  assignedAgents: [{
    agentId: {
      type: String,
      required: true,
    },
    agentName: {
      type: String,
      required: true,
    },
    agentEmail: {
      type: String,
      required: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  }],
  salesQuota: {
    monthly: {
      type: Number,
      default: 0,
    },
    quarterly: {
      type: Number,
      default: 0,
    },
    yearly: {
      type: Number,
      default: 0,
    }
  },
  performance: {
    callsMade: {
      type: Number,
      default: 0,
    },
    clientsContacted: {
      type: Number,
      default: 0,
    },
    salesClosed: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    }
  },
  permissions: [{
    type: String,
    enum: ["view_agents", "manage_clients", "generate_reports", "view_commission"],
    default: ["view_agents", "manage_clients"],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
salesPersonSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("SalesPerson", salesPersonSchema); 