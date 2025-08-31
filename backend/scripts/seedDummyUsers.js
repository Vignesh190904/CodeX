require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

const dummyUsers = [
  {
    name: "Alex Johnson",
    email: "alex.johnson@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2026,
    department: "CSE",
    rollNumber: "MLR2026CSE001",
    gender: "Male",
    codingProfiles: {
      leetcode: "alex_johnson",
      codechef: "alex_j",
      github: "alexjohnson"
    }
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2026,
    department: "AIML",
    rollNumber: "MLR2026AIML001",
    gender: "Female",
    codingProfiles: {
      leetcode: "sarah_chen",
      codechef: "sarah_c",
      github: "sarahchen"
    }
  },
  {
    name: "Michael Rodriguez",
    email: "michael.rodriguez@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2027,
    department: "IT",
    rollNumber: "MLR2027IT001",
    gender: "Male",
    codingProfiles: {
      leetcode: "mike_rod",
      codechef: "mike_r",
      github: "michaelrod"
    }
  },
  {
    name: "Emily Davis",
    email: "emily.davis@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2026,
    department: "CSE",
    rollNumber: "MLR2026CSE002",
    gender: "Female",
    codingProfiles: {
      leetcode: "emily_davis",
      codechef: "emily_d",
      github: "emilydavis"
    }
  },
  {
    name: "David Kim",
    email: "david.kim@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2027,
    department: "CSIT",
    rollNumber: "MLR2027CSIT001",
    gender: "Male",
    codingProfiles: {
      leetcode: "david_kim",
      codechef: "david_k",
      github: "davidkim"
    }
  },
  {
    name: "Lisa Wang",
    email: "lisa.wang@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2026,
    department: "AIML",
    rollNumber: "MLR2026AIML002",
    gender: "Female",
    codingProfiles: {
      leetcode: "lisa_wang",
      codechef: "lisa_w",
      github: "lisawang"
    }
  },
  {
    name: "James Wilson",
    email: "james.wilson@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2027,
    department: "CSD",
    rollNumber: "MLR2027CSD001",
    gender: "Male",
    codingProfiles: {
      leetcode: "james_wilson",
      codechef: "james_w",
      github: "jameswilson"
    }
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2026,
    department: "IT",
    rollNumber: "MLR2026IT001",
    gender: "Female",
    codingProfiles: {
      leetcode: "maria_garcia",
      codechef: "maria_g",
      github: "mariagarcia"
    }
  },
  {
    name: "Robert Taylor",
    email: "robert.taylor@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2027,
    department: "CSE",
    rollNumber: "MLR2027CSE001",
    gender: "Male",
    codingProfiles: {
      leetcode: "robert_taylor",
      codechef: "robert_t",
      github: "roberttaylor"
    }
  },
  {
    name: "Jennifer Lee",
    email: "jennifer.lee@mlrit.edu",
    password: "password123",
    role: "student",
    college: "MLR Institute of Technology",
    year: 2026,
    department: "CSIT",
    rollNumber: "MLR2026CSIT001",
    gender: "Female",
    codingProfiles: {
      leetcode: "jennifer_lee",
      codechef: "jennifer_l",
      github: "jenniferlee"
    }
  }
];

const dummyProblems = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    score: 10,
    testCases: [
      { input: "[2,7,11,15], 9", output: "[0,1]" },
      { input: "[3,2,4], 6", output: "[1,2]" }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    score: 15,
    testCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" }
    ]
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.",
    difficulty: "Easy",
    score: 8,
    testCases: [
      { input: "['h','e','l','l','o']", output: "['o','l','l','e','h']" },
      { input: "['H','a','n','n','a','h']", output: "['h','a','n','n','a','H']" }
    ]
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "Medium",
    score: 25,
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
      { input: "[1]", output: "1" },
      { input: "[5,4,-1,7,8]", output: "23" }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    description: "Merge two sorted linked lists and return it as a sorted list.",
    difficulty: "Medium",
    score: 20,
    testCases: [
      { input: "[1,2,4], [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "[], []", output: "[]" },
      { input: "[], [0]", output: "[0]" }
    ]
  },
  {
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "Medium",
    score: 18,
    testCases: [
      { input: "[1,null,2,3]", output: "[1,3,2]" },
      { input: "[]", output: "[]" },
      { input: "[1]", output: "[1]" }
    ]
  },
  {
    title: "Longest Palindromic Substring",
    description: "Given a string s, return the longest palindromic substring in s.",
    difficulty: "Hard",
    score: 35,
    testCases: [
      { input: "babad", output: "bab" },
      { input: "cbbd", output: "bb" },
      { input: "a", output: "a" }
    ]
  },
  {
    title: "Container With Most Water",
    description: "Given n non-negative integers height where each represents a point at coordinate (i, height[i]), find two lines that together with the x-axis form a container that would hold the maximum amount of water.",
    difficulty: "Hard",
    score: 30,
    testCases: [
      { input: "[1,8,6,2,5,4,8,3,7]", output: "49" },
      { input: "[1,1]", output: "1" }
    ]
  }
];

