const Problem = require("../models/Problem");
const Submission = require("../models/Submission");

// Add a new problem
const addProblem = async (req, res) => {
  try {
    console.log("=== ADD PROBLEM REQUEST ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user);
    
    const { 
      title, 
      difficulty, 
      score, 
      problemStatement, 
      description,
      inputFormat, 
      outputFormat, 
      constraints, 
      sampleTestCases, 
      hiddenTestCases, 
      tags 
    } = req.body;

    console.log("Extracted fields:", {
      title,
      difficulty,
      score,
      problemStatement: problemStatement ? "present" : "missing",
      description: description ? "present" : "missing",
      inputFormat: inputFormat ? "present" : "missing",
      outputFormat: outputFormat ? "present" : "missing",
      constraints: constraints ? constraints.length : 0,
      sampleTestCases: sampleTestCases ? sampleTestCases.length : 0,
      hiddenTestCases: hiddenTestCases ? hiddenTestCases.length : 0,
      tags: tags ? tags.length : 0
    });

    // Validate required fields
    if (!title || !difficulty || !score || (!problemStatement && !description)) {
      console.log("Validation failed - missing required fields");
      return res.status(400).json({ 
        message: "Missing required fields: title, difficulty, score, and problemStatement/description are required" 
      });
    }

    console.log("Required fields validation passed");

    // Validate sample test cases structure
    if (sampleTestCases && Array.isArray(sampleTestCases)) {
      for (let i = 0; i < sampleTestCases.length; i++) {
        const testCase = sampleTestCases[i];
        if (!testCase.input || !testCase.output || !testCase.explanation) {
          console.log(`Sample test case ${i + 1} validation failed:`, testCase);
          return res.status(400).json({ 
            message: `Sample test case ${i + 1} is missing required fields: input, output, and explanation` 
          });
        }
      }
    }

    console.log("Sample test cases validation passed");

    // Validate hidden test cases structure
    if (hiddenTestCases && Array.isArray(hiddenTestCases)) {
      for (let i = 0; i < hiddenTestCases.length; i++) {
        const testCase = hiddenTestCases[i];
        if (!testCase.input || !testCase.output) {
          console.log(`Hidden test case ${i + 1} validation failed:`, testCase);
          return res.status(400).json({ 
            message: `Hidden test case ${i + 1} is missing required fields: input and output` 
          });
        }
      }
    }

    console.log("Hidden test cases validation passed");

    // Get the next problem number
    const problemCount = await Problem.countDocuments();
    const nextProblemNumber = problemCount + 1;
    console.log(`Next problem number will be: ${nextProblemNumber}`);

    const problemData = {
      problemNumber: nextProblemNumber,
      title,
      difficulty,
      score,
      description: description || problemStatement || "",
      problemStatement: problemStatement || description || "",
      inputFormat: inputFormat || "",
      outputFormat: outputFormat || "",
      constraints: constraints || [],
      sampleTestCases: sampleTestCases || [],
      hiddenTestCases: hiddenTestCases || [],
      tags: tags || []
    };

    console.log("Creating problem with data:", problemData);

    const newProblem = new Problem(problemData);

    console.log("Problem model created, attempting to save...");

    await newProblem.save();
    
    console.log("Problem saved successfully with ID:", newProblem._id);
    console.log("Problem number assigned:", newProblem.problemNumber);
    
    res.status(201).json({ 
      message: "Problem added successfully!", 
      problemId: newProblem._id,
      problemNumber: newProblem.problemNumber
    });
  } catch (err) {
    console.error("=== ERROR IN ADD PROBLEM ===");
    console.error("Error:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    if (err.errors) {
      console.error("Validation errors:", err.errors);
    }
    
    res.status(500).json({ 
      message: "Error adding problem", 
      error: err.message,
      details: err.errors ? Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      })) : null
    });
  }
};

// Get all problems
const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ problemNumber: 1 });
    res.status(200).json(problems);
  } catch (err) {
    res.status(500).json({ message: "Error fetching problems", error: err.message });
  }
};
// Get a single problem by ID
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.status(200).json(problem);
  } catch (err) {
    res.status(500).json({ message: "Error fetching problem", error: err.message });
  }
};
// Get real-time problem stats
const getProblemStats = async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: "$problem",
          usersTried: { $addToSet: "$user" },
          successCount: {
            $sum: { $cond: ["$isSuccess", 1, 0] },
          },
          totalSubmissions: { $sum: 1 },
        },
      },
      {
        $project: {
          problemId: "$_id",
          usersTried: { $size: "$usersTried" },
          successRate: {
            $cond: [
              { $eq: ["$totalSubmissions", 0] },
              0,
              { $multiply: [{ $divide: ["$successCount", "$totalSubmissions"] }, 100] },
            ],
          },
        },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

// Delete a problem
const deleteProblem = async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Problem deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting problem" });
  }
};

// Update a problem
const updateProblem = async (req, res) => {
  try {
    const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Problem updated successfully!", updatedProblem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating problem" });
  }
};

// Update all existing problems with problem numbers
const updateAllProblemNumbers = async (req, res) => {
  try {
    console.log("Starting bulk problem number update...");
    
    // Get all problems sorted by creation date
    const problems = await Problem.find({}).sort({ createdAt: 1 });
    
    console.log(`Found ${problems.length} problems to update`);
    
    // Update each problem with a sequential number
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const problemNumber = i + 1;
      
      if (!problem.problemNumber) {
        await Problem.findByIdAndUpdate(problem._id, { problemNumber });
        console.log(`Updated problem "${problem.title}" with number ${problemNumber}`);
      } else {
        console.log(`Problem "${problem.title}" already has number ${problem.problemNumber}`);
      }
    }
    
    console.log("Problem number update completed successfully!");
    res.json({ 
      message: "All problems updated with sequential numbers successfully!",
      updatedCount: problems.length
    });
  } catch (error) {
    console.error("Error updating problem numbers:", error);
    res.status(500).json({ 
      message: "Error updating problem numbers", 
      error: error.message 
    });
  }
};

module.exports = {
  addProblem,
  getAllProblems,
  getProblemById, 
  deleteProblem,
  updateProblem,
  getProblemStats,
  updateAllProblemNumbers,
};
