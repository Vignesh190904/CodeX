require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function showCourseUrls() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const courses = await Course.find({}, 'title _id topics.title topics._id topics.lessons.title topics.lessons._id').limit(5);
    
    if (courses.length === 0) {
      console.log('❌ No courses found in database');
      return;
    }

    console.log('📚 Available Courses and Correct URLs:\n');
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. Course: "${course.title}"`);
      console.log(`   Course ID: ${course._id}`);
      console.log(`   Course URL: http://localhost:3000/courses/${course._id}`);
      
      if (course.topics && course.topics.length > 0) {
        console.log(`   Topics (${course.topics.length}):`);
        
        course.topics.slice(0, 3).forEach((topic, topicIndex) => {
          console.log(`     ${topicIndex + 1}. "${topic.title}" (ID: ${topic._id})`);
          
          if (topic.lessons && topic.lessons.length > 0) {
            const firstLesson = topic.lessons[0];
            console.log(`        First Lesson: "${firstLesson.title}" (ID: ${firstLesson._id})`);
            console.log(`        Lesson URL: http://localhost:3000/courses/${course._id}/topics/${topic._id}/lessons/${firstLesson._id}`);
          }
        });
        
        if (course.topics.length > 3) {
          console.log(`     ... and ${course.topics.length - 3} more topics`);
        }
      } else {
        console.log('   ⚠️  No topics found in this course');
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

showCourseUrls();
