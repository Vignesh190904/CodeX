const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  code: String,
  language: String,
  isSuccess: Boolean,
  submittedAt: { type: Date, default: Date.now },
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
