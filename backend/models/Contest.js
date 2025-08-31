const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

module.exports = mongoose.model("Contest", contestSchema);
