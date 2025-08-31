import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Add login logic here
    setTimeout(() => setIsLoading(false), 1500); // Simulate loading
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to MLRIT Code Hub</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              id="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              id="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password" className="form-label">Password</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                Sign in
                <svg className="button-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.33337 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 3.33331L12.6667 7.99998L8 12.6666" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Social Login */}
        <div className="social-auth">
          <button className="social-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.684,2.047-2.583,3.534-4.829,3.534c-2.829,0-5.125-2.296-5.125-5.125c0-2.829,2.296-5.125,5.125-5.125c1.349,0,2.576,0.524,3.49,1.379l1.547-1.547C14.887,7.346,13.296,6.791,11.545,6.791c-3.609,0-6.545,2.936-6.545,6.545c0,3.609,2.936,6.545,6.545,6.545c3.609,0,6.545-2.936,6.545-6.545v-1.909h-5.545C12.545,11.427,12.545,12.151,12.545,12.151z" />
            </svg>
            Sign in with Google
          </button>
          <button className="social-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Sign in with GitHub
          </button>
        </div>

        {/* Links */}
        <div className="auth-links">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Sign up
            <svg className="link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 