const InsuranceAgent = require('../models/insuranceAgent.model');
const { validationResult } = require('express-validator');

// Get all insurance agents
const getInsuranceAgents = async (req, res) => {
  try {
    const agents = await InsuranceAgent.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: agents,
      message: 'Insurance agents retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching insurance agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance agents'
    });
  }
};

// Get single insurance agent
const getInsuranceAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await InsuranceAgent.findById(id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Insurance agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent,
      message: 'Insurance agent retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching insurance agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance agent'
    });
  }
};

// Create new insurance agent
const createInsuranceAgent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone } = req.body;

    // Check if email already exists
    const existingAgent = await InsuranceAgent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Insurance agent with this email already exists'
      });
    }

    // Create new insurance agent
    const newAgent = new InsuranceAgent({
      name,
      email,
      phone,
      isActive: true,
      clientsCount: 0,
      joinedDate: new Date()
    });

    const savedAgent = await newAgent.save();

    res.status(201).json({
      success: true,
      data: savedAgent,
      message: 'Insurance agent created successfully'
    });
  } catch (error) {
    console.error('Error creating insurance agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create insurance agent'
    });
  }
};

// Update insurance agent
const updateInsuranceAgent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email, phone, isActive } = req.body;

    // Check if agent exists
    const existingAgent = await InsuranceAgent.findById(id);
    if (!existingAgent) {
      return res.status(404).json({
        success: false,
        message: 'Insurance agent not found'
      });
    }

    // Check if email already exists (if email is being changed)
    if (email && email !== existingAgent.email) {
      const emailExists = await InsuranceAgent.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Insurance agent with this email already exists'
        });
      }
    }

    // Update agent
    const updatedAgent = await InsuranceAgent.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedAgent,
      message: 'Insurance agent updated successfully'
    });
  } catch (error) {
    console.error('Error updating insurance agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update insurance agent'
    });
  }
};

// Delete insurance agent
const deleteInsuranceAgent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if agent exists
    const agent = await InsuranceAgent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Insurance agent not found'
      });
    }

    await InsuranceAgent.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Insurance agent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting insurance agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete insurance agent'
    });
  }
};

// Toggle agent status
const toggleAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await InsuranceAgent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Insurance agent not found'
      });
    }

    const updatedAgent = await InsuranceAgent.findByIdAndUpdate(
      id,
      { isActive: !agent.isActive },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedAgent,
      message: `Insurance agent ${updatedAgent.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling agent status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle agent status'
    });
  }
};

module.exports = {
  getInsuranceAgents,
  getInsuranceAgent,
  createInsuranceAgent,
  updateInsuranceAgent,
  deleteInsuranceAgent,
  toggleAgentStatus
};
