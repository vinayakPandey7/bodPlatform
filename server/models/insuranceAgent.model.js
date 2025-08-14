const mongoose = require('mongoose');

const insuranceAgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clientsCount: {
    type: Number,
    default: 0
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
insuranceAgentSchema.index({ email: 1 });
insuranceAgentSchema.index({ isActive: 1 });

module.exports = mongoose.model('InsuranceAgent', insuranceAgentSchema);
