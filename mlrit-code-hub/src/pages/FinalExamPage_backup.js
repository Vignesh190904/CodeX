import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './FinalExamPage.css';
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

const FinalExamPage = () => {
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

  useEffect(() => {
    fetchExamData();
    setupSecurityListeners();
    return () => {
      cleanupSecurityListeners();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [courseId]);

  const fetchExamData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/final-exam`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExam(response.data.exam);
      setCourse(response.data.course);
      setTimeRemaining(response.data.exam.duration * 60); // Convert to seconds
      
      // Initialize answers
      const initialAnswers = {};
      response.data.exam.mcqs.forEach((_, index) => {
        initialAnswers[`mcq_${index}`] = null;
      });
      response.data.exam.codeChallenges.forEach((_, index) => {
        initialAnswers[`code_${index}`] = '';
      });
      setAnswers(initialAnswers);
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load exam data');
      setLoading(false);
    }
  };

  const setupSecurityListeners = () => {
    // Prevent right-click
    document.addEventListener('contextmenu', preventRightClick);
    
    // Prevent copy/paste
    document.addEventListener('keydown', preventKeyboardShortcuts);
    
    // Detect tab switching
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Prevent text selection
    document.addEventListener('selectstart', preventSelection);
    
    // Fullscreen change detection
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  };

  const cleanupSecurityListeners = () => {
    document.removeEventListener('contextmenu', preventRightClick);
    document.removeEventListener('keydown', preventKeyboardShortcuts);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('selectstart', preventSelection);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
    if (isSecureMode && document.hidden && examStarted && !examSubmitted) {
      setTabSwitchCount(prev => prev + 1);
      addSecurityViolation('Tab switch detected');
      
      if (tabSwitchCount >= 2) {
        setShowWarning(true);
      }
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
    if (exam.securitySettings.fullScreenRequired) {
      await enterFullscreen();
    }
    setExamStarted(true);
    setIsSecureMode(true);
    
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
  };

  const submitExam = async (autoSubmit = false) => {
    try {
      setExamSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      const response = await axios.post(`http://localhost:5000/api/courses/${courseId}/final-exam/submit`, {
        answers,
        securityViolations,
        tabSwitchCount,
        timeSpent: (exam.duration * 60) - timeRemaining,
        autoSubmitted: autoSubmit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      
      navigate(`/courses/${courseId}/final-exam/results`, { 
        state: { results: response.data } 
      });
    } catch (error) {
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
      <div className="final-exam-loading">
        <div className="loading-spinner"></div>
        <p>Loading Final Exam...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="final-exam-error">
        <AlertTriangle size={48} />
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="final-exam-container" ref={examRef}>
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
    <div className="final-exam-container active" ref={examRef}>
      {/* Security Header */}
      <div className="final-exam-header">
        <div className="security-indicators">
          <div className="security-badge fullscreen-required">
            <Shield size={16} />
            <span>FULLSCREEN REQUIRED</span>
          </div>
          <div className="security-badge proctoring-active">
            <Eye size={16} />
            <span>PROCTORING ACTIVE</span>
          </div>
          <div className="security-badge tab-switches">
            <Monitor size={16} />
            <span>TAB SWITCHES: {tabSwitchCount}</span>
          </div>
          <div className="security-badge security-violations">
            <AlertTriangle size={16} />
            <span>VIOLATIONS: {securityViolations.length}</span>
          </div>
        </div>
        
        <div className="exam-timer-display">
          <Clock size={16} />
          <span className={timeRemaining < 300 ? 'timer-warning' : ''}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Question Content */}
      <div className="exam-content">
        {isMCQ ? (
          <div className="question-section">
            <h3 className="question-title">Question {currentQuestion + 1}</h3>
            <p className="question-text">{currentQ?.question}</p>
            
            <div className="mcq-options-list">
              {currentQ?.options?.map((option, index) => (
                <label key={index} className="mcq-option-item">
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
                  <span className="option-label">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="coding-problem-section">
            <h3 className="question-title">Coding Challenge {currentQuestion - (exam?.mcqs?.length || 0) + 1}</h3>
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
            
            <div className="coding-problem-header">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="language-selector"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              
              <button 
                onClick={runCode} 
                disabled={isRunning}
                className="run-code-btn"
              >
                {isRunning ? <Square size={16} /> : <Play size={16} />}
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
            
            <div className="code-editor-container">
              <Editor
                height="350px"
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
            
            <div className="code-output-section">
              <h4 className="output-label">Output:</h4>
              <pre className="code-output">{output || 'Run your code to see output'}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="exam-navigation-bar">
        <button 
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="nav-button"
        >
          Previous
        </button>
        
        <div className="question-navigation">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`question-nav-item ${i === currentQuestion ? 'active' : ''} ${
                answers[i < (exam?.mcqs?.length || 0) ? `mcq_${i}` : `code_${i - (exam?.mcqs?.length || 0)}`] !== null && 
                answers[i < (exam?.mcqs?.length || 0) ? `mcq_${i}` : `code_${i - (exam?.mcqs?.length || 0)}`] !== '' ? 'completed' : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        {currentQuestion < totalQuestions - 1 ? (
          <button 
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="nav-button"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={() => submitExam()}
            className="submit-exam-btn"
          >
            Submit Exam
          </button>
        )}
      </div>

      {/* Security Warning Modal */}
      {showWarning && (
        <div className="security-warning-overlay">
          <div className="security-warning-dialog">
            <AlertTriangle size={48} className="warning-icon" />
            <h3 className="warning-heading">Security Violation Detected</h3>
            <p className="warning-text">Multiple tab switches detected. Further violations may result in automatic exam submission.</p>
            <button className="warning-action-btn" onClick={() => setShowWarning(false)}>Continue Exam</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalExamPage;
