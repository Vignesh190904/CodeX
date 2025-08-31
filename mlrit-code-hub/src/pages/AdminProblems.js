import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import "./AdminProblems.css";

Modal.setAppElement("#root");

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const problemsPerPage = 5;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/problems", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProblems(res.data);
    } catch (error) {
      console.error("Error fetching problems:", error);
      Swal.fire("Error", "Failed to fetch problems.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This problem will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/problems/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Problem has been deleted.", "success");
        fetchProblems();
      } catch (error) {
        console.error("Error deleting problem:", error);
        Swal.fire("Error", "Problem could not be deleted.", "error");
      }
    }
  };

  const openEditModal = (problem) => {
    setSelectedProblem({ ...problem }); // Spread to avoid direct state mutation
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProblem(null);
    setIsUpdating(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/problems/${selectedProblem._id}`, selectedProblem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Problem updated successfully!", "success");
      fetchProblems();
      closeModal();
    } catch (error) {
      console.error("Error updating problem:", error);
      Swal.fire("Error", "Failed to update the problem.", "error");
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProblem((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (e, index, field, type) => {
    const updated = [...(selectedProblem[type] || [])];
    updated[index][field] = e.target.value;
    setSelectedProblem((prev) => ({ ...prev, [type]: updated }));
  };

  const addTestCase = (type) => {
    const defaultCase = type === "sampleTestCases" 
      ? { input: "", output: "", explanation: "" }
      : { input: "", output: "" };
    const updated = [...(selectedProblem[type] || []), defaultCase];
    setSelectedProblem((prev) => ({ ...prev, [type]: updated }));
  };

  // Pagination logic
  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="admin-container">
      <h1 className="admin-heading">Problem Management</h1>

      <div className="admin-actions">
        <input
          type="text"
          placeholder="Search problems..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <Link className="add-problem-btn" to="/admin/add-problem">
          ➕ Add New Problem
        </Link>
      </div>

      <div className="problems-list">
        {currentProblems.length > 0 ? (
          currentProblems.map((problem) => (
            <div key={problem._id} className="problem-card">
              <h2>{problem.title}</h2>
              <p>{problem.description}</p>
              <div className="problem-buttons">
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(problem._id)}
                >
                  🗑️ Delete
                </button>
                <button
                  className="edit-btn"
                  onClick={() => openEditModal(problem)}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No problems found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={currentPage === idx + 1 ? "active-page" : ""}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedProblem && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit Problem"
          className="modal"
          overlayClassName="overlay"
        >
          <h2>Edit Problem</h2>
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              name="title"
              value={selectedProblem.title || ""}
              onChange={handleInputChange}
              required
              placeholder="Title"
            />
            <textarea
              name="description"
              value={selectedProblem.description || ""}
              onChange={handleInputChange}
              required
              placeholder="Description"
            />
            <select
              name="difficulty"
              value={selectedProblem.difficulty || ""}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Sample Test Cases */}
            <h4>Sample Test Cases</h4>
            {(selectedProblem.sampleTestCases || []).map((testcase, index) => (
              <div key={index} className="testcase-row">
                <input
                  type="text"
                  placeholder="Input"
                  value={testcase.input}
                  onChange={(e) => handleTestCaseChange(e, index, "input", "sampleTestCases")}
                />
                <input
                  type="text"
                  placeholder="Expected Output"
                  value={testcase.output}
                  onChange={(e) => handleTestCaseChange(e, index, "output", "sampleTestCases")}
                />
                <textarea
                  placeholder="Explanation (optional)"
                  value={testcase.explanation || ""}
                  onChange={(e) => handleTestCaseChange(e, index, "explanation", "sampleTestCases")}
                  rows="2"
                />
              </div>
            ))}
            <button
              type="button"
              className="add-testcase-btn"
              onClick={() => addTestCase("sampleTestCases")}
            >
              ➕ Add Sample TestCase
            </button>

            {/* Hidden Test Cases */}
            <h4>Hidden Test Cases</h4>
            {(selectedProblem.hiddenTestCases || []).map((testcase, index) => (
              <div key={index} className="testcase-row">
                <input
                  type="text"
                  placeholder="Input"
                  value={testcase.input}
                  onChange={(e) => handleTestCaseChange(e, index, "input", "hiddenTestCases")}
                />
                <input
                  type="text"
                  placeholder="Expected Output"
                  value={testcase.output}
                  onChange={(e) => handleTestCaseChange(e, index, "output", "hiddenTestCases")}
                />
              </div>
            ))}
            <button
              type="button"
              className="add-testcase-btn"
              onClick={() => addTestCase("hiddenTestCases")}
            >
              ➕ Add Hidden TestCase
            </button>

            <div className="modal-buttons">
              <button type="submit" className="save-btn" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={closeModal} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminProblems;
