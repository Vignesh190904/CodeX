const mongoose = require("mongoose");
const Leaderboard = require("../models/Leaderboard");
const User = require("../models/user");
const Course = require("../models/Course");

// Get course-specific leaderboard based on course assessments
const getCourseLeaderboard = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Get leaderboard entries for this specific course
    const leaderboard = await Leaderboard.find({ courseId })
      .populate('userId', 'name email rollNumber year department college')
      .sort({ overallScore: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Calculate ranks and percentiles
    const totalUsers = await Leaderboard.countDocuments({ courseId });
    
    const leaderboardWithRanks = leaderboard.map((entry, index) => {
      const rank = (parseInt(page) - 1) * parseInt(limit) + index + 1;
      const percentile = totalUsers > 0 ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100) : 100;
      
      return {
        userId: entry.userId._id,
        name: entry.userId.name,
        email: entry.userId.email,
        rollNumber: entry.userId.rollNumber,
        year: entry.userId.year,
        department: entry.userId.department,
        college: entry.userId.college,
        overallScore: entry.overallScore,
        totalLessonScore: entry.totalLessonScore,
        totalModuleTestScore: entry.totalModuleTestScore,
        totalFinalExamScore: entry.totalFinalExamScore,
        lessonsCompleted: entry.lessonsCompleted,
        moduleTestsCompleted: entry.moduleTestsCompleted,
        finalExamCompleted: entry.finalExamCompleted,
        averageScore: entry.averageScore,
        lastUpdated: entry.lastUpdated,
        rank,
        percentile
      };
    });

    res.json({
      leaderboard: leaderboardWithRanks,
      totalUsers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / parseInt(limit))
    });
  } catch (err) {
    console.error('Error fetching course leaderboard:', err);
    res.status(500).json({ message: "Error fetching course leaderboard", error: err.message });
  }
};

// Get user's rank in specific course
const getUserCourseRank = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Get or create user entry with upsert to prevent duplicates
    let userEntry = await Leaderboard.findOneAndUpdate(
      { userId, courseId },
      { $setOnInsert: { userId, courseId } },
      { upsert: true, new: true }
    );

    const rank = await Leaderboard.countDocuments({
      courseId,
      overallScore: { $gt: userEntry.overallScore }
    }) + 1;

    const totalUsers = await Leaderboard.countDocuments({ courseId });
    const percentile = totalUsers > 0 ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100) : 100;

    res.json({
      rank,
      totalUsers,
      percentile,
      score: userEntry.overallScore,
      courseId
    });
  } catch (err) {
    console.error('Error fetching user course rank:', err);
    res.status(500).json({ message: "Error fetching user rank", error: err.message });
  }
};

// Get detailed user statistics for specific course
const getUserCourseStats = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    let userStats = await Leaderboard.findOne({ userId, courseId })
      .populate('userId', 'name email rollNumber')
      .populate('courseId', 'title');

    if (!userStats) {
      // Create a default entry if user hasn't started any assessments yet
      userStats = await Leaderboard.findOneAndUpdate(
        { userId, courseId },
        { $setOnInsert: { userId, courseId } },
        { upsert: true, new: true }
      )
        .populate('userId', 'name email rollNumber')
        .populate('courseId', 'title');
    }

    // Calculate performance metrics
    const totalMcqScore = userStats.lessonScores.reduce((sum, lesson) => sum + lesson.mcqScore, 0) +
                         userStats.moduleTestScores.reduce((sum, test) => sum + test.mcqScore, 0) +
                         (userStats.finalExamScore?.mcqScore || 0);

    const totalCodingScore = userStats.lessonScores.reduce((sum, lesson) => sum + lesson.codingScore, 0) +
                            userStats.moduleTestScores.reduce((sum, test) => sum + test.codingScore, 0) +
                            (userStats.finalExamScore?.codingScore || 0);

    const strongestArea = totalMcqScore > totalCodingScore ? 'MCQ' : 'Coding';

    // Calculate rank
    const rank = await Leaderboard.countDocuments({
      courseId,
      overallScore: { $gt: userStats.overallScore }
    }) + 1;

    const totalUsers = await Leaderboard.countDocuments({ courseId });
    const percentile = totalUsers > 0 ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100) : 100;

    res.json({
      user: userStats.userId,
      course: userStats.courseId,
      overallScore: userStats.overallScore,
      breakdown: {
        lessonScore: userStats.totalLessonScore,
        moduleTestScore: userStats.totalModuleTestScore,
        finalExamScore: userStats.totalFinalExamScore
      },
      performance: {
        strongestArea,
        totalMcqScore,
        totalCodingScore,
        averageScore: userStats.averageScore
      },
      progress: {
        lessonsCompleted: userStats.lessonsCompleted,
        moduleTestsCompleted: userStats.moduleTestsCompleted,
        finalExamCompleted: userStats.finalExamCompleted
      },
      rank,
      percentile,
      lastUpdated: userStats.lastUpdated
    });
  } catch (err) {
    console.error('Error fetching user course statistics:', err);
    res.status(500).json({ message: "Error fetching user statistics", error: err.message });
  }
};

