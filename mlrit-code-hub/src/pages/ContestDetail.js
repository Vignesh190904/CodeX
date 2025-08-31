import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

const ContestDetail = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);

  useEffect(() => {
    fetchContest();
  }, []);

  const fetchContest = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/contests/${id}`);
      setContest(res.data);
    } catch (error) {
      console.error("Error fetching contest:", error);
    }
  };

  if (!contest) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1>{contest.title}</h1>
      {contest.problems.map((problem) => (
        <div key={problem._id} className="problem-card">
          <h2>{problem.title}</h2>
          <Link to={`/contest/${contest._id}/solve/${problem._id}`}>
            <button>Solve</button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ContestDetail;
