# 📅 Interview Calendar Implementation - BOD Platform

## Overview

The Interview Calendar system is a comprehensive scheduling solution integrated into the BOD Platform that allows employers to manage their interview availability and candidates to book interview slots. This implementation provides a Calendly-like experience with advanced features tailored for recruitment workflows.

## 🚀 Key Features

### For Employers
- **Availability Management**: Set available interview slots with time ranges and maximum candidate capacity
- **Multi-Candidate Support**: Allow multiple candidates to book the same time slot
- **Interview Status Tracking**: Track interview status (Scheduled, Completed, Cancelled, No Show)
- **Email Notifications**: Automatic email confirmations to all parties
- **Calendar Integration**: View all interviews in a dedicated calendar interface
- **Status Updates**: Update interview status with notes and comments

### For Candidates
- **Easy Booking**: Simple slot selection from available times
- **Email Invitations**: Receive secure invitation links via email
- **Contact Information**: Provide name, email, and phone during booking
- **Confirmation Emails**: Receive booking confirmations with calendar attachments
- **Calendar Integration**: Automatic calendar file generation and integration
- **Multiple Calendar Options**: Download .ics files, direct Google Calendar, Outlook integration
- **Success Modal**: Immediate calendar integration options after booking
- **Professional Experience**: Calendar entries with reminders and complete details

### For Recruiters
- **Candidate Submission**: Submit candidates for interview scheduling
- **Follow-up Notifications**: Receive email updates on interview bookings
- **Status Tracking**: Monitor interview progress and outcomes

## 🏗️ Architecture

### Frontend (Next.js 15 + TypeScript)
```
client/src/
├── app/
│   ├── employer/
│   │   ├── calendar/page.tsx          # Dedicated calendar page
│   │   └── dashboard/page.tsx         # Dashboard with calendar quick action
│   └── interview/
│       └── schedule/[token]/page.tsx  # Public interview booking page
├── components/
│   ├── EnhancedInterviewCalendar.tsx  # Calendar modal for setting availability
│   ├── InterviewSlotSelector.tsx      # Candidate slot selection component
│   └── InterviewSuccessModal.tsx      # Success modal with calendar integration
└── lib/
    ├── hooks/
    │   └── interview.hooks.ts         # React Query hooks for interview API
    ├── fetchers.ts                    # API call functions
    ├── constants.ts                   # API endpoints and query keys
    └── calendarUtils.ts               # Calendar file generation utilities
```

### Backend (Node.js + Express + MongoDB)
```
server/
├── models/
│   └── interview.model.js             # Mongoose schemas for interview data
├── controllers/
│   └── interview.controller.js        # Business logic for interview operations
├── routes/
│   └── interview.routes.js            # API route definitions
├── utils/
│   ├── email.js                       # Email sending utilities
│   └── calendarUtils.js               # Calendar file generation utilities
└── index.js                           # Main server file with route integration
```

## 📊 Data Models

### InterviewSlot Schema
```javascript
{
  employerId: ObjectId,
  date: Date,
  startTime: String,
  endTime: String,
  maxCandidates: Number,
  currentBookings: Number,
  isAvailable: Boolean
}
```

### InterviewBooking Schema
```javascript
{
  slotId: ObjectId,
  candidateName: String,
  candidateEmail: String,
  candidatePhone: String,
  jobId: ObjectId,
  recruiterId: ObjectId,
  status: String, // scheduled, completed, cancelled, no_show
  notes: String,
  createdAt: Date
}
```

