import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && form.password !== form.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/register";

    try {
      const response = await axios.post(url, form);
      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        response.data.role === "admin"
          ? navigate("/admin-home")
          : navigate("/student-home");
      } else {
        alert("Registration successful!");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Navigation Bar */}
      <div className="auth-nav">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <span>M</span>
            </div>
            <span className="nav-logo-text">MLRIT Code Hub</span>
          </Link>
          <div className="nav-links">
            <a onClick={handleLinkClick} className="nav-link">Home</a>
            <a onClick={handleLinkClick} className="nav-link">Problem Set</a>
            <a onClick={handleLinkClick} className="nav-link">Contests</a>
            <a onClick={handleLinkClick} className="nav-link">Leaderboard</a>
            <a onClick={handleLinkClick} className="nav-link">Discuss</a>
          </div>
        </div>
        <div className="nav-right">
          <Link to="/" className="go-back-btn">
            <svg className="back-arrow" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Go Back
          </Link>
        </div>
      </div>

      {/* Login Popup */}
      {showPopup && (
        <div className="login-popup">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Please login to access this feature
        </div>
      )}

      <div className="auth-background">
        <div className="gradient-sphere gradient-sphere-1"></div>
        <div className="gradient-sphere gradient-sphere-2"></div>
        <div className="gradient-sphere gradient-sphere-3"></div>
      </div>

      {/* Programming Language Icons */}
      <div className="lang-icons">
        <svg className="lang-icon python-icon" viewBox="0 0 128 128">
          <path fill="currentColor" d="M49.33 62h29.159c8.117 0 14.511-6.868 14.511-15.019v-27.798c0-7.912-6.632-13.856-14.555-15.176-5.014-.835-10.195-1.215-15.187-1.191-4.99.023-9.612.448-13.805 1.191-12.355 2.181-14.453 6.751-14.453 15.176v10.817h29v4h-40.224000000000004c-8.484 0-15.914 5.108-18.237 14.811-2.681 11.12-2.8 17.919 0 29.53 2.075 8.642 7.03 14.659 15.515 14.659h9.946v-13.048c0-9.637 8.428-17.952 18.33-17.952zm-1.838-39.11c-3.026 0-5.478-2.479-5.478-5.545 0-3.079 2.451-5.581 5.478-5.581 3.015 0 5.479 2.502 5.479 5.581-.001 3.066-2.465 5.545-5.479 5.545zM122.281 48.811c-2.098-8.448-6.103-14.811-14.599-14.811h-10.682v12.981c0 10.05-8.794 18.019-18.511 18.019h-29.159c-7.988 0-14.33 7.326-14.33 15.326v27.8c0 7.91 6.745 12.564 14.462 14.834 9.242 2.717 17.994 3.208 29.051 0 7.349-2.129 14.487-6.411 14.487-14.834v-11.126h-29v-4h43.682c8.484 0 11.647-5.776 14.599-14.66 3.047-9.145 2.916-17.799 0-29.529zm-41.955 55.606c3.027 0 5.479 2.479 5.479 5.547 0 3.076-2.451 5.579-5.479 5.579-3.015 0-5.478-2.502-5.478-5.579 0-3.068 2.463-5.547 5.478-5.547z"/>
        </svg>

        <svg className="lang-icon java-icon" viewBox="0 0 128 128">
          <path fill="currentColor" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"/>
          <path fill="currentColor" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"/>
          <path fill="currentColor" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"/>
          <path fill="currentColor" d="M76.491 1.587s12.968 12.976-12.303 32.923c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815 8.548-12.834 32.229-19.059 26.998-39.667z"/>
          <path fill="currentColor" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"/>
        </svg>

        <svg className="lang-icon cpp-icon" viewBox="0 0 128 128">
          <path fill="currentColor" d="M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6l-48.3-27.8c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.3.9 3.4l-.2.1c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4v-55.8c.1-.8 0-1.7-.4-2.6zm-53.5 55c9.1 0 17.1-5 21.3-12.4l12.9 7.6c-6.8 11.8-19.6 19.8-34.2 19.8-21.8 0-39.5-17.7-39.5-39.5s17.7-39.5 39.5-39.5c14.7 0 27.5 8.1 34.3 20l-13 7.5c-4.2-7.5-12.2-12.5-21.3-12.5-13.5 0-24.5 11-24.5 24.5s11 24.5 24.5 24.5z"/>
          <path fill="currentColor" d="M103 64.5h-4v-4h-4v4h-4v4h4v4h4v-4h4z"/>
          <path fill="currentColor" d="M85 64.5h-4v-4h-4v4h-4v4h4v4h4v-4h4z"/>
        </svg>

        <svg className="lang-icon c-icon" viewBox="0 0 128 128">
          <path fill="currentColor" d="M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6l-48.3-27.8c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.3.9 3.4l-.2.1c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4v-55.8c.1-.8 0-1.7-.4-2.6zm-53.5 70c-21.8 0-39.5-17.7-39.5-39.5s17.7-39.5 39.5-39.5c14.7 0 27.5 8.1 34.3 20l-13 7.5c-4.2-7.5-12.2-12.5-21.3-12.5-13.5 0-24.5 11-24.5 24.5s11 24.5 24.5 24.5c9.1 0 17.1-5 21.3-12.4l12.9 7.6c-6.8 11.8-19.6 19.8-34.2 19.8z"/>
        </svg>
      </div>

      {/* Programming Language Code Examples */}
      <div className="code-examples">
        <pre className="code-block python-code">
          <code>
            <span className="comment"># Python Quick Sort</span>{'\n'}
            <span className="keyword">def</span> <span className="function">quicksort</span>(arr):{'\n'}
            {'    '}<span className="keyword">if</span> len(arr) {'<='} 1:{'\n'}
            {'        '}<span className="keyword">return</span> arr{'\n'}
            {'    '}pivot = arr[len(arr) // 2]{'\n'}
            {'    '}left = [x <span className="keyword">for</span> x <span className="keyword">in</span> arr <span className="keyword">if</span> x {'<'} pivot]{'\n'}
            {'    '}middle = [x <span className="keyword">for</span> x <span className="keyword">in</span> arr <span className="keyword">if</span> x == pivot]{'\n'}
            {'    '}right = [x <span className="keyword">for</span> x <span className="keyword">in</span> arr <span className="keyword">if</span> x {'>'} pivot]{'\n'}
            {'    '}<span className="keyword">return</span> quicksort(left) + middle + quicksort(right)
          </code>
        </pre>

        <pre className="code-block java-code">
          <code>
            <span className="comment">// Java Binary Search</span>{'\n'}
            <span className="keyword">public</span> <span className="keyword">static</span> <span className="keyword">int</span> <span className="function">binarySearch</span>(<span className="keyword">int</span>[] arr, <span className="keyword">int</span> target) {'{'}{'\n'}
            {'    '}<span className="keyword">int</span> left = <span className="number">0</span>, right = arr.length - <span className="number">1</span>;{'\n'}
            {'    '}<span className="keyword">while</span> (left {'<='} right) {'{'}{'\n'}
            {'        '}<span className="keyword">int</span> mid = left + (right - left) / <span className="number">2</span>;{'\n'}
            {'        '}<span className="keyword">if</span> (arr[mid] == target) <span className="keyword">return</span> mid;{'\n'}
            {'        '}<span className="keyword">if</span> (arr[mid] {'<'} target) left = mid + <span className="number">1</span>;{'\n'}
            {'        '}<span className="keyword">else</span> right = mid - <span className="number">1</span>;{'\n'}
            {'    '}{'}'}{'\n'}
            {'    '}<span className="keyword">return</span> -<span className="number">1</span>;{'\n'}
            {'}'}
          </code>
        </pre>

        <pre className="code-block cpp-code">
          <code>
            <span className="comment">// C++ Vector Operations</span>{'\n'}
            <span className="keyword">template</span> {'<'}<span className="keyword">typename</span> T{'>'}{'\n'}
            <span className="keyword">void</span> <span className="function">vectorOps</span>(std::vector{'<'}T{'>'}&amp; v) {'{'}{'\n'}
            {'    '}v.push_back(element);{'\n'}
            {'    '}std::sort(v.begin(), v.end());{'\n'}
            {'    '}<span className="keyword">auto</span> it = std::find(v.begin(), v.end(), key);{'\n'}
            {'    '}v.erase(std::remove_if(v.begin(), v.end(), pred), v.end());{'\n'}
            {'}'}
          </code>
        </pre>

        <pre className="code-block c-code">
          <code>
            <span className="comment">/* C Linked List Node */</span>{'\n'}
            <span className="keyword">struct</span> Node {'{'}{'\n'}
            {'    '}<span className="keyword">int</span> data;{'\n'}
            {'    '}<span className="keyword">struct</span> Node* next;{'\n'}
            {'}'};{'\n\n'}
            <span className="keyword">void</span> <span className="function">insert</span>(Node** head, <span className="keyword">int</span> value) {'{'}{'\n'}
            {'    '}Node* newNode = malloc(<span className="keyword">sizeof</span>(Node));{'\n'}
            {'    '}newNode-{'>'}data = value;{'\n'}
            {'    '}newNode-{'>'}next = *head;{'\n'}
            {'    '}*head = newNode;{'\n'}
            {'}'}
          </code>
        </pre>
      </div>

      {/* Existing DSA Elements */}
      <div className="dsa-decorations">
        {/* Binary Tree */}
        <svg className="dsa-element binary-tree" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="40" r="20" stroke="currentColor" strokeWidth="4"/>
          <circle cx="60" cy="100" r="20" stroke="currentColor" strokeWidth="4"/>
          <circle cx="140" cy="100" r="20" stroke="currentColor" strokeWidth="4"/>
          <circle cx="30" cy="160" r="20" stroke="currentColor" strokeWidth="4"/>
          <circle cx="90" cy="160" r="20" stroke="currentColor" strokeWidth="4"/>
          <line x1="88" y1="52" x2="72" y2="88" stroke="currentColor" strokeWidth="4"/>
          <line x1="112" y1="52" x2="128" y2="88" stroke="currentColor" strokeWidth="4"/>
          <line x1="48" y1="112" x2="42" y2="148" stroke="currentColor" strokeWidth="4"/>
          <line x1="72" y1="112" x2="78" y2="148" stroke="currentColor" strokeWidth="4"/>
        </svg>

        {/* Array */}
        <svg className="dsa-element array-element" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="20" width="50" height="50" stroke="currentColor" strokeWidth="4"/>
          <rect x="70" y="20" width="50" height="50" stroke="currentColor" strokeWidth="4"/>
          <rect x="130" y="20" width="50" height="50" stroke="currentColor" strokeWidth="4"/>
          <rect x="190" y="20" width="50" height="50" stroke="currentColor" strokeWidth="4"/>
          <rect x="250" y="20" width="50" height="50" stroke="currentColor" strokeWidth="4"/>
        </svg>

        {/* Linked List */}
        <svg className="dsa-element linked-list" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="4"/>
          <circle cx="170" cy="50" r="30" stroke="currentColor" strokeWidth="4"/>
          <circle cx="290" cy="50" r="30" stroke="currentColor" strokeWidth="4"/>
          <line x1="80" y1="50" x2="140" y2="50" stroke="currentColor" strokeWidth="4"/>
          <line x1="200" y1="50" x2="260" y2="50" stroke="currentColor" strokeWidth="4"/>
          <line x1="320" y1="50" x2="380" y2="50" stroke="currentColor" strokeWidth="4"/>
        </svg>

        {/* Stack/Queue */}
        <svg className="dsa-element stack-queue" viewBox="0 0 150 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="20" width="100" height="30" stroke="currentColor" strokeWidth="4"/>
          <rect x="25" y="60" width="100" height="30" stroke="currentColor" strokeWidth="4"/>
          <rect x="25" y="100" width="100" height="30" stroke="currentColor" strokeWidth="4"/>
          <rect x="25" y="140" width="100" height="30" stroke="currentColor" strokeWidth="4"/>
        </svg>

        {/* Code Snippets */}
        <div className="code-snippet code-snippet-1">
{`function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}`}
        </div>

        <div className="code-snippet code-snippet-2">
{`class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}`}
        </div>
      </div>

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="logo-icon">
            <span>M</span>
          </div>
          <span className="logo-text">MLRIT Code Hub</span>
        </Link>

        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="auth-subtitle">
            {isLogin 
              ? "Sign in to continue to MLRIT Code Hub"
              : "Join MLRIT Code Hub and start coding"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
            <div className="form-group">
            <input
                type="text"
                className="form-input"
                id="name"
                placeholder=" "
              value={form.name}
              onChange={handleChange}
              required
            />
              <label htmlFor="name" className="form-label">Full name</label>
              <div className="form-highlight"></div>
            </div>
        )}

          <div className="form-group">
        <input
              type="email"
              className="form-input"
              id="email"
              placeholder=" "
          value={form.email}
          onChange={handleChange}
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
          value={form.password}
          onChange={handleChange}
          required
        />
            <label htmlFor="password" className="form-label">Password</label>
            <div className="form-highlight"></div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  id="confirmPassword"
                  placeholder=" "
                  value={form.confirmPassword}
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
                  value={form.role}
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
                <input
                  type="text"
                  className="form-input"
                  id="rollNumber"
                  placeholder=" "
                  value={form.rollNumber}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="rollNumber" className="form-label">Roll Number</label>
                <div className="form-highlight"></div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  I agree to the Terms and Conditions
                </label>
              </div>
            </>
          )}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                {isLogin ? "Sign in" : "Create account"}
                <svg className="button-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.33337 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 3.33331L12.6667 7.99998L8 12.6666" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
      </form>

        <div className="auth-links">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          {isLogin ? (
            <Link to="/register?college=&year=&department=" className="auth-link">
              Sign up
              <svg className="link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ) : (
            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }} className="auth-link">
              Sign in
              <svg className="link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;