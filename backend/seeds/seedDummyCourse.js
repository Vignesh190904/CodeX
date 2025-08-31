require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

(async function run() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const dummy = new Course({
      title: 'Intro to MERN (Dummy)',
      description: 'A short sample course demonstrating Topics and Lessons structure.',
      difficulty: 'Easy',
      testUnlockThreshold: 60,
      topics: [
        {
          title: 'Getting Started',
          description: 'Overview of MERN stack fundamentals',
          order: 1,
          lessons: [
            {
              title: 'What is MERN?',
              type: 'theory',
              content: 'MERN stands for MongoDB, Express, React, and Node.js. This lesson introduces the stack.',
              order: 1,
              duration: '5-10 min'
            },
            {
              title: 'First API with Express',
              type: 'theory',
              content: 'Create a minimal Express server and understand routing basics.',
              order: 2,
              duration: '5-10 min'
            }
          ],
          moduleTest: {
            totalMarks: 10,
            mcqs: [
              { question: 'MERN includes React?', options: ['Yes', 'No'], correct: 0 },
              { question: 'Node.js is used on the server?', options: ['Yes', 'No'], correct: 0 }
            ],
            codeChallenges: []
          }
        }
      ]
    });

    const saved = await dummy.save();
    console.log('Seeded dummy course with id:', saved._id.toString());
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})();
