import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  CheckCircle, 
  Lock,
  Award,
  Target,
  Code,
  FileText,
  ChevronRight,
  Zap,
  Trophy,
  TrendingUp,
  Shield,
  Brain,
  Timer,
  AlertTriangle
} from "lucide-react";
import LeaderboardSection from "../components/LeaderboardSection";
import { shouldShowNavbar } from "../utils/navbarUtils";
import "./ModernCourseDetail.css";

// About Section Component
const AboutSection = ({ courseId, token }) => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/about`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAboutData(response.data);
        setError("");
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError("Failed to load about content");
        setAboutData(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && token) {
      fetchAboutData();
    }
  }, [courseId, token]);

  if (loading) {
    return (
      <div className="about-section">
        <div className="about-card">
          <div className="about-loading">
            <div className="modern-spinner"></div>
            <p>Loading about content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="about-section">
        <div className="about-card">
          <div className="about-loading">
            <p>No data found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="about-section">
      <div className="about-card">
        <div className="about-header">
          <h2 className="about-title">{aboutData.title}</h2>
        </div>
        <div className="about-content" dangerouslySetInnerHTML={{ __html: aboutData.content }} />
      </div>
    </div>
  );
};

const ModernCourseDetail = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFetchingProgress, setIsFetchingProgress] = useState(false);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  
  // Check if navbar should be shown and apply appropriate spacing
  const showNavbar = shouldShowNavbar(location.pathname);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseResponse = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(courseResponse.data);
        
        const enrolledResponse = await axios.get(`http://localhost:5000/api/courses/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const enrolled = (enrolledResponse.data?.courses || []).some(c => c._id === courseId || c.id === courseId);
        setIsEnrolled(enrolled);
        
        if (enrolled && userId) {
          await fetchProgressData();
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, token, userId]);

  // Listen for storage events to refresh progress when returning from lessons/tests
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'lessonCompleted' || e.key === 'testCompleted') {
        fetchProgressData();
        localStorage.removeItem(e.key); // Clean up the trigger
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus (when user returns to this tab)
    const handleFocus = () => {
      fetchProgressData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [courseId, userId, token]);

  const fetchProgressData = async () => {
    if (isFetchingProgress) {
      console.log('Progress fetch already in progress, skipping...');
      return;
    }
    
    try {
      setIsFetchingProgress(true);
      console.log('Fetching progress data for userId:', userId, 'courseId:', courseId);
      
      // First fetch basic progress
      const progressResponse = await axios.get(`http://localhost:5000/api/progress?userId=${userId}&courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const basicProgress = progressResponse.data || {};
      console.log('Basic progress fetched successfully');
      
      // Try to fetch leaderboard stats, but don't let it fail the whole operation
      let leaderboardStats = {};
      try {
        const leaderboardStatsResponse = await axios.get(`http://localhost:5000/api/course-leaderboard/${courseId}/user/${userId}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        leaderboardStats = leaderboardStatsResponse.data || {};
        console.log('Leaderboard stats fetched successfully');
      } catch (leaderboardError) {
        console.warn('Failed to fetch leaderboard stats (this is expected for new users):', leaderboardError.response?.status, leaderboardError.response?.data?.message);
        // Initialize default leaderboard stats for new users
        leaderboardStats = {
          overallScore: 0,
          breakdown: {
            lessonScore: 0,
            moduleTestScore: 0,
            finalExamScore: 0
          },
          progress: {
            lessonsCompleted: 0,
            moduleTestsCompleted: 0,
            finalExamCompleted: false
          },
          rank: null,
          percentile: 0
        };
      }
      
      // Merge progress data with leaderboard stats for comprehensive tracking
      const enhancedProgress = {
        ...basicProgress,
        leaderboardStats,
        lessonsCompleted: leaderboardStats.progress?.lessonsCompleted || 0,
        moduleTestsCompleted: leaderboardStats.progress?.moduleTestsCompleted || 0,
        finalExamCompleted: leaderboardStats.progress?.finalExamCompleted || false,
        overallScore: leaderboardStats.overallScore || 0,
        breakdown: leaderboardStats.breakdown || {}
      };
      
      setProgress(enhancedProgress);
      console.log('Progress data merged successfully');
    } catch (error) {
      console.error('Error fetching basic progress:', error);
      // Set empty progress as fallback
      setProgress({
        leaderboardStats: {
          overallScore: 0,
          breakdown: { lessonScore: 0, moduleTestScore: 0, finalExamScore: 0 },
          progress: { lessonsCompleted: 0, moduleTestsCompleted: 0, finalExamCompleted: false }
        },
        lessonsCompleted: 0,
        moduleTestsCompleted: 0,
        finalExamCompleted: false,
        overallScore: 0,
        breakdown: {}
      });
    } finally {
      setIsFetchingProgress(false);
    }
  };

  const reloadProgress = async () => {
    await fetchProgressData();
  };

  const startLesson = async (topic, lesson) => {
    try {
      await axios.post(`http://localhost:5000/api/progress/lesson`, {
        userId,
        courseId: courseId,
        topicId: topic?._id,
        lessonId: lesson?._id,
        completed: false,
        timeSpent: 0,
        score: 0,
        topicTitle: topic?.title || 'Unknown Topic'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await reloadProgress();
      navigate(`/courses/${courseId}/topic/${topic?._id}/lesson/${lesson?._id}`);
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const handleEnroll = async () => {
    try {
      await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const startTopic = (topicIndex) => {
    const topic = (course.topics || [])[topicIndex];
    if (!topic) return;
    const firstLesson = (topic.lessons || [])[0];
    if (firstLesson) {
      startLesson(topic, firstLesson);
    }
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="loading-container">
          <div className="modern-spinner"></div>
          <p className="loading-text">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Course not found</h2>
          <button onClick={() => navigate('/courses')} className="modern-back-btn">
            <ArrowLeft size={20} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Calculate accurate progress based on actual course structure
  const calculateCourseProgress = () => {
    if (!course?.topics || !progress) return { percent: 0, completed: 0, total: 0, details: {} };
    
    const topicsProgress = progress.topicsProgress || [];
    const leaderboardStats = progress.leaderboardStats || {};
    
    // Calculate total course components
    let totalLessons = 0;
    let totalModuleTests = 0;
    let totalFinalExams = course.finalExam ? 1 : 0;
    
    // Calculate completed components
    let completedLessons = 0;
    let completedModuleTests = 0;
    let completedFinalExams = 0;
    let completedTopics = 0;
    
    course.topics.forEach(topic => {
      const topicProgress = topicsProgress.find(tp => 
        (tp.topicId?.toString() || tp.topicId) === (topic._id?.toString() || topic._id)
      );
      
      // Count lessons
      const lessonsInTopic = topic.lessons?.length || 0;
      totalLessons += lessonsInTopic;
      
      if (topicProgress?.lessons) {
        const completedLessonsInTopic = topicProgress.lessons.filter(l => l.completed).length;
        completedLessons += completedLessonsInTopic;
      }
      
      // Count module tests
      if (topic.moduleTest) {
        totalModuleTests++;
        if (topicProgress?.moduleTest?.completed) {
          completedModuleTests++;
        }
      }
      
      // Check if entire topic is completed
      const allLessonsCompleted = lessonsInTopic === 0 || 
        (topicProgress?.lessons?.filter(l => l.completed).length === lessonsInTopic);
      const moduleTestCompleted = !topic.moduleTest || topicProgress?.moduleTest?.completed;
      
      if (allLessonsCompleted && moduleTestCompleted) {
        completedTopics++;
      }
    });
    
    // Check final exam completion from both progress and leaderboard stats
    if (progress.finalExamCompleted || leaderboardStats.progress?.finalExamCompleted) {
      completedFinalExams = 1;
    }
    
    // Calculate total components and completed components
    const totalComponents = totalLessons + totalModuleTests + totalFinalExams;
    const completedComponents = completedLessons + completedModuleTests + completedFinalExams;
    
    // Calculate accurate percentage
    const percent = totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0;
    
    return { 
      percent, 
      completed: completedTopics, 
      total: course.topics.length,
      details: {
        lessonsCompleted: completedLessons,
        totalLessons,
        moduleTestsCompleted: completedModuleTests,
        totalModuleTests,
        finalExamCompleted: completedFinalExams > 0,
        totalFinalExams,
        overallScore: leaderboardStats.overallScore || 0,
        breakdown: leaderboardStats.breakdown || {},
        totalComponents,
        completedComponents
      }
    };
  };
  
  const { percent: progressPercent, completed: completedTopics, total: totalTopics, details: progressDetails } = calculateCourseProgress();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDifficultyDisplay = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'Beginner';
      case 'medium': return 'Intermediate';
      case 'hard': return 'Advanced';
      default: return difficulty;
    }
  };

  return (
    <div className={`modern-course-container ${showNavbar ? 'with-navbar' : ''}`}>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background"></div>
                 <div className="hero-content">
           <div className="hero-header">
                        <button onClick={() => navigate('/courses')} className="modern-back-btn">
             <ArrowLeft size={24} />
           </button>
             
             <div className="badge-container">
               <span 
                 className={`difficulty-pill ${course.difficulty.toLowerCase()}`}
                 style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
               >
                 {getDifficultyDisplay(course.difficulty)}
               </span>
             </div>
           </div>
           
           <div className="course-hero">
             <div className="course-info">
              
              <h1 className="hero-title">{course.title}</h1>
              <p className="hero-description">{course.description}</p>
              
              <div className="stats-row">
                <div className="stat">
                  <Clock size={18} />
                  <span>{course.duration || '2-3 hours'}</span>
                </div>
                <div className="stat">
                  <Users size={18} />
                  <span>{course.enrolledCount || 0} students</span>
                </div>
                <div className="stat">
                  <BookOpen size={18} />
                  <span>{totalTopics} modules</span>
                </div>
                <div className="stat">
                  <Star size={18} fill="#fbbf24" color="#fbbf24" />
                  <span>4.8 rating</span>
                </div>
              </div>
              
              {isEnrolled && (
                <div className="progress-card">
                  <div className="progress-info">
                    <span className="progress-label">PROGRESS</span>
                    <span className="progress-value">{progressPercent}%</span>
                  </div>
                  <div className="modern-progress-bar">
                    <div 
                      className="modern-progress-fill" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="progress-summary">
                    <span className="summary-text">
                      Total Progress: {progressDetails.completedComponents}/{progressDetails.totalComponents} components
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="action-panel">
              {!isEnrolled ? (
                <div className="enroll-card">
                  <div className="price-display">
                    <span className="price-label">Price</span>
                    <span className="price-value">Free</span>
                  </div>
                  <button onClick={handleEnroll} className="modern-enroll-btn">
                    <Play size={20} />
                    Enroll Now
                  </button>
                  <div className="features-list">
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Lifetime access</span>
                    </div>
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Certificate included</span>
                    </div>
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Interactive coding</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="enrolled-card">
                  <div className="enrolled-header">
                    <CheckCircle size={24} color="#10b981" />
                    <div>
                      <h3>Enrolled</h3>
                      <p>Continue your learning journey</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (progressPercent > 0) {
                        const firstIncompleteTopicIndex = (course.topics || []).findIndex((topic) => {
                          const tProg = ((progress?.topicsProgress || [])).find(tp => 
                            (tp.topicId?.toString?.() || tp.topicId) === (topic._id?.toString?.() || topic._id)
                          );
                          return !tProg?.completed;
                        });
                        
                        if (firstIncompleteTopicIndex !== -1) {
                          const topic = course.topics[firstIncompleteTopicIndex];
                          const firstLesson = (topic.lessons || [])[0];
                          if (firstLesson) {
                            startLesson(topic, firstLesson);
                          }
                        } else {
                          startTopic(0);
                        }
                      } else {
                        startTopic(0);
                      }
                    }} 
                    className="modern-continue-btn"
                  >
                    <Play size={20} />
                    {progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

             {/* Modern Navigation */}
       <div className="modern-nav">
         <div className="nav-container">
           <div className="nav-tabs">
             {isEnrolled && (
               <button 
                 className={`modern-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                 onClick={() => setActiveTab('leaderboard')}
               >
                 <Trophy size={18} />
                 <span>Leaderboard</span>
               </button>
             )}
             <button 
               className={`modern-tab ${activeTab === 'curriculum' ? 'active' : ''}`}
               onClick={() => setActiveTab('curriculum')}
             >
               <BookOpen size={18} />
               <span>Curriculum</span>
             </button>
             <button 
               className={`modern-tab ${activeTab === 'overview' ? 'active' : ''}`}
               onClick={() => setActiveTab('overview')}
             >
               <FileText size={18} />
               <span>About</span>
             </button>
           </div>
         </div>
       </div>

      {/* Content Area */}
      <div className="modern-content">
        {activeTab === 'curriculum' && (
          <div className="curriculum-section">
            <div className="curriculum-header">
              <div className="header-content">
                <h3 className="section-title">Course Curriculum</h3>
                <p className="curriculum-subtitle">{totalTopics} modules • {course.duration || '2-3 hours'} total</p>
              </div>
            </div>
            
            <div className="modules-grid">
              {(course.topics || []).map((topic, topicIndex) => {
                const tProg = ((progress?.topicsProgress || [])).find(tp => (tp.topicId?.toString?.() || tp.topicId) === (topic._id?.toString?.() || topic._id));
                
                // Enhanced topic completion calculation including knowledge assessments
                const hasModuleTest = topic.moduleTest;
                const moduleTestCompleted = tProg?.moduleTestCompleted || false;
                const lessonsInTopic = topic.lessons?.length || 0;
                const completedLessonsInTopic = tProg?.lessons?.filter(l => l.completed).length || 0;
                
                // Topic is fully completed if lessons + module test (if exists) are done
                const topicFullyCompleted = (
                  (lessonsInTopic === 0 || completedLessonsInTopic === lessonsInTopic) &&
                  (!hasModuleTest || moduleTestCompleted)
                );
                const isTopicCompleted = tProg?.completed || topicFullyCompleted;
                
                // Calculate detailed completion percentage including knowledge assessments
                let topicCompletionPercentage = 0;
                if (lessonsInTopic > 0 || hasModuleTest) {
                  const lessonWeight = hasModuleTest ? 0.7 : 1.0;
                  const testWeight = hasModuleTest ? 0.3 : 0;
                  
                  const lessonPercent = lessonsInTopic > 0 ? (completedLessonsInTopic / lessonsInTopic) * 100 : 0;
                  const testPercent = moduleTestCompleted ? 100 : 0;
                  
                  topicCompletionPercentage = Math.round((lessonPercent * lessonWeight) + (testPercent * testWeight));
                }
                const isLocked = !isEnrolled;
                
                return (
                  <div key={topicIndex} className={`modern-module ${isTopicCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                    <div className="module-card">
                      <div className="module-header">
                        <div className="module-number">
                          {isLocked ? (
                            <Lock size={18} />
                          ) : isTopicCompleted ? (
                            <CheckCircle size={18} color="#10b981" />
                          ) : (
                            <span className="number">{topicIndex + 1}</span>
                          )}
                        </div>
                        
                        <div className="module-content">
                          <div className="module-title-row">
                            <h4 className="module-title">{topic.title}</h4>
                            {!isLocked && (
                              <button 
                                onClick={() => startTopic(topicIndex)} 
                                className="review-btn"
                              >
                                {isTopicCompleted ? 'Review' : topicCompletionPercentage > 0 ? 'Continue' : 'Start'}
                                <ChevronRight size={14} />
                              </button>
                            )}
                          </div>
                          <p className="module-description">{topic.description}</p>
                          
                          {topicCompletionPercentage > 0 && (
                            <div className="completion-badge">
                              {topicCompletionPercentage === 100 ? '100% Solved' : `${topicCompletionPercentage}% Complete`}
                            </div>
                          )}
                          
                          {/* Lesson and Test Items */}
                          <div className="module-items">
                            {(topic.lessons || []).map((lesson, lIndex) => {
                              const isLessonCompleted = !!(tProg?.lessons || []).find(l => (l.lessonId?.toString?.() || l.lessonId) === (lesson._id?.toString?.() || lesson._id))?.completed;
                              return (
                                <div 
                                  key={`lesson-${lIndex}`} 
                                  className={`module-item ${isLessonCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                                  onClick={() => !isLocked && startLesson(topic, lesson)}
                                >
                                  <div className="item-status">
                                    {isLocked ? (
                                      <Lock size={16} />
                                    ) : (
                                      <div className={`completion-circle ${isLessonCompleted ? 'completed' : ''}`}></div>
                                    )}
                                  </div>
                                  <div className="item-content">
                                    <span className="item-title">{lesson.title}</span>
                                    <span className="item-type">Lesson</span>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Module Test */}
                            {topic.moduleTest && (topic.moduleTest.mcqs?.length > 0 || topic.moduleTest.codeChallenges?.length > 0) && (
                              <div 
                                className={`module-item test-item ${moduleTestCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                                onClick={() => !isLocked && navigate(`/courses/${courseId}/topic/${topic._id}/test`)}
                              >
                                <div className="item-status">
                                  {isLocked ? (
                                    <Lock size={16} />
                                  ) : moduleTestCompleted ? (
                                    <CheckCircle size={16} color="#22c55e" />
                                  ) : (
                                    <div className="item-icon test">
                                      <Award size={16} />
                                    </div>
                                  )}
                                </div>
                                <div className="item-content">
                                  <span className="item-title">Knowledge Assessment: {topic.title}</span>
                                  <span className="item-type">Assessment</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Final Exam Section */}
            {course.finalExam && course.finalExam.isActive && (
              <div className="final-exam-section">
                <div className="final-exam-header">
                  <div className="exam-icon">
                    <Shield size={32} />
                  </div>
                  <div className="exam-info">
                    <h3 className="exam-title">{course.finalExam.title}</h3>
                    <p className="exam-description">{course.finalExam.description}</p>
                  </div>
                </div>
                
                <div className="exam-stats">
                  <div className="exam-stat">
                    <Brain size={20} />
                    <span>{course.finalExam.mcqs?.length || 0} MCQs + {course.finalExam.codeChallenges?.length || 0} Coding</span>
                  </div>
                  <div className="exam-stat">
                    <Timer size={20} />
                    <span>{course.finalExam.duration} minutes</span>
                  </div>
                  <div className="exam-stat">
                    <Trophy size={20} />
                    <span>{course.finalExam.totalMarks} marks</span>
                  </div>
                  <div className="exam-stat">
                    <Target size={20} />
                    <span>{course.finalExam.passingScore}% to pass</span>
                  </div>
                </div>
                
                {course.finalExam.securitySettings?.isSecure && (
                  <div className="security-notice">
                    <AlertTriangle size={16} />
                    <span>Secure Assessment - Full screen required, copy-paste disabled</span>
                  </div>
                )}
                
                <div className="exam-actions">
                  {!isEnrolled ? (
                    <button className="exam-btn locked" disabled>
                      <Lock size={18} />
                      Enroll to Access Final Exam
                    </button>
                  ) : (
                    <button 
                      className="exam-btn available"
                      onClick={() => navigate(`/courses/${courseId}/final-exam`)}
                    >
                      <Shield size={18} />
                      Take Final Exam
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'overview' && (
          <AboutSection courseId={courseId} token={token} />
        )}
        
        {activeTab === 'leaderboard' && isEnrolled && (
          <LeaderboardSection courseId={courseId} userId={userId} token={token} />
        )}
      </div>
    </div>
  );
};

export default ModernCourseDetail;