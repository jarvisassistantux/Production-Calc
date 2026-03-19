import { useState } from 'react';
import { useEquipmentDB } from '../../hooks/useEquipmentDB';
import { useBuild } from '../../context/BuildContext';
import { DEPARTMENTS, UNASSIGNED_CIRCUIT_ID } from '../../types';
import { fmtWatts } from '../../utils/format';
import { AddCustomEquipment } from './AddCustomEquipment';
import { BundleManager } from './BundleManager';

export function EquipmentBrowser() {
  const { filtered, search, setSearch, deptFilter, setDeptFilter, connectorFilter, setConnectorFilter, connectorOptions, overrides, setEquipmentOverride, clearEquipmentOverride } = useEquipmentDB();
  const { build, dispatch } = useBuild();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState(UNASSIGNED_CIRCUIT_ID);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWatts, setEditWatts] = useState('');
  const [editWeight, setEditWeight] = useState('');

  // Per-item qty inputs (default 1)
  const [itemQty, setItemQty] = useState<Record<string, number>>({});

  // Multi-select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const targetCircuit = selectedCircuit || UNASSIGNED_CIRCUIT_ID;

  function getQty(id: string) { return itemQty[id] ?? 1; }
  function setQty(id: string, q: number) { setItemQty(prev => ({ ...prev, [id]: Math.max(1, q) })); }

  function addToBuild(equipmentId: string) {
    dispatch({ type: 'ADD_LINE_ITEM', payload: { equipmentId, circuitId: targetCircuit, quantity: getQty(equipmentId) } });
  }

  function toggleSelected(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addAllSelected() {
    if (selected.size === 0) return;
    dispatch({
      type: 'ADD_LINE_ITEMS_BULK',
      payload: Array.from(selected).map(id => ({ equipmentId: id, circuitId: targetCircuit, quantity: getQty(id) })),
    });
    setSelected(new Set());
    setSelectMode(false);
  }

  function startEdit(eq: { id: string; watts: number; weightLbs: number }) {
    setEditingId(eq.id);
    setEditWatts(String(eq.watts));
    setEditWeight(String(eq.weightLbs));
  }

  function saveEdit() {
    if (!editingId) return;
    const w = parseFloat(editWatts);
    const wt = parseFloat(editWeight);
    if (!isNaN(w) || !isNaN(wt)) {
      setEquipmentOverride(editingId, {
        ...(isNaN(w) ? {} : { watts: w }),
        ...(isNaN(wt) ? {} : { weightLbs: wt }),
      });
    }
    setEditingId(null);
  }

  function resetOverride(id: string) {
    clearEquipmentOverride(id);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 border-b border-gray-800 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Equipment</h2>
          <button
            onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
            className={`text-xs px-2 py-1 rounded border transition-colors ${selectMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'}`}
          >
            {selectMode ? 'Cancel' : 'Multi-Select'}
          </button>
        </div>

        {/* Search with clear button */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search equipment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 pr-7 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-base leading-none"
            >×</button>
          )}
        </div>

        <div className="flex gap-1.5">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value as typeof deptFilter)}
            className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 focus:outline-none focus:border-blue-500">
            <option value="">All Depts</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={connectorFilter} onChange={e => setConnectorFilter(e.target.value)}
            className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 focus:outline-none focus:border-blue-500">
            <option value="">All Connectors</option>
            {connectorOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-1.5 items-center">
          <label className="text-xs text-gray-500 shrink-0">Add to:</label>
          <select value={targetCircuit} onChange={e => setSelectedCircuit(e.target.value)}
            className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 focus:outline-none focus:border-blue-500">
            <option value={UNASSIGNED_CIRCUIT_ID}>⚡ Quick Calc</option>
            {build.circuits.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Equipment list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(eq => {
          const isEditing = editingId === eq.id;
          const hasOverride = !!overrides[eq.id];
          const qty = getQty(eq.id);
          const isSelected = selected.has(eq.id);

          return (
            <div key={eq.id} className={`border-b border-gray-800/50 hover:bg-gray-800/40 group ${isSelected ? 'bg-blue-900/20' : ''}`}>
              <div className="flex items-center gap-2 px-3 py-2">
                {/* Checkbox in multi-select mode */}
                {selectMode && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(eq.id)}
                    className="shrink-0 accent-blue-500 w-4 h-4 cursor-pointer"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-200 truncate">{eq.name}</div>
                  <div className="flex gap-2 text-xs text-gray-500 items-center">
                    <span>{eq.department}</span>
                    <span className={`font-mono ${hasOverride ? 'text-blue-400' : ''}`}>{fmtWatts(eq.watts)}W</span>
                    <span className={hasOverride ? 'text-blue-400' : ''}>{eq.weightLbs}lb</span>
                    {hasOverride && <span className="text-[10px] text-blue-500">edited</span>}
                  </div>
                </div>

                {/* Edit button */}
                {!selectMode && (
                  <button
                    onClick={() => isEditing ? setEditingId(null) : startEdit(eq)}
                    className="shrink-0 px-1.5 py-1 text-xs text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit specs"
                  >&#9998;</button>
                )}

                {/* Qty input + Add button */}
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={e => setQty(eq.id, parseInt(e.target.value) || 1)}
                    className="w-10 px-1.5 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-center text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                    title="Quantity"
                  />
                  {!selectMode && (
                    <button
                      onClick={() => addToBuild(eq.id)}
                      className="px-2 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                    >+ Add</button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="px-3 pb-2 flex items-center gap-2">
                  <label className="text-[10px] text-gray-500">W:</label>
                  <input type="number" value={editWatts} onChange={e => setEditWatts(e.target.value)}
                    className="w-16 px-1.5 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-200 font-mono focus:outline-none focus:border-blue-500" />
                  <label className="text-[10px] text-gray-500">lbs:</label>
                  <input type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)}
                    className="w-16 px-1.5 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-200 font-mono focus:outline-none focus:border-blue-500" />
                  <button onClick={saveEdit} className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded">Save</button>
                  {hasOverride && (
                    <button onClick={() => resetOverride(eq.id)} className="px-2 py-1 text-xs text-gray-500 hover:text-red-400">Reset</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">No equipment found</div>
        )}
      </div>

      {/* Multi-select action bar */}
      {selectMode && (
        <div className="px-3 py-2 border-t border-blue-800/50 bg-blue-900/20 flex items-center justify-between">
          <span className="text-xs text-blue-300">{selected.size} item{selected.size !== 1 ? 's' : ''} selected</span>
          <button
            onClick={addAllSelected}
            disabled={selected.size === 0}
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            Add {selected.size > 0 ? selected.size : ''} to Build
          </button>
        </div>
      )}

      {/* Bundle Manager */}
      <BundleManager targetCircuit={targetCircuit} />

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full px-3 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors"
        >
          + Custom Equipment
        </button>
      </div>

      <AddCustomEquipment open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
