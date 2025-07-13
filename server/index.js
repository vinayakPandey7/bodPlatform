const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const employerRoutes = require("./routes/employer.routes");
const recruitmentPartnerRoutes = require("./routes/recruitmentPartner.routes");
const adminRoutes = require("./routes/admin.routes");
const jobRoutes = require("./routes/job.routes");
const candidateRoutes = require("./routes/candidate.routes");
const notificationRoutes = require("./routes/notification.routes");
const uploadRoutes = require("./routes/upload.routes");
const locationRoutes = require("./routes/location.routes");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "randomId",
      "sec-ch-ua-platform",
      "sec-ch-ua",
      "sec-ch-ua-mobile",
      "User-Agent",
      "Referer",
      "client-id",
      "client-version",
      "client-type",
      "version",
    ],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/recruitment-partner", recruitmentPartnerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/location", locationRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("BOD Service Portal API is running");
});

// Serve the employer registration page
app.get("/employer-registration", (req, res) => {
  res.sendFile(__dirname + "/employer-registration.html");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
