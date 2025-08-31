const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  question: String,
  options: [String],
  correctAnswer: Number, // index 0-3
});

module.exports = mongoose.model("Test", TestSchema);