### InterviewInvitation Schema
```javascript
{
  token: String,
  employerId: ObjectId,
  jobId: ObjectId,
  recruiterId: ObjectId,
  candidateEmail: String,
  expiresAt: Date,
  isUsed: Boolean
}
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB
- Email service (Nodemailer configured)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bodPlatform
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install ics

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` files in both `server/` and `client/` directories:

   **Server Environment Variables:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/bod-platform
   JWT_SECRET=your-jwt-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

   **Client Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB
   mongod

   # The schemas will be automatically created when the server starts
   ```

5. **Start the application**
   ```bash
   # Start server (from server directory)
   npm start

   # Start client (from client directory)
   npm run dev
   ```

## 🎯 Usage Guide

### For Employers

#### Setting Availability
1. Navigate to **Interview Calendar** in the sidebar
2. Click **"Set Availability"** button
3. Select dates and time slots
4. Set maximum candidates per slot
5. Save availability

#### Managing Interviews
1. Go to **Interview Calendar** page
2. View upcoming interviews in the calendar
3. Use search and filters to find specific interviews
4. Click the settings icon to update interview status
5. Add notes and comments as needed

#### Dashboard Overview
- View interview statistics on the main dashboard
- Quick access to calendar via the "Interview Calendar" button
- Monitor upcoming interviews count

### For Candidates

#### Booking an Interview
1. Receive email invitation with secure link
2. Click the invitation link
3. View available time slots
4. Select preferred time slot
5. Enter name, email, and phone number
6. Confirm booking
7. **Success modal appears** with calendar integration options
8. **Add to calendar** using multiple options:
   - Download .ics file (universal)
   - Direct Google Calendar integration
   - Direct Outlook integration
9. Receive confirmation email with calendar attachment

### For Recruiters

#### Submitting Candidates
1. Submit candidate for a job
2. Employer shortlists the candidate
3. System automatically sends interview invitation
4. Receive follow-up notifications on booking status

## 🔌 API Endpoints

### Employer Routes (Authenticated)
```
POST   /api/interviews/employer/availability    # Set availability slots
GET    /api/interviews/employer/calendar        # Get employer calendar
POST   /api/interviews/employer/invitation      # Send interview invitation
PUT    /api/interviews/employer/status/:id      # Update interview status
```

### Public Routes
```
GET    /api/interviews/slots                    # Get available slots
POST   /api/interviews/schedule                 # Schedule interview
GET    /api/interviews/invitation/:token        # Get invitation details
```

## 🎨 UI Components

### EnhancedInterviewCalendar
- **Purpose**: Modal for setting employer availability
- **Features**: Date picker, time slot selection, max candidates setting
- **Technologies**: React Day Picker, React Hook Form, Zod validation

### InterviewSlotSelector
- **Purpose**: Candidate interface for selecting interview slots
- **Features**: Available slots display, candidate information form, success modal integration
- **Technologies**: Material-UI, form validation, React Query

### InterviewSuccessModal
- **Purpose**: Success confirmation with calendar integration options
- **Features**: Interview details display, calendar integration buttons, multiple calendar options
- **Technologies**: Material-UI, calendar utilities, ICS file generation

### Calendar Page
- **Purpose**: Comprehensive interview management interface
- **Features**: Search, filtering, status management, statistics
- **Technologies**: Material-UI, React Query, TypeScript

## 📅 Calendar Integration System

### Overview
The calendar integration system provides a complete Calendly-like experience with automatic calendar file generation, email attachments, and multiple calendar platform support.

### Features

#### **Automatic Calendar File Generation**
- **ICS File Creation**: Server generates professional .ics calendar files
- **Complete Details**: Includes job title, company, location, candidate info
- **Reminders**: Automatic 1-hour and 15-minute reminders
- **Professional Format**: Company branding and complete interview details

#### **Multiple Calendar Platform Support**
- **Universal .ics Files**: Works with any calendar application
- **Google Calendar**: Direct integration with pre-filled details
- **Outlook Calendar**: Direct integration with pre-filled details
- **Apple Calendar**: Compatible with .ics file downloads
- **Other Platforms**: Any calendar app that supports .ics format

#### **Success Modal Integration**
- **Immediate Access**: Shows right after booking completion
- **Multiple Options**: Download .ics, Google Calendar, Outlook
- **User-Friendly**: Clear instructions for each option
- **Professional UI**: Material-UI components with clear design

#### **Email Integration**
- **Automatic Attachments**: .ics files attached to confirmation emails
- **Professional Templates**: Company branding and clear information
- **Complete Instructions**: Step-by-step guide for adding to calendar
- **Multiple Recipients**: Sent to candidate, employer, and recruiter

### Technical Implementation

#### **Backend Calendar Generation**
```javascript
// Server generates .ics file with:
- Event title: "Interview - Software Engineer at Tech Corp"
- Date and time: December 20, 2024, 9:00-10:00 AM
- Location: Company address
- Description: Full interview details
- Reminders: 1 hour and 15 minutes before
- Organizer: Company email
- Attendee: Candidate email
```

#### **Frontend Calendar Integration**
```javascript
// Multiple options for adding to calendar:
1. Download .ics file (universal)
2. Google Calendar URL (direct integration)
3. Outlook Calendar URL (direct integration)
```

### User Experience Flow

#### **For Candidates:**
1. **Book Interview** → Select slot and enter details
2. **Success Modal** → Appears immediately after booking
3. **Choose Calendar Option**:
   - Download .ics file
   - Add to Google Calendar
   - Add to Outlook
4. **Email Confirmation** → Received with .ics attachment
5. **Calendar Entry** → Interview appears in their calendar

#### **Calendar Entry Example:**
```
📅 Interview - Software Engineer at Tech Corp
📅 December 20, 2024 • 9:00 AM - 10:00 AM
📍 123 Business St, New York, NY
📝 Interview for Software Engineer position at Tech Corp

