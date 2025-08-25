# Multiple Slots Per Day - Enhanced Feature

## Overview
Employers can now create multiple availability slots for the same day, allowing for flexible scheduling and better interview management.

## Key Features

### 1. Multiple Time Slots Per Day
- Employers can set multiple interview slots for any given day
- Each slot can have different durations, meeting types, and settings
- Non-overlapping time validation ensures no conflicts

### 2. Enhanced UI Support
- **EmployerDaySchedule Component**: Shows all available time slots for a day (9 AM - 6 PM in 30-minute intervals)
- **Visual Indicators**: Different colors for available, booked, and cancelled slots
- **Easy Slot Creation**: Click on any available time to create a new slot

### 3. Backend Enhancements

#### New API Endpoints
```
GET /api/availability/day/:date - Get all slots for a specific day
POST /api/availability/bulk - Create multiple slots at once
```

#### Enhanced Validation
- Overlap detection: Prevents creating slots that overlap with existing ones
- Time validation: Ensures start time is before end time
- Conflict reporting: Returns detailed information about any conflicts

## Usage Examples

### Creating Multiple Slots for a Day

#### Frontend Usage
```javascript
// Employer can click on multiple time slots in the day schedule
// Each click creates a new availability slot for that time

// Example: Creating slots for 10:00 AM, 2:00 PM, and 4:00 PM on the same day
const slotsToCreate = [
  {
    startTime: "10:00",
    endTime: "11:00", 
    title: "Senior Developer Interview",
    meetingType: "video"
  },
  {
    startTime: "14:00",
    endTime: "15:00",
    title: "Technical Assessment", 
    meetingType: "video"
  },
  {
    startTime: "16:00",
    endTime: "17:00",
    title: "Final Round Interview",
    meetingType: "in-person"
  }
];
```

#### Backend API Usage
```javascript
// Bulk create multiple slots
POST /api/availability/bulk
{
  "date": "2025-08-26",
  "timeSlots": [
    {
      "startTime": "10:00",
      "endTime": "11:00",
      "title": "Senior Developer Interview",
      "meetingType": "video",
      "duration": 60
    },
    {
      "startTime": "14:00", 
      "endTime": "15:00",
      "title": "Technical Assessment",
      "meetingType": "video",
      "duration": 60
    }
  ],
  "defaultSettings": {
    "timezone": "America/New_York",
    "maxBookings": 1,
    "meetingDetails": {
      "videoLink": "https://meet.google.com/company-room"
    }
  }
}
```

### Day Schedule View
```javascript
// Get complete schedule for a day
GET /api/availability/day/2025-08-26

// Response includes:
{
  "success": true,
  "date": "2025-08-26",
  "slots": [...], // All existing slots
  "timeGrid": [   // Complete time grid with availability
    {
      "time": "09:00",
      "slot": null,
      "available": true
    },
    {
      "time": "09:30", 
      "slot": null,
      "available": true
    },
    {
      "time": "10:00",
      "slot": { /* existing slot data */ },
      "available": false
    }
    // ... continues for all time slots
  ]
}
```

## UI Components

### 1. EmployerDaySchedule Component
- Displays all possible time slots for a day
- Color-coded status indicators:
  - **Blue**: Available time (can create slot)
  - **Green**: Slot available for booking
  - **Orange**: Slot booked by candidate
  - **Red**: Slot cancelled
- Click any time to create/edit slots

### 2. Enhanced CalendarGrid
- Shows days with multiple slots
- Indicator badges showing number of slots per day
- Better visual representation of busy days

## Benefits

### For Employers
1. **Flexible Scheduling**: Set multiple interview times per day
2. **Better Time Management**: See complete day schedule at a glance
3. **Efficient Booking**: Batch create multiple slots quickly
4. **No Conflicts**: Automatic overlap detection prevents double-booking

### For Candidates  
1. **More Options**: Multiple time slots to choose from on preferred days
2. **Better Availability**: Higher chance of finding suitable interview times
3. **Flexible Timing**: Can select from various time slots on the same day

## Implementation Details

### Database Schema
- Each slot is stored as a separate document
- Compound index on `(employer, date, startTime)` for efficient queries
- Status tracking for each individual slot

### Validation Rules
1. **No Overlaps**: New slots cannot overlap with existing ones
2. **Time Logic**: Start time must be before end time  
3. **Future Dates**: Cannot create slots for past dates
4. **Business Hours**: Recommended time slots between 9 AM - 6 PM

### Error Handling
- Detailed conflict reporting
- Bulk operation results (success/failure counts)
- User-friendly error messages
- Graceful degradation for partial failures

## Migration Notes
- Existing single-slot-per-day functionality remains unchanged
- New features are additive and backward compatible
- No breaking changes to existing API endpoints
