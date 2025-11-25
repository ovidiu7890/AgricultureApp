import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CalendarEntry from '../components/CalendarEntry';
import CalendarForm from '../components/CalendarForm';
import { getCalendarEntries, deleteCalendarEntry } from '../services/calendarService';

const CalendarPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const data = await getCalendarEntries(user.uid);
      // Sort by date (newest first)
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sorted);
    } catch (error) {
      console.error('Failed to load calendar entries:', error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setIsFormOpen(true);
  };

  const handleDelete = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteCalendarEntry(entryId);
      loadEntries(); // Reload entries
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry');
    }
  };

  const handleEntrySaved = () => {
    loadEntries(); // Reload entries after save
    setEditEntry(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditEntry(null);
  };

  // Group entries by month
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.date);
    const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(entry);
    return groups;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Planting Calendar</h1>
          <p className="text-slate-600">Track your planting schedule and important dates</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
        >
          <Plus size={20} />
          Add Entry
        </button>
      </div>

      {/* Calendar Entries */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Loading calendar...</p>
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
            <div key={monthYear}>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CalendarIcon size={24} className="text-green-600" />
                {monthYear}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monthEntries.map((entry) => (
                  <CalendarEntry
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
          <CalendarIcon className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium mb-4">No calendar entries yet</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Your First Entry
          </button>
        </div>
      )}

      {/* Calendar Form Modal */}
      <CalendarForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onEntrySaved={handleEntrySaved}
        editEntry={editEntry}
      />
    </div>
  );
};

export default CalendarPage;
