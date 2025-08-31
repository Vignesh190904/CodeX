import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import "./AdminEditCourses.css";

Modal.setAppElement("#root");

const AdminEditCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingMode, setEditingMode] = useState("basic"); // "basic", "topics", "finalTest"
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    order: 0
  });
  const [newLesson, setNewLesson] = useState({
    title: "",
    type: "theory",
    duration: 30,
    order: 0,
    content: "",
    review: ""
  });
  const [newMCQ, setNewMCQ] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: 0,
    explanation: ""
  });
  const [newCodeChallenge, setNewCodeChallenge] = useState({
    title: "",
    description: "",
    sampleInput: "",
    sampleOutput: "",
    constraints: "",
    initialCode: "",
    language: "javascript"
  });
  const coursesPerPage = 5;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Swal.fire("Error", "Failed to fetch courses.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This course will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Course has been deleted.", "success");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        Swal.fire("Error", "Course could not be deleted.", "error");
      }
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse({ ...course });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedCourse(null);
    setIsUpdating(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Validate required fields
    if (!selectedCourse.title || !selectedCourse.description) {
      Swal.fire("Error", "Title and description are required.", "error");
      setIsUpdating(false);
      return;
    }

    try {
      let updateResponse;

      if (editingMode === "basic") {
        // Update basic course information only
        const basicCourseData = {
          title: selectedCourse.title.trim(),
          description: selectedCourse.description.trim(),
          difficulty: selectedCourse.difficulty || "Easy"
        };

        console.log('Updating basic course data:', basicCourseData);
        console.log('Course ID:', selectedCourse._id);
        console.log('Token:', token ? 'Present' : 'Missing');
        updateResponse = await axios.patch(`http://localhost:5000/api/courses/${selectedCourse._id}/basic`, basicCourseData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Update full course with all topics, lessons, tests, etc.
        const fullCourseData = {
          title: selectedCourse.title.trim(),
          description: selectedCourse.description.trim(),
          difficulty: selectedCourse.difficulty || "Easy",
          topics: selectedCourse.topics || [],
          finalTest: selectedCourse.finalTest || null
        };

        console.log('Updating full course data:', fullCourseData);
        updateResponse = await axios.put(`http://localhost:5000/api/courses/${selectedCourse._id}`, fullCourseData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      console.log('Update response:', updateResponse.data);
      Swal.fire("Success", "Course updated successfully!", "success");
      fetchCourses();
      closeModal();
    } catch (error) {
      console.error("Error updating course:", error);
      let errorMessage = "Failed to update the course.";
      
      if (error.response) {
        // Server responded with error
        console.error("Server error details:", error.response.data);
        
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          // Handle validation errors
          const validationErrors = error.response.data.errors.map(err => `${err.param}: ${err.msg}`).join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
        console.error("Network error:", error.request);
      } else {
        // Other error
        errorMessage = error.message || errorMessage;
        console.error("Other error:", error);
      }
      
      Swal.fire("Error", errorMessage, "error");
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicChange = (e, index, field) => {
    const updated = [...(selectedCourse.topics || [])];
    updated[index][field] = e.target.value;
    setSelectedCourse((prev) => ({ ...prev, topics: updated }));
  };



  const removeTopic = (index) => {
    const updated = selectedCourse.topics.filter((_, i) => i !== index);
    setSelectedCourse((prev) => ({ ...prev, topics: updated }));
  };

  // Topic Management Functions
  const addTopic = () => {
    if (!newTopic.title || !newTopic.description) {
      Swal.fire("Error", "Topic title and description are required.", "error");
      return;
    }

    const topicToAdd = {
      ...newTopic,
      _id: Date.now().toString(), // Temporary ID
      lessons: [],
      moduleTest: null
    };

    setSelectedCourse(prev => ({
      ...prev,
      topics: [...(prev.topics || []), topicToAdd]
    }));

    setNewTopic({ title: "", description: "", order: 0 });
  };

  const deleteTopic = (topicIndex) => {
    const updatedTopics = selectedCourse.topics.filter((_, index) => index !== topicIndex);
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  const updateTopic = (topicIndex, field, value) => {
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex] = { ...updatedTopics[topicIndex], [field]: value };
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  // Lesson Management Functions
  const addLesson = (topicIndex) => {
    if (!newLesson.title || !newLesson.content) {
      Swal.fire("Error", "Lesson title and content are required.", "error");
      return;
    }

    const lessonToAdd = {
      ...newLesson,
      _id: Date.now().toString(),
      mcqs: [],
      codeChallenges: []
    };

    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons.push(lessonToAdd);
    
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
    setNewLesson({ title: "", type: "theory", duration: 30, order: 0, content: "", review: "" });
  };

  const deleteLesson = (topicIndex, lessonIndex) => {
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons.splice(lessonIndex, 1);
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  const updateLesson = (topicIndex, lessonIndex, field, value) => {
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons[lessonIndex] = {
      ...updatedTopics[topicIndex].lessons[lessonIndex],
      [field]: value
    };
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  // MCQ Management Functions
  const addMCQ = (topicIndex, lessonIndex) => {
    if (!newMCQ.question || newMCQ.options.some(opt => !opt.trim())) {
      Swal.fire("Error", "MCQ question and all options are required.", "error");
      return;
    }

    const mcqToAdd = { ...newMCQ, _id: Date.now().toString() };
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons[lessonIndex].mcqs.push(mcqToAdd);
    
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
    setNewMCQ({ question: "", options: ["", "", "", ""], correct: 0, explanation: "" });
  };

  const deleteMCQ = (topicIndex, lessonIndex, mcqIndex) => {
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons[lessonIndex].mcqs.splice(mcqIndex, 1);
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  const updateMCQ = (topicIndex, lessonIndex, mcqIndex, field, value) => {
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons[lessonIndex].mcqs[mcqIndex] = {
      ...updatedTopics[topicIndex].lessons[lessonIndex].mcqs[mcqIndex],
      [field]: value
    };
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  // Code Challenge Management Functions
  const addCodeChallenge = (topicIndex, lessonIndex) => {
    if (!newCodeChallenge.title || !newCodeChallenge.description) {
      Swal.fire("Error", "Code challenge title and description are required.", "error");
      return;
    }

    const challengeToAdd = { ...newCodeChallenge, _id: Date.now().toString() };
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons[lessonIndex].codeChallenges.push(challengeToAdd);
    
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
    setNewCodeChallenge({
      title: "",
      description: "",
      sampleInput: "",
      sampleOutput: "",
      constraints: "",
      initialCode: "",
      language: "javascript"
    });
  };

  const deleteCodeChallenge = (topicIndex, lessonIndex, challengeIndex) => {
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons[lessonIndex].codeChallenges.splice(challengeIndex, 1);
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  const updateCodeChallenge = (topicIndex, lessonIndex, challengeIndex, field, value) => {
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].lessons[lessonIndex].codeChallenges[challengeIndex] = {
      ...updatedTopics[topicIndex].lessons[lessonIndex].codeChallenges[challengeIndex],
      [field]: value
    };
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  // Module Test Management Functions
  const addModuleTest = (topicIndex) => {
    const moduleTest = {
      _id: Date.now().toString(),
      totalMarks: 100,
      mcqs: [],
      codeChallenges: []
    };

    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].moduleTest = moduleTest;
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  const deleteModuleTest = (topicIndex) => {
    const updatedTopics = [...selectedCourse.topics];
    updatedTopics[topicIndex].moduleTest = null;
    setSelectedCourse(prev => ({ ...prev, topics: updatedTopics }));
  };

  // Final Test Management Functions
  const addFinalTest = () => {
    const finalTest = {
      _id: Date.now().toString(),
      totalMarks: 200,
      mcqs: [],
      codeChallenges: []
    };

    setSelectedCourse(prev => ({ ...prev, finalTest }));
  };

  const deleteFinalTest = () => {
    setSelectedCourse(prev => ({ ...prev, finalTest: null }));
  };

  // Input Change Handlers for New Items
  const handleNewTopicChange = (field, value) => {
    setNewTopic(prev => ({ ...prev, [field]: value }));
  };

  const handleNewLessonChange = (field, value) => {
    setNewLesson(prev => ({ ...prev, [field]: value }));
  };

  const handleNewMCQChange = (field, value) => {
    if (field === 'options') {
      setNewMCQ(prev => ({ ...prev, options: value }));
    } else {
      setNewMCQ(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNewCodeChallengeChange = (field, value) => {
    setNewCodeChallenge(prev => ({ ...prev, [field]: value }));
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="admin-container">
      <h1 className="admin-heading">Manage Courses</h1>
      
      <div className="admin-actions">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <Link to="/admin/create-course" className="add-course-btn">
          + Add New Course
        </Link>
      </div>

      <div className="courses-list">
        {currentCourses.length > 0 ? (
          currentCourses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-info">
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span className="difficulty-badge">{course.difficulty}</span>
                  <span className="topics-count">{course.topics?.length || 0} topics</span>
                </div>
              </div>
              <div className="course-buttons">
                <button
                  onClick={() => openEditModal(course)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses">
            <p>No courses found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="overlay"
        style={{ content: { maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' } }}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Edit Course: {selectedCourse?.title}</h2>
            <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
          </div>

          {/* Editing Mode Tabs */}
          <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #374151' }}>
            <button
              onClick={() => setEditingMode("basic")}
              style={{
                padding: '10px 20px',
                background: editingMode === "basic" ? '#8A00C4' : 'transparent',
                border: 'none',
                color: editingMode === "basic" ? 'white' : '#94a3b8',
                cursor: 'pointer',
                borderBottom: editingMode === "basic" ? '2px solid #8A00C4' : 'none'
              }}
            >
              Basic Info
            </button>
            <button
              onClick={() => setEditingMode("topics")}
              style={{
                padding: '10px 20px',
                background: editingMode === "topics" ? '#8A00C4' : 'transparent',
                border: 'none',
                color: editingMode === "topics" ? 'white' : '#94a3b8',
                cursor: 'pointer',
                borderBottom: editingMode === "topics" ? '2px solid #8A00C4' : 'none'
              }}
            >
              Topics & Lessons
            </button>
            <button
              onClick={() => setEditingMode("finalTest")}
              style={{
                padding: '10px 20px',
                background: editingMode === "finalTest" ? '#8A00C4' : 'transparent',
                border: 'none',
                color: editingMode === "finalTest" ? 'white' : '#94a3b8',
                cursor: 'pointer',
                borderBottom: editingMode === "finalTest" ? '2px solid #8A00C4' : 'none'
              }}
            >
              Final Test
            </button>
          </div>

          <form onSubmit={handleUpdate}>
            {/* Basic Info Tab */}
            {editingMode === "basic" && (
              <div>
                <div className="form-group">
                  <label>Course Title</label>
                  <input
                    type="text"
                    name="title"
                    value={selectedCourse?.title || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={selectedCourse?.description || ""}
                    onChange={handleInputChange}
                    required
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                                     <select
                     name="difficulty"
                     value={selectedCourse?.difficulty || "Easy"}
                     onChange={handleInputChange}
                   >
                     <option value="Easy">Easy</option>
                     <option value="Medium">Medium</option>
                     <option value="Hard">Hard</option>
                   </select>
                </div>
              </div>
            )}

            {/* Topics & Lessons Tab */}
            {editingMode === "topics" && (
              <div>
                {/* Add New Topic */}
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'rgba(138, 0, 196, 0.1)', borderRadius: '8px' }}>
                  <h3 style={{ color: '#8A00C4', marginBottom: '15px' }}>Add New Topic</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input
                      type="text"
                      placeholder="Topic Title"
                      value={newTopic.title}
                      onChange={(e) => handleNewTopicChange('title', e.target.value)}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white' }}
                    />
                    <input
                      type="number"
                      placeholder="Order"
                      value={newTopic.order}
                      onChange={(e) => handleNewTopicChange('order', parseInt(e.target.value))}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white' }}
                    />
                  </div>
                  <textarea
                    placeholder="Topic Description"
                    value={newTopic.description}
                    onChange={(e) => handleNewTopicChange('description', e.target.value)}
                    style={{ width: '100%', marginTop: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', minHeight: '80px' }}
                  />
                  <button
                    type="button"
                    onClick={addTopic}
                    style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#8A00C4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Add Topic
                  </button>
                </div>

                {/* Existing Topics */}
                {selectedCourse?.topics?.map((topic, topicIndex) => (
                  <div key={topic._id || topicIndex} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ color: '#8A00C4' }}>Topic {topicIndex + 1}: {topic.title}</h3>
                      <button
                        type="button"
                        onClick={() => deleteTopic(topicIndex)}
                        style={{ padding: '5px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete Topic
                      </button>
                    </div>

                    {/* Topic Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      <input
                        type="text"
                        placeholder="Topic Title"
                        value={topic.title}
                        onChange={(e) => updateTopic(topicIndex, 'title', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white' }}
                      />
                      <input
                        type="number"
                        placeholder="Order"
                        value={topic.order}
                        onChange={(e) => updateTopic(topicIndex, 'order', parseInt(e.target.value))}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white' }}
                      />
                    </div>
                    <textarea
                      placeholder="Topic Description"
                      value={topic.description}
                      onChange={(e) => updateTopic(topicIndex, 'description', e.target.value)}
                      style={{ width: '100%', marginBottom: '20px', padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', minHeight: '60px' }}
                    />

                    {/* Module Test Management */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ color: '#f59e0b' }}>Module Test</h4>
                        {topic.moduleTest ? (
                          <button
                            type="button"
                            onClick={() => deleteModuleTest(topicIndex)}
                            style={{ padding: '5px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Delete Module Test
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addModuleTest(topicIndex)}
                            style={{ padding: '5px 10px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Add Module Test
                          </button>
                        )}
                      </div>
                      {topic.moduleTest && (
                        <div style={{ padding: '15px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', marginTop: '10px' }}>
                          <p style={{ color: '#f59e0b' }}>Module Test exists with {topic.moduleTest.mcqs?.length || 0} MCQs and {topic.moduleTest.codeChallenges?.length || 0} code challenges</p>
                        </div>
                      )}
                    </div>

                    {/* Add New Lesson */}
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px' }}>
                      <h4 style={{ color: '#3b82f6', marginBottom: '10px' }}>Add New Lesson</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Lesson Title"
                          value={newLesson.title}
                          onChange={(e) => handleNewLessonChange('title', e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white' }}
                        />
                        <select
                          value={newLesson.type}
                          onChange={(e) => handleNewLessonChange('type', e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white' }}
                        >
                          <option value="theory">Theory</option>
                          <option value="practical">Practical</option>
                          <option value="quiz">Quiz</option>
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <input
                          type="number"
                          placeholder="Duration (minutes)"
                          value={newLesson.duration}
                          onChange={(e) => handleNewLessonChange('duration', parseInt(e.target.value))}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white' }}
                        />
                        <input
                          type="number"
                          placeholder="Order"
                          value={newLesson.order}
                          onChange={(e) => handleNewLessonChange('order', parseInt(e.target.value))}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white' }}
                        />
                      </div>
                      <textarea
                        placeholder="Lesson Content"
                        value={newLesson.content}
                        onChange={(e) => handleNewLessonChange('content', e.target.value)}
                        style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', minHeight: '60px' }}
                      />
                      <textarea
                        placeholder="Lesson Review"
                        value={newLesson.review}
                        onChange={(e) => handleNewLessonChange('review', e.target.value)}
                        style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', minHeight: '60px' }}
                      />
                      <button
                        type="button"
                        onClick={() => addLesson(topicIndex)}
                        style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Add Lesson
                      </button>
                    </div>

                    {/* Existing Lessons */}
                    {topic.lessons?.map((lesson, lessonIndex) => (
                      <div key={lesson._id || lessonIndex} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #374151' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h5 style={{ color: '#3b82f6' }}>Lesson {lessonIndex + 1}: {lesson.title}</h5>
                          <button
                            type="button"
                            onClick={() => deleteLesson(topicIndex, lessonIndex)}
                            style={{ padding: '3px 8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Delete
                          </button>
                        </div>

                        {/* Lesson Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <input
                            type="text"
                            placeholder="Lesson Title"
                            value={lesson.title}
                            onChange={(e) => updateLesson(topicIndex, lessonIndex, 'title', e.target.value)}
                            style={{ padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                          />
                          <select
                            value={lesson.type}
                            onChange={(e) => updateLesson(topicIndex, lessonIndex, 'type', e.target.value)}
                            style={{ padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                          >
                            <option value="theory">Theory</option>
                            <option value="practical">Practical</option>
                            <option value="quiz">Quiz</option>
                          </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <input
                            type="number"
                            placeholder="Duration"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(topicIndex, lessonIndex, 'duration', parseInt(e.target.value))}
                            style={{ padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                          />
                          <input
                            type="number"
                            placeholder="Order"
                            value={lesson.order}
                            onChange={(e) => updateLesson(topicIndex, lessonIndex, 'order', parseInt(e.target.value))}
                            style={{ padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                          />
                        </div>
                        <textarea
                          placeholder="Content"
                          value={lesson.content}
                          onChange={(e) => updateLesson(topicIndex, lessonIndex, 'content', e.target.value)}
                          style={{ width: '100%', marginBottom: '10px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', minHeight: '50px', fontSize: '14px' }}
                        />
                        <textarea
                          placeholder="Review"
                          value={lesson.review}
                          onChange={(e) => updateLesson(topicIndex, lessonIndex, 'review', e.target.value)}
                          style={{ width: '100%', marginBottom: '10px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', minHeight: '50px', fontSize: '14px' }}
                        />

                        {/* MCQs Section */}
                        <div style={{ marginBottom: '15px' }}>
                          <h6 style={{ color: '#10b981', marginBottom: '8px' }}>MCQs ({lesson.mcqs?.length || 0})</h6>
                          
                          {/* Add New MCQ */}
                          <div style={{ padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', marginBottom: '10px' }}>
                            <input
                              type="text"
                              placeholder="MCQ Question"
                              value={newMCQ.question}
                              onChange={(e) => handleNewMCQChange('question', e.target.value)}
                              style={{ width: '100%', marginBottom: '8px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                            />
                            {newMCQ.options.map((option, optionIndex) => (
                              <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                <input
                                  type="radio"
                                  name="correct"
                                  checked={newMCQ.correct === optionIndex}
                                  onChange={() => handleNewMCQChange('correct', optionIndex)}
                                  style={{ marginRight: '8px' }}
                                />
                                <input
                                  type="text"
                                  placeholder={`Option ${optionIndex + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...newMCQ.options];
                                    newOptions[optionIndex] = e.target.value;
                                    handleNewMCQChange('options', newOptions);
                                  }}
                                  style={{ flex: 1, padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                                />
                              </div>
                            ))}
                            <textarea
                              placeholder="Explanation"
                              value={newMCQ.explanation}
                              onChange={(e) => handleNewMCQChange('explanation', e.target.value)}
                              style={{ width: '100%', marginTop: '8px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', minHeight: '40px', fontSize: '14px' }}
                            />
                            <button
                              type="button"
                              onClick={() => addMCQ(topicIndex, lessonIndex)}
                              style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Add MCQ
                            </button>
                          </div>

                          {/* Existing MCQs */}
                          {lesson.mcqs?.map((mcq, mcqIndex) => (
                            <div key={mcq._id || mcqIndex} style={{ padding: '8px', backgroundColor: '#1f2937', borderRadius: '4px', marginBottom: '8px', border: '1px solid #374151' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <span style={{ color: '#10b981', fontSize: '14px' }}>MCQ {mcqIndex + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => deleteMCQ(topicIndex, lessonIndex, mcqIndex)}
                                  style={{ padding: '2px 6px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '11px' }}
                                >
                                  Delete
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Question"
                                value={mcq.question}
                                onChange={(e) => updateMCQ(topicIndex, lessonIndex, mcqIndex, 'question', e.target.value)}
                                style={{ width: '100%', marginBottom: '5px', padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', fontSize: '13px' }}
                              />
                              {mcq.options?.map((option, optionIndex) => (
                                <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
                                  <input
                                    type="radio"
                                    name={`correct-${mcqIndex}`}
                                    checked={mcq.correct === optionIndex}
                                    onChange={() => updateMCQ(topicIndex, lessonIndex, mcqIndex, 'correct', optionIndex)}
                                    style={{ marginRight: '6px' }}
                                  />
                                  <input
                                    type="text"
                                    placeholder={`Option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...mcq.options];
                                      newOptions[optionIndex] = e.target.value;
                                      updateMCQ(topicIndex, lessonIndex, mcqIndex, 'options', newOptions);
                                    }}
                                    style={{ flex: 1, padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', fontSize: '13px' }}
                                  />
                                </div>
                              ))}
                              <textarea
                                placeholder="Explanation"
                                value={mcq.explanation}
                                onChange={(e) => updateMCQ(topicIndex, lessonIndex, mcqIndex, 'explanation', e.target.value)}
                                style={{ width: '100%', marginTop: '5px', padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', minHeight: '30px', fontSize: '13px' }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Code Challenges Section */}
                        <div>
                          <h6 style={{ color: '#f59e0b', marginBottom: '8px' }}>Code Challenges ({lesson.codeChallenges?.length || 0})</h6>
                          
                          {/* Add New Code Challenge */}
                          <div style={{ padding: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px', marginBottom: '10px' }}>
                            <input
                              type="text"
                              placeholder="Challenge Title"
                              value={newCodeChallenge.title}
                              onChange={(e) => handleNewCodeChallengeChange('title', e.target.value)}
                              style={{ width: '100%', marginBottom: '8px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                            />
                            <textarea
                              placeholder="Challenge Description"
                              value={newCodeChallenge.description}
                              onChange={(e) => handleNewCodeChallengeChange('description', e.target.value)}
                              style={{ width: '100%', marginBottom: '8px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', minHeight: '40px', fontSize: '14px' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                              <input
                                type="text"
                                placeholder="Sample Input"
                                value={newCodeChallenge.sampleInput}
                                onChange={(e) => handleNewCodeChallengeChange('sampleInput', e.target.value)}
                                style={{ padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                              />
                              <input
                                type="text"
                                placeholder="Sample Output"
                                value={newCodeChallenge.sampleOutput}
                                onChange={(e) => handleNewCodeChallengeChange('sampleOutput', e.target.value)}
                                style={{ padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                              />
                            </div>
                            <textarea
                              placeholder="Constraints"
                              value={newCodeChallenge.constraints}
                              onChange={(e) => handleNewCodeChallengeChange('constraints', e.target.value)}
                              style={{ width: '100%', marginBottom: '8px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', minHeight: '30px', fontSize: '14px' }}
                            />
                            <textarea
                              placeholder="Initial Code"
                              value={newCodeChallenge.initialCode}
                              onChange={(e) => handleNewCodeChallengeChange('initialCode', e.target.value)}
                              style={{ width: '100%', marginBottom: '8px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', minHeight: '60px', fontSize: '14px' }}
                            />
                            <select
                              value={newCodeChallenge.language}
                              onChange={(e) => handleNewCodeChallengeChange('language', e.target.value)}
                              style={{ width: '100%', marginBottom: '8px', padding: '6px', borderRadius: '3px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px' }}
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="java">Java</option>
                              <option value="cpp">C++</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => addCodeChallenge(topicIndex, lessonIndex)}
                              style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Add Code Challenge
                            </button>
                          </div>

                          {/* Existing Code Challenges */}
                          {lesson.codeChallenges?.map((challenge, challengeIndex) => (
                            <div key={challenge._id || challengeIndex} style={{ padding: '8px', backgroundColor: '#1f2937', borderRadius: '4px', marginBottom: '8px', border: '1px solid #374151' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <span style={{ color: '#f59e0b', fontSize: '14px' }}>Challenge {challengeIndex + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => deleteCodeChallenge(topicIndex, lessonIndex, challengeIndex)}
                                  style={{ padding: '2px 6px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '11px' }}
                                >
                                  Delete
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Title"
                                value={challenge.title}
                                onChange={(e) => updateCodeChallenge(topicIndex, lessonIndex, challengeIndex, 'title', e.target.value)}
                                style={{ width: '100%', marginBottom: '5px', padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', fontSize: '13px' }}
                              />
                              <textarea
                                placeholder="Description"
                                value={challenge.description}
                                onChange={(e) => updateCodeChallenge(topicIndex, lessonIndex, challengeIndex, 'description', e.target.value)}
                                style={{ width: '100%', marginBottom: '5px', padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', minHeight: '30px', fontSize: '13px' }}
                              />
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '5px' }}>
                                <input
                                  type="text"
                                  placeholder="Sample Input"
                                  value={challenge.sampleInput}
                                  onChange={(e) => updateCodeChallenge(topicIndex, lessonIndex, challengeIndex, 'sampleInput', e.target.value)}
                                  style={{ padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', fontSize: '13px' }}
                                />
                                <input
                                  type="text"
                                  placeholder="Sample Output"
                                  value={challenge.sampleOutput}
                                  onChange={(e) => updateCodeChallenge(topicIndex, lessonIndex, challengeIndex, 'sampleOutput', e.target.value)}
                                  style={{ padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', fontSize: '13px' }}
                                />
                              </div>
                              <textarea
                                placeholder="Constraints"
                                value={challenge.constraints}
                                onChange={(e) => updateCodeChallenge(topicIndex, lessonIndex, challengeIndex, 'constraints', e.target.value)}
                                style={{ width: '100%', marginBottom: '5px', padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', minHeight: '25px', fontSize: '13px' }}
                              />
                              <textarea
                                placeholder="Initial Code"
                                value={challenge.initialCode}
                                onChange={(e) => updateCodeChallenge(topicIndex, lessonIndex, challengeIndex, 'initialCode', e.target.value)}
                                style={{ width: '100%', marginBottom: '5px', padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', minHeight: '40px', fontSize: '13px' }}
                              />
                              <select
                                value={challenge.language}
                                onChange={(e) => updateCodeChallenge(topicIndex, lessonIndex, challengeIndex, 'language', e.target.value)}
                                style={{ width: '100%', padding: '4px', borderRadius: '2px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', fontSize: '13px' }}
                              >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Final Test Tab */}
            {editingMode === "finalTest" && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: '#8A00C4' }}>Final Test</h3>
                  {selectedCourse?.finalTest ? (
                    <button
                      type="button"
                      onClick={deleteFinalTest}
                      style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Delete Final Test
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={addFinalTest}
                      style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Add Final Test
                    </button>
                  )}
                </div>

                {selectedCourse?.finalTest && (
                  <div style={{ padding: '20px', backgroundColor: 'rgba(138, 0, 196, 0.1)', borderRadius: '8px' }}>
                    <p style={{ color: '#8A00C4', marginBottom: '15px' }}>
                      Final Test exists with {selectedCourse.finalTest.mcqs?.length || 0} MCQs and {selectedCourse.finalTest.codeChallenges?.length || 0} code challenges
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                      Final test editing will be implemented in the next update. For now, you can add/remove the final test.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="modal-buttons" style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeModal} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEditCourses;
