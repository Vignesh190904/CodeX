import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { 
  ArrowLeft, 
  Play, 
  Send, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Code,
  Target,
  ChevronRight,
  ChevronLeft,
  RotateCcw
} from "lucide-react";
import "./TopicView.css";

const TopicView = () => {
  const { courseId, moduleIndex, topicIndex } = useParams();
  const navigate = useNavigate();
  
  // Course and topic data
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [progress, setProgress] = useState({});
  
  // Learning flow state - strict step progression
  const [currentStep, setCurrentStep] = useState(0); // 0: theory, 1: coding, 2: mcq
  const [topicProgress, setTopicProgress] = useState({
    theoryCompleted: false,
    codingCompleted: false,
    mcqCompleted: false,
    overallCompleted: false
  });
  
  // Coding section state
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [codingVerdict, setCodingVerdict] = useState("");
  const [codingLoading, setCodingLoading] = useState(false);
  
  // MCQ section state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [mcqResults, setMcqResults] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [hasSubmittedCode, setHasSubmittedCode] = useState(false);
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const languageMap = {
    python: 71,
    cpp: 54,
    java: 62,
  };

  const boilerplate = {
    python: `# Write your Python code here
print("Hello, World!")`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your C++ code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
    java: `public class Main {
    public static void main(String[] args) {
        // Write your Java code here
        System.out.println("Hello, World!");
    }
}`,
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, moduleIndex, topicIndex]);

  useEffect(() => {
    if (currentTopic && !code) {
      setCode(currentTopic.codeSnippet || boilerplate[language]);
    }
  }, [currentTopic, language]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const courseData = courseResponse.data;
      setCourse(courseData);
      
      // Get current module and topic
      const module = courseData.modules[parseInt(moduleIndex)];
      const topic = module?.topics[parseInt(topicIndex)];
      
      setCurrentModule(module);
      setCurrentTopic(topic);
      
      // Fetch progress
      if (userId) {
        const progressResponse = await axios.get(`http://localhost:5000/api/courses/${courseId}/progress?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgress(progressResponse.data || {});
        
        // Set topic progress based on existing data
        const moduleProgress = progressResponse.data?.modulesProgress?.find(m => m.moduleIndex === parseInt(moduleIndex));
        const existingTopicProgress = moduleProgress?.topicsProgress?.find(t => t.topicId.toString() === topic?._id?.toString());
        
        if (existingTopicProgress) {
          setTopicProgress({
            theoryCompleted: existingTopicProgress.completed || false,
            codingCompleted: existingTopicProgress.completed || false,
            mcqCompleted: existingTopicProgress.completed || false,
            overallCompleted: existingTopicProgress.completed || false
          });
        }
      }
      
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before running.");
      setShowOutput(true);
      return;
    }
    
    setCodingLoading(true);
    setOutput("Running...");
    setCodingVerdict("");
    setShowOutput(true);

    try {
      const response = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: customInput,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = response.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());
      
      // Check if there's expected output for this coding exercise
      if (currentTopic?.expectedOutput) {
        const isCorrect = finalOutput.trim() === currentTopic.expectedOutput.trim();
        setCodingVerdict(isCorrect ? "✅ Correct Output!" : "❌ Output doesn't match expected result");
        
        if (isCorrect) {
          setTopicProgress(prev => ({ ...prev, codingCompleted: true }));
        }
      } else {
        setCodingVerdict("✅ Code executed successfully!");
        setTopicProgress(prev => ({ ...prev, codingCompleted: true }));
      }
      
    } catch (error) {
      console.error("Run Error:", error);
      setOutput("Error running code. Please check your syntax.");
      setCodingVerdict("❌ Execution failed");
    } finally {
      setCodingLoading(false);
    }
  };

  const handleMCQAnswer = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleMCQSubmit = () => {
    if (!currentTopic?.questions || currentTopic.questions.length === 0) return;
    
    let correctCount = 0;
    const results = {};
    
    currentTopic.questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      const isCorrect = selectedAnswer === question.correct;
      results[index] = {
        selected: selectedAnswer,
        correct: question.correct,
        isCorrect: isCorrect
      };
      if (isCorrect) correctCount++;
    });
    
    const score = Math.round((correctCount / currentTopic.questions.length) * 100);
    setMcqResults(results);
    setMcqScore(score);
    setMcqSubmitted(true);
    
    // Mark MCQ as completed if score is above 70%
    if (score >= 70) {
      setTopicProgress(prev => ({ ...prev, mcqCompleted: true }));
    }
  };

  const markTheoryComplete = () => {
    setTopicProgress(prev => ({ ...prev, theoryCompleted: true }));
  };

  const handleNextStep = () => {
    if (currentStep === 0 && topicProgress.theoryCompleted) {
      // Move from theory to coding (if exists) or MCQ
      if (currentTopic.type === 'coding' || currentTopic.codeSnippet) {
        setCurrentStep(1);
      } else if (currentTopic.questions && currentTopic.questions.length > 0) {
        setCurrentStep(2);
      } else {
        // No coding or MCQ, complete the topic
        handleTopicComplete();
      }
    } else if (currentStep === 1 && topicProgress.codingCompleted) {
      // Move from coding to MCQ (if exists)
      if (currentTopic.questions && currentTopic.questions.length > 0) {
        setCurrentStep(2);
      } else {
        // No MCQ, complete the topic
        handleTopicComplete();
      }
    } else if (currentStep === 2 && topicProgress.mcqCompleted) {
      // Complete the topic
      handleTopicComplete();
    }
  };

  const handleSubmitCode = () => {
    setHasSubmittedCode(true);
    handleRunCode();
  };

  const handleTopicComplete = async () => {
    try {
      // Update topic progress on backend
      await axios.post(`http://localhost:5000/api/courses/${courseId}/topic/progress`, {
        moduleIndex: parseInt(moduleIndex),
        topicIndex: parseInt(topicIndex),
        completed: true,
        score: mcqScore || 100
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTopicProgress(prev => ({ ...prev, overallCompleted: true }));
      
      // Navigate to next topic or back to course
      const nextTopicIndex = parseInt(topicIndex) + 1;
      if (currentModule?.topics && nextTopicIndex < currentModule.topics.length) {
        navigate(`/courses/${courseId}/module/${moduleIndex}/topic/${nextTopicIndex}`);
      } else {
        navigate(`/courses/${courseId}`);
      }
      
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const canProceedToNext = () => {
    switch (currentTopic?.type) {
      case 'lesson':
        return topicProgress.theoryCompleted;
      case 'coding':
        return topicProgress.theoryCompleted && topicProgress.codingCompleted;
      case 'quiz':
      case 'test':
        return topicProgress.theoryCompleted && topicProgress.mcqCompleted;
      default:
        return topicProgress.theoryCompleted;
    }
  };

  if (loading) {
    return (
      <div className="topic-view-loading">
        <div className="loading-spinner"></div>
        <p>Loading topic...</p>
      </div>
    );
  }

  if (!currentTopic) {
    return (
      <div className="topic-view-error">
        <h2>Topic not found</h2>
        <button onClick={() => navigate(`/courses/${courseId}`)} className="back-btn">
          <ArrowLeft size={20} />
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="topic-view-container">
      {/* Header */}
      <div className="topic-view-header">
        <button 
          onClick={() => navigate(`/courses/${courseId}`)} 
          className="back-button"
        >
          <ArrowLeft size={20} />
          Back to Course
        </button>
        
        <div className="topic-breadcrumb">
          <span className="module-name">{currentModule?.title}</span>
          <ChevronRight size={16} />
          <span className="topic-name">{currentTopic.title}</span>
        </div>
        
        <div className="topic-progress-indicator">
          <div className={`progress-step ${topicProgress.theoryCompleted ? 'completed' : currentStep === 0 ? 'active' : ''}`}>
            <BookOpen size={16} />
            <span>Theory</span>
          </div>
          {(currentTopic.type === 'coding' || currentTopic.codeSnippet) && (
            <div className={`progress-step ${topicProgress.codingCompleted ? 'completed' : currentStep === 1 ? 'active' : ''}`}>
              <Code size={16} />
              <span>Practice</span>
            </div>
          )}
          {(currentTopic.questions && currentTopic.questions.length > 0) && (
            <div className={`progress-step ${topicProgress.mcqCompleted ? 'completed' : currentStep === 2 ? 'active' : ''}`}>
              <Target size={16} />
              <span>Quiz</span>
            </div>
          )}
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="step-progress-bar">
        <div className="step-indicator">
          <div className={`step ${currentStep >= 0 ? 'active' : ''} ${topicProgress.theoryCompleted ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Theory</span>
          </div>
          {(currentTopic.type === 'coding' || currentTopic.codeSnippet) && (
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${topicProgress.codingCompleted ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <span>Practice</span>
            </div>
          )}
          {(currentTopic.questions && currentTopic.questions.length > 0) && (
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${topicProgress.mcqCompleted ? 'completed' : ''}`}>
              <div className="step-number">{(currentTopic.type === 'coding' || currentTopic.codeSnippet) ? '3' : '2'}</div>
              <span>Quiz</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="topic-content">
        {/* Theory Section */}
        {currentStep === 0 && (
          <div className="theory-section">
            <div className="theory-content">
              <h1 className="topic-title">{currentTopic.title}</h1>
              {currentTopic.description && (
                <p className="topic-description">{currentTopic.description}</p>
              )}
              
              <div className="theory-body">
                {currentTopic.content ? (
                  <div className="content-text">
                    {currentTopic.content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="content-text">
                    <p>Learn how to make Python print whatever you want, and learn to use it as a basic calculator.</p>
                    <p>We'll begin with the print statement, which is commonly the first thing you learn in most programming languages.</p>
                    <p>The print statement in Python is used to display output on the screen. You can use it to print numbers, text, or the results of expressions.</p>
                    <p>Let us output a number in Python.</p>
                    <p>Some code has been populated in the IDE on the right. This code just prints 12 on the screen when you run it.</p>
                    <p>Click on <strong>Submit</strong> below the IDE to know the result. Then click on next to continue.</p>
                  </div>
                )}
              </div>
              
              <div className="theory-actions">
                {!topicProgress.theoryCompleted ? (
                  <button onClick={markTheoryComplete} className="complete-theory-btn">
                    <CheckCircle size={16} />
                    Mark as Read
                  </button>
                ) : (
                  <div className="completed-indicator">
                    <CheckCircle size={16} color="#10b981" />
                    <span>Theory Completed</span>
                  </div>
                )}
                
                {topicProgress.theoryCompleted && (
                  <button onClick={handleNextStep} className="next-step-btn">
                    Next
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Coding Section */}
        {currentStep === 1 && (currentTopic.type === 'coding' || currentTopic.codeSnippet) && (
          <div className="coding-section">
            <div className="coding-workspace">
              {/* Left Panel - Description and Task */}
              <div className="coding-left-panel">
                <div className="coding-header">
                  <h2>{currentTopic.title}</h2>
                  <div className="coding-nav">
                    <button className="nav-btn prev-btn">
                      <ChevronLeft size={16} />
                      Prev module
                    </button>
                    <div className="progress-dots">
                      <div className="dot active"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <button className="nav-btn next-btn">
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="coding-tabs">
                  <button className="tab-btn active">Statement</button>
                  <button className="tab-btn">Submissions</button>
                  <button className="tab-btn">Solution</button>
                  <button className="tab-btn">AI Help</button>
                </div>

                <div className="coding-content">
                  <h3 className="task-title">Multiple Outputs</h3>
                  <div className="listen-section">
                    <span className="listen-icon">🎧</span>
                    <span>Listen</span>
                  </div>
                  
                  <div className="task-description">
                    <p>{currentTopic.content || 'You can add as many print statements as you want to your program. Each print statement outputs its content on a new line.'}</p>
                    
                    <div className="code-example">
                      <pre><code>{currentTopic.codeSnippet || "print('99')\nprint(100)"}</code></pre>
                    </div>
                    
                    <div className="output-example">
                      <h4>Output:</h4>
                      <pre><code>{currentTopic.expectedOutput || "99\n100"}</code></pre>
                    </div>
                    
                    <div className="task-section">
                      <h4>Task</h4>
                      <p>Write a program which does the following</p>
                      <ul>
                        <li>Add a print statement and output the sum of 3 + 4</li>
                        <li>Add another print statement and output the sum of 2 + 1</li>
                      </ul>
                      <p><strong>Note:</strong> Notice that the output is printed on separate lines</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Panel - Code Editor */}
              <div className="coding-right-panel">
                <div className="editor-header">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="language-selector"
                  >
                    <option value="python">Python3</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                  <div className="editor-actions">
                    <button className="icon-btn">⚙️</button>
                    <button className="icon-btn">🔍</button>
                    <button className="icon-btn">📱</button>
                  </div>
                </div>
                
                <div className="monaco-editor-container">
                  <Editor
                    height="400px"
                    theme="vs-dark"
                    language={language === 'python' ? 'python' : language}
                    value={code}
                    onChange={(value) => setCode(value)}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      lineNumbers: 'on',
                      roundedSelection: false,
                    }}
                  />
                </div>
                
                {/* Output Section - Only visible after submit */}
                {showOutput && (
                  <div className="output-section">
                    <div className="output-header">
                      <h4>Output</h4>
                    </div>
                    <div className="output-display">
                      <pre className="output-text">{output}</pre>
                      {codingVerdict && (
                        <div className={`verdict ${codingVerdict.includes('✅') ? 'success' : 'error'}`}>
                          {codingVerdict}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="coding-actions">
                  <button 
                    onClick={handleSubmitCode}
                    disabled={codingLoading}
                    className="submit-button"
                  >
                    {codingLoading ? 'Running...' : 'Submit'}
                  </button>
                  
                  {hasSubmittedCode && topicProgress.codingCompleted && (
                    <button onClick={handleNextStep} className="next-button">
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MCQ Section */}
        {currentStep === 2 && currentTopic.questions && currentTopic.questions.length > 0 && (
          <div className="mcq-section">
            <div className="mcq-header">
              <h2>Quiz Time!</h2>
              <p>Test your understanding with these questions.</p>
            </div>
            
            <div className="mcq-questions">
              {currentTopic.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mcq-question">
                  <h3 className="question-text">
                    {questionIndex + 1}. {question.question}
                  </h3>
                  
                  <div className="mcq-options">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[questionIndex] === optionIndex;
                      const isCorrect = optionIndex === question.correct;
                      const isWrong = mcqSubmitted && isSelected && !isCorrect;
                      const showCorrect = mcqSubmitted && isCorrect;
                      
                      return (
                        <button
                          key={optionIndex}
                          onClick={() => !mcqSubmitted && handleMCQAnswer(questionIndex, optionIndex)}
                          disabled={mcqSubmitted}
                          className={`mcq-option ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''} ${showCorrect ? 'correct' : ''}`}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                          <span className="option-text">{option}</span>
                          {mcqSubmitted && isCorrect && <CheckCircle size={16} />}
                        </button>
                      );
                    })}
                  </div>
                  
                  {mcqSubmitted && question.explanation && (
                    <div className="question-explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mcq-actions">
              {!mcqSubmitted ? (
                <button 
                  onClick={handleMCQSubmit}
                  disabled={Object.keys(selectedAnswers).length !== currentTopic.questions.length}
                  className="submit-mcq-btn"
                >
                  <Send size={16} />
                  Submit Quiz
                </button>
              ) : (
                <div className="mcq-results">
                  <div className="score-display">
                    <h3>Your Score: {mcqScore}%</h3>
                    <p>
                      {mcqScore >= 70 ? 
                        "🎉 Great job! You passed the quiz." : 
                        "📚 Keep practicing! You can retake this quiz."
                      }
                    </p>
                  </div>
                  
                  {mcqScore >= 70 && (
                    <button onClick={handleNextStep} className="continue-btn">
                      Continue
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="topic-bottom-nav">
        <div className="nav-info">
          <span className="topic-type-badge">{currentTopic.type}</span>
          <span className="topic-duration">
            <Clock size={14} />
            {currentTopic.duration || '10-15 min'}
          </span>
        </div>
        
        <div className="nav-actions">
          {parseInt(topicIndex) > 0 && (
            <button 
              onClick={() => navigate(`/courses/${courseId}/module/${moduleIndex}/topic/${parseInt(topicIndex) - 1}`)}
              className="nav-button prev"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
          )}
          
          <button 
            onClick={handleTopicComplete}
            disabled={!canProceedToNext()}
            className="nav-button next"
          >
            {parseInt(topicIndex) + 1 < (currentModule?.topics?.length || 0) ? 'Next Topic' : 'Complete'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicView;
