import type { GrandTotals } from '../../types';
import { fmtWatts, fmtAmps } from '../../utils/format';

interface Props {
  totals: GrandTotals;
}

export function PowerTotals({ totals }: Props) {
  const va = totals.power.va;
  const watts = totals.power.watts;
  const pfEffective = va > 0 && watts > 0 ? (watts / va) : 1;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Power</div>

      {/* Real power */}
      <div className="flex items-baseline gap-2 mb-1">
        <div className="font-mono text-2xl font-bold text-amber-400">
          {fmtWatts(watts)}W
        </div>
        <div className="text-xs text-gray-500">real power</div>
      </div>

      {/* Apparent power (VA) — what circuits actually handle */}
      <div className="flex items-baseline gap-2 mb-3">
        <div className="font-mono text-lg font-semibold text-orange-300">
          {fmtWatts(Math.round(va))} VA
        </div>
        <div className="text-xs text-gray-500">apparent · PF {pfEffective.toFixed(2)}</div>
      </div>

      {/* Amps at voltage (VA-based — accurate for circuit sizing) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xs text-gray-500">@120V</div>
          <div className="font-mono text-sm font-semibold text-blue-400">{fmtAmps(totals.power.amps120)}A</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">@208V</div>
          <div className="font-mono text-sm font-semibold text-blue-400">{fmtAmps(totals.power.amps208)}A</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">@240V</div>
          <div className="font-mono text-sm font-semibold text-blue-400">{fmtAmps(totals.power.amps240)}A</div>
        </div>
      </div>
      <div className="mt-1.5 text-xs text-gray-600 text-center">amps calculated from VA — accurate for breaker sizing</div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        {totals.totalItems} item{totals.totalItems !== 1 ? 's' : ''} total
      </div>
    </div>
  );
}
