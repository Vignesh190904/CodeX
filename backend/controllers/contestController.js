const Contest = require("../models/Contest");
const ContestProblem = require("../models/ContestProblem");
const Problem = require("../models/Problem");

exports.createContest = async (req, res) => {
  const { title, startTime, endTime, problems } = req.body;
  try {
    const contest = new Contest({ title, startTime, endTime, problems });
    await contest.save();
    res.json({ message: "Contest created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.moveProblemsToRegular = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId).populate("problems");
    if (!contest) return res.status(404).json({ error: "Contest not found" });

    for (let cp of contest.problems) {
      const newProblem = new Problem({
        title: cp.title,
        description: cp.description,
        difficulty: cp.difficulty,
        sampleTestCases: cp.sampleTestCases,
        hiddenTestCases: cp.hiddenTestCases,
      });
      await newProblem.save();
    }

    await Contest.findByIdAndDelete(req.params.contestId);

    res.json({ message: "Problems moved to regular successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().populate("problems");
    res.json(contests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("problems");
    res.json(contest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
