const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

// MongoDB connection using environment variable
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mlrit-code-hub';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
    console.log(`Connected to: ${mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Full Stack Web Development Course Data (Unified Schema)
const fullStackCourseData = {
  title: "Full Stack Web Development",
  description: "A beginner-to-advanced course covering front-end, back-end, and deployment.",
  difficulty: "Medium",
  duration: "12 weeks",
  instructor: "Tech Academy",
  tags: ["web development", "javascript", "html", "css", "nodejs", "full stack"],
  isActive: true,
  enrolledCount: 0,
  enrolledUsers: [],
  testUnlockThreshold: 80,
  topics: [
    {
      title: "HTML & CSS Basics",
      description: "Learn the building blocks of web pages.",
      order: 1,
      moduleTest: {
        totalMarks: 100,
        timeLimit: 3600, // 60 minutes
        mcqs: [
          {
            question: "What does HTML stand for?",
            options: [
              "Hyper Text Markup Language",
              "High Tech Modern Language", 
              "Home Tool Markup Language",
              "Hyperlink and Text Markup Language"
            ],
            correct: 0,
            marks: 10
          },
          {
            question: "Which CSS property is used to change the text color?",
            options: ["font-color", "text-color", "color", "foreground-color"],
            correct: 2,
            marks: 10
          },
          {
            question: "What is the correct HTML element for the largest heading?",
            options: ["<heading>", "<h6>", "<h1>", "<head>"],
            correct: 2,
            marks: 10
          }
        ],
        codeChallenges: [
          {
            title: "Create a Simple HTML Page",
            description: "Write HTML code to create a basic webpage with a heading, paragraph, and a list of 3 items.",
            sampleInput: "No input required",
            sampleOutput: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Welcome</h1>
    <p>This is a paragraph.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
</body>
</html>`,
            constraints: "Must include DOCTYPE, html, head, title, body, h1, p, and ul elements",
            initialCode: "<!-- Write your HTML code here -->",
            language: "html",
            marks: 35,
            testCases: [
              {
                input: "",
                expectedOutput: "HTML structure with required elements",
                points: 35
              }
            ]
          },
          {
            title: "CSS Styling Challenge",
            description: "Write CSS to style a div element with blue background, white text, and 20px padding.",
            sampleInput: "No input required",
            sampleOutput: `div {
    background-color: blue;
    color: white;
    padding: 20px;
}`,
            constraints: "Must use background-color, color, and padding properties",
            initialCode: "/* Write your CSS code here */",
            language: "css",
            marks: 35,
            testCases: [
              {
                input: "",
                expectedOutput: "CSS with background-color: blue, color: white, padding: 20px",
                points: 35
              }
            ]
          }
        ]
      },
      lessons: [
        {
          title: "Introduction to HTML",
          type: "lesson",
          order: 1,
          duration: "45m",
          content: `
            <h2>What is HTML?</h2>
            <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a webpage using elements and tags.</p>
            
            <h3>Basic HTML Structure</h3>
            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Page Title&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Main Heading&lt;/h1&gt;
    &lt;p&gt;This is a paragraph.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

            <h3>Common HTML Elements</h3>
            <ul>
              <li><strong>Headings:</strong> &lt;h1&gt; to &lt;h6&gt;</li>
              <li><strong>Paragraphs:</strong> &lt;p&gt;</li>
              <li><strong>Links:</strong> &lt;a href="url"&gt;</li>
              <li><strong>Images:</strong> &lt;img src="url" alt="description"&gt;</li>
              <li><strong>Lists:</strong> &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</li>
            </ul>
          `,
          mcqs: [
            {
              question: "What does HTML stand for?",
              options: ["HyperText Makeup Language", "HyperText Markup Language", "Home Tool Markup Language"],
              correct: 1,
              explanation: "HTML stands for HyperText Markup Language, which is the standard markup language for creating web pages."
            },
            {
              question: "Which tag is used for the largest heading?",
              options: ["<heading>", "<h6>", "<h1>"],
              correct: 2,
              explanation: "<h1> is used for the largest heading in HTML. Headings go from <h1> (largest) to <h6> (smallest)."
            }
          ],
          codeChallenges: [
            {
              title: "Create a Basic HTML Page",
              description: "Write an HTML page with a heading, paragraph, and a link.",
              sampleInput: "",
              sampleOutput: "<h1>Hello</h1><p>Welcome</p><a href='https://example.com'>Click</a>",
              constraints: "Must use valid HTML5 syntax",
              initialCode: `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
</head>
<body>
  <!-- Add your HTML elements here -->
  
</body>
</html>`,
              language: "html",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Should contain h1, p, and a tags",
                  description: "Check for proper HTML structure"
                }
              ]
            },
            {
              title: "HTML Lists",
              description: "Create an ordered list with three items.",
              sampleInput: "",
              sampleOutput: "<ol><li>One</li><li>Two</li><li>Three</li></ol>",
              constraints: "Must use <ol> and <li> tags",
              initialCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Create your ordered list here -->
  
</body>
</html>`,
              language: "html",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Should contain ol with three li elements",
                  description: "Verify ordered list structure"
                }
              ]
            }
          ],
          review: `
            <h3>What You Learned</h3>
            <p>In this lesson, you learned:</p>
            <ul>
              <li>The basic structure of HTML documents</li>
              <li>Common HTML elements and their purposes</li>
              <li>How to create headings, paragraphs, and links</li>
              <li>The importance of semantic HTML markup</li>
            </ul>
            <p><strong>Next:</strong> You'll learn how to style these HTML elements with CSS!</p>
          `
        },
        {
          title: "CSS Fundamentals",
          type: "lesson",
          order: 2,
          duration: "50m",
          content: `
            <h2>What is CSS?</h2>
            <p>CSS (Cascading Style Sheets) is used to style and layout web pages. It controls the presentation of HTML elements.</p>
            
            <h3>CSS Syntax</h3>
            <pre><code>selector {
  property: value;
  property: value;
}</code></pre>

            <h3>Ways to Add CSS</h3>
            <ol>
              <li><strong>Inline:</strong> style="color: red;"</li>
              <li><strong>Internal:</strong> &lt;style&gt; in &lt;head&gt;</li>
              <li><strong>External:</strong> &lt;link&gt; to .css file</li>
            </ol>

            <h3>Common CSS Properties</h3>
            <ul>
              <li><strong>color:</strong> Text color</li>
              <li><strong>background-color:</strong> Background color</li>
              <li><strong>font-size:</strong> Text size</li>
              <li><strong>font-weight:</strong> Text boldness</li>
              <li><strong>margin:</strong> Space outside element</li>
              <li><strong>padding:</strong> Space inside element</li>
            </ul>
          `,
          mcqs: [
            {
              question: "Which property changes text color in CSS?",
              options: ["font-color", "color", "text-color"],
              correct: 1,
              explanation: "The 'color' property changes text color in CSS. It's one of the most basic CSS properties."
            },
            {
              question: "Which CSS property controls the size of text?",
              options: ["font-style", "font-size", "text-size"],
              correct: 1,
              explanation: "'font-size' sets the size of text. You can use values like pixels (px), em, rem, or percentages."
            }
          ],
          codeChallenges: [
            {
              title: "Change Background Color",
              description: "Set the background color of a div to blue.",
              sampleInput: "",
              sampleOutput: "<div style='background-color:blue;'></div>",
              constraints: "Use CSS background-color property",
              initialCode: `<div>This is a div</div>

<style>
/* Add your CSS here */

</style>`,
              language: "css",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Div should have blue background",
                  description: "Check background-color property"
                }
              ]
            },
            {
              title: "Text Styling",
              description: "Change paragraph text to red and bold.",
              sampleInput: "",
              sampleOutput: "<p style='color:red;font-weight:bold;'>Text</p>",
              constraints: "Use CSS color and font-weight properties",
              initialCode: `<p>This is some text</p>

<style>
/* Add your CSS here */

</style>`,
              language: "css",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Text should be red and bold",
                  description: "Check color and font-weight properties"
                }
              ]
            }
          ],
          review: `
            <h3>What You Learned</h3>
            <p>In this lesson, you learned:</p>
            <ul>
              <li>The purpose and syntax of CSS</li>
              <li>Different ways to include CSS in your HTML</li>
              <li>Common CSS properties for styling text and backgrounds</li>
              <li>How to apply styles to HTML elements</li>
            </ul>
            <p><strong>Next:</strong> You'll dive into JavaScript to add interactivity!</p>
          `
        }
      ]
    },
    {
      title: "JavaScript Essentials",
      description: "Learn JavaScript fundamentals for web interactivity.",
      order: 2,
      moduleTest: {
        totalMarks: 100,
        timeLimit: 3600, // 60 minutes
        mcqs: [
          {
            question: "Which of the following is the correct way to declare a variable in JavaScript?",
            options: ["variable x = 5;", "let x = 5;", "declare x = 5;", "x := 5;"],
            correct: 1,
            marks: 10
          },
          {
            question: "What is the output of: console.log(typeof null)?",
            options: ["null", "undefined", "object", "string"],
            correct: 2,
            marks: 10
          },
          {
            question: "Which method is used to add an element to the end of an array?",
            options: ["append()", "push()", "add()", "insert()"],
            correct: 1,
            marks: 10
          }
        ],
        codeChallenges: [
          {
            title: "Sum of Two Numbers",
            description: "Write a function that takes two numbers as parameters and returns their sum.",
            sampleInput: "addNumbers(5, 3)",
            sampleOutput: "8",
            constraints: "Function must be named 'addNumbers' and take exactly 2 parameters",
            initialCode: "function addNumbers(a, b) {\n    // Write your code here\n}",
            language: "javascript",
            marks: 35,
            testCases: [
              {
                input: "addNumbers(5, 3)",
                expectedOutput: "8",
                points: 15
              },
              {
                input: "addNumbers(-2, 7)",
                expectedOutput: "5",
                points: 10
              },
              {
                input: "addNumbers(0, 0)",
                expectedOutput: "0",
                points: 10
              }
            ]
          },
          {
            title: "Array Filter Challenge",
            description: "Write a function that filters an array to return only even numbers.",
            sampleInput: "filterEven([1, 2, 3, 4, 5, 6])",
            sampleOutput: "[2, 4, 6]",
            constraints: "Function must be named 'filterEven' and return an array",
            initialCode: "function filterEven(numbers) {\n    // Write your code here\n}",
            language: "javascript",
            marks: 35,
            testCases: [
              {
                input: "filterEven([1, 2, 3, 4, 5, 6])",
                expectedOutput: "[2, 4, 6]",
                points: 20
              },
              {
                input: "filterEven([1, 3, 5])",
                expectedOutput: "[]",
                points: 15
              }
            ]
          }
        ]
      },
      lessons: [
        {
          title: "Variables and Data Types",
          type: "lesson",
          order: 1,
          duration: "40m",
          content: `
            <h2>JavaScript Variables</h2>
            <p>JavaScript variables store data values. They are containers for storing information that can be used and manipulated throughout your program.</p>
            
            <h3>Variable Declaration</h3>
            <pre><code>// ES6+ (recommended)
let name = "John";
const age = 25;

// Older syntax
var city = "New York";</code></pre>

            <h3>Data Types</h3>
            <ul>
              <li><strong>String:</strong> "Hello World", 'JavaScript'</li>
              <li><strong>Number:</strong> 42, 3.14, -10</li>
              <li><strong>Boolean:</strong> true, false</li>
              <li><strong>Array:</strong> [1, 2, 3], ["a", "b", "c"]</li>
              <li><strong>Object:</strong> {name: "John", age: 25}</li>
              <li><strong>Undefined:</strong> Variable declared but not assigned</li>
              <li><strong>Null:</strong> Intentionally empty value</li>
            </ul>

            <h3>Variable Scope</h3>
            <ul>
              <li><strong>let:</strong> Block-scoped, can be reassigned</li>
              <li><strong>const:</strong> Block-scoped, cannot be reassigned</li>
              <li><strong>var:</strong> Function-scoped (avoid in modern JS)</li>
            </ul>
          `,
          mcqs: [
            {
              question: "Which keyword declares a block-scoped variable that can be reassigned?",
              options: ["var", "let", "const"],
              correct: 1,
              explanation: "'let' declares a block-scoped variable that can be reassigned. 'const' cannot be reassigned, and 'var' is function-scoped."
            },
            {
              question: "What is the data type of '42' (with quotes)?",
              options: ["number", "string", "boolean"],
              correct: 1,
              explanation: "'42' with quotes is a string. Without quotes, 42 would be a number."
            }
          ],
          codeChallenges: [
            {
              title: "Declare a Variable",
              description: "Declare a variable named x with value 10 and log it to console.",
              sampleInput: "",
              sampleOutput: "10",
              constraints: "Use let or const keyword",
              initialCode: `// Declare your variable here


// Log the variable to console
console.log(x);`,
              language: "javascript",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "10",
                  description: "Variable x should equal 10"
                }
              ]
            },
            {
              title: "String Concatenation",
              description: "Concatenate two strings 'Hello' and 'World' and store in a variable.",
              sampleInput: "",
              sampleOutput: "HelloWorld",
              constraints: "Use + operator for concatenation",
              initialCode: `// Create two string variables
let str1 = "Hello";
let str2 = "World";

// Concatenate them


console.log(result);`,
              language: "javascript",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "HelloWorld",
                  description: "Should concatenate strings without space"
                }
              ]
            }
          ],
          review: `
            <h3>What You Learned</h3>
            <p>In this lesson, you learned:</p>
            <ul>
              <li>How to declare variables using let, const, and var</li>
              <li>Different JavaScript data types and their uses</li>
              <li>The concept of variable scope and when to use each keyword</li>
              <li>Basic string operations and concatenation</li>
            </ul>
            <p><strong>Next:</strong> You'll learn about functions and control structures in JavaScript!</p>
          `
        }
      ]
    },
    {
      title: "Node.js & Backend",
      description: "Learn to build server-side applications with Node.js and Express.",
      order: 3,
      lessons: [
        {
          title: "Intro to Node.js",
          type: "lesson",
          order: 1,
          duration: "60m",
          content: `
            <h2>What is Node.js?</h2>
            <p>Node.js is a runtime environment that allows JavaScript to run on the server side. It's built on Chrome's V8 JavaScript engine and enables full-stack JavaScript development.</p>
            
            <h3>Key Features</h3>
            <ul>
              <li><strong>Asynchronous & Non-blocking:</strong> Handles multiple requests efficiently</li>
              <li><strong>NPM:</strong> Vast package ecosystem</li>
              <li><strong>Cross-platform:</strong> Runs on Windows, macOS, Linux</li>
              <li><strong>Fast:</strong> Built on V8 engine</li>
            </ul>

            <h3>Core Modules</h3>
            <pre><code>// HTTP module for creating servers
const http = require('http');

// File System module for file operations
const fs = require('fs');

// Path module for working with file paths
const path = require('path');</code></pre>

            <h3>Creating a Simple Server</h3>
            <pre><code>const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});</code></pre>

            <h3>Package Management</h3>
            <ul>
              <li><strong>npm init:</strong> Initialize a new project</li>
              <li><strong>npm install:</strong> Install packages</li>
              <li><strong>package.json:</strong> Project configuration</li>
            </ul>
          `,
          mcqs: [
            {
              question: "Which command initializes a new Node.js project?",
              options: ["node init", "npm init", "init node"],
              correct: 1,
              explanation: "'npm init' initializes a new Node.js project and creates a package.json file with project metadata."
            },
            {
              question: "Which built-in module is used for creating an HTTP server?",
              options: ["http", "server", "fs"],
              correct: 0,
              explanation: "The 'http' module is Node.js's built-in module for creating HTTP servers and handling HTTP requests/responses."
            }
          ],
          codeChallenges: [
            {
              title: "Hello World Server",
              description: "Create an HTTP server that responds with 'Hello World' on port 3000.",
              sampleInput: "",
              sampleOutput: "Hello World",
              constraints: "Use the http module and listen on port 3000",
              initialCode: `const http = require('http');

