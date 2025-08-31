import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import UserContext from "../context/UserContext";
import "./CourseLeaderboard.css";

const CourseLeaderboard = () => {
  const { courseId } = useParams();
  const [data, setData] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchCourseLeaderboard = async () => {
      try {
        setLoading(true);
        
                 // Fetch course leaderboard data
         const leaderboardRes = await axios.get(
           `http://localhost:5000/api/course-leaderboard/${courseId}`,
           {
             headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
           }
         );
         
         // Fetch course info
         const courseRes = await axios.get(
           `http://localhost:5000/api/courses/${courseId}`,
           {
             headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
           }
         );
        
        setData(leaderboardRes.data.leaderboard || []);
        setCourseInfo(courseRes.data);
        setError("");
      } catch (err) {
        console.error("Course Leaderboard Error", err);
        setError("Failed to load course leaderboard data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseLeaderboard();
    }
  }, [courseId]);

  const filteredData = Array.isArray(data) ? data.filter((userData) => {
    const matchesSearch = userData.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  if (loading) {
    return (
      <div className="course-leaderboard-container">
        <div className="loading-spinner">Loading course leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="course-leaderboard-container">
      <div className="course-leaderboard-header">
        <h1 className="page-title">📚 Course Leaderboard</h1>
        {courseInfo && (
          <div className="course-info">
            <h2 className="course-title">{courseInfo.title}</h2>
            <p className="course-description">{courseInfo.description}</p>
          </div>
        )}
        <p className="leaderboard-subtitle">Based on Course Assessment Performance</p>
        {user && user.college && (
          <div className="college-info">
            College: <span className="college-name">{user.college}</span>
          </div>
        )}
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="table-wrapper">
        <table className="course-leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Overall Score</th>
              <th>Lessons</th>
              <th>Module Tests</th>
              <th>Final Exam</th>
              <th>Progress</th>
              <th>Percentile</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((userData) => (
                                 <tr 
                   key={userData.userId} 
                   className={`rank-row ${userData.rank <= 3 ? `top-${userData.rank}` : ''}`}
                 >
                  <td className="rank-cell">
                    {userData.rank <= 3 && (
                      <span className="rank-medal">
                        {userData.rank === 1 ? '🥇' : userData.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <span className="rank-number">#{userData.rank}</span>
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      <span className="user-name">{userData.name}</span>
                      <span className="user-email">{userData.email}</span>
                    </div>
                  </td>
                  <td className="roll-number">{userData.rollNumber}</td>
                  <td className="department">
                    <span className="department-badge">{userData.department}</span>
                  </td>
                  <td className="overall-score">
                    <span className="score-value">{userData.overallScore}</span>
                  </td>
                  <td className="lesson-score">
                    <div className="score-breakdown">
                      <span className="score">{userData.totalLessonScore}</span>
                      <span className="completed">({userData.lessonsCompleted} completed)</span>
                    </div>
                  </td>
                  <td className="module-test-score">
                    <div className="score-breakdown">
                      <span className="score">{userData.totalModuleTestScore}</span>
                      <span className="completed">({userData.moduleTestsCompleted} completed)</span>
                    </div>
                  </td>
                  <td className="final-exam-score">
                    <div className="score-breakdown">
                      <span className="score">{userData.totalFinalExamScore}</span>
                                             <span className={`status ${userData.finalExamCompleted ? 'completed' : 'pending'}`}>
                         {userData.finalExamCompleted ? '✓ Done' : '⏳ Pending'}
                       </span>
                     </div>
                   </td>
                   <td className="progress">
                     <div className="progress-bar">
                       <div 
                         className="progress-fill" 
                         style={{ width: `${userData.averageScore || 0}%` }}
                       ></div>
                    </div>
                    <span className="progress-text">{Math.round(userData.averageScore || 0)}%</span>
                  </td>
                  <td className="percentile">
                    <span className="percentile-value">{userData.percentile}%</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="no-data">
                  {searchQuery ? "No users found matching your search" : "No course leaderboard data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="course-leaderboard-footer">
        <div className="score-legend">
          <h3>Score Breakdown:</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color lesson"></span>
              <span>Lesson Scores</span>
            </div>
            <div className="legend-item">
              <span className="legend-color module-test"></span>
              <span>Module Test Scores</span>
            </div>
            <div className="legend-item">
              <span className="legend-color final-exam"></span>
              <span>Final Exam Score</span>
            </div>
          </div>
        </div>
        <p className="footer-text">
          Rankings are based on overall course assessment performance including lessons, module tests, and final exam
        </p>
      </div>
    </div>
  );
};

export default CourseLeaderboard;