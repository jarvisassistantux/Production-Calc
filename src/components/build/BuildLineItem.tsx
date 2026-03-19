import type { BuildLineItem as LineItemType, EquipmentItem, Circuit } from '../../types';
import { UNASSIGNED_CIRCUIT_ID } from '../../types';
import { useBuild } from '../../context/BuildContext';
import { fmtWatts } from '../../utils/format';

interface Props {
  lineItem: LineItemType;
  equipment: EquipmentItem;
  circuits: Circuit[];
}

export function BuildLineItem({ lineItem, equipment, circuits }: Props) {
  const { dispatch } = useBuild();
  const totalWatts = equipment.watts * lineItem.quantity;
  const totalWeight = equipment.weightLbs * lineItem.quantity;
  const showMoveDropdown = circuits.length > 0;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800/30 hover:bg-gray-800/30 group text-sm">
      {/* Equipment name & info */}
      <div className="flex-1 min-w-0">
        <div className="text-gray-200 truncate">{equipment.name}</div>
        <div className="flex gap-2 text-xs text-gray-500">
          <span className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{lineItem.departmentOverride ?? equipment.department}</span>
          <span>{equipment.connector}</span>
          {equipment.voltage > 0 && <span>{equipment.voltage}V</span>}
        </div>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => dispatch({ type: 'UPDATE_LINE_ITEM_QTY', payload: { id: lineItem.id, quantity: lineItem.quantity - 1 } })}
          className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-base leading-none"
        >-</button>
        <span className="w-8 text-center font-mono font-semibold text-white">{lineItem.quantity}</span>
        <button
          onClick={() => dispatch({ type: 'UPDATE_LINE_ITEM_QTY', payload: { id: lineItem.id, quantity: lineItem.quantity + 1 } })}
          className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-base leading-none"
        >+</button>
      </div>

      {/* Per-line totals */}
      <div className="w-24 text-right shrink-0">
        <div className="font-mono text-amber-400 text-sm">{fmtWatts(totalWatts)}W</div>
        <div className="text-xs text-gray-500">{totalWeight.toFixed(1)} lbs</div>
      </div>

      {/* Move to circuit */}
      {showMoveDropdown && (
        <select
          value={lineItem.circuitId}
          onChange={e => dispatch({ type: 'MOVE_ITEM_TO_CIRCUIT', payload: { id: lineItem.id, circuitId: e.target.value } })}
          className="w-28 px-1.5 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 focus:outline-none shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          title="Move to circuit"
        >
          <option value={UNASSIGNED_CIRCUIT_ID}>Quick Calc</option>
          {circuits.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}

      {/* Delete */}
      <button
        onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', payload: lineItem.id })}
        className="text-gray-600 hover:text-red-400 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center sm:min-w-0 sm:min-h-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        title="Remove"
      >&#x2715;</button>
    </div>
  );
}
