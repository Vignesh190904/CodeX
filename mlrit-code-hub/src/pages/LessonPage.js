import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Code, 
  HelpCircle, 
  Eye,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Award,
  FileText,
  Target,
  ArrowLeft,
  Check,
  Settings
} from 'lucide-react';
import { validateCourseStructure } from "../utils/courseUtils";
import "./LessonPage.css";

const LessonPage = () => {
  const { courseId, topicId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [verdict, setVerdict] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('output');
  const [activeTab, setActiveTab] = useState('theory');
  const [leftWidth, setLeftWidth] = useState(40);
  const [executionError, setExecutionError] = useState("");
  const [showExpectedOutput, setShowExpectedOutput] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Compiler integration - same as SolveProblemSetProblem
  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
  };
  
  const boilerplate = {
    cpp: `#include <iostream>
using namespace std;
int main() {
    // your code here
    return 0;
}`,
    python: `# your code here`,
    java: `public class Main {
    public static void main(String[] args) {
        // your code here
    }
}`,
  };
  
  const isModifiedRef = useRef(false);
  const containerRef = useRef(null);
  
  // Resizer functionality for split-screen layout
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeftWidth = leftWidth;
    
    const doDrag = (e) => {
      const containerWidth = containerRef.current?.offsetWidth || 1200;
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newLeftWidth = Math.min(80, Math.max(20, startLeftWidth + deltaPercent));
      setLeftWidth(newLeftWidth);
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mcqResult, setMcqResult] = useState(null); // 'correct', 'wrong', or null
  const [showExplanation, setShowExplanation] = useState(false);
  const [stepResults, setStepResults] = useState({}); // Track results for each step
  
  // Step navigation state
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [stepProgress, setStepProgress] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [steps, setSteps] = useState([]);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const attemptedRecovery = useRef(false);

  // Fetch lesson data and progress on component mount
  useEffect(() => {
    const fetchLessonAndProgress = async () => {
      try {
        setLoading(true);
        
        // Fetch lesson data
        const [lessonResponse, progressResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/courses/${courseId}/topics/${topicId}/lessons/${lessonId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://localhost:5000/api/progress?userId=${userId}&courseId=${courseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);
        
        const lessonData = lessonResponse.data;
        setLesson(lessonData);
        setCode(boilerplate[lessonData.language] || '');
        setLanguage(lessonData.language || 'python');
        setTotalSteps(lessonData.steps?.length || 1);
        
        // Check if lesson is already completed
        if (progressResponse.data) {
          const topicProgress = progressResponse.data.topicsProgress?.find(
            tp => tp.topicId === topicId
          );
          const lessonProgress = topicProgress?.lessons?.find(
            lp => lp.lessonId === lessonId
          );
          
          if (lessonProgress?.completed) {
            setIsCompleted(true);
          }
        }
      } catch (err) {
        // If progress check fails, continue without marking as completed
        if (err.response?.status !== 404) {
          console.error('Error checking lesson progress:', err);
        }
        
        // Still try to load the lesson even if progress check fails
        if (!lesson) {
          const lessonResponse = await axios.get(
            `http://localhost:5000/api/courses/${courseId}/topics/${topicId}/lessons/${lessonId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setLesson(lessonResponse.data);
          setCode(boilerplate[lessonResponse.data.language] || '');
          setLanguage(lessonResponse.data.language || 'python');
          setTotalSteps(lessonResponse.data.steps?.length || 1);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndProgress();
  }, [courseId, topicId, lessonId, token, navigate]);

  // Fetch the full course data
  const fetchCourse = useCallback(async () => {
    if (!courseId || !token) return null;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(response.data);
      setCourseTitle(response.data.title);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course data');
      return null;
    }
  }, [courseId, token]);

  useEffect(() => {
    if (!courseId || !topicId || !lessonId || !token || !userId) {
      setError('Invalid course, topic, or lesson ID');
      setLoading(false);
      return;
    }

    const fetchLesson = async () => {
      console.log('Fetching lesson with IDs:', courseId, topicId, lessonId);
      
      try {
        setLoading(true);
        
        // First, fetch the full course data
        const courseData = await fetchCourse();
        if (!courseData || !courseData.topics) {
          setError('Failed to load course data');
          setLoading(false);
          return;
        }
        
        // Then validate the course structure
        const validation = await validateCourseStructure(courseId, topicId, lessonId);
        
        if (!validation) {
          setError('Failed to validate course structure');
          setLoading(false);
          return;
        }
        
        if (!validation.valid) {
          console.warn('ID mismatch detected:', validation.error);
          
          // If we have a corrected URL, redirect to it
          if (validation.correctedUrl && validation.correctedUrl !== window.location.pathname) {
            console.log('Redirecting to corrected URL:', validation.correctedUrl);
            navigate(validation.correctedUrl);
            return;
          }
          
          // Otherwise show error
          setError(validation.error || 'Course structure validation failed');
          return;
        }
        
        // If validation passed, use the validated data
        const { topic, lesson } = validation;
        setLesson(lesson);
        setTopicTitle(topic.title);
        
        console.log('✅ Lesson loaded successfully:', lesson.title);
        
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || "Failed to load lesson";
        console.error('Fetch error:', status, message);
        setError(message);

        // Fallback recovery for unexpected errors
        if (status === 404 && !attemptedRecovery.current) {
          attemptedRecovery.current = true;
          console.log('Attempting fallback recovery...');
          navigate(`/courses/${courseId}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, topicId, lessonId, token, navigate]);

  const markComplete = async () => {
    // If already completed, just navigate back
    if (isCompleted) {
      navigate(`/courses/${courseId}`);
      return;
    }
    
    try {
      // Mark lesson as completed in progress system
      const progressResponse = await axios.post(
        `http://localhost:5000/api/progress/lesson`,
        { userId, courseId, topicId, lessonId, completed: true, timeSpent: 0, score: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update leaderboard with lesson completion data
      const lessonData = {
        topicId,
        lessonId,
        mcqResults: Object.entries(stepResults || {}).filter(([key, result]) => {
          const stepIndex = parseInt(key);
          const step = steps[stepIndex];
          return step?.type === 'mcq';
        }).map(([key, result]) => ({
          stepIndex: parseInt(key),
          isCorrect: result === 'correct',
          type: 'mcq'
        })),
        codingResults: Object.entries(stepResults || {}).filter(([key, result]) => {
          const stepIndex = parseInt(key);
          const step = steps[stepIndex];
          return step?.type === 'coding';
        }).map(([key, result]) => ({
          stepIndex: parseInt(key),
          verdict: result === 'correct' ? 'Accepted' : 'Wrong Answer',
          type: 'coding'
        })),
        mcqQuestions: lesson?.mcqs || [],
        codingQuestions: lesson?.codeChallenges || []
      };
      
      try {
        await axios.post(
          `http://localhost:5000/api/course-leaderboard/${courseId}/update-score`,
          {
            userId,
            assessmentType: 'lesson',
            assessmentData: lessonData
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Leaderboard updated with lesson completion');
      } catch (leaderboardError) {
        console.warn('Failed to update leaderboard:', leaderboardError);
        // Continue even if leaderboard update fails
      }
      
      // Update local state to reflect completion
      if (!progressResponse.data.alreadyCompleted) {
        setIsCompleted(true);
        console.log('Lesson marked as completed');
      } else {
        console.log('Lesson was already completed');
      }
      
      // Trigger progress refresh and navigate back
      localStorage.setItem('lessonCompleted', Date.now().toString());
      navigate(`/courses/${courseId}`);
    } catch (err) {
      // If it's a 200 status with alreadyCompleted: true, still navigate
      if (err.response?.status === 200 && err.response?.data?.alreadyCompleted) {
        setIsCompleted(true);
        navigate(`/courses/${courseId}`);
      } else {
        setError(err.response?.data?.message || "Failed to complete lesson");
      }
    }
  };

  // Initialize code with boilerplate when language changes
  useEffect(() => {
    if (!isModifiedRef.current) {
      setCode(boilerplate[language]);
      setOutput("");
      setVerdict("");
    }
  }, [language]);

  // Initialize custom input with sample input from current challenge
  useEffect(() => {
    const currentStep = getCurrentStep();
    if (currentStep?.type === 'coding' && currentStep.content?.sampleInput) {
      setCustomInput(currentStep.content.sampleInput);
    }
  }, [currentStep, steps]);

  // Handle tab switching based on step type
  useEffect(() => {
    const currentStep = getCurrentStep();
    if (currentStep?.type === 'theory') {
      setActiveTab('theory');
    } else if (currentStep?.type === 'coding') {
      setActiveTab('statement');
    }
  }, [currentStep, steps]);

  // Handle code execution with Judge0
  const executeCode = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first.");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setVerdict("");
    setExecutionError("");

    try {
      const response = await axios.post("http://localhost:2358/submissions", {
        source_code: code,
        language_id: languageMap[language],
        stdin: customInput,
      });

      const token = response.data.token;
      
      // Poll for result
      let result;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const resultResponse = await axios.get(`http://localhost:2358/submissions/${token}`);
        result = resultResponse.data;
        attempts++;
      } while (result.status.id <= 2 && attempts < maxAttempts);

      if (result.stdout) {
        setOutput(result.stdout);
        setVerdict("Accepted");
        // Store coding result for progress indicator
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'correct'
        }));
      } else if (result.stderr) {
        setOutput(result.stderr);
        setVerdict("Runtime Error");
        setExecutionError(result.stderr);
        // Store coding result for progress indicator
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'wrong'
        }));
      } else if (result.compile_output) {
        setOutput(result.compile_output);
        setVerdict("Compilation Error");
        setExecutionError(result.compile_output);
        // Store coding result for progress indicator
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'wrong'
        }));
      } else {
        setOutput("No output");
        setVerdict("No Output");
        // Store coding result for progress indicator
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'wrong'
        }));
      }
      
    } catch (error) {
      console.error("Execution error:", error);
      setOutput("Error executing code. Make sure Judge0 server is running.");
      setExecutionError("Connection error");
      setVerdict("");
      // Store coding result for progress indicator
      setStepResults(prev => ({
        ...prev,
        [currentStep]: 'wrong'
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before submitting.");
      return;
    }

    const currentStep = getCurrentStep();
    if (!currentStep?.content?.sampleOutput) {
      setOutput("No expected output available for submission.");
      return;
    }

    setIsRunning(true);
    setOutput("Evaluating solution...");
    setVerdict("");

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: currentStep.content.sampleInput || "",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());

      const expected = currentStep.content.sampleOutput.trim();
      const isSuccess = finalOutput.trim() === expected;
      setVerdict(isSuccess ? "✅ Correct Output" : "❌ Wrong Output");

      // Mark step as completed if solution is correct
      if (isSuccess) {
        setStepProgress(prev => ({
          ...prev,
          [currentStep]: true
        }));
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setOutput("Submission error");
      setVerdict("");
    } finally {
      setIsRunning(false);
    }
  };

  const handleMCQAnswer = (mcqIndex, optionIndex) => {
    const current = getCurrentStep()?.content;
    if (!current) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    const correct = optionIndex === current.correct;
    setIsCorrect(correct);
    setShowExplanation(true);
    setMcqResult(correct ? 'correct' : 'wrong');
    
    // Store result for this step
    setStepResults(prev => ({
      ...prev,
      [currentStep]: correct ? 'correct' : 'wrong'
    }));
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === getCurrentStep().content.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    setMcqResult(correct ? 'correct' : 'wrong');
  };

  const resetMCQ = () => {
    setSelectedAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
    // Don't reset mcqResult to preserve tick color
  };

  const allowRetryMCQ = () => {
    setSelectedAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
    // Keep mcqResult to maintain tick color until new answer
  };

  // Calculate total steps based on lesson content
  useEffect(() => {
    if (lesson) {
      const stepsList = [];
      
      // Theory step
      if (lesson.content) {
        stepsList.push({
          type: 'theory',
          title: lesson.title || 'Lesson Content',
          icon: <FileText size={20} />,
          content: lesson.content
        });
      }
      
      // MCQ steps - each MCQ as separate step
      if (lesson.mcqs?.length > 0) {
        lesson.mcqs.forEach((mcq, index) => {
          stepsList.push({
            type: 'mcq',
            title: `Question ${index + 1}`,
            icon: <Target size={20} />,
            content: mcq,
            mcqIndex: index
          });
        });
      }
      
      // Coding challenge steps - each challenge as separate step
      if (lesson.codeChallenges?.length > 0) {
        lesson.codeChallenges.forEach((challenge, index) => {
          stepsList.push({
            type: 'coding',
            title: `Statement`,
            icon: <Code size={20} />,
            content: challenge,
            challengeIndex: index
          });
        });
      }
      
      // Review step
      if (lesson.review) {
        stepsList.push({
          type: 'review',
          title: 'Review',
          icon: <CheckCircle size={20} />,
          content: lesson.review
        });
      }
      
      setSteps(stepsList);
      setTotalSteps(stepsList.length);
    }
  }, [lesson]);

  // Get current step content
  const getCurrentStep = () => {
    return steps[currentStep] || null;
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      // Mark current step as completed if it's theory
      if (getCurrentStep()?.type === 'theory') {
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'completed'
        }));
      }
      setCurrentStep(currentStep + 1);
      resetMCQ();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      resetMCQ();
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    resetMCQ();
  };

  // Get status for completed steps with color coding
  const getStepStatus = (stepIndex) => {
    const step = steps[stepIndex];
    const result = stepResults[stepIndex];
    
    if (step?.type === 'theory') {
      return result === 'completed' ? 'completed-green' : 'completed';
    } else if (step?.type === 'mcq') {
      if (result === 'correct') return 'completed-green';
      if (result === 'wrong') return 'completed-red';
      return 'completed';
    } else if (step?.type === 'coding') {
      if (result === 'correct') return 'completed-green';
      if (result === 'wrong') return 'completed-red';
      return 'completed';
    }
    return 'completed';
  };

  // Check if current step can proceed to next
  const canProceedToNext = () => {
    const step = getCurrentStep();
    if (!step) return false;
    
    // For MCQ steps, allow proceeding without answering (non-mandatory)
    if (step.type === 'mcq') {
      return true; // MCQs are now non-mandatory
    }
    
    // For coding steps, user should have a successful submission (optional but encouraged)
    if (step.type === 'coding') {
      return true; // Allow proceeding even without successful submission for now
    }
    
    // For other steps, always allow proceeding
    return true;
  };


  if (loading) return <div>Loading lesson...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`lesson-page dark-mode ${getCurrentStep()?.type === 'theory' ? 'theory-black' : ''}`}>
      {/* Dark Progress Navigation Bar - Exact Match */}
      <div className="dark-progress-navbar">
        <div className="navbar-content">
          {/* Left Side - Navigation Icons */}
          <div className="navbar-left-icons">
            <button 
              onClick={() => navigate(`/courses/${courseId}`)} 
              className="nav-icon back-icon"
              title="Back to Course"
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="nav-icon menu-icon"
              title="Course Menu"
            >
              <Menu size={16} />
            </button>
            <div 
              className={`nav-icon check-icon ${
                getCurrentStep()?.type === 'theory' && stepResults[currentStep] === 'completed' ? 'completed-green' :
                getCurrentStep()?.type === 'mcq' && stepResults[currentStep] === 'correct' ? 'completed-green' :
                getCurrentStep()?.type === 'mcq' && stepResults[currentStep] === 'wrong' ? 'completed-red' :
                getCurrentStep()?.type === 'coding' && stepResults[currentStep] === 'correct' ? 'completed-green' :
                getCurrentStep()?.type === 'coding' && stepResults[currentStep] === 'wrong' ? 'completed-red' :
                ''
              }`}
              title="Progress Status"
            >
              {getCurrentStep()?.type === 'theory' && stepResults[currentStep] === 'completed' ? (
                <Check size={16} style={{color: '#28a745'}} />
              ) : getCurrentStep()?.type === 'mcq' && stepResults[currentStep] === 'correct' ? (
                <Check size={16} style={{color: '#28a745'}} />
              ) : getCurrentStep()?.type === 'mcq' && stepResults[currentStep] === 'wrong' ? (
                <X size={16} style={{color: '#dc3545'}} />
              ) : getCurrentStep()?.type === 'coding' && stepResults[currentStep] === 'correct' ? (
                <Check size={16} style={{color: '#28a745'}} />
              ) : getCurrentStep()?.type === 'coding' && stepResults[currentStep] === 'wrong' ? (
                <X size={16} style={{color: '#dc3545'}} />
              ) : (
                <Check size={16} />
              )}
            </div>
          </div>

          {/* Right Side - Progress Navigation */}
          <div className="progress-navigation">
            {/* Previous Button */}
            <button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="nav-btn prev-btn"
              title="Previous Step"
            >
              <ArrowLeft size={14} />
              <span>Prev</span>
            </button>

            {/* Progress Segments */}
            <div className="progress-segments">
              {steps?.map((step, index) => (
                <div
                  key={index}
                  className={`progress-dot ${
                    index < currentStep ? getStepStatus(index) : 
                    index === currentStep ? 'active' : 'pending'
                  }`}
                  onClick={() => index <= currentStep && goToStep(index)}
                  title={`${step.type.charAt(0).toUpperCase() + step.type.slice(1)}: ${step.title || `Step ${index + 1}`}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button 
              onClick={currentStep < totalSteps - 1 ? nextStep : markComplete}
              disabled={!canProceedToNext()}
              className={`nav-btn next-btn ${
                currentStep < totalSteps - 1 ? '' : 'complete-btn'
              }`}
              title={currentStep < totalSteps - 1 ? "Next Step" : "Complete Lesson"}
            >
              <span>{currentStep < totalSteps - 1 ? 'Next' : 'Complete'}</span>
              {currentStep < totalSteps - 1 ? 
                <ChevronRight size={14} /> : 
                <CheckCircle size={14} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Course Sidebar */}
      <div className={`course-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="sidebar-close"
            title="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-content">
          {/* Course Info */}
          <div className="sidebar-course-info">
            <div className="course-icon">
              <img src="/api/placeholder/48/48" alt="Python" className="course-logo" />
            </div>
            <div className="course-details">
              <h3 className="course-name">{courseTitle || 'Learn Python Programming'}</h3>
              <a href="#" className="view-syllabus">View full syllabus</a>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="sidebar-progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${isCompleted ? 100 : Math.min(100, Math.round(((currentStep + 1) / totalSteps) * 100))}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Completed
            </div>
          </div>
          
          {/* Course Topics and Lessons List */}
          <div className="modules-list">
            {course?.topics?.map((topic, topicIndex) => {
              const isCurrentTopic = topic._id === topicId;
              const isExpanded = expandedTopics[topicIndex] ?? isCurrentTopic;
              
              return (
                <div key={topicIndex} className="module-section">
                  {/* Topic Header */}
                  <div 
                    className="module-header"
                    onClick={() => setExpandedTopics(prev => ({
                      ...prev,
                      [topicIndex]: !isExpanded
                    }))}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="module-number">{topicIndex + 1}</div>
                    <h3 className="module-title">{topic.title}</h3>
                    <div className="expand-icon">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  
                  {/* Topic Lessons - Only show when expanded */}
                  {isExpanded && (
                    <div className="module-lessons">
                      {topic.lessons?.map((lesson, lessonIndex) => {
                        const isCurrentLesson = isCurrentTopic && lesson._id === lessonId;
                        return (
                          <div 
                            key={lessonIndex} 
                            className={`lesson-item ${isCurrentLesson ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${courseId}/topic/${topic._id}/lesson/${lesson._id}`);
                            }}
                          >
                            <div className="lesson-status">
                              {isCurrentLesson ? (
                                <div className="active-dot"></div>
                              ) : (
                                <div className="pending-dot"></div>
                              )}
                            </div>
                            <span className="lesson-title">
                              {lesson.title}
                            </span>
                          </div>
                        );
                      })}
                      
                      {/* Module Test */}
                      {topic.moduleTest && (
                        <div 
                          className="lesson-item test-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${courseId}/topic/${topic._id}/secure-test`);
                          }}
                        >
                          <div className="lesson-status">
                            <div className="test-dot"></div>
                          </div>
                          <span className="lesson-title">
                            <Award size={16} />
                            Knowledge Assessment
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <div className={`lesson-content ${getCurrentStep()?.type === 'mcq' ? 'mcq-no-scroll' : ''}`}>
        {getCurrentStep() && (
          <div className="step-container">
            {getCurrentStep().type !== 'coding' && (
              <div className="step-header">
                <h2>
                  {getCurrentStep().icon}{' '}
                  {getCurrentStep().type === 'mcq' ? 'Statement' : getCurrentStep().title}
                </h2>
              </div>
            )}
            
            <div className="step-content">
              {/* Theory Step */}
              {getCurrentStep().type === 'theory' && (
                <div className="theory-step-simple">
                  <div className="theory-content-simple">
                    <div className="theory-body-simple" dangerouslySetInnerHTML={{ __html: getCurrentStep().content }} />
                    <div className="theory-navigation">
                      <button 
                        className="next-lesson-btn"
                        onClick={nextStep}
                        disabled={!canProceedToNext()}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MCQ Step - Split Layout with Submit & Feedback */}
              {getCurrentStep().type === 'mcq' && (
                <div className="mcq-step-solve-like">
                  <div className="solve-container" ref={containerRef}>
                    {/* Left: Statement only (no tabs) */}
                    <div className="solve-left" style={{ width: `${leftWidth}%` }}>
                      <div className="solve-content">
                        <div className="mcq-statement-body">
                          <h2 className="mcq-statement-title">{getCurrentStep().title || 'MCQ'}</h2>
                          <div className="mcq-statement-question">
                            <p>{getCurrentStep().content.question}</p>
                          </div>
                          {getCurrentStep().content?.hint && (
                            <div className="mcq-statement-hint">
                              <strong>Hint: </strong>{getCurrentStep().content.hint}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resizer */}
                    <div className="resizer" onMouseDown={startDrag} />

                    {/* Right: Question/Options */}
                    <div className="solve-right" style={{ width: `${100 - leftWidth}%` }}>
                      <div className="mcq-question-box">
                        <h3 className="mcq-question-title">{getCurrentStep().content.question}</h3>
                        {getCurrentStep().content?.hint && (
                          <div className="mcq-question-hint">{getCurrentStep().content.hint}</div>
                        )}

                        <div className="mcq-options">
                          {getCurrentStep().content?.options?.map((opt, optionIndex) => {
                            const isSelected = selectedAnswer === optionIndex;
                            const isCorrectOption = isAnswered && optionIndex === getCurrentStep().content.correct;
                            const isIncorrectSelected = isAnswered && isSelected && !isCorrectOption;
                            
                            return (
                              <button
                                key={optionIndex}
                                className={`mcq-option-tile ${
                                  isCorrectOption ? 'correct' : isIncorrectSelected ? 'incorrect' : isSelected ? 'selected' : ''
                                }`}
                                onClick={() => handleMCQAnswer(0, optionIndex)}
                                disabled={isAnswered}
                              >
                                <span className="radio"></span>
                                <span className="label">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation - show after any answer submission */}
                        {showExplanation && (
                          <div className="mcq-explanation">
                            <div className="mcq-expl-sidebar" />
                            <div className="mcq-expl-content">
                              <div className={`verdict-header ${isCorrect ? 'correct-verdict' : 'wrong-verdict'}`}>
                                <h4>{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</h4>
                                <span className="verdict-status">{isCorrect ? 'Well done!' : 'Try again'}</span>
                              </div>
                              <div className="explanation-content">
                                <h5>Reason:</h5>
                                <p>
                                  {isCorrect 
                                    ? (getCurrentStep().content?.explanation || 'Great job! Your answer is correct. Here is a brief explanation for why this option is right.')
                                    : (getCurrentStep().content?.wrongExplanation || 'That\'s not quite right. The correct answer provides a better solution.')
                                  }
                                </p>
                              </div>
                              {!isCorrect && (
                                <button 
                                  className="retry-mcq-btn"
                                  onClick={allowRetryMCQ}
                                >
                                  Try Again
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mcq-actions">
                          {!isAnswered ? (
                            <button
                              className="mcq-submit-btn"
                              onClick={() => {
                                if (selectedAnswer == null) return;
                                const correct = getCurrentStep().content.correct;
                                const isAnsCorrect = selectedAnswer === correct;
                                setIsAnswered(true);
                                setIsCorrect(isAnsCorrect);
                                setShowExplanation(true);
                                setMcqResult(isAnsCorrect ? 'correct' : 'wrong');
                                
                                // Store result for this step
                                setStepResults(prev => ({
                                  ...prev,
                                  [currentStep]: isAnsCorrect ? 'correct' : 'wrong'
                                }));
                              }}
                              disabled={selectedAnswer == null}
                            >
                              Submit
                            </button>
                          ) : (
                            <button 
                              onClick={nextStep}
                              className="mcq-next-btn"
                            >
                              Next
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coding Challenge Step - Split Screen Layout */}
              {getCurrentStep().type === 'coding' && (
                <div className="coding-step-split">
                  <div className="solve-container" ref={containerRef}>
                    {/* Left Panel - Problem Statement */}
                    <div className="solve-left" style={{ width: `${leftWidth}%` }}>
                      <div className="left-tabs">
                        <button
                          className={activeTab === "statement" ? "active-tab" : ""}
                          onClick={() => setActiveTab("statement")}
                        >
                          Statement
                        </button>
                        <button
                          className={activeTab === "submissions" ? "active-tab" : ""}
                          onClick={() => setActiveTab("submissions")}
                        >
                          Submissions
                        </button>
                      </div>

                      <div className="left-content">
                        {activeTab === "statement" ? (
                          <>
                            <h2>{getCurrentStep().content.title}</h2>
                            <div className="problem-description">
                              <p>{getCurrentStep().content.description}</p>
                              {getCurrentStep().content.constraints && (
                                <div className="constraints-section">
                                  <h3>Constraints:</h3>
                                  <p>{getCurrentStep().content.constraints}</p>
                                </div>
                              )}
                            </div>
                            
                            {getCurrentStep().content.sampleInput && getCurrentStep().content.sampleOutput && (
                              <div className="sample-cases">
                                <h3>Sample Test Cases:</h3>
                                <div className="testcase-block">
                                  <strong>Input:</strong>
                                  <pre>{getCurrentStep().content.sampleInput}</pre>
                                  <strong>Output:</strong>
                                  <pre>{getCurrentStep().content.sampleOutput}</pre>
                                </div>
                              </div>
                            )}
                          </>
                        ) : activeTab === "submissions" ? (
                          <div className="submissions-section">
                            <h2>Submission History</h2>
                            <div className="no-submissions">
                              <p>No submissions yet.</p>
                              <p className="submission-hint">Submit your solution to see it here.</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Resizer */}
                    <div className="resizer" onMouseDown={startDrag} />

                    {/* Right Panel - Code Editor */}
                    <div className="solve-right" style={{ width: `${100 - leftWidth}%` }}>
                      <div className="editor-toolbar">
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            isModifiedRef.current = false;
                            setOutput("");
                            setVerdict("");
                          }}
                        >
                          <option value="cpp">C++</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                        </select>
                        <div className="toolbar-buttons">
                          <button 
                            className="run-button"
                            onClick={executeCode} 
                            disabled={isRunning}
                          >
                            {isRunning ? 'Running...' : 'Run'}
                          </button>
                          <button 
                            className="submit-button"
                            onClick={handleSubmit} 
                            disabled={isRunning}
                          >
                            {isRunning ? 'Submitting...' : 'Submit'}
                          </button>
                        </div>
                      </div>

                      <div className="monaco-editor-container">
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={language === 'cpp' ? 'cpp' : language}
                          value={code}
                          onChange={(val) => {
                            setCode(val);
                            isModifiedRef.current = true;
                          }}
                          options={{ 
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            scrollbar: {
                              vertical: 'visible',
                              horizontal: 'visible',
                              useShadows: false,
                              verticalScrollbarSize: 8,
                              horizontalScrollbarSize: 8
                            }
                          }}
                        />
                      </div>

                      <div className="input-section">
                        <div className="input-header">
                          <h3>Custom Input</h3>
                        </div>
                        <textarea
                          className="input-box"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Enter custom input here"
                        />
                      </div>

                      <div className={`output-console ${showConsole ? 'visible' : ''}`}>
                        <div className="console-header" onClick={() => setShowConsole(!showConsole)}>
                          <h4>Console</h4>
                          <button className="console-close" onClick={(e) => {
                            e.stopPropagation();
                            setShowConsole(false);
                          }}>×</button>
                        </div>
                        <div className="console-content">
                          <div className="console-tabs">
                            <button 
                              className={`console-tab ${activeConsoleTab === 'output' ? 'active' : ''}`}
                              onClick={() => setActiveConsoleTab('output')}
                            >
                              Output
                            </button>
                            <button 
                              className={`console-tab ${activeConsoleTab === 'input' ? 'active' : ''}`}
                              onClick={() => setActiveConsoleTab('input')}
                            >
                              Input
                            </button>
                          </div>
                          <div className="console-body">
                            {activeConsoleTab === 'output' ? (
                              <div className="output-content">
                                <pre className="output-text">{output || "Click 'Run' to see output here"}</pre>
                                {verdict && (
                                  <div className={`verdict ${verdict.includes('✅') ? 'success' : 'error'}`}>
                                    {verdict}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <textarea
                                className="console-input"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Enter custom input here"
                                rows={5}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {getCurrentStep().type === 'review' && (
                <div className="review-step">
                  <div className="review-content" dangerouslySetInnerHTML={{ __html: getCurrentStep().content }} />
                </div>
              )}
            </div>


          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
