import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/contests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading contests...</div>;

  return (
    <div className="contests-container">
      <h1>Programming Contests</h1>
      <div className="contests-list">
        {contests.map(contest => (
          <div key={contest._id} className="contest-item">
            <h3>{contest.title}</h3>
            <p>{contest.description}</p>
            <Link to={`/contest/${contest._id}`}>View Contest</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contests;