// Create your server here


// Make the server listen on port 3000
`,
              language: "javascript",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Hello World",
                  description: "Server should respond with 'Hello World'"
                }
              ]
            },
            {
              title: "Read File",
              description: "Use the fs module to read a file called 'data.txt' and log its content.",
              sampleInput: "",
              sampleOutput: "File content here",
              constraints: "Use fs.readFile() method",
              initialCode: `const fs = require('fs');

// Read the file 'data.txt' and log its content

`,
              language: "javascript",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "File content should be logged",
                  description: "Should read and display file content"
                }
              ]
            }
          ],
          review: `
            <h3>What You Learned</h3>
            <p>In this lesson, you learned:</p>
            <ul>
              <li>What Node.js is and its key features</li>
              <li>Core Node.js modules like http and fs</li>
              <li>How to create a basic HTTP server</li>
              <li>Package management with npm</li>
              <li>File operations using the fs module</li>
            </ul>
            <p><strong>Next:</strong> You'll learn about Express.js framework and building REST APIs!</p>
          `
        }
      ]
    }
  ],
  finalExam: {
    title: "Full Stack Web Development - Final Assessment",
    description: "Comprehensive final exam covering HTML, CSS, JavaScript, Node.js, and full-stack development concepts. This secure assessment tests your complete understanding of web development fundamentals.",
    mcqs: [
      {
        question: "What is the correct HTML5 doctype declaration?",
        options: ["<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<html5>", "<!HTML5>"],
        correct: 0,
        explanation: "<!DOCTYPE html> is the correct and simplified doctype for HTML5 documents."
      },
      {
        question: "Which CSS property is used to make text bold?",
        options: ["font-style", "text-weight", "font-weight", "bold"],
        correct: 2,
        explanation: "font-weight property controls the boldness of text, with values like bold, normal, or numeric values."
      },
      {
        question: "What does 'let' keyword do in JavaScript?",
        options: ["Declares a constant", "Declares a block-scoped variable", "Declares a global variable", "Declares a function"],
        correct: 1,
        explanation: "'let' declares a block-scoped variable that can be reassigned, introduced in ES6."
      },
      {
        question: "Which method adds an element to the end of an array in JavaScript?",
        options: ["append()", "add()", "push()", "insert()"],
        correct: 2,
        explanation: "push() method adds one or more elements to the end of an array and returns the new length."
      },
      {
        question: "What is the purpose of the 'async' keyword in JavaScript?",
        options: ["Makes function synchronous", "Declares an asynchronous function", "Handles errors", "Creates a promise"],
        correct: 1,
        explanation: "'async' keyword declares an asynchronous function that returns a Promise."
      },
      {
        question: "Which Node.js module is used for file system operations?",
        options: ["http", "fs", "path", "url"],
        correct: 1,
        explanation: "The 'fs' (file system) module provides APIs for interacting with the file system."
      },
      {
        question: "What does npm stand for?",
        options: ["Node Package Manager", "New Programming Method", "Network Protocol Manager", "Node Program Manager"],
        correct: 0,
        explanation: "npm stands for Node Package Manager, the default package manager for Node.js."
      },
      {
        question: "Which HTTP status code indicates a successful request?",
        options: ["404", "500", "200", "301"],
        correct: 2,
        explanation: "HTTP status code 200 indicates that the request was successful."
      },
      {
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: ["No difference", "=== checks type and value, == only value", "== is faster", "=== is deprecated"],
        correct: 1,
        explanation: "=== (strict equality) checks both type and value, while == (loose equality) performs type coercion."
      },
      {
        question: "Which CSS selector has the highest specificity?",
        options: ["Element selector", "Class selector", "ID selector", "Universal selector"],
        correct: 2,
        explanation: "ID selectors have higher specificity than class selectors, which have higher specificity than element selectors."
      },
      {
        question: "What is the purpose of Express.js middleware?",
        options: ["Database connection", "Request/response processing", "File compression", "User authentication only"],
        correct: 1,
        explanation: "Middleware functions execute during the request-response cycle and can modify req/res objects or end the cycle."
      },
      {
        question: "Which method is used to parse JSON in JavaScript?",
        options: ["JSON.parse()", "JSON.stringify()", "parseJSON()", "toJSON()"],
        correct: 0,
        explanation: "JSON.parse() converts a JSON string into a JavaScript object."
      }
    ],
    codeChallenges: [
      {
        title: "Full Stack Todo API",
        description: "Create a complete Express.js API endpoint for managing todos. Implement GET /api/todos to return all todos, and POST /api/todos to create a new todo. Include proper error handling and JSON responses.",
        sampleInput: "GET /api/todos\nPOST /api/todos with {title: 'Learn React', completed: false}",
        sampleOutput: "GET: [{id: 1, title: 'Learn React', completed: false}]\nPOST: {id: 2, title: 'Learn React', completed: false, created: '2024-01-01'}",
        constraints: "Use Express.js, implement both GET and POST routes, include error handling, return proper JSON responses",
        initialCode: "const express = require('express');\nconst app = express();\n\n// Middleware for parsing JSON\napp.use(express.json());\n\n// In-memory storage (for demo purposes)\nlet todos = [\n  { id: 1, title: 'Learn HTML', completed: true, created: new Date().toISOString() }\n];\nlet nextId = 2;\n\n// Implement your routes here\n// GET /api/todos - return all todos\n// POST /api/todos - create new todo\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000');\n});",
        language: "javascript",
        testCases: [
          {
            input: "GET /api/todos",
            expectedOutput: "Array of todos with proper structure",
            isHidden: false
          },
          {
            input: "POST /api/todos {title: 'New Task'}",
            expectedOutput: "Created todo with generated ID and timestamp",
            isHidden: false
          },
          {
            input: "POST /api/todos {}",
            expectedOutput: "Error response for missing title",
            isHidden: true
          }
        ]
      },
      {
        title: "DOM Manipulation Challenge",
        description: "Create a JavaScript function that dynamically generates an HTML todo list. The function should take an array of todo objects and create a complete HTML structure with proper styling classes and event handlers.",
        sampleInput: "[{id: 1, title: 'Learn JS', completed: false}, {id: 2, title: 'Build App', completed: true}]",
        sampleOutput: "Complete HTML structure with ul, li elements, proper classes, and click handlers",
        constraints: "Use vanilla JavaScript, create proper HTML structure, add event listeners, handle completed state",
        initialCode: "// Function to render todo list\nfunction renderTodoList(todos) {\n  // Create the main container\n  const container = document.createElement('div');\n  container.className = 'todo-container';\n  \n  // Create the list\n  const list = document.createElement('ul');\n  list.className = 'todo-list';\n  \n  // Your code here: \n  // 1. Loop through todos array\n  // 2. Create li elements for each todo\n  // 3. Add proper classes based on completed state\n  // 4. Add click event listeners\n  // 5. Append to list\n  \n  container.appendChild(list);\n  return container;\n}\n\n// Function to toggle todo completion\nfunction toggleTodo(todoId) {\n  // Your code here: implement toggle functionality\n}\n\n// Example usage:\n// const todos = [{id: 1, title: 'Learn JS', completed: false}];\n// const todoList = renderTodoList(todos);\n// document.body.appendChild(todoList);",
        language: "javascript",
        testCases: [
          {
            input: "[{id: 1, title: 'Test', completed: false}]",
            expectedOutput: "HTML structure with ul and li elements",
            isHidden: false
          },
          {
            input: "[{id: 1, title: 'Done', completed: true}]",
            expectedOutput: "Li element should have completed class",
            isHidden: false
          },
          {
            input: "[]",
            expectedOutput: "Empty list should render without errors",
            isHidden: true
          }
        ]
      },
      {
        title: "Async Data Processing",
        description: "Implement an async function that fetches user data from multiple APIs, processes the data, and returns a combined result. Handle errors gracefully and implement proper async/await patterns.",
        sampleInput: "processUserData([1, 2, 3])",
        sampleOutput: "[{id: 1, name: 'John', posts: 5, processed: true}, ...]",
        constraints: "Use async/await, handle errors with try-catch, process data from multiple sources, return combined results",
        initialCode: "// Simulate API calls (don't modify these)\nfunction fetchUser(id) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (id > 0) {\n        resolve({ id, name: \`User\${id}\`, email: \`user\${id}@example.com\` });\n      } else {\n        reject(new Error('Invalid user ID'));\n      }\n    }, Math.random() * 100);\n  });\n}\n\nfunction fetchUserPosts(userId) {\n  return new Promise((resolve) => {\n    setTimeout(() => {\n      resolve({ userId, posts: Math.floor(Math.random() * 10) + 1 });\n    }, Math.random() * 100);\n  });\n}\n\n// Your implementation here:\nasync function processUserData(userIds) {\n  // Your code here:\n  // 1. Fetch user data for each ID\n  // 2. Fetch posts count for each user\n  // 3. Combine the data\n  // 4. Handle errors gracefully\n  // 5. Return processed results\n  \n  try {\n    // Implement your solution here\n    \n  } catch (error) {\n    console.error('Error processing user data:', error);\n    return [];\n  }\n}\n\n// Example usage:\n// processUserData([1, 2, 3]).then(result => console.log(result));",
        language: "javascript",
        testCases: [
          {
            input: "processUserData([1, 2])",
            expectedOutput: "Array of processed user objects with combined data",
            isHidden: false
          },
          {
            input: "processUserData([0, -1])",
            expectedOutput: "Should handle errors and return appropriate result",
            isHidden: true
          },
          {
            input: "processUserData([])",
            expectedOutput: "Empty array should return empty result",
            isHidden: false
          }
        ]
      }
    ],
    totalMarks: 1000,
    duration: 120, // 2 hours
    passingScore: 70,
    isSecure: true,
    securitySettings: {
      preventCopyPaste: true,
      preventTabSwitch: true,
      preventRightClick: true,
      fullScreenRequired: true,
      webcamMonitoring: false,
      timeLimit: 120
    },
    isActive: true
  }
};

// Function to seed the Full Stack Web Development course
const seedFullStackCourse = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if course already exists
    const existingCourse = await Course.findOne({ title: fullStackCourseData.title });
    
    if (existingCourse) {
      console.log('Full Stack Web Development course already exists. Updating...');
      
      // Update existing course
      const updatedCourse = await Course.findByIdAndUpdate(
        existingCourse._id,
        fullStackCourseData,
        { new: true, runValidators: true }
      );
      
      console.log('✅ Full Stack Web Development course updated successfully!');
      console.log(`Course ID: ${updatedCourse._id}`);
      console.log(`Topics: ${updatedCourse.topics.length}`);
      console.log(`Total Lessons: ${updatedCourse.topics.reduce((acc, topic) => acc + topic.lessons.length, 0)}`);
      console.log(`Final Exam: ${updatedCourse.finalExam ? '✅ Configured' : '❌ Missing'}`);
      if (updatedCourse.finalExam) {
        console.log(`  - MCQs: ${updatedCourse.finalExam.mcqs?.length || 0}`);
        console.log(`  - Coding Challenges: ${updatedCourse.finalExam.codeChallenges?.length || 0}`);
        console.log(`  - Duration: ${updatedCourse.finalExam.duration} minutes`);
        console.log(`  - Security: ${updatedCourse.finalExam.isSecure ? 'Enabled' : 'Disabled'}`);
      }
      
    } else {
      // Create new course
      const newCourse = new Course(fullStackCourseData);
      const savedCourse = await newCourse.save();
      
      console.log('✅ Full Stack Web Development course created successfully!');
      console.log(`Course ID: ${savedCourse._id}`);
      console.log(`Topics: ${savedCourse.topics.length}`);
      console.log(`Total Lessons: ${savedCourse.topics.reduce((acc, topic) => acc + topic.lessons.length, 0)}`);
      console.log(`Final Exam: ${savedCourse.finalExam ? '✅ Configured' : '❌ Missing'}`);
      if (savedCourse.finalExam) {
        console.log(`  - MCQs: ${savedCourse.finalExam.mcqs?.length || 0}`);
        console.log(`  - Coding Challenges: ${savedCourse.finalExam.codeChallenges?.length || 0}`);
        console.log(`  - Duration: ${savedCourse.finalExam.duration} minutes`);
        console.log(`  - Security: ${savedCourse.finalExam.isSecure ? 'Enabled' : 'Disabled'}`);
      }
    }

    // Verify the course structure
    const course = await Course.findOne({ title: fullStackCourseData.title });
    console.log('\n📊 Course Structure Verification:');
    
    course.topics.forEach((topic, topicIndex) => {
      console.log(`\nTopic ${topicIndex + 1}: ${topic.title}`);
      topic.lessons.forEach((lesson, lessonIndex) => {
        console.log(`  Lesson ${lessonIndex + 1}: ${lesson.title}`);
        console.log(`    - Content: ${lesson.content ? '✅' : '❌'}`);
        console.log(`    - MCQs: ${lesson.mcqs?.length === 2 ? '✅ (2)' : `❌ (${lesson.mcqs?.length || 0})`}`);
        console.log(`    - Coding Challenges: ${lesson.codeChallenges?.length === 2 ? '✅ (2)' : `❌ (${lesson.codeChallenges?.length || 0})`}`);
        console.log(`    - Review: ${lesson.review ? '✅' : '❌'}`);
      });
    });

    console.log('\n🎉 Full Stack Web Development course is ready for students!');
    
  } catch (error) {
    console.error('❌ Error seeding Full Stack Web Development course:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the seeding function
if (require.main === module) {
  seedFullStackCourse();
}

module.exports = { seedFullStackCourse, fullStackCourseData };
