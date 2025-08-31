const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const UserProgress = require("../models/UserProgress");
const Course = require("../models/Course");
const { authenticateToken } = require("../middleware/authMiddleware");
const { updateUserCourseScore } = require("../controllers/courseLeaderboardController");

// @route   GET /api/progress?userId=&courseId=
// @desc    Get user progress for a course
router.get("/", authenticateToken, async (req, res) => {
  const { userId, courseId } = req.query;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      // Create initial progress if doesn't exist
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }

      progress = new UserProgress({
        userId,
        courseId,
        topicsProgress: [],
        overallProgress: 0
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   POST /api/progress/lesson
// @desc    Update lesson progress
router.post("/lesson", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required"),
    body("topicId").notEmpty().withMessage("topicId is required"),
    body("lessonId").notEmpty().withMessage("lessonId is required"),
    body("completed").optional().isBoolean(),
    body("timeSpent").optional().isNumeric(),
    body("score").optional().isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId, topicId, lessonId, completed, timeSpent, score, topicTitle } = req.body;

    try {
      let progress = await UserProgress.findOne({ userId, courseId });

      if (!progress) {
        progress = new UserProgress({
          userId,
          courseId,
          topicsProgress: [],
          overallProgress: 0
        });
      }

      // Check if this lesson is already marked as completed
      const existingTopic = progress.topicsProgress.find(tp => tp.topicId.toString() === topicId);
      const existingLesson = existingTopic?.lessons?.find(lp => lp.lessonId.toString() === lessonId);
      
      if (existingLesson?.completed) {
        return res.status(200).json({ 
          message: "Lesson already completed",
          alreadyCompleted: true,
          progress: progress 
        });
      }

      await progress.updateLessonProgress(topicId, lessonId, {
        completed: completed || false,
        timeSpent: timeSpent || 0,
        score: score || 0,
        topicTitle: topicTitle || 'Unknown Topic'
      });

      // Update leaderboard score if lesson is completed
      if (completed) {
        try {
          const assessmentData = {
            topicId: topicId,
            lessonId: lessonId,
            mcqResults: mcqResults || [],
            codingResults: codingResults || []
          };
          const mockReq = { 
            params: { courseId }, 
            body: { 
              userId, 
              assessmentType: 'lesson', 
              score: score || 0,
              assessmentData: assessmentData
            } 
          };
          const mockRes = { json: () => {}, status: () => ({ json: () => {} }) };
          await updateUserCourseScore(mockReq, mockRes);
        } catch (leaderboardErr) {
          console.error('Error updating leaderboard:', leaderboardErr);
          // Don't fail the main request if leaderboard update fails
        }
      }

      res.json({ 
        message: "Lesson progress updated successfully", 
        alreadyCompleted: false,
        progress: progress 
      });
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route   POST /api/progress/module-test
// @desc    Submit module test results
router.post("/module-test", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required"),
    body("topicId").notEmpty().withMessage("topicId is required"),
    body("answers").isArray().withMessage("answers must be an array")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId, topicId, answers, codingAnswers, topicTitle } = req.body;

    try {
      // Get course data to access correct answers
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const topic = course.topics.id(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      if (!topic.moduleTest) {
        return res.status(404).json({ message: "No test available for this topic" });
      }

      // Get MCQs and coding challenges from topic
      const mcqs = topic.moduleTest.mcqs || [];
      const codeChallenges = topic.moduleTest.codeChallenges || [];
      const totalQuestions = mcqs.length + codeChallenges.length;

      // Calculate score by comparing answers
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unattempted = 0;
      let mcqCorrect = 0;
      let codingCorrect = 0;
      let mcqScore = 0;
      let codingScore = 0;
      
      // Check MCQ answers and calculate marks
      mcqs.forEach((mcq, index) => {
        if (answers[index] !== undefined) {
          if (answers[index] === mcq.correct) {
            correctAnswers++;
            mcqCorrect++;
            mcqScore += mcq.marks || 1;
          } else {
            wrongAnswers++;
          }
        } else {
          unattempted++;
        }
      });
      
      // Check coding answers and calculate marks
      if (codingAnswers) {
        Object.keys(codingAnswers).forEach((questionIndex) => {
          const codingIndex = parseInt(questionIndex) - mcqs.length;
          if (codingIndex >= 0 && codingIndex < topic.moduleTest.codeChallenges.length) {
            // For now, just check if code exists (in real implementation, would test against expected output)
            if (codingAnswers[questionIndex] && codingAnswers[questionIndex].code && codingAnswers[questionIndex].code.trim()) {
              correctAnswers++;
              codingCorrect++;
              codingScore += topic.moduleTest.codeChallenges[codingIndex].marks || 2;
            } else {
              wrongAnswers++;
            }
          }
        });
      }
      
      // Count remaining unattempted coding questions
      const attemptedCoding = codingAnswers ? Object.keys(codingAnswers).length : 0;
      unattempted += Math.max(0, topic.moduleTest.codeChallenges.length - attemptedCoding);

      // Calculate total marks from actual question marks
      const totalMcqMarks = mcqs.reduce((sum, mcq) => sum + (mcq.marks || 1), 0);
      const totalCodingMarks = topic.moduleTest.codeChallenges.reduce((sum, challenge) => sum + (challenge.marks || 2), 0);
      const totalMarks = totalMcqMarks + totalCodingMarks;
      
      const score = mcqScore + codingScore;
      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

      let progress = await UserProgress.findOne({ userId, courseId });

      if (!progress) {
        progress = new UserProgress({
          userId,
          courseId,
          topicsProgress: [],
          overallProgress: 0
        });
      }

      await progress.updateModuleTestProgress(topicId, {
        score,
        totalMarks,
        answers: answers || [],
        topicTitle: topicTitle || topic.title || 'Unknown Topic'
      });

      // Update leaderboard score for module test completion
      try {
        // Prepare MCQ results
        const mcqResults = mcqs.map((mcq, index) => ({
          isCorrect: answers[index] !== undefined && answers[index] === mcq.correct
        }));
        
        // Prepare coding results
        const codingResults = codeChallenges.map((challenge, index) => {
          const codingIndex = index + mcqs.length;
          const hasCode = codingAnswers && codingAnswers[codingIndex] && codingAnswers[codingIndex].code && codingAnswers[codingIndex].code.trim();
          return {
            verdict: hasCode ? 'Accepted' : 'Wrong Answer'
          };
        });
        
        const assessmentData = {
          topicId: topicId,
          mcqResults: mcqResults,
          codingResults: codingResults,
          mcqQuestions: mcqs,
          codingQuestions: codeChallenges
        };
        
        console.log('Updating leaderboard with assessment data:', JSON.stringify(assessmentData, null, 2));
        
        const mockReq = { 
          params: { courseId }, 
          body: { 
            userId, 
            assessmentType: 'moduleTest', 
            assessmentData: assessmentData
          } 
        };
        const mockRes = { 
          json: (data) => console.log('Leaderboard update success:', data), 
          status: (code) => ({ 
            json: (error) => console.error('Leaderboard update error:', code, error) 
          }) 
        };
        await updateUserCourseScore(mockReq, mockRes);
      } catch (leaderboardErr) {
        console.error('Error updating leaderboard:', leaderboardErr);
        // Don't fail the main request if leaderboard update fails
      }

      res.json({ 
        message: "Module test submitted successfully", 
        progress: progress,
        testResult: {
          score,
          totalMarks,
          percentage,
          correctAnswers,
          wrongAnswers,
          unattempted,
          mcqCorrect,
          codingCorrect,
          totalQuestions,
          mcqScore,
          codingScore
        }
      });
    } catch (err) {
      console.error('Error submitting module test:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route   POST /api/progress (Legacy support)
// @desc    Update progress (backward compatibility)
router.post("/", authenticateToken, async (req, res) => {
  const { userId, courseId, moduleIndex, testAttempt } = req.body;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new UserProgress({
        userId,
        courseId,
        completedModules: [],
        topicsProgress: [],
        testAttempt: testAttempt || {},
      });
    }

    // Add completed module if it's not already completed (backward compatibility)
    if (typeof moduleIndex === "number" && !progress.completedModules.includes(moduleIndex)) {
      progress.completedModules.push(moduleIndex);
    }

    // Update testAttempt if provided (backward compatibility)
    if (testAttempt) {
      progress.testAttempt = {
        score: testAttempt.score || progress.testAttempt?.score || 0,
        totalMarks: testAttempt.total || testAttempt.totalMarks || progress.testAttempt?.totalMarks || 0,
        percentage: 0,
        attemptedAt: new Date(),
        answers: testAttempt.answers || []
      };
      
      // Calculate percentage
      if (progress.testAttempt.totalMarks > 0) {
        progress.testAttempt.percentage = Math.round((progress.testAttempt.score / progress.testAttempt.totalMarks) * 100);
      }
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/progress/topic/:topicId
// @desc    Get specific topic progress
router.get("/topic/:topicId", authenticateToken, async (req, res) => {
  const { userId, courseId } = req.query;
  const { topicId } = req.params;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    const progress = await UserProgress.findOne({ userId, courseId });
    
    if (!progress) {
      return res.status(404).json({ message: "No progress found." });
    }

    const topicProgress = progress.topicsProgress.find(tp => tp.topicId === topicId);
    
    if (!topicProgress) {
      return res.status(404).json({ message: "Topic progress not found." });
    }

    res.json(topicProgress);
  } catch (err) {
    console.error('Error fetching topic progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   DELETE /api/progress/reset
// @desc    Reset user progress for a course
router.delete("/reset", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId } = req.body;

    try {
      const result = await UserProgress.findOneAndDelete({ userId, courseId });
      
      if (!result) {
        return res.status(404).json({ message: "No progress found to reset." });
      }

      res.json({ message: "Progress reset successfully" });
    } catch (err) {
      console.error('Error resetting progress:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

module.exports = router;
