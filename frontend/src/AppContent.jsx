import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components";
import {
  Login,
  Signup,
  Dashboard,
  Events,
  StudentEvents,
  Rooms,
  Users,
  Calendar,
  Profile,
  Analytics,
  NotFound,
  AdminApproveEvents,
  StudentSubmitEvent,
} from "./pages";

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-events"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-submit-event"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentSubmitEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-approve-events"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminApproveEvents />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default AppContent;