// Generate random submissions for users
const generateSubmissions = (users, problems) => {
  const submissions = [];
  
  users.forEach((user, userIndex) => {
    // Each user solves a random number of problems (3-8 problems)
    const numProblemsToSolve = Math.floor(Math.random() * 6) + 3;
    const shuffledProblems = [...problems].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numProblemsToSolve; i++) {
      const problem = shuffledProblems[i];
      
      // Create successful submission
      submissions.push({
        user: user._id,
        problem: problem._id,
        code: `// Solution for ${problem.title}\nfunction solution() {\n  // Implementation here\n}`,
        language: "javascript",
        isSuccess: true,
        executionTime: Math.floor(Math.random() * 100) + 10, // 10-110ms
        memoryUsed: Math.floor(Math.random() * 50) + 5, // 5-55MB
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
      });
      
      // Sometimes add a failed attempt before success
      if (Math.random() > 0.7) {
        submissions.push({
          user: user._id,
          problem: problem._id,
          code: `// Failed attempt for ${problem.title}\nfunction wrongSolution() {\n  return null;\n}`,
          language: "javascript",
          isSuccess: false,
          executionTime: Math.floor(Math.random() * 100) + 10,
          memoryUsed: Math.floor(Math.random() * 50) + 5,
          submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
    }
  });
  
  return submissions;
};

(async function run() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({ email: { $regex: /@mlrit\.edu$/ } });
    await Problem.deleteMany({ title: { $in: dummyProblems.map(p => p.title) } });
    await Submission.deleteMany({});

    // Create dummy problems
    console.log('Creating dummy problems...');
    const createdProblems = [];
    for (const problemData of dummyProblems) {
      const problem = new Problem(problemData);
      const savedProblem = await problem.save();
      createdProblems.push(savedProblem);
      console.log(`Created problem: ${savedProblem.title}`);
    }

    // Create dummy users
    console.log('Creating dummy users...');
    const createdUsers = [];
    for (const userData of dummyUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.name} (${savedUser.email})`);
    }

    // Generate and create submissions
    console.log('Creating submissions...');
    const submissions = generateSubmissions(createdUsers, createdProblems);
    
    for (const submissionData of submissions) {
      const submission = new Submission(submissionData);
      await submission.save();
    }
    
    console.log(`Created ${submissions.length} submissions`);

    // Display leaderboard summary
    console.log('\n=== LEADERBOARD SUMMARY ===');
    const leaderboard = await Submission.aggregate([
      { $match: { isSuccess: true } },
      { $group: { _id: { user: "$user", problem: "$problem" }, submissionId: { $first: "$_id" } } },
      { $group: { _id: "$_id.user", problems: { $addToSet: "$_id.problem" } } },
      { $lookup: { from: "problems", localField: "problems", foreignField: "_id", as: "problemDetails" } },
      { $addFields: { totalScore: { $sum: "$problemDetails.score" }, totalSolved: { $size: "$problems" } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
      { $unwind: "$userDetails" },
      { $project: { 
        name: "$userDetails.name", 
        department: "$userDetails.department", 
        totalScore: 1, 
        totalSolved: 1 
      } },
      { $sort: { totalScore: -1 } },
    ]);

    leaderboard.forEach((entry, idx) => {
      console.log(`${idx + 1}. ${entry.name} (${entry.department}) - Score: ${entry.totalScore}, Solved: ${entry.totalSolved}`);
    });

    console.log('\n✅ Dummy data seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users, ${createdProblems.length} problems, and ${submissions.length} submissions`);
    console.log('🎯 You can now test the leaderboard features with this data');

  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})();
