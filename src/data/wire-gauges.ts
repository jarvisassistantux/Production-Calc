import type { WireGaugeSpec } from '../types';

export const wireGauges: WireGaugeSpec[] = [
  { awg: '14', ampacity: 15, typicalUse: '15A circuits' },
  { awg: '12', ampacity: 20, typicalUse: '20A circuits' },
  { awg: '10', ampacity: 30, typicalUse: '30A circuits' },
  { awg: '8',  ampacity: 40, typicalUse: '40A circuits' },
  { awg: '6',  ampacity: 55, typicalUse: '50A circuits' },
  { awg: '4',  ampacity: 70, typicalUse: '60A circuits' },
  { awg: '2',  ampacity: 95, typicalUse: '100A sub-feeds' },
  { awg: '1/0', ampacity: 125, typicalUse: 'Large sub-feeds' },
  { awg: '2/0', ampacity: 145, typicalUse: '150A feeds' },
  { awg: '4/0', ampacity: 195, typicalUse: '200A feeder' },
];
