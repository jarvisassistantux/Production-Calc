import type { EquipmentItem, BuildLineItem } from '../types';
import { calcVA } from './power';

export interface PackedLine {
  lineNumber: number;
  items: Array<{ equipment: EquipmentItem; count: number }>;
  totalWatts: number;
  totalVA: number;
  totalAmps: number;
  utilizationPercent: number;
}

export interface PackResult {
  lines: PackedLine[];
  totalLines: number;
  totalWatts: number;
  totalVA: number;
  voltage: number;
  ampacity: number;
}

/**
 * Bin-pack equipment into circuit lines using first-fit-decreasing.
 *
 * Breakers and wiring are rated in amps, which is driven by apparent power (VA),
 * not real power (watts). Each line's VA limit = ampacity × voltage × 0.8 (NEC 80% rule).
 *
 * Equipment units are expanded (qty 5 → 5 units), sorted by VA descending,
 * then placed into the first line with sufficient remaining VA headroom.
 */
export function packIntoLines(
  lineItems: BuildLineItem[],
  equipMap: Map<string, EquipmentItem>,
  voltage: number,
  ampacity: number,
): PackResult {
  // Circuit limit in VA (NEC 80% continuous load rule)
  const maxVAPerLine = ampacity * voltage * 0.8;

  // Expand all items into individual units, sorted by VA descending (largest first)
  const units: EquipmentItem[] = [];
  for (const li of lineItems) {
    const eq = equipMap.get(li.equipmentId);
    if (!eq || eq.watts <= 0) continue; // skip passive gear
    for (let i = 0; i < li.quantity; i++) {
      units.push(eq);
    }
  }
  units.sort((a, b) => calcVA(b.watts, b.powerFactor) - calcVA(a.watts, a.powerFactor));

  // First-fit-decreasing bin packing (by VA)
  const bins: Array<{ items: EquipmentItem[]; wattsUsed: number; vaUsed: number }> = [];

  for (const unit of units) {
    const unitVA = calcVA(unit.watts, unit.powerFactor);
    let placed = false;
    for (const bin of bins) {
      if (bin.vaUsed + unitVA <= maxVAPerLine) {
        bin.items.push(unit);
        bin.wattsUsed += unit.watts;
        bin.vaUsed += unitVA;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins.push({ items: [unit], wattsUsed: unit.watts, vaUsed: unitVA });
    }
  }

  // Convert bins to PackedLine format (aggregate same equipment)
  const lines: PackedLine[] = bins.map((bin, idx) => {
    const countMap = new Map<string, { equipment: EquipmentItem; count: number }>();
    for (const eq of bin.items) {
      const existing = countMap.get(eq.id);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(eq.id, { equipment: eq, count: 1 });
      }
    }
    const totalAmps = voltage > 0 ? bin.vaUsed / voltage : 0;
    return {
      lineNumber: idx + 1,
      items: Array.from(countMap.values()),
      totalWatts: bin.wattsUsed,
      totalVA: bin.vaUsed,
      totalAmps,
      utilizationPercent: (totalAmps / ampacity) * 100,
    };
  });

  const totalWatts = units.reduce((s, u) => s + u.watts, 0);
  const totalVA = units.reduce((s, u) => s + calcVA(u.watts, u.powerFactor), 0);

  return {
    lines,
    totalLines: lines.length,
    totalWatts,
    totalVA,
    voltage,
    ampacity,
  };
}
