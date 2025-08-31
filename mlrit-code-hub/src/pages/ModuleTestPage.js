import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Code, BookOpen, Award } from 'lucide-react';
import Editor from '@monaco-editor/react';
import './ModuleTestPage.css';

const ModuleTestPage = () => {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [moduleTest, setModuleTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [isAnswerSaved, setIsAnswerSaved] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [codingAnswers, setCodingAnswers] = useState({});
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [leftWidth, setLeftWidth] = useState(50);
  const [codeHeight, setCodeHeight] = useState(60); // Percentage for code area height
  const containerRef = useRef(null);
  const verticalContainerRef = useRef(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchModuleTest();
  }, [courseId, topicId]);

  useEffect(() => {
    if (moduleTest && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [moduleTest, showResults]);

  const fetchModuleTest = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/topics/${topicId}/test`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Backend returns: { topicTitle, totalMarks, mcqs, codeChallenges }
      const testData = response.data;
      
      setTopic({ title: testData.topicTitle });
      setModuleTest({
        mcqs: testData.mcqs || [],
        codeChallenges: testData.codeChallenges || [],
        totalMarks: testData.totalMarks
      });
      
      // Combine MCQs and coding challenges into unified question list
      const combinedQuestions = [
        ...(testData.mcqs || []).map((mcq, index) => ({ ...mcq, type: 'mcq', originalIndex: index })),
        ...(testData.codeChallenges || []).map((challenge, index) => ({ ...challenge, type: 'coding', originalIndex: index }))
      ];
      setAllQuestions(combinedQuestions);
    } catch (err) {
      console.error('Error fetching module test:', err);
      setError('Failed to load module test');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
    // Reset save status when answer changes
    setIsAnswerSaved(false);
  };

  const handleSaveAnswer = () => {
    const currentQuestionData = allQuestions[currentQuestion];
    
    if (currentQuestionData?.type === 'mcq' && selectedAnswers[currentQuestion] !== undefined) {
      setSavedAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswers[currentQuestion]
      }));
      setIsAnswerSaved(true);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
        setIsAnswerSaved(false);
      }, 3000);
    } else if (currentQuestionData?.type === 'coding' && code.trim()) {
      setCodingAnswers(prev => ({
        ...prev,
        [currentQuestion]: {
          code: code,
          language: language
        }
      }));
      setIsAnswerSaved(true);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
        setIsAnswerSaved(false);
      }, 3000);
    }
  };

  // Language mapping for Judge0 API - same as LessonPage
  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before running.");
      setShowOutput(true);
      return;
    }
    setIsRunning(true);
    setOutput("Running...");
    setShowOutput(true);

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: customInput || "",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());
    } catch (err) {
      console.error("Run Error:", err);
      setOutput("Error running code");
    } finally {
      setIsRunning(false);
    }
  };

  const getInitialCode = () => {
    const currentQuestionData = allQuestions[currentQuestion];
    if (currentQuestionData?.type !== 'coding') return '';
    
    return currentQuestionData.initialCode || `# Write your solution here
def solution():
    pass`;
  };

  // Load saved code when switching to coding questions
  useEffect(() => {
    const currentQuestionData = allQuestions[currentQuestion];
    if (currentQuestionData?.type === 'coding') {
      const savedCode = codingAnswers[currentQuestion];
      if (savedCode) {
        setCode(savedCode.code);
        setLanguage(savedCode.language);
      } else {
        setCode(getInitialCode());
      }
    }
  }, [currentQuestion, allQuestions]);

  // Resizer functionality
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

  const startVerticalDrag = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startCodeHeight = codeHeight;
    
    const doDrag = (e) => {
      const containerHeight = verticalContainerRef.current?.offsetHeight || 600;
      const deltaY = e.clientY - startY;
      const deltaPercent = (deltaY / containerHeight) * 100;
      const newCodeHeight = Math.min(85, Math.max(30, startCodeHeight + deltaPercent));
      setCodeHeight(newCodeHeight);
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const handleSubmitTest = async () => {
    if (!moduleTest) return;

    // Check if any questions are answered
    const totalAnswered = Object.keys(savedAnswers).length + Object.keys(codingAnswers).length;
    
    if (totalAnswered === 0) {
      setShowSubmitWarning(true);
      return;
    }

    // Calculate results locally for now
    const allQuestions = [...(moduleTest.mcqQuestions || []), ...(moduleTest.codingQuestions || [])];
    const totalQuestions = allQuestions.length;
    
    let correctCount = 0;
    let mcqCorrect = 0;
    let codingCorrect = 0;
    
    // Check MCQ answers
    moduleTest.mcqQuestions?.forEach((question, index) => {
      const userAnswer = savedAnswers[`mcq-${index}`];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
        mcqCorrect++;
      }
    });
    
    // For coding questions, assume correct if there's an answer
    moduleTest.codingQuestions?.forEach((question, index) => {
      const userCode = codingAnswers[`coding-${index}`];
      if (userCode && userCode.trim().length > 0) {
        correctCount++;
        codingCorrect++;
      }
    });
    
    const wrongCount = totalQuestions - correctCount - (totalQuestions - Object.keys(savedAnswers).length - Object.keys(codingAnswers).length);
    const unattemptedCount = totalQuestions - Object.keys(savedAnswers).length - Object.keys(codingAnswers).length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    
    const testResult = {
      score: correctCount,
      totalMarks: moduleTest?.totalMarks || 100,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unattempted: unattemptedCount,
      percentage: percentage,
      totalQuestions: totalQuestions,
      mcqCorrect: mcqCorrect,
      codingCorrect: codingCorrect
    };
    
    setScore(percentage);
    setTestResults(testResult);
    setShowDetailedResults(true);
  };

  const handleForceSubmit = async () => {
    setShowSubmitWarning(false);
    
    // Calculate results with no answers
    const allQuestions = [...(moduleTest.mcqQuestions || []), ...(moduleTest.codingQuestions || [])];
    const totalQuestions = allQuestions.length;
    
    const testResult = {
      score: 0,
      totalMarks: moduleTest?.totalMarks || 100,
      correctAnswers: 0,
      wrongAnswers: 0,
      unattempted: totalQuestions,
      percentage: 0,
      totalQuestions: totalQuestions,
      mcqCorrect: 0,
      codingCorrect: 0
    };
    
    setScore(0);
    setTestResults(testResult);
    setShowDetailedResults(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const nextQuestion = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Show detailed results page if available
  if (showDetailedResults && testResults) {
    return (
      <div className="detailed-results-page">
        <div className="results-header">
          <h1>Module test: {topic?.title || 'Output / print in python'} - Report</h1>
          <p className="attempted-date">Attempted on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <button 
            className="review-assessment-btn"
            onClick={() => setShowDetailedResults(false)}
          >
            📋 Review Assessment
          </button>
        </div>

        <div className="score-section">
          <div className="total-score">
            <h2>Your Total Score</h2>
            <div className="score-display">
              <span className="score-number">{testResults.correctAnswers || 0}</span>
              <span className="score-total">/{testResults.totalQuestions || (moduleTest?.mcqQuestions?.length || 0) + (moduleTest?.codingQuestions?.length || 0)} points</span>
            </div>
            <div className="score-breakdown">
              <div className="breakdown-item correct">
                <span className="indicator">●</span>
                <span className="count">{String(testResults.correctAnswers || 0).padStart(2, '0')}</span>
                <span className="label">Correct Answers</span>
              </div>
              <div className="breakdown-item wrong">
                <span className="indicator">●</span>
                <span className="count">{String(testResults.wrongAnswers || 0).padStart(2, '0')}</span>
                <span className="label">Wrong Answers</span>
              </div>
              <div className="breakdown-item unattempted">
                <span className="indicator">●</span>
                <span className="count">{String(testResults.unattempted || 0).padStart(2, '0')}</span>
                <span className="label">Unattempted</span>
              </div>
            </div>

          </div>
          <div className="skill-score">
            <div className="circular-progress">
              <div 
                className="progress-circle"
                style={{
                  background: `conic-gradient(#10b981 0deg, #10b981 ${(testResults.percentage || 0) * 3.6}deg, #e5e7eb ${(testResults.percentage || 0) * 3.6}deg, #e5e7eb 360deg)`
                }}
              >
                <span className="percentage">{Math.round(testResults.percentage || 0)}%</span>
              </div>
            </div>
            <p className="skill-label">SKILL SCORE</p>
          </div>
        </div>

        <div className="topic-summary">
          <h3>Topic wise summary</h3>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Correct</th>
                <th>Total</th>
                <th>Remarks</th>
                <th>Resources</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{topic?.title || 'Printing in Python'}</td>
                <td>{testResults.correctAnswers || 0}</td>
                <td>{testResults.totalQuestions || (moduleTest?.mcqQuestions?.length || 0) + (moduleTest?.codingQuestions?.length || 0)}</td>
                <td>
                  <span className={`remark ${(testResults.percentage || 0) >= 70 ? 'strong' : (testResults.percentage || 0) >= 40 ? 'average' : 'weak'}`}>
                    ● {(testResults.percentage || 0) >= 70 ? 'Strong' : (testResults.percentage || 0) >= 40 ? 'Average' : 'Weak'}
                  </span>
                </td>
                <td>
                  <button className="learn-btn" onClick={() => navigate(`/courses/${courseId}`)}>Learn →</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="problem-type-summary">
          <h3>Problem type</h3>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Correct</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MCQs</td>
                <td>{testResults.mcqCorrect || 0}</td>
                <td>{moduleTest?.mcqQuestions?.length || 0}</td>
              </tr>
              <tr>
                <td>Coding Problems</td>
                <td>{testResults.codingCorrect || 0}</td>
                <td>{moduleTest?.codingQuestions?.length || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="results-actions">
          <button 
            className="back-to-course-btn"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Back to Course
          </button>
          <button 
            className="retake-test-btn"
            onClick={() => {
              setShowDetailedResults(false);
              setShowResults(false);
              setCurrentQuestion(0);
              setSavedAnswers({});
              setCodingAnswers({});
              setSelectedAnswers({});
              setScore(0);
              setTestResults(null);
            }}
          >
            Retake Test
          </button>
        </div>
      </div>
    );
  }

  if (loading || !moduleTest) {
    return (
      <div className="module-test-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading module test...</p>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="module-test-container">
        <div className="test-intro">
          <div className="intro-header">
            <h1>Module Test: {topic?.title}</h1>
            <p className="intro-subtitle">Are you ready to test your knowledge of {topic?.title}?</p>
          </div>

          <div className="intro-content">
            <div className="test-overview">
              <h2>Why Take Our Module Test?</h2>
              <div className="overview-text">
                <p><strong>Identify Areas for Improvement:</strong> Our module test will highlight your strengths and weaknesses in various aspects of this topic.</p>
                <ul>
                  <li>If you score more than 80% in the module test - you should continue learning the next topics.</li>
                  <li>If you score less than 80% in the module test - you should revisit the learning concepts and practice more problems in this module.</li>
                </ul>
              </div>
            </div>

            <div className="test-syllabus">
              <h3>Test Syllabus</h3>
              <div className="syllabus-item">
                <span className="syllabus-icon">📄</span>
                <span>{topic?.title}</span>
              </div>
            </div>

            <div className="test-details">
              <div className="detail-item">
                <div className="detail-icon">🕒</div>
                <div className="detail-content">
                  <h4>{Math.floor(timeLeft / 60)} Minutes</h4>
                  <p>Total time to attempt the assessment</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📝</div>
                <div className="detail-content">
                  <h4>{(moduleTest?.mcqs?.length || 0) + (moduleTest?.codeChallenges?.length || 0)} Questions</h4>
                  <p>MCQs and coding challenges</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-content">
                  <h4>{localStorage.getItem('username') || 'Student'}</h4>
                  <p>CodeChef Username: {localStorage.getItem('username') || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="test-rules">
              <h3>Read the rules carefully before starting</h3>
              <ul className="rules-list">
                <li>You will not be able to pause the assessment after starting.</li>
                <li>You will get a detailed report on your performance at the end of the assessment.</li>
                <li>Make sure you have a stable internet connection.</li>
                <li>Do not refresh the page during the test.</li>
              </ul>
            </div>

            <div className="start-section">
              <label className="agreement-checkbox">
                <input 
                  type="checkbox" 
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                />
                <span>I agree to participate fairly in the assessment</span>
              </label>

              <button 
                className="start-assessment-btn"
                disabled={!agreedToRules}
                onClick={() => setShowIntro(false)}
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-test-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="module-test-container">
        <div className="test-results">
          <div className="results-header">
            <Award className="results-icon" />
            <h2>Test Complete!</h2>
          </div>
          
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}%</span>
            </div>
            <p className="score-text">
              You scored {score}% ({Object.values(selectedAnswers).filter((answer, index) => 
                answer === moduleTest.mcqs[index]?.correct
              ).length} out of {moduleTest.mcqs.length} correct)
            </p>
          </div>

          <div className="results-actions">
            <button 
              onClick={() => navigate(`/courses/${courseId}/modules`)}
              className="continue-btn"
            >
              <CheckCircle size={20} />
              Continue Learning
            </button>
            <button 
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setSelectedAnswers({});
                setTimeLeft(1800);
              }}
              className="retry-btn"
            >
              Retry Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="module-test-container">
        <div className="error-state">
          <p>No test questions available</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main component return
  return (
    <div className="module-test-container">
      {/* Custom Test Navbar */}
      <div className="test-navbar">
        <div className="navbar-left">
          <div className="test-status">
            <span className="status-indicator">●</span>
            <span className="status-text">Not Attempted</span>
          </div>
        </div>
        
        <div className="navbar-center">
          <div className="test-title">{topic?.title}</div>
          <div className="question-counter">
            Question {currentQuestion + 1} / {allQuestions.length}
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="timer-display">
            <Clock size={16} />
            <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
          <div className="nav-controls">
            <button 
              onClick={prevQuestion} 
              disabled={currentQuestion === 0}
              className="nav-control prev"
            >
              ‹ Prev
            </button>
            <span className="nav-divider">|</span>
            <button 
              onClick={nextQuestion}
              disabled={!allQuestions.length || currentQuestion >= allQuestions.length - 1}
              className="nav-control next"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div className="test-progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${allQuestions.length ? ((currentQuestion + 1) / allQuestions.length) * 100 : 0}%` }}
        ></div>
      </div>


      {/* Main Content - Dynamic Layout */}
      <div className="test-main-content">
        {allQuestions[currentQuestion]?.type === 'mcq' ? (
          <>
            {/* Left Panel - Question Statement */}
            <div className="test-left-panel">
              <div className="question-statement">
                <h2>Question {currentQuestion + 1}</h2>
                <p className="question-text">
                  {allQuestions[currentQuestion]?.question}
                </p>
              </div>
            </div>

            {/* Right Panel - MCQ Options */}
            <div className="test-right-panel">
              <div className="mcq-options">
                <h3>Choose the correct answer:</h3>
                <div className="options-list">
                  {allQuestions[currentQuestion]?.options?.map((option, index) => (
                    <label key={index} className="mcq-option">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={index}
                        checked={selectedAnswers[currentQuestion] === index}
                        onChange={() => handleAnswerSelect(currentQuestion, index)}
                        className="mcq-radio"
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mcq-actions">
                  <button
                    onClick={handleSaveAnswer}
                    className={`save-btn ${isAnswerSaved ? 'saved' : ''}`}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                  >
                    {isAnswerSaved ? '✓ Saved' : 'Save Answer'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Coding Challenge Interface */
          <div className="coding-container" ref={containerRef}>
            {/* Left Panel - Problem Statement */}
            <div className="coding-left" style={{ width: `${leftWidth}%` }}>
              <div className="problem-statement">
                <h2>Question {currentQuestion + 1}: {allQuestions[currentQuestion]?.title}</h2>
                <div className="problem-description">
                  <p>{allQuestions[currentQuestion]?.description}</p>
                  
                  {allQuestions[currentQuestion]?.constraints && (
                    <div className="constraints-section">
                      <h3>Constraints:</h3>
                      <p>{allQuestions[currentQuestion]?.constraints}</p>
                    </div>
                  )}
                  
                  {allQuestions[currentQuestion]?.sampleInput && (
                    <div className="sample-cases">
                      <h3>Sample Test Cases:</h3>
                      <div className="testcase-block">
                        <strong>Input:</strong>
                        <pre>{allQuestions[currentQuestion]?.sampleInput}</pre>
                        <strong>Output:</strong>
                        <pre>{allQuestions[currentQuestion]?.sampleOutput}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resizer */}
            <div className="resizer" onMouseDown={startDrag} />

            {/* Right Panel - Code Editor and Output */}
            <div className="coding-right" style={{ width: `${100 - leftWidth}%` }} ref={verticalContainerRef}>
              <div className="editor-toolbar">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <div className="toolbar-buttons">
                  <button 
                    className="run-button"
                    onClick={handleRunCode} 
                    disabled={isRunning}
                  >
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={handleSaveAnswer}
                    className={`save-btn ${isAnswerSaved ? 'saved' : ''}`}
                    disabled={!code.trim()}
                  >
                    {isAnswerSaved ? '✓ Saved' : 'Save Code'}
                  </button>
                </div>
              </div>

              {/* Code Editor Area */}
              <div className="code-editor-area" style={{ height: `${codeHeight}%` }}>
                <div className="monaco-editor-container">
                  <Editor
                    height="100%"
                    width="100%"
                    theme="vs-dark"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    onChange={(val) => {
                      setCode(val);
                      setIsAnswerSaved(false);
                    }}
                    options={{ 
                      fontSize: 14,
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      lineNumbers: 'on',
                      renderLineHighlight: 'line',
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      overviewRulerLanes: 0,
                      lineNumbersMinChars: 1,
                      glyphMargin: false,
                      folding: false,
                      renderWhitespace: 'none',
                      cursorBlinking: 'blink',
                      cursorStyle: 'line',
                      wordWrap: 'on',
                      contextmenu: false,
                      selectOnLineNumbers: true,
                      padding: { top: 0, bottom: 0 },
                      lineDecorationsWidth: 0,
                      revealHorizontalRightPadding: 0,
                      scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10
                      }
                    }}
                  />
                </div>
              </div>

              {/* Vertical Resizer between code and output */}
              {showOutput && (
                <div className="vertical-resizer" onMouseDown={startVerticalDrag} />
              )}

              {/* Output Section */}
              {showOutput && (
                <div className="output-area" style={{ height: `${100 - codeHeight}%` }}>
                  <div className="output-section">
                    <h4>Output</h4>
                    <pre className="output-box">{output}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="notification-toast">
          <div className="toast-content">
            <span className="toast-icon">✓</span>
            <span className="toast-message">Your response saved successfully!</span>
          </div>
        </div>
      )}

      {/* Test Results Modal - Dark Theme (Hidden - Direct to detailed results) */}
      {showResults && testResults && (
        <div className="test-completion-overlay" style={{display: 'none'}}>
          <div className="test-completion-modal">
            <div className="completion-icon">
              <div className="trophy-icon">🏆</div>
            </div>
            
            <h1 className="completion-title">Test Complete!</h1>
            
            <div className="score-circle">
              <div className="percentage-display">{Math.round(testResults.percentage || 0)}%</div>
            </div>
            
            
            <p className="score-text">
              You scored {Math.round(testResults.percentage || 0)}% ({testResults.correctAnswers || 0} out of {testResults.totalQuestions || allQuestions.length} correct)
            </p>
            
            <div className="completion-actions">
              <button 
                className="continue-learning-btn"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                ✓ Continue Learning
              </button>
              <button 
                className="retry-test-btn"
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setSavedAnswers({});
                  setCodingAnswers({});
                  setSelectedAnswers({});
                  setScore(0);
                  setTestResults(null);
                }}
              >
                Retry Test
              </button>
            </div>
            
            <div className="review-link">
              <button 
                className="review-assessment-link"
                onClick={() => {
                  setShowResults(false);
                  setShowDetailedResults(true);
                }}
              >
                📋 Review Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results Page is now handled at the top level return */}

      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <div className="modal-overlay">
          <div className="warning-modal">
            <div className="warning-header">
              <h3>⚠️ Submit Test Without Answers?</h3>
            </div>
            <div className="warning-content">
              <p>You haven't answered any questions yet. Are you sure you want to submit the test?</p>
              <p className="warning-note">This will result in a score of 0 points.</p>
            </div>
            <div className="warning-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowSubmitWarning(false)}
              >
                Cancel
              </button>
              <button 
                className="force-submit-btn"
                onClick={handleForceSubmit}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Only show when not showing results */}
      {!showResults && (
        <div className="test-navigation">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="nav-btn prev-btn"
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          <div className="question-indicators">
            {allQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`question-indicator ${
                  index === currentQuestion ? 'current' : ''
                } ${
                  (question.type === 'mcq' && savedAnswers[index] !== undefined) || 
                  (question.type === 'coding' && codingAnswers[index] !== undefined) ? 'saved' : ''
                } ${
                  (question.type === 'mcq' && selectedAnswers[index] !== undefined && savedAnswers[index] === undefined) ||
                  (question.type === 'coding' && code.trim() && codingAnswers[index] === undefined) ? 'unsaved' : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {allQuestions.length > 0 && currentQuestion === allQuestions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              className="nav-btn submit-btn"
disabled={false}
            >
              Submit Test
              <CheckCircle size={20} />
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="nav-btn next-btn"
            >
              Next
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleTestPage;

