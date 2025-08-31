import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Button from "../components/ui/Button";
import "./ModuleDetail.css";

const ModuleDetail = () => {
  const { courseId, moduleIndex } = useParams();
  const [module, setModule] = useState(null);
  const [completed, setCompleted] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const mod = res.data.modules[parseInt(moduleIndex)];
        setModule(mod);
      });
    // Check if completed (optional: fetch progress)
  }, [courseId, moduleIndex, token]);

  const markAsComplete = () => {
    axios.post(
      `http://localhost:5000/api/courses/${courseId}/module/${moduleIndex}/complete`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      setCompleted(true);
      alert("Module marked as completed!");
    });
  };

  if (!module) return <div className="module-detail-bg">Loading...</div>;

  return (
    <div className="module-detail-bg">
      <div className="module-detail-card">
        <h2 className="module-detail-title">{module.title}</h2>
        <p className="module-detail-desc">{module.description}</p>
        {module.hasCode && (
          <div className="module-detail-code-editor">
            <div className="module-detail-code-header">
              <span className="module-detail-code-control red"></span>
              <span className="module-detail-code-control yellow"></span>
              <span className="module-detail-code-control green"></span>
              <span className="module-detail-code-filename">code.js</span>
            </div>
            <pre className="module-detail-code-textarea">{module.codeSnippet}</pre>
          </div>
        )}
        <Button onClick={markAsComplete} disabled={completed}>
          {completed ? "Completed ✅" : "Mark as Complete"}
        </Button>
      </div>
    </div>
  );
};

export default ModuleDetail;
