"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import api from "@/lib/api";

interface Note {
  _id: string;
  note: string; // Changed from noteText to note
  addedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  addedByName: string; // Added this field
  interviewRound: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  applicationId: string;
  candidateName: string;
  onNotesUpdate?: () => void;
}

export default function NotesModal({
  isOpen,
  onClose,
  candidateId,
  applicationId,
  candidateName,
  onNotesUpdate,
}: NotesModalProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    noteText: "",
    interviewRound: "general",
    rating: 0,
  });

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, candidateId, applicationId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/employer/candidates/${candidateId}/applications/${applicationId}/notes`
      );
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    try {
      if (!formData.noteText.trim()) return;

      await api.post(
        `/employer/candidates/${candidateId}/applications/${applicationId}/notes`,
        {
          noteText: formData.noteText,
          interviewRound: formData.interviewRound,
          rating: formData.rating > 0 ? formData.rating : null,
        }
      );

      setFormData({ noteText: "", interviewRound: "other", rating: 0 });
      setShowAddForm(false);
      fetchNotes();
      onNotesUpdate?.();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleEditNote = async () => {
    try {
      if (!editingNote || !formData.noteText.trim()) return;

      await api.put(
        `/employer/candidates/${candidateId}/applications/${applicationId}/notes/${editingNote._id}`,
        {
          noteText: formData.noteText,
          interviewRound: formData.interviewRound,
          rating: formData.rating > 0 ? formData.rating : null,
        }
      );

      setEditingNote(null);
      setFormData({ noteText: "", interviewRound: "other", rating: 0 });
      fetchNotes();
      onNotesUpdate?.();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      if (!confirm("Are you sure you want to delete this note?")) return;

      await api.delete(
        `/employer/candidates/${candidateId}/applications/${applicationId}/notes/${noteId}`
      );

      fetchNotes();
      onNotesUpdate?.();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      noteText: note.note, // Changed from note.noteText to note.note
      interviewRound: note.interviewRound,
      rating: note.rating || 0,
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setFormData({ noteText: "", interviewRound: "general", rating: 0 });
    setShowAddForm(false);
  };

  const getInterviewRoundLabel = (round: string) => {
    const labels = {
      initial_review: "Initial Review",
      phone_screening: "Phone Screening",
      phone_interview: "Phone Interview",
      technical_assessment: "Technical Assessment",
      in_person_interview: "In-Person Interview",
      final_interview: "Final Interview",
      background_check: "Background Check",
      reference_check: "Reference Check",
      general: "General",
      other: "Other",
    };
    return labels[round as keyof typeof labels] || round;
  };

  const getInterviewRoundColor = (round: string) => {
    const colors = {
      initial_review: "primary",
      phone_screening: "secondary",
      phone_interview: "info",
      technical_assessment: "warning",
      in_person_interview: "success",
      final_interview: "error",
      background_check: "default",
      reference_check: "default",
      general: "default",
      other: "default",
    };
    return colors[round as keyof typeof colors] || "default";
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Interview Notes - {candidateName}
          </Typography>
          <Button
            startIcon={<Add />}
            onClick={() => setShowAddForm(true)}
            variant="contained"
            size="small"
          >
            Add Note
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <Typography>Loading notes...</Typography>
          </Box>
        ) : (
          <Box>
            {showAddForm && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: 1,
                  borderColor: "grey.300",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {editingNote ? "Edit Note" : "Add New Note"}
                </Typography>

                <TextField
                  label="Note"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.noteText}
                  onChange={(e) =>
                    setFormData({ ...formData, noteText: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />

                <Box display="flex" gap={2} mb={2}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Interview Round</InputLabel>
                    <Select
                      value={formData.interviewRound}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          interviewRound: e.target.value,
                        })
                      }
                      label="Interview Round"
                    >
                      <MenuItem value="initial_review">Initial Review</MenuItem>
                      <MenuItem value="phone_screening">
                        Phone Screening
                      </MenuItem>
                      <MenuItem value="phone_interview">
                        Phone Interview
                      </MenuItem>
                      <MenuItem value="technical_assessment">
                        Technical Assessment
                      </MenuItem>
                      <MenuItem value="in_person_interview">
                        In-Person Interview
                      </MenuItem>
                      <MenuItem value="final_interview">
                        Final Interview
                      </MenuItem>
                      <MenuItem value="background_check">
                        Background Check
                      </MenuItem>
                      <MenuItem value="reference_check">
                        Reference Check
                      </MenuItem>
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography
                      component="legend"
                      variant="body2"
                      sx={{ mb: 1 }}
                    >
                      Rating (Optional)
                    </Typography>
                    <Rating
                      value={formData.rating}
                      onChange={(_, newValue) =>
                        setFormData({ ...formData, rating: newValue || 0 })
                      }
                    />
                  </Box>
                </Box>

                <Box display="flex" gap={1}>
                  <Button
                    onClick={editingNote ? handleEditNote : handleAddNote}
                    variant="contained"
                    size="small"
                    disabled={!formData.noteText.trim()}
                  >
                    {editingNote ? "Update" : "Add"} Note
                  </Button>
                  <Button onClick={cancelEdit} size="small">
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}

            {notes.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No notes added yet. Click "Add Note" to get started.
                </Typography>
              </Box>
            ) : (
              <Box>
                {notes.map((note, index) => (
                  <Box key={note._id}>
                    <Box
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: "grey.200",
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={1}
                      >
                        <Box display="flex" gap={1} alignItems="center">
                          <Chip
                            label={getInterviewRoundLabel(note.interviewRound)}
                            color={
                              getInterviewRoundColor(note.interviewRound) as any
                            }
                            size="small"
                          />
                          {note.rating && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Rating
                                value={note.rating}
                                size="small"
                                readOnly
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ({note.rating}/5)
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => startEdit(note)}
                            sx={{ mr: 1 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNote(note._id)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="body1" paragraph>
                        {note.note}
                      </Typography>

                      <Box
                        display="flex"
                        justifyContent="between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="text.secondary">
                          By{" "}
                          {note.addedByName ||
                            `${note.addedBy.firstName} ${note.addedBy.lastName}`}{" "}
                          • {new Date(note.createdAt).toLocaleDateString()} at{" "}
                          {new Date(note.createdAt).toLocaleTimeString()}
                          {note.updatedAt !== note.createdAt && " (edited)"}
                        </Typography>
                      </Box>
                    </Box>
                    {index < notes.length - 1 && <Divider sx={{ mb: 2 }} />}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
