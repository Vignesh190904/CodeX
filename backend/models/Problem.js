// models/Problem.js
const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  problemNumber: { type: Number, unique: true, sparse: true }, // Made optional initially
  title: { type: String, required: true },
  difficulty: { type: String, required: true }, // e.g., Easy, Medium, Hard
  score: { type: Number, required: true },
  description: { type: String }, // Keep for backward compatibility
  problemStatement: { type: String }, // New field
  inputFormat: { type: String, default: "" },
  outputFormat: { type: String, default: "" },
  constraints: [{ type: String }],
  sampleTestCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String, required: true },
    },
  ],
  hiddenTestCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
  tags: [{ type: String }],
});

// Pre-save hook to handle backward compatibility and auto-assign problem number
problemSchema.pre('save', async function(next) {
  // If problemStatement is provided but description is not, copy it
  if (this.problemStatement && !this.description) {
    this.description = this.problemStatement;
  }
  // If description is provided but problemStatement is not, copy it
  if (this.description && !this.problemStatement) {
    this.problemStatement = this.description;
  }
  
  // Auto-assign problem number if not provided
  if (!this.problemNumber) {
    try {
      const count = await mongoose.model('Problem').countDocuments();
      this.problemNumber = count + 1;
    } catch (error) {
      console.error('Error getting problem count:', error);
      this.problemNumber = 1; // Fallback
    }
  }
  
  next();
});

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;