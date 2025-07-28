import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  FormHelperText,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  error: externalError,
  helperText: externalHelperText,
  label = "Phone Number",
  required = false,
  fullWidth = true,
  disabled = false,
  placeholder = "(555) 123-4567",
}) => {
  const [internalError, setInternalError] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, "");

    // Limit to 10 digits (US phone number without country code)
    const limitedValue = numericValue.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (limitedValue.length === 0) {
      return "";
    } else if (limitedValue.length <= 3) {
      return `(${limitedValue}`;
    } else if (limitedValue.length <= 6) {
      return `(${limitedValue.slice(0, 3)}) ${limitedValue.slice(3)}`;
    } else {
      return `(${limitedValue.slice(0, 3)}) ${limitedValue.slice(3, 6)}-${limitedValue.slice(6)}`;
    }
  };

  // Validate US phone number
  const validatePhoneNumber = (
    value: string
  ): { valid: boolean | null; error: string } => {
    const numericValue = value.replace(/\D/g, "");

    if (numericValue.length === 0) {
      return { valid: null, error: "" };
    }

    if (numericValue.length !== 10) {
      return { valid: false, error: "Phone number must be 10 digits" };
    }

    // Check if first digit is valid (2-9)
    if (numericValue[0] < "2") {
      return { valid: false, error: "Area code must start with 2-9" };
    }

    // Check if fourth digit is valid (2-9) - first digit of exchange code
    if (numericValue[3] < "2") {
      return { valid: false, error: "Exchange code must start with 2-9" };
    }

    return { valid: true, error: "" };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    // Count non-numeric characters before cursor
    const nonNumericBeforeCursor = inputValue.slice(0, cursorPosition).replace(/\d/g, '').length;
    const numericBeforeCursor = cursorPosition - nonNumericBeforeCursor;
    
    // Format the number
    const formattedValue = formatPhoneNumber(inputValue);
    const validation = validatePhoneNumber(formattedValue);

    // Update the form
    onChange(formattedValue);
    setIsValid(validation.valid);
    setInternalError(validation.error);

    // Restore cursor position after formatting
    setTimeout(() => {
      const input = e.target;
      if (input) {
        // Count non-numeric characters in formatted value up to the numeric position
        const numericValue = formattedValue.replace(/\D/g, '');
        const targetNumericPosition = Math.min(numericBeforeCursor, numericValue.length);
        
        let newPosition = 0;
        let numericCount = 0;
        
        for (let i = 0; i < formattedValue.length; i++) {
          if (/\d/.test(formattedValue[i])) {
            numericCount++;
            if (numericCount > targetNumericPosition) {
              break;
            }
          }
          newPosition = i + 1;
        }
        
        // Ensure cursor position is within bounds
        newPosition = Math.min(newPosition, formattedValue.length);
        
        input.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Get the numeric value for form submission
  const getNumericValue = (): string => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue.length === 10 ? `+1${numericValue}` : "";
  };

  // Determine if there's an error
  const hasError = Boolean(externalError || (internalError && isValid === false));
  const errorMessage: string | undefined =
    externalHelperText || internalError || undefined;

  return (
    <Box>
      <TextField
        type="tel"
        label={label}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        error={hasError}
        required={required}
        fullWidth={fullWidth}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  +1
                </Typography>
              </Box>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isValid === true && (
                <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
              )}
              {isValid === false && (
                <CancelIcon sx={{ color: "error.main", fontSize: 20 }} />
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor:
              isValid === true
                ? "success.50"
                : isValid === false
                ? "error.50"
                : "background.paper",
            "&.Mui-focused": {
              borderColor:
                isValid === true
                  ? "success.main"
                  : isValid === false
                  ? "error.main"
                  : "primary.main",
            },
          },
          "& .MuiInputBase-input": {
            fontFamily: "monospace",
            fontSize: "1rem",
            letterSpacing: "0.05em",
          },
        }}
      />

      {errorMessage && errorMessage !== "" && (
        <FormHelperText
          error
          sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <CancelIcon sx={{ fontSize: 16 }} />
          {errorMessage}
        </FormHelperText>
      )}

      {isValid && (
        <FormHelperText
          sx={{
            mt: 1,
            color: "success.main",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 16 }} />
          Valid US phone number
        </FormHelperText>
      )}
    </Box>
  );
};

export default PhoneNumberInput;
