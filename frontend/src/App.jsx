import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks";
import { NotificationContainer, ProtectedRoute } from "./components";
import { ROLES } from "./utils/constants";

// Pages
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import DashboardPage from "./pages/Dashboard";
import EventsPage from "./pages/Events";
import StudentEventsPage from "./pages/StudentEvents";
import RoomsPage from "./pages/Rooms";
import UsersPage from "./pages/Users";
import CalendarPage from "./pages/Calendar";
import ProfilePage from "./pages/Profile";
import AnalyticsPage from "./pages/Analytics";
import NotFoundPage from "./pages/NotFound";

import "./App.css";

function App() {
  const { isAuthenticated, initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <Router>
      <NotificationContainer />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignupPage /> : <Navigate to="/" replace />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin & Staff Routes */}
        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
              <EventsPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student-events"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentEventsPage />
            </ProtectedRoute>
          }
        />

        {/* Common Routes */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
