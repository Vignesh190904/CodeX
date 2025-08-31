import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EditProblem.css";

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState({
    title: "",
    description: "",
    difficulty: "",
  });

  useEffect(() => {
    fetchProblem();
  }, []);

  const fetchProblem = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProblem(res.data);
    } catch (error) {
      console.error("Error fetching problem:", error);
    }
  };

  const handleChange = (e) => {
    setProblem({ ...problem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/problems/${id}`, problem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Problem updated successfully!");
      navigate("/admin/manage-problems");
    } catch (error) {
      console.error("Error updating problem:", error);
      alert("Failed to update problem.");
    }
  };

  return (
    <div className="edit-problem">
      <h2>Edit Problem</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Problem Title"
          value={problem.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Problem Description"
          value={problem.description}
          onChange={handleChange}
          required
        />
        <select
          name="difficulty"
          value={problem.difficulty}
          onChange={handleChange}
          required
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <button type="submit">Update Problem</button>
      </form>
    </div>
  );
};

export default EditProblem;
