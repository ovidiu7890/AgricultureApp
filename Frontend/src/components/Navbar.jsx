import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Wheat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="bg-green-600 p-2 rounded-lg">
            <Wheat className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-green-800 hidden sm:block">AgriConnect</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:text-sm transition-all shadow-inner"
              placeholder="Search for farming topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* User Profile / Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/calendar')}
            className="hidden sm:block text-sm font-medium text-slate-600 hover:text-green-700"
          >
            Calendar
          </button>
          {user.isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-slate-700">
                {user.username}
              </span>
              <button 
                onClick={logout}
                className="text-sm font-medium text-slate-600 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="hidden sm:block text-sm font-medium text-slate-600 hover:text-green-700">
                Log In
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transition-transform active:scale-95">
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
