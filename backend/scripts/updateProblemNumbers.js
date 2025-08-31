const mongoose = require('mongoose');
const Problem = require('../models/Problem');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mlrit-codehub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateProblemNumbers = async () => {
  try {
    console.log('Starting problem number update...');
    
    // Get all problems sorted by creation date
    const problems = await Problem.find({}).sort({ createdAt: 1 });
    
    console.log(`Found ${problems.length} problems to update`);
    
    // Update each problem with a sequential number
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const problemNumber = i + 1;
      
      if (!problem.problemNumber) {
        await Problem.findByIdAndUpdate(problem._id, { problemNumber });
        console.log(`Updated problem "${problem.title}" with number ${problemNumber}`);
      } else {
        console.log(`Problem "${problem.title}" already has number ${problem.problemNumber}`);
      }
    }
    
    console.log('Problem number update completed successfully!');
  } catch (error) {
    console.error('Error updating problem numbers:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateProblemNumbers();
