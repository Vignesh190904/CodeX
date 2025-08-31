import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UserContext from "../context/UserContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { user, setUser } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRole = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      // Access role from the custom claims in the JWT
      return decoded?.["role"] || decoded?.["custom:role"] || null;
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const userRole = getRole();
  
  // Enhanced authentication check - ensures profile card only shows for authenticated users
  // This prevents the profile card from appearing on registration/login pages for unauthenticated users
  const isAuthenticated = !!token && !!user && !!userRole;

  return (
    <nav className="home-nav">
      <div className="nav-left">
        <Link to={userRole === 'admin' ? '/admin-home' : '/student-home'} className="nav-logo">
          <div className="nav-logo-icon">
            <span>M</span>
          </div>
          <span className="nav-logo-text">MLRIT Code Hub</span>
        </Link>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            {isMobileMenuOpen ? (
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            ) : (
              <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            )}
          </svg>
        </button>
        <div className={`nav-links ${isMobileMenuOpen ? 'show' : ''}`}>
          {userRole === 'admin' ? (
            <>
              <Link to="/admin-home" className={`nav-link ${isActive('/admin-home') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/admin/edit-courses" className={`nav-link ${isActive('/admin/edit-courses') ? 'active' : ''}`}>
                Manage Courses
              </Link>
              <Link to="/admin/create-course" className={`nav-link ${isActive('/admin/create-course') ? 'active' : ''}`}>
                Create Course
              </Link>
              <Link to="/admin/add-problem" className={`nav-link ${isActive('/admin/add-problem') ? 'active' : ''}`}>
                Add Problem
              </Link>
              <Link to="/admin/manage-problems" className={`nav-link ${isActive('/admin/manage-problems') ? 'active' : ''}`}>
                Manage Problems
              </Link>
              <Link to="/admin/create-contest" className={`nav-link ${isActive('/admin/create-contest') ? 'active' : ''}`}>
                Create Contest
              </Link>
            </>
          ) : (
            <>
              <Link to="/student-home" className={`nav-link ${isActive('/student-home') ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>
                Courses
              </Link>
              <Link to="/editor" className={`nav-link ${isActive('/editor') ? 'active' : ''}`}>
                Compiler
              </Link>
              <Link to="/problem-set" className={`nav-link ${isActive('/problem-set') ? 'active' : ''}`}>
                Problem Set
              </Link>
              <Link to="/contests" className={`nav-link ${isActive('/contests') ? 'active' : ''}`}>
                Contests
              </Link>
              <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}>
                Leaderboard
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="nav-right">
        <div className="user-profile" ref={dropdownRef}>
          <div className="profile-info" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <img 
              src={user?.profilePic ? `http://localhost:5000${user.profilePic}` : "/default-profile.png"}
              alt="Profile" 
              className="profile-avatar" 
            />
            <span className="profile-name">{user?.name || 'User'}</span>
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                👤 Profile
              </Link>
              <Link to="/settings" onClick={() => setDropdownOpen(false)}>
                ⚙️ Settings
              </Link>
              <button onClick={handleLogout}>🔓 Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;