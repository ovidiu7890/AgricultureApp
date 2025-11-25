import React from 'react';
import { Menu, Leaf, Tractor, Wheat } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: <Menu size={20} /> },
  { id: 'crops', name: 'Crops & Soil', icon: <Wheat size={20} /> },
  { id: 'livestock', name: 'Livestock', icon: <Leaf size={20} /> },
  { id: 'machinery', name: 'Machinery', icon: <Tractor size={20} /> },
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
            <p className="hover:underline cursor-pointer">Market Prices</p>
            <p className="hover:underline cursor-pointer">Weather Radar</p>
            <p className="hover:underline cursor-pointer">USDA Guidelines</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
