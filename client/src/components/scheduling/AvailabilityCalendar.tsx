"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { toast } from "sonner";
import CalendlyStyleScheduler from "./CalendlyStyleScheduler";
import SlotModal from "./SlotModal";

interface AvailabilitySlot {
  _id: string;
  employer: {
    _id: string;
    companyName: string;
    ownerName: string;
  };
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone?: string;
  isRecurring?: boolean;
  status: "available" | "booked" | "cancelled";
  maxBookings: number;
  currentBookings: number;
  meetingType: "video" | "phone" | "in-person";
  meetingDetails: {
    location?: string;
    videoLink?: string;
    phoneNumber?: string;
    instructions?: string;
  };
  isActive?: boolean;
}

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
  onCreateSlot: (slotData: any) => Promise<void>;
  onUpdateSlot: (id: string, slotData: any) => Promise<void>;
  onDeleteSlot: (id: string) => Promise<void>;
  loading?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  slots,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  loading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);

  // Debug logging
  React.useEffect(() => {
    console.log('Employer slots data:', slots);
  }, [slots]);

  // Calendar navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());









  return (
    <Box>
      {/* Calendar Header - Calendly Style */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 3,
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={goToPreviousMonth}
            disabled={loading}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            <ChevronLeft sx={{ fontSize: 20 }} />
          </IconButton>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mx: 3,
              minWidth: 200,
              textAlign: "center",
            }}
          >
            {format(currentDate, "MMMM yyyy")}
          </Typography>

          <IconButton
            onClick={goToNextMonth}
            disabled={loading}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            <ChevronRight sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={goToToday}
            disabled={loading}
            sx={{
              borderColor: "grey.300",
              color: "text.primary",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            Today
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedDate(new Date());
              setEditingSlot(null);
              setIsSlotModalOpen(true);
            }}
            disabled={loading}
            sx={{
              backgroundColor: "#006BFF",
              color: "white",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0, 107, 255, 0.2)",
              "&:hover": {
                backgroundColor: "#0056CC",
                boxShadow: "0 4px 12px rgba(0, 107, 255, 0.3)",
              },
            }}
          >
            Add Availability
          </Button>
        </Box>
      </Box>

      {/* Calendly-Style Scheduler for Employers */}
      <CalendlyStyleScheduler
        availableSlots={slots.map(slot => ({
          ...slot,
          employer: {
            _id: 'current-employer',
            companyName: 'Your Company',
            ownerName: 'You'
          }
        }))}
        currentDate={currentDate}
        onCurrentDateChange={setCurrentDate}
        onSlotSelect={(slot) => {
          // Check if this is a new slot (starts with 'new-') or existing slot
          if (slot._id.startsWith('new-')) {
            // Creating a new slot - create a template slot with the selected time
            // Helper function to calculate end time based on start time and duration
            const calculateEndTime = (startTime: string, duration: number): string => {
              const [startHour, startMinute] = startTime.split(':').map(Number);
              const startTotalMinutes = startHour * 60 + startMinute;
              const endTotalMinutes = startTotalMinutes + duration;
              
              const endHour = Math.floor(endTotalMinutes / 60);
              const endMinute = endTotalMinutes % 60;
              
              return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
            };

            const duration = 30;
            const endTime = calculateEndTime(slot.startTime, duration);

            const templateSlot = {
              _id: '',
              employer: {
                _id: 'current-employer',
                companyName: 'Your Company',
                ownerName: 'You'
              },
              title: 'Interview Slot',
              date: slot.date,
              startTime: slot.startTime,
              endTime: endTime,
              duration: duration,
              timezone: 'America/New_York',
              isRecurring: false,
              status: 'available' as const,
              maxBookings: 1,
              currentBookings: 0,
              meetingType: 'video' as const,
              meetingDetails: {},
              isActive: true
            };
            setEditingSlot(templateSlot);
            setSelectedDate(new Date(slot.date));
            setIsSlotModalOpen(true);
          } else {
            // Find the original slot from our slots array by matching the slot properties
            const originalSlot = slots.find(s => 
              s.startTime === slot.startTime && 
              s.date === slot.date && 
              s.title === slot.title
            );
            if (originalSlot) {
              setEditingSlot(originalSlot);
              setSelectedDate(new Date(originalSlot.date));
              setIsSlotModalOpen(true);
            }
          }
        }}
        title="Manage Your Availability"
        showAllSlots={true}
      />



      {/* Slot Creation/Edit Modal */}
      <SlotModal
        open={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        selectedDate={selectedDate}
        editingSlot={editingSlot}
        onCreateSlot={onCreateSlot}
        onUpdateSlot={onUpdateSlot}
        loading={loading}
      />


    </Box>
  );
};



export default AvailabilityCalendar;
