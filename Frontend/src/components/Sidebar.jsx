import React from 'react';
import { Menu, Leaf, Tractor, Wheat, Sprout, TrendingUp, Building, Calendar, MessageCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: <Menu size={20} /> },
  { id: 'crops', name: 'Crops & Soil', icon: <Wheat size={20} /> },
  { id: 'livestock', name: 'Livestock', icon: <Leaf size={20} /> },
  { id: 'machinery', name: 'Machinery', icon: <Tractor size={20} /> },
  { id: 'organic', name: 'Organic Farming', icon: <Sprout size={20} /> },
  { id: 'market', name: 'Market Prices', icon: <TrendingUp size={20} /> },
  { id: 'government', name: 'Government Schemes', icon: <Building size={20} /> },
  { id: 'events', name: 'Events', icon: <Calendar size={20} /> },
  { id: 'general', name: 'General', icon: <MessageCircle size={20} /> },
];

const Sidebar = ({ activeCategory, setActiveCategory }) => {
  return (
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
            <a 
              href="https://www.ams.usda.gov/market-news" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block hover:underline cursor-pointer hover:text-green-600 transition-colors"
            >
              Market Prices
            </a>
            <a 
              href="https://radar.weather.gov/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block hover:underline cursor-pointer hover:text-green-600 transition-colors"
            >
              Weather Radar
            </a>
            <a 
              href="https://www.farmers.gov/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block hover:underline cursor-pointer hover:text-green-600 transition-colors"
            >
              USDA Guidelines
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
