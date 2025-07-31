"use client";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import api from "@/lib/api";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/PhoneNumberInput";

interface ClientFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  industry: string;
  companySize: string;
  contractValue: string;
  contractStartDate: string;
  contractEndDate: string;
  paymentTerms: string;
  status: string;
  notes: string;
}

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: any; // For editing existing client
  onSuccess: () => void;
}

// Validation schema
const ClientValidationSchema = Yup.object().shape({
  companyName: Yup.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters")
    .required("Company name is required"),
  contactPerson: Yup.string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(100, "Contact person name must be less than 100 characters")
    .required("Contact person is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number")
    .required("Phone number is required"),
  address: Yup.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters")
    .required("Address is required"),
  city: Yup.string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters")
    .required("City is required"),
  state: Yup.string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be less than 50 characters")
    .required("State is required"),
  zipcode: Yup.string()
    .matches(/^\d{5}$/, "Zipcode must be 5 digits")
    .required("Zipcode is required"),
  industry: Yup.string().required("Industry is required"),
  companySize: Yup.string().required("Company size is required"),
  contractValue: Yup.number()
    .min(1000, "Contract value must be at least $1,000")
    .max(10000000, "Contract value must be less than $10,000,000")
    .required("Contract value is required"),
  contractStartDate: Yup.date().required("Contract start date is required"),
  contractEndDate: Yup.date()
    .min(Yup.ref("contractStartDate"), "End date must be after start date")
    .required("Contract end date is required"),
  paymentTerms: Yup.string().required("Payment terms are required"),
  status: Yup.string().required("Status is required"),
  notes: Yup.string().max(500, "Notes must be less than 500 characters"),
});

// Industry options
const industryOptions = [
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
];

// Company size options
const companySizeOptions = [
  "1-10",
  "10-50",
  "50-100",
  "100-500",
  "500-1000",
  "1000+",
];

// Payment terms options
const paymentTermsOptions = [
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Net 90",
  "Due on Receipt",
];

// Status options
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "prospect", label: "Prospect" },
];

