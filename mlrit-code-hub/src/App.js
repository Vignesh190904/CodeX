
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";

// Layout & Context
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import UserContext from "./context/UserContext";

// Pages
import LandingPage from "./pages/landingpage";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

// Admin Pages
import AdminHome from "./pages/AdminHome";
import AddProblem from "./pages/AddProblem";
import AdminProblems from "./pages/AdminProblems";
import AdminEditCourses from "./pages/AdminEditCourses";
import EditProblem from "./pages/EditProblem";
import CreateContest from "./pages/CreateContest";
import ManageContests from "./pages/ManageContests";
import AdminCreateCourse from "./pages/AdminCreateCourse";

// Student Pages
import StudentHome from "./pages/StudentHome";
import CodeEditor from "./pages/CodeEditor";
import ProblemSet from "./pages/ProblemSet";

// Leaderboard
import Leaderboard from "./pages/Leaderboard";

// Contest Pages
import Contests from "./pages/ContestList";
import ContestDetail from "./pages/ContestDetail";
import SolveContest from "./pages/SolveContestProblem";
import SolveProblemSetProblem from "./pages/SolveProblemSetProblem";
import ModernCourseDetail from "./pages/ModernCourseDetail";
import ModuleDetail from "./pages/ModuleDetail";
import ModuleDisplayNew from './pages/ModuleDisplayNew';
import TopicView from "./pages/TopicView";
import CourseCatalog from "./pages/CourseCatalog";
import Dashboard from "./pages/Dashboard";
import LessonPage from "./pages/LessonPage";
import ModuleTestPage from "./pages/ModuleTestPage";
import FinalExamPage from "./pages/FinalExamPage";
import FinalExamResults from "./pages/FinalExamResults";

