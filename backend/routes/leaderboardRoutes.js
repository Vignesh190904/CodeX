const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { 
  getLeaderboard, 
  getUserRank, 
  updateUserScore,
  getCourseLeaderboard,
  getDetailedUserStats
} = require("../controllers/leaderboardController");

// Get overall leaderboard (based on problem submissions)
router.get("/", authenticateToken, getLeaderboard);

// Get leaderboard for specific course (based on course assessments)
router.get("/course/:courseId", authenticateToken, getCourseLeaderboard);

// Get user's rank and position
router.get("/user/:userId/rank", authenticateToken, getUserRank);

// Get detailed user statistics
router.get("/user/:userId/stats", authenticateToken, getDetailedUserStats);

// Update user score (called internally by assessment completion)
router.post("/update-score", authenticateToken, updateUserScore);

module.exports = router;