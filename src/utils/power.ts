import type { PowerAtVoltage } from '../types';
import { wireGauges } from '../data/wire-gauges';
import { generatorSizes } from '../data/generators';

/**
 * Compute apparent power (VA) from real power (W) and power factor.
 * VA = W / PF. Circuits are sized on VA, not watts.
 */
export function calcVA(watts: number, powerFactor: number): number {
  if (watts <= 0) return 0;
  const pf = Math.max(powerFactor, 0.01);
  return watts / pf;
}

/**
 * Compute amps from apparent power (VA).
 * Single-phase: I = VA / V
 * Three-phase:  I = VA / (V × √3)
 */
export function calcAmps(va: number, voltage: number, isThreePhase: boolean): number {
  if (voltage <= 0 || va <= 0) return 0;
  if (isThreePhase) {
    return va / (voltage * Math.sqrt(3));
  }
  return va / voltage;
}

/**
 * Build a PowerAtVoltage summary.
 * @param watts  Real power in watts (W)
 * @param totalVA  Apparent power in VA — defaults to watts if omitted (assumes PF=1.0)
 */
export function calcPowerAtVoltage(watts: number, totalVA?: number): PowerAtVoltage {
  const va = totalVA ?? watts;
  return {
    watts,
    va,
    amps120: va > 0 ? va / 120 : 0,
    amps208: va > 0 ? va / 208 : 0,
    amps240: va > 0 ? va / 240 : 0,
  };
}

/**
 * Suggest minimum cable AWG for continuous loads per NEC 215.2(A)(1).
 * Wire must be rated for amps × 1.25 (125% continuous load rule).
 */
export function suggestCableAWG(amps: number): { awg: string; desc: string } | null {
  if (amps <= 0) return null;
  const necContinuous = amps * 1.25;
  const gauge = wireGauges.find(g => g.ampacity >= necContinuous);
  if (!gauge) return { awg: '4/0+', desc: 'Exceeds standard wire gauge — consult electrician' };
  return { awg: gauge.awg, desc: `#${gauge.awg} AWG (${gauge.typicalUse})` };
}

/**
 * Recommend a generator size.
 * Generators are rated in kVA. Size = totalVA × 1.25 safety factor.
 */
export function recommendGenerator(totalVA: number): { label: string; requiredVA: number } {
  const required = totalVA * 1.25;
  const gen = generatorSizes.find(g => g.watts >= required);
  return {
    label: gen ? gen.label : '500 kW+',
    requiredVA: required,
  };
}

export function necWarning(amps: number, capacityAmps: number): boolean {
  if (capacityAmps <= 0) return false;
  return amps > capacityAmps * 0.8;
}

export function utilizationPercent(amps: number, capacityAmps: number): number {
  if (capacityAmps <= 0) return 0;
  return (amps / capacityAmps) * 100;
}

export function utilizationColor(pct: number): string {
  if (pct > 100) return 'red';
  if (pct >= 80) return 'yellow';
  return 'green';
}
