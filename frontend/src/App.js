import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import AlumniDirectory from './pages/Alumni/AlumniDirectory';
import AlumniProfile from './pages/Alumni/AlumniProfile';
import Jobs from './pages/Jobs/Jobs';
import JobDetails from './pages/Jobs/JobDetails';
import PostJob from './pages/Jobs/PostJob';
import Events from './pages/Events/Events';
import EventDetails from './pages/Events/EventDetails';
import Donations from './pages/Donations/Donations';
import Messages from './pages/Messages/Messages';
import Settings from './pages/Settings/Settings';

// Landing Page
import LandingPage from './pages/Landing/LandingPage';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
          } 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } 
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="alumni" element={<AlumniDirectory />} />
          <Route path="alumni/:id" element={<AlumniProfile />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="jobs/post" element={<PostJob />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="donations" element={<Donations />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
