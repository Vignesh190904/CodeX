const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Course = require("../models/Course");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Health check endpoint (no authentication required)
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Course API is running" });
});

// Update basic course information (Admin only) - Simplified version
router.patch(
  "/:id/basic",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      console.log('Received basic update request:', req.body);
      console.log('Course ID:', req.params.id);
      
      // First check if course exists
      const existingCourse = await Course.findById(req.params.id);
      if (!existingCourse) {
        console.log('Course not found with ID:', req.params.id);
        return res.status(404).json({ message: "Course not found" });
      }
      
      console.log('Found existing course:', existingCourse.title);
      
      // Create update object with only basic fields
      const updateData = {};
      if (req.body.title !== undefined && req.body.title.trim()) {
        updateData.title = req.body.title.trim();
      }
      if (req.body.description !== undefined && req.body.description.trim()) {
        updateData.description = req.body.description.trim();
      }
      if (req.body.difficulty !== undefined && ["Easy", "Medium", "Hard"].includes(req.body.difficulty)) {
        updateData.difficulty = req.body.difficulty;
      }

      console.log('Updating basic course info with data:', updateData);

      // Use findOneAndUpdate to avoid validation issues
      const course = await Course.findOneAndUpdate(
        { _id: req.params.id }, 
        { $set: updateData }, 
        { new: true, runValidators: false }
      );
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      console.log('Basic course info updated successfully:', course.title);
      res.json(course);
    } catch (err) {
      console.error('Error updating basic course info:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

// Helper: Validate lessons according to new schema rules
function validateLessonStructure(topics) {
  if (!Array.isArray(topics)) return false;

  for (const topic of topics) {
    if (!Array.isArray(topic.lessons)) return false;

    for (const lesson of topic.lessons) {
      if (!lesson.content || !lesson.review) {
        return { valid: false, message: `Lesson "${lesson.title}" must have content and review.` };
      }
      if (!Array.isArray(lesson.mcqs) || lesson.mcqs.length !== 2) {
        return { valid: false, message: `Lesson "${lesson.title}" must have exactly 2 MCQs.` };
      }
      if (!Array.isArray(lesson.codeChallenges) || lesson.codeChallenges.length !== 2) {
        return { valid: false, message: `Lesson "${lesson.title}" must have exactly 2 coding challenges.` };
      }
    }
  }
  return { valid: true };
}

// Create new course with topics and lessons (Admin only)
router.post(
  "/",
  authenticateToken,
  isAdmin,
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]),
    body("topics").isArray(),
    body("testUnlockThreshold").optional().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const lessonCheck = validateLessonStructure(req.body.topics);
    if (!lessonCheck.valid) {
      return res.status(400).json({ message: lessonCheck.message });
    }

    try {
      const course = new Course(req.body);
      await course.save();
      res.status(201).json(course);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// List all courses
router.get("/", authenticateToken, async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Get course details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    console.log(`Fetching course with ID: ${req.params.id}`);
    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log(`Course not found: ${req.params.id}`);
      return res.status(404).json({ message: "Course not found" });
    }
    console.log(`Course found: ${course.title}`);
    res.json(course);
  } catch (err) {
    console.error(`Error fetching course ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Get course about content
router.get("/:id/about", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    // Generate comprehensive about content based on course data
    const aboutContent = {
      title: `About ${course.title}`,
      content: `
        <h2>Course Overview</h2>
        <p>${course.description}</p>
        
        <h3>What You'll Learn</h3>
        <p>This comprehensive course will take you from beginner to advanced level through interactive lessons, coding challenges, and real-world projects.</p>
        
        <h3>Course Structure</h3>
        <p>This course is structured into <strong>${course.topics?.length || 0} comprehensive modules</strong>, each designed to build upon the previous knowledge and provide hands-on experience.</p>
        
        <h3>Difficulty Level</h3>
        <p>This course is designed for <strong>${course.difficulty === 'easy' || course.difficulty === 'Easy' ? 'Beginner' : 
          course.difficulty === 'medium' || course.difficulty === 'Medium' ? 'Intermediate' : 'Advanced'}</strong> level learners. Whether you're just starting out or looking to enhance your existing skills, this course provides the perfect learning path.</p>
        
        <h3>Learning Objectives</h3>
        <ul>
          <li>Master fundamental concepts and principles</li>
          <li>Build practical coding projects</li>
          <li>Learn industry best practices</li>
          <li>Prepare for technical interviews</li>
          <li>Develop problem-solving skills</li>
          <li>Gain hands-on experience with real-world scenarios</li>
        </ul>
        
        <h3>Prerequisites</h3>
        <p>No prior experience is required for this course. It's designed to be accessible to beginners while providing valuable insights for intermediate learners.</p>
        
        <h3>Course Features</h3>
        <ul>
          <li><strong>Interactive Lessons:</strong> Engaging content with practical examples</li>
          <li><strong>Coding Challenges:</strong> Hands-on practice with real problems</li>
          <li><strong>Knowledge Assessments:</strong> Test your understanding with quizzes</li>
          <li><strong>Final Exam:</strong> Comprehensive evaluation of your learning</li>
          <li><strong>Certificate:</strong> Earn a certificate upon completion</li>
        </ul>
        
        <h3>Learning Outcomes</h3>
        <p>By the end of this course, you will have:</p>
        <ul>
          <li>A solid understanding of ${course.title.toLowerCase()} fundamentals</li>
          <li>Practical experience with real-world applications</li>
          <li>Confidence to tackle complex problems</li>
          <li>Portfolio of projects to showcase your skills</li>
          <li>Industry-recognized certification</li>
        </ul>
        
        <h3>Support and Resources</h3>
        <p>Throughout your learning journey, you'll have access to:</p>
        <ul>
          <li>Comprehensive course materials</li>
          <li>Interactive coding environment</li>
          <li>Progress tracking and analytics</li>
          <li>Community support and discussions</li>
        </ul>
        
        <blockquote>
          <p>"The best way to learn is by doing. This course provides you with the perfect balance of theory and practice to master ${course.title.toLowerCase()}."</p>
        </blockquote>
        
        <h3>Ready to Start?</h3>
        <p>Enroll now and begin your journey to mastering ${course.title.toLowerCase()}. With our structured approach and hands-on learning methodology, you'll be well-equipped to succeed in your learning goals.</p>
      `
    };
    
    res.json(aboutContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update course (Admin only)
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  [
    body("title").optional().notEmpty(),
    body("description").optional().notEmpty(),
    body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]),
    body("topics").optional().isArray(),
    body("testUnlockThreshold").optional().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (req.body.topics) {
      const lessonCheck = validateLessonStructure(req.body.topics);
      if (!lessonCheck.valid) {
        return res.status(400).json({ message: lessonCheck.message });
      }
    }

    try {
      const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.json(course);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete course (Admin only)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll user in a course
router.post("/:id/enroll", authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If already enrolled, respond idempotently with success
    if ((course.enrolledUsers || []).some(u => u.toString() === userId.toString())) {
      return res.json({ 
        message: "User already enrolled in this course", 
        course: {
          id: course._id,
          title: course.title,
          enrolledCount: course.enrolledCount
        }
      });
    }

    // Atomically add user and increment enrolledCount
    const updated = await Course.findByIdAndUpdate(
      courseId,
      { 
        $addToSet: { enrolledUsers: userId },
        $inc: { enrolledCount: 1 }
      },
      { new: true }
    );

    res.json({ 
      message: "Successfully enrolled in course", 
      course: {
        id: updated._id,
        title: updated.title,
        enrolledCount: updated.enrolledCount
      }
    });
  } catch (err) {
    console.error('Error enrolling in course:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   DELETE /api/courses/:id/unenroll
// @desc    Unenroll user from a course
router.delete("/:id/unenroll", authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is enrolled
    const isEnrolled = (course.enrolledUsers || []).some(u => u.toString() === userId.toString());
    if (!isEnrolled) {
      return res.status(400).json({ message: "User not enrolled in this course" });
    }

    // Atomically remove user and decrement enrolledCount
    const updated = await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: { enrolledUsers: userId },
        $inc: { enrolledCount: -1 }
      },
      { new: true }
    );

    res.json({ 
      message: "Successfully unenrolled from course",
      course: {
        id: updated._id,
        title: updated.title,
        enrolledCount: Math.max(0, updated.enrolledCount)
      }
    });
  } catch (err) {
    console.error('Error unenrolling from course:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/courses/:id/topics
// @desc    Get course topics with lessons (Updated for unified schema)
router.get("/:id/topics", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return topics with unified lesson structure
    const topics = course.topics.map(topic => ({
      id: topic._id,
      title: topic.title,
      description: topic.description,
      order: topic.order,
      lessons: topic.lessons.map(lesson => ({
        id: lesson._id,
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
        order: lesson.order,
        hasContent: !!lesson.content,
        hasReview: !!lesson.review,
        mcqCount: lesson.mcqs?.length || 0,
        codeChallengeCount: lesson.codeChallenges?.length || 0
      })),
      moduleTest: topic.moduleTest ? {
        totalMarks: topic.moduleTest.totalMarks,
        questionCount: (topic.moduleTest.mcqs?.length || 0) + (topic.moduleTest.codeChallenges?.length || 0)
      } : null
    }));

    res.json({ topics });
  } catch (err) {
    console.error('Error fetching course topics:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/courses/:id/topics/:topicId/lessons/:lessonId
// @desc    Get specific lesson content (Updated for unified schema)
router.get("/:id/topics/:topicId/lessons/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { id: courseId, topicId, lessonId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const topic = course.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const lesson = topic.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Return lesson with unified structure: theory, MCQs, coding challenges, review
    const lessonData = {
      id: lesson._id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      order: lesson.order,
      content: lesson.content || '', // Theory content
      mcqs: lesson.mcqs || [], // Exactly 2 MCQs
      codeChallenges: lesson.codeChallenges || [], // Exactly 2 coding challenges
      review: lesson.review || '', // Review content
      topicTitle: topic.title,
      courseTitle: course.title
    };

    res.json({ lesson: lessonData });
  } catch (err) {
    console.error('Error fetching lesson:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/courses/:id/topics/:topicId/test
// @desc    Get module test for a topic
router.get("/:id/topics/:topicId/test", authenticateToken, async (req, res) => {
  try {
    const { id: courseId, topicId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const topic = course.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (!topic.moduleTest) {
      return res.status(404).json({ message: "No test available for this topic" });
    }

    // Return test without correct answers (for security)
    const testData = {
      topicTitle: topic.title,
      totalMarks: topic.moduleTest.totalMarks,
      mcqs: topic.moduleTest.mcqs?.map(mcq => ({
        question: mcq.question,
        options: mcq.options,
        // Don't send correct answer
      })) || [],
      codeChallenges: topic.moduleTest.codeChallenges?.map(challenge => ({
        title: challenge.title,
        description: challenge.description,
        sampleInput: challenge.sampleInput,
        sampleOutput: challenge.sampleOutput,
        constraints: challenge.constraints,
        initialCode: challenge.initialCode,
        language: challenge.language
        // Don't send test cases
      })) || []
    };

    res.json(testData);
  } catch (err) {
    console.error('Error fetching module test:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/courses/user/:userId
// @desc    Get courses enrolled by a specific user
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if requesting user can access this data (admin or own data)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const courses = await Course.find({ 
      enrolledUsers: userId,
      isActive: true 
    }).select('title description difficulty enrolledCount createdAt');

    res.json({ courses });
  } catch (err) {
    console.error('Error fetching user courses:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
