import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { useBuild } from '../../context/BuildContext';
import { DEPARTMENTS, CONNECTORS } from '../../types';
import type { Department } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddCustomEquipment({ open, onClose }: Props) {
  const { dispatch } = useBuild();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<Department>('Other');
  const [watts, setWatts] = useState(0);
  const [weightLbs, setWeightLbs] = useState(0);
  const [connector, setConnector] = useState('Edison');
  const [voltage, setVoltage] = useState(120);
  const [isThreePhase, setIsThreePhase] = useState(false);
  const [powerFactor, setPowerFactor] = useState(0.95);
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: 'ADD_CUSTOM_EQUIPMENT',
      payload: { name: name.trim(), department, watts, weightLbs, connector, voltage, isThreePhase, powerFactor, notes },
    });
    setName(''); setWatts(0); setWeightLbs(0); setPowerFactor(0.95); setNotes('');
    onClose();
  }

  const inputClass = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1";

  return (
    <Modal open={open} onClose={onClose} title="Add Custom Equipment">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value as Department)} className={inputClass}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Connector</label>
            <select value={connector} onChange={e => setConnector(e.target.value)} className={inputClass}>
              {CONNECTORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Watts (real power)</label>
            <input type="number" min={0} value={watts} onChange={e => setWatts(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Power Factor (0.0–1.0)</label>
            <select value={powerFactor} onChange={e => setPowerFactor(Number(e.target.value))} className={inputClass}>
              <option value={1.0}>1.00 — Resistive (incandescent, heaters)</option>
              <option value={0.95}>0.95 — LED fixtures (moving heads, washes)</option>
              <option value={0.90}>0.90 — SMPS (video panels, processors)</option>
              <option value={0.85}>0.85 — Small adapters (wireless receivers)</option>
              <option value={0.80}>0.80 — Motors/fans (haze machines, blowers)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Weight (lbs)</label>
            <input type="number" min={0} step={0.1} value={weightLbs} onChange={e => setWeightLbs(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Voltage</label>
            <select value={voltage} onChange={e => setVoltage(Number(e.target.value))} className={inputClass}>
              <option value={120}>120V</option>
              <option value={208}>208V</option>
              <option value={240}>240V</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Apparent Power</label>
            <div className={`${inputClass} text-gray-400 bg-gray-900 cursor-default`}>
              {watts > 0 ? `${Math.round(watts / powerFactor)} VA` : '—'}
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={isThreePhase} onChange={e => setIsThreePhase(e.target.checked)} className="rounded bg-gray-800 border-gray-600" />
          3-Phase
        </label>
        <div>
          <label className={labelClass}>Notes</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors">
          Add Equipment
        </button>
      </form>
    </Modal>
  );
}
