import { useMemo } from 'react';
import type { Build, EquipmentItem, CircuitPowerSummary, DepartmentSummary, GrandTotals, Department } from '../types';
import { calcAmps, calcVA, calcPowerAtVoltage, suggestCableAWG, recommendGenerator, utilizationPercent, necWarning } from '../utils/power';
import { lbsToKg } from '../utils/format';

export function useCalculations(build: Build, allEquipment: EquipmentItem[]) {
  const equipMap = useMemo(() => {
    const m = new Map<string, EquipmentItem>();
    allEquipment.forEach(e => m.set(e.id, e));
    return m;
  }, [allEquipment]);

  const circuitSummaries: CircuitPowerSummary[] = useMemo(() => {
    return build.circuits.map(circuit => {
      const items = build.lineItems
        .filter(li => li.circuitId === circuit.id)
        .map(li => {
          const eq = equipMap.get(li.equipmentId);
          return eq ? { lineItem: li, equipment: eq } : null;
        })
        .filter((x): x is { lineItem: typeof build.lineItems[0]; equipment: EquipmentItem } => x !== null);

      const totalWatts = items.reduce((sum, { lineItem, equipment }) =>
        sum + equipment.watts * lineItem.quantity, 0);

      // VA = watts / PF per item — this is what the circuit wiring actually carries
      const totalVA = items.reduce((sum, { lineItem, equipment }) =>
        sum + calcVA(equipment.watts, equipment.powerFactor) * lineItem.quantity, 0);

      const totalWeightLbs = items.reduce((sum, { lineItem, equipment }) =>
        sum + equipment.weightLbs * lineItem.quantity, 0);

      const ampsAtCircuitVoltage = calcAmps(totalVA, circuit.voltage, circuit.isThreePhase);
      const util = utilizationPercent(ampsAtCircuitVoltage, circuit.capacityAmps);
      const cable = suggestCableAWG(ampsAtCircuitVoltage);

      return {
        circuitId: circuit.id,
        circuit,
        totalWatts,
        totalVA,
        ampsAtCircuitVoltage,
        utilizationPercent: util,
        power: calcPowerAtVoltage(totalWatts, totalVA),
        totalWeightLbs,
        suggestedCableAWG: cable?.awg ?? null,
        suggestedCableDesc: cable?.desc ?? '',
        necWarning: necWarning(ampsAtCircuitVoltage, circuit.capacityAmps),
        items,
      };
    });
  }, [build.circuits, build.lineItems, equipMap]);

  const departmentSummaries: DepartmentSummary[] = useMemo(() => {
    const deptMap = new Map<Department, { watts: number; va: number; weightLbs: number; count: number }>();
    build.lineItems.forEach(li => {
      const eq = equipMap.get(li.equipmentId);
      if (!eq) return;
      const dept = li.departmentOverride ?? eq.department;
      const existing = deptMap.get(dept) ?? { watts: 0, va: 0, weightLbs: 0, count: 0 };
      existing.watts += eq.watts * li.quantity;
      existing.va += calcVA(eq.watts, eq.powerFactor) * li.quantity;
      existing.weightLbs += eq.weightLbs * li.quantity;
      existing.count += li.quantity;
      deptMap.set(dept, existing);
    });
    return Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      power: calcPowerAtVoltage(data.watts, data.va),
      totalWeightLbs: data.weightLbs,
      itemCount: data.count,
    })).sort((a, b) => b.power.watts - a.power.watts);
  }, [build.lineItems, equipMap]);

  const grandTotals: GrandTotals = useMemo(() => {
    const totalWatts = circuitSummaries.reduce((s, c) => s + c.totalWatts, 0);
    const totalVAAssigned = circuitSummaries.reduce((s, c) => s + c.totalVA, 0);
    const totalWeightLbs = circuitSummaries.reduce((s, c) => s + c.totalWeightLbs, 0);
    const totalItems = build.lineItems.reduce((s, li) => s + li.quantity, 0);

    // Also include unassigned items (Quick Calc bucket)
    const unassignedItems = build.lineItems.filter(li => !build.circuits.some(c => c.id === li.circuitId));
    const unassignedWatts = unassignedItems.reduce((s, li) => {
      const eq = equipMap.get(li.equipmentId);
      return s + (eq ? eq.watts * li.quantity : 0);
    }, 0);
    const unassignedVA = unassignedItems.reduce((s, li) => {
      const eq = equipMap.get(li.equipmentId);
      return s + (eq ? calcVA(eq.watts, eq.powerFactor) * li.quantity : 0);
    }, 0);
    const unassignedWeight = unassignedItems.reduce((s, li) => {
      const eq = equipMap.get(li.equipmentId);
      return s + (eq ? eq.weightLbs * li.quantity : 0);
    }, 0);

    const allWatts = totalWatts + unassignedWatts;
    const allVA = totalVAAssigned + unassignedVA;
    const allWeight = totalWeightLbs + unassignedWeight;
    const gen = recommendGenerator(allVA);

    return {
      power: calcPowerAtVoltage(allWatts, allVA),
      totalWeightLbs: allWeight,
      totalItems,
      generatorVARequired: gen.requiredVA,
      generatorRecommendation: gen.label,
      truckUtilizationPercent: build.truckPayloadLimitLbs > 0
        ? (allWeight / build.truckPayloadLimitLbs) * 100
        : 0,
    };
  }, [circuitSummaries, build.lineItems, build.circuits, build.truckPayloadLimitLbs, equipMap]);

  return { circuitSummaries, departmentSummaries, grandTotals, equipMap, lbsToKg };
}
