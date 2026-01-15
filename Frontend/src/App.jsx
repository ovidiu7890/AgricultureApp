import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ChatModal from './components/ChatModal';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForumPage from './pages/ForumPage';
import PostDetailPage from './pages/PostDetailPage';
import CalendarPage from './pages/CalendarPage';

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children, searchQuery, setSearchQuery, onOpenChat }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {children}
      
      {/* AI Chat Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-3 group"
          onClick={onOpenChat}
        >
          <Bot size={28} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold whitespace-nowrap">
            Ask Agri-AI
          </span>
        </button>
      </div>
    </div>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

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
                <AuthenticatedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery} onOpenChat={handleOpenChat}>
                  <ForumPage searchQuery={searchQuery} />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery} onOpenChat={handleOpenChat}>
                  <PostDetailPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery} onOpenChat={handleOpenChat}>
                  <CalendarPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Chat Modal - rendered outside routes so it persists */}
        <ChatModal isOpen={isChatOpen} onClose={handleCloseChat} />
      </Router>
    </AuthProvider>
  );
}

export default App;