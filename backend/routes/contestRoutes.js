const express = require("express");
const router = express.Router();
const Contest = require("../models/Contest");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Create a new Contest (Admin only)
router.post("/create", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, problems, startTime, endTime } = req.body;

    const contest = new Contest({
      title,
      description,
      problems,
      startTime,
      endTime,
    });

    await contest.save();
    res.status(201).json({ message: "Contest created successfully!", contest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Fetch ongoing contests (for users)
router.get("/ongoing", async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate("problems");

    res.json(contests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Fetch contest by ID
router.get("/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("problems");

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    res.json(contest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
