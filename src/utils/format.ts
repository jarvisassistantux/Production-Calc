export function fmtAmps(amps: number): string {
  return amps.toFixed(1);
}

export function fmtWatts(watts: number): string {
  return watts.toLocaleString();
}

export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

export function fmtWeight(lbs: number, unit: 'lbs' | 'kg' = 'lbs'): string {
  if (unit === 'kg') {
    return `${lbsToKg(lbs).toFixed(1)} kg`;
  }
  return `${lbs.toFixed(1)} lbs`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
