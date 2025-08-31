import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle, XCircle, Clock, User, Shield, Target, TrendingUp, BarChart3, BookOpen, RotateCcw, Eye, Brain, Code } from 'lucide-react';
import './FinalExamResults.css';

const KnowledgeAssessmentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [showDetailedResults, setShowDetailedResults] = useState(true);
  const [showReview, setShowReview] = useState(false);

  const { results, score, examData, submissionData, finalExam } = location.state || {};
  
  // Debug log to see what data is received
  useEffect(() => {
    console.log('FinalExamResults received data:', {
      results,
      score,
      examData,
      submissionData,
      finalExam,
      locationState: location.state
    });
  }, [results, score, examData, submissionData, finalExam, location.state]);
  
  // Calculate actual scores using backend data
  const calculateActualScores = () => {
    if (!results) return { actualScore: 0, totalMarks: 0, earnedMarks: 0 };
    
    // Use backend response data directly
    const earnedMarks = results.score || 0;
    const totalMarks = results.totalMarks || 0;
    const actualScore = results.percentage || 0;
    
    return { actualScore, totalMarks, earnedMarks };
  };

  const { actualScore, totalMarks, earnedMarks } = calculateActualScores();
  
  // Enhanced results with backend data
  const enhancedResults = results ? {
    ...results,
    actualScore,
    totalMarks,
    earnedMarks,
    // Use backend scoring data directly
    correctCount: results.correctAnswers || 0,
    wrongCount: results.wrongAnswers || 0,
    unattemptedCount: results.unattempted || 0,
    totalQuestions: results.totalQuestions || 0,
    mcqCorrect: results.mcqCorrect || 0,
    codingCorrect: results.codingCorrect || 0,
    mcqAttempted: results.mcqAttempted || 0,
    codingAttempted: results.codingAttempted || 0,
    totalAttempted: results.totalAttempted || 0,
    mcqEarnedMarks: results.mcqScore || 0,
    mcqTotalMarks: results.mcqResults ? results.mcqResults.reduce((sum, r) => sum + r.marks, 0) : 0,
    codingEarnedMarks: results.codingScore || 0,
    codingTotalMarks: results.codingResults ? results.codingResults.reduce((sum, r) => sum + r.marks, 0) : 0
  } : {
    correctCount: 0,
    wrongCount: 0,
    unattemptedCount: 0,
    actualScore: 0,
    totalQuestions: 0,
    totalMarks: 0,
    earnedMarks: 0,
    mcqCorrect: 0,
    codingCorrect: 0,
    mcqAttempted: 0,
    codingAttempted: 0,
    totalAttempted: 0,
    mcqEarnedMarks: 0,
    mcqTotalMarks: 0,
    codingEarnedMarks: 0,
    codingTotalMarks: 0
  };
  
  const safeExamData = examData || results?.examData || {
    title: 'Final Course Assessment',
    duration: 90,
    totalMarks: totalMarks
  };
  
  const safeSubmissionData = submissionData || {
    timeSpent: 0,
    securityViolations: [],
    autoSubmitted: false,
    proctoringData: { tabSwitchCount: 0 }
  };

  useEffect(() => {
    if (!location.state) {
      console.warn('No assessment results data found, redirecting to course page');
      navigate(`/course/${courseId}`);
    }
  }, [location.state, navigate, courseId]);

  if (!location.state) {
    return (
      <div className="knowledge-assessment-results">
        <div className="results-header">
          <h1>Loading Results...</h1>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#f44336';
  };

  const getPerformanceRemark = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Average';
    if (percentage >= 50) return 'Below Average';
    return 'Poor';
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="module-test-container">
      {!showReview && (
        <div className="test-container">
          <div className="test-header">
            <div className="header-content">
              <h1 className="test-title">Final Exam Results</h1>
              <p className="test-subtitle">Your performance summary and detailed analysis</p>
            </div>
          </div>

          <div className="results-display">
          {/* Main Score Display */}
          <div className="main-score-section">
            <div className="score-circle">
              <div 
                className="score-progress"
                style={{
                  background: `conic-gradient(${getScoreColor(enhancedResults.actualScore)} ${enhancedResults.actualScore * 3.6}deg, #e0e0e0 0deg)`
                }}
              >
                <div className="score-inner">
                  <span className="score-percentage">{enhancedResults.actualScore}%</span>
                  <span className="score-label">Overall Score</span>
                </div>
              </div>
            </div>

            <div className="marks-display">
              <div className="marks-item">
                <Target size={24} />
                <div className="marks-info">
                  <span className="marks-value">{enhancedResults.earnedMarks} / {enhancedResults.totalMarks}</span>
                  <span className="marks-label">Marks Earned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="question-breakdown">
            <h3><BarChart3 size={20} /> Question Analysis</h3>
            <div className="breakdown-grid">
              <div className="breakdown-card correct">
                <CheckCircle size={32} />
                <div className="breakdown-info">
                  <span className="breakdown-count">{enhancedResults.correctCount}</span>
                  <span className="breakdown-label">Correct Answers</span>
                </div>
              </div>
              <div className="breakdown-card wrong">
                <XCircle size={32} />
                <div className="breakdown-info">
                  <span className="breakdown-count">{enhancedResults.wrongCount}</span>
                  <span className="breakdown-label">Wrong Answers</span>
                </div>
              </div>
              <div className="breakdown-card unattempted">
                <Clock size={32} />
                <div className="breakdown-info">
                  <span className="breakdown-count">{enhancedResults.unattemptedCount}</span>
                  <span className="breakdown-label">Unattempted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Information */}
          <div className="assessment-info">
            <h3>Assessment Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Assessment:</strong> {safeExamData.title}
              </div>
              <div className="info-item">
                <strong>Total Questions:</strong> {enhancedResults.totalQuestions}
              </div>
              <div className="info-item">
                <strong>Questions Attempted:</strong> {enhancedResults.totalAttempted}
              </div>
              <div className="info-item">
                <strong>Total Marks:</strong> {enhancedResults.totalMarks}
              </div>
              <div className="info-item">
                <strong>Marks Earned:</strong> {enhancedResults.earnedMarks}
              </div>
              <div className="info-item">
                <strong>Time Spent:</strong> {formatTime(safeSubmissionData.timeSpent)}
              </div>
              <div className="info-item">
                <strong>Completed on:</strong> {new Date().toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Performance by Question Type */}
          <div className="performance-breakdown">
            <h3><TrendingUp size={20} /> Performance by Question Type</h3>
            <div className="performance-table">
              <div className="performance-header">
                <span>Question Type</span>
                <span>Attempted</span>
                <span>Correct</span>
                <span>Marks Earned</span>
                <span>Total Marks</span>
                <span>Accuracy</span>
                <span>Performance</span>
              </div>
              
              <div className="performance-row">
                <span className="question-type mcq">MCQ Questions</span>
                <span>{enhancedResults.mcqAttempted}</span>
                <span>{enhancedResults.mcqCorrect}</span>
                <span>{enhancedResults.mcqEarnedMarks}</span>
                <span>{enhancedResults.mcqTotalMarks}</span>
                <span>{enhancedResults.mcqAttempted > 0 ? Math.round((enhancedResults.mcqCorrect / enhancedResults.mcqAttempted) * 100) : 0}%</span>
                <span className={`performance-badge ${getPerformanceRemark(enhancedResults.mcqAttempted > 0 ? (enhancedResults.mcqCorrect / enhancedResults.mcqAttempted) * 100 : 0).toLowerCase().replace(' ', '-')}`}>
                  {getPerformanceRemark(enhancedResults.mcqAttempted > 0 ? (enhancedResults.mcqCorrect / enhancedResults.mcqAttempted) * 100 : 0)}
                </span>
              </div>

              <div className="performance-row">
                <span className="question-type coding">Coding Questions</span>
                <span>{enhancedResults.codingAttempted}</span>
                <span>{enhancedResults.codingCorrect}</span>
                <span>{enhancedResults.codingEarnedMarks}</span>
                <span>{enhancedResults.codingTotalMarks}</span>
                <span>{enhancedResults.codingAttempted > 0 ? Math.round((enhancedResults.codingCorrect / enhancedResults.codingAttempted) * 100) : 0}%</span>
                <span className={`performance-badge ${getPerformanceRemark(enhancedResults.codingAttempted > 0 ? (enhancedResults.codingCorrect / enhancedResults.codingAttempted) * 100 : 0).toLowerCase().replace(' ', '-')}`}>
                  {getPerformanceRemark(enhancedResults.codingAttempted > 0 ? (enhancedResults.codingCorrect / enhancedResults.codingAttempted) * 100 : 0)}
                </span>
              </div>

              <div className="performance-row total">
                <span className="question-type total"><strong>Overall Performance</strong></span>
                <span><strong>{enhancedResults.totalAttempted}</strong></span>
                <span><strong>{enhancedResults.correctCount}</strong></span>
                <span><strong>{enhancedResults.earnedMarks}</strong></span>
                <span><strong>{enhancedResults.totalMarks}</strong></span>
                <span><strong>{enhancedResults.actualScore}%</strong></span>
                <span className={`performance-badge ${getPerformanceRemark(enhancedResults.actualScore).toLowerCase().replace(' ', '-')}`}>
                  <strong>{getPerformanceRemark(enhancedResults.actualScore)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Security Report (if applicable) */}
          {safeSubmissionData.securityViolations?.length > 0 && (
            <div className="security-summary">
              <h3><Shield size={20} /> Security Report</h3>
              <div className="security-details">
                <div className="security-item">
                  <strong>Tab Switches:</strong> {safeSubmissionData.proctoringData?.tabSwitchCount || 0}
                </div>
                <div className="security-item">
                  <strong>Total Violations:</strong> {safeSubmissionData.securityViolations.length}
                </div>
                <div className="security-item">
                  <strong>Auto Submitted:</strong> {safeSubmissionData.autoSubmitted ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}

          {/* Neon Action Buttons - ModuleTestPage Style */}
          <div className="neon-actions">
            <button 
              className="neon-btn primary-neon"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              <div className="btn-glow"></div>
              <BookOpen size={20} />
              <span>RETURN TO COURSE</span>
            </button>
            <button 
              className="neon-btn secondary-neon"
              onClick={() => setShowReview(true)}
            >
              <div className="btn-glow"></div>
              <Eye size={20} />
              <span>REVIEW ASSESSMENT</span>
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Review Assessment Component - ModuleTestPage Style */}
      {showReview && (
        <div className="test-container">
          <div className="test-header">
            <div className="header-content">
              <h1 className="test-title">Final Exam Review</h1>
              <p className="test-subtitle">Review your answers and correct solutions</p>
            </div>
            <button 
              className="close-review-btn"
              onClick={() => setShowReview(false)}
            >
              <XCircle size={20} />
              Close Review
            </button>
          </div>

          <div className="review-content">
            {/* MCQ Questions Review */}
            {finalExam?.mcqs?.map((mcq, index) => (
              <div key={`mcq-review-${index}`} className="review-question-card">
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  <span className={`question-result ${results?.mcqResults?.[index]?.isCorrect ? 'correct' : 'incorrect'}`}>
                    {results?.mcqResults?.[index]?.isCorrect ? (
                      <>
                        <CheckCircle size={16} />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Incorrect
                      </>
                    )}
                  </span>
                </div>
                
                <div className="question-content">
                  <h3 className="question-text">{mcq.question}</h3>
                  
                  <div className="options-review">
                    {mcq.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className={`option-review ${
                          optionIndex === mcq.correct ? 'correct-answer' : ''
                        } ${
                          results?.mcqResults?.[index]?.userAnswer === optionIndex ? 'user-answer' : ''
                        } ${
                          results?.mcqResults?.[index]?.userAnswer === optionIndex && optionIndex !== mcq.correct ? 'wrong-answer' : ''
                        }`}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                        <span className="option-text">{option}</span>
                        {optionIndex === mcq.correct && <CheckCircle size={16} className="correct-icon" />}
                        {results?.mcqResults?.[index]?.userAnswer === optionIndex && optionIndex !== mcq.correct && <XCircle size={16} className="wrong-icon" />}
                      </div>
                    ))}
                  </div>
                  
                  {mcq.explanation && (
                    <div className="explanation-box">
                      <h4>Explanation:</h4>
                      <p>{mcq.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Coding Questions Review */}
            {finalExam?.codeChallenges?.map((challenge, index) => (
              <div key={`coding-review-${index}`} className="review-question-card coding-review">
                <div className="question-header">
                  <span className="question-number">Coding Challenge {index + 1}</span>
                  <span className={`question-result ${results?.codingResults?.[index]?.verdict === 'Accepted' ? 'correct' : 'incorrect'}`}>
                    {results?.codingResults?.[index]?.verdict === 'Accepted' ? (
                      <>
                        <CheckCircle size={16} />
                        Accepted
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        {results?.codingResults?.[index]?.verdict || 'Wrong Answer'}
                      </>
                    )}
                  </span>
                </div>
                
                <div className="question-content">
                  <h3 className="question-text">{challenge.title}</h3>
                  <p className="challenge-description">{challenge.description}</p>
                  
                  {challenge.sampleInput && (
                    <div className="sample-data">
                      <h4>Sample Input:</h4>
                      <pre className="sample-text">{challenge.sampleInput}</pre>
                    </div>
                  )}
                  
                  {challenge.sampleOutput && (
                    <div className="sample-data">
                      <h4>Sample Output:</h4>
                      <pre className="sample-text">{challenge.sampleOutput}</pre>
                    </div>
                  )}
                  
                  {results?.codingResults?.[index]?.output && (
                    <div className="execution-output">
                      <h4>Output:</h4>
                      <pre className="output-text">{results.codingResults[index].output}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeAssessmentResults;
