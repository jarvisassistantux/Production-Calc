import { useState } from 'react';
import type { DepartmentSummary } from '../../types';
import { fmtWatts, fmtAmps } from '../../utils/format';

interface Props {
  departments: DepartmentSummary[];
}

export function DepartmentBreakdown({ departments }: Props) {
  const [open, setOpen] = useState(true);

  if (departments.length === 0) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 uppercase tracking-wider hover:bg-gray-800/50"
      >
        <span>By Department</span>
        <span>{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="border-t border-gray-800">
          {departments.map(d => (
            <div key={d.department} className="flex items-center justify-between px-3 py-2 border-b border-gray-800/50 last:border-b-0">
              <div>
                <div className="text-sm text-gray-300">{d.department}</div>
                <div className="text-xs text-gray-500">{d.itemCount} item{d.itemCount !== 1 ? 's' : ''} &middot; {d.totalWeightLbs.toFixed(0)} lbs</div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm text-amber-400">{fmtWatts(d.power.watts)}W</div>
                <div className="text-xs text-gray-500">{fmtAmps(d.power.amps208)}A@208</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
