import React, { useState } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Search, 
  Menu, 
  Leaf, 
  Tractor, 
  Wheat, 
  Bot, 
  MoreHorizontal 
} from 'lucide-react';

// --- MOCK DATA (Simulating your future Python Backend) ---
const INITIAL_POSTS = [
  {
    id: 1,
    author: "CornWhisperer",
    time: "2 hours ago",
    category: "Crops",
    title: "Best time to harvest winter wheat in Zone 5b?",
    content: "I've been monitoring moisture levels, but the forecast looks rainy for the next week. Should I risk harvesting early at 18% moisture or wait it out?",
    upvotes: 45,
    comments: 12,
    tag: "Harvest"
  },
  {
    id: 2,
    author: "DairyKing99",
    time: "5 hours ago",
    category: "Livestock",
    title: "New automated milking system ROI",
    content: "Thinking about switching to a robotic milker for my herd of 120. Has anyone seen a genuine ROI within 5 years, or is the maintenance cost too high?",
    upvotes: 120,
    comments: 34,
    tag: "Tech"
  },
  {
    id: 3,
    author: "GreenThumb",
    time: "1 day ago",
    category: "Machinery",
    title: "John Deere 4020 hydraulic issues",
    content: "Losing pressure when the oil gets hot. Pump was replaced last year. Any ideas on where to check for leaks?",
    upvotes: 28,
    comments: 8,
    tag: "Repair"
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: <Menu size={20} /> },
  { id: 'crops', name: 'Crops & Soil', icon: <Wheat size={20} /> },
  { id: 'livestock', name: 'Livestock', icon: <Leaf size={20} /> }, // Using Leaf as generic nature icon
  { id: 'machinery', name: 'Machinery', icon: <Tractor size={20} /> },
];

function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category.toLowerCase().includes(activeCategory);
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpvote = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, upvotes: post.upvotes + 1 } : post
    ));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveCategory('all')}>
            <div className="bg-green-600 p-2 rounded-lg">
              <Wheat className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-green-800 hidden sm:block">AgriConnect</span>
          </div>

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

          {/* User Profile Placeholder */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-medium text-slate-600 hover:text-green-700">Log In</button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transition-transform active:scale-95">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        
        {/* --- LEFT SIDEBAR (Categories) --- */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Feeds</h2>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-green-50 text-green-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Resources</h2>
              <div className="text-sm text-slate-500 space-y-3">
                <p className="hover:underline cursor-pointer">Market Prices</p>
                <p className="hover:underline cursor-pointer">Weather Radar</p>
                <p className="hover:underline cursor-pointer">USDA Guidelines</p>
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN FEED --- */}
        <main className="flex-1 min-w-0">
          {/* Create Post Input Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
            <input 
              type="text" 
              placeholder="Start a discussion about farming..." 
              className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>

          {/* Filter Status */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800">
              {activeCategory === 'all' ? 'Top Discussions' : `${CATEGORIES.find(c => c.id === activeCategory)?.name} Discussions`}
            </h2>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer">
                  <div className="flex">
                    {/* Vote Sidebar */}
                    <div className="w-12 bg-slate-50 border-r border-slate-100 flex flex-col items-center pt-4 gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpvote(post.id); }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-orange-500 transition-colors"
                      >
                        <ThumbsUp size={20} />
                      </button>
                      <span className="text-sm font-bold text-slate-700">{post.upvotes}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-bold text-slate-900 hover:underline">{post.author}</span>
                        <span>•</span>
                        <span>{post.time}</span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          {post.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{post.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{post.content}</p>
                      
                      <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                        <button className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1 rounded transition-colors">
                          <MessageSquare size={18} />
                          {post.comments} Comments
                        </button>
                        <button className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1 rounded transition-colors">
                          <Share2 size={18} />
                          Share
                        </button>
                        <div className="flex-1"></div>
                        <button className="hover:bg-slate-100 p-1 rounded">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                <Tractor className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500 font-medium">No discussions found in this category.</p>
              </div>
            )}
          </div>
        </main>

        {/* --- RIGHT SIDEBAR (Community Info) --- */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
            <div className="bg-green-100 rounded-lg h-24 mb-4 -mx-4 -mt-4 bg-cover bg-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
               <h2 className="absolute bottom-2 left-4 text-white font-bold text-lg">AgriConnect</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              The premier community for modern farmers to discuss crop management, livestock care, and agricultural technology.
            </p>
            <div className="flex gap-4 text-sm font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
              <div className="flex flex-col">
                <span className="text-lg">14.2k</span>
                <span className="text-xs text-slate-500 font-normal">Farmers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg">350</span>
                <span className="text-xs text-slate-500 font-normal">Online</span>
              </div>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-full transition-all mb-2">
              Create Post
            </button>
            <button className="w-full bg-white border border-green-600 text-green-700 hover:bg-green-50 font-bold py-2 rounded-full transition-all">
              Create Community
            </button>
          </div>
        </aside>

      </div>

      {/* --- AI CHAT FLOATING ACTION BUTTON --- */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-3 group"
          onClick={() => alert("Connecting to Python AI backend...")}
        >
          <Bot size={28} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold whitespace-nowrap">
            Ask Agri-AI
          </span>
        </button>
      </div>

    </div>
  );
}

export default App;