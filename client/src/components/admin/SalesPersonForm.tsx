import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PhoneNumberInput from '@/components/PhoneNumberInput';

interface SalesPerson {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  assignedAgents: any[];
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface SalesPersonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  editingPerson?: SalesPerson | null;
  formData: FormData;
  onFormDataChange: (field: keyof FormData, value: string) => void;
}

const SalesPersonForm: React.FC<SalesPersonFormProps> = ({
  open,
  onClose,
  onSubmit,
  editingPerson,
  formData,
  onFormDataChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleFieldChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFormDataChange(field, e.target.value);
  }, [onFormDataChange]);

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&:hover fieldset': {
        borderColor: '#3b82f6',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3b82f6',
        borderWidth: 2,
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 0,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        {editingPerson ? "Edit Sales Person" : "Add Sales Person"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={formData.name}
              onChange={handleFieldChange('name')}
              required
              sx={textFieldSx}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              value={formData.email}
              onChange={handleFieldChange('email')}
              required
              sx={textFieldSx}
              disabled={Boolean(editingPerson)}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleFieldChange('password')}
              required={!editingPerson}
              placeholder={editingPerson ? "Leave blank to keep current password" : "Enter password"}
              sx={textFieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{
                        color: '#6b7280',
                        '&:hover': {
                          color: '#374151',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <PhoneNumberInput
              label="Phone"
              value={formData.phone}
              onChange={(value) => onFormDataChange('phone', value)}
              required
              className="!py-5"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            borderColor: '#d1d5db',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f9fafb',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          onClick={handleSubmit}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: '#2563eb',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          }}
        >
          {editingPerson ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SalesPersonForm;