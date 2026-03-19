export interface SpeakerSpec {
  id: string;
  name: string;
  manufacturer: string;
  type: 'line-array' | 'point-source';
  verticalDeg: number;       // per-box vertical coverage
  horizontalDeg: number;     // horizontal coverage
  boxHeightFt: number;       // physical height per box in ft
  refSplAt1m: number;        // continuous SPL @ 1m (dB)
  watts: number;
  weightLbs: number;
  maxBoxes: number;
  defaultBoxes: number;
  freqLow: number;           // Hz
  freqHigh: number;          // Hz
  notes: string;
}

export const SPEAKERS: SpeakerSpec[] = [
  {
    id: 'rcf-hdl20a',
    name: 'HDL 20-A',
    manufacturer: 'RCF',
    type: 'line-array',
    verticalDeg: 15,
    horizontalDeg: 100,
    boxHeightFt: 0.70,
    refSplAt1m: 128,
    watts: 700,
    weightLbs: 33,
    maxBoxes: 6,
    defaultBoxes: 2,
    freqLow: 70,
    freqHigh: 20000,
    notes: 'Ground-stack or flown. DSP presets via RCF RDNet software.',
  },
  {
    id: 'rcf-hdl10a',
    name: 'HDL 10-A',
    manufacturer: 'RCF',
    type: 'line-array',
    verticalDeg: 10,
    horizontalDeg: 100,
    boxHeightFt: 0.58,
    refSplAt1m: 125,
    watts: 500,
    weightLbs: 20,
    maxBoxes: 8,
    defaultBoxes: 3,
    freqLow: 80,
    freqHigh: 20000,
    notes: 'Compact line array. Good for low-ceiling rooms under 14 ft.',
  },
  {
    id: 'qsc-k12-2',
    name: 'K12.2',
    manufacturer: 'QSC',
    type: 'point-source',
    verticalDeg: 75,
    horizontalDeg: 75,
    boxHeightFt: 1.77,
    refSplAt1m: 126,
    watts: 2000,
    weightLbs: 34,
    maxBoxes: 2,
    defaultBoxes: 1,
    freqLow: 53,
    freqHigh: 20000,
    notes: 'Wide 75°×75° pattern. Suited for rooms under 60 ft throw.',
  },
  {
    id: 'qsc-k10-2',
    name: 'K10.2',
    manufacturer: 'QSC',
    type: 'point-source',
    verticalDeg: 75,
    horizontalDeg: 75,
    boxHeightFt: 1.55,
    refSplAt1m: 124,
    watts: 2000,
    weightLbs: 26,
    maxBoxes: 2,
    defaultBoxes: 1,
    freqLow: 55,
    freqHigh: 20000,
    notes: 'Compact 10" cabinet. Best for rooms under 50 ft throw.',
  },
  {
    id: 'jbl-prx815w',
    name: 'PRX815W',
    manufacturer: 'JBL',
    type: 'point-source',
    verticalDeg: 60,
    horizontalDeg: 90,
    boxHeightFt: 2.25,
    refSplAt1m: 128,
    watts: 1500,
    weightLbs: 44,
    maxBoxes: 2,
    defaultBoxes: 1,
    freqLow: 45,
    freqHigh: 20000,
    notes: 'High-output 15". Built-in Wi-Fi for remote DSP control.',
  },
  {
    id: 'ev-zlx15p',
    name: 'ZLX-15P',
    manufacturer: 'Electro-Voice',
    type: 'point-source',
    verticalDeg: 60,
    horizontalDeg: 90,
    boxHeightFt: 2.17,
    refSplAt1m: 122,
    watts: 1000,
    weightLbs: 39,
    maxBoxes: 2,
    defaultBoxes: 1,
    freqLow: 52,
    freqHigh: 20000,
    notes: 'Workhorse 15" PA. Good value for small-medium rooms.',
  },
  {
    id: 'yamaha-dxr12',
    name: 'DXR12mkII',
    manufacturer: 'Yamaha',
    type: 'point-source',
    verticalDeg: 60,
    horizontalDeg: 90,
    boxHeightFt: 1.90,
    refSplAt1m: 125,
    watts: 1100,
    weightLbs: 37,
    maxBoxes: 2,
    defaultBoxes: 1,
    freqLow: 55,
    freqHigh: 20000,
    notes: 'Flat, accurate response. Popular for corporate / speech-heavy events.',
  },
];

export const DEFAULT_SPEAKER = SPEAKERS[0];
