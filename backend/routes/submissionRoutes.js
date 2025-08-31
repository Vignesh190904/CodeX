const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/submissions - Save a practice problem submission
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { problemId, code, language, isSuccess } = req.body;

    const newSubmission = new Submission({
      user: req.user.id,
      problem: problemId,
      code,
      language,
      isSuccess,
    });

    await newSubmission.save();
    res.status(201).json({ message: "Submission saved successfully!" });
  } catch (error) {
    console.error("Error saving submission:", error);
    res.status(500).json({ message: "Server error while saving submission" });
  }
});
// GET /api/submissions/user/:problemId - Get user's submissions for a problem
router.get("/user/:problemId", authenticateToken, async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user.id,
      problem: req.params.problemId,
    }).sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// GET /api/submissions/user-stats - Get user's overall statistics
router.get("/user-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total problems solved (successful submissions)
    const problemsSolved = await Submission.distinct('problem', {
      user: userId,
      isSuccess: true
    });

    // Get total submissions count
    const totalSubmissions = await Submission.countDocuments({ user: userId });

    // Get successful submissions count
    const successfulSubmissions = await Submission.countDocuments({
      user: userId,
      isSuccess: true
    });

    // Get problems attempted (distinct problems user has submitted to)
    const problemsAttempted = await Submission.distinct('problem', { user: userId });

    // Calculate success rate
    const successRate = totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0;

    const userStats = {
      problemsSolved: problemsSolved.length,
      problemsAttempted: problemsAttempted.length,
      totalSubmissions,
      successfulSubmissions,
      successRate: Math.round(successRate * 100) / 100
    };

    res.json(userStats);
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ message: "Error fetching user statistics" });
  }
});

// GET /api/submissions/recent-solved - Get user's recently solved problems
router.get("/recent-solved", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5; // Default to 5 recent problems

    // Get recent successful submissions with problem details
    const recentSolved = await Submission.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isSuccess: true
        }
      },
      {
        $group: {
          _id: "$problem",
          lastSolvedAt: { $max: "$submittedAt" }
        }
      },
      {
        $sort: { lastSolvedAt: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problemDetails"
        }
      },
      {
        $unwind: "$problemDetails"
      },
      {
        $project: {
          _id: "$problemDetails._id",
          title: "$problemDetails.title",
          difficulty: "$problemDetails.difficulty",
          problemNumber: "$problemDetails.problemNumber",
          lastSolvedAt: 1
        }
      }
    ]);

    res.json(recentSolved);
  } catch (err) {
    console.error("Error fetching recent solved problems:", err);
    res.status(500).json({ message: "Error fetching recent solved problems" });
  }
});

module.exports = router;
