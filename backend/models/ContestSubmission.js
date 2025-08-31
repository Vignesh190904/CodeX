const mongoose = require("mongoose");

const contestSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  code: String,
  language: String,
  isSuccess: Boolean,
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.ContestSubmission || mongoose.model("ContestSubmission", contestSubmissionSchema);
