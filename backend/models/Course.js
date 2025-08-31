const mongoose = require('mongoose');

// MCQ Question Sub-Schema
const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: v => v.length >= 2
  },
  correct: {
    type: Number,
    required: true,
    validate: {
      validator: function(val) {
        return val >= 0 && val < this.options.length;
      },
      message: 'Correct index must be within options range'
    }
  },
  explanation: String,
  marks: { 
    type: Number, 
    required: true, 
    default: 1,
    min: [0.5, 'Marks must be at least 0.5'],
    max: [100, 'Marks cannot exceed 100']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { _id: false });

// Debug pre-save hook for MCQs
mcqSchema.pre('save', function (next) {
  console.log('Saving MCQ:', {
    question: this.question,
    optionsCount: this.options.length,
    correct: this.correct,
    hasExplanation: !!this.explanation
  });
  next();
});

// Debug pre-validate hook for MCQs
mcqSchema.pre('validate', function (next) {
  console.log('Validating MCQ:', {
    question: this.question,
    optionsCount: this.options?.length || 0,
    options: this.options || [],
    correct: this.correct,
    hasExplanation: !!this.explanation
  });
  next();
});

// Coding Challenge Sub-Schema
const codeChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sampleInput: String,
  sampleOutput: String,
  constraints: String,
  initialCode: String,
  language: { type: String, default: 'python' },
  marks: { 
    type: Number, 
    required: true, 
    default: 2,
    min: [1, 'Marks must be at least 1'],
    max: [100, 'Marks cannot exceed 100']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number,
    default: 30, // seconds
    min: [5, 'Time limit must be at least 5 seconds'],
    max: [300, 'Time limit cannot exceed 300 seconds']
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }]
}, { _id: false });

// Debug pre-save hook for coding challenges
codeChallengeSchema.pre('save', function (next) {
  console.log('Saving coding challenge:', {
    title: this.title,
    description: this.description,
    language: this.language
  });
  next();
});

// Debug pre-validate hook for coding challenges
codeChallengeSchema.pre('validate', function (next) {
  console.log('Validating coding challenge:', {
    title: this.title,
    description: this.description,
    language: this.language
  });
  next();
});

// Lesson Sub-Schema (Strictly Enforcing Your Rules)
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['lesson'], 
    default: 'lesson' 
  },
  content: { type: String, required: true }, // Theory section
  review: { type: String, required: true },  // Review section
  mcqs: {
    type: [mcqSchema],
    validate: {
      validator: function(v) {
        // Allow empty MCQs array, but if present, must have at least 1
        return Array.isArray(v) && (v.length === 0 || v.length >= 1);
      },
      message: 'MCQs must be an array with 0 or more questions'
    },
    default: []
  },
  codeChallenges: {
    type: [codeChallengeSchema],
    validate: {
      validator: function(v) {
        // Allow empty coding challenges array, but if present, must have at least 1
        return Array.isArray(v) && (v.length === 0 || v.length >= 1);
      },
      message: 'Coding challenges must be an array with 0 or more questions'
    },
    default: []
  },
  order: { type: Number, default: 0 },
  duration: { type: String, default: '5-10 min' }
});

// Debug pre-save hook for lessons
lessonSchema.pre('save', function (next) {
  console.log('Saving lesson:', {
    title: this.title,
    mcqsCount: this.mcqs.length,
    codeChallengesCount: this.codeChallenges.length
  });
  next();
});

// Debug pre-validate hook for lessons
lessonSchema.pre('validate', function (next) {
  console.log('Validating lesson:', {
    title: this.title,
    mcqsCount: this.mcqs?.length || 0,
    codeChallengesCount: this.codeChallenges?.length || 0,
    mcqs: this.mcqs?.map(mcq => ({
      question: mcq.question,
      optionsCount: mcq.options?.length || 0,
      correct: mcq.correct,
      hasExplanation: !!mcq.explanation
    })) || [],
    codeChallenges: this.codeChallenges?.map(challenge => ({
      title: challenge.title,
      description: challenge.description
    })) || []
  });
  next();
});

// Topic Sub-Schema
const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true, default: 0 },
  lessons: [lessonSchema],
  moduleTest: {
    mcqs: {
      type: [mcqSchema],
      default: []
    },
    codeChallenges: {
      type: [codeChallengeSchema], 
      default: []
    },
    totalMarks: Number
  }
});

// Debug pre-save hook for topics
topicSchema.pre('save', function (next) {
  console.log('Saving topic:', {
    title: this.title,
    order: this.order,
    lessonsCount: this.lessons.length
  });
  next();
});

// Debug pre-validate hook for topics
topicSchema.pre('validate', function (next) {
  console.log('Validating topic:', {
    title: this.title,
    order: this.order,
    lessonsCount: this.lessons?.length || 0
  });
  next();
});

