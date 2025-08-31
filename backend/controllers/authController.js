const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role, college, year, department, rollNumber } = req.body;

  try {
    console.log("Incoming role:", role);

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!["MLR Institute of Technology", "Marri Laxman Reddy College", "IARE"].includes(college)) {
      return res.status(400).json({ message: "Invalid college" });
    }
    // Fix: Validate year against allowed academic years
    const allowedYears = [2026,2027,2028,2029,2030,2031,2032,2033,2034,2035,2036,2037,2038,2039,2040];
    if (!allowedYears.includes(Number(year))) {
      return res.status(400).json({ message: "Invalid year" });
    }
    if (!["AIML", "CSE", "IT", "CSIT", "CSD"].includes(department)) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password, role, college, year, department, rollNumber });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.status(200).json({ token, role: user.role, userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
