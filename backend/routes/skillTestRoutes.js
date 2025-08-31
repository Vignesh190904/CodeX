const express = require("express");
const router = express.Router();
const SkillTest = require("../models/SkillTest");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const tests = await SkillTest.find();
    res.json(tests);
  } catch (error) {
    console.error('Error fetching skill tests:', error);
    res.status(500).json({ message: 'Error fetching skill tests' });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const test = await SkillTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Skill test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error fetching skill test:', error);
    res.status(500).json({ message: 'Error fetching skill test' });
  }
});

module.exports = router; 