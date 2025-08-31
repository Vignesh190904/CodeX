const mongoose = require('mongoose');
const Course = require('../models/Course');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mlrit-code-hub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to delete all courses
const deleteAllCourses = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get count of existing courses before deletion
    const courseCount = await Course.countDocuments();
    console.log(`📊 Found ${courseCount} courses in the database`);

    if (courseCount === 0) {
      console.log('✅ No courses found. Database is already clean.');
      return;
    }

    // List all courses before deletion
    const courses = await Course.find({}, 'title description difficulty enrolledCount');
    console.log('\n📋 Courses to be deleted:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.difficulty}) - ${course.enrolledCount || 0} enrolled`);
    });

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete ALL courses from the database!');
    console.log('🗑️  Proceeding with deletion...');

    // Delete all courses
    const deleteResult = await Course.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${deleteResult.deletedCount} courses`);
    
    // Verify deletion
    const remainingCount = await Course.countDocuments();
    console.log(`📊 Remaining courses: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('🎉 All courses have been successfully removed from the database!');
    } else {
      console.log('⚠️  Some courses may still remain. Please check manually.');
    }

    // Optional: Also clear any related collections if needed
    console.log('\n📝 Note: User progress and enrollment data may still reference deleted courses.');
    console.log('Consider running cleanup scripts for related collections if needed.');

  } catch (error) {
    console.error('❌ Error deleting courses:', error);
    
    if (error.name === 'MongoNetworkError') {
      console.error('💡 Make sure MongoDB is running and accessible.');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
};

// Function to delete courses by criteria (optional)
const deleteCoursesBy = async (criteria = {}) => {
  try {
    await connectDB();

    const matchingCourses = await Course.find(criteria, 'title');
    console.log(`📊 Found ${matchingCourses.length} courses matching criteria`);

    if (matchingCourses.length === 0) {
      console.log('✅ No courses match the specified criteria.');
      return;
    }

    console.log('📋 Courses to be deleted:');
    matchingCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
    });

    const deleteResult = await Course.deleteMany(criteria);
    console.log(`✅ Successfully deleted ${deleteResult.deletedCount} courses`);

  } catch (error) {
    console.error('❌ Error deleting courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

// Command line interface
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📚 Course Deletion Utility

Usage:
  node deleteAllCourses.js                    Delete ALL courses
  node deleteAllCourses.js --difficulty Easy  Delete courses by difficulty
  node deleteAllCourses.js --inactive         Delete inactive courses only
  node deleteAllCourses.js --help             Show this help message

Examples:
  node deleteAllCourses.js
  node deleteAllCourses.js --difficulty "Hard"
  node deleteAllCourses.js --inactive
    `);
    return;
  }

  // Parse command line arguments for selective deletion
  let criteria = {};
  
  if (args.includes('--difficulty')) {
    const diffIndex = args.indexOf('--difficulty');
    if (args[diffIndex + 1]) {
      criteria.difficulty = args[diffIndex + 1];
      console.log(`🎯 Targeting courses with difficulty: ${criteria.difficulty}`);
    }
  }
  
  if (args.includes('--inactive')) {
    criteria.isActive = false;
    console.log('🎯 Targeting inactive courses only');
  }

  // Execute deletion
  if (Object.keys(criteria).length > 0) {
    await deleteCoursesBy(criteria);
  } else {
    await deleteAllCourses();
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { deleteAllCourses, deleteCoursesBy };
