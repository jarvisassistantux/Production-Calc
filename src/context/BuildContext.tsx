import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Build, Circuit, EquipmentItem, Department } from '../types';
import { generateId } from '../utils/format';

const STORAGE_KEY = 'powercalc-current-build';
const SAVED_BUILDS_KEY = 'powercalc-saved-builds';

function createEmptyBuild(name = 'Untitled Build'): Build {
  return {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    circuits: [],
    lineItems: [],
    truckPayloadLimitLbs: 10000,
    customEquipment: [],
  };
}

type BuildAction =
  | { type: 'SET_BUILD_NAME'; payload: string }
  | { type: 'SET_EVENT_INFO'; payload: { venue?: string; date?: string; notes?: string } }
  | { type: 'ADD_CIRCUIT'; payload: Omit<Circuit, 'id'> }
  | { type: 'REMOVE_CIRCUIT'; payload: string }
  | { type: 'UPDATE_CIRCUIT'; payload: Circuit }
  | { type: 'ADD_LINE_ITEM'; payload: { equipmentId: string; circuitId: string; quantity?: number } }
  | { type: 'ADD_LINE_ITEMS_BULK'; payload: Array<{ equipmentId: string; circuitId: string; quantity: number }> }
  | { type: 'REMOVE_LINE_ITEM'; payload: string }
  | { type: 'UPDATE_LINE_ITEM_QTY'; payload: { id: string; quantity: number } }
  | { type: 'MOVE_ITEM_TO_CIRCUIT'; payload: { id: string; circuitId: string } }
  | { type: 'SET_DEPARTMENT_OVERRIDE'; payload: { id: string; department: Department | undefined } }
  | { type: 'SET_TRUCK_PAYLOAD'; payload: number }
  | { type: 'LOAD_BUILD'; payload: Build }
  | { type: 'NEW_BUILD'; payload?: string }
  | { type: 'ADD_CUSTOM_EQUIPMENT'; payload: Omit<EquipmentItem, 'id' | 'isCustom'> }
  | { type: 'REMOVE_CUSTOM_EQUIPMENT'; payload: string };

function buildReducer(state: Build, action: BuildAction): Build {
  const updated = { ...state, updatedAt: new Date().toISOString() };
  switch (action.type) {
    case 'SET_BUILD_NAME':
      return { ...updated, name: action.payload };

    case 'SET_EVENT_INFO':
      return {
        ...updated,
        eventVenue: action.payload.venue ?? state.eventVenue,
        eventDate: action.payload.date ?? state.eventDate,
        eventNotes: action.payload.notes ?? state.eventNotes,
      };

    case 'ADD_CIRCUIT':
      return {
        ...updated,
        circuits: [...state.circuits, { ...action.payload, id: generateId() }],
      };

    case 'REMOVE_CIRCUIT': {
      return {
        ...updated,
        circuits: state.circuits.filter(c => c.id !== action.payload),
        lineItems: state.lineItems.filter(li => li.circuitId !== action.payload),
      };
    }

    case 'UPDATE_CIRCUIT':
      return {
        ...updated,
        circuits: state.circuits.map(c => c.id === action.payload.id ? action.payload : c),
      };

    case 'ADD_LINE_ITEM': {
      const { equipmentId, circuitId, quantity = 1 } = action.payload;
      const existing = state.lineItems.find(li => li.equipmentId === equipmentId && li.circuitId === circuitId);
      if (existing) {
        return {
          ...updated,
          lineItems: state.lineItems.map(li =>
            li.id === existing.id ? { ...li, quantity: li.quantity + quantity } : li
          ),
        };
      }
      return {
        ...updated,
        lineItems: [...state.lineItems, { id: generateId(), equipmentId, quantity, circuitId }],
      };
    }

    case 'ADD_LINE_ITEMS_BULK': {
      let lineItems = [...state.lineItems];
      for (const { equipmentId, circuitId, quantity } of action.payload) {
        const existing = lineItems.find(li => li.equipmentId === equipmentId && li.circuitId === circuitId);
        if (existing) {
          lineItems = lineItems.map(li =>
            li.id === existing.id ? { ...li, quantity: li.quantity + quantity } : li
          );
        } else {
          lineItems.push({ id: generateId(), equipmentId, quantity, circuitId });
        }
      }
      return { ...updated, lineItems };
    }

    case 'REMOVE_LINE_ITEM':
      return {
        ...updated,
        lineItems: state.lineItems.filter(li => li.id !== action.payload),
      };

    case 'UPDATE_LINE_ITEM_QTY':
      return {
        ...updated,
        lineItems: state.lineItems.map(li =>
          li.id === action.payload.id
            ? { ...li, quantity: Math.max(0, action.payload.quantity) }
            : li
        ),
      };

    case 'MOVE_ITEM_TO_CIRCUIT':
      return {
        ...updated,
        lineItems: state.lineItems.map(li =>
          li.id === action.payload.id ? { ...li, circuitId: action.payload.circuitId } : li
        ),
      };

    case 'SET_DEPARTMENT_OVERRIDE':
      return {
        ...updated,
        lineItems: state.lineItems.map(li =>
          li.id === action.payload.id ? { ...li, departmentOverride: action.payload.department } : li
        ),
      };

    case 'SET_TRUCK_PAYLOAD':
      return { ...updated, truckPayloadLimitLbs: action.payload };

    case 'LOAD_BUILD':
      return action.payload;

    case 'NEW_BUILD':
      return createEmptyBuild(action.payload);

    case 'ADD_CUSTOM_EQUIPMENT': {
      const eq: EquipmentItem = { ...action.payload, id: generateId(), isCustom: true };
      return { ...updated, customEquipment: [...state.customEquipment, eq] };
    }

    case 'REMOVE_CUSTOM_EQUIPMENT':
      return {
        ...updated,
        customEquipment: state.customEquipment.filter(e => e.id !== action.payload),
        lineItems: state.lineItems.filter(li => li.equipmentId !== action.payload),
      };

    default:
      return state;
  }
}

