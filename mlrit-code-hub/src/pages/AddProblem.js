import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProblem.css";

const AddProblem = () => {
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    score: 50,
    problemStatement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: [""],
    sampleTestCases: [{ 
      input: "", 
      output: "", 
      explanation: "" 
    }],
    hiddenTestCases: [{ 
      input: "", 
      output: "" 
    }],
    tags: [""]
  });

  const [nextProblemNumber, setNextProblemNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingNumbers, setUpdatingNumbers] = useState(false);

  // Fetch the next problem number on component mount
  useEffect(() => {
    const fetchNextProblemNumber = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/problems", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const problemCount = response.data.length;
        setNextProblemNumber(problemCount + 1);
      } catch (err) {
        console.error("Error fetching problem count:", err);
        setNextProblemNumber(1); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchNextProblemNumber();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const handleTestCaseChange = (type, index, field, value) => {
    const updated = [...formData[type]];
    updated[index][field] = value;
    setFormData({ ...formData, [type]: updated });
  };

  const addArrayItem = (field, defaultItem = "") => {
    setFormData({ 
      ...formData, 
      [field]: [...formData[field], defaultItem] 
    });
  };

  const removeArrayItem = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated });
  };

  const addTestCase = (type) => {
    const defaultCase = type === "sampleTestCases" 
      ? { input: "", output: "", explanation: "" }
      : { input: "", output: "" };
    setFormData({ 
      ...formData, 
      [type]: [...formData[type], defaultCase] 
    });
  };

  const removeTestCase = (type, index) => {
    const updated = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty constraints and tags
      const processedData = {
        ...formData,
        description: formData.problemStatement, // Add description for backward compatibility
        constraints: formData.constraints.filter(constraint => constraint.trim() !== ""),
        tags: formData.tags.filter(tag => tag.trim() !== "")
      };

      console.log("Submitting problem data:", processedData);

      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/problems/add", processedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Problem added successfully:", response.data);
      alert(`Problem #${response.data.problemNumber} added successfully!`);
      
      // Reset form and update next problem number
      setFormData({
        title: "",
        difficulty: "Easy",
        score: 50,
        problemStatement: "",
        inputFormat: "",
        outputFormat: "",
        constraints: [""],
        sampleTestCases: [{ input: "", output: "", explanation: "" }],
        hiddenTestCases: [{ input: "", output: "" }],
        tags: [""]
      });
      
      // Update the next problem number
      setNextProblemNumber(response.data.problemNumber + 1);
    } catch (err) {
      console.error("Error adding problem:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Error adding problem";
      if (err.response?.data?.message) {
        errorMessage += ": " + err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage += ": " + err.response.data.error;
      } else if (err.message) {
        errorMessage += ": " + err.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleUpdateProblemNumbers = async () => {
    setUpdatingNumbers(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/problems/update-numbers", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Problem numbers updated successfully!");
      // Re-fetch the next problem number after update
      const response = await axios.get("http://localhost:5000/api/problems", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const problemCount = response.data.length;
      setNextProblemNumber(problemCount + 1);
    } catch (err) {
      console.error("Error updating problem numbers:", err);
      alert("Failed to update problem numbers.");
    } finally {
      setUpdatingNumbers(false);
    }
  };

  return (
    <div className="add-problem">
      <h2>Add New Problem</h2>
      
      {/* Problem Number Display */}
      <div className="problem-number-display">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="next-problem-info">
            <span className="problem-number-label">Next Problem Number:</span>
            <span className="problem-number-value">#{nextProblemNumber}</span>
            <button 
              type="button"
              onClick={handleUpdateProblemNumbers}
              disabled={updatingNumbers}
              className="update-numbers-btn"
            >
              {updatingNumbers ? 'Updating...' : 'Update Existing Problem Numbers'}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>Problem Title *</label>
            <input
              name="title"
              placeholder="Enter problem title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Difficulty *</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Score *</label>
              <input
                name="score"
                type="number"
                placeholder="Enter score"
                value={formData.score}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="form-section">
          <h3>Problem Statement</h3>
          <div className="form-group">
            <label>Problem Description *</label>
            <textarea
              name="problemStatement"
              placeholder="Describe the problem in detail..."
              rows={6}
              value={formData.problemStatement}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Input/Output Format */}
        <div className="form-section">
          <h3>Input/Output Format</h3>
          
          <div className="form-group">
            <label>Input Format</label>
            <textarea
              name="inputFormat"
              placeholder="Describe the input format..."
              rows={4}
              value={formData.inputFormat}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Output Format</label>
            <textarea
              name="outputFormat"
              placeholder="Describe the output format..."
              rows={4}
              value={formData.outputFormat}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Constraints */}
        <div className="form-section">
          <h3>Constraints</h3>
          {formData.constraints.map((constraint, idx) => (
            <div key={idx} className="constraint-item">
              <input
                placeholder="Enter constraint (e.g., 1 ≤ n ≤ 10^5)"
                value={constraint}
                onChange={(e) => handleArrayChange("constraints", idx, e.target.value)}
              />
              {formData.constraints.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeArrayItem("constraints", idx)}
                  className="remove-btn"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("constraints")}>
            + Add Constraint
          </button>
        </div>

        {/* Sample Test Cases */}
        <div className="form-section">
          <h3>Sample Test Cases</h3>
          {formData.sampleTestCases.map((tc, idx) => (
            <div key={idx} className="test-case">
              <div className="test-case-header">
                <h4>Sample Case {idx + 1}</h4>
                {formData.sampleTestCases.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeTestCase("sampleTestCases", idx)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="test-case-content">
                <div className="form-group">
                  <label>Input *</label>
                  <textarea
                    placeholder="Enter input"
                    value={tc.input}
                    onChange={(e) =>
                      handleTestCaseChange("sampleTestCases", idx, "input", e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Expected Output *</label>
                  <textarea
                    placeholder="Enter expected output"
                    value={tc.output}
                    onChange={(e) =>
                      handleTestCaseChange("sampleTestCases", idx, "output", e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Explanation *</label>
                  <textarea
                    placeholder="Explain how this test case works..."
                    value={tc.explanation}
                    onChange={(e) =>
                      handleTestCaseChange("sampleTestCases", idx, "explanation", e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addTestCase("sampleTestCases")}>
            + Add Sample Test Case
          </button>
        </div>

        {/* Hidden Test Cases */}
        <div className="form-section">
          <h3>Hidden Test Cases</h3>
          {formData.hiddenTestCases.map((tc, idx) => (
            <div key={idx} className="test-case">
              <div className="test-case-header">
                <h4>Hidden Case {idx + 1}</h4>
                {formData.hiddenTestCases.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeTestCase("hiddenTestCases", idx)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="test-case-content">
                <div className="form-group">
                  <label>Input *</label>
                  <textarea
                    placeholder="Enter input"
                    value={tc.input}
                    onChange={(e) =>
                      handleTestCaseChange("hiddenTestCases", idx, "input", e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Expected Output *</label>
                  <textarea
                    placeholder="Enter expected output"
                    value={tc.output}
                    onChange={(e) =>
                      handleTestCaseChange("hiddenTestCases", idx, "output", e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addTestCase("hiddenTestCases")}>
            + Add Hidden Test Case
          </button>
        </div>

        {/* Tags */}
        <div className="form-section">
          <h3>Tags</h3>
          {formData.tags.map((tag, idx) => (
            <div key={idx} className="tag-item">
              <input
                placeholder="Enter tag (e.g., arrays, strings, dynamic-programming)"
                value={tag}
                onChange={(e) => handleArrayChange("tags", idx, e.target.value)}
              />
              {formData.tags.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeArrayItem("tags", idx)}
                  className="remove-btn"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("tags")}>
            + Add Tag
          </button>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Create Problem #{nextProblemNumber}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProblem;
