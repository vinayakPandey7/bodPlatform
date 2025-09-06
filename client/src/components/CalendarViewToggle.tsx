"use client";
import React from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Calendar, List } from "lucide-react";

interface CalendarViewToggleProps {
  view: "calendar" | "list";
  onViewChange: (view: "calendar" | "list") => void;
}

const CalendarViewToggle: React.FC<CalendarViewToggleProps> = ({
  view,
  onViewChange,
}) => {
  return (
    <Box>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(_, newView) => newView && onViewChange(newView)}
        aria-label="view toggle"
        size="small"
      >
        <ToggleButton value="calendar" aria-label="calendar view">
          <Calendar size={16} />
          <Box ml={1}>Calendar</Box>
        </ToggleButton>
        <ToggleButton value="list" aria-label="list view">
          <List size={16} />
          <Box ml={1}>List</Box>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default CalendarViewToggle;
