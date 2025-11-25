import React from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';

const CalendarEntry = ({ entry, onEdit, onDelete }) => {
  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-green-600" />
            <h3 className="text-lg font-bold text-slate-900">{entry.plantName}</h3>
          </div>
          <p className="text-sm text-slate-600 mb-2">{formattedDate}</p>
          {entry.notes && (
            <p className="text-sm text-slate-700 mt-2 p-2 bg-slate-50 rounded">
              {entry.notes}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit entry"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete entry"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarEntry;
