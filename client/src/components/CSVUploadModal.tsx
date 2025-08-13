"use client";
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  FilePresent as FilePresentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  joinedDate: string;
  lastPayment: string;
  feedback: any[];
}

interface CSVRow {
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate?: string;
  lastPayment?: string;
}

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (clients: Omit<Client, '_id' | 'feedback'>[]) => Promise<void>;
  agentName?: string;
}

const CSV_TEMPLATE_HEADERS = [
  "name",
  "email", 
  "phone",
  "address",
  "joinedDate",
  "lastPayment"
];

const SAMPLE_CSV_DATA = [
  ["John Doe", "john.doe@email.com", "+1-555-0101", "123 Main St, New York, NY 10001", "2024-01-15", "2024-01-01"],
  ["Jane Smith", "jane.smith@email.com", "+1-555-0102", "456 Oak Ave, Los Angeles, CA 90210", "2024-02-20", "2024-02-01"],
  ["Bob Johnson", "bob.johnson@email.com", "+1-555-0103", "789 Pine Rd, Chicago, IL 60601", "2024-03-05", "2024-03-01"]
];

export default function CSVUploadModal({
  open,
  onClose,
  onUpload,
  agentName,
}: CSVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');

  const downloadTemplate = () => {
    const csvContent = [
      CSV_TEMPLATE_HEADERS,
      ...SAMPLE_CSV_DATA
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "client_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const validateCSVData = (data: any[]): { valid: CSVRow[], errors: string[] } => {
    const validData: CSVRow[] = [];
    const validationErrors: string[] = [];
    
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      
      // Check required fields
      if (!row.name || !row.email || !row.phone || !row.address) {
        validationErrors.push(`Row ${rowNumber}: Missing required fields (name, email, phone, address)`);
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        validationErrors.push(`Row ${rowNumber}: Invalid email format`);
        return;
      }
      
      // Validate phone format
      const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(row.phone)) {
        validationErrors.push(`Row ${rowNumber}: Invalid phone format`);
        return;
      }
      
      validData.push({
        name: row.name.trim(),
        email: row.email.trim().toLowerCase(),
        phone: row.phone.trim(),
        address: row.address.trim(),
        joinedDate: row.joinedDate || new Date().toISOString().split('T')[0],
        lastPayment: row.lastPayment || new Date().toISOString().split('T')[0],
      });
    });
    
    return { valid: validData, errors: validationErrors };
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (!csvFile) return;
    
    setFile(csvFile);
    setErrors([]);
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const { valid, errors } = validateCSVData(results.data);
        setParsedData(valid);
        setErrors(errors);
        
        if (valid.length > 0) {
          setStep('preview');
        }
      },
      error: (error: any) => {
        setErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    
    try {
      setLoading(true);
      
      const clientsToUpload = parsedData.map(row => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        isActive: true,
        joinedDate: row.joinedDate || new Date().toISOString().split('T')[0],
        lastPayment: row.lastPayment || new Date().toISOString().split('T')[0],
      }));
      
      await onUpload(clientsToUpload);
      setStep('success');
    } catch (error) {
      setErrors([`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setStep('upload');
    onClose();
  };

  const renderUploadStep = () => (
    <>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            size="small"
          >
            Download CSV Template
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Download the template to see the required format for client data.
          </Typography>
        </Box>

        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            border: 2,
            borderStyle: 'dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop the CSV file here' : 'Drag & drop CSV file here'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select a file
          </Typography>
        </Paper>

        {errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">
              <Typography variant="subtitle2" gutterBottom>
                Validation Errors:
              </Typography>
              <List dense>
                {errors.map((error, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </>
  );

  const renderPreviewStep = () => (
    <>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Preview Data ({parsedData.length} clients)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review the data before importing to {agentName || 'the agent'}'s client list.
          </Typography>
        </Box>

        {errors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {errors.length} rows were skipped due to validation errors:
            </Typography>
            <List dense>
              {errors.slice(0, 5).map((error, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
              {errors.length > 5 && (
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary={`... and ${errors.length - 5} more errors`} />
                </ListItem>
              )}
            </List>
          </Alert>
        )}

        <Paper sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'grey.200' }}>
          <List dense>
            {parsedData.slice(0, 10).map((client, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2">{client.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.email} • {client.phone}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {client.address}
                    </Typography>
                  </Box>
                </ListItem>
                {index < Math.min(parsedData.length - 1, 9) && <Divider />}
              </React.Fragment>
            ))}
          </List>
          {parsedData.length > 10 && (
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">
                ... and {parsedData.length - 10} more clients
              </Typography>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setStep('upload')}>Back</Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading || parsedData.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          Import {parsedData.length} Clients
        </Button>
      </DialogActions>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Import Successful!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {parsedData.length} clients have been successfully imported to {agentName || 'the agent'}'s portfolio.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: "90vh" }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <FilePresentIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6">
              Import Clients from CSV
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {step === 'upload' && renderUploadStep()}
      {step === 'preview' && renderPreviewStep()}
      {step === 'success' && renderSuccessStep()}
    </Dialog>
  );
} 