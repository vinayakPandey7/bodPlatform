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
  },
  // Sales tracking fields
  callStatus: {
    type: String,
    enum: ['not_called', 'called', 'skipped', 'unpicked'],
    default: 'not_called'
  },
  lastCallDate: {
    type: Date
  },
  salesRemarks: [{
    message: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    callOutcome: {
      type: String,
      enum: ['answered', 'no_answer', 'callback_requested', 'not_interested', 'interested'],
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
insuranceClientSchema.index({ agentId: 1 });
insuranceClientSchema.index({ email: 1, agentId: 1 });
insuranceClientSchema.index({ status: 1 });

module.exports = mongoose.model('InsuranceClient', insuranceClientSchema);
