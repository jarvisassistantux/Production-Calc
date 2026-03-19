import type { SpeakerSpec } from '../data/speakers';
import { DEFAULT_SPEAKER } from '../data/speakers';

export interface SoundResult {
  throwDist: number;
  effectiveBoxes: number;
  stackHeightFt: number;
  standWarning: boolean;
  totalCoverageAngle: number;
  bottomAimAngle: number;
  topAimAngle: number;
  boxLevels: number[];
  splAtFar: number;
  splAtNear: number;
  splAtMid: number;
  splNote: string;
  needsDelay: boolean;
  delayPosition: number;
  alignmentMs: number;
  delayCount: number;
  delayLevel: number;
  needsFlare: boolean;
  boardSettings: BoardSettings;
  // Placement
  arraySpacingFt: number;
  wallOffsetFt: number;
  coverageDepthFt: number;
  stereoWarning: boolean;
  // Speaker identity (for SVG labels and fan geometry)
  speakerName: string;
  horizontalDeg: number;
  // The ONE physical adjustment between boxes
  splayDeg: number;      // per-junction splay angle to set on rigging bracket
}

export interface BoardSettings {
  subCrossover: number;
  hpfFreq: number;
  compressionThreshold: number;
  compressionRatio: string;
  compressionAttack: string;
  compressionRelease: string;
  eqNotes: string[];
  gainStructure: string;
  subLevel: number;
}

export const YORKVILLE_SUBS = {
  '18in': { name: 'Yorkville 18" Sub', watts: 500, weightLbs: 125, maxSPL: 128, crossoverHz: 100 },
  '21in': { name: 'Yorkville 21" Sub (LS2100P)', watts: 800, weightLbs: 203, maxSPL: 132, crossoverHz: 100 },
} as const;

export type SubModel = keyof typeof YORKVILLE_SUBS;

export function calcSound(
  roomLength: number,
  roomWidth: number,
  _ceilHeight: number,
  subModel: SubModel = '18in',
  wallOffsetFt: number = 2,
  speaker: SpeakerSpec = DEFAULT_SPEAKER,
  boxCount: number = speaker.defaultBoxes,
): SoundResult {
  void subModel;
  const BOXES = Math.max(1, boxCount);
  const listenerH = 4;       // ft — seated ear height
  const nearSeat = 15;       // ft — front row from stage face
  const subHeightFt = 3;     // ft — top of sub (stack base)

  const throwDist = Math.max(1, roomLength - 10);

  // Stack geometry
  const stackHeightFt = subHeightFt + BOXES * speaker.boxHeightFt;
  const midArrayH = stackHeightFt + 3;  // +3ft from crank stand lift

  // Aim angles — top box is nearly flat (aimed at far seats), bottom box is steep (aimed at near seats)
  const topAimAngle    = (Math.atan2(midArrayH - listenerH, throwDist) * 180) / Math.PI;
  const bottomAimAngle = (Math.atan2(midArrayH - listenerH, nearSeat)  * 180) / Math.PI;
  const totalCoverageAngle = bottomAimAngle - topAimAngle;

  const standWarning = stackHeightFt > 14;

  // Box levels: top box (far seats, reference) = 0 dB; bottom boxes attenuated (near seats need less SPL)
  const boxLevels = Array.from({ length: BOXES }, (_, i) =>
    i === BOXES - 1 ? 0 : Math.round(-1.5 * (BOXES - 1 - i) * 2) / 2
  );

  // SPL via inverse square law — array gain: +3dB per doubling of boxes (coherent sum)
  const arrayGaindB = 10 * Math.log10(BOXES);
  const refSpl = speaker.refSplAt1m + arrayGaindB;

  const splAtFar  = refSpl - 20 * Math.log10(throwDist * 0.3048);
  const splAtNear = refSpl - 20 * Math.log10(nearSeat * 0.3048);
  const splAtMid  = refSpl - 20 * Math.log10((throwDist * 0.5) * 0.3048);
  const splNote = splAtFar < 95
    ? 'Consider adding delay fills — SPL low at far seats'
    : 'Adequate coverage';

  // Delay fills
  const needsDelay = throwDist > 80;
  const delayPosition = throwDist * 0.55;
  const rawDelayMs = (delayPosition / 1125) * 1000;
  const alignmentMs = rawDelayMs + 8;
  const delayCount = roomWidth <= 60 ? 1 : 2;
  const delayLevel = -6;

  // Horizontal coverage
  const coverageAtFar = 2 * throwDist * Math.tan((speaker.horizontalDeg / 2) * (Math.PI / 180));
  const needsFlare = coverageAtFar < roomWidth;

  // Placement
  const arraySpacingFt = Math.max(0, roomWidth - 2 * wallOffsetFt);
  const coverageDepthFt = throwDist - nearSeat;
  const stereoWarning = arraySpacingFt < roomWidth * 0.4;

  const boardSettings: BoardSettings = {
    subCrossover: 100,
    hpfFreq: 100,
    compressionThreshold: -6,
    compressionRatio: '4:1',
    compressionAttack: '10ms',
    compressionRelease: '100ms',
    eqNotes: [
      'Cut 200–400 Hz 2–3 dB to reduce room boom',
      'Cut 400–800 Hz if sound feels muddy',
      'Boost 8–12 kHz 1–2 dB for air and presence',
      'High-pass all channels below 80 Hz (vocals/instruments)',
      `${speaker.manufacturer} ${speaker.name}: use any built-in DSP/preset for your venue type`,
    ],
    gainStructure:
      'Set gain so console fader at 0 dBu = ~100 dB SPL at FOH. Leave headroom for peaks.',
    subLevel: 0,
  };

  return {
    throwDist,
    effectiveBoxes: BOXES,
    stackHeightFt,
    standWarning,
    totalCoverageAngle,
    bottomAimAngle,
    topAimAngle,
    boxLevels,
    splAtFar,
    splAtNear,
    splAtMid,
    splNote,
    needsDelay,
    delayPosition,
    alignmentMs,
    delayCount,
    delayLevel,
    needsFlare,
    boardSettings,
    arraySpacingFt,
    wallOffsetFt,
    coverageDepthFt,
    stereoWarning,
    speakerName: `${speaker.manufacturer} ${speaker.name}`,
    horizontalDeg: speaker.horizontalDeg,
    splayDeg: BOXES > 1 ? (bottomAimAngle - topAimAngle) / (BOXES - 1) : 0,
  };
}

