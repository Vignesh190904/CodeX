import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './landingpage.css';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (window.scrollY > 0) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Update active section
      const sections = ['features', 'success-stories', 'about'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      setActiveSection(current || '');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => (e) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav-content">
            {/* Brand Logo */}
            <Link to="/" className="logo-section">
              <div className="logo-icon">
                <span>M</span>
              </div>
              <span className="logo-text">MLRIT Code Hub</span>
            </Link>

            {/* Navigation and Buttons */}
            <nav className="navigation">
              <a 
                href="#features" 
                className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
                onClick={scrollToSection('features')}
              >
                Features
              </a>
              <a 
                href="#success-stories" 
                className={`nav-link ${activeSection === 'success-stories' ? 'active' : ''}`}
                onClick={scrollToSection('success-stories')}
              >
                Success Stories
              </a>
              <a 
                href="#about" 
                className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                onClick={scrollToSection('about')}
              >
                About
              </a>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-outline">Register</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="badge">
                🚀 Empowering Next Generation Coders
              </div>
              <h1 className="hero-title">MLRIT Code Hub</h1>
              <h2 className="hero-subtitle">
                Where Code Meets{" "}
                <span className="gradient-text">Excellence</span>
              </h2>
              <p className="hero-description">
                An advanced, full-stack coding platform built exclusively for MLR Institute
                of Technology. Solve problems, compete in contests, and elevate your
                programming skills in one powerful platform.
              </p>
              <div className="hero-buttons">
                <Link to="/login" className="btn btn-primary btn-large">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline btn-large">
                  View Problems
                </Link>
              </div>
              
              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">1000+</div>
                  <div className="stat-label">Active Students</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Coding Problems</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Contests</div>
                </div>
              </div>
            </div>
            
            {/* Code Editor Mockup */}
            <div className="code-editor-mockup">
              <div className="editor-window">
                <div className="editor-header">
                  <div className="window-controls">
                    <div className="control red"></div>
                    <div className="control yellow"></div>
                    <div className="control green"></div>
                  </div>
                  <div className="file-name">// MLRIT Code Hub</div>
                </div>
                <div className="editor-content">
                  <div className="code-line">
                    <span className="keyword">class</span>
                    <span className="class-name"> MLRITStudent</span>
                    <span className="bracket"> {" {"}</span>
                  </div>
                  <div className="code-line indent">
                    <span className="keyword">public</span>
                    <span className="keyword"> void</span>
                    <span className="method-name"> solveProblem</span>
                    <span className="bracket">()</span>
                    <span className="bracket"> {" {"}</span>
                  </div>
                  <div className="code-line indent-2">
                    <span className="class-name">System</span>
                    <span className="dot">.</span>
                    <span className="property">out</span>
                    <span className="dot">.</span>
                    <span className="method-name">println</span>
                    <span className="bracket">(</span>
                    <span className="string">"Success!"</span>
                    <span className="bracket">)</span>
                    <span>;</span>
                  </div>
                  <div className="code-line indent">
                    <span className="bracket">{"}"}</span>
                  </div>
                  <div className="code-line">
                    <span className="bracket">{"}"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Powerful Features for{" "}
              <span className="gradient-text">Modern Coders</span>
            </h2>
            <p className="section-description">
              MLRIT Code Hub provides everything you need to learn, practice, and excel in
              competitive programming within your campus ecosystem.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">{'</>'}</div>
              <h3 className="feature-title">Interactive Code Editor</h3>
              <p className="feature-description">
                Run your code in real-time with our integrated
                online compiler powered by Judge0. Support
                for C++, Python, and Java.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Role-Based Access</h3>
              <p className="feature-description">
                Students can solve problems and view leaderboards,
                while admins can create contests, manage
                problems, and monitor performance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Live Problem Set</h3>
              <p className="feature-description">
                Explore our growing collection of categorized
                problems with difficulty tags, test cases, and
                real-time statistics.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3 className="feature-title">Timed Contests</h3>
              <p className="feature-description">
                Participate in college-organized contests with live rankings,
                real-time, and hidden leaderboards until the
                contest ends.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3 className="feature-title">Submission Tracking</h3>
              <p className="feature-description">
                Track your submissions with live verdicts, timestamps,
                and code reviews for both learning and
                reflective analysis.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3 className="feature-title">Personalized Profile</h3>
              <p className="feature-description">
                Manage your account, update your details,
                monitor your progress, and view your leaderboard
                rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success-stories" className="success-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Success Stories from{" "}
              <span className="gradient-text">MLRIT</span>
            </h2>
            <p className="section-description">
              Hear from students and faculty who have experienced the transformative power of our
              coding platform.
            </p>
          </div>

          {/* Stats */}
          <div className="success-stats">
            <div className="success-stat">
              <div className="success-icon">{'</>'}</div>
              <div className="success-number">1000+</div>
              <div className="success-label">Students Active</div>
            </div>
            <div className="success-stat">
              <div className="success-icon">🏆</div>
              <div className="success-number">50+</div>
              <div className="success-label">Contests Conducted</div>
            </div>
            <div className="success-stat">
              <div className="success-icon">📈</div>
              <div className="success-number">75%</div>
              <div className="success-label">Placement Success Rate</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "MLRIT Code Hub transformed my competitive programming journey. The platform's learning interface and contests helped me crack multiple coding interviews."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">AK</div>
                <div className="author-info">
                  <div className="author-name">Arjun Kumar</div>
                  <div className="author-title">Final Year CSE, Placed at Google</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "As a faculty member, I love how easy it is to create custom contests and track student progress. The analytics help me understand where students need more guidance."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">PS</div>
                <div className="author-info">
                  <div className="author-name">Dr. Priya Sharma</div>
                  <div className="author-title">Professor, Computer Science Department</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "The real-time compiler and instant feedback made learning so much more engaging. I've solved over 300 problems and my coding skills have improved dramatically."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">SR</div>
                <div className="author-info">
                  <div className="author-name">Sneha Reddy</div>
                  <div className="author-title">Third Year IT, Competitive Programming Winner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        {/* ... about content ... */}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">
            Ready to{" "}
            <span className="gradient-text">Level Up</span>{" "}
            Your Coding Skills?
          </h2>
          <p className="cta-description">
            Join the MLRIT Code Hub community today and start your journey towards becoming
            a better programmer. Access exclusive problems, participate in contests, and compete
            with your peers.
          </p>
          
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary btn-large">
              👤 Join as Student
            </Link>
            <Link to="/login" className="btn btn-outline btn-large">
              📚 Faculty Login
            </Link>
          </div>

          {/* Features Grid */}
          <div className="cta-features">
            <div className="cta-feature">
              <div className="cta-feature-icon">🎯</div>
              <h3 className="cta-feature-title">Instant Access</h3>
              <p className="cta-feature-text">
                Start coding immediately with
                our web-based platform.
              </p>
            </div>
            <div className="cta-feature">
              <div className="cta-feature-icon">🏆</div>
              <h3 className="cta-feature-title">Competitive Edge</h3>
              <p className="cta-feature-text">
                Gain an advantage in coding
                interviews and contests.
              </p>
            </div>
            <div className="cta-feature">
              <div className="cta-feature-icon">📈</div>
              <h3 className="cta-feature-title">Track Progress</h3>
              <p className="cta-feature-text">
                Monitor your learning with
                detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">
                  <span className="code-icon">{'</>'}</span>
                </div>
                <span className="logo-text">MLRIT Code Hub</span>
              </div>
              <p className="footer-description">
                Empowering the next generation of coders
                at MLR Institute of Technology through
                innovative, seamless, and scalable
                programming education.
              </p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">For Students</h4>
              <ul className="footer-links">
                <li><Link to="/login" className="footer-link">Problem Archive</Link></li>
                <li><Link to="/login" className="footer-link">Contests</Link></li>
                <li><Link to="/login" className="footer-link">Leaderboard</Link></li>
                <li><Link to="/login" className="footer-link">Submissions</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">For Faculty</h4>
              <ul className="footer-links">
                <li><Link to="/login" className="footer-link">Admin Panel</Link></li>
                <li><Link to="/login" className="footer-link">Create Problems</Link></li>
                <li><Link to="/login" className="footer-link">Manage Contests</Link></li>
                <li><Link to="/login" className="footer-link">Student Analytics</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Resources</h4>
              <ul className="footer-links">
                <li><Link to="/login" className="footer-link">Documentation</Link></li>
                <li><Link to="/login" className="footer-link">API Reference</Link></li>
                <li><Link to="/login" className="footer-link">Tutorials</Link></li>
                <li><Link to="/login" className="footer-link">FAQ</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 MLRIT Code Hub. All rights reserved. Made with ❤️ by MLRIT students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
