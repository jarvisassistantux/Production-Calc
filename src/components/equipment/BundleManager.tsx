import { useState } from 'react';
import { useBuild } from '../../context/BuildContext';
import { generateId } from '../../utils/format';
import { UNASSIGNED_CIRCUIT_ID } from '../../types';
import type { EquipmentBundle } from '../../types';

const BUNDLES_KEY = 'powercalc-bundles';

function loadBundles(): EquipmentBundle[] {
  try {
    const raw = localStorage.getItem(BUNDLES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveBundles(bundles: EquipmentBundle[]) {
  localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles));
}

interface Props {
  targetCircuit: string;
}

export function BundleManager({ targetCircuit }: Props) {
  const { build, dispatch } = useBuild();
  const [open, setOpen] = useState(false);
  const [bundles, setBundles] = useState<EquipmentBundle[]>(loadBundles);
  const [bundleName, setBundleName] = useState('');
  const [saving, setSaving] = useState(false);

  // Quick Calc items available to save as bundle
  const quickCalcItems = build.lineItems.filter(li => li.circuitId === UNASSIGNED_CIRCUIT_ID);

  function saveBundle() {
    if (!bundleName.trim() || quickCalcItems.length === 0) return;
    const bundle: EquipmentBundle = {
      id: generateId(),
      name: bundleName.trim(),
      items: quickCalcItems.map(li => ({ equipmentId: li.equipmentId, quantity: li.quantity })),
      createdAt: new Date().toISOString(),
    };
    const next = [...bundles, bundle];
    saveBundles(next);
    setBundles(next);
    setBundleName('');
    setSaving(false);
  }

  function applyBundle(bundle: EquipmentBundle) {
    dispatch({
      type: 'ADD_LINE_ITEMS_BULK',
      payload: bundle.items.map(item => ({
        equipmentId: item.equipmentId,
        circuitId: targetCircuit,
        quantity: item.quantity,
      })),
    });
  }

  function deleteBundle(id: string) {
    const next = bundles.filter(b => b.id !== id);
    saveBundles(next);
    setBundles(next);
  }

  return (
    <div className="border-t border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 transition-colors"
      >
        <span className="font-medium uppercase tracking-wider">My Packages {bundles.length > 0 ? `(${bundles.length})` : ''}</span>
        <span>{open ? '▼' : '▶'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* Saved bundles */}
          {bundles.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No packages saved yet. Add gear to Quick Calc, then save it as a package.</p>
          ) : (
            <div className="space-y-1">
              {bundles.map(bundle => (
                <div key={bundle.id} className="flex items-center gap-2 px-2 py-1.5 bg-gray-800/60 rounded border border-gray-700/40">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-200 font-medium truncate">{bundle.name}</div>
                    <div className="text-[10px] text-gray-500">{bundle.items.reduce((s, i) => s + i.quantity, 0)} items</div>
                  </div>
                  <button
                    onClick={() => applyBundle(bundle)}
                    className="px-3 py-2 text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors shrink-0 min-h-[44px] sm:min-h-0 sm:py-1 sm:px-2 sm:text-[10px]"
                    title={`Add to ${targetCircuit === UNASSIGNED_CIRCUIT_ID ? 'Quick Calc' : 'circuit'}`}
                  >Apply</button>
                  <button
                    onClick={() => deleteBundle(bundle.id)}
                    className="text-gray-600 hover:text-red-400 text-xs shrink-0"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Save current Quick Calc as bundle */}
          {!saving ? (
            <button
              onClick={() => setSaving(true)}
              disabled={quickCalcItems.length === 0}
              className="w-full px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={quickCalcItems.length === 0 ? 'Add items to Quick Calc first' : 'Save Quick Calc contents as a reusable package'}
            >
              + Save Quick Calc as Package
            </button>
          ) : (
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Package name..."
                value={bundleName}
                onChange={e => setBundleName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveBundle()}
                autoFocus
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button onClick={saveBundle} disabled={!bundleName.trim()} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded">Save</button>
              <button onClick={() => setSaving(false)} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300">✕</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
