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
    <div className="px-3 py-2 border-b border-gray-800/30 hover:bg-gray-800/20 group text-sm">
      {/* Row 1: name + qty + watts + delete */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-gray-200 truncate">{equipment.name}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => dispatch({ type: 'UPDATE_LINE_ITEM_QTY', payload: { id: lineItem.id, quantity: lineItem.quantity - 1 } })}
            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-base leading-none"
          >-</button>
          <span className="w-7 text-center font-mono font-semibold text-white text-sm">{lineItem.quantity}</span>
          <button
            onClick={() => dispatch({ type: 'UPDATE_LINE_ITEM_QTY', payload: { id: lineItem.id, quantity: lineItem.quantity + 1 } })}
            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-base leading-none"
          >+</button>
        </div>
        <div className="font-mono text-amber-400 text-sm shrink-0 w-16 text-right">
          {fmtWatts(totalWatts)}W
        </div>
        <button
          onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', payload: lineItem.id })}
          className="text-gray-600 hover:text-red-400 w-8 h-8 flex items-center justify-center shrink-0"
          title="Remove"
        >&#x2715;</button>
      </div>
      {/* Row 2: dept + connector + lbs + move */}
      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
        <span className="text-[11px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{lineItem.departmentOverride ?? equipment.department}</span>
        <span className="text-[11px] text-gray-600">{equipment.connector}</span>
        {equipment.voltage > 0 && <span className="text-[11px] text-gray-600">{equipment.voltage}V</span>}
        <span className="text-[11px] text-gray-600">{totalWeight.toFixed(0)} lbs</span>
        {showMoveDropdown && (
          <select
            value={lineItem.circuitId}
            onChange={e => dispatch({ type: 'MOVE_ITEM_TO_CIRCUIT', payload: { id: lineItem.id, circuitId: e.target.value } })}
            className="ml-auto px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-400 focus:outline-none max-w-[120px]"
            title="Move to circuit"
          >
            <option value={UNASSIGNED_CIRCUIT_ID}>Quick Calc</option>
            {circuits.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}
