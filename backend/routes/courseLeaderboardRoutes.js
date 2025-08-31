const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { 
  getCourseLeaderboard, 
  getUserCourseRank, 
  getUserCourseStats,
  updateUserCourseScore
} = require("../controllers/courseLeaderboardController");

// Get leaderboard for specific course
router.get("/:courseId", authenticateToken, getCourseLeaderboard);

// Get user's rank in specific course
router.get("/:courseId/user/:userId/rank", authenticateToken, getUserCourseRank);

// Get detailed user statistics for specific course
router.get("/:courseId/user/:userId/stats", authenticateToken, getUserCourseStats);

// Update user score for specific course (called internally by assessment completion)
router.post("/:courseId/update-score", authenticateToken, updateUserCourseScore);

module.exports = router;