import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateContest.css";

const CreateContest = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    problems: [],
  });

  const [allProblems, setAllProblems] = useState([]);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/problems", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllProblems(res.data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProblemSelect = (e) => {
    const problemId = e.target.value;
    if (!formData.problems.includes(problemId)) {
      setFormData({ ...formData, problems: [...formData.problems, problemId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/contests/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Contest created successfully!");
    } catch (error) {
      console.error("Error creating contest:", error);
      alert("Failed to create contest.");
    }
  };

  return (
    <div className="create-contest">
      <h2>Create Contest</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Contest Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Contest Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
        />

        <select onChange={handleProblemSelect}>
          <option>Select Problems to Add</option>
          {allProblems.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>

        <div className="selected-problems">
          {formData.problems.map((id) => {
            const problem = allProblems.find((p) => p._id === id);
            return <div key={id}>{problem?.title}</div>;
          })}
        </div>

        <button type="submit">Create Contest</button>
      </form>
    </div>
  );
};

export default CreateContest;
