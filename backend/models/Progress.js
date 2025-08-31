const mongoose = require("mongoose");

// Lesson progress within a topic
const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // in minutes
}, { _id: false });

// Progress on module test inside a topic
const moduleTestProgressSchema = new mongoose.Schema({
  attempted: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  attemptedAt: { type: Date }
}, { _id: false });

// Topic progress
const topicProgressSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, required: true },
  lessons: [lessonProgressSchema],
  moduleTest: moduleTestProgressSchema,
  completed: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date }
}, { _id: false });

// Main course progress schema
const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  topicsProgress: [topicProgressSchema],
  overallProgress: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Indexes
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// 🔁 Calculate course progress (based on topics)
progressSchema.methods.calculateOverallProgress = function () {
  const totalTopics = this.topicsProgress.length;
  const completedTopics = this.topicsProgress.filter(tp => tp.completed).length;
  return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
};

// ✅ Update lesson or topic
progressSchema.methods.updateLessonProgress = function (topicId, lessonId, progressUpdate) {
  let topic = this.topicsProgress.find(tp => tp.topicId.equals(topicId));
  if (!topic) {
    topic = { topicId, lessons: [], completed: false, completionPercentage: 0 };
    this.topicsProgress.push(topic);
  }

  let lesson = topic.lessons.find(lp => lp.lessonId.equals(lessonId));
  if (!lesson) {
    lesson = { lessonId, completed: false };
    topic.lessons.push(lesson);
  }

  Object.assign(lesson, progressUpdate);
  if (progressUpdate.completed) {
    lesson.completedAt = new Date();
  }

  const totalLessons = topic.lessons.length;
  const completedLessons = topic.lessons.filter(lp => lp.completed).length;
  topic.completionPercentage = Math.round((completedLessons / totalLessons) * 100);
  topic.completed = topic.completionPercentage === 100;

  if (topic.completed && !topic.completedAt) {
    topic.completedAt = new Date();
  }

  this.overallProgress = this.calculateOverallProgress();
  this.lastAccessedAt = new Date();

  return this.save();
};

// ✅ Update test result
progressSchema.methods.updateModuleTestProgress = function (topicId, score, total) {
  let topic = this.topicsProgress.find(tp => tp.topicId.equals(topicId));
  if (!topic) {
    topic = { topicId, lessons: [], completed: false, completionPercentage: 0 };
    this.topicsProgress.push(topic);
  }

  topic.moduleTest = {
    attempted: true,
    score,
    total,
    attemptedAt: new Date()
  };

  return this.save();
};

module.exports = mongoose.model("Progress", progressSchema);