function App() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  // Enhanced authentication validation
  const validateToken = async (token) => {
    if (!token) {
      console.log("No token found");
      return false;
    }
    
    try {
      console.log("Validating token...");
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // If successful, set user data
      setUser(res.data);
      console.log("Token validation successful, user:", res.data.name);
      
      // Ensure userId is set in localStorage for course features
      if (res.data && res.data._id && !localStorage.getItem("userId")) {
        localStorage.setItem("userId", res.data._id);
      }
      
      return true;
    } catch (err) {
      console.error("Token validation failed:", err.response?.status, err.response?.data);
      
      // Clear invalid token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setUser(null);
      
      return false;
    }
  };

  // Custom hook to get current location
  function usePath() {
    const location = useLocation();
    return location.pathname;
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        await validateToken(token);
      }
    };
    fetchUser();
  }, [token]);

  function AppContent() {
    const path = usePath();
    // Hide Navbar on SecureTest, ModuleTest, FinalExam, Lesson pages, and Problem Solving pages for immersive experience
    const isSecureTest = /^\/courses\/[^/]+\/test$/.test(path);
    const isModuleTest = /^\/courses\/[^/]+\/topic\/[^/]+\/(test|secure-test)$/.test(path);
    const isLessonPage = /^\/courses\/[^/]+\/topic\/[^/]+\/lesson\/[^/]+$/.test(path);
    const isFinalExam = /^\/courses\/[^/]+\/final-exam$/.test(path);
    const isFinalExamResults = /^\/courses\/[^/]+\/final-exam\/results$/.test(path);
    const isProblemSolving = /^\/solve\/[^/]+$/.test(path);
    const isContestProblemSolving = /^\/contest\/[^/]+\/solve\/[^/]+$/.test(path);
    const hideNavbar = isSecureTest || isModuleTest || isLessonPage || isFinalExam || isProblemSolving || isContestProblemSolving;
    return (
      <>
        {!hideNavbar && <Navbar />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Protected Routes */}
          <Route path="/admin-home" element={<ProtectedRoute allowedRole="admin"><AdminHome /></ProtectedRoute>} />
          <Route path="/admin/add-problem" element={<ProtectedRoute allowedRole="admin"><AddProblem /></ProtectedRoute>} />
          <Route path="/admin/manage-problems" element={<ProtectedRoute allowedRole="admin"><AdminProblems /></ProtectedRoute>} />
          <Route path="/admin/edit-problem/:id" element={<ProtectedRoute allowedRole="admin"><EditProblem /></ProtectedRoute>} />
          <Route path="/admin/create-contest" element={<ProtectedRoute allowedRole="admin"><CreateContest /></ProtectedRoute>} />
          <Route path="/admin/manage-contests" element={<ProtectedRoute allowedRole="admin"><ManageContests /></ProtectedRoute>} />
          <Route path="/admin/create-course" element={<ProtectedRoute allowedRole="admin"><AdminCreateCourse /></ProtectedRoute>} />
          <Route path="/admin/edit-courses" element={<ProtectedRoute allowedRole="admin"><AdminEditCourses /></ProtectedRoute>} />

          {/* Student Protected Routes */}
          <Route path="/student-home" element={<ProtectedRoute allowedRole="student"><StudentHome /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute allowedRole="student"><CodeEditor /></ProtectedRoute>} />

          {/* Profile */}
          <Route path="/profile" element={<ProtectedRoute allowedRole={undefined}><Profile /></ProtectedRoute>} />

          {/* Problem Set */}
          <Route path="/problem-set" element={<ProtectedRoute allowedRole="student"><ProblemSet /></ProtectedRoute>} />

          {/* Leaderboard */}
          <Route path="/leaderboard" element={<ProtectedRoute allowedRole={undefined}><Leaderboard /></ProtectedRoute>} />

          {/* Contest Routes */}
          <Route path="/contests" element={<ProtectedRoute allowedRole="student"><Contests /></ProtectedRoute>} />
          <Route path="/contest/:id" element={<ProtectedRoute allowedRole="student"><ContestDetail /></ProtectedRoute>} />
          <Route path="/contest/:contestId/solve/:problemId" element={<ProtectedRoute allowedRole="student"><SolveContest /></ProtectedRoute>} />
          <Route path="/solve/:problemId" element={<ProtectedRoute allowedRole="student"><SolveProblemSetProblem /></ProtectedRoute>} />

          {/* Course Routes */}
          <Route path="/courses/:courseId" element={<ProtectedRoute allowedRole={["student", "admin"]}><ModernCourseDetail /></ProtectedRoute>} />
          <Route path="/courses/:courseId/topic/:topicId/lesson/:lessonId" element={<ProtectedRoute allowedRole={["student", "admin"]}><LessonPage /></ProtectedRoute>} />
          <Route path="/courses/:courseId/topic/:topicId/test" element={<ProtectedRoute allowedRole={["student", "admin"]}><ModuleTestPage /></ProtectedRoute>} />
          <Route path="/courses/:courseId/topic/:topicId/secure-test" element={<ProtectedRoute allowedRole={["student", "admin"]}><ModuleTestPage /></ProtectedRoute>} />
          <Route path="/courses/:courseId/final-exam" element={<ProtectedRoute allowedRole={["student", "admin"]}><FinalExamPage /></ProtectedRoute>} />
          <Route path="/courses/:courseId/final-exam/results" element={<ProtectedRoute allowedRole={["student", "admin"]}><FinalExamResults /></ProtectedRoute>} />
          <Route path="/courses/:courseId/modules" element={<ProtectedRoute allowedRole={["student", "admin"]}><ModuleDisplayNew /></ProtectedRoute>} />
          <Route path="/courses/:courseId/module/:moduleIndex" element={<ProtectedRoute allowedRole={["student", "admin"]}><ModuleDetail /></ProtectedRoute>} />
          <Route path="/courses/:courseId/module/:moduleIndex/topic/:topicIndex" element={<ProtectedRoute allowedRole={["student", "admin"]}><TopicView /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute allowedRole={["student", "admin"]}><CourseCatalog /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRole={["student", "admin"]}><Dashboard /></ProtectedRoute>} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <AppContent />
      </Router>
    </UserContext.Provider>
  );
}

export default App;