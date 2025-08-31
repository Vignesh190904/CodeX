const mongoose = require("mongoose");
const Leaderboard = require("../models/Leaderboard");
const User = require("../models/user");
const Course = require("../models/Course");
const UserProgress = require("../models/UserProgress");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");

// Get course-specific leaderboard
const getCourseLeaderboard = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const leaderboard = await Leaderboard.find({ courseId })
      .populate('userId', 'name email rollNumber year department college')
      .sort({ overallScore: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Calculate ranks and percentiles
    const totalUsers = await Leaderboard.countDocuments({ courseId });
    
    const leaderboardWithRanks = leaderboard.map((entry, index) => {
      const rank = (parseInt(page) - 1) * parseInt(limit) + index + 1;
      const percentile = Math.round(((totalUsers - rank + 1) / totalUsers) * 100);
      
      return {
        ...entry.toObject(),
        rank,
        percentile,
        user: entry.userId
      };
    });

    res.json({
      leaderboard: leaderboardWithRanks,
      totalUsers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching course leaderboard", error: err.message });
  }
};

// Get overall leaderboard (all users in same college) - based on problem submissions
const getLeaderboard = async (req, res) => {
  try {
    console.log('Leaderboard request received');
    console.log('User from request:', req.user);
    
    // Get the requesting user's college
    const userId = req.user.id;
    console.log('User ID:', userId);
    
    const user = await User.findById(userId);
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: "User not found" });
    }
    
    const college = user.college;
    console.log('User college:', college);
    
    if (!college) {
      console.log('User college not set');
      return res.status(400).json({ message: "User college not set" });
    }

    // Get all users in the same college
    const usersInCollege = await User.find({ college }).select("_id name email rollNumber year department college");

    // Get submission data for users who have submissions
    const submissionData = await Submission.aggregate([
      { $match: { isSuccess: true, user: { $in: usersInCollege.map(u => u._id) } } },
      // Only count the first successful submission per problem per user
      { $group: { _id: { user: "$user", problem: "$problem" }, submissionId: { $first: "$_id" } } },
      // Group by user and collect unique problems
      { $group: { _id: "$_id.user", problems: { $addToSet: "$_id.problem" } } },
      // Lookup problem scores
      { $lookup: { from: "problems", localField: "problems", foreignField: "_id", as: "problemDetails" } },
      // Sum the scores
      { $addFields: { totalScore: { $sum: "$problemDetails.score" }, totalSolved: { $size: "$problems" } } }
    ]);

    // Create a map of user submissions for quick lookup
    const submissionMap = {};
    submissionData.forEach(entry => {
      submissionMap[entry._id.toString()] = {
        totalScore: entry.totalScore,
        totalSolved: entry.totalSolved
      };
    });

    // Create leaderboard with all college users
    const leaderboard = usersInCollege.map(user => {
      const submissions = submissionMap[user._id.toString()] || { totalScore: 0, totalSolved: 0 };
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        rollNumber: user.rollNumber,
        year: user.year,
        department: user.department,
        totalScore: submissions.totalScore,
        totalSolved: submissions.totalSolved
      };
    });

    // Sort by totalScore (descending) and add ranks
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    leaderboard.forEach((entry, idx) => { 
      entry.rank = idx + 1;
      entry.percentile = Math.round(((leaderboard.length - idx) / leaderboard.length) * 100);
    });

    console.log('Final leaderboard data:', leaderboard);
    console.log('Leaderboard length:', leaderboard.length);
    console.log('Is array:', Array.isArray(leaderboard));
    
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
  }
};

