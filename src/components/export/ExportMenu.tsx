import { useState, useRef, useEffect } from 'react';
import { useBuild } from '../../context/BuildContext';
import { useEquipmentDB } from '../../hooks/useEquipmentDB';
import { useCalculations } from '../../hooks/useCalculations';
import { Modal } from '../shared/Modal';
import { generateId } from '../../utils/format';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Build } from '../../types';

const TEMPLATES_KEY = 'powercalc-templates';

interface TemplateMeta { id: string; name: string; updatedAt: string }

function loadTemplates(): Build[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveTemplates(templates: Build[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function ExportMenu() {
  const { build, dispatch, savedBuilds, saveBuild, loadSavedBuild, deleteSavedBuild } = useBuild();
  const { allEquipment } = useEquipmentDB();
  const { circuitSummaries, grandTotals } = useCalculations(build, allEquipment);
  const [showMenu, setShowMenu] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [templates, setTemplates] = useState<TemplateMeta[]>(() =>
    loadTemplates().map(t => ({ id: t.id, name: t.name, updatedAt: t.updatedAt }))
  );
  const [templateNamePrompt, setTemplateNamePrompt] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  function exportCSV() {
    const rows = [['Circuit', 'Equipment', 'Department', 'Qty', 'Watts/Unit', 'VA/Unit', 'Total Watts', 'Total VA', 'Weight/Unit (lbs)', 'Total Weight (lbs)', 'Connector', 'Voltage'].join(',')];
    for (const cs of circuitSummaries) {
      for (const { lineItem, equipment } of cs.items) {
        const unitVA = Math.round(equipment.watts / equipment.powerFactor);
        rows.push([
          `"${cs.circuit.name}"`,
          `"${equipment.name}"`,
          lineItem.departmentOverride ?? equipment.department,
          lineItem.quantity,
          equipment.watts,
          unitVA,
          equipment.watts * lineItem.quantity,
          unitVA * lineItem.quantity,
          equipment.weightLbs,
          equipment.weightLbs * lineItem.quantity,
          equipment.connector,
          equipment.voltage,
        ].join(','));
      }
    }
    rows.push('');
    rows.push(`Grand Total,,,,,,"${grandTotals.power.watts}","${Math.round(grandTotals.power.va)}",,"${grandTotals.totalWeightLbs.toFixed(1)}",,`);
    rows.push(`,,,,,,,,,,Generator: ${grandTotals.generatorRecommendation},,`);

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${build.name.replace(/[^a-z0-9]/gi, '_')}_loadsheet.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  }

  async function exportPDF() {
    setShowMenu(false);
    const el = document.getElementById('print-area');
    if (!el) { window.print(); return; }
    el.style.display = 'block';
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0f1117' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${build.name.replace(/[^a-z0-9]/gi, '_')}_loadsheet.pdf`);
    } finally {
      el.style.display = 'none';
    }
  }

  function saveAsTemplate() {
    if (!templateName.trim()) return;
    const all = loadTemplates();
    const template: Build = { ...build, id: generateId(), name: templateName.trim(), updatedAt: new Date().toISOString() };
    all.push(template);
    saveTemplates(all);
    setTemplates(all.map(t => ({ id: t.id, name: t.name, updatedAt: t.updatedAt })));
    setTemplateName('');
    setTemplateNamePrompt(false);
  }

  function loadTemplate(id: string) {
    const all = loadTemplates();
    const tmpl = all.find(t => t.id === id);
    if (!tmpl) return;
    // Load as a new build (new ID, fresh timestamps)
    dispatch({ type: 'LOAD_BUILD', payload: { ...tmpl, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
    setShowSaveLoad(false);
  }

  function deleteTemplate(id: string) {
    const next = loadTemplates().filter(t => t.id !== id);
    saveTemplates(next);
    setTemplates(next.map(t => ({ id: t.id, name: t.name, updatedAt: t.updatedAt })));
  }

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex gap-2">
        <button
          onClick={() => setShowSaveLoad(true)}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded border border-gray-700 transition-colors"
        >
          Save/Load
        </button>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded border border-gray-700 transition-colors"
        >
          Export ▾
        </button>
      </div>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <button onClick={exportPDF} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-t-lg">PDF (Venue Doc)</button>
          <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">CSV</button>
          <button onClick={() => { window.print(); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-b-lg">Print</button>
        </div>
      )}

      <Modal open={showSaveLoad} onClose={() => { setShowSaveLoad(false); setTemplateNamePrompt(false); }} title="Save / Load Build">
        <div className="space-y-4">
          {/* Build name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Build Name</label>
            <input
              value={build.name}
              onChange={e => dispatch({ type: 'SET_BUILD_NAME', payload: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => { saveBuild(); }} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors">
              Save Build
            </button>
            <button onClick={() => dispatch({ type: 'NEW_BUILD' })} className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded border border-gray-700 transition-colors">
              New Build
            </button>
          </div>

          {/* Save as template */}
          {!templateNamePrompt ? (
            <button
              onClick={() => { setTemplateName(build.name + ' Template'); setTemplateNamePrompt(true); }}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-amber-400 text-sm rounded border border-amber-900/40 transition-colors"
            >
              Save as Template
            </button>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs text-gray-400">Template name</label>
              <div className="flex gap-2">
                <input
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveAsTemplate()}
                  autoFocus
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
                <button onClick={saveAsTemplate} className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded">Save</button>
                <button onClick={() => setTemplateNamePrompt(false)} className="px-2 py-2 text-gray-500 hover:text-gray-300 text-sm">✕</button>
              </div>
            </div>
          )}

          {/* Saved builds */}
          {savedBuilds.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 uppercase mb-2">Saved Builds</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {savedBuilds.map(b => (
                  <div key={b.id} className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded hover:bg-gray-700">
                    <button onClick={() => { loadSavedBuild(b.id); setShowSaveLoad(false); }} className="text-sm text-gray-200 text-left flex-1 truncate">
                      {b.name}
                    </button>
                    <button onClick={() => deleteSavedBuild(b.id)} className="text-gray-500 hover:text-red-400 text-xs ml-2">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <div className="text-xs text-amber-600 uppercase mb-2">Templates</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-amber-900/20 border border-amber-900/30 rounded hover:bg-amber-900/30">
                    <button onClick={() => loadTemplate(t.id)} className="text-sm text-amber-200 text-left flex-1 truncate">
                      {t.name}
                    </button>
                    <button onClick={() => deleteTemplate(t.id)} className="text-gray-500 hover:text-red-400 text-xs ml-2">✕</button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-1">Loading a template creates a new build — your current build is not overwritten.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
