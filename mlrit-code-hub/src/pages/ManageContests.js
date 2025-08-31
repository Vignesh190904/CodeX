import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageContests = () => {
  const [contests, setContests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/contests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContests(res.data);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const moveProblemsToRegular = async (contestId) => {
    if (window.confirm("Move problems to regular problem set?")) {
      try {
        await axios.post(`http://localhost:5000/api/contests/move-to-regular/${contestId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Problems moved to regular problem set!");
        fetchContests();
      } catch (error) {
        console.error("Error moving problems:", error);
      }
    }
  };

  return (
    <div className="container">
      <h1>Manage Contests</h1>
      {contests.map((contest) => (
        <div key={contest._id} className="contest-card">
          <h2>{contest.title}</h2>
          <p>Start: {new Date(contest.startTime).toLocaleString()}</p>
          <p>End: {new Date(contest.endTime).toLocaleString()}</p>
          <button onClick={() => moveProblemsToRegular(contest._id)}>
            Move Problems to Regular
          </button>
        </div>
      ))}
    </div>
  );
};

export default ManageContests;
