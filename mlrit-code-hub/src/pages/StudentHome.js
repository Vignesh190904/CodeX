import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Home.css';

const StudentHome = () => {
  const [progressStats, setProgressStats] = useState({
    problemsSolved: 0,
    totalProblems: 200,
    contestsParticipated: 8,
    ranking: 156,
    streakDays: 7
  });
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const upcomingContests = [
    { id: 1, name: "Weekly Coding Challenge", date: "2024-03-20", time: "14:00" },
    { id: 2, name: "DSA Sprint", date: "2024-03-25", time: "16:00" },
  ];

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        // Fetch problem statistics
        const problemResponse = await axios.get('http://localhost:5000/api/submissions/user-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch contest statistics
        const contestResponse = await axios.get('http://localhost:5000/api/contest-submissions/user-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch recent solved problems
        const recentSolvedResponse = await axios.get('http://localhost:5000/api/submissions/recent-solved?limit=3', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProgressStats(prevStats => ({
          ...prevStats,
          problemsSolved: problemResponse.data.problemsSolved,
          contestsParticipated: contestResponse.data.contestsParticipated
        }));

        setRecentProblems(recentSolvedResponse.data);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <Navbar />
        <main className="home-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your statistics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <Navbar />
        <main className="home-main">
          <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Navbar />

      {/* Main Content */}
      <main className="home-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome back, Student!</h1>
            <p>Continue your coding journey and improve your skills</p>
          </div>
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-value">{progressStats.problemsSolved}</div>
              <div className="stat-label">Problems Solved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{progressStats.contestsParticipated}</div>
              <div className="stat-label">Contests Participated</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">#{progressStats.ranking}</div>
              <div className="stat-label">Current Ranking</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{progressStats.streakDays}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="home-grid">
                     {/* Recent Problems */}
           <section className="grid-card recent-problems">
             <h2>Recent Problems</h2>
             <div className="problem-list">
               {recentProblems.length > 0 ? (
                 recentProblems.map(problem => (
                   <div key={problem._id} className="problem-item">
                     <div className="problem-info">
                       <span className="problem-title">{problem.title}</span>
                       <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                         {problem.difficulty}
                       </span>
                     </div>
                     <div className="problem-status">
                       <svg className="check-icon" viewBox="0 0 24 24" width="20" height="20">
                         <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                       </svg>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="no-problems-message">
                   <p>No problems solved yet. Start your coding journey!</p>
                   <Link to="/problem-set" className="start-solving-btn">Start Solving</Link>
                 </div>
               )}
               <Link to="/problem-set" className="view-all-btn">View All Problems</Link>
             </div>
           </section>

          {/* Upcoming Contests */}
          <section className="grid-card upcoming-contests">
            <h2>Upcoming Contests</h2>
            <div className="contest-list">
              {upcomingContests.map(contest => (
                <div key={contest.id} className="contest-item">
                  <div className="contest-info">
                    <h3>{contest.name}</h3>
                    <p>
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                      </svg>
                      {contest.date} at {contest.time}
                    </p>
                  </div>
                  <button className="register-btn">Register</button>
                </div>
              ))}
              <Link to="/contests" className="view-all-btn">View All Contests</Link>
            </div>
          </section>

          {/* Progress Chart */}
          <section className="grid-card progress-chart">
            <h2>Your Progress</h2>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${(progressStats.problemsSolved/progressStats.totalProblems) * 100}%`}}
              >
                <span className="progress-text">
                  {progressStats.problemsSolved}/{progressStats.totalProblems} Problems
                </span>
              </div>
            </div>
            <div className="progress-stats">
              <div className="stat">
                <div className="stat-circle easy">
                  <span>25</span>
                </div>
                <p>Easy</p>
              </div>
              <div className="stat">
                <div className="stat-circle medium">
                  <span>15</span>
                </div>
                <p>Medium</p>
              </div>
              <div className="stat">
                <div className="stat-circle hard">
                  <span>5</span>
                </div>
                <p>Hard</p>
              </div>
            </div>
          </section>

          {/* Coding Streak */}
          <section className="grid-card coding-streak">
            <h2>Coding Streak</h2>
            <div className="streak-calendar">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`streak-day ${i < progressStats.streakDays ? 'active' : ''}`}>
                  <div className="day-marker"></div>
                  <span className="day-label">Day {i + 1}</span>
                </div>
              ))}
            </div>
            <p className="streak-message">
              {progressStats.streakDays === 7 
                ? "Perfect week! Keep it up! 🎉" 
                : `${7 - progressStats.streakDays} more days for a perfect week!`}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentHome;
