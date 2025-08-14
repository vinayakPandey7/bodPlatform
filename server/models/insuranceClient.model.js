const mongoose = require('mongoose');

const insuranceClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceAgent',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'converted', 'declined'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  lastPayment: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
insuranceClientSchema.index({ agentId: 1 });
insuranceClientSchema.index({ email: 1, agentId: 1 });
insuranceClientSchema.index({ status: 1 });

module.exports = mongoose.model('InsuranceClient', insuranceClientSchema);