export default function ClientModal({
  open,
  onClose,
  client,
  onSuccess,
}: ClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Initial values
  const getInitialValues = (): ClientFormData => {
    if (client) {
      return {
        companyName: client.companyName || "",
        contactPerson: client.contactPerson || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        city: client.city || "",
        state: client.state || "",
        zipcode: client.zipcode || "",
        industry: client.industry || "",
        companySize: client.companySize || "",
        contractValue: client.contractValue?.toString() || "",
        contractStartDate: client.contractStartDate || "",
        contractEndDate: client.contractEndDate || "",
        paymentTerms: client.paymentTerms || "",
        status: client.status || "prospect",
        notes: client.notes || "",
      };
    }

    return {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipcode: "",
      industry: "",
      companySize: "",
      contractValue: "",
      contractStartDate: "",
      contractEndDate: "",
      paymentTerms: "",
      status: "prospect",
      notes: "",
    };
  };

  // Handle zipcode lookup
  const handleZipcodeLookup = async (
    zipcode: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (!zipcode || zipcode.length !== 5) {
      return;
    }

    setLocationLoading(true);
    try {
      const response = await fetch(`/api/location/validate?zipCode=${zipcode}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setFieldValue("city", data.city);
        setFieldValue("state", data.state);
      }
    } catch (error) {
      console.error("Zipcode validation error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (
    values: ClientFormData,
    { setSubmitting, resetForm }: any
  ) => {
    setLoading(true);
    try {
      const clientData = {
        ...values,
        contractValue: parseFloat(values.contractValue),
      };

      if (client) {
        // Edit existing client
        await api.put(`/recruitment-partner/clients/${client._id}`, clientData);
        toast.success("Client updated successfully!");
      } else {
        // Add new client
        await api.post("/recruitment-partner/clients", clientData);
        toast.success("Client added successfully!");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error saving client:", error);
      toast.error(error.response?.data?.message || "Failed to save client");
    } finally {
      setLoading(false);
      setSubmitting(false);
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon sx={{ color: "#3b82f6" }} />
            <Typography variant="h6" component="div">
              {client ? "Edit Client" : "Add New Client"}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={ClientValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          isSubmitting,
        }) => (
          <Form>
            <DialogContent sx={{ pt: 0 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Company Information */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#374151" }}
                >
                  Company Information
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="companyName"
                    label="Company Name *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.companyName && Boolean(errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: (
                        <BusinessIcon sx={{ mr: 1, color: "#9ca3af" }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="contactPerson"
                    label="Contact Person *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={
                      touched.contactPerson && Boolean(errors.contactPerson)
                    }
                    helperText={touched.contactPerson && errors.contactPerson}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: "#9ca3af" }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email *"
                    type="email"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: "#9ca3af" }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <PhoneNumberInput
                    label="Phone *"
                    value={values.phone}
                    onChange={(value) => setFieldValue("phone", value)}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={
                      touched.phone && errors.phone ? errors.phone : undefined
                    }
                    required
                  />
                </Box>

                {/* Location Information */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#374151", mt: 2 }}
                >
                  Location Information
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="zipcode"
                    label="Zipcode *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.zipcode && Boolean(errors.zipcode)}
                    helperText={touched.zipcode && errors.zipcode}
                    onChange={(e: any) => {
                      handleChange(e);
                      if (e.target.value.length === 5) {
                        handleZipcodeLookup(e.target.value, setFieldValue);
                      }
                    }}
                    onBlur={handleBlur}
                    inputProps={{
                      maxLength: 5,
                      pattern: "\\d{5}",
                    }}
                    InputProps={{
                      startAdornment: (
                        <LocationIcon sx={{ mr: 1, color: "#9ca3af" }} />
                      ),
                      endAdornment: locationLoading && (
                        <CircularProgress size={16} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="address"
                    label="Address *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="city"
                    label="City *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.city && Boolean(errors.city)}
                    helperText={touched.city && errors.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="state"
                    label="State *"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={touched.state && Boolean(errors.state)}
                    helperText={touched.state && errors.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                {/* Business Information */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#374151", mt: 2 }}
                >
                  Business Information
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={touched.industry && Boolean(errors.industry)}
                  >
                    <InputLabel>Industry *</InputLabel>
                    <Field
                      as={Select}
                      name="industry"
                      label="Industry *"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      }}
                    >
                      {industryOptions.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.industry && errors.industry && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {errors.industry}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl
                    fullWidth
                    size="small"
                    error={touched.companySize && Boolean(errors.companySize)}
                  >
                    <InputLabel>Company Size *</InputLabel>
                    <Field
                      as={Select}
                      name="companySize"
                      label="Company Size *"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      }}
                    >
                      {companySizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size} employees
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.companySize && errors.companySize && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {errors.companySize}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* Contract Information */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#374151", mt: 2 }}
                >
                  Contract Information
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="contractValue"
                    label="Contract Value *"
                    type="number"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={
                      touched.contractValue && Boolean(errors.contractValue)
                    }
                    helperText={touched.contractValue && errors.contractValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: (
                        <MoneyIcon sx={{ mr: 1, color: "#9ca3af" }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <FormControl
                    fullWidth
                    size="small"
                    error={touched.paymentTerms && Boolean(errors.paymentTerms)}
                  >
                    <InputLabel>Payment Terms *</InputLabel>
                    <Field
                      as={Select}
                      name="paymentTerms"
                      label="Payment Terms *"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      }}
                    >
                      {paymentTermsOptions.map((terms) => (
                        <MenuItem key={terms} value={terms}>
                          {terms}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.paymentTerms && errors.paymentTerms && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {errors.paymentTerms}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field
                    as={TextField}
                    name="contractStartDate"
                    label="Contract Start Date *"
                    type="date"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={
                      touched.contractStartDate &&
                      Boolean(errors.contractStartDate)
                    }
                    helperText={
                      touched.contractStartDate && errors.contractStartDate
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: (
                        <CalendarToday sx={{ mr: 1, color: "#9ca3af" }} />
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />

                  <Field
                    as={TextField}
                    name="contractEndDate"
                    label="Contract End Date *"
                    type="date"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={
                      touched.contractEndDate && Boolean(errors.contractEndDate)
                    }
                    helperText={
                      touched.contractEndDate && errors.contractEndDate
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      startAdornment: (
                        <CalendarToday sx={{ mr: 1, color: "#9ca3af" }} />
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "white",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>

                <FormControl
                  fullWidth
                  size="small"
                  error={touched.status && Boolean(errors.status)}
                >
                  <InputLabel>Status *</InputLabel>
                  <Field
                    as={Select}
                    name="status"
                    label="Status *"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontSize: "16px",
                    }}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Field>
                  {touched.status && errors.status && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {errors.status}
                    </Typography>
                  )}
                </FormControl>

                {/* Additional Notes */}
                <Field
                  as={TextField}
                  name="notes"
                  label="Additional Notes"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={touched.notes && Boolean(errors.notes)}
                  helperText={touched.notes && errors.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputProps={{
                    startAdornment: (
                      <DescriptionIcon sx={{ mr: 1, color: "#9ca3af" }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontSize: "16px",
                    },
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || isSubmitting}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                sx={{
                  bgcolor: "#3b82f6",
                  "&:hover": { bgcolor: "#2563eb" },
                }}
              >
                {loading
                  ? "Saving..."
                  : client
                  ? "Update Client"
                  : "Add Client"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
