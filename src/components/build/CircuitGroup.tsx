import { useState } from 'react';
import type { CircuitPowerSummary } from '../../types';
import { useBuild } from '../../context/BuildContext';
import { UtilizationBar } from '../shared/UtilizationBar';
import { BuildLineItem } from './BuildLineItem';
import { fmtWatts, fmtAmps } from '../../utils/format';
import { utilizationColor } from '../../utils/power';

interface Props {
  summary: CircuitPowerSummary;
}

export function CircuitGroup({ summary }: Props) {
  const { dispatch, build } = useBuild();
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(summary.circuit.name);
  const [editAmps, setEditAmps] = useState(summary.circuit.capacityAmps);
  const [editVoltage, setEditVoltage] = useState(summary.circuit.voltage);

  const util = summary.utilizationPercent;
  const borderColor =
    util > 100 ? 'border-red-500/50' :
    util >= 80 ? 'border-amber-500/50' :
    'border-gray-700';

  function saveEdits() {
    dispatch({
      type: 'UPDATE_CIRCUIT',
      payload: { ...summary.circuit, name: editName, capacityAmps: editAmps, voltage: editVoltage },
    });
    setEditing(false);
  }

  function removeCircuit() {
    if (summary.items.length > 0 && !window.confirm(`Remove "${summary.circuit.name}" and all its ${summary.items.length} item(s)?`)) return;
    dispatch({ type: 'REMOVE_CIRCUIT', payload: summary.circuitId });
  }

  return (
    <div className={`border ${borderColor} rounded-lg bg-gray-900/50 overflow-hidden`}>
      {/* Circuit Header */}
      <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-start gap-3">
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white mt-0.5">
            {collapsed ? '▶' : '▼'}
          </button>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2 items-center flex-wrap">
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white" />
                <input type="number" value={editAmps} onChange={e => setEditAmps(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white" />
                <span className="text-xs text-gray-500">A @</span>
                <select value={editVoltage} onChange={e => setEditVoltage(Number(e.target.value))}
                  className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                  <option value={120}>120V</option><option value={208}>208V</option><option value={240}>240V</option>
                </select>
                <button onClick={saveEdits} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Save</button>
                <button onClick={() => setEditing(false)} className="px-2 py-1 text-gray-400 text-xs">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base font-semibold text-white cursor-pointer hover:text-blue-400" onClick={() => setEditing(true)}>
                  {summary.circuit.name}
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  {summary.circuit.capacityAmps}A @ {summary.circuit.voltage}V
                  {summary.circuit.isThreePhase && ' 3Φ'}
                </span>
              </div>
            )}

            {/* Power summary row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
              <div className="font-mono text-sm">
                <span className="text-amber-400 font-bold">{fmtWatts(summary.totalWatts)}W</span>
                <span className="text-gray-600 text-xs mx-1">({fmtWatts(Math.round(summary.totalVA))} VA)</span>
                <span className="text-gray-500 mx-2">|</span>
                <span className="text-blue-400">{fmtAmps(summary.power.amps120)}A<span className="text-gray-600">@120</span></span>
                <span className="text-gray-600 mx-1">/</span>
                <span className="text-blue-400">{fmtAmps(summary.power.amps208)}A<span className="text-gray-600">@208</span></span>
                <span className="text-gray-600 mx-1">/</span>
                <span className="text-blue-400">{fmtAmps(summary.power.amps240)}A<span className="text-gray-600">@240</span></span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{summary.totalWeightLbs.toFixed(0)} lbs</span>
            </div>

            {/* Utilization bar */}
            <div className="mt-2">
              <UtilizationBar percent={util} label={`${fmtAmps(summary.ampsAtCircuitVoltage)}A of ${summary.circuit.capacityAmps}A`} />
            </div>

            {/* Cable suggestion & NEC warning */}
            {summary.suggestedCableAWG && (
              <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                <span className="text-xs text-gray-500">Cable: <span className="text-gray-300">{summary.suggestedCableDesc}</span></span>
                {summary.necWarning && (
                  <span className="text-xs text-amber-400 font-medium">NEC: Exceeds 80% continuous load</span>
                )}
              </div>
            )}
          </div>

          <button onClick={removeCircuit} className="text-gray-600 hover:text-red-400 text-sm shrink-0" title="Remove circuit">
            &#x2715;
          </button>
        </div>
      </div>

      {/* Line Items */}
      {!collapsed && (
        <div>
          {summary.items.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-600 italic">No equipment assigned — add from the equipment panel</div>
          ) : (
            <div>
              {summary.items.map(({ lineItem, equipment }) => (
                <BuildLineItem
                  key={lineItem.id}
                  lineItem={lineItem}
                  equipment={equipment}
                  circuits={build.circuits}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
