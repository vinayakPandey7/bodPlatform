const InsuranceClient = require('../models/insuranceClient.model');
const InsuranceAgent = require('../models/insuranceAgent.model');
const { validationResult } = require('express-validator');
const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const { Readable } = require('stream');

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

// Background CSV processing function
const processCSVInBackground = async (agentId, cloudinaryUrl, processingId) => {
  const results = [];
  const errors = [];
  let lineNumber = 1;

  try {
    console.log(`Background processing started for ID: ${processingId}`);
    
    // Download CSV content from Cloudinary
    const response = await axios.get(cloudinaryUrl, {
      responseType: 'stream',
      timeout: 120000,
      headers: {
        'Accept': 'text/csv, application/octet-stream, */*'
      }
    });

    if (!response.data) {
      throw new Error('Failed to download CSV file from Cloudinary');
    }

    return new Promise((resolve, reject) => {
      response.data
        .pipe(csv())
        .on('data', (data) => {
          lineNumber++;
          try {
            console.log(`Background processing line ${lineNumber}:`, data.email);
            
            // Skip empty rows
            if (!data.name && !data.email && !data.phone) {
              return;
            }

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
            console.error('Error processing CSV row:', error);
            errors.push({
              line: lineNumber,
              error: error.message,
              data
            });
          }
        })
        .on('end', async () => {
          try {
            console.log(`Background CSV parsing completed for ${processingId}. Found ${results.length} valid entries, ${errors.length} errors`);
            
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
                console.error('Error saving client:', error);
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

            console.log(`Background import completed for ${processingId}: ${successCount} imported, ${skipCount} skipped, ${errors.length} errors`);
            
            resolve({
              processingId,
              imported: successCount,
              skipped: skipCount,
              errors: errors.length,
              errorDetails: errors
            });
          } catch (error) {
            console.error('Error in background processing:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV stream in background:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`Background processing error for ${processingId}:`, error);
    throw error;
  }
};

// Bulk import clients via CSV
const importClientsCSV = async (req, res) => {
  try {
    // Validate environment configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables:', {
        cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: !!process.env.CLOUDINARY_API_KEY,
        apiSecret: !!process.env.CLOUDINARY_API_SECRET
      });
      return res.status(500).json({
        success: false,
        message: 'Server configuration error - Cloudinary not properly configured',
        error: 'Missing required environment variables'
      });
    }

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

    console.log('Processing CSV upload:', {
      filename: req.file.originalname,
      cloudinaryUrl: req.file.path,
      publicId: req.file.filename,
      size: req.file.size
    });

    // Validate file size
    if (req.file.size === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty',
        details: {
          fileSize: req.file.size,
          fileName: req.file.originalname
        }
      });
    }

    if (req.file.size < 10) {
      return res.status(400).json({
        success: false,
        message: 'CSV file appears to be too small or corrupted',
        details: {
          fileSize: req.file.size,
          fileName: req.file.originalname
        }
      });
    }

    const results = [];
    const errors = [];
    let lineNumber = 1;

    try {
      console.log('Downloading CSV from Cloudinary:', req.file.path);
      console.log('Request environment:', process.env.NODE_ENV);
      
      // Return immediate response for production to avoid timeout
      if (process.env.NODE_ENV === 'production') {
        // Send immediate response
        res.status(200).json({
          success: true,
          message: 'CSV import started and processing in background',
          data: {
            status: 'processing',
            agentId: req.params.agentId,
            filename: req.file.originalname
          }
        });
      }
      
      console.log('Cloudinary config status:', {
        cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: !!process.env.CLOUDINARY_API_KEY,
        apiSecret: !!process.env.CLOUDINARY_API_SECRET
      });
      
      const response = await axios.get(req.file.path, {
        responseType: 'stream',
        timeout: process.env.NODE_ENV === 'production' ? 120000 : 60000, // 2 minutes in production
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BOD-Platform/1.0)',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });

      if (!response.data) {
        throw new Error('Failed to download CSV file from Cloudinary');
      }

      // Use Promise.race to handle timeout issues
      console.log('Starting Promise.race for CSV processing...');
      const startTime = Date.now();
      
      const result = await Promise.race([
        new Promise((resolve, reject) => {
          let hasResolved = false;
          
          console.log('CSV processing Promise started');
          
          response.data
            .pipe(csv())
            .on('data', (data) => {
              if (hasResolved) return; // Prevent processing if already resolved
              
              lineNumber++;
              try {
                console.log(`Processing line ${lineNumber}:`, data); // Debug log
                
                // Skip empty rows
                if (!data.name && !data.email && !data.phone) {
                  console.log(`Skipping empty row at line ${lineNumber}`);
                  return;
                }

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
              console.error('Error processing CSV row:', error);
              errors.push({
                line: lineNumber,
                error: error.message,
                data
              });
            }
          })
          .on('end', async () => {
            try {
              console.log(`CSV parsing completed. Found ${results.length} valid entries, ${errors.length} errors`);
              
              // Check if no valid data was found
              if (results.length === 0 && errors.length === 0) {
                resolve({
                  success: false,
                  message: 'CSV file appears to be empty or has no valid data',
                  data: {
                    imported: 0,
                    skipped: 0,
                    errors: 0,
                    errorDetails: ['No valid rows found in CSV file']
                  }
                });
                return;
              }
              
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
                  console.error('Error saving client:', error);
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

              console.log(`Import completed: ${successCount} imported, ${skipCount} skipped, ${errors.length} errors`);

              if (!hasResolved) {
                hasResolved = true;
                const processingTime = Date.now() - startTime;
                console.log(`Resolving Promise after ${processingTime}ms`);
                resolve({
                  success: true,
                  data: {
                    imported: successCount,
                    skipped: skipCount,
                    errors: errors.length,
                    errorDetails: errors
                  },
                  message: `Successfully imported ${successCount} clients. ${skipCount} skipped (duplicates). ${errors.length} errors.`
                });
              } else {
                console.log('Promise already resolved, skipping duplicate resolution');
              }
            } catch (error) {
              if (!hasResolved) {
                hasResolved = true;
                console.error('Error processing CSV data:', error);
                reject(error);
              }
            }
          })
          .on('error', (error) => {
            if (!hasResolved) {
              hasResolved = true;
              console.error('Error reading CSV stream:', error);
              reject(error);
            }
          });
        }),
        // Timeout after 30 seconds for production compatibility
        new Promise((_, reject) => {
          console.log('Setting up 30-second timeout for production...');
          setTimeout(() => {
            console.log('Promise timeout reached - rejecting');
            reject(new Error('CSV processing timeout - request took too long'));
          }, 30000); // 30 seconds instead of 3 minutes
        })
      ]).catch((error) => {
        console.error('Promise.race caught error:', error);
        // If it's a timeout, we should still return success if data was processed
        if (error.message.includes('timeout') && results.length > 0) {
          console.log('Timeout occurred but data was processed, returning success response');
          return {
            success: true,
            data: {
              imported: results.length,
              skipped: 0,
              errors: 0,
              errorDetails: []
            },
            message: `Processing completed but response timed out. ${results.length} entries were processed.`,
            warning: 'Request timed out but data processing may have completed'
          };
        }
        throw error;
      });

      console.log('Promise.race resolved successfully');
      // Send successful response after Promise resolves (only in development)
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json(result);
      }
      
      console.log('Production background processing completed:', result);
    } catch (downloadError) {
      console.error('Error downloading CSV from Cloudinary:', {
        message: downloadError.message,
        status: downloadError.response?.status,
        statusText: downloadError.response?.statusText,
        cloudinaryUrl: req.file?.path,
        headers: downloadError.response?.headers
      });
      
      // Only return error response if we haven't sent one already (development)
      if (process.env.NODE_ENV !== 'production') {
        return res.status(500).json({
          success: false,
          message: 'Failed to download CSV file from storage',
          error: downloadError.message,
          details: {
            fileReceived: !!req.file,
            hasCloudinaryUrl: !!req.file?.path,
            httpStatus: downloadError.response?.status,
            errorType: 'cloudinary_download_failed'
          }
        });
      } else {
        console.error('Production error after response sent:', downloadError.message);
      }
    }
  } catch (error) {
    console.error('Error importing clients:', error);
    console.error('Error stack:', error.stack);
    console.error('Environment check:', {
      cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: !!process.env.CLOUDINARY_API_KEY,
      apiSecret: !!process.env.CLOUDINARY_API_SECRET,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Only return error response if we haven't sent one already
    if (process.env.NODE_ENV !== 'production') {
      res.status(500).json({
        success: false,
        message: 'Failed to import clients',
        error: error.message,
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      console.error('Production error after response sent:', error.message);
    }
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
