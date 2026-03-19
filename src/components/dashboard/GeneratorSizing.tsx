import type { GrandTotals } from '../../types';
import { fmtWatts } from '../../utils/format';

interface Props {
  totals: GrandTotals;
}

export function GeneratorSizing({ totals }: Props) {
  const totalVA = totals.power.va;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Generator Recommendation</div>
      <div className="font-mono text-xl font-bold text-emerald-400">
        {totals.generatorRecommendation}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {fmtWatts(Math.round(totalVA))} VA &times; 1.25 = {fmtWatts(Math.round(totals.generatorVARequired))} VA required
      </div>
      <div className="text-xs text-gray-600 mt-1">
        Sized on apparent power (VA), not watts — generators are rated in kVA
      </div>
    </div>
  );
}
