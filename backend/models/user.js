const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String, // ✅ stores path like "/uploads/profile-pics/user123.jpg"
    default: "",  // optional default value
  },
  college: {
    type: String,
    enum: ["MLR Institute of Technology", "Marri Laxman Reddy College", "IARE"],
    required: true,
  },
  year: {
    type: Number,
    enum: [2026,2027,2028,2029,2030,2031,2032,2033,2034,2035,2036,2037,2038,2039,2040],
    required: true,
  },
  department: {
    type: String,
    enum: ["AIML", "CSE", "IT", "CSIT", "CSD"],
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  codingProfiles: {
    leetcode: { type: String },
    codechef: { type: String },
    github: { type: String },
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