// Update user score for specific course
const updateUserCourseScore = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, assessmentType, assessmentData } = req.body;

    let leaderboardEntry = await Leaderboard.findOne({ userId, courseId });
    
    if (!leaderboardEntry) {
      leaderboardEntry = new Leaderboard({ userId, courseId });
    }

    // Get course scoring configuration
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const scoringConfig = course.scoringConfig;

    switch (assessmentType) {
      case 'lesson':
        // Check if assessmentData exists and has required properties
        if (!assessmentData) {
          console.warn('Assessment data is undefined for lesson type');
          return res.status(400).json({ message: "Assessment data is required" });
        }
        const { topicId, lessonId, mcqResults = [], codingResults = [] } = assessmentData;
        
        // Calculate scores based on individual question marks (handle optional MCQs/coding)
        const mcqScore = mcqResults.length > 0 ? mcqResults.reduce((total, result, index) => {
          if (result.isCorrect && assessmentData.mcqQuestions && assessmentData.mcqQuestions[index]) {
            return total + (assessmentData.mcqQuestions[index].marks || scoringConfig.lessonMcqMarks);
          }
          return total;
        }, 0) : 0;
        
        const codingScore = codingResults.length > 0 ? codingResults.reduce((total, result, index) => {
          if (result.verdict === 'Accepted' && assessmentData.codingQuestions && assessmentData.codingQuestions[index]) {
            return total + (assessmentData.codingQuestions[index].marks || scoringConfig.lessonCodingMarks);
          }
          return total;
        }, 0) : 0;
        
        // Calculate max score only for questions that exist
        const maxMcqScore = (assessmentData.mcqQuestions || []).reduce((total, q) => total + (q.marks || scoringConfig.lessonMcqMarks), 0);
        const maxCodingScore = (assessmentData.codingQuestions || []).reduce((total, q) => total + (q.marks || scoringConfig.lessonCodingMarks), 0);
        const maxScore = maxMcqScore + maxCodingScore;
        
        // Ensure at least one type of assessment exists
        if (maxScore === 0) {
          return res.status(400).json({ message: "Assessment must contain at least MCQs or coding challenges" });
        }
        
        leaderboardEntry.updateLessonScore(topicId, lessonId, mcqScore, codingScore, maxScore);
        break;

      case 'moduleTest':
        if (!assessmentData) {
          console.warn('Assessment data is undefined for moduleTest type');
          return res.status(400).json({ message: "Assessment data is required" });
        }
        const { topicId: testTopicId, mcqResults: testMcqResults = [], codingResults: testCodingResults = [] } = assessmentData;
        
        // Fetch actual question marks from course model
        const topic = course.topics.find(t => t._id.toString() === testTopicId.toString());
        if (!topic || !topic.moduleTest) {
          return res.status(404).json({ message: "Module test not found for this topic" });
        }
        
        const { mcqs: actualMcqs = [], codeChallenges: actualCodingQuestions = [] } = topic.moduleTest;
        
        // Calculate MCQ score using actual question marks from course model
        const testMcqScore = testMcqResults.length > 0 ? 
          testMcqResults.reduce((total, result, index) => {
            if (result.isCorrect && actualMcqs[index]) {
              return total + actualMcqs[index].marks;
            }
            return total;
          }, 0) : 0;
        
        // Calculate coding score using actual question marks from course model
        const testCodingScore = testCodingResults.length > 0 ? 
          testCodingResults.reduce((total, result, index) => {
            if (result.verdict === 'Accepted' && actualCodingQuestions[index]) {
              return total + actualCodingQuestions[index].marks;
            }
            return total;
          }, 0) : 0;
        
        // Calculate max score using actual question marks from course model
        const testMaxMcqScore = actualMcqs.reduce((total, q) => total + q.marks, 0);
        const testMaxCodingScore = actualCodingQuestions.reduce((total, q) => total + q.marks, 0);
        const testMaxScore = testMaxMcqScore + testMaxCodingScore;
        
        // Ensure at least one type of assessment exists
        if (testMaxScore === 0) {
          return res.status(400).json({ message: "Module test must contain at least MCQs or coding challenges" });
        }
        
        leaderboardEntry.updateModuleTestScore(testTopicId, testMcqScore, testCodingScore, testMaxScore);
        break;

      case 'finalExam':
        if (!assessmentData) {
          console.warn('Assessment data is undefined for finalExam type');
          return res.status(400).json({ message: "Assessment data is required" });
        }
        const { mcqResults: examMcqResults = [], codingResults: examCodingResults = [] } = assessmentData;
        
        // Fetch actual question marks from course final exam
        if (!course.finalExam) {
          return res.status(404).json({ message: "Final exam not found for this course" });
        }
        
        const { mcqs: finalExamMcqs = [], codeChallenges: finalExamCoding = [] } = course.finalExam;
        
        // Calculate final exam scores using actual question marks from course model
        const examMcqScore = examMcqResults.length > 0 ? 
          examMcqResults.reduce((total, result, index) => {
            if (result.isCorrect && finalExamMcqs[index]) {
              return total + finalExamMcqs[index].marks;
            }
            return total;
          }, 0) : 0;
        
        const examCodingScore = examCodingResults.length > 0 ? 
          examCodingResults.reduce((total, result, index) => {
            if (result.verdict === 'Accepted' && finalExamCoding[index]) {
              return total + finalExamCoding[index].marks;
            }
            return total;
          }, 0) : 0;
        
        // Calculate max score using actual question marks from course model
        const examMaxMcqScore = finalExamMcqs.reduce((total, q) => total + q.marks, 0);
        const examMaxCodingScore = finalExamCoding.reduce((total, q) => total + q.marks, 0);
        const examMaxScore = examMaxMcqScore + examMaxCodingScore;
        
        // Ensure at least one type of assessment exists
        if (examMaxScore === 0) {
          return res.status(400).json({ message: "Final exam must contain at least MCQs or coding challenges" });
        }
        
        leaderboardEntry.updateFinalExamScore(examMcqScore, examCodingScore, examMaxScore);
        break;

      default:
        return res.status(400).json({ message: "Invalid assessment type" });
    }

    await leaderboardEntry.save();

    // Update ranks for all users in this course
    await updateCourseRanks(courseId);

    res.json({ 
      message: "Score updated successfully", 
      newScore: leaderboardEntry.overallScore,
      breakdown: {
        lessonScore: leaderboardEntry.totalLessonScore,
        moduleTestScore: leaderboardEntry.totalModuleTestScore,
        finalExamScore: leaderboardEntry.totalFinalExamScore
      }
    });
  } catch (err) {
    console.error('Error updating user course score:', err);
    res.status(500).json({ message: "Error updating user score", error: err.message });
  }
};

// Helper function to update ranks for all users in a course
const updateCourseRanks = async (courseId) => {
  try {
    const leaderboardEntries = await Leaderboard.find({ courseId }).sort({ overallScore: -1 });
    
    for (let i = 0; i < leaderboardEntries.length; i++) {
      const entry = leaderboardEntries[i];
      entry.rank = i + 1;
      entry.percentile = leaderboardEntries.length > 0 ? Math.round(((leaderboardEntries.length - i) / leaderboardEntries.length) * 100) : 100;
      await entry.save();
    }
  } catch (err) {
    console.error("Error updating course ranks:", err);
  }
};

module.exports = { 
  getCourseLeaderboard,
  getUserCourseRank,
  getUserCourseStats,
  updateUserCourseScore
};