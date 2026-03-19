import { useState } from 'react';
import { BuildProvider, useBuild } from './context/BuildContext';
import { EquipmentBrowser } from './components/equipment/EquipmentBrowser';
import { BuildSheet } from './components/build/BuildSheet';
import { StickyDashboard } from './components/dashboard/StickyDashboard';
import { ExportMenu } from './components/export/ExportMenu';
import { PrintView } from './components/export/PrintView';
import { SoundCalc } from './components/sound/SoundCalc';

type AppMode = 'power' | 'sound';
type MobileTab = 'equipment' | 'build' | 'dashboard' | 'sound';

function AppContent() {
  const { build, dispatch } = useBuild();
  const [appMode, setAppMode] = useState<AppMode>('power');
  const [mobileTab, setMobileTab] = useState<MobileTab>('build');

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-950 text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between px-3 md:px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-lg shrink-0">&#9889;</span>
          <h1 className="text-base font-bold text-gray-100 tracking-tight shrink-0 hidden sm:block">PowerCalc</h1>
          <span className="text-gray-600 hidden sm:block">|</span>
          <input
            value={build.name}
            onChange={e => dispatch({ type: 'SET_BUILD_NAME', payload: e.target.value })}
            className="px-2 py-1 bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 text-sm text-gray-300 focus:outline-none min-w-0 w-full sm:max-w-[200px] md:max-w-[280px]"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Mode toggle */}
          <div className="flex gap-1 border border-gray-700 rounded p-0.5">
            <button
              onClick={() => setAppMode('power')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                appMode === 'power' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              ⚡ Power
            </button>
            <button
              onClick={() => setAppMode('sound')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                appMode === 'sound' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              🔊 Sound
            </button>
          </div>
          <ExportMenu />
        </div>
      </header>

      {/* Desktop: mode-dependent layout */}
      {appMode === 'power' ? (
        <div className="flex-1 flex overflow-hidden">

          {/* Left — Equipment Browser */}
          <aside className={`
            w-full md:w-72 xl:w-80 border-r border-gray-800 flex-shrink-0 overflow-hidden flex flex-col
            ${mobileTab === 'equipment' ? 'flex' : 'hidden'} md:flex
          `}>
            <EquipmentBrowser />
          </aside>

          {/* Center — Build Sheet */}
          <main className={`
            flex-1 overflow-hidden min-w-0
            ${mobileTab === 'build' ? 'flex flex-col' : 'hidden'} md:flex md:flex-col
          `}>
            <BuildSheet />
          </main>

          {/* Right — Dashboard */}
          <aside className={`
            w-full md:w-64 xl:w-72 border-l border-gray-800 flex-shrink-0 overflow-hidden
            ${mobileTab === 'dashboard' ? 'flex flex-col' : 'hidden'} md:flex md:flex-col
          `}>
            <StickyDashboard />
          </aside>
        </div>
      ) : (
        /* Sound mode — full width, only visible on md+ when appMode=sound */
        <div className={`flex-1 overflow-auto ${mobileTab === 'sound' ? 'block' : 'hidden'} md:block`}>
          <SoundCalc />
        </div>
      )}

      {/* Mobile bottom tab bar — hidden on md+ */}
      <nav className="md:hidden flex border-t border-gray-800 bg-gray-900 shrink-0">
        {(() => {
          const totalItems = build.lineItems.length;
          return ([
            { id: 'equipment', label: 'Equipment', icon: '⊞', mode: 'power' as AppMode },
            { id: 'build',     label: 'Build',     icon: '⚡', mode: 'power' as AppMode, badge: totalItems > 0 ? totalItems : undefined },
            { id: 'dashboard', label: 'Dashboard', icon: '◉', mode: 'power' as AppMode },
            { id: 'sound',     label: 'Sound',     icon: '🔊', mode: 'sound' as AppMode },
          ] as { id: MobileTab; label: string; icon: string; mode: AppMode; badge?: number }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setMobileTab(tab.id); setAppMode(tab.mode); }}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors relative ${
                mobileTab === tab.id
                  ? 'text-amber-400 border-t-2 border-amber-400 -mt-px'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-base leading-none relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-0.5 rounded-full bg-amber-500 text-gray-950 text-[10px] font-bold flex items-center justify-center leading-none">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </span>
              <span>{tab.label}</span>
            </button>
          ));
        })()}
      </nav>

      {/* Hidden print view for PDF export */}
      <PrintView />
    </div>
  );
}

export default function App() {
  return (
    <BuildProvider>
      <AppContent />
    </BuildProvider>
  );
}
