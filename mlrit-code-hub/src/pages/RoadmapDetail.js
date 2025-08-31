import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './RoadmapDetail.css';

const RoadmapDetail = () => {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmapDetail();
  }, [id]);

  const fetchRoadmapDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/roadmaps/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoadmap(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load roadmap details');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading roadmap...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!roadmap) return <div className="error">Roadmap not found</div>;

  return (
    <div className="roadmap-detail-container">
      <div className="roadmap-header">
        <h1>{roadmap.title}</h1>
        <p className="roadmap-description">{roadmap.description}</p>
        <div className="roadmap-meta">
          <span className="difficulty">{roadmap.difficulty}</span>
          <span className="duration">{roadmap.estimatedDuration}</span>
        </div>
      </div>

      <div className="roadmap-content">
        <div className="roadmap-steps">
          {roadmap.steps?.map((step, index) => (
            <div key={index} className="roadmap-step">
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {step.resources && (
                  <div className="step-resources">
                    <h4>Resources:</h4>
                    <ul>
                      {step.resources.map((resource, idx) => (
                        <li key={idx}>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="roadmap-sidebar">
          <div className="progress-section">
            <h3>Your Progress</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${roadmap.progress || 0}%` }}></div>
            </div>
            <span className="progress-text">{roadmap.progress || 0}% Complete</span>
          </div>

          <div className="roadmap-actions">
            <button className="start-btn">Start Learning</button>
            <button className="bookmark-btn">Bookmark</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;
