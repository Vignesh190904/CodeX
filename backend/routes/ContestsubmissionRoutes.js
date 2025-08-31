const express = require("express");
const router = express.Router();
const ContestSubmission = require("../models/ContestSubmission");
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/contest-submissions - Save a contest submission
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { contestId, problemId, code, language, isSuccess } = req.body;

    const newContestSubmission = new ContestSubmission({
      user: req.user.id,
      contest: contestId,
      problem: problemId,
      code,
      language,
      isSuccess,
    });

    await newContestSubmission.save();
    res.status(201).json({ message: "Contest submission saved!" });
  } catch (error) {
    console.error("Error saving contest submission:", error);
    res.status(500).json({ message: "Server error while saving contest submission" });
  }
});

// GET /api/contest-submissions/user-stats - Get user's contest participation statistics
router.get("/user-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total contests participated (distinct contests user has submitted to)
    const contestsParticipated = await ContestSubmission.distinct('contest', { user: userId });

    // Get total contest submissions count
    const totalContestSubmissions = await ContestSubmission.countDocuments({ user: userId });

    // Get successful contest submissions count
    const successfulContestSubmissions = await ContestSubmission.countDocuments({
      user: userId,
      isSuccess: true
    });

    // Get problems solved in contests
    const contestProblemsSolved = await ContestSubmission.distinct('problem', {
      user: userId,
      isSuccess: true
    });

    // Calculate contest success rate
    const contestSuccessRate = totalContestSubmissions > 0 ? (successfulContestSubmissions / totalContestSubmissions) * 100 : 0;

    const contestStats = {
      contestsParticipated: contestsParticipated.length,
      totalContestSubmissions,
      successfulContestSubmissions,
      contestProblemsSolved: contestProblemsSolved.length,
      contestSuccessRate: Math.round(contestSuccessRate * 100) / 100
    };

    res.json(contestStats);
  } catch (err) {
    console.error("Error fetching contest stats:", err);
    res.status(500).json({ message: "Error fetching contest statistics" });
  }
});

module.exports = router;