/** Migrate builds saved before powerFactor was added — default to 0.95 */
function migrateBuild(build: Build): Build {
  return {
    ...build,
    customEquipment: build.customEquipment.map(eq => ({
      ...eq,
      powerFactor: eq.powerFactor ?? 0.95,
    })),
  };
}

function loadBuild(): Build {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateBuild(JSON.parse(raw));
  } catch { /* ignore */ }
  return createEmptyBuild();
}

interface BuildContextType {
  build: Build;
  dispatch: React.Dispatch<BuildAction>;
  savedBuilds: { id: string; name: string; updatedAt: string }[];
  saveBuild: () => void;
  loadSavedBuild: (id: string) => void;
  deleteSavedBuild: (id: string) => void;
}

const BuildContext = createContext<BuildContextType | null>(null);

export function BuildProvider({ children }: { children: React.ReactNode }) {
  const [build, dispatch] = useReducer(buildReducer, null, loadBuild);

  // Auto-save current build
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    }, 300);
    return () => clearTimeout(timer);
  }, [build]);

  const getSavedBuilds = useCallback((): Build[] => {
    try {
      const raw = localStorage.getItem(SAVED_BUILDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [];
  }, []);

  const savedBuilds = getSavedBuilds().map(b => ({ id: b.id, name: b.name, updatedAt: b.updatedAt }));

  const saveBuild = useCallback(() => {
    const builds = getSavedBuilds();
    const idx = builds.findIndex(b => b.id === build.id);
    if (idx >= 0) {
      builds[idx] = build;
    } else {
      builds.push(build);
    }
    localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(builds));
  }, [build, getSavedBuilds]);

  const loadSavedBuild = useCallback((id: string) => {
    const builds = getSavedBuilds();
    const found = builds.find(b => b.id === id);
    if (found) dispatch({ type: 'LOAD_BUILD', payload: migrateBuild(found) });
  }, [getSavedBuilds]);

  const deleteSavedBuild = useCallback((id: string) => {
    const builds = getSavedBuilds().filter(b => b.id !== id);
    localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(builds));
  }, [getSavedBuilds]);

  return (
    <BuildContext.Provider value={{ build, dispatch, savedBuilds, saveBuild, loadSavedBuild, deleteSavedBuild }}>
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error('useBuild must be used within BuildProvider');
  return ctx;
}
