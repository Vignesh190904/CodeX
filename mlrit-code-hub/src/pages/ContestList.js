import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ContestList.css";

const ContestList = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/contests/ongoing");
        setContests(res.data);
      } catch (err) {
        console.error("Failed to fetch contests", err);
      }
    };

    fetchContests();
  }, []);

  return (
    <div className="contest-list">
      <h2>🏆 Ongoing Contests</h2>
      {contests.length === 0 ? (
        <p>No contests available at the moment.</p>
      ) : (
        <ul>
          {contests.map((contest) => (
            <li key={contest._id}>
              <h3>{contest.title}</h3>
              <p>{contest.description}</p>
              <Link to={`/contest/${contest._id}`} className="enter-btn">Enter Contest</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContestList;
