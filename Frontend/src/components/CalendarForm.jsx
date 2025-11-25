import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createCalendarEntry, updateCalendarEntry } from '../services/calendarService';

const CalendarForm = ({ isOpen, onClose, onEntrySaved, editEntry = null }) => {
  const { user } = useAuth();
  const [plantName, setPlantName] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setPlantName(editEntry.plantName || '');
      setDate(editEntry.date ? new Date(editEntry.date).toISOString().split('T')[0] : '');
      setNotes(editEntry.notes || '');
    } else {
      // Reset form for new entry
      setPlantName('');
      setDate('');
      setNotes('');
    }
  }, [editEntry, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!plantName.trim() || !date) {
      alert('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        userId: user.uid,
        plantName: plantName.trim(),
        date: date,
        notes: notes.trim() || undefined,
      };

      if (editEntry) {
        // Update existing entry
        await updateCalendarEntry(editEntry.id, entryData);
      } else {
        // Create new entry
        await createCalendarEntry(entryData);
      }
      
      // Reset form
      setPlantName('');
      setDate('');
      setNotes('');
      
      // Notify parent component
      if (onEntrySaved) {
        onEntrySaved();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save calendar entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-slate-900">
            {editEntry ? 'Edit Calendar Entry' : 'Add Calendar Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="plantName" className="block text-sm font-medium text-slate-700 mb-1">
              Plant Name *
            </label>
            <input
              id="plantName"
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Winter Wheat, Tomatoes"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
              Date *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
              placeholder="Add any notes about this planting..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : editEntry ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarForm;
