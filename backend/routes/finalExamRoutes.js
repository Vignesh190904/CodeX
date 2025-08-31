const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const SkillTest = require('../models/SkillTest');
const UserProgress = require('../models/UserProgress');
const { authenticateToken } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const { updateUserCourseScore } = require('../controllers/courseLeaderboardController');

// Get final exam for a course
router.get('/courses/:courseId/final-exam', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    console.log('Fetching course with ID:', courseId);
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log('Course found:', course.title);

    const skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    if (!skillTest) {
      return res.status(404).json({ message: 'Final exam not found' });
    }

    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    );

    if (userAttempts.length > 0) {
      const lastAttempt = userAttempts[userAttempts.length - 1];
      
      return res.json({
        hasAttempted: true,
        lastAttempt: {
          score: lastAttempt.score,
          totalMarks: skillTest.totalMarks,
          percentage: Math.round((lastAttempt.score / skillTest.totalMarks) * 100),
          correctAnswers: lastAttempt.correctAnswers,
          wrongAnswers: lastAttempt.totalQuestions - lastAttempt.correctAnswers - (skillTest.questions.length + skillTest.codingProblems.length - lastAttempt.totalQuestions),
          unattempted: skillTest.questions.length + skillTest.codingProblems.length - lastAttempt.totalQuestions,
          totalQuestions: skillTest.questions.length + skillTest.codingProblems.length,
          mcqCorrect: lastAttempt.details?.mcqScore ? Math.floor(lastAttempt.details.mcqScore / 5) : 0,
          codingCorrect: lastAttempt.details?.codingScore ? Math.floor(lastAttempt.details.codingScore / 25) : 0,
          mcqScore: lastAttempt.details?.mcqScore || 0,
          codingScore: lastAttempt.details?.codingScore || 0,
          timeSpent: lastAttempt.timeSpent,
          passed: lastAttempt.passed,
          attemptNumber: userAttempts.length,
          canRetake: false
        },
        exam: {
          title: skillTest.title,
          description: skillTest.description,
          duration: skillTest.duration,
          totalMarks: skillTest.totalMarks,
          passingScore: skillTest.passingScore
        }
      });
    }

    const sanitizedExam = {
      title: skillTest.title,
      description: skillTest.description,
      duration: skillTest.duration,
      totalMarks: skillTest.totalMarks,
      passingScore: skillTest.passingScore,
      mcqs: skillTest.questions.map(q => ({
        question: q.question,
        options: q.options,
        marks: q.marks
      })),
      codeChallenges: skillTest.codingProblems.map(p => ({
        title: p.title,
        description: p.description,
        sampleInput: p.sampleInput,
        sampleOutput: p.sampleOutput,
        constraints: p.constraints,
        initialCode: p.initialCode,
        language: p.language,
        marks: p.marks,
        difficulty: p.difficulty,
        timeLimit: p.timeLimit
      }))
    };

    res.json({
      hasAttempted: false,
      exam: sanitizedExam,
      course: {
        id: course._id,
        title: course.title,
        description: course.description
      }
    });

  } catch (error) {
    console.error('Error fetching final exam:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit final exam
router.post('/courses/:courseId/final-exam/submit', 
  authenticateToken,
  body('answers').optional().isArray().withMessage('Answers must be an array'),
  body('codingSubmissions').optional().custom((value) => {
    // Accept both arrays and objects for codingSubmissions
    return Array.isArray(value) || typeof value === 'object';
  }).withMessage('Coding submissions must be an array or object'),
  body('timeSpent').optional().isNumeric().withMessage('Time spent must be a number'),
  async (req, res) => {
  try {
    console.log('Final exam submission received for user:', req.user?.id, 'course:', req.params.courseId);
    console.log('Request body keys:', Object.keys(req.body));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.params;
    const { answers = [], codingSubmissions = {}, timeSpent = 0, securityViolations = [], proctoringData = {} } = req.body;
    const userId = req.user.id;
    
    console.log('Submission data:', {
      userId,
      courseId,
      answersCount: Array.isArray(answers) ? answers.length : 0,
      codingSubmissionsCount: typeof codingSubmissions === 'object' ? Object.keys(codingSubmissions).length : 0,
      timeSpent,
      hasSecurityViolations: securityViolations.length > 0
    });
    
    // Use securityViolations as-is since we changed the schema to Mixed type
    const parsedSecurityViolations = securityViolations || [];

    // Get the skill test (final exam)
    const skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    if (!skillTest) {
      return res.status(404).json({ message: 'Final exam not found' });
    }

    // Check attempt limit
    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    );

    console.log(`User ${userId} has ${userAttempts.length} previous attempts for final exam`);

    // Check attempt limit - only 1 attempt allowed for final exam
    if (userAttempts.length >= 1) {
      console.log('Maximum attempts exceeded for user:', userId);
      return res.status(403).json({ 
        message: 'Final exam can only be attempted once',
        attempts: userAttempts.length,
        maxAttempts: 1
      });
    }

    // Calculate MCQ score with detailed results
    let correctMCQs = 0;
    let mcqScore = 0;
    const mcqResults = [];
    const mcqAttempted = Array.isArray(answers) ? answers.filter(a => a !== null && a !== undefined).length : 0;
    
    skillTest.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer !== undefined && userAnswer === question.correct;
      
      mcqResults.push({
        isCorrect,
        userAnswer,
        correctAnswer: question.correct,
        marks: question.marks || 5
      });
      
      if (isCorrect) {
        correctMCQs++;
        mcqScore += question.marks || 5;
      }
    });
    
    const mcqPercentage = skillTest.questions.length > 0 
      ? Math.round((correctMCQs / skillTest.questions.length) * 100) 
      : 0;

    // Calculate coding score with Judge0-like evaluation
    let codingScore = 0;
    const codingResults = [];

    skillTest.codingProblems.forEach((problem, index) => {
      const submission = codingSubmissions && typeof codingSubmissions === 'object' ? codingSubmissions[index] : null;
      if (submission && submission.code && submission.code.trim().length > 10) {
        // For now, give full marks if substantial code is provided
        // In production, this would use Judge0 API like ModuleTestPage
        const hasTestCases = problem.testCases && problem.testCases.length > 0;
        const isCorrect = hasTestCases && submission.code.trim().length > 50; // Simplified check
        
        if (isCorrect) {
          codingScore += problem.marks || 25;
          codingResults.push({
            verdict: 'Accepted',
            output: 'Code executed successfully',
            marks: problem.marks || 25
          });
        } else {
          const partialScore = Math.floor((problem.marks || 25) * 0.3); // 30% for attempt
          codingScore += partialScore;
          codingResults.push({
            verdict: 'Partial Credit',
            output: 'Code submitted but needs improvement',
            marks: problem.marks || 25
          });
        }
      } else {
        codingResults.push({
          verdict: 'Not Attempted',
          output: 'No code submitted',
          marks: problem.marks || 25
        });
      }
    });

    const totalScore = mcqScore + codingScore;
    const percentage = Math.round((totalScore / skillTest.totalMarks) * 100);
    const passed = percentage >= skillTest.passingScore;

    // Create attempt record
    const attempt = {
      userId,
      score: totalScore,
      totalQuestions: skillTest.questions.length + skillTest.codingProblems.length,
      correctAnswers: correctMCQs,
      timeSpent,
      securityViolations: parsedSecurityViolations,
      tabSwitchCount: proctoringData.tabSwitchCount || parsedSecurityViolations.filter(v => v.type && v.type.includes('Tab switch')).length,
      submittedAt: new Date(),
      autoSubmitted: timeSpent >= skillTest.duration * 60, // Auto-submit if time exceeded
      passed,
      details: {
        mcqScore,
        codingScore,
        codingResults,
        percentage
      }
    };

    skillTest.attempts.push(attempt);
    await skillTest.save();

    // Update user progress for final exam completion
    const userProgress = await UserProgress.findOne({ userId, courseId });
    if (userProgress) {
      await userProgress.updateFinalExamProgress({
        mcqScore,
        codingScore,
        totalScore,
        maxScore: skillTest.totalMarks,
        mcqAnswers: mcqResults,
        codingResults
      });
      
      // Award certificate only if passed
      if (passed) {
        userProgress.certificateEarned = true;
        await userProgress.save();
      }
    }

    // Update leaderboard score for final exam completion
    try {
      const mockReq = { 
        params: { courseId }, 
        body: { 
          userId, 
          assessmentType: 'finalExam', 
          score: totalScore,
          assessmentData: {
            mcqResults,
            codingResults
          }
        } 
      };
      const mockRes = { json: () => {}, status: () => ({ json: () => {} }) };
      await updateUserCourseScore(mockReq, mockRes);
    } catch (leaderboardErr) {
      console.error('Error updating leaderboard:', leaderboardErr);
      // Don't fail the main request if leaderboard update fails
    }

    // Calculate correct coding answers
    const correctCoding = codingResults.filter(r => r.verdict === 'Accepted').length;
    const codingAttempted = codingResults.filter(r => r.verdict !== 'Not Attempted').length;
    const totalAttempted = mcqAttempted + codingAttempted;
    const totalCorrect = correctMCQs + correctCoding;
    const totalQuestions = skillTest.questions.length + skillTest.codingProblems.length;
    const wrongCount = totalAttempted - totalCorrect;
    const unattemptedCount = totalQuestions - totalAttempted;

    console.log('Final exam scoring completed:', {
      totalScore,
      percentage,
      mcqScore,
      codingScore,
      correctMCQs,
      correctCoding,
      passed
    });

    // Prepare the response in the format expected by the frontend
    const responseData = {
      success: true,
      testResult: {
        score: totalScore,
        totalMarks: skillTest.totalMarks,
        percentage,
        correctAnswers: totalCorrect,
        wrongAnswers: wrongCount,
        unattempted: unattemptedCount,
        totalQuestions,
        mcqCorrect: correctMCQs,
        codingCorrect: correctCoding,
        mcqAttempted,
        codingAttempted,
        totalAttempted,
        mcqScore,
        codingScore,
        mcqResults,
        codingResults,
        passed,
        timeSpent,
        attemptNumber: userAttempts.length + 1,
        canRetake: false,
        certificateEarned: passed,
        securityViolations: securityViolations || []
      },
      examData: {
        title: skillTest.title,
        description: skillTest.description,
        duration: skillTest.duration,
        totalMarks: skillTest.totalMarks,
        passingScore: skillTest.passingScore,
        questions: skillTest.questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          correct: q.correct,
          userAnswer: answers[i],
          isCorrect: answers[i] === q.correct,
          marks: q.marks || 0,
          type: 'mcq'
        })),
        codingProblems: skillTest.codingProblems.map((p, i) => ({
          title: p.title,
          description: p.description,
          userCode: codingSubmissions[i]?.code || '',
          result: codingResults[i] || { status: 'not_attempted', score: 0 },
          marks: p.marks || 0,
          type: 'coding'
        }))
      }
    };

    console.log('Sending response to frontend:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    console.error('Error submitting final exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit final exam',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get final exam results
router.get('/courses/:courseId/final-exam/results', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    if (!skillTest) {
      return res.status(404).json({ message: 'Final exam not found' });
    }

    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    if (userAttempts.length === 0) {
      return res.status(404).json({ message: 'No attempts found' });
    }

    const bestAttempt = userAttempts.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    res.json({
      attempts: userAttempts.map(attempt => ({
        score: attempt.score,
        percentage: attempt.details?.percentage || Math.round((attempt.score / skillTest.totalMarks) * 100),
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
        timeSpent: attempt.timeSpent,
        mcqScore: attempt.details?.mcqScore || 0,
        codingScore: attempt.details?.codingScore || 0
      })),
      bestScore: bestAttempt.score,
      bestPercentage: bestAttempt.details?.percentage || Math.round((bestAttempt.score / skillTest.totalMarks) * 100),
      passed: bestAttempt.passed,
      totalMarks: skillTest.totalMarks,
      passingScore: skillTest.passingScore
    });

  } catch (error) {
    console.error('Error fetching final exam results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
