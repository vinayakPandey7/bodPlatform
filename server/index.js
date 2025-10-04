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
const salesPersonRoutes = require("./routes/salesPerson.routes");
const adminRoutes = require("./routes/admin.routes");
const jobRoutes = require("./routes/job.routes");
const candidateRoutes = require("./routes/candidate.routes");
const notificationRoutes = require("./routes/notification.routes");
const cloudinaryRoutes = require("./routes/cloudinary.routes");
const locationRoutes = require("./routes/location.routes");
const clientRoutes = require("./routes/client.routes");
const insuranceAgentRoutes = require("./routes/insuranceAgent.routes");
const insuranceClientRoutes = require("./routes/insuranceClient.routes");
const interviewRoutes = require("./routes/interview.routes");

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
      "https://ciero.vercel.app",
      "https://theciero.com",
      "https://www.theciero.com",
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
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/theciero", {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    maxPoolSize: 10, // Maintain up to 10 socket connections
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/recruitment-partner", recruitmentPartnerRoutes);
app.use("/api/recruitment-partner/clients", clientRoutes);
app.use("/api/sales-person", salesPersonRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", cloudinaryRoutes); // Use Cloudinary for all uploads
app.use("/api/location", locationRoutes);
app.use("/api/insurance-agents", insuranceAgentRoutes);
app.use("/api/insurance-clients", insuranceClientRoutes);
app.use("/api/interviews", interviewRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("BOD Service Portal API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
