import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "./SolveContestProblem.css";

const SolveProblem = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [verdict, setVerdict] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("statement");
  const [mySubmissions, setMySubmissions] = useState([]);
  const [leftWidth, setLeftWidth] = useState(50);
  const [showConsole, setShowConsole] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('output');

  const containerRef = useRef(null);
  const isModifiedRef = useRef(false);

  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
  };

  const boilerplate = {
    cpp: `#include <iostream>
using namespace std;
int main() {
    // your code here
    return 0;
}`,
    python: `# your code here`,
    java: `public class Main {
    public static void main(String[] args) {
        // your code here
    }
}`,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/problems/${problemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblem(res.data);
        setCode(boilerplate[language]);
        setCustomInput(res.data.sampleTestCases?.[0]?.input || "");
        setOutput("");
        setVerdict("");
        isModifiedRef.current = false;
      } catch (err) {
        console.error("Error fetching problem:", err);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/submissions/user/${problemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMySubmissions(res.data);
      } catch (err) {
        console.error("Failed to load submissions:", err);
      }
    };

    fetchProblem();
    fetchSubmissions();
  }, [problemId, language]);

  useEffect(() => {
    if (!isModifiedRef.current) {
      setCode(boilerplate[language]);
      setOutput("");
      setVerdict("");
    }
  }, [language]);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before running.");
      setShowConsole(true);
      return;
    }
    setIsRunning(true);
    setIsSubmitting(false);
    setOutput("Running...");
    setVerdict("");
    setShowConsole(true);

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: customInput,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());

      if (problem?.sampleTestCases?.length) {
        const expected = problem.sampleTestCases[0].output.trim();
        setVerdict(finalOutput.trim() === expected ? "✅ Correct Output" : "❌ Wrong Output");
      } else {
        setVerdict("");
      }
    } catch (err) {
      console.error("Run Error:", err);
      setOutput("Error running code");
      setVerdict("");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before submitting.");
      return;
    }
    if (!problem?.hiddenTestCases?.length) {
      setOutput("No hidden test cases available for submission.");
      return;
    }

    setIsSubmitting(true);
    setIsRunning(false);
    setOutput("Evaluating hidden test cases...");
    setVerdict("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: problem.hiddenTestCases[0].input,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());

      const expected = problem.hiddenTestCases[0].output.trim();
      const isSuccess = finalOutput.trim() === expected;
      setVerdict(isSuccess ? "✅ Correct Output" : "❌ Wrong Output");

      await axios.post(
        "http://localhost:5000/api/submissions",
        { problemId, code, language, isSuccess },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const submissionsRes = await axios.get(`http://localhost:5000/api/submissions/user/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMySubmissions(submissionsRes.data);
    } catch (err) {
      console.error("Submit Error:", err);
      setOutput("Submission error");
      setVerdict("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    let newLeftWidth = (e.clientX / containerWidth) * 100;
    newLeftWidth = Math.max(20, Math.min(80, newLeftWidth));
    setLeftWidth(newLeftWidth);
  };

  const startDrag = () => {
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const stopDrag = () => {
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  if (!problem) return <p>Loading problem...</p>;

  return (
    <div className="solve-page">
      <div className="solve-container" ref={containerRef}>
        <div className="solve-left" style={{ width: `${leftWidth}%` }}>
          <div className="left-tabs">
            <button 
              className="back-arrow-btn"
              onClick={() => navigate('/problem-set')}
              title="Back to Problem Set"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className={activeTab === "statement" ? "active-tab" : ""}
              onClick={() => setActiveTab("statement")}
            >
              Problem Statement
            </button>
            <button
              className={activeTab === "submissions" ? "active-tab" : ""}
              onClick={() => setActiveTab("submissions")}
            >
              My Submissions
            </button>
          </div>

          <div className="left-content">
            {activeTab === "statement" ? (
              <div className="problem-statement">
                {/* Problem Header */}
                <div className="problem-header">
                  <div className="problem-title-section">
                    <span className="problem-number">{problem.problemNumber || 'N/A'}</span>
                    <h2 className="problem-title">{problem.title}</h2>
                  </div>
                  <div className="problem-meta-tags-container">
                    <div className="problem-meta">
                      <span className={`difficulty-badge difficulty-${problem.difficulty?.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                      <span className="score-badge">
                        {problem.score} points
                      </span>
                    </div>

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="problem-tags">
                        {problem.tags.map((tag, idx) => (
                          <span key={idx} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Problem Description - Simple Text */}
                <div className="problem-description-simple">
                  {problem.problemStatement || problem.description}
                </div>

                {/* Input Format */}
                {problem.inputFormat && (
                  <div className="format-section-simple">
                    <h3>Input Format</h3>
                    <div className="format-text-simple">
                      {problem.inputFormat}
                    </div>
                  </div>
                )}

                {/* Output Format */}
                {problem.outputFormat && (
                  <div className="format-section-simple">
                    <h3>Output Format</h3>
                    <div className="format-text-simple">
                      {problem.outputFormat}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="format-section-simple">
                    <h3>Constraints</h3>
                    <div className="constraints-text-simple">
                      {problem.constraints.map((constraint, idx) => (
                        <div key={idx} className="constraint-line">
                          • {constraint}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Test Cases */}
                <div className="problem-section">
                  <h3>Sample Test Cases</h3>
                  {problem.sampleTestCases?.length ? (
                    <div className="test-cases">
                      {problem.sampleTestCases.map((test, idx) => (
                        <div key={idx} className="testcase-block">
                          <div className="testcase-content">
                            <div className="testcase-input">
                              <strong>Input:</strong>
                              <pre>{test.input}</pre>
                            </div>
                            <div className="testcase-output">
                              <strong>Expected Output:</strong>
                              <pre>{test.output}</pre>
                            </div>
                            {test.explanation && (
                              <div className="testcase-explanation">
                                <strong>Explanation:</strong>
                                <p>{test.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-testcases">No sample test cases available.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="submissions-section">
                <h2>Submission History</h2>
                {mySubmissions.length === 0 ? (
                  <div className="no-submissions">
                    <p>No submissions yet.</p>
                    <p className="submission-hint">Submit your solution to see it here.</p>
                  </div>
                ) : (
                  <div className="submission-list">
                    {mySubmissions.map((sub, idx) => (
                      <div key={idx} className="submission-card">
                        <div className="submission-header">
                          <span className={`verdict ${sub.isSuccess ? "passed" : "failed"}`}>
                            {sub.isSuccess ? "Accepted" : "Wrong Answer"}
                          </span>
                          <div className="submission-meta">
                            <span className="lang-label">{sub.language}</span>
                            <span className="timestamp">
                              {new Date(sub.submittedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="submission-code">
                          <pre>{sub.code.length > 500 ? sub.code.slice(0, 500) + "\n... (truncated)" : sub.code}</pre>
                        </div>
                        <button
                          className="rerun-btn"
                          onClick={() => {
                            setCode(sub.code);
                            setLanguage(sub.language);
                            setOutput("// Loaded code from previous submission");
                            setVerdict("");
                            isModifiedRef.current = true;
                          }}
                        >
                          Re-run This Code
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="resizer" onMouseDown={startDrag} />

        <div className="solve-right" style={{ width: `${100 - leftWidth}%` }}>
          <div className="editor-toolbar">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                isModifiedRef.current = false;
                setOutput("");
                setVerdict("");
              }}
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
            <button 
              className="run-button"
              onClick={handleRun} 
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button 
              className="submit-button"
              onClick={handleSubmit} 
              disabled={isRunning || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          <div className="monaco-editor-container">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(val) => {
                setCode(val);
                isModifiedRef.current = true;
              }}
              options={{ 
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: false,
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8
                }
              }}
            />
          </div>

          <div className="input-section">
            <div className="input-header">
              <h3>Custom Input</h3>
            </div>
            <textarea
              className="input-box"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom input here"
            />
          </div>

          <div className={`output-console ${showConsole ? 'visible' : ''}`}>
            <div className="console-header" onClick={() => setShowConsole(!showConsole)}>
              <h4>Console</h4>
              <button className="console-close" onClick={(e) => {
                e.stopPropagation();
                setShowConsole(false);
              }}>×</button>
            </div>
            <div className="console-content">
              <div className="console-tabs">
                <button 
                  className={`console-tab ${activeConsoleTab === 'output' ? 'active' : ''}`}
                  onClick={() => setActiveConsoleTab('output')}
                >
                  Output
                </button>
                <button 
                  className={`console-tab ${activeConsoleTab === 'input' ? 'active' : ''}`}
                  onClick={() => setActiveConsoleTab('input')}
                >
                  Input
                </button>
              </div>
              <div className="console-body">
                {activeConsoleTab === 'output' ? (
                  <>
                    <pre className="console-output">{output}</pre>
                    {verdict && <p className="verdict-msg">{verdict}</p>}
                  </>
                ) : (
                  <textarea
                    className="console-output"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input here"
                    rows={5}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveProblem;
