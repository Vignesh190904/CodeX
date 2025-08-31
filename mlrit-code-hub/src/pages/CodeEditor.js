import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import "./CodeEditor.css";

const CodeEditor = () => {
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(null);
  const [memory, setMemory] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(66.666);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Refs for cleanup and throttling
  const resizeTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      // Default code templates
      const defaultCode = {
        java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
        python: `print("Hello, World!")`,
        cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
      };
      setCode(defaultCode[language] || "");
    }
  }, [language]);

  useEffect(() => {
    localStorage.setItem(`code-${language}`, code);
  }, [code, language]);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
    
    // Initial layout call
    if (editorContainerRef.current) {
      setTimeout(() => {
        editor.layout();
      }, 0);
    }
  }, []);

  // Resize observer for dynamic resizing
  useEffect(() => {
    if (!editorContainerRef.current || !editorRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (editorRef.current) {
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            editorRef.current.layout();
          });
        }
      }
    });

    resizeObserver.observe(editorContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleWindowResize = () => {
      if (editorRef.current) {
        // Debounce window resize events
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        
        resizeTimeoutRef.current = setTimeout(() => {
          editorRef.current.layout();
        }, 100);
      }
    };

    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Dropdown state management
  const handleSelectFocus = useCallback(() => {
    setIsDropdownOpen(true);
  }, []);

  const handleSelectBlur = useCallback(() => {
    // Small delay to allow option selection
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  }, []);

  const handleLanguageChange = useCallback((e) => {
    setLanguage(e.target.value);
    setIsDropdownOpen(false);
  }, []);

  // Debounced resize function
  const debouncedResize = useCallback((newWidth) => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      setLeftPanelWidth(newWidth);
      
      // Trigger Monaco editor resize after state update
      if (editorRef.current) {
        requestAnimationFrame(() => {
          editorRef.current.layout();
        });
      }
    }, 16); // ~60fps
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;
      
      // Limit resize range (20% to 80% of container width)
      const minWidth = containerWidth * 0.2;
      const maxWidth = containerWidth * 0.8;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newLeftWidth));
      
      const leftPercentage = (clampedWidth / containerWidth) * 100;
      
      // Update resize handle position
      if (resizeHandleRef.current) {
        const resizeHandle = resizeHandleRef.current;
        resizeHandle.style.left = `calc(${leftPercentage}% - 2px)`;
      }
      
      // Debounce the state update
      debouncedResize(leftPercentage);
    });
  }, [isResizing, debouncedResize]);

  // Mouse down handler
  const handleMouseDown = useCallback((e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      e.preventDefault();
    }
  }, []);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    
    // Clear any pending operations
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Ensure editor is properly sized after resize
    if (editorRef.current) {
      requestAnimationFrame(() => {
        editorRef.current.layout();
      });
    }
  }, []);

  // Resize functionality with proper cleanup
  useEffect(() => {
    const container = containerRef.current;
    const resizeHandle = resizeHandleRef.current;

    if (!container || !resizeHandle) return;

    // Add event listeners
    document.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Clear any pending operations
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Monaco editor options for dynamic resizing
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'Fira Code', monospace",
    lineNumbers: "on",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: false, // We handle layout manually
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    wordWrap: 'on',
    wrappingStrategy: 'advanced'
  };

  const handleRunCode = async () => {
    setLoading(true);
    setOutput("");
    setTime(null);
    setMemory(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock output for demonstration
      const mockOutputs = {
        java: "Hello, World!\n",
        python: "Hello, World!\n",
        cpp: "Hello, World!\n"
      };
      
      setOutput(mockOutputs[language] || "Code executed successfully!");
      setTime(Math.floor(Math.random() * 100) + 50);
      setMemory(Math.floor(Math.random() * 1000) + 500);
    } catch (error) {
      setOutput("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="online-compiler">
      <div 
        className="compiler-body" 
        ref={containerRef}
        style={{
          gridTemplateColumns: `${leftPanelWidth}% ${100 - leftPanelWidth}%`
        }}
      >
        <div className="left-panel">
          <div className="top-bar">
            <div className="language-selector-container">
              <select 
                ref={selectRef}
                value={language} 
                onChange={handleLanguageChange}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                className={isDropdownOpen ? 'dropdown-open' : ''}
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>
              <div className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path 
                    d="M3 4.5L6 7.5L9 4.5" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <button onClick={handleRunCode} disabled={loading}>
              {loading ? "Running..." : "Run"}
            </button>
          </div>
          <div className="monaco-editor-container" ref={editorContainerRef}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(newCode) => setCode(newCode)}
              onMount={handleEditorDidMount}
              options={editorOptions}
            />
          </div>
        </div>
        
        <div 
          className="resize-handle" 
          ref={resizeHandleRef}
          style={{ left: `calc(${leftPanelWidth}% - 2px)` }}
        ></div>
        
        <div className="right-panel">
          <div className="input-area">
            <h4>Input</h4>
            <textarea
              className="input-box"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your input here..."
            />
          </div>
          <div className="output-area">
            <h4>Output</h4>
            <div className="output-box">
              {loading ? (
                <div className="loader">Compiling and running...</div>
              ) : output ? (
                <pre>{output}</pre>
              ) : (
                <span style={{ color: "var(--text-secondary)" }}>
                  Output will appear here...
                </span>
              )}
            </div>
            {(time || memory) && (
              <div className="stats">
                {time && <p>Time: {time}ms</p>}
                {memory && <p>Memory: {memory}KB</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
