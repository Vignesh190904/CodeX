// models/Leaderboard.js
const mongoose = require("mongoose");

// Individual Assessment Score Schema
const assessmentScoreSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['lesson', 'moduleTest', 'finalExam'], 
    required: true 
  },
  topicId: { type: mongoose.Schema.Types.ObjectId }, // For lesson and moduleTest
  lessonId: { type: mongoose.Schema.Types.ObjectId }, // For lesson only
  mcqScore: { type: Number, default: 0 },
  codingScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
}, { _id: false });

const leaderboardSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course", 
    required: true 
  },
  
  // Detailed Score Breakdown
  lessonScores: [assessmentScoreSchema],
  moduleTestScores: [assessmentScoreSchema],
  finalExamScore: assessmentScoreSchema,
  
  // Aggregate Scores
  totalLessonScore: { type: Number, default: 0 },
  totalModuleTestScore: { type: Number, default: 0 },
  totalFinalExamScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  
  // Ranking and Performance
  rank: { type: Number },
  percentile: { type: Number },
  
  // Progress Tracking
  lessonsCompleted: { type: Number, default: 0 },
  moduleTestsCompleted: { type: Number, default: 0 },
  finalExamCompleted: { type: Boolean, default: false },
  
  // Performance Metrics
  averageScore: { type: Number, default: 0 },
  strongestArea: { type: String }, // 'mcq' or 'coding'
  improvementAreas: [{ type: String }],
  
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index for efficient querying
leaderboardSchema.index({ courseId: 1, overallScore: -1 });
leaderboardSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Methods to calculate scores
leaderboardSchema.methods.calculateOverallScore = function() {
  this.overallScore = this.totalLessonScore + this.totalModuleTestScore + this.totalFinalExamScore;
  this.averageScore = this.overallScore / (this.lessonsCompleted + this.moduleTestsCompleted + (this.finalExamCompleted ? 1 : 0)) || 0;
  return this.overallScore;
};

leaderboardSchema.methods.updateLessonScore = function(topicId, lessonId, mcqScore, codingScore, maxScore) {
  const existingIndex = this.lessonScores.findIndex(
    score => score.topicId.toString() === topicId.toString() && 
             score.lessonId.toString() === lessonId.toString()
  );
  
  const scoreData = {
    type: 'lesson',
    topicId,
    lessonId,
    mcqScore,
    codingScore,
    totalScore: mcqScore + codingScore,
    maxScore,
    completedAt: new Date()
  };
  
  if (existingIndex >= 0) {
    this.lessonScores[existingIndex] = scoreData;
  } else {
    this.lessonScores.push(scoreData);
    this.lessonsCompleted += 1;
  }
  
  this.totalLessonScore = this.lessonScores.reduce((sum, score) => sum + score.totalScore, 0);
  this.calculateOverallScore();
  this.lastUpdated = new Date();
};

leaderboardSchema.methods.updateModuleTestScore = function(topicId, mcqScore, codingScore, maxScore) {
  const existingIndex = this.moduleTestScores.findIndex(
    score => score.topicId.toString() === topicId.toString()
  );
  
  const scoreData = {
    type: 'moduleTest',
    topicId,
    mcqScore,
    codingScore,
    totalScore: mcqScore + codingScore,
    maxScore,
    completedAt: new Date()
  };
  
  if (existingIndex >= 0) {
    this.moduleTestScores[existingIndex] = scoreData;
  } else {
    this.moduleTestScores.push(scoreData);
    this.moduleTestsCompleted += 1;
  }
  
  this.totalModuleTestScore = this.moduleTestScores.reduce((sum, score) => sum + score.totalScore, 0);
  this.calculateOverallScore();
  this.lastUpdated = new Date();
};

leaderboardSchema.methods.updateFinalExamScore = function(mcqScore, codingScore, maxScore) {
  this.finalExamScore = {
    type: 'finalExam',
    mcqScore,
    codingScore,
    totalScore: mcqScore + codingScore,
    maxScore,
    completedAt: new Date()
  };
  
  this.totalFinalExamScore = this.finalExamScore.totalScore;
  this.finalExamCompleted = true;
  this.calculateOverallScore();
  this.lastUpdated = new Date();
};

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
