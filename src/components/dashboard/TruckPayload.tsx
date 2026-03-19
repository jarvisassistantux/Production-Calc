import type { GrandTotals } from '../../types';
import { useBuild } from '../../context/BuildContext';
import { UtilizationBar } from '../shared/UtilizationBar';

interface Props {
  totals: GrandTotals;
}

export function TruckPayload({ totals }: Props) {
  const { build, dispatch } = useBuild();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Truck Payload</div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          min={0}
          value={build.truckPayloadLimitLbs}
          onChange={e => dispatch({ type: 'SET_TRUCK_PAYLOAD', payload: Number(e.target.value) })}
          className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-500"
        />
        <span className="text-xs text-gray-500">lbs limit</span>
      </div>
      <UtilizationBar percent={totals.truckUtilizationPercent} label={`${totals.totalWeightLbs.toFixed(0)} of ${build.truckPayloadLimitLbs.toLocaleString()} lbs`} />
    </div>
  );
}
