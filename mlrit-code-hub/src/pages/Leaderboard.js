// pages/Leaderboard.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedYear, setSelectedYear] = useState("All Academic Years");

  // Add error boundary for any unexpected errors
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('API Response:', res.data);
        console.log('Response type:', typeof res.data);
        console.log('Is Array:', Array.isArray(res.data));
        
        // Ensure data is always an array
        const leaderboardData = Array.isArray(res.data) ? res.data : [];
        setData(leaderboardData);
      } catch (err) {
        console.error("Leaderboard Error", err);
        setError("Failed to load leaderboard data");
        setData([]); // Ensure data is always an array even on error
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Debug: Log the data structure to understand the field names
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample user data:', data[0]);
      console.log('Available fields:', Object.keys(data[0]));
      console.log('Current user from context:', user);
      console.log('Current user ID:', user?._id);
    }
  }, [data, user]);



  const filteredData = (() => {
    try {
      return Array.isArray(data) ? data.filter((leaderboardUser) => {
        const matchesSearch = leaderboardUser.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === "All Departments" || leaderboardUser.department === selectedDepartment;
        
        // Enhanced academic year field detection
        const userAcademicYear = leaderboardUser.academicYear || leaderboardUser.academic_year || leaderboardUser.year || leaderboardUser.yearOfStudy || leaderboardUser.academicYearOfStudy;
        const matchesAcademicYear = selectedYear === "All Academic Years" || String(userAcademicYear) === selectedYear;
        
        return matchesSearch && matchesDepartment && matchesAcademicYear;
      }) : [];
    } catch (err) {
      console.error('Error filtering data:', err);
      setHasError(true);
      return [];
    }
  })();

  // Get unique departments and academic years for dropdown options
  const departments = (() => {
    try {
      return ["All Departments", ...new Set(Array.isArray(data) ? data.map(leaderboardUser => leaderboardUser.department).filter(Boolean) : [])];
    } catch (err) {
      console.error('Error getting departments:', err);
      return ["All Departments"];
    }
  })();
  
  // Enhanced academic year extraction
  const allAcademicYears = (() => {
    try {
      return Array.isArray(data) ? data.map(leaderboardUser => {
        const academicYear = leaderboardUser.academicYear || leaderboardUser.academic_year || leaderboardUser.year || leaderboardUser.yearOfStudy || leaderboardUser.academicYearOfStudy;
        return academicYear ? String(academicYear) : null;
      }).filter(Boolean) : [];
    } catch (err) {
      console.error('Error getting academic years:', err);
      return [];
    }
  })();
  
  const years = ["All Academic Years", ...new Set(allAcademicYears)];

  // Function to get user initials
  const getUserInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Function to get department color variant
  const getDepartmentColor = (department) => {
    const colors = {
      'Computer Science': 'linear-gradient(135deg, #8b5cf6, #a855f7)',
      'Information Technology': 'linear-gradient(135deg, #06b6d4, #0891b2)',
      'Electronics': 'linear-gradient(135deg, #10b981, #059669)',
      'Mechanical': 'linear-gradient(135deg, #f59e0b, #d97706)',
      'Civil': 'linear-gradient(135deg, #ef4444, #dc2626)',
      'default': 'linear-gradient(135deg, #6b7280, #4b5563)'
    };
    return colors[department] || colors.default;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="leaderboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(6, 182, 212, 0.3)',
            borderTop: '3px solid #06b6d4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || hasError) {
    return (
      <div className="leaderboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <p style={{ color: '#ef4444', fontSize: '1.1rem' }}>
            Error: {error || 'An unexpected error occurred while processing the leaderboard data'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#06b6d4',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="leaderboard-container">
        {user && user.college && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: '2.25rem',
            paddingTop: '1rem'
          }}>
            <h1 style={{ 
              fontWeight: 700, 
              fontSize: '2rem',
              color: '#06b6d4',
              textAlign: 'center',
              textShadow: '0 0 8px rgba(6, 182, 212, 0.4)',
              letterSpacing: '0.08em',
              margin: 0,
              lineHeight: 1.3,
              fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
              {user.college}
            </h1>
          </div>
        )}
      <div className="controls">
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          {/* Search by Name - Left Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '240px', maxWidth: '400px' }}>
            <label style={{ 
              fontSize: '0.875rem', 
              color: '#94a3b8', 
              fontWeight: 500,
              marginBottom: '0.25rem',
              textAlign: 'left'
            }}>
              Search by Name
            </label>
            <input
              type="text"
              placeholder="Search by user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>
          
          {/* Department and Academic Year filters - Right Side Corner */}
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            marginLeft: 'auto',
            paddingRight: '0'
          }}>
            {/* Sort by Department */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
              <label style={{ 
                fontSize: '0.875rem', 
                color: '#94a3b8', 
                fontWeight: 500,
                marginBottom: '0.25rem',
                textAlign: 'left'
              }}>
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="filter-select"
                style={{ width: '100%' }}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            {/* Sort by Academic Year */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '160px' }}>
              <label style={{ 
                fontSize: '0.875rem', 
                color: '#94a3b8', 
                fontWeight: 500,
                marginBottom: '0.25rem',
                textAlign: 'left'
              }}>
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="filter-select"
                style={{ width: '100%' }}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="table-wrapper">
        {filteredData.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              {data.length === 0 ? 'No leaderboard data available' : 'No users match your search criteria'}
            </p>
          </div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Roll Number</th>
                <th>Academic Year</th>
                <th>Department</th>
                <th>Score</th>
                <th>Solved</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((rowUser) => {
              // Compare user IDs - handle both string and ObjectId formats
              const isCurrentUser = rowUser._id === user?._id || 
                                   rowUser._id?.toString() === user?._id?.toString() ||
                                   rowUser.email === user?.email;
              
              if (isCurrentUser) {
                console.log('Found current user in leaderboard:', rowUser.name, 'ID:', rowUser._id);
                console.log('Current user from context ID:', user?._id);
                console.log('Row user ID:', rowUser._id);
              }
              
              return (
                <tr 
                  key={rowUser.rank} 
                  className={`rank-row rank-${rowUser.rank} ${isCurrentUser ? 'current-user-neon' : ''}`}
                  style={isCurrentUser ? { backgroundColor: 'rgba(0, 212, 255, 0.1)', border: '2px solid #00d4ff' } : {}}
                >
                <td>
                  <span className={`badge rank-badge-${rowUser.rank}`}>{rowUser.rank}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="user-avatar">
                      {getUserInitials(rowUser.name)}
                    </div>
                    <span style={{ fontWeight: rowUser.rank === 1 ? 700 : 500 }}>
                      {rowUser.name}
                    </span>
                  </div>
                </td>
                <td>{rowUser.rollNumber}</td>
                <td>{rowUser.academicYear || rowUser.academic_year || rowUser.year || rowUser.yearOfStudy || rowUser.academicYearOfStudy}</td>
                <td>{rowUser.department}</td>
                <td style={{ fontWeight: 600 }}>{rowUser.totalScore}</td>
                <td>{rowUser.totalSolved}</td>
              </tr>
            );
          })}
            </tbody>
          </table>
        )}
      </div>
    </div>
    );
  } catch (err) {
    console.error('Unexpected error in Leaderboard component:', err);
    return (
      <div className="leaderboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <p style={{ color: '#ef4444', fontSize: '1.1rem' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#06b6d4',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default Leaderboard;