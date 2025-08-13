"use client";
import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/PhoneNumberInput";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  joinedDate: string;
  lastPayment: string;
  feedback: ClientFeedback[];
}

interface ClientFeedback {
  _id: string;
  message: string;
  addedBy: string;
  addedAt: string;
  type: "positive" | "negative" | "neutral" | "important";
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface InsuranceClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSubmit: (data: ClientFormData, isEdit: boolean) => Promise<void>;
}

// Validation schema
const ClientValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .required("Phone is required"),
  address: Yup.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters")
    .required("Address is required"),
});

export default function InsuranceClientModal({
  open,
  onClose,
  client,
  onSubmit,
}: InsuranceClientModalProps) {
  const [loading, setLoading] = React.useState(false);

  const initialValues: ClientFormData = {
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
  };

  const handleSubmit = async (values: ClientFormData) => {
    try {
      setLoading(true);
      await onSubmit(values, !!client);
      onClose();
      toast.success(client ? "Client updated successfully" : "Client added successfully");
    } catch (error) {
      toast.error("Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" component="div">
              {client ? "Edit Client" : "Add New Client"}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={ClientValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <PhoneNumberInput
                  label="Phone Number"
                  value={values.phone}
                  onChange={(value) => setFieldValue('phone', value)}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone ? errors.phone : undefined}
                  disabled={loading}
                  className="!py-5"
                />

                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={3}
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon sx={{ color: "action.active", alignSelf: "flex-start", mt: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={handleClose}
                disabled={loading}
                variant="outlined"
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                startIcon={loading && <CircularProgress size={16} />}
              >
                {client ? "Update Client" : "Add Client"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
} 