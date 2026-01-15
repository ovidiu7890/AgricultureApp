import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForumPage from './pages/ForumPage';
import PostDetailPage from './pages/PostDetailPage';
import CalendarPage from './pages/CalendarPage';

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children, searchQuery, setSearchQuery }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {children}
    </div>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
                  <ForumPage searchQuery={searchQuery} />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
                  <PostDetailPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
                  <CalendarPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Chat Modal removed */}
      </Router>
    </AuthProvider>
  );
}

export default App;