import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
} from "@mui/material";

interface SalesClient {
  _id: string;
  name: string;
  callStatus: "not_called" | "called" | "skipped" | "unpicked";
}

interface SalesRemark {
  callOutcome:
    | "answered"
    | "no_answer"
    | "callback_requested"
    | "not_interested"
    | "interested";
}

interface StatusForm {
  callStatus: SalesClient["callStatus"];
  remarks: string;
  callOutcome: SalesRemark["callOutcome"];
}

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  client: SalesClient | null;
  statusForm: StatusForm;
  onStatusFormChange: (form: StatusForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  open,
  onClose,
  client,
  statusForm,
  onStatusFormChange,
  onSubmit,
  loading = false,
}) => {
  const handleFieldChange = (field: keyof StatusForm, value: any) => {
    onStatusFormChange({
      ...statusForm,
      [field]: value,
    });
  };

  const showCallOutcome =
    statusForm.callStatus === "called" || statusForm.callStatus === "unpicked";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start", // Align to top to provide more space
          paddingTop: "10vh",
        },
      }}
    >
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            Update Call Status
          </Typography>
          {client && (
            <Typography variant="body2" color="text.secondary">
              {client.name}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="call-status-label">Call Status</InputLabel>
              <Select
                labelId="call-status-label"
                value={statusForm.callStatus}
                label="Call Status"
                onChange={(e) =>
                  handleFieldChange("callStatus", e.target.value)
                }
                MenuProps={{
                  disablePortal: true,
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      mt: 1,
                      zIndex: 9999,
                      "& .MuiMenuItem-root": {
                        px: 2,
                        py: 1.5,
                      },
                    },
                  },
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                }}
              >
                <MenuItem value="not_called">Not Called</MenuItem>
                <MenuItem value="called">Called</MenuItem>
                <MenuItem value="skipped">Skipped</MenuItem>
                <MenuItem value="unpicked">Unpicked</MenuItem>
              </Select>
            </FormControl>

            {showCallOutcome && (
              <FormControl fullWidth>
                <InputLabel
                  id="call-outcome-label"
                  sx={{
                    backgroundColor: "white",
                    px: 1,
                    "&.MuiInputLabel-shrink": {
                      backgroundColor: "white",
                      px: 1,
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                    },
                  }}
                >
                  Call Outcome
                </InputLabel>
                <Select
                  labelId="call-outcome-label"
                  value={statusForm.callOutcome}
                  label="Call Outcome"
                  onChange={(e) =>
                    handleFieldChange("callOutcome", e.target.value)
                  }
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        maxHeight: 200,
                        mt: 1,
                        zIndex: 9999,
                        "& .MuiMenuItem-root": {
                          px: 2,
                          py: 1.5,
                        },
                      },
                    },
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                  }}
                >
                  <MenuItem value="answered">Answered</MenuItem>
                  <MenuItem value="no_answer">No Answer</MenuItem>
                  <MenuItem value="callback_requested">
                    Callback Requested
                  </MenuItem>
                  <MenuItem value="not_interested">Not Interested</MenuItem>
                  <MenuItem value="interested">Interested</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField
              label="Remarks (Optional)"
              multiline
              rows={3}
              value={statusForm.remarks}
              onChange={(e) => handleFieldChange("remarks", e.target.value)}
              placeholder="Add any notes about this call..."
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  backgroundColor: "white",
                  px: 1,
                  "&.MuiInputLabel-shrink": {
                    backgroundColor: "white",
                    px: 1,
                  },
                  "&.Mui-focused": {
                    backgroundColor: "white",
                  },
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            sx={{
              minWidth: 100,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              minWidth: 150,
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#4F46E5",
              "&:hover": {
                backgroundColor: "#4338CA",
              },
            }}
          >
            {loading ? "UPDATING..." : "UPDATE STATUS"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
