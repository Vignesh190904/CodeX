const mongoose = require("mongoose");

// Enhanced SkillTest Schema to include Final Course Exams
const SkillTestSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: Number,
  type: { type: String, enum: ["mcq", "code", "final_exam"] },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  questions: [Object],
  codingProblems: [Object],
  
  // Final Exam specific fields
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  isFinalExam: { type: Boolean, default: false },
  passingScore: { type: Number, default: 70 },
  totalMarks: { type: Number, default: 1000 },
  
  // Security settings for final exams
  securitySettings: {
    preventCopyPaste: { type: Boolean, default: false },
    preventTabSwitch: { type: Boolean, default: false },
    preventRightClick: { type: Boolean, default: false },
    fullScreenRequired: { type: Boolean, default: false },
    webcamMonitoring: { type: Boolean, default: false },
    timeLimit: { type: Number, default: 60 }
  },
  
  // Exam attempts and results
  attempts: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeSpent: Number,
    securityViolations: [mongoose.Schema.Types.Mixed],
    tabSwitchCount: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    autoSubmitted: { type: Boolean, default: false },
    passed: { type: Boolean, default: false }
  }],
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Index for better performance
SkillTestSchema.index({ courseId: 1, isFinalExam: 1 });
SkillTestSchema.index({ type: 1, difficulty: 1 });

module.exports = mongoose.model("SkillTest", SkillTestSchema);