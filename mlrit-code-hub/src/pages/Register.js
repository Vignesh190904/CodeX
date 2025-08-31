// src/pages/Register.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import './login.css'; // We'll reuse the same styles

const Register = () => {
  const location = useLocation();
  function getQueryParam(param) {
    const params = new URLSearchParams(location.search);
    return params.get(param) || '';
  }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    college: getQueryParam('college'),
    year: getQueryParam('year'),
    department: getQueryParam('department')
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      college: getQueryParam('college'),
      year: getQueryParam('year'),
      department: getQueryParam('department'),
    }));
    // eslint-disable-next-line
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const academicYears = Array.from({length: 2040 - 2026 + 1}, (_, i) => 2026 + i);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setIsLoading(true);
    try {
      const payload = { ...formData, year: Number(formData.year) };
      await axios.post("http://localhost:5000/api/auth/register", payload);
      alert("Registration successful");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-sphere gradient-sphere-1"></div>
        <div className="gradient-sphere gradient-sphere-2"></div>
        <div className="gradient-sphere gradient-sphere-3"></div>
      </div>
      <div className="auth-card">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="logo-icon">
            <span>M</span>
          </div>
          <span className="logo-text">MLRIT Code Hub</span>
        </Link>

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Join MLRIT Code Hub and start coding</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              id="name"
              placeholder=" "
              value={formData.name}
              onChange={handleChange}
              required
            />
            <label htmlFor="name" className="form-label">Full name</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <input
              type="email"
              className="form-input"
              id="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <input
              type="text"
              className="form-input"
              id="rollNumber"
              placeholder=" "
              value={formData.rollNumber}
              onChange={handleChange}
              required
            />
            <label htmlFor="rollNumber" className="form-label">Roll Number</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              id="password"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password" className="form-label">Password</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              id="confirmPassword"
              placeholder=" "
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <select
              className="form-input"
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <label htmlFor="role" className="form-label">Role</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <select
              className="form-input"
              id="college"
              value={formData.college}
              onChange={handleChange}
              required
            >
              <option value="">Select College</option>
              <option value="MLR Institute of Technology">MLR Institute of Technology</option>
              <option value="Marri Laxman Reddy College">Marri Laxman Reddy College</option>
              <option value="IARE">IARE</option>
            </select>
            <label htmlFor="college" className="form-label">College</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <select
              className="form-input"
              id="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
            <label htmlFor="year" className="form-label">Academic Year</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <select
              className="form-input"
              id="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="AIML">AIML</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="CSIT">CSIT</option>
              <option value="CSD">CSD</option>
            </select>
            <label htmlFor="department" className="form-label">Department</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              I agree to the Terms and Conditions
            </label>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                Create account
                <svg className="button-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.33337 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 3.33331L12.6667 7.99998L8 12.6666" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="auth-links">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
            <svg className="link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
