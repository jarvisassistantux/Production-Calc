import { useState, useMemo } from 'react';
import type { BuildLineItem, EquipmentItem } from '../../types';
import { UNASSIGNED_CIRCUIT_ID } from '../../types';
import { useBuild } from '../../context/BuildContext';
import { fmtWatts, fmtAmps } from '../../utils/format';
import { calcPowerAtVoltage, calcVA } from '../../utils/power';
import { packIntoLines } from '../../utils/circuit-packer';

interface Props {
  items: BuildLineItem[];
  allEquipment: EquipmentItem[];
}

export function QuickCalcGroup({ items, allEquipment }: Props) {
  const { build, dispatch } = useBuild();
  const [collapsed, setCollapsed] = useState(false);
  const [showPacker, setShowPacker] = useState(true);
  const [lineVoltage, setLineVoltage] = useState(120);
  const [lineAmps, setLineAmps] = useState(20);

  const equipMap = useMemo(() => {
    const m = new Map<string, EquipmentItem>();
    allEquipment.forEach(e => m.set(e.id, e));
    return m;
  }, [allEquipment]);

  const resolved = items.map(li => {
    const eq = equipMap.get(li.equipmentId);
    return eq ? { lineItem: li, equipment: eq } : null;
  }).filter((x): x is { lineItem: BuildLineItem; equipment: EquipmentItem } => x !== null);

  const totalWatts = resolved.reduce((s, { lineItem, equipment }) => s + equipment.watts * lineItem.quantity, 0);
  const totalVA = resolved.reduce((s, { lineItem, equipment }) => s + calcVA(equipment.watts, equipment.powerFactor) * lineItem.quantity, 0);
  const totalWeightLbs = resolved.reduce((s, { lineItem, equipment }) => s + equipment.weightLbs * lineItem.quantity, 0);
  const totalItemCount = resolved.reduce((s, r) => s + r.lineItem.quantity, 0);
  const power = calcPowerAtVoltage(totalWatts, totalVA);

  // Smart circuit packer
  const packResult = useMemo(
    () => packIntoLines(items, equipMap, lineVoltage, lineAmps),
    [items, equipMap, lineVoltage, lineAmps]
  );

  return (
    <div className="border border-amber-500/40 rounded-lg bg-gray-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-900/20 border-b border-amber-500/20">
        <div className="flex items-start gap-3">
          <button onClick={() => setCollapsed(!collapsed)} className="text-amber-400 hover:text-amber-300 mt-0.5">
            {collapsed ? '▶' : '▼'}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base font-semibold text-amber-400">
                ⚡ Quick Calc — No Circuit
              </h3>
              <span className="text-xs text-gray-500">Pre-venue power estimation</span>
            </div>

            {/* Power summary */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="font-mono text-sm">
                <span className="text-amber-400 font-bold">{fmtWatts(totalWatts)}W</span>
                <span className="text-gray-500 mx-2">|</span>
                <span className="text-blue-400">{fmtAmps(power.amps120)}A<span className="text-gray-600">@120</span></span>
                <span className="text-gray-600 mx-1">/</span>
                <span className="text-blue-400">{fmtAmps(power.amps208)}A<span className="text-gray-600">@208</span></span>
                <span className="text-gray-600 mx-1">/</span>
                <span className="text-blue-400">{fmtAmps(power.amps240)}A<span className="text-gray-600">@240</span></span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{totalWeightLbs.toFixed(0)} lbs</span>
              <span className="text-xs text-gray-500">{totalItemCount} items</span>
            </div>

            {/* Circuit Packer Result */}
            {totalWatts > 0 && (
              <div className="mt-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Lines Required</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <select
                      value={lineAmps}
                      onChange={e => setLineAmps(Number(e.target.value))}
                      className="px-1.5 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 focus:outline-none"
                    >
                      <option value={15}>15A</option>
                      <option value={20}>20A</option>
                      <option value={30}>30A</option>
                    </select>
                    <span className="text-xs text-gray-500">@</span>
                    <select
                      value={lineVoltage}
                      onChange={e => setLineVoltage(Number(e.target.value))}
                      className="px-1.5 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 focus:outline-none"
                    >
                      <option value={120}>120V</option>
                      <option value={208}>208V</option>
                      <option value={240}>240V</option>
                    </select>
                    <span className="text-xs text-gray-500">
                      ({fmtWatts(Math.round(lineAmps * lineVoltage * 0.8))} VA/line @ 80% NEC)
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  <div className="font-mono text-2xl font-bold text-emerald-400">
                    {packResult.totalLines}
                  </div>
                  <div className="text-sm text-gray-300">
                    × {lineAmps}A lines needed
                  </div>
                  <button
                    onClick={() => setShowPacker(!showPacker)}
                    className="text-xs text-blue-400 hover:text-blue-300 ml-auto"
                  >
                    {showPacker ? 'Hide breakdown' : 'Show breakdown'}
                  </button>
                </div>

                {/* Per-line breakdown */}
                {showPacker && packResult.lines.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {packResult.lines.map(line => {
                      const barColor =
                        line.utilizationPercent > 100 ? 'bg-red-500' :
                        line.utilizationPercent >= 80 ? 'bg-amber-500' :
                        'bg-emerald-500';
                      const textColor =
                        line.utilizationPercent > 100 ? 'text-red-400' :
                        line.utilizationPercent >= 80 ? 'text-amber-400' :
                        'text-emerald-400';

                      return (
                        <div key={line.lineNumber} className="bg-gray-900/80 rounded px-3 py-2 border border-gray-700/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-400 w-14 shrink-0">Line {line.lineNumber}</span>
                            <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                              {line.items.map((item, i) => (
                                <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-gray-300">
                                  {item.count > 1 ? `${item.count}× ` : ''}{item.equipment.name}
                                </span>
                              ))}
                            </div>
                            <span className={`font-mono text-xs font-semibold ${textColor} shrink-0`}>
                              {fmtAmps(line.totalAmps)}A
                            </span>
                            <span className={`font-mono text-[11px] ${textColor} shrink-0 w-12 text-right`}>
                              {line.utilizationPercent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${Math.min(line.utilizationPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Equipment List */}
      {!collapsed && (
        <div>
          {resolved.map(({ lineItem, equipment }) => {
            const unitVA = calcVA(equipment.watts, equipment.powerFactor);
            const unitAmps = lineVoltage > 0 && unitVA > 0 ? unitVA / lineVoltage : 0;
            const maxPerLine = unitAmps > 0 ? Math.floor((lineAmps * 0.8) / unitAmps) : 0;

            return (
              <div key={lineItem.id} className="px-3 py-2 border-b border-gray-800/30 hover:bg-gray-800/20 group text-sm">
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
                    {fmtWatts(equipment.watts * lineItem.quantity)}W
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', payload: lineItem.id })}
                    className="text-gray-600 hover:text-red-400 w-8 h-8 flex items-center justify-center shrink-0"
                    title="Remove"
                  >&#x2715;</button>
                </div>
                {/* Row 2: dept + amps + lbs + move */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[11px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{lineItem.departmentOverride ?? equipment.department}</span>
                  {equipment.watts > 0 && (
                    <>
                      <span className="font-mono text-[11px] text-blue-400">{fmtAmps(unitAmps)}A</span>
                      <span className="text-[11px] text-gray-600">{Math.max(1, maxPerLine)}/line</span>
                    </>
                  )}
                  <span className="text-[11px] text-gray-600">{(equipment.weightLbs * lineItem.quantity).toFixed(0)} lbs</span>
                  {build.circuits.length > 0 && (
                    <select
                      value={lineItem.circuitId}
                      onChange={e => dispatch({ type: 'MOVE_ITEM_TO_CIRCUIT', payload: { id: lineItem.id, circuitId: e.target.value } })}
                      className="ml-auto px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-500 focus:outline-none max-w-[120px]"
                      title="Move to circuit"
                    >
                      <option value={UNASSIGNED_CIRCUIT_ID}>Quick Calc</option>
                      {build.circuits.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
