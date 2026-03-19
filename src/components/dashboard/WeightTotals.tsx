import { useState } from 'react';
import type { GrandTotals } from '../../types';
import { lbsToKg } from '../../utils/format';

interface Props {
  totals: GrandTotals;
}

export function WeightTotals({ totals }: Props) {
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const displayWeight = unit === 'kg' ? lbsToKg(totals.totalWeightLbs) : totals.totalWeightLbs;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Weight</div>
        <button
          onClick={() => setUnit(u => u === 'lbs' ? 'kg' : 'lbs')}
          className="text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded transition-colors min-h-[44px] sm:min-h-0 sm:py-0.5 sm:px-2"
        >
          {unit === 'lbs' ? 'Show kg' : 'Show lbs'}
        </button>
      </div>
      <div className="font-mono text-2xl font-bold text-gray-100">
        {displayWeight.toFixed(1)} <span className="text-base text-gray-500">{unit}</span>
      </div>
    </div>
  );
}
