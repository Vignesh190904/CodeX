import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './SecureFinalExam.css';
import { 
  Clock, 
  AlertTriangle, 
  Shield, 
  Eye, 
  EyeOff, 
  Monitor,
  Lock,
  CheckCircle,
  XCircle,
  Play,
  Square
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const SecureFinalExam = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [exam, setExam] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Security states
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [securityViolations, setSecurityViolations] = useState([]);
  const [isSecureMode, setIsSecureMode] = useState(false);
  
  // Exam states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  // Code editor states
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const examRef = useRef(null);
  const timerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Handle ResizeObserver errors
  const handleResizeError = useCallback((error) => {
    // Ignore ResizeObserver loop errors as they are usually not critical
    if (error.message && error.message.includes('ResizeObserver')) {
      return false; // Prevent default error handling
    }
    // Allow other errors to be handled normally
    return true;
  }, []);

  // Handle global errors including ResizeObserver
  useEffect(() => {
    const handleGlobalError = (event) => {
      // Check if it's a ResizeObserver error
      if (event.message && 
          (event.message.includes('ResizeObserver') || 
           (event.error && event.error.message && 
            event.error.message.includes('ResizeObserver')))) {
        event.preventDefault();
        return false;
      }
      return true;
    };

    // Set up global error handler for ResizeObserver
    const originalErrorHandler = window.onerror;
    
    // Add event listener for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      if (event.reason && 
          event.reason.message && 
          event.reason.message.includes('ResizeObserver')) {
        event.preventDefault();
        return false;
      }
      return true;
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.onerror = (message, source, lineno, colno, error) => {
      if (message && message.toString().includes('ResizeObserver')) {
        return true; // Suppress ResizeObserver errors
      }
      // Forward other errors to the original handler
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    // Load exam data
    const loadExamData = async () => {
      try {
        const [examRes, courseRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/courses/${courseId}/final-exam`),
          axios.get(`http://localhost:5000/api/courses/${courseId}`)
        ]);
        
        setExam(examRes.data);
        setCourse(courseRes.data);
        setTimeRemaining(examRes.data.duration * 60); // Convert minutes to seconds
        
      } catch (err) {
        console.error('Error loading exam data:', err);
        setError('Failed to load exam. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadExamData();
    
    // Setup security listeners when component mounts and exam starts
    if (examStarted && isSecureMode) {
      setupSecurityListeners();
    }
    
    return () => {
      // Cleanup security listeners
      cleanupSecurityListeners();
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Clean up ResizeObserver
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      // Clean up event listeners and restore original error handler
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.onerror = originalErrorHandler;
    };
  }, [courseId, examStarted, isSecureMode]);

  const setupSecurityListeners = () => {
    // Only add listeners if they don't already exist and we're in secure mode
    if (!isSecureMode) return;
    
    try {
      // Security event listeners
      document.addEventListener('contextmenu', preventRightClick);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('selectstart', preventSelection);
      
      // Fullscreen change detection
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    } catch (error) {
      console.error('Error setting up security listeners:', error);
    }
  };

  const cleanupSecurityListeners = () => {
    try {
      // Safely remove all event listeners
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    } catch (error) {
      console.error('Error cleaning up security listeners:', error);
    }
  };

  const preventRightClick = (e) => {
    if (isSecureMode) {
      e.preventDefault();
      addSecurityViolation('Right-click attempted');
    }
  };

  const preventKeyboardShortcuts = (e) => {
    if (isSecureMode) {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+A, F12, etc.
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) {
        e.preventDefault();
        addSecurityViolation(`Keyboard shortcut attempted: Ctrl+${e.key.toUpperCase()}`);
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        addSecurityViolation('Developer tools access attempted');
      }
    }
  };

  const handleVisibilityChange = () => {
    if (isSecureMode && document && document.hidden !== undefined && examStarted && !examSubmitted) {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          setShowWarning(true);
        }
        return newCount;
      });
      addSecurityViolation('Tab switch detected');
    }
  };

  const preventSelection = (e) => {
    if (isSecureMode) {
      e.preventDefault();
    }
  };

  const handleFullscreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement);
  };

  const addSecurityViolation = (violation) => {
    setSecurityViolations(prev => [...prev, {
      type: violation,
      timestamp: new Date().toISOString()
    }]);
  };

  const enterFullscreen = async () => {
    try {
      await examRef.current.requestFullscreen();
      setIsSecureMode(true);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const startExam = async () => {
    try {
      if (exam?.securitySettings?.fullScreenRequired) {
        await enterFullscreen();
      }
      
      // Set secure mode first
      setIsSecureMode(true);
      
      // Then start the exam
      setExamStarted(true);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitExam(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Setup security listeners after a small delay to ensure state updates
      setTimeout(setupSecurityListeners, 100);
      
    } catch (error) {
      console.error('Error starting exam:', error);
      setError('Failed to start exam. Please try again.');
    }
  };

  const submitExam = async (autoSubmit = false) => {
    try {
      setExamSubmitted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Prepare submission data
      const submissionData = {
        answers,
        securityViolations,
        tabSwitchCount,
        timeSpent: (exam.duration * 60) - timeRemaining,
        autoSubmitted: autoSubmit
      };
      
      // Make the API call
      const response = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/final-exam/submit`,
        submissionData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      // Clean up
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (fsError) {
        console.warn('Error exiting fullscreen:', fsError);
      }
      
      // Navigate to results page with the response data
      if (response && response.data) {
        navigate(`/courses/${courseId}/final-exam/results`, { 
          state: { results: response.data },
          replace: true
        });
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      // If navigation fails, try a more reliable method
      try {
        window.location.href = `/courses/${courseId}/final-exam/results?error=submission_failed`;
      } catch (navError) {
        console.error('Navigation failed:', navError);
        setError('Failed to submit exam. Please try again or contact support.');
        setExamSubmitted(false); // Allow retry
      }
      setError('Failed to submit exam');
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post('http://localhost:2358/submissions', {
        source_code: code,
        language_id: getLanguageId(language),
        stdin: getCurrentQuestion().sampleInput || ''
      });
      
      setTimeout(async () => {
        const result = await axios.get(`http://localhost:2358/submissions/${response.data.token}`);
        setOutput(result.data.stdout || result.data.stderr || 'No output');
        setIsRunning(false);
      }, 2000);
    } catch (error) {
      setOutput('Error running code');
      setIsRunning(false);
    }
  };

  const getLanguageId = (lang) => {
    const languageMap = { python: 71, cpp: 54, java: 62 };
    return languageMap[lang] || 71;
  };

  const getCurrentQuestion = () => {
    const totalMCQs = exam?.mcqs?.length || 0;
    if (currentQuestion < totalMCQs) {
      return exam.mcqs[currentQuestion];
    } else {
      return exam.codeChallenges[currentQuestion - totalMCQs];
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="secure-exam-loading">
        <div className="loading-spinner"></div>
        <p>Loading Final Exam...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secure-exam-error">
        <AlertTriangle size={48} />
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="secure-exam-container" ref={examRef}>
        <div className="exam-instructions">
          <div className="security-header">
            <Shield size={32} />
            <h1>Final Course Assessment</h1>
            <div className="security-badge">SECURE ENVIRONMENT</div>
          </div>
          
          <div className="exam-details">
            <h2>{course?.title} - Final Exam</h2>
            <p>{exam?.description}</p>
            
            <div className="exam-stats">
              <div className="stat">
                <Clock size={20} />
                <span>Duration: {exam?.duration} minutes</span>
              </div>
              <div className="stat">
                <CheckCircle size={20} />
                <span>Questions: {(exam?.mcqs?.length || 0) + (exam?.codeChallenges?.length || 0)}</span>
              </div>
              <div className="stat">
                <Shield size={20} />
                <span>Total Marks: {exam?.totalMarks}</span>
              </div>
            </div>
          </div>
          
          <div className="security-warnings">
            <h3><AlertTriangle size={20} /> Security Requirements</h3>
            <ul>
              <li>This exam will run in fullscreen mode</li>
              <li>Tab switching is monitored and limited</li>
              <li>Copy/paste operations are disabled</li>
              <li>Right-click is disabled</li>
              <li>Browser developer tools are blocked</li>
              <li>Exam will auto-submit when time expires</li>
            </ul>
          </div>
          
          <button className="start-exam-btn" onClick={startExam}>
            <Play size={20} />
            Start Secure Exam
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = (exam?.mcqs?.length || 0) + (exam?.codeChallenges?.length || 0);
  const currentQ = getCurrentQuestion();
  const isMCQ = currentQuestion < (exam?.mcqs?.length || 0);

  return (
    <div className="secure-exam-container active" ref={examRef}>
      {/* Security Header */}
      <div className="secure-header">
        <div className="security-status">
          <Shield size={16} />
          <span>SECURE MODE</span>
          {tabSwitchCount > 0 && (
            <div className="violation-count">
              <AlertTriangle size={14} />
              {tabSwitchCount} violations
            </div>
          )}
        </div>
        
        <div className="exam-timer">
          <Clock size={16} />
          <span className={timeRemaining < 300 ? 'time-warning' : ''}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        
        <div className="question-progress">
          Question {currentQuestion + 1} of {totalQuestions}
        </div>
      </div>

      {/* Question Content */}
      <div className="question-container">
        {isMCQ ? (
          <div className="mcq-question">
            <h3>Question {currentQuestion + 1}</h3>
            <p className="question-text">{currentQ?.question}</p>
            
            <div className="mcq-options">
              {currentQ?.options?.map((option, index) => (
                <label key={index} className="mcq-option">
                  <input
                    type="radio"
                    name={`mcq_${currentQuestion}`}
                    value={index}
                    checked={answers[`mcq_${currentQuestion}`] === index}
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      [`mcq_${currentQuestion}`]: parseInt(e.target.value)
                    }))}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="coding-question">
            <h3>Coding Challenge {currentQuestion - (exam?.mcqs?.length || 0) + 1}</h3>
            <div className="problem-statement">
              <h4>{currentQ?.title}</h4>
              <p>{currentQ?.description}</p>
              
              {currentQ?.sampleInput && (
                <div className="sample-io">
                  <div className="sample-input">
                    <strong>Sample Input:</strong>
                    <pre>{currentQ.sampleInput}</pre>
                  </div>
                  <div className="sample-output">
                    <strong>Sample Output:</strong>
                    <pre>{currentQ.sampleOutput}</pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="code-editor-section">
              <div className="editor-header">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="language-select"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                
                <button 
                  onClick={runCode} 
                  disabled={isRunning}
                  className="run-btn"
                >
                  {isRunning ? <Square size={16} /> : <Play size={16} />}
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
              
              <div className="editor-container">
                <Editor
                  height="300px"
                  language={language === 'cpp' ? 'cpp' : language}
                  value={code}
                  onChange={setCode}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on'
                  }}
                />
              </div>
              
              <div className="output-section">
                <h4>Output:</h4>
                <pre className="output-display">{output || 'Run your code to see output'}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="exam-navigation">
        <button 
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="nav-btn prev-btn"
        >
          Previous
        </button>
        
        <div className="question-indicators">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`question-indicator ${i === currentQuestion ? 'active' : ''} ${
                answers[i < (exam?.mcqs?.length || 0) ? `mcq_${i}` : `code_${i - (exam?.mcqs?.length || 0)}`] !== null && 
                answers[i < (exam?.mcqs?.length || 0) ? `mcq_${i}` : `code_${i - (exam?.mcqs?.length || 0)}`] !== '' ? 'answered' : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        {currentQuestion < totalQuestions - 1 ? (
          <button 
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="nav-btn next-btn"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={() => submitExam()}
            className="submit-btn"
          >
            Submit Exam
          </button>
        )}
      </div>

      {/* Security Warning Modal */}
      {showWarning && (
        <div className="security-warning-modal">
          <div className="warning-content">
            <AlertTriangle size={48} />
            <h3>Security Violation Detected</h3>
            <p>Multiple tab switches detected. Further violations may result in automatic exam submission.</p>
            <button onClick={() => setShowWarning(false)}>Continue Exam</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureFinalExam;