Candidate: John Doe
Email: john@example.com

Please arrive 10 minutes early.

🔔 Reminders: 1 hour before, 15 minutes before
```

### Benefits

#### **For Candidates:**
- ✅ **Never Miss Interviews**: Automatic calendar entries with reminders
- ✅ **Professional Experience**: Calendar integration like major platforms
- ✅ **Multiple Options**: Works with any calendar application
- ✅ **No Manual Work**: Everything automated and seamless

#### **For Employers:**
- ✅ **Reduced No-Shows**: Candidates get automatic reminders
- ✅ **Professional Branding**: Calendar entries show company name
- ✅ **Automated Process**: No manual calendar invitations needed
- ✅ **Better Experience**: Candidates impressed with professional system

#### **For Recruiters:**
- ✅ **Higher Success Rate**: Candidates more likely to attend
- ✅ **Professional Process**: Calendar integration shows quality
- ✅ **Automated Follow-up**: System handles calendar management
- ✅ **Better Outcomes**: Improved interview attendance rates

## 📧 Email System

### Email Templates
- **Interview Invitation**: Sent to candidates with booking link
- **Booking Confirmation**: Sent to employer, candidate, and recruiter with calendar attachments
- **Status Updates**: Notifications for interview status changes

### Calendar Integration
- **ICS File Generation**: Automatic .ics calendar file creation
- **Email Attachments**: Calendar files attached to confirmation emails
- **Multiple Calendar Support**: Google Calendar, Outlook, Apple Calendar, and universal .ics format
- **Reminders**: Automatic 1-hour and 15-minute reminders
- **Professional Format**: Company branding and complete interview details

### Email Configuration
```javascript
// Example email configuration in interview.controller.js
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};
```

## 🔒 Security Features

### Authentication
- JWT-based authentication for employer routes
- Token-based invitation system for candidates
- Role-based access control

### Data Validation
- Input validation using Zod schemas
- Server-side validation for all API endpoints
- SQL injection prevention through Mongoose

### Rate Limiting
- API rate limiting for public endpoints
- Invitation token expiration
- Duplicate booking prevention

## 🧪 Testing

### API Testing
```bash
# Test interview endpoints
cd server
npm test
```

### Frontend Testing
```bash
# Test React components
cd client
npm test
```

### Manual Testing Checklist
- [ ] Employer can set availability
- [ ] Candidates can book interviews
- [ ] Email notifications are sent
- [ ] Interview status can be updated
- [ ] Calendar displays correctly
- [ ] Search and filters work
- [ ] Multi-candidate booking works
- [ ] Success modal appears after booking
- [ ] Calendar integration options work
- [ ] .ics file downloads correctly
- [ ] Google Calendar integration works
- [ ] Outlook integration works
- [ ] Email attachments are included
- [ ] Calendar reminders are set correctly

## 🚀 Deployment

### Production Build
```bash
# Build client
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
EMAIL_HOST=your-production-email-host
EMAIL_PORT=587
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
```

## 📈 Performance Optimizations

### Frontend
- React Query for efficient data fetching and caching
- Lazy loading of calendar components
- Optimized bundle size with code splitting

### Backend
- Database indexing on frequently queried fields
- Efficient aggregation pipelines for statistics
- Connection pooling for MongoDB

### Caching Strategy
- React Query cache for API responses
- Browser caching for static assets
- Database query optimization

## 🔧 Troubleshooting

### Common Issues

#### Email Not Sending
- Check email configuration in environment variables
- Verify SMTP settings
- Check email service provider limits

#### Calendar Not Loading
- Verify MongoDB connection
- Check API endpoint configuration
- Review browser console for errors

#### Invitation Links Not Working
- Check token expiration settings
- Verify invitation token generation
- Review email template configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=interview:* npm start
```

## 📝 Future Enhancements

### Planned Features
- [ ] Two-way calendar sync (updates sync back to system)
- [ ] Video conferencing integration (Zoom, Teams)
- [ ] Automated interview reminders
- [ ] Interview feedback system
- [ ] Analytics dashboard
- [ ] Bulk availability setting
- [ ] Recurring interview slots
- [ ] Location services integration
- [ ] Weather alerts for in-person interviews
- [ ] Travel time calculation
- [ ] Calendar conflict detection

### Technical Improvements
- [ ] WebSocket integration for real-time updates
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] Automated testing suite
- [ ] API documentation with Swagger

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and merge

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write unit tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions about the calendar implementation:

1. Check the troubleshooting section above
2. Review the API documentation
3. Create an issue in the repository
4. Contact the development team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: BOD Platform Development Team
