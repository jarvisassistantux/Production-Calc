export interface MicSpec {
  id: string;
  name: string;
  manufacturer: string;
  capsuleType: 'dynamic' | 'condenser' | 'ribbon';
  wireless: boolean;
  pattern: 'cardioid' | 'supercardioid' | 'hypercardioid' | 'omni';
  freqLow: number;
  freqHigh: number;
  hpfHz: number;              // recommended HPF cut-off
  gainNotes: string;          // preamp gain guidance
  useCases: string[];
  eqTips: string[];
  feedbackNotes: string;
  feedbackResistance: 'high' | 'medium' | 'low';
  wirelessNotes?: string;
}

export const MICS: MicSpec[] = [
  {
    id: 'sm58',
    name: 'SM58',
    manufacturer: 'Shure',
    capsuleType: 'dynamic',
    wireless: false,
    pattern: 'cardioid',
    freqLow: 50,
    freqHigh: 15000,
    hpfHz: 100,
    gainNotes: '+30 to +50 dB preamp gain typical for vocals.',
    useCases: ['Lead vocals', 'Backup vocals', 'Speeches', 'Announcements'],
    eqTips: [
      'HPF at 100 Hz — kills handling noise and stage rumble',
      '200–300 Hz: cut 2–3 dB to reduce proximity boominess (especially close-mic singers)',
      '3–5 kHz: +1–2 dB for presence and intelligibility',
      '10 kHz: gentle shelf boost for brightness if voice sounds dull',
    ],
    feedbackNotes:
      'Cardioid rejects rear well. Keep mic pointed away from mains and monitors. Wired SM58 has a built-in low-cut switch — engage it.',
    feedbackResistance: 'high',
  },
  {
    id: 'sm57',
    name: 'SM57',
    manufacturer: 'Shure',
    capsuleType: 'dynamic',
    wireless: false,
    pattern: 'cardioid',
    freqLow: 40,
    freqHigh: 15000,
    hpfHz: 80,
    gainNotes: '+20 to +40 dB preamp gain for instruments.',
    useCases: ['Snare drum', 'Guitar amp', 'Brass', 'Acoustic guitar (with cap)'],
    eqTips: [
      'HPF at 80 Hz — removes low-end rumble',
      'Snare: boost 5–8 kHz for crack; notch 400 Hz for boxiness',
      'Guitar amp: cut 200–400 Hz if muddy; boost 3 kHz for bite',
      'Notch a narrow band at 1–2 kHz if it sounds harsh or nasal',
    ],
    feedbackNotes:
      'Very resistant to feedback when used close to the source. Less open-air feedback risk than vocal mics.',
    feedbackResistance: 'high',
  },
  {
    id: 'beta58a',
    name: 'Beta 58A',
    manufacturer: 'Shure',
    capsuleType: 'dynamic',
    wireless: false,
    pattern: 'supercardioid',
    freqLow: 50,
    freqHigh: 16000,
    hpfHz: 100,
    gainNotes: '+25 to +45 dB preamp gain.',
    useCases: ['Lead vocals on loud stages', 'Performers who move frequently'],
    eqTips: [
      'HPF at 100 Hz — always on',
      'Upper midrange presence hump at 4–6 kHz: cut 1–2 dB if vocals sound harsh',
      '200 Hz: reduce for proximity buildup on close-mic loud singers',
      'Bright capsule — minimal boost needed above 8 kHz',
    ],
    feedbackNotes:
      'Supercardioid: excellent rear rejection but two narrow side lobes at ±120°. Keep wedge monitors directly behind — not to the sides.',
    feedbackResistance: 'high',
  },
  {
    id: 'sennheiser-e835',
    name: 'e835',
    manufacturer: 'Sennheiser',
    capsuleType: 'dynamic',
    wireless: false,
    pattern: 'cardioid',
    freqLow: 40,
    freqHigh: 16000,
    hpfHz: 100,
    gainNotes: '+30 to +50 dB preamp gain.',
    useCases: ['Vocals', 'Choral performances', 'Spoken word'],
    eqTips: [
      'HPF at 100 Hz',
      'Smooth, flat response — minimal EQ often needed',
      'Cut 200–250 Hz if singer is close-micing hard (proximity effect)',
      'Gentle boost at 8–10 kHz for air without harshness',
    ],
    feedbackNotes:
      'Good feedback rejection. Uniform cardioid pattern. Easy to ring out.',
    feedbackResistance: 'high',
  },
  {
    id: 'qlxd-sm58',
    name: 'QLXD24/SM58',
    manufacturer: 'Shure',
    capsuleType: 'dynamic',
    wireless: true,
    pattern: 'cardioid',
    freqLow: 50,
    freqHigh: 15000,
    hpfHz: 100,
    gainNotes:
      'Set transmitter AF gain so LED shows green during loud passages, briefly red only on peaks. Target receiver meter at −6 dBFS.',
    useCases: ['Wireless lead vocals', 'Presenters', 'Performers roaming stage'],
    eqTips: [
      'HPF at 100 Hz on channel strip (same as wired SM58)',
      'SM58 capsule EQ applies: cut 200 Hz for boominess, +3 kHz for presence',
      'Enable squelch on receiver to mute RF noise during dropouts',
      'Transmitter lock: engage to prevent accidental RF or gain changes',
    ],
    feedbackNotes:
      'Same pattern as SM58. Keep receiver antennas in line-of-sight with stage. Avoid WiFi routers, LED dimmers, and other 2.4 GHz devices near receiver.',
    feedbackResistance: 'high',
    wirelessNotes:
      'Scan for clear UHF frequencies before show using Shure Wireless Workbench or QLXD receiver scan. Keep antenna cables under 25 ft or use active antenna distribution.',
  },
  {
    id: 'sennheiser-ew100-g4',
    name: 'EW 100 G4',
    manufacturer: 'Sennheiser',
    capsuleType: 'dynamic',
    wireless: true,
    pattern: 'cardioid',
    freqLow: 80,
    freqHigh: 18000,
    hpfHz: 100,
    gainNotes:
      'Set AF output so transmitter peaks hit −6 dBFS on receiver display. Keep AF limiter ON.',
    useCases: ['Wireless vocals', 'Lavalier with adapter', 'Headset mics'],
    eqTips: [
      'HPF at 100 Hz',
      'Bright capsule — roll off 8–12 kHz by 1–2 dB if sibilant',
      'AF limiter: keep ON — prevents transmitter clipping',
      'Lock transmitter controls to prevent accidental changes mid-show',
    ],
    feedbackNotes:
      'Coordinate UHF frequencies using Sennheiser Wireless Systems Manager (auto-scan). Avoid intermodulation products when using multiple units.',
    feedbackResistance: 'medium',
    wirelessNotes:
      'Run auto-frequency scan with WSM software before placing transmitters. Keep receiver antennas away from walls. Use remote antenna placement for large stages.',
  },
  {
    id: 'shure-pga48',
    name: 'PGA48',
    manufacturer: 'Shure',
    capsuleType: 'dynamic',
    wireless: false,
    pattern: 'cardioid',
    freqLow: 60,
    freqHigh: 15000,
    hpfHz: 100,
    gainNotes:
      '+35 to +55 dB preamp gain — needs more gain than SM58; budget headroom accordingly.',
    useCases: ['Budget vocals', 'Backup/choir', 'Karaoke', 'Speeches'],
    eqTips: [
      'HPF at 100 Hz — always on',
      'May need 2–3 dB more input gain than SM58',
      'Cut 300–500 Hz to reduce boxiness',
      'Boost 4–6 kHz for presence and intelligibility',
    ],
    feedbackNotes:
      'Lower output than SM58 — extra gain needed reduces headroom before feedback. Keep stage monitor levels conservative.',
    feedbackResistance: 'medium',
  },
  {
    id: 'rode-m3',
    name: 'M3',
    manufacturer: 'RØDE',
    capsuleType: 'condenser',
    wireless: false,
    pattern: 'cardioid',
    freqLow: 40,
    freqHigh: 20000,
    hpfHz: 80,
    gainNotes:
      '+10 to +30 dB preamp gain. Requires 48V phantom power — confirm on before connecting.',
    useCases: ['Acoustic guitar', 'Overhead drum', 'Piano', 'Choir', 'Ambient capture'],
    eqTips: [
      'HPF at 80 Hz to remove handling/stand noise',
      'Condenser captures room — check for bleed from other sources',
      'Acoustic guitar: cut 200 Hz slightly for mud; boost 5–8 kHz for string detail',
      'Overhead: cut below 100 Hz, roll off above 16 kHz if too bright',
    ],
    feedbackNotes:
      'Condensers are more sensitive and feedback-prone. Keep well away from mains. Apply stricter HPF. Reduce channel gain relative to dynamics.',
    feedbackResistance: 'low',
  },
];

export const DEFAULT_MIC = MICS[0];
