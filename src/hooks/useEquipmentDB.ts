import { useState, useMemo, useCallback } from 'react';
import { defaultEquipment } from '../data/equipment-database';
import { useBuild } from '../context/BuildContext';
import type { EquipmentItem, Department } from '../types';

const OVERRIDES_KEY = 'powercalc-equipment-overrides';

export type EquipmentOverride = { watts?: number; weightLbs?: number };
type OverridesMap = Record<string, EquipmentOverride>;

function loadOverrides(): OverridesMap {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveOverrides(overrides: OverridesMap) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

export function useEquipmentDB() {
  const { build } = useBuild();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | ''>('');
  const [connectorFilter, setConnectorFilter] = useState('');
  const [overrides, setOverrides] = useState<OverridesMap>(loadOverrides);

  const setEquipmentOverride = useCallback((id: string, override: EquipmentOverride) => {
    setOverrides(prev => {
      const next = { ...prev, [id]: { ...prev[id], ...override } };
      saveOverrides(next);
      return next;
    });
  }, []);

  const clearEquipmentOverride = useCallback((id: string) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[id];
      saveOverrides(next);
      return next;
    });
  }, []);

  const allEquipment: EquipmentItem[] = useMemo(() => {
    const base = [...defaultEquipment, ...build.customEquipment];
    return base.map(eq => {
      const ov = overrides[eq.id];
      if (!ov) return eq;
      return {
        ...eq,
        watts: ov.watts ?? eq.watts,
        weightLbs: ov.weightLbs ?? eq.weightLbs,
      };
    });
  }, [build.customEquipment, overrides]);

  const filtered = useMemo(() => {
    let items = allEquipment;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(e => e.name.toLowerCase().includes(q));
    }
    if (deptFilter) {
      items = items.filter(e => e.department === deptFilter);
    }
    if (connectorFilter) {
      items = items.filter(e => e.connector === connectorFilter);
    }
    return items;
  }, [allEquipment, search, deptFilter, connectorFilter]);

  const connectorOptions = useMemo(() => {
    const set = new Set(allEquipment.map(e => e.connector));
    return Array.from(set).sort();
  }, [allEquipment]);

  return {
    allEquipment,
    filtered,
    search, setSearch,
    deptFilter, setDeptFilter,
    connectorFilter, setConnectorFilter,
    connectorOptions,
    getEquipmentById: (id: string) => allEquipment.find(e => e.id === id),
    overrides,
    setEquipmentOverride,
    clearEquipmentOverride,
  };
}
