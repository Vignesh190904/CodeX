require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

const pythonCourseData = {
  "title": "Python Programming Fundamentals",
  "description": "Master the fundamentals of Python programming through hands-on exercises and real-world projects. Learn from basic syntax to advanced concepts.",
  "difficulty": "Medium",
  "testUnlockThreshold": 80,
  "enrolledUsers": [],
  "enrolledCount": 0,
  "isActive": true,
  "topics": [
    {
      "title": "Output / Print in Python",
      "description": "Learn how to make Python print whatever you want, and learn to use it as a basic calculator.",
      "order": 1,
      "lessons": [
        {
          "title": "Introducing output / printing",
          "type": "theory",
          "content": "The print() function is one of the most fundamental functions in Python. It allows you to display output on the screen. This is essential for debugging, showing results, and communicating with users.\n\n## Basic Syntax\n```python\nprint(\"Hello, World!\")\n```\n\nThe print function can display:\n- Text (strings)\n- Numbers\n- Variables\n- Multiple items at once\n\n## Examples:\n```python\nprint(\"Welcome to Python!\")\nprint(42)\nprint(3.14)\n```",
          "review": "Remember: print() is used to display output. Always use parentheses and quotes for text.",
          "order": 1,
          "duration": "10-15 min"
        },
        {
          "title": "Printing on multiple lines",
          "type": "theory",
          "content": "You can print on multiple lines in several ways:\n\n## Method 1: Multiple print statements\n```python\nprint(\"Line 1\")\nprint(\"Line 2\")\nprint(\"Line 3\")\n```\n\n## Method 2: Using \\n (newline character)\n```python\nprint(\"Line 1\\nLine 2\\nLine 3\")\n```\n\n## Method 3: Triple quotes for multi-line strings\n```python\nprint(\"\"\"Line 1\nLine 2\nLine 3\"\"\")\n```",
          "review": "Use \\n for new lines within a single print statement, or use multiple print() calls.",
          "order": 2,
          "duration": "8-12 min"
        },
        {
          "title": "Print text and numbers using single print",
          "type": "theory",
          "content": "You can print multiple items in a single print statement:\n\n## Separating with commas\n```python\nprint(\"My age is\", 25)\nprint(\"Price:\", \"$\", 19.99)\n```\n\n## Using f-strings (formatted strings)\n```python\nage = 25\nprint(f\"My age is {age}\")\n\nname = \"Alice\"\nscore = 95.5\nprint(f\"{name} scored {score}%\")\n```\n\n## Using .format() method\n```python\nprint(\"My name is {} and I am {} years old\".format(\"Bob\", 30))\n```",
          "review": "Combine text and numbers using commas, f-strings, or .format() method.",
          "order": 3,
          "duration": "12-18 min"
        },
        {
          "title": "Practice Exercises",
          "type": "mcq",
          "mcqs": [
            {
              "question": "What is the correct way to print 'Hello World' in Python?",
              "options": [
                "print Hello World",
                "print('Hello World')",
                "echo 'Hello World'",
                "console.log('Hello World')"
              ],
              "correct": 1,
              "explanation": "In Python, we use print() function with parentheses and quotes around text strings."
            },
            {
              "question": "Which character is used to create a new line in Python strings?",
              "options": [
                "\\t",
                "\\r",
                "\\n",
                "\\b"
              ],
              "correct": 2,
              "explanation": "\\n is the newline character that moves the cursor to the next line."
            }
          ],
          "order": 4,
          "duration": "5-8 min"
        }
      ],
      "moduleTest": {
        "mcqs": [
          {
            "question": "What will be the output of: print('Hello', 'World', sep='-')?",
            "options": [
              "Hello World",
              "Hello-World",
              "HelloWorld",
              "Hello,World"
            ],
            "correct": 1,
            "explanation": "The sep parameter in print() specifies the separator between multiple arguments."
          },
          {
            "question": "Which of these will print numbers and text together correctly?",
            "options": [
              "print('Score: ' + 85)",
              "print('Score:', 85)",
              "print('Score: ', 85)",
              "Both B and C"
            ],
            "correct": 3,
            "explanation": "Both comma separation and space-comma work for mixing text and numbers in print()."
          }
        ],
        "codeChallenges": [
          {
            "title": "Hello Python",
            "description": "Write a program that prints your name and age on separate lines.",
            "sampleInput": "No input required",
            "sampleOutput": "John Doe\n25",
            "constraints": "Use exactly two print statements",
            "initialCode": "# Write your code here\nname = \"Your Name\"\nage = 0\n\n# Print name and age on separate lines",
            "language": "python",
            "testCases": [
              {
                "input": "",
                "expectedOutput": "John Doe\n25",
                "isHidden": false
              }
            ]
          }
        ],
        "totalMarks": 800
      }
    },
    {
      "title": "Variables and datatypes",
      "description": "Learn how to make Python store data and manipulate them",
      "order": 2,
      "lessons": [
        {
          "title": "Introduction to variables and datatypes",
          "type": "theory",
          "content": "Variables are containers that store data values. Python has several built-in data types:\n\n## Creating Variables\n```python\nname = \"Alice\"        # String\nage = 25             # Integer\nheight = 5.8         # Float\nis_student = True    # Boolean\n```\n\n## Basic Data Types:\n1. **String (str)**: Text data\n2. **Integer (int)**: Whole numbers\n3. **Float (float)**: Decimal numbers\n4. **Boolean (bool)**: True or False\n\n## Checking Data Type\n```python\nprint(type(name))     # <class 'str'>\nprint(type(age))      # <class 'int'>\n```",
          "review": "Variables store data. Use type() to check data type. Python automatically determines the type.",
          "order": 1,
          "duration": "15-20 min"
        },
        {
          "title": "Boolean data type and negative numbers",
          "type": "theory",
          "content": "## Boolean Data Type\nBooleans represent True or False values:\n```python\nis_active = True\nis_complete = False\nresult = 5 > 3       # True\ncheck = 10 < 5       # False\n```\n\n## Negative Numbers\nPython supports negative integers and floats:\n```python\ntemperature = -15\nbalance = -250.75\ndebt = -1000\n```\n\n## Boolean Conversion\n```python\nprint(bool(1))       # True\nprint(bool(0))       # False\nprint(bool(-5))      # True\nprint(bool(\"\"))     # False\nprint(bool(\"text\")) # True\n```",
          "review": "Booleans are True/False. Negative numbers are allowed. Empty values convert to False.",
          "order": 2,
          "duration": "12-15 min"
        },
        {
          "title": "Quiz on variables",
          "type": "mcq",
          "mcqs": [
            {
              "question": "Which is a valid variable name in Python?",
              "options": [
                "2name",
                "name-2",
                "name_2",
                "name 2"
              ],
              "correct": 2,
              "explanation": "Variable names can contain letters, numbers, and underscores, but cannot start with a number or contain spaces/hyphens."
            },
            {
              "question": "What data type is the value True?",
              "options": [
                "string",
                "integer",
                "boolean",
                "float"
              ],
              "correct": 2,
              "explanation": "True and False are boolean values in Python."
            }
          ],
          "order": 3,
          "duration": "8-10 min"
        },
        {
          "title": "Type conversion",
          "type": "theory",
          "content": "Type conversion allows you to change data from one type to another:\n\n## Converting to Integer\n```python\nage_str = \"25\"\nage_int = int(age_str)    # Convert string to int\nprint(age_int + 5)        # 30\n```\n\n## Converting to Float\n```python\nprice = \"19.99\"\nprice_float = float(price)  # Convert to float\n```\n\n## Converting to String\n```python\nnumber = 42\nnumber_str = str(number)    # Convert to string\nprint(\"The answer is \" + number_str)\n```\n\n## Converting to Boolean\n```python\nprint(bool(1))      # True\nprint(bool(0))      # False\n```",
          "review": "Use int(), float(), str(), bool() functions to convert between data types.",
          "order": 4,
          "duration": "10-15 min"
        }
      ],
      "moduleTest": {
        "mcqs": [
          {
            "question": "What will be the result of: int('3.14')?",
            "options": [
              "3.14",
              "3",
              "Error",
              "314"
            ],
            "correct": 2,
            "explanation": "int() cannot directly convert a string with decimal point. You'd need float('3.14') first, then int()."
          }
        ],
        "codeChallenges": [
          {
            "title": "Age Calculator",
            "description": "Create variables for birth year and current year, then calculate and print the age.",
            "sampleInput": "No input required",
            "sampleOutput": "Your age is: 25",
            "constraints": "Use variables and arithmetic operation",
            "initialCode": "# Create variables for birth year and current year\nbirth_year = 1998\ncurrent_year = 2023\n\n# Calculate age and print result",
            "language": "python",
            "testCases": [
              {
                "input": "",
                "expectedOutput": "Your age is: 25",
                "isHidden": false
              }
            ]
          }
        ],
        "totalMarks": 700
      }
    },
    {
      "title": "Operators",
      "description": "Master arithmetic, comparison and logical operators in Python",
      "order": 3,
      "lessons": [
        {
          "title": "Arithmetic Operators",
          "type": "theory",
          "content": "Arithmetic operators perform mathematical operations:\n\n## Basic Operators\n```python\na = 10\nb = 3\n\nprint(a + b)    # Addition: 13\nprint(a - b)    # Subtraction: 7\nprint(a * b)    # Multiplication: 30\nprint(a / b)    # Division: 3.333...\nprint(a // b)   # Floor division: 3\nprint(a % b)    # Modulus (remainder): 1\nprint(a ** b)   # Exponentiation: 1000\n```\n\n## Order of Operations\nPython follows PEMDAS/BODMAS:\n```python\nresult = 2 + 3 * 4      # 14 (not 20)\nresult = (2 + 3) * 4    # 20\n```",
          "review": "Use +, -, *, / for basic math. Use // for integer division, % for remainder, ** for power.",
          "order": 1,
          "duration": "12-18 min"
        },
        {
          "title": "Comparison Operators",
          "type": "theory",
          "content": "Comparison operators compare values and return True or False:\n\n## Comparison Operators\n```python\na = 10\nb = 5\n\nprint(a > b)     # Greater than: True\nprint(a < b)     # Less than: False\nprint(a >= b)    # Greater than or equal: True\nprint(a <= b)    # Less than or equal: False\nprint(a == b)    # Equal to: False\nprint(a != b)    # Not equal to: True\n```\n\n## String Comparison\n```python\nname1 = \"Alice\"\nname2 = \"Bob\"\nprint(name1 == name2)    # False\nprint(name1 < name2)     # True (alphabetical)\n```",
          "review": "Comparison operators return boolean values. Use == for equality, not =.",
          "order": 2,
          "duration": "10-15 min"
        },
        {
          "title": "Logical Operators",
          "type": "theory",
          "content": "Logical operators combine boolean expressions:\n\n## Logical Operators\n```python\na = True\nb = False\n\nprint(a and b)    # AND: False\nprint(a or b)     # OR: True\nprint(not a)      # NOT: False\nprint(not b)      # NOT: True\n```\n\n## Combining Conditions\n```python\nage = 25\nincome = 50000\n\n# Check if eligible for loan\neligible = age >= 18 and income > 30000\nprint(eligible)   # True\n\n# Check multiple conditions\nstatus = age < 18 or income < 20000 or not eligible\n```",
          "review": "Use 'and', 'or', 'not' for logical operations. 'and' needs both true, 'or' needs one true.",
          "order": 3,
          "duration": "12-15 min"
        }
      ],
      "moduleTest": {
        "mcqs": [
          {
            "question": "What is the result of 17 % 5 in Python?",
            "options": [
              "3",
              "2",
              "3.4",
              "0"
            ],
            "correct": 1,
            "explanation": "The modulus operator % returns the remainder of division. 17 ÷ 5 = 3 remainder 2."
          }
        ],
        "totalMarks": 600
      }
    }
  ]
};

