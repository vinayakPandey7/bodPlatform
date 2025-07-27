const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    recruitmentPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    zipcode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{5}$/, "Please enter a valid 5-digit zipcode"],
    },
    industry: {
      type: String,
      required: true,
      enum: [
        "Technology",
        "Healthcare",
        "Finance",
        "Manufacturing",
        "Retail",
        "Education",
        "Real Estate",
        "Consulting",
        "Non-Profit",
        "Government",
        "Other",
      ],
    },
    companySize: {
      type: String,
      required: true,
      enum: ["1-10", "10-50", "50-100", "100-500", "500-1000", "1000+"],
    },
    contractValue: {
      type: Number,
      required: true,
      min: 1000,
      max: 10000000,
    },
    contractStartDate: {
      type: Date,
      required: true,
    },
    contractEndDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.contractStartDate;
        },
        message: "Contract end date must be after start date",
      },
    },
    paymentTerms: {
      type: String,
      required: true,
      enum: [
        "Net 15",
        "Net 30",
        "Net 45",
        "Net 60",
        "Net 90",
        "Due on Receipt",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "prospect"],
      default: "prospect",
    },
    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    // Analytics fields
    activePositions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPlacements: {
      type: Number,
      default: 0,
      min: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
clientSchema.index({ recruitmentPartnerId: 1, status: 1 });
clientSchema.index({ recruitmentPartnerId: 1, industry: 1 });
clientSchema.index({ recruitmentPartnerId: 1, companySize: 1 });
clientSchema.index({ recruitmentPartnerId: 1, createdAt: -1 });
clientSchema.index({
  companyName: "text",
  contactPerson: "text",
  email: "text",
});

// Virtual for contract status
clientSchema.virtual("contractStatus").get(function () {
  const now = new Date();
  if (now < this.contractStartDate) {
    return "upcoming";
  } else if (now > this.contractEndDate) {
    return "expired";
  } else {
    return "active";
  }
});

// Virtual for contract duration in days
clientSchema.virtual("contractDuration").get(function () {
  const diffTime = Math.abs(this.contractEndDate - this.contractStartDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update lastActivity
clientSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }
  next();
});

// Static method to get client statistics for a recruitment partner
clientSchema.statics.getClientStats = async function (recruitmentPartnerId) {
  const stats = await this.aggregate([
    {
      $match: {
        recruitmentPartnerId: new mongoose.Types.ObjectId(recruitmentPartnerId),
      },
    },
    {
      $group: {
        _id: null,
        totalClients: { $sum: 1 },
        activeClients: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
          },
        },
        totalRevenue: { $sum: "$contractValue" },
        averageContractValue: { $avg: "$contractValue" },
        totalPlacements: { $sum: "$totalPlacements" },
        pendingContracts: {
          $sum: {
            $cond: [{ $eq: ["$status", "prospect"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Calculate this month revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthRevenue = await this.aggregate([
    {
      $match: {
        recruitmentPartnerId: new mongoose.Types.ObjectId(recruitmentPartnerId),
        contractStartDate: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        thisMonthRevenue: { $sum: "$contractValue" },
      },
    },
  ]);

  const result = stats[0] || {
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    averageContractValue: 0,
    totalPlacements: 0,
    pendingContracts: 0,
  };

  result.thisMonthRevenue = thisMonthRevenue[0]?.thisMonthRevenue || 0;

  return result;
};

// Instance method to update analytics
clientSchema.methods.updateAnalytics = async function () {
  // This would be called when job positions or placements are updated
  // For now, we'll just update the lastActivity
  this.lastActivity = new Date();
  await this.save();
};

module.exports = mongoose.model("Client", clientSchema);