// Scoring Configuration Schema
const scoringConfigSchema = new mongoose.Schema({
  mcqMarks: { type: Number, required: true, default: 10 }, // Marks per correct MCQ
  codingMarks: { type: Number, required: true, default: 50 }, // Marks per correct coding challenge
  lessonMcqMarks: { type: Number, required: true, default: 5 }, // Marks per lesson MCQ
  lessonCodingMarks: { type: Number, required: true, default: 25 }, // Marks per lesson coding challenge
  moduleTestMcqMarks: { type: Number, required: true, default: 15 }, // Marks per module test MCQ
  moduleTestCodingMarks: { type: Number, required: true, default: 75 }, // Marks per module test coding challenge
  finalExamMcqMarks: { type: Number, required: true, default: 20 }, // Marks per final exam MCQ
  finalExamCodingMarks: { type: Number, required: true, default: 100 } // Marks per final exam coding challenge
}, { _id: false });

// Final Course Exam Schema
const finalExamSchema = new mongoose.Schema({
  title: { type: String, default: 'Final Course Assessment' },
  description: { type: String, default: 'Comprehensive assessment covering all course topics' },
  mcqs: {
    type: [mcqSchema],
    validate: {
      validator: function(v) {
        // MCQs are optional, but if present, must have at least 1
        return Array.isArray(v) && (v.length === 0 || v.length >= 1);
      },
      message: 'Final exam MCQs must be an array with 0 or more questions'
    },
    default: []
  },
  codeChallenges: {
    type: [codeChallengeSchema],
    validate: {
      validator: function(v) {
        // Coding challenges are optional, but if present, must have at least 1
        return Array.isArray(v) && (v.length === 0 || v.length >= 1);
      },
      message: 'Final exam coding challenges must be an array with 0 or more questions'
    },
    default: []
  },
  totalMarks: { type: Number, default: 1000 },
  duration: { type: Number, default: 120 }, // minutes
  passingScore: { type: Number, default: 70 }, // percentage
  isSecure: { type: Boolean, default: true },
  securitySettings: {
    preventCopyPaste: { type: Boolean, default: true },
    preventTabSwitch: { type: Boolean, default: true },
    preventRightClick: { type: Boolean, default: true },
    fullScreenRequired: { type: Boolean, default: true },
    webcamMonitoring: { type: Boolean, default: false },
    timeLimit: { type: Number, default: 120 } // minutes
  },
  isActive: { type: Boolean, default: true }
});

// Debug pre-save hook for final exam
finalExamSchema.pre('save', function (next) {
  console.log('Saving final exam:', {
    title: this.title,
    mcqsCount: this.mcqs?.length || 0,
    codeChallengesCount: this.codeChallenges?.length || 0
  });
  next();
});

// Debug pre-validate hook for final exam
finalExamSchema.pre('validate', function (next) {
  console.log('Validating final exam:', {
    title: this.title,
    mcqsCount: this.mcqs?.length || 0,
    codeChallengesCount: this.codeChallenges?.length || 0
  });
  next();
});

// Unified Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'], default: 'medium' },
  topics: {
    type: [topicSchema],
    default: []
  },
  finalExam: {
    type: finalExamSchema,
    default: null
  },
  scoringConfig: {
    type: scoringConfigSchema,
    default: function() {
      return {
        mcqMarks: 10,
        codingMarks: 50,
        lessonMcqMarks: 5,
        lessonCodingMarks: 25,
        moduleTestMcqMarks: 15,
        moduleTestCodingMarks: 75,
        finalExamMcqMarks: 20,
        finalExamCodingMarks: 100
      };
    }
  },
  testUnlockThreshold: { type: Number, default: 80 },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  enrolledCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Auto-update enrolled count
courseSchema.pre('save', function (next) {
  this.enrolledCount = this.enrolledUsers.length;
  next();
});

// Normalize difficulty to lowercase for consistency
courseSchema.pre('save', function (next) {
  if (this.difficulty) {
    this.difficulty = this.difficulty.toLowerCase();
  }
  next();
});

// Debug pre-save hook
courseSchema.pre('save', function (next) {
  console.log('Saving course with data:', {
    title: this.title,
    topicsCount: this.topics.length,
    topics: this.topics.map(topic => ({
      title: topic.title,
      order: topic.order,
      lessonsCount: topic.lessons.length
    }))
  });
  next();
});

// Debug pre-validate hook
courseSchema.pre('validate', function (next) {
  console.log('Validating course with data:', {
    title: this.title,
    topicsCount: this.topics.length,
    topics: this.topics.map(topic => ({
      title: topic.title,
      order: topic.order,
      lessonsCount: topic.lessons.length,
      lessons: topic.lessons.map(lesson => ({
        title: lesson.title,
        mcqsCount: lesson.mcqs?.length || 0,
        codeChallengesCount: lesson.codeChallenges?.length || 0
      }))
    }))
  });
  next();
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
