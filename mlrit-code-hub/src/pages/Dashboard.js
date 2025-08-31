import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/courses/enrolled', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolledCourses(response.data);
    } catch (err) {
      setError('Failed to load enrolled courses');
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (course) => {
    if (!course.completedModules) return 0;
    return Math.round((course.completedModules / course.totalModules) * 100);
  };

  const isTestUnlocked = (course) => {
    const progress = calculateProgress(course);
    return progress >= course.testUnlockThreshold;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(difficulty)}`}>
        {difficulty}
      </span>
    );
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleTakeTest = (courseId) => {
    navigate(`/courses/${courseId}/test`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <button 
              onClick={fetchEnrolledCourses}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Dashboard</h1>
          <p className="text-gray-600">
            Track your progress and continue your learning journey
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{enrolledCourses.length}</div>
            <div className="text-sm text-gray-600">Enrolled Courses</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {enrolledCourses.filter(course => calculateProgress(course) === 100).length}
            </div>
            <div className="text-sm text-gray-600">Completed Courses</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {enrolledCourses.filter(course => calculateProgress(course) > 0 && calculateProgress(course) < 100).length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {enrolledCourses.filter(course => isTestUnlocked(course)).length}
            </div>
            <div className="text-sm text-gray-600">Tests Available</div>
          </div>
        </div>

        {/* Courses Grid */}
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No courses enrolled yet</div>
            <button 
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const progress = calculateProgress(course);
              const testUnlocked = isTestUnlocked(course);
              
              return (
                <div key={course._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  {/* Course Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      {getDifficultyBadge(course.difficulty)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    
                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {course.completedModules || 0} of {course.totalModules} modules completed
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {/* Continue Button */}
                      {progress < 100 && (
                        <button
                          onClick={() => handleContinueCourse(course._id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Continue Learning
                        </button>
                      )}

                      {/* Take Test Button */}
                      {testUnlocked && progress < 100 && (
                        <button
                          onClick={() => handleTakeTest(course._id)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Take Test
                        </button>
                      )}

                      {/* View Course Button */}
                      <button
                        onClick={() => handleViewCourse(course._id)}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Course
                      </button>

                      {/* Test Locked Message */}
                      {!testUnlocked && progress < 100 && (
                        <div className="text-xs text-gray-500 text-center">
                          Complete {course.testUnlockThreshold}% to unlock test
                        </div>
                      )}

                      {/* Completed Message */}
                      {progress === 100 && (
                        <div className="text-center">
                          <div className="text-green-600 text-sm font-medium mb-2">
                            ✓ Course Completed
                          </div>
                          {course.testUnlockThreshold <= 100 && (
                            <button
                              onClick={() => handleTakeTest(course._id)}
                              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Take Final Test
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 