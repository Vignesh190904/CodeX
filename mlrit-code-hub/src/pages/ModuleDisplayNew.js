import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Bell,
  User,
  CheckCircle,
  Star,
  Trophy,
  Target,
  BookOpen,
  Code,
  Play,
  Lock,
  Circle,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import './ModuleDisplayNew.css';

const ModuleDisplayNew = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await axios.get(
          `http://localhost:5000/api/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(courseResponse.data);
        
        // Fetch user progress
        if (userId) {
          const progressResponse = await axios.get(
            `http://localhost:5000/api/progress?userId=${userId}&courseId=${courseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProgress(progressResponse.data || {});
        }
        
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId && token) {
      fetchCourseAndProgress();
    }
  }, [courseId, token, userId]);

  // Helper functions for topic progress and status
  const getTopicProgress = (topicIndex) => {
    if (!progress?.topicsProgress) return { completed: 0, total: 0, percentage: 0 };
    
    const topicProgress = progress.topicsProgress.find(tp => tp.topicId === course?.topics?.[topicIndex]?._id);
    if (!topicProgress) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = topicProgress.lessons?.filter(l => l.completed).length || 0;
    const total = course?.topics?.[topicIndex]?.lessons?.length || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const getTopicStatus = (topicIndex) => {
    const topicProgress = getTopicProgress(topicIndex);
    if (topicProgress.percentage === 100) return 'completed';
    if (topicProgress.percentage > 0) return 'current';
    return 'locked';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lesson': return <BookOpen className="topic-icon" />;
      case 'coding': return <Code className="topic-icon" />;
      case 'quiz': return <Target className="topic-icon" />;
      case 'test': return <Award className="topic-icon" />;
      case 'reading': return <BookOpen className="topic-icon" />;
      case 'video': return <Play className="topic-icon" />;
      default: return <BookOpen className="topic-icon" />;
    }
  };

  const handleTopicClick = (topicIndex) => {
    const status = getTopicStatus(topicIndex);
    if (status !== 'locked') {
      // Find first incomplete lesson or start from beginning
      const topicProgress = progress?.topicsProgress?.find(tp => tp.topicId === course?.topics?.[topicIndex]?._id);
      let targetLessonIndex = 0;
      
      if (topicProgress && course.topics[topicIndex]) {
        const firstIncomplete = course.topics[topicIndex].lessons.findIndex((lesson, index) => {
          const lessonProgress = topicProgress.lessons?.find(l => l.lessonId === lesson._id);
          return !lessonProgress?.completed;
        });
        targetLessonIndex = firstIncomplete !== -1 ? firstIncomplete : 0;
      }
      
      const topic = course.topics[topicIndex];
      const lesson = topic.lessons[targetLessonIndex];
      if (topic && lesson) {
        navigate(`/courses/${courseId}/topic/${topic._id}/lesson/${lesson._id}`);
      }
    }
  };

  const getOverallStats = () => {
    if (!course?.topics) return { completed: 0, total: 0, points: 0, progress: 0 };
    
    let totalTopics = course.topics.length;
    let completedTopics = 0;
    let totalPoints = 0;
    
    course.topics.forEach((topic, index) => {
      const topicProgress = getTopicProgress(index);
      if (topicProgress.percentage === 100) {
        completedTopics++;
        totalPoints += 100; // Base points per completed topic
      }
    });
    
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    
    return {
      completed: completedTopics,
      total: totalTopics,
      points: totalPoints,
      progress: overallProgress
    };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="module-display-container">
        <div className="module-header">
          <div className="module-header-content">
            <div className="loading-shimmer" style={{width: '300px', height: '40px', borderRadius: '8px'}}></div>
            <div className="loading-shimmer" style={{width: '200px', height: '32px', borderRadius: '20px'}}></div>
          </div>
        </div>
        <div className="main-content">
          <div className="stats-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="stat-card loading-shimmer" style={{height: '120px'}}></div>
            ))}
          </div>
          <div className="modules-section">
            <div className="loading-shimmer" style={{width: '200px', height: '30px', borderRadius: '8px', marginBottom: '2rem'}}></div>
            {[1,2,3].map(i => (
              <div key={i} className="module-card loading-shimmer" style={{height: '200px', marginBottom: '2rem'}}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="module-display-container">
      {/* Header */}
      <div className="module-header fade-in">
        <div className="module-header-content">
          <div className="flex items-center space-x-4">
            <h1 className="module-title">{course?.title || 'Python Programming'}</h1>
          </div>
          <div className="module-header-actions">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Bell className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            <div className="user-avatar">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content slide-up">
        {/* Stats Section */}
        <div className="stats-grid fade-in">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Completed</h3>
                <p className="stat-completed">{stats.completed}/{stats.total}</p>
              </div>
              <CheckCircle className="stat-icon stat-completed" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Points Earned</h3>
                <p className="stat-points">{stats.points}</p>
              </div>
              <Star className="stat-icon stat-points" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Progress</h3>
                <p className="stat-progress">{stats.progress}%</p>
              </div>
              <Trophy className="stat-icon stat-progress" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Rank</h3>
                <p className="stat-rank">Beginner</p>
              </div>
              <Target className="stat-icon stat-rank" />
            </div>
          </div>
        </div>

        {/* Topics Section */}
        <div className="modules-section">
          <h2 className="modules-title">Course Topics</h2>
          <div className="modules-grid">
            {course?.topics
              ?.filter(topic => 
                topic.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              ?.map((topic, topicIndex) => {
                const topicProgress = getTopicProgress(topicIndex);
                const topicStatus = getTopicStatus(topicIndex);
                
                return (
                  <div
                    key={topic._id || topicIndex}
                    className="module-card"
                    onClick={() => handleTopicClick(topicIndex)}
                  >
                    {/* Topic Header */}
                    <div className="module-header-section">
                      <div className="module-number">
                        {topicIndex + 1}
                      </div>
                      <div className="module-info">
                        <h3 className="module-name">{topic.title}</h3>
                        <p className="module-description">
                          {topic.description || 'Learn the fundamentals and practice with hands-on exercises.'}
                        </p>
                        {topicProgress.percentage === 100 && (
                          <div className="status-badge status-completed">
                            100% Solved
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lessons List */}
                    <div className="module-topics">
                      <div className="topics-list">
                        {topic.lessons?.map((lesson, lessonIndex) => {
                          const topicProgressData = progress?.topicsProgress?.find(tp => tp.topicId === topic._id);
                          const lessonProgress = topicProgressData?.lessons?.find(l => l.lessonId === lesson._id);
                          const isCompleted = lessonProgress?.completed || false;
                          
                          // Find first incomplete lesson in this topic
                          const firstIncompleteIndex = topic.lessons?.findIndex((_, idx) => {
                            const lProg = topicProgressData?.lessons?.find(l => l.lessonId === topic.lessons[idx]._id);
                            return !lProg?.completed;
                          });
                          
                          const isCurrent = !isCompleted && lessonIndex === firstIncompleteIndex;
                          const isLocked = !isCompleted && !isCurrent;
                          
                          return (
                            <div 
                              key={lesson._id || lessonIndex}
                              className="topic-item"
                              onClick={() => {
                                if (!isLocked) {
                                  navigate(`/courses/${courseId}/topic/${topic._id}/lesson/${lesson._id}`);
                                }
                              }}
                            >
                              <div className={`topic-status-icon ${
                                isCompleted ? 'completed' : 
                                isCurrent ? 'current' : 'locked'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : isCurrent ? (
                                  <Play className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </div>
                              
                              <div className="topic-content">
                                <h4 className={`topic-title ${
                                  isCompleted ? 'completed' : 
                                  isLocked ? 'locked' : ''
                                }`}>
                                  {lesson.title}
                                </h4>
                                
                                <div className="topic-badge lesson">
                                  Lesson
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Topic Progress */}
                    {topicProgress.total > 0 && (
                      <div className="module-progress">
                        <div className="progress-header">
                          <span className="progress-label">Progress</span>
                          <span className="progress-percentage">{topicProgress.percentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${topicProgress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Module Test if available */}
                    {topic.moduleTest && (
                      <div 
                        className="topic-item"
                        onClick={() => navigate(`/courses/${courseId}/topic/${topic._id}/test`)}
                      >
                        <div className="topic-status-icon test">
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="topic-content">
                          <h4 className="topic-title">Module Test: {topic.title}</h4>
                          <div className="topic-badge test">
                            Test
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDisplayNew;
