import { useState } from 'react';
import { useBuild } from '../context/BuildContext';

export function EventInfoBar() {
  const { build, dispatch } = useBuild();
  const [open, setOpen] = useState(false);

  const hasInfo = build.eventVenue || build.eventDate || build.eventNotes;

  function setVenue(v: string) { dispatch({ type: 'SET_EVENT_INFO', payload: { venue: v } }); }
  function setDate(d: string) { dispatch({ type: 'SET_EVENT_INFO', payload: { date: d } }); }
  function setNotes(n: string) { dispatch({ type: 'SET_EVENT_INFO', payload: { notes: n } }); }

  return (
    <div className="border-b border-gray-800 bg-gray-900/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-2 text-xs hover:bg-gray-800/40 transition-colors text-left"
      >
        <span className="text-gray-500 shrink-0">{open ? '▼' : '▶'}</span>
        <span className="text-gray-500 uppercase tracking-wider font-medium">Event Info</span>
        {!open && hasInfo && (
          <span className="text-gray-400 truncate">
            {[build.eventVenue, build.eventDate].filter(Boolean).join(' · ')}
          </span>
        )}
        {!open && !hasInfo && (
          <span className="text-gray-600 italic">Click to add venue, date, notes</span>
        )}
      </button>

      {open && (
        <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Venue</label>
            <input
              type="text"
              placeholder="e.g. The Fairmont"
              value={build.eventVenue ?? ''}
              onChange={e => setVenue(e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Event Date</label>
            <input
              type="date"
              value={build.eventDate ?? ''}
              onChange={e => setDate(e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Notes</label>
            <input
              type="text"
              placeholder="e.g. 200A 3-phase service"
              value={build.eventNotes ?? ''}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
