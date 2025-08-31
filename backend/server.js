const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());                // Allow cross-origin requests
app.use(express.json());        // Parse incoming JSON requests

// Test Route
app.get("/", (req, res) => {
  res.send(" MLRIT Code Hub Backend is Running!");
});
const path = require("path");
// Main Routes
app.use("/api/auth", require("./routes/authRoutes"));          // Auth Routes
app.use("/api/profile", require("./routes/profileRoutes"));    // Profile Routes
app.use("/api/problems", require("./routes/problemRoutes"));   // Problems
app.use("/api/courses", require('./routes/courseRoutes'));
app.use("/api/contests", require("./routes/contestRoutes"));
app.use("/api/contest-submissions", require("./routes/ContestsubmissionRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
console.log("Loading course leaderboard routes...");
app.use("/api/course-leaderboard", require("./routes/courseLeaderboardRoutes"));
console.log("Course leaderboard routes loaded.");
app.use("/api/roadmaps", require("./routes/roadmapRoutes"));   // Roadmaps
app.use("/api/skill-tests", require("./routes/skillTestRoutes")); // Skill Tests
app.use("/api/progress", require("./routes/userProgressRoutes")); // Progress
app.use("/api", require("./routes/finalExamRoutes")); // Final Exams

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Mount profile routesn
// MongoDB Connection with enhanced Atlas configuration
const mongoOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
};

mongoose.connect(process.env.MONGO_URI, mongoOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Atlas connection error:", err);
    console.error("Please check:");
    console.error("1. Network connectivity");
    console.error("2. MongoDB Atlas cluster status");
    console.error("3. IP whitelist settings");
    console.error("4. Username/password credentials");
  });
