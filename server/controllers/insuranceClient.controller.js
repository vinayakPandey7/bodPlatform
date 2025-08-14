const InsuranceClient = require('../models/insuranceClient.model');
const InsuranceAgent = require('../models/insuranceAgent.model');
const { validationResult } = require('express-validator');
const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');

// Get all clients (admin only)
const getAllClients = async (req, res) => {
  try {
    const clients = await InsuranceClient.find()
      .populate('agentId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: clients,
      total: clients.length,
      message: 'All clients retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching all clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients'
    });
  }
};

// Get all clients for a specific agent
const getClientsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Verify agent exists
    const agent = await InsuranceAgent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Insurance agent not found'
      });
    }

    const clients = await InsuranceClient.find({ agentId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: clients,
      message: 'Clients retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients'
    });
  }
};

// Get single client
const getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await InsuranceClient.findById(id).populate('agentId', 'name email');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client,
      message: 'Client retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client'
    });
  }
};

// Create new client
const createClient = async (req, res) => {
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

    const { name, email, phone, address, agentId, status, notes, lastPayment } = req.body;

    // Verify agent exists
    const agent = await InsuranceAgent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Insurance agent not found'
      });
    }

    // Check if client already exists for this agent
    const existingClient = await InsuranceClient.findOne({ email, agentId });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists for this agent'
      });
    }

    // Create new client
    const newClient = new InsuranceClient({
      name,
      email,
      phone,
      address,
      agentId,
      status: status || 'pending',
      notes,
      lastPayment: lastPayment ? new Date(lastPayment) : null
    });

    const savedClient = await newClient.save();

    // Update agent's client count
    await InsuranceAgent.findByIdAndUpdate(agentId, {
      $inc: { clientsCount: 1 }
    });

    res.status(201).json({
      success: true,
      data: savedClient,
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create client'
    });
  }
};

// Update client
const updateClient = async (req, res) => {
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
    const { name, email, phone, address, status, notes, lastPayment, isActive } = req.body;

    // Check if client exists
    const existingClient = await InsuranceClient.findById(id);
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if email already exists for this agent (if email is being changed)
    if (email && email !== existingClient.email) {
      const emailExists = await InsuranceClient.findOne({ 
        email, 
        agentId: existingClient.agentId, 
        _id: { $ne: id } 
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Client with this email already exists for this agent'
        });
      }
    }

    // Update client
    const updatedClient = await InsuranceClient.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(lastPayment && { lastPayment: new Date(lastPayment) }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedClient,
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client'
    });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client exists
    const client = await InsuranceClient.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await InsuranceClient.findByIdAndDelete(id);

    // Update agent's client count
    await InsuranceAgent.findByIdAndUpdate(client.agentId, {
      $inc: { clientsCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client'
    });
  }
};

// Bulk import clients via CSV
const importClientsCSV = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Verify agent exists
    const agent = await InsuranceAgent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Insurance agent not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const results = [];
    const errors = [];
    let lineNumber = 1;

    return new Promise((resolve) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          lineNumber++;
          try {
            // Validate required fields
            if (!data.name || !data.email || !data.phone) {
              errors.push({
                line: lineNumber,
                error: 'Missing required fields (name, email, phone)',
                data
              });
              return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
              errors.push({
                line: lineNumber,
                error: 'Invalid email format',
                data
              });
              return;
            }

            results.push({
              name: data.name.trim(),
              email: data.email.toLowerCase().trim(),
              phone: data.phone.trim(),
              address: data.address?.trim() || '',
              agentId,
              status: data.status?.toLowerCase() || 'pending',
              notes: data.notes?.trim() || '',
              lastPayment: data.lastPayment ? new Date(data.lastPayment) : null
            });
          } catch (error) {
            errors.push({
              line: lineNumber,
              error: error.message,
              data
            });
          }
        })
        .on('end', async () => {
          try {
            let successCount = 0;
            let skipCount = 0;

            // Process each client
            for (const clientData of results) {
              try {
                // Check if client already exists
                const existingClient = await InsuranceClient.findOne({
                  email: clientData.email,
                  agentId
                });

                if (existingClient) {
                  skipCount++;
                  continue;
                }

                const client = new InsuranceClient(clientData);
                await client.save();
                successCount++;
              } catch (error) {
                errors.push({
                  email: clientData.email,
                  error: error.message
                });
              }
            }

            // Update agent's client count
            if (successCount > 0) {
              await InsuranceAgent.findByIdAndUpdate(agentId, {
                $inc: { clientsCount: successCount }
              });
            }

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            resolve(res.status(200).json({
              success: true,
              data: {
                imported: successCount,
                skipped: skipCount,
                errors: errors.length,
                errorDetails: errors
              },
              message: `Successfully imported ${successCount} clients. ${skipCount} skipped (duplicates). ${errors.length} errors.`
            }));
          } catch (error) {
            console.error('Error processing CSV:', error);
            // Clean up uploaded file
            if (req.file && req.file.path) {
              fs.unlinkSync(req.file.path);
            }
            resolve(res.status(500).json({
              success: false,
              message: 'Failed to process CSV file'
            }));
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          // Clean up uploaded file
          if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
          }
          resolve(res.status(500).json({
            success: false,
            message: 'Failed to read CSV file'
          }));
        });
    });
  } catch (error) {
    console.error('Error importing clients:', error);
    // Clean up uploaded file
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to import clients'
    });
  }
};

module.exports = {
  getAllClients,
  getClientsByAgent,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  importClientsCSV
};
