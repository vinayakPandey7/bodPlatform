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
  onUpload: (file: File) => Promise<void>;
  agentName?: string;
  agentId?: string;
}

const CSV_TEMPLATE_HEADERS = [
  "name",
  "email", 
  "phone",
  "address",
  "status",
  "notes"
];

const SAMPLE_CSV_DATA = [
  ["John Smith", "john.smith@email.com", "+1-555-1001", "123 Main Street New York NY 10001", "pending", "New lead from website inquiry"],
  ["Sarah Johnson", "sarah.johnson@email.com", "+1-555-1002", "456 Oak Avenue Los Angeles CA 90210", "contacted", "Interested in life insurance policy"],
  ["Michael Brown", "michael.brown@email.com", "+1-555-1003", "789 Pine Road Chicago IL 60601", "converted", "Purchased family health plan"],
  ["Emily Davis", "emily.davis@email.com", "+1-555-1004", "321 Elm Street Miami FL 33101", "pending", "Referral from existing client"],
  ["David Wilson", "david.wilson@email.com", "+1-555-1005", "654 Maple Lane Houston TX 77001", "contacted", "Scheduled follow-up meeting"],
  ["Lisa Anderson", "lisa.anderson@email.com", "+1-555-1006", "987 Cedar Drive Phoenix AZ 85001", "declined", "Not interested at this time"],
  ["Robert Taylor", "robert.taylor@email.com", "+1-555-1007", "147 Birch Boulevard Denver CO 80201", "converted", "Auto insurance policy active"],
  ["Jennifer Martinez", "jennifer.martinez@email.com", "+1-555-1008", "258 Spruce Street Seattle WA 98101", "pending", "Needs home insurance quote"],
  ["Christopher Lee", "christopher.lee@email.com", "+1-555-1009", "369 Willow Way Boston MA 02101", "contacted", "Comparing different plans"],
  ["Amanda White", "amanda.white@email.com", "+1-555-1010", "741 Ash Court Atlanta GA 30301", "converted", "Business insurance package"],
  ["James Thompson", "james.thompson@email.com", "+1-555-1011", "852 Hickory Hill Portland OR 97201", "pending", "Young professional seeking coverage"],
  ["Mary Garcia", "mary.garcia@email.com", "+1-555-1012", "963 Dogwood Drive Nashville TN 37201", "contacted", "Health insurance for family"],
  ["Daniel Rodriguez", "daniel.rodriguez@email.com", "+1-555-1013", "159 Magnolia Street Dallas TX 75201", "declined", "Found better rates elsewhere"],
  ["Jessica Martinez", "jessica.martinez@email.com", "+1-555-1014", "357 Cherry Lane San Francisco CA 94101", "converted", "Comprehensive auto policy"],
  ["Matthew Hernandez", "matthew.hernandez@email.com", "+1-555-1015", "468 Peach Place Orlando FL 32801", "pending", "First time insurance buyer"]
];

export default function CSVUploadModal({
  open,
  onClose,
  onUpload,
  agentName,
  agentId,
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
    if (!file || parsedData.length === 0) return;
    
    try {
      setLoading(true);
      
      await onUpload(file);
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