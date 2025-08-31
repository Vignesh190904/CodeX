// Utility function to determine if navbar should be shown on a given route
export const shouldShowNavbar = (pathname) => {
  // Hide Navbar on SecureTest, ModuleTest, FinalExam and Lesson pages for immersive experience
  const isSecureTest = /^\/courses\/[^/]+\/test$/.test(pathname);
  const isModuleTest = /^\/courses\/[^/]+\/topic\/[^/]+\/(test|secure-test)$/.test(pathname);
  const isLessonPage = /^\/courses\/[^/]+\/topic\/[^/]+\/lesson\/[^/]+$/.test(pathname);
  const isFinalExam = /^\/courses\/[^/]+\/final-exam$/.test(pathname);
  const isFinalExamResults = /^\/courses\/[^/]+\/final-exam\/results$/.test(pathname);
  
  return !(isSecureTest || isModuleTest || isLessonPage || isFinalExam || isFinalExamResults);
};