async function seedPythonCourse() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment variables');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing Python course if any
    const deleteResult = await Course.deleteMany({ 
      title: "Python Programming Fundamentals" 
    });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing Python courses`);

    // Create new Python course
    const pythonCourse = new Course(pythonCourseData);
    const savedCourse = await pythonCourse.save();
    
    console.log('🎉 Python Programming Fundamentals course created successfully!');
    console.log(`📚 Course ID: ${savedCourse._id}`);
    console.log(`📖 Topics: ${savedCourse.topics.length}`);
    
    // Log topic and lesson details
    savedCourse.topics.forEach((topic, index) => {
      console.log(`   ${index + 1}. ${topic.title} (${topic.lessons.length} lessons)`);
      topic.lessons.forEach((lesson, lessonIndex) => {
        console.log(`      ${lessonIndex + 1}. ${lesson.title} (${lesson.type})`);
      });
    });

    console.log('\n🔗 Sample URLs for testing:');
    if (savedCourse.topics.length > 0) {
      const firstTopic = savedCourse.topics[0];
      if (firstTopic.lessons.length > 0) {
        const firstLesson = firstTopic.lessons[0];
        console.log(`   Course: /courses/${savedCourse._id}`);
        console.log(`   First Lesson: /courses/${savedCourse._id}/topics/${firstTopic._id}/lessons/${firstLesson._id}`);
      }
    }

  } catch (error) {
    console.error('❌ Error seeding Python course:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedPythonCourse();