export type MixerType = 'cq12t' | 'qu-series';

export interface MixerSection {
  title: string;
  steps: string[];
}

export function getMixerInstructions(
  mixer: MixerType,
  alignmentMs: number,
  needsDelay: boolean,
  subModel: SubModel,
  speakerName: string,
): MixerSection[] {
  const sub = YORKVILLE_SUBS[subModel];
  const delayMs = `+${alignmentMs.toFixed(1)} ms`;

  if (mixer === 'cq12t') {
    return [
      {
        title: 'Output Routing',
        steps: [
          `Main LR XLR → ${speakerName} Left + Right`,
          `Mix Bus 1 (mono) → ${sub.name} sub(s)`,
          ...(needsDelay ? ['Mix Bus 2 (mono) → Delay speakers'] : []),
        ],
      },
      {
        title: 'Main LR Output (Processing > Output > Main LR)',
        steps: [
          'HPF: 100 Hz, 24 dB/oct',
          'EQ Band 1 — 250 Hz, −3 dB, Q 1.5 (room boom)',
          'EQ Band 2 — 8 kHz, +2 dB, shelf (presence)',
          'Limiter: −6 dBFS peak limiter on',
        ],
      },
      {
        title: 'Sub Bus (Mix Bus 1)',
        steps: [
          `LPF: ${sub.crossoverHz} Hz (matches sub crossover)`,
          'Level: Start at 0 dB relative to Main; reduce 3–6 dB if subs overwhelm room',
          'Send each channel to Mix Bus 1 post-fader',
        ],
      },
      ...(needsDelay
        ? [{
            title: 'Delay Bus (Mix Bus 2)',
            steps: [
              `Processing > Delay > set to ${delayMs}`,
              'HPF: 100 Hz',
              'Level: −6 dB vs Main LR fader',
            ],
          }]
        : []),
      {
        title: 'Input Channels',
        steps: [
          'Gain: peaks at −18 to −12 dBFS during soundcheck',
          'HPF: 80–100 Hz on all channels',
          'Vocals — Compression: threshold −18 dBFS, ratio 4:1, attack 10 ms, release 100 ms',
        ],
      },
    ];
  }

  // qu-series
  return [
    {
      title: 'Output Routing',
      steps: [
        `Main LR fader → ${speakerName} Left + Right`,
        `Mix 1 (mono) → ${sub.name}`,
        ...(needsDelay ? ['Mix 3 (mono) → Delay speakers'] : []),
      ],
    },
    {
      title: 'Main LR Processing (MAIN LR > PROCESSING screen)',
      steps: [
        'HPF: 100 Hz ON',
        '4-band PEQ: 250 Hz −3 dB Q1.5 | 8 kHz +2 dB shelf',
        'GEQ optional: pull 315 Hz and 400 Hz down 2–3 dB if room sounds boxy',
        'Comp: Threshold −18 dBFS, Ratio 4:1, Attack 10 ms, Release 100 ms',
        'Limiter: −3 dBFS',
      ],
    },
    {
      title: 'Sub Mix Bus (MIX SELECT [Mix 1] > PROCESSING)',
      steps: [
        `LPF: ${sub.crossoverHz} Hz`,
        'Level: 0 dB relative to Main; fine-tune by ear',
      ],
    },
    ...(needsDelay
      ? [{
          title: 'Delay Mix Bus (MIX SELECT [Mix 3])',
          steps: [
            `PROCESSING > DELAY > enter ${delayMs}`,
            'HPF: 100 Hz; EQ cut 200 Hz −3 dB',
            'Level: −6 dB below Main',
          ],
        }]
      : []),
    {
      title: 'Input Channels (CHANNEL PROCESSING per strip)',
      steps: [
        'HPF: 80 Hz',
        'Gain: −18 to −12 dBFS peak during line-check',
        'Compression on vocals/speech: −18 dBFS, 4:1, 10 ms / 100 ms',
      ],
    },
  ];
}

// Keep RCF_HDL20A exported for any legacy references
export const RCF_HDL20A = DEFAULT_SPEAKER;