// Get user's rank in specific course
const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.query;

    if (courseId) {
      // Get rank in specific course
      const userEntry = await Leaderboard.findOne({ userId, courseId });
      if (!userEntry) {
        // Create a default entry if user hasn't started any assessments yet
        const newEntry = new Leaderboard({ userId, courseId });
        await newEntry.save();
        
        return res.json({
          rank: 1,
          totalUsers: 1,
          percentile: 100,
          score: 0,
          courseId
        });
      }

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
    } else {
      // Get overall rank across all courses
      const userScores = await Leaderboard.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$userId",
            totalScore: { $sum: "$overallScore" }
          }
        }
      ]);

      if (userScores.length === 0) {
        return res.status(404).json({ message: "User not found in any leaderboard" });
      }

      const userTotalScore = userScores[0].totalScore;
      
      const higherScores = await Leaderboard.aggregate([
        {
          $group: {
            _id: "$userId",
            totalScore: { $sum: "$overallScore" }
          }
        },
        { $match: { totalScore: { $gt: userTotalScore } } },
        { $count: "count" }
      ]);

      const rank = (higherScores[0]?.count || 0) + 1;
      const totalUsers = await Leaderboard.distinct("userId").then(users => users.length);
      const percentile = Math.round(((totalUsers - rank + 1) / totalUsers) * 100);

      res.json({
        rank,
        totalUsers,
        percentile,
        totalScore: userTotalScore
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching user rank", error: err.message });
  }
};

// Get detailed user statistics
const getDetailedUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.query;

    let userStats = await Leaderboard.findOne({ userId, courseId })
      .populate('userId', 'name email rollNumber')
      .populate('courseId', 'title');

    if (!userStats) {
      // Create a default entry if user hasn't started any assessments yet
      const newEntry = new Leaderboard({ userId, courseId });
      await newEntry.save();
      
      userStats = await Leaderboard.findOne({ userId, courseId })
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
    const weakestArea = totalMcqScore < totalCodingScore ? 'MCQ' : 'Coding';

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
        weakestArea,
        totalMcqScore,
        totalCodingScore,
        averageScore: userStats.averageScore
      },
      progress: {
        lessonsCompleted: userStats.lessonsCompleted,
        moduleTestsCompleted: userStats.moduleTestsCompleted,
        finalExamCompleted: userStats.finalExamCompleted
      },
      rank: userStats.rank,
      percentile: userStats.percentile,
      lastUpdated: userStats.lastUpdated
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user statistics", error: err.message });
  }
};

// Update user score (called when assessments are completed)
const updateUserScore = async (req, res) => {
  try {
    const { userId, courseId, assessmentType, assessmentData } = req.body;

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
        const { topicId, lessonId, mcqResults, codingResults } = assessmentData;
        
        // Calculate scores based on correct answers
        const mcqScore = mcqResults.filter(r => r.isCorrect).length * scoringConfig.lessonMcqMarks;
        const codingScore = codingResults.filter(r => r.verdict === 'Accepted').length * scoringConfig.lessonCodingMarks;
        const maxScore = (mcqResults.length * scoringConfig.lessonMcqMarks) + (codingResults.length * scoringConfig.lessonCodingMarks);
        
        leaderboardEntry.updateLessonScore(topicId, lessonId, mcqScore, codingScore, maxScore);
        break;

      case 'moduleTest':
        const { topicId: testTopicId, mcqResults: testMcqResults, codingResults: testCodingResults } = assessmentData;
        
        const testMcqScore = testMcqResults.filter(r => r.isCorrect).length * scoringConfig.moduleTestMcqMarks;
        const testCodingScore = testCodingResults.filter(r => r.verdict === 'Accepted').length * scoringConfig.moduleTestCodingMarks;
        const testMaxScore = (testMcqResults.length * scoringConfig.moduleTestMcqMarks) + (testCodingResults.length * scoringConfig.moduleTestCodingMarks);
        
        leaderboardEntry.updateModuleTestScore(testTopicId, testMcqScore, testCodingScore, testMaxScore);
        break;

      case 'finalExam':
        const { mcqResults: examMcqResults, codingResults: examCodingResults } = assessmentData;
        
        const examMcqScore = examMcqResults.filter(r => r.isCorrect).length * scoringConfig.finalExamMcqMarks;
        const examCodingScore = examCodingResults.filter(r => r.verdict === 'Accepted').length * scoringConfig.finalExamCodingMarks;
        const examMaxScore = (examMcqResults.length * scoringConfig.finalExamMcqMarks) + (examCodingResults.length * scoringConfig.finalExamCodingMarks);
        
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
      entry.percentile = Math.round(((leaderboardEntries.length - i) / leaderboardEntries.length) * 100);
      await entry.save();
    }
  } catch (err) {
    console.error("Error updating course ranks:", err);
  }
};

module.exports = { 
  getLeaderboard, 
  getUserRank, 
  updateUserScore,
  getCourseLeaderboard,
  getDetailedUserStats
};