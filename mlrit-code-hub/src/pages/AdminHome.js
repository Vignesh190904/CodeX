import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const AdminHome = () => {
  const recentSubmissions = [
    { id: 1, student: "John Doe", problem: "Two Sum", status: "Accepted", time: "2 mins ago" },
    { id: 2, student: "Jane Smith", problem: "Binary Tree", status: "Wrong Answer", time: "5 mins ago" },
    { id: 3, student: "Mike Johnson", problem: "DP Challenge", status: "Time Limit", time: "10 mins ago" },
  ];

  const systemStats = {
    totalStudents: 450,
    activeContests: 2,
    totalProblems: 200,
    averageAcceptanceRate: 68
  };

  const upcomingTasks = [
    { id: 1, task: "Review Contest Problems", deadline: "2024-03-20", priority: "High" },
    { id: 2, task: "Update Test Cases", deadline: "2024-03-22", priority: "Medium" },
    { id: 3, task: "Grade Submissions", deadline: "2024-03-25", priority: "Low" },
  ];

  const problemStats = {
    easy: { total: 80, acceptance: 75 },
    medium: { total: 90, acceptance: 55 },
    hard: { total: 30, acceptance: 35 }
  };

  return (
    <div className="home-container admin">
      <Navbar />

      {/* Main Content */}
      <main className="home-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome back, Admin!</h1>
            <p>Monitor and manage the MLRIT Code Hub platform</p>
          </div>
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-value">{systemStats.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{systemStats.activeContests}</div>
              <div className="stat-label">Active Contests</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{systemStats.totalProblems}</div>
              <div className="stat-label">Total Problems</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{systemStats.averageAcceptanceRate}%</div>
              <div className="stat-label">Avg. Acceptance</div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="home-grid">
          {/* Recent Submissions */}
          <section className="grid-card recent-submissions">
            <h2>Recent Submissions</h2>
            <div className="submission-list">
              {recentSubmissions.map(submission => (
                <div key={submission.id} className="submission-item">
                  <div className="submission-info">
                    <div className="submission-header">
                      <span className="student-name">{submission.student}</span>
                      <span className={`status-badge ${submission.status.toLowerCase().replace(' ', '-')}`}>
                        {submission.status}
                      </span>
                    </div>
                    <div className="submission-details">
                      <span className="problem-name">{submission.problem}</span>
                      <span className="submission-time">{submission.time}</span>
                    </div>
                  </div>
                  <button className="review-btn">Review</button>
                </div>
              ))}
              <Link to="/submissions" className="view-all-btn">View All Submissions</Link>
            </div>
          </section>

          {/* Upcoming Tasks */}
          <section className="grid-card upcoming-tasks">
            <h2>Upcoming Tasks</h2>
            <div className="task-list">
              {upcomingTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h3>{task.task}</h3>
                    <p>
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                      </svg>
                      Due: {task.deadline}
                    </p>
                  </div>
                  <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
              <button className="add-task-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add New Task
              </button>
            </div>
          </section>

          {/* Problem Statistics */}
          <section className="grid-card problem-statistics">
            <h2>Problem Statistics</h2>
            <div className="problem-stats">
              <div className="difficulty-stat">
                <div className="stat-header">
                  <h3>Easy</h3>
                  <span className="acceptance-rate">{problemStats.easy.acceptance}% acceptance</span>
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill easy" 
                    style={{width: `${(problemStats.easy.total/systemStats.totalProblems) * 100}%`}}
                  ></div>
                </div>
                <span className="total-count">{problemStats.easy.total} problems</span>
              </div>
              <div className="difficulty-stat">
                <div className="stat-header">
                  <h3>Medium</h3>
                  <span className="acceptance-rate">{problemStats.medium.acceptance}% acceptance</span>
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill medium"
                    style={{width: `${(problemStats.medium.total/systemStats.totalProblems) * 100}%`}}
                  ></div>
                </div>
                <span className="total-count">{problemStats.medium.total} problems</span>
              </div>
              <div className="difficulty-stat">
                <div className="stat-header">
                  <h3>Hard</h3>
                  <span className="acceptance-rate">{problemStats.hard.acceptance}% acceptance</span>
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill hard"
                    style={{width: `${(problemStats.hard.total/systemStats.totalProblems) * 100}%`}}
                  ></div>
                </div>
                <span className="total-count">{problemStats.hard.total} problems</span>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="grid-card quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-grid">
              <Link to="/admin/add-problem" className="action-btn">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Problem
              </Link>
              <Link to="/admin/create-contest" className="action-btn">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                </svg>
                Create Contest
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminHome;
