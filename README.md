# BOD Service Portal

A comprehensive recruitment platform connecting employers with recruitment partners to streamline the hiring process.

## Project Overview

The BOD Service Portal is a full-stack web application built with modern technologies to facilitate recruitment operations between employers and recruitment partners. The platform provides role-based dashboards, job management, candidate tracking, and interview scheduling capabilities.

## Technology Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Joi** for request validation
- **Nodemailer** for email notifications

### Frontend

- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Axios** for API calls
- **Context API** for state management

## Project Structure

```
├── server/                 # Backend API
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middleware
│   ├── utils/            # Utility functions
│   └── uploads/          # File upload directory
├── client/               # Frontend application
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # Reusable components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility libraries
└── .vscode/             # VS Code configuration
```

## Features

### Employer Features

- ✅ Sign in/Sign up with email verification
- ✅ Dashboard with recruitment statistics
- 🔄 Job posting and management
- 🔄 Candidate application review
- 🔄 Interview scheduling (Calendly integration)
- 🔄 Candidate status tracking
- 🔄 Saved candidates management
- 🔄 Email notifications
- ✅ Profile management

### Recruitment Partner Features

- ✅ Sign in/Sign up
- ✅ Dashboard with job statistics
- 🔄 Browse available jobs
- 🔄 Submit candidate applications
- 🔄 Track application status
- 🔄 Candidate management
- 🔄 Email notifications
- ✅ Profile management

### Admin Features

- ✅ Dashboard with platform statistics
- ✅ Employer management (CRUD operations)
- ✅ Recruitment partner management
- ✅ Job approval/rejection workflow
- 🔄 Sub-admin management
- 🔄 Roles and permissions
- 🔄 Candidate management
- 🔄 Notification management
- 🔄 CMS management

### Technical Features

- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ File upload for resumes
- ✅ Request validation with Joi
- ✅ Password hashing with bcrypt
- ✅ Error handling and logging
- ✅ Responsive design
- 🔄 Email notifications
- 🔄 Search and filtering
- 🔄 Data export/import

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd learning-project
   ```

2. **Install backend dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the `server` directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bod_service_portal
   JWT_SECRET=your_super_secret_jwt_key_here
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```

   Create `.env.local` file in the `client` directory:

   ```env
   API_URL=http://localhost:5000/api
   ```

5. **Database Setup**

   Start MongoDB service and run the seed script:

   ```bash
   cd server
   npm run seed
   ```

6. **Start Development Servers**

   **Option 1: Start both servers simultaneously**

   ```bash
   # From the root directory
   npm run dev  # If you have concurrently installed globally
   ```

   **Option 2: Start servers separately**

   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## Default Login Credentials

After running the seed script, you can log in with these credentials:

- **Admin**: admin@bodportal.com / admin123
- **Employer**: employer@test.com / employer123
- **Recruitment Partner**: recruiter@test.com / recruiter123

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user profile

### Employer Endpoints

- `GET /api/employer/profile` - Get employer profile
- `PUT /api/employer/profile` - Update employer profile

### Job Endpoints

- `GET /api/jobs/active` - Get all active jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create new job (Employer only)
- `PUT /api/jobs/:id` - Update job (Employer only)
- `DELETE /api/jobs/:id` - Delete job (Employer only)

### Candidate Endpoints

- `POST /api/candidates/apply` - Submit candidate application
- `PUT /api/candidates/:id/status` - Update candidate status
- `POST /api/candidates/:id/notes` - Add candidate note

### File Upload Endpoints

- `POST /api/upload/resume` - Upload resume file
- `GET /api/upload/resume/:filename` - Download resume file

## Development Workflow

### Backend Development

1. Models are defined in `server/models/`
2. Controllers handle business logic in `server/controllers/`
3. Routes define API endpoints in `server/routes/`
4. Middleware for authentication and validation in `server/middlewares/`

### Frontend Development

1. Pages are created in `client/src/app/`
2. Reusable components in `client/src/components/`
3. Custom hooks for state management in `client/src/hooks/`
4. API utilities in `client/src/lib/`

### Adding New Features

1. Define database models if needed
2. Create controller functions
3. Add API routes with proper middleware
4. Create frontend components and pages
5. Update navigation and routing

## Deployment

### Backend Deployment

1. Set up MongoDB Atlas or cloud MongoDB instance
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment

1. Build the Next.js application: `npm run build`
2. Deploy to Vercel, Netlify, or similar platforms
3. Update API_URL to point to production backend

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

## Development Status

✅ = Completed  
🔄 = In Progress  
❌ = Not Started

This is a learning project demonstrating modern full-stack development practices with Node.js, Express, MongoDB, and Next.js.
