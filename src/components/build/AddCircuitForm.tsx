import { useState } from 'react';
import { useBuild } from '../../context/BuildContext';

export function AddCircuitForm() {
  const { dispatch } = useBuild();
  const [name, setName] = useState('');
  const [capacityAmps, setCapacityAmps] = useState(20);
  const [voltage, setVoltage] = useState(120);
  const [isThreePhase, setIsThreePhase] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: 'ADD_CIRCUIT',
      payload: { name: name.trim(), capacityAmps, voltage, isThreePhase },
    });
    setName('');
  }

  const inputClass = "px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500";

  return (
    <form onSubmit={handleAdd} className="flex flex-col sm:flex-wrap sm:flex-row items-stretch sm:items-end gap-2">
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs text-gray-500 mb-1">Circuit / Distro Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Distro A - Lighting"
          className={`${inputClass} w-full`}
          required
        />
      </div>
      <div className="w-20">
        <label className="block text-xs text-gray-500 mb-1">Amps</label>
        <input type="number" min={1} value={capacityAmps} onChange={e => setCapacityAmps(Number(e.target.value))} className={`${inputClass} w-full`} />
      </div>
      <div className="w-24">
        <label className="block text-xs text-gray-500 mb-1">Voltage</label>
        <select value={voltage} onChange={e => setVoltage(Number(e.target.value))} className={`${inputClass} w-full`}>
          <option value={120}>120V</option>
          <option value={208}>208V</option>
          <option value={240}>240V</option>
        </select>
      </div>
      <label className="flex items-center gap-1.5 text-xs text-gray-400 pb-0.5">
        <input type="checkbox" checked={isThreePhase} onChange={e => setIsThreePhase(e.target.checked)} className="rounded bg-gray-800 border-gray-600" />
        3&Phi;
      </label>
      <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors">
        + Add Circuit
      </button>
    </form>
  );
}
