import React, { useState, useEffect } from 'react';
import { Tractor, Plus } from 'lucide-react';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import CreatePostModal from '../components/CreatePostModal';
import ChatWidget from '../components/ChatWidget';
import { getAllPosts } from '../services/forumService';
import { useAuth } from '../context/AuthContext';

const ForumPage = ({ searchQuery }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [user]); // Reload if user changes (e.g. login)

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPosts(user?.uid);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
      // For development, you can use mock data if the backend is not running
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic
  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || 
      post.category?.toLowerCase().includes(activeCategory);
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePostCreated = () => {
    loadPosts(); // Reload posts after creating a new one
  };

  const handleVote = () => {
    loadPosts(); // Reload posts after voting
  };

  const CATEGORIES = [
    { id: 'all', name: 'All Topics' },
    { id: 'crops', name: 'Crops & Soil' },
    { id: 'livestock', name: 'Livestock' },
    { id: 'machinery', name: 'Machinery' },
    { id: 'organic', name: 'Organic Farming' },
    { id: 'market', name: 'Market Prices' },
    { id: 'government', name: 'Government Schemes' },
    { id: 'events', name: 'Events' },
    { id: 'general', name: 'General' },
  ];

  const getCategoryName = () => {
    const category = CATEGORIES.find(c => c.id === activeCategory);
    return category ? category.name : 'All Topics';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      {/* Left Sidebar */}
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Main Feed */}
      <main className="flex-1 min-w-0">
        {/* Create Post Input Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
          <input 
            type="text" 
            placeholder="Start a discussion about farming..." 
            className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
            readOnly
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
            title="Create Post"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Filter Status */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-800">
            {activeCategory === 'all' ? 'Top Discussions' : `${getCategoryName()} Discussions`}
          </h2>
          {searchQuery && (
            <span className="text-sm text-slate-500">
              Searching for: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onVote={handleVote}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                <Tractor className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500 font-medium">
                  {searchQuery 
                    ? 'No posts found matching your search.' 
                    : 'No discussions found in this category.'}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create First Post
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Sidebar (Chat) */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-24 h-[600px]">
          <ChatWidget />
        </div>
      </aside>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default ForumPage;
