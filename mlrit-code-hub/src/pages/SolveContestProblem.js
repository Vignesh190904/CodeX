import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "./SolveContestProblem.css";

const SolveContestProblem = () => {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [verdict, setVerdict] = useState("");
  const [loading, setLoading] = useState(false);

  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
  };

  const boilerplate = {
    cpp: `#include<iostream>
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

  const dividerRef = useRef(null);
  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50); // percentage

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/contests/${contestId}`);
        const prob = res.data.problems.find(p => p._id === problemId);
        if (prob) {
          setProblem(prob);
          setCode(boilerplate[language]);
          setCustomInput(prob.sampleTestCases[0]?.input || "");
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
      }
    };
    fetchProblem();
  }, [contestId, problemId, language]);

  const handleRun = async () => {
    if (!problem?.sampleTestCases?.length) {
      return setOutput("No sample test cases found.");
    }

    setLoading(true);
    setOutput("Running...");

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: customInput || problem.sampleTestCases[0].input,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(`Compilation Successful\n${finalOutput.trim()}`);

      const expected = problem.sampleTestCases[0].output.trim();
      if (finalOutput.trim() === expected) {
        setVerdict("✅ Correct Output");
      } else {
        setVerdict("❌ Wrong Output");
      }
    } catch (err) {
      console.error("Run Error", err);
      setOutput("Error running code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem?.hiddenTestCases?.length) {
      return setOutput("No hidden test cases found.");
    }

    setLoading(true);
    setOutput("Evaluating hidden test cases...");

    try {
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
      setOutput(`Compilation Successful\n${finalOutput.trim()}`);

      const expected = problem.hiddenTestCases[0].output.trim();
      if (finalOutput.trim() === expected) {
        setVerdict("✅ Correct Output");
      } else {
        setVerdict("❌ Wrong Output");
      }
    } catch (err) {
      console.error("Error evaluating hidden test case", err);
      setOutput("Error running code");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e) => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      if (newLeftWidth > 20 && newLeftWidth < 80) {
        setLeftWidth(newLeftWidth);
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  if (!problem) return <p>Loading problem...</p>;

  return (
    <div className="solve-page" ref={containerRef}>
      {/* Back Arrow */}
      <button 
        className="back-arrow-btn"
        onClick={() => navigate(`/contests/${contestId}`)}
        title="Back to Contest"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className="solve-container">
        <div
          className="solve-left"
          style={{
            width: `${leftWidth}%`,
            backgroundColor: "#1e1e1e",
            color: "white",
            overflowY: "auto",
          }}
        >
          <div className="problem-statement">
            <div className="problem-header">
              <h2>{problem.title}</h2>
            </div>
            
            <div className="problem-content">
              <p>{problem.description}</p>
            </div>
            
            {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
              <div className="test-cases-section">
                <h3>Sample Test Cases</h3>
                {problem.sampleTestCases.map((testCase, index) => (
                  <div key={index} className="testcase-block">
                    <div className="testcase-input">
                      <strong>Input:</strong>
                      <pre>{testCase.input || "N/A"}</pre>
                    </div>
                    <div className="testcase-output">
                      <strong>Output:</strong>
                      <pre>{testCase.output || "N/A"}</pre>
                    </div>
                    {testCase.explanation && (
                      <div className="testcase-explanation">
                        <strong>Explanation:</strong>
                        <p>{testCase.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          ref={dividerRef}
          className="resizer"
          onMouseDown={handleMouseDown}
          style={{
            width: "5px",
            cursor: "col-resize",
            backgroundColor: "#444",
          }}
        ></div>

        <div className="solve-right" style={{ width: `${100 - leftWidth}%` }}>
          <div className="editor-toolbar">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="cpp">🖥️ C++</option>
              <option value="python">🐍 Python</option>
              <option value="java">☕ Java</option>
            </select>
            <button onClick={handleRun} disabled={loading}>Run</button>
            <button onClick={handleSubmit} disabled={loading}>Submit</button>
          </div>

          <div className="editor-container">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(val) => setCode(val)}
            />
          </div>

          <div className="input-box">
            <h3>Custom Input:</h3>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom input here"
              onFocus={() => setCustomInput("")}
            />
          </div>

          <div className="output-box">
            <h4>Output:</h4>
            <pre>{output}</pre>
            {verdict && <p className="verdict">Verdict: {verdict}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveContestProblem;
