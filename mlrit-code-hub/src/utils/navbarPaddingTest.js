// Test utility for navbar padding functionality
import { shouldShowNavbar } from './navbarUtils';

// Test cases for different routes
const testRoutes = [
  // Routes where navbar should be shown (padding should be applied)
  { path: '/courses', expected: true, description: 'Course catalog page' },
  { path: '/courses/123', expected: true, description: 'Course detail page' },
  { path: '/student-home', expected: true, description: 'Student home page' },
  { path: '/admin-home', expected: true, description: 'Admin home page' },
  { path: '/profile', expected: true, description: 'Profile page' },
  { path: '/leaderboard', expected: true, description: 'Leaderboard page' },
  
  // Routes where navbar should be hidden (no padding should be applied)
  { path: '/courses/123/topic/456/lesson/789', expected: false, description: 'Lesson page' },
  { path: '/courses/123/topic/456/test', expected: false, description: 'Module test page' },
  { path: '/courses/123/topic/456/secure-test', expected: false, description: 'Secure test page' },
  { path: '/courses/123/final-exam', expected: false, description: 'Final exam page' },
  { path: '/courses/123/final-exam/results', expected: false, description: 'Final exam results page' },
];

// Run tests
export const runNavbarPaddingTests = () => {
  console.log('🧪 Running Navbar Padding Tests...');
  
  let passedTests = 0;
  let totalTests = testRoutes.length;
  
  testRoutes.forEach(({ path, expected, description }) => {
    const result = shouldShowNavbar(path);
    const passed = result === expected;
    
    if (passed) {
      passedTests++;
      console.log(`✅ ${description}: ${path} - Expected: ${expected}, Got: ${result}`);
    } else {
      console.log(`❌ ${description}: ${path} - Expected: ${expected}, Got: ${result}`);
    }
  });
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All navbar padding tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }
  
  return passedTests === totalTests;
};

// Export test cases for manual verification
export { testRoutes };
