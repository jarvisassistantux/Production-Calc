import { useState, useMemo } from 'react';
import { calcSound, getMixerInstructions, YORKVILLE_SUBS } from '../../utils/sound';
import type { SubModel, MixerType } from '../../utils/sound';
import { SPEAKERS, DEFAULT_SPEAKER } from '../../data/speakers';
import type { SpeakerSpec } from '../../data/speakers';
import { MICS, DEFAULT_MIC } from '../../data/mics';
import type { MicSpec } from '../../data/mics';
import { RoomTopView } from './RoomTopView';
import { ArraySideView } from './ArraySideView';
import { ArrayCloseUp } from './ArrayCloseUp';

// ─── Auto-configure recommendation ───────────────────────────────────────────
function recommendConfig(
  roomLength: number,
  roomWidth: number,
  ceilHeight: number,
): { speaker: SpeakerSpec; boxCount: number; subModel: SubModel; arraySpacingFt: number; reasons: string[] } {
  const throwDist = Math.max(1, roomLength - 10);
  const reasons: string[] = [];
  let speaker: SpeakerSpec;
  let boxCount: number;

  if (throwDist <= 25) {
    speaker = SPEAKERS.find(s => s.id === 'qsc-k10-2') ?? DEFAULT_SPEAKER;
    boxCount = 1;
    reasons.push(`${throwDist} ft throw → QSC K10.2 compact 10" point source`);
  } else if (throwDist <= 45) {
    speaker = SPEAKERS.find(s => s.id === 'qsc-k12-2') ?? DEFAULT_SPEAKER;
    boxCount = 1;
    reasons.push(`${throwDist} ft throw → QSC K12.2 12" point source`);
  } else if (throwDist <= 60) {
    speaker = SPEAKERS.find(s => s.id === 'rcf-hdl10a') ?? DEFAULT_SPEAKER;
    boxCount = ceilHeight <= 14 ? 2 : 3;
    reasons.push(`${throwDist} ft throw → RCF HDL 10-A, ${boxCount} boxes/side`);
  } else {
    speaker = SPEAKERS.find(s => s.id === 'rcf-hdl20a') ?? DEFAULT_SPEAKER;
    boxCount = throwDist <= 85 ? 2 : 4;
    reasons.push(`${throwDist} ft throw → RCF HDL 20-A, ${boxCount} boxes/side`);
  }

  // Low ceiling override — line arrays need height clearance
  if (ceilHeight < 12 && speaker.type === 'line-array') {
    speaker = SPEAKERS.find(s => s.id === 'qsc-k12-2') ?? DEFAULT_SPEAKER;
    boxCount = 1;
    reasons.push(`Low ceiling (${ceilHeight} ft) → switching to point source`);
  }

  const subModel: SubModel = (roomLength > 75 || roomWidth > 60) ? '21in' : '18in';
  reasons.push(subModel === '21in'
    ? `Large room (${roomLength}×${roomWidth} ft) → 21" Yorkville sub`
    : `Medium room → 18" Yorkville sub`);

  const arraySpacingFt = roomWidth - 4;
  reasons.push(`Array spacing → ${arraySpacingFt} ft (full spread for best stereo image)`);

  return { speaker, boxCount, subModel, arraySpacingFt, reasons };
}

// ─── Frequency band reference ─────────────────────────────────────────────────
const FREQ_BANDS = [
  { range: '20–80 Hz',    color: '#7c3aed', label: 'Sub-bass',   sounds: 'Rumble, floor shake',           fix: 'HPF all channels; check sub level; room modes if boomy' },
  { range: '80–200 Hz',   color: '#2563eb', label: 'Bass',       sounds: 'Boom, mud, wooliness',          fix: 'HPF channels at 80–100 Hz; cut 120–160 Hz on main EQ if muddy' },
  { range: '200–400 Hz',  color: '#0891b2', label: 'Low-mid',    sounds: 'Boxy, hollow, phone-like',      fix: 'Narrow cut at offending freq; common in rooms with parallel walls' },
  { range: '400–800 Hz',  color: '#059669', label: 'Mid',        sounds: 'Honky, nasal, congested',       fix: 'Cut 1–3 dB with Q 2–3; sweep slowly while talking on mic' },
  { range: '800–2k Hz',   color: '#65a30d', label: 'Upper-mid',  sounds: 'Harsh, aggressive',             fix: 'Critical range — small cuts only (0.5–1 dB); avoid big cuts here' },
  { range: '2–5 kHz',     color: '#ca8a04', label: 'Presence',   sounds: 'Intelligibility, attack',       fix: 'Protect this range; cuts cause loss of clarity; boost for speech' },
  { range: '5–8 kHz',     color: '#ea580c', label: 'High-mid',   sounds: 'Sibilance, harshness, hiss',    fix: 'De-ess or notch at exact sibilant freq; cut 6 kHz if too harsh' },
  { range: '8–12 kHz',    color: '#dc2626', label: 'High',       sounds: 'Brightness, cymbals, air',      fix: 'Gentle shelf; cut if fatiguing; room acoustics matter most here' },
  { range: '12–20 kHz',   color: '#be185d', label: 'Air',        sounds: 'Shimmer, open, airy',           fix: 'Speakers must extend to 16 kHz+; gentle boost for recordings' },
];

const RINGOUT_STEPS = [
  { step: 1, title: 'Start flat',        detail: 'Set all channel and bus EQ to flat (0 dB). Mute all input channels.' },
  { step: 2, title: 'Unmute mains only', detail: 'Bring up just the main LR mix with no inputs — you should hear silence or slight hum.' },
  { step: 3, title: 'Use a mic on-stage', detail: 'Hold one vocal mic on stage pointed roughly at the mains. Leave it unmuted.' },
  { step: 4, title: 'Slowly raise fader', detail: 'Bring the mic channel fader up slowly. Stop at the first sign of ringing or feedback.' },
  { step: 5, title: 'Identify the freq', detail: 'Use the GEQ on the main output: sweep bands one at a time, boosting +6 dB — when the ring gets louder you have found the problem band. Then cut it –3 to –6 dB.' },
  { step: 6, title: 'Repeat',            detail: 'Raise the fader again until the next ring. Identify and notch. Repeat 4–6 times — you gain roughly 3 dB of headroom per notch.' },
  { step: 7, title: 'Target headroom',   detail: 'Stop when you have at least 6–10 dB of headroom below feedback. That is your safe operating level.' },
  { step: 8, title: 'Save and recall',   detail: 'Save a GEQ scene on your console. Re-ring-out if the room changes (audience fills in = 3–6 dB absorbed in the lows and mids).' },
];

// ─── MC / Speech use-case guidance ───────────────────────────────────────────
type MicUseCase = 'mc-roaming' | 'speech';

const USE_CASE_TIPS: Record<MicUseCase, {
  label: string;
  color: string;
  compSettings: string;
  eqBoosts: string;
  tips: string[];
}> = {
  'mc-roaming': {
    label: 'MC / Roaming',
    color: 'text-amber-400',
    compSettings: 'Threshold –18 dBFS · Ratio 6:1 · Attack 5 ms · Release 50 ms · Hard limiter –3 dBFS',
    eqBoosts: 'HPF 100 Hz · +2–3 dB at 2–4 kHz for intelligibility over loud music',
    tips: [
      'Set gain with MC at their closest point to mains (on stage) — that is your loudest and riskiest position',
      'On the dance floor the MC is inside the main coverage zone — SPL at their body may be 110–120 dB; feedback risk drops as they move away from the arrays',
      'On stage near the arrays: highest feedback risk — if they face the speakers and raise the mic, you will get feedback; keep limiter on hard',
      'Heavy compression (6:1+) helps manage the wide volume swing between casual speech and excited announcements',
      'Squelch ON: silences RF dropout noise between announcements',
      'If MC cups the grille, feedback resistance drops sharply — remind them not to',
    ],
  },
  'speech': {
    label: 'Speech / Toasts',
    color: 'text-blue-400',
    compSettings: 'Threshold –24 dBFS · Ratio 2:1 · Attack 20 ms · Release 200 ms (gentle — preserve natural dynamics)',
    eqBoosts: 'HPF 100 Hz · Cut 200 Hz (podium boom) · +1–2 dB at 1–3 kHz for clarity',
    tips: [
      'Set gain for a quiet, nervous voice at arm\'s length — guests giving toasts often hold the mic at chest level and speak softly',
      'Worst case is not loud, it\'s quiet — set gain so a very soft voice is still intelligible from the back',
      'Drop the sub bus level 6–10 dB during speeches — sub frequencies add mud to voice, not warmth',
      'If possible, duck the music 10–15 dB on a VCA/group when the speech mic is raised — makes speeches dramatically more intelligible',
      'Remind speaker: hold mic 3–6 inches from mouth, do not cup the grille, do not blow into it',
      'After toasts, mute channel immediately — mic left open on a table or floor = feedback risk',
    ],
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SpeakerCard({
  speaker, setSpeaker, boxCount, setBoxCount,
}: {
  speaker: SpeakerSpec;
  setSpeaker: (s: SpeakerSpec) => void;
  boxCount: number;
  setBoxCount: (n: number) => void;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
      <div className="text-xs text-gray-500 uppercase tracking-wider">Speaker System</div>

      {/* Model picker */}
      <select
        value={speaker.id}
        onChange={e => {
          const s = SPEAKERS.find(x => x.id === e.target.value) ?? DEFAULT_SPEAKER;
          setSpeaker(s);
          setBoxCount(s.defaultBoxes);
        }}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
      >
        <optgroup label="Line Array">
          {SPEAKERS.filter(s => s.type === 'line-array').map(s => (
            <option key={s.id} value={s.id}>{s.manufacturer} {s.name}</option>
          ))}
        </optgroup>
        <optgroup label="Point Source">
          {SPEAKERS.filter(s => s.type === 'point-source').map(s => (
            <option key={s.id} value={s.id}>{s.manufacturer} {s.name}</option>
          ))}
        </optgroup>
      </select>

      {/* Box count */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 shrink-0">Boxes / side</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBoxCount(Math.max(1, boxCount - 1))}
            className="w-7 h-7 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 text-base leading-none"
          >−</button>
          <span className="text-lg font-bold font-mono text-amber-400 w-6 text-center">{boxCount}</span>
          <button
            onClick={() => setBoxCount(Math.min(speaker.maxBoxes, boxCount + 1))}
            className="w-7 h-7 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 text-base leading-none"
          >+</button>
        </div>
        <span className="text-xs text-gray-600">max {speaker.maxBoxes}</span>
      </div>

      {/* Spec grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-t border-gray-800 pt-3">
        <div><span className="text-gray-500">Type</span></div>
        <div className="text-gray-300 capitalize">{speaker.type.replace('-', ' ')}</div>
        <div><span className="text-gray-500">Coverage</span></div>
        <div className="text-gray-300 font-mono">{speaker.verticalDeg}° V · {speaker.horizontalDeg}° H</div>
        <div><span className="text-gray-500">SPL @ 1m</span></div>
        <div className="text-gray-300 font-mono">{speaker.refSplAt1m} dB</div>
        <div><span className="text-gray-500">Power</span></div>
        <div className="text-gray-300 font-mono">{speaker.watts}W</div>
        <div><span className="text-gray-500">Weight</span></div>
        <div className="text-gray-300 font-mono">{speaker.weightLbs} lbs/box</div>
        <div><span className="text-gray-500">Freq</span></div>
        <div className="text-gray-300 font-mono">{speaker.freqLow}Hz – {speaker.freqHigh >= 20000 ? '20kHz' : `${speaker.freqHigh}Hz`}</div>
      </div>
      <div className="text-xs text-gray-600">{speaker.notes}</div>
    </div>
  );
}

function MicCard({
  slotLabel, useCase, mic, setMic,
}: {
  slotLabel: string;
  useCase: MicUseCase;
  mic: MicSpec;
  setMic: (m: MicSpec) => void;
}) {
  const ctx = USE_CASE_TIPS[useCase];
  const patternColor = mic.feedbackResistance === 'high'
    ? 'text-green-400' : mic.feedbackResistance === 'medium'
    ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 uppercase tracking-wider">{slotLabel}</div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border border-current/30 bg-current/10 ${ctx.color}`}>
          {ctx.label}
        </span>
      </div>

      <select
        value={mic.id}
        onChange={e => setMic(MICS.find(m => m.id === e.target.value) ?? DEFAULT_MIC)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
      >
        <optgroup label="Dynamic (wired)">
          {MICS.filter(m => !m.wireless && m.capsuleType === 'dynamic').map(m => (
            <option key={m.id} value={m.id}>{m.manufacturer} {m.name}</option>
          ))}
        </optgroup>
        <optgroup label="Condenser (wired)">
          {MICS.filter(m => !m.wireless && m.capsuleType === 'condenser').map(m => (
            <option key={m.id} value={m.id}>{m.manufacturer} {m.name}</option>
          ))}
        </optgroup>
        <optgroup label="Wireless">
          {MICS.filter(m => m.wireless).map(m => (
            <option key={m.id} value={m.id}>{m.manufacturer} {m.name}</option>
          ))}
        </optgroup>
      </select>

      {/* Key specs */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-t border-gray-800 pt-3">
        <span className="text-gray-500">Type</span>
        <span className="text-gray-300 capitalize">
          {mic.wireless ? 'Wireless · ' : ''}{mic.capsuleType}
        </span>
        <span className="text-gray-500">Pattern</span>
        <span className="text-gray-300 capitalize">{mic.pattern}</span>
        <span className="text-gray-500">Freq range</span>
        <span className="text-gray-300 font-mono">{mic.freqLow}Hz – {mic.freqHigh >= 20000 ? '20kHz' : `${mic.freqHigh}Hz`}</span>
        <span className="text-gray-500">HPF setting</span>
        <span className="text-amber-400 font-mono">{mic.hpfHz} Hz</span>
        <span className="text-gray-500">Feedback risk</span>
        <span className={`font-semibold capitalize ${patternColor}`}>{mic.feedbackResistance}</span>
      </div>

      {/* Gain notes */}
      <div className="text-xs bg-gray-800/50 rounded px-3 py-2">
        <span className="text-gray-500">Gain: </span>
        <span className="text-gray-300">{mic.gainNotes}</span>
      </div>

      {/* Use cases */}
      <div>
        <div className="text-xs text-gray-500 mb-1">Best for</div>
        <div className="flex flex-wrap gap-1">
          {mic.useCases.map(u => (
            <span key={u} className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-gray-300">{u}</span>
          ))}
        </div>
      </div>

      {/* EQ tips */}
      <div>
        <div className="text-xs text-gray-500 mb-1.5">EQ tips</div>
        <ul className="space-y-1">
          {mic.eqTips.map((t, i) => (
            <li key={i} className="text-xs text-gray-400 flex gap-2">
              <span className="text-gray-600 shrink-0">•</span>{t}
            </li>
          ))}
        </ul>
      </div>

      {/* Feedback notes */}
      <div className="text-xs bg-gray-800/40 border border-gray-700 rounded px-3 py-2">
        <span className="text-gray-500">Feedback: </span>
        <span className="text-gray-300">{mic.feedbackNotes}</span>
      </div>

      {/* Wireless-specific notes */}
      {mic.wirelessNotes && (
        <div className="text-xs bg-blue-900/20 border border-blue-800/40 rounded px-3 py-2">
          <span className="text-blue-400 font-semibold">RF: </span>
          <span className="text-blue-300">{mic.wirelessNotes}</span>
        </div>
      )}

      {/* Use-case context tips */}
      <div className="border-t border-gray-800 pt-3 space-y-2">
        <div className="text-xs font-semibold text-gray-400">{ctx.label} — Channel Settings</div>
        <div className="text-xs bg-gray-800/50 rounded px-3 py-2 space-y-0.5">
          <div><span className="text-gray-500">Compression: </span><span className="text-gray-300 font-mono">{ctx.compSettings}</span></div>
          <div><span className="text-gray-500">EQ: </span><span className="text-gray-300">{ctx.eqBoosts}</span></div>
        </div>
        {ctx.tips.length > 0 && (
          <ul className="space-y-1.5">
            {ctx.tips.map((t, i) => (
              <li key={i} className="text-xs text-gray-500 flex gap-2">
                <span className="text-gray-700 shrink-0">▸</span>{t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StageMonitorCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
      <div className="text-xs text-gray-500 uppercase tracking-wider">Stage Monitor / IEM for MC</div>

      <div className="grid grid-cols-1 gap-2">
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-xs font-semibold text-gray-300 mb-1.5">Option A — Floor Wedge (on stage only)</div>
          <ul className="space-y-1 text-xs text-gray-500">
            <li>• Route MC channel to a dedicated monitor bus (aux/mix send, pre-fader)</li>
            <li>• Aim wedge at MC's stage position — grille pointing away from mic capsule</li>
            <li>• Ring out monitor separately from mains (same ring-out procedure)</li>
            <li>• Start wedge level at –10 dB below main mix, raise to taste</li>
            <li className="text-amber-400/80">⚠ Wedge stays on stage — MC hears nothing on the dance floor</li>
          </ul>
        </div>

        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-xs font-semibold text-green-400 mb-1.5">Option B — IEM (recommended for roaming MC)</div>
          <ul className="space-y-1 text-xs text-gray-500">
            <li>• In-ear monitor follows MC anywhere — dance floor, stage, bar</li>
            <li>• Mix: MC's own voice (so they hear themselves) + low-level music bed</li>
            <li>• No feedback risk from IEM (sealed in-ear, signal goes in not out)</li>
            <li>• Transmitter output: set to comfortable listening level, not loud</li>
            <li>• Common systems: Shure PSM300, Sennheiser EW-IEM G4, Xvive U4</li>
          </ul>
        </div>
      </div>

      <div className="text-xs bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
        ⚠ If MC has no monitor: they will hold the mic closer and raise their voice to compensate — factor this into your gain staging and compression settings.
      </div>
    </div>
  );
}

function WirelessCoordCard({ mic1, mic2 }: { mic1: MicSpec; mic2: MicSpec }) {
  if (!mic1.wireless && !mic2.wireless) return null;
  const bothWireless = mic1.wireless && mic2.wireless;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider">
        Wireless Coordination {bothWireless ? '— 2 Units' : '— 1 Unit'}
      </div>
      <ul className="space-y-1.5 text-xs text-gray-500">
        {bothWireless && (
          <>
            <li className="flex gap-2">
              <span className="text-amber-400 shrink-0">!</span>
              <span><span className="text-gray-300">Two active wireless units</span> — frequency coordination is required before the event</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-700 shrink-0">▸</span>
              <span><span className="text-gray-300">Same brand:</span> use manufacturer's auto-scan — Shure Wireless Workbench or Sennheiser Wireless Systems Manager</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-700 shrink-0">▸</span>
              <span><span className="text-gray-300">Mixed brands:</span> separate UHF frequencies by 1+ MHz minimum to avoid intermodulation (two transmitters create a ghost 3rd signal at 2×f1−f2)</span>
            </li>
          </>
        )}
        <li className="flex gap-2">
          <span className="text-gray-700 shrink-0">▸</span>
          <span><span className="text-gray-300">Antenna placement:</span> receiver antennas must have line-of-sight to the whole stage and dance floor — mount high, not behind speakers</span>
        </li>
        <li className="flex gap-2">
          <span className="text-gray-700 shrink-0">▸</span>
          <span><span className="text-gray-300">RF killers:</span> WiFi routers, LED uplights with switching supplies, and powered speakers with built-in WiFi near antennas cause dropouts</span>
        </li>
        <li className="flex gap-2">
          <span className="text-gray-700 shrink-0">▸</span>
          <span><span className="text-gray-300">Battery check:</span> start with fresh batteries or fully charged packs — never reuse from a previous show without checking</span>
        </li>
      </ul>
    </div>
  );
}

function FreqGuideCard() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'ringout' | 'bands'>('ringout');

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-xs text-gray-500 uppercase tracking-wider">Bad Frequency Guide</span>
        <span className="text-gray-500 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-800">
          {/* Tab bar */}
          <div className="flex border-b border-gray-800">
            {(['ringout', 'bands'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-mono transition-colors ${
                  tab === t
                    ? 'bg-gray-800 text-amber-400 border-b-2 border-amber-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'ringout' ? 'Ring-out Procedure' : 'Freq Band Reference'}
              </button>
            ))}
          </div>

          {tab === 'ringout' && (
            <div className="px-4 pb-4 pt-3 space-y-2">
              <p className="text-xs text-gray-500 mb-3">
                Run this before doors open in an empty room. Repeat with audience if SPL/EQ changes significantly.
              </p>
              {RINGOUT_STEPS.map(s => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-amber-400 text-xs font-mono font-bold">{s.step}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-300">{s.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'bands' && (
            <div className="px-4 pb-4 pt-3 space-y-2">
              <p className="text-xs text-gray-500 mb-3">
                If you hear a problem, find its frequency by sweeping a narrow boost on the GEQ. Then cut.
              </p>
              <div className="space-y-1.5">
                {FREQ_BANDS.map(b => (
                  <div key={b.range} className="rounded border border-gray-800 overflow-hidden">
                    <div className="flex items-center gap-2 px-2 py-1.5"
                      style={{ borderLeft: `3px solid ${b.color}` }}>
                      <span className="text-xs font-mono text-gray-400 w-20 shrink-0">{b.range}</span>
                      <span className="text-xs font-semibold text-gray-300 w-20 shrink-0">{b.label}</span>
                      <span className="text-xs text-gray-500 flex-1">{b.sounds}</span>
                    </div>
                    <div className="px-3 py-1 bg-gray-800/40 text-xs text-gray-400 border-t border-gray-800">
                      <span className="text-gray-600">Fix: </span>{b.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SoundCalc() {
  const [roomLength, setRoomLength] = useState(80);
  const [roomWidth, setRoomWidth]   = useState(50);
  const [ceilHeight, setCeilHeight] = useState(20);
  const [boardOpen, setBoardOpen]   = useState(false);
  const [subModel, setSubModel]     = useState<SubModel>('18in');
  const [mixer, setMixer]           = useState<MixerType>('cq12t');
  const [speaker, setSpeaker]       = useState<SpeakerSpec>(DEFAULT_SPEAKER);
  const [boxCount, setBoxCount]     = useState(DEFAULT_SPEAKER.defaultBoxes);
  const [mic1, setMic1] = useState<MicSpec>(MICS.find(m => m.id === 'qlxd-sm58') ?? DEFAULT_MIC);
  const [mic2, setMic2] = useState<MicSpec>(MICS.find(m => m.id === 'sm58') ?? DEFAULT_MIC);
  const [applyNote, setApplyNote] = useState<string[]>([]);

  function handleAutoConfig() {
    const cfg = recommendConfig(roomLength, roomWidth, ceilHeight);
    setSpeaker(cfg.speaker);
    setBoxCount(cfg.boxCount);
    setSubModel(cfg.subModel);
    setArraySpacingFt(cfg.arraySpacingFt);
    setApplyNote(cfg.reasons);
    setTimeout(() => setApplyNote([]), 6000);
  }
  const [arraySpacingFt, setArraySpacingFt] = useState(46);

  // Clamp spacing to room
  const maxSpacing = Math.max(4, roomWidth - 4);
  const minSpacing = 4;
  const clampedSpacing = Math.min(Math.max(arraySpacingFt, minSpacing), maxSpacing);
  const wallOffsetFt = (roomWidth - clampedSpacing) / 2;

  const result = useMemo(
    () => calcSound(roomLength, roomWidth, ceilHeight, subModel, wallOffsetFt, speaker, boxCount),
    [roomLength, roomWidth, ceilHeight, subModel, wallOffsetFt, speaker, boxCount]
  );

  const mixerInstructions = useMemo(
    () => getMixerInstructions(mixer, result.alignmentMs, result.needsDelay, subModel, result.speakerName),
    [mixer, result.alignmentMs, result.needsDelay, subModel, result.speakerName]
  );

  const sub = YORKVILLE_SUBS[subModel];

  return (
    <div className="p-4 flex flex-col gap-4 md:grid md:grid-cols-[380px_1fr] min-h-full">
      {/* ── Left column — info (second on mobile, first on desktop) ─────── */}
      <div className="space-y-3 order-2 md:order-none">

        {/* Room dimensions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Room Dimensions</div>
          <div className="space-y-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Room Length (ft) <span className="text-gray-600">— stage to back wall</span></span>
              <input type="number" min={20} max={200} value={roomLength}
                onChange={e => setRoomLength(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Room Width (ft)</span>
              <input type="number" min={10} max={200} value={roomWidth}
                onChange={e => setRoomWidth(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Ceiling Height (ft)</span>
              <input type="number" min={8} max={60} value={ceilHeight}
                onChange={e => setCeilHeight(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 flex justify-between">
                <span>L-R Array Spacing</span>
                <span className="text-amber-400 font-mono">{clampedSpacing} ft</span>
              </span>
              <input type="range" min={minSpacing} max={maxSpacing} step={1}
                value={clampedSpacing}
                onChange={e => setArraySpacingFt(Number(e.target.value))}
                className="w-full accent-amber-400" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{minSpacing} ft (close)</span>
                <span>{maxSpacing} ft (full spread)</span>
              </div>
              {result.stereoWarning && (
                <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded px-2 py-1">
                  ⚠ Arrays &lt;40% of room width — stereo image may collapse for most seats
                </div>
              )}
            </label>
          </div>

          {/* Auto-configure button */}
          <button
            onClick={handleAutoConfig}
            className="mt-3 w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold rounded transition-colors"
          >
            Auto-Configure for This Room ▸
          </button>

          {/* Applied confirmation */}
          {applyNote.length > 0 && (
            <div className="mt-2 bg-green-500/10 border border-green-500/30 rounded px-3 py-2 space-y-1">
              <div className="text-xs text-green-400 font-semibold">Applied:</div>
              {applyNote.map((n, i) => (
                <div key={i} className="text-xs text-green-300 flex gap-1.5">
                  <span className="text-green-600 shrink-0">✓</span>{n}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Speaker system */}
        <SpeakerCard
          speaker={speaker} setSpeaker={s => { setSpeaker(s); setBoxCount(s.defaultBoxes); }}
          boxCount={boxCount} setBoxCount={setBoxCount}
        />

        {/* Speaker config result */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Speaker Config</div>
          <div className="flex items-end gap-3 mb-2">
            <div>
              <div className="text-4xl font-bold text-amber-400 font-mono">{result.effectiveBoxes}</div>
              <div className="text-xs text-gray-400">boxes / side</div>
            </div>
            <div className="text-gray-600 text-sm mb-1">×</div>
            <div>
              <div className="text-2xl font-bold text-gray-300 font-mono">2</div>
              <div className="text-xs text-gray-400">sides (L + R)</div>
            </div>
            <div className="text-gray-600 text-sm mb-1">=</div>
            <div>
              <div className="text-2xl font-bold text-gray-300 font-mono">{result.effectiveBoxes * 2}</div>
              <div className="text-xs text-gray-400">total boxes</div>
            </div>
          </div>
          {/* Physical setup steps */}
          <div className="space-y-2 mt-1">
            {result.effectiveBoxes > 1 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
                <div className="text-xs text-gray-500 mb-0.5">Splay bracket between each box</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {result.splayDeg.toFixed(1)}°
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Set this at the rigging connector — it's the only angle adjustment between boxes
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 bg-gray-800/50 rounded px-3 py-2">
                Single box — no splay bracket needed
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800/50 rounded px-3 py-2">
                <div className="text-gray-500">Covers</div>
                <div className="text-gray-200 font-mono">15 ft → {result.throwDist} ft</div>
              </div>
              <div className="bg-gray-800/50 rounded px-3 py-2">
                <div className="text-gray-500">Stack height</div>
                <div className="text-gray-200 font-mono">{result.stackHeightFt.toFixed(1)} ft</div>
              </div>
            </div>
          </div>
          {result.standWarning && (
            <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded px-2 py-1 mt-2">
              ⚠ Stack height {result.stackHeightFt.toFixed(1)} ft — approaching 16 ft stand limit
            </div>
          )}
          {result.needsFlare && (
            <div className="text-xs text-red-400 mt-2">
              ! {speaker.horizontalDeg}° horizontal may not fully cover {roomWidth} ft width — consider outfill
            </div>
          )}
        </div>

        {/* Placement */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Placement</div>
          <div className="grid grid-cols-[1fr_auto] gap-y-1.5 gap-x-3 text-xs">
            <span className="text-gray-500">L-R Array Spacing</span>
            <span className="text-gray-200 font-mono text-right">{result.arraySpacingFt.toFixed(1)} ft</span>
            <span className="text-gray-500">Each array offset</span>
            <span className="text-gray-200 font-mono text-right">{result.wallOffsetFt.toFixed(1)} ft from side wall</span>
            <span className="text-gray-500">Audience depth</span>
            <span className="text-gray-200 font-mono text-right">{result.coverageDepthFt} ft (15 ft → {roomLength - 10} ft)</span>
            <span className="text-gray-500">SPL range</span>
            <span className="text-gray-200 font-mono text-right">
              ~{result.splAtNear.toFixed(0)} dB (front) → ~{result.splAtFar.toFixed(0)} dB (back)
            </span>
          </div>
        </div>

        {/* Subwoofer */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Subwoofer</div>
          <div className="flex gap-3 mb-3">
            {(Object.keys(YORKVILLE_SUBS) as SubModel[]).map(key => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="subModel" value={key}
                  checked={subModel === key} onChange={() => setSubModel(key)}
                  className="accent-amber-400" />
                <span className="text-xs text-gray-300">
                  {key === '18in' ? '18" Yorkville' : '21" Yorkville (LS2100P)'}
                </span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-y-1.5 gap-x-4 text-xs">
            <span className="text-gray-500">Model</span>
            <span className="text-gray-200">{sub.name}</span>
            <span className="text-gray-500">Power</span>
            <span className="text-gray-200 font-mono">{sub.watts}W sustained</span>
            <span className="text-gray-500">Weight</span>
            <span className="text-gray-200 font-mono">{sub.weightLbs} lbs each</span>
            <span className="text-gray-500">Crossover</span>
            <span className="text-gray-200 font-mono">{sub.crossoverHz} Hz LPF</span>
            <span className="text-gray-500">Placement</span>
            <span className="text-gray-200">Front of stage, 1 per side (below line array)</span>
          </div>
          <div className="text-xs text-gray-600 mt-3 bg-gray-800/40 rounded px-2 py-1.5">
            Sub on floor. Crank stand beside sub, flybar above. Array boxes hang from flybar.
          </div>
        </div>

        {/* Per-box levels */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Per-Box Starting Levels</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-1 pr-3">Box</th>
                <th className="text-left py-1 pr-3">Aim</th>
                <th className="text-left py-1">Level</th>
                <th className="text-left py-1 pl-2">Splay</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: result.effectiveBoxes }, (_, i) => {
                const isBottom = i === 0;
                const isTop    = i === result.effectiveBoxes - 1;
                const label    = isBottom ? '#1 (bottom)' : isTop ? `#${i + 1} (top)` : `#${i + 1}`;
                const aim      = isBottom ? 'Near seats' : isTop ? 'Far throw' : 'Mid-room';
                const level    = result.boxLevels[i];
                const color    = level === 0 ? 'text-green-400' : 'text-amber-400';
                return (
                  <tr key={i} className="border-b border-gray-800/50 last:border-0">
                    <td className="py-1.5 pr-3 text-gray-400 font-mono">{label}</td>
                    <td className="py-1.5 pr-3 text-gray-300">{aim}</td>
                    <td className={`py-1.5 font-mono font-semibold ${color}`}>
                      {level === 0 ? '0 dB' : `${level} dB`}
                    </td>
                    <td className="py-1.5 pl-2 text-gray-500">{isBottom ? 'steep' : isTop ? 'flat' : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-xs text-gray-600 mt-2">Fine-tune by ear or measurement.</div>
        </div>

        {/* Delay Fills */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Delay Fills</div>
          {result.needsDelay ? (
            <div className="space-y-2">
              <span className="inline-block text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-2 py-0.5 font-semibold">
                Required — throw {result.throwDist}ft exceeds 80ft
              </span>
              <div className="space-y-1.5 text-sm">
                <div><span className="text-gray-500 text-xs">Position: </span>
                  <span className="text-gray-200">{result.delayPosition.toFixed(0)} ft from stage</span></div>
                <div className="bg-blue-900/30 border border-blue-700/40 rounded px-3 py-2 font-mono text-blue-300 text-sm">
                  Set delay: +{result.alignmentMs.toFixed(1)} ms
                </div>
                <div><span className="text-gray-500 text-xs">Speakers: </span>
                  <span className="text-gray-200">{result.delayCount} per side</span></div>
                <div><span className="text-gray-500 text-xs">Level: </span>
                  <span className="text-gray-200">{result.delayLevel} dB vs mains</span>
                  <span className="text-gray-600 text-xs ml-1">— fills, don't dominate</span></div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="inline-block text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded px-2 py-0.5 font-semibold">
                Not Required
              </span>
              <div className="text-xs text-gray-600 mt-1">
                {result.throwDist}ft throw — {result.speakerName} covers adequately without fills
              </div>
            </div>
          )}
        </div>

        {/* SPL estimate */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">SPL Estimate</div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Front row (15ft):</span>
              <span className="text-gray-200 font-mono">~{result.splAtNear.toFixed(0)} dB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Mid-room ({(result.throwDist * 0.5).toFixed(0)}ft):</span>
              <span className="text-gray-200 font-mono">~{result.splAtMid.toFixed(0)} dB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Back wall ({result.throwDist}ft):</span>
              <span className="text-gray-200 font-mono">~{result.splAtFar.toFixed(0)} dB</span>
            </div>
            {result.needsDelay && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Delay zone ({result.delayPosition.toFixed(0)}ft):</span>
                <span className="text-gray-200 font-mono">supplemented</span>
              </div>
            )}
          </div>
          <div className={`text-xs mt-2 ${result.splNote.startsWith('Consider') ? 'text-amber-400' : 'text-green-400'}`}>
            {result.splNote}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {result.speakerName}: {speaker.refSplAt1m} dB @ 1m · {result.effectiveBoxes}× per side
          </div>
        </div>

        {/* Microphone */}
        {/* Mic 1 — MC */}
        <MicCard slotLabel="Mic 1 — MC / Primary" useCase="mc-roaming" mic={mic1} setMic={setMic1} />

        {/* Mic 2 — Speech */}
        <MicCard slotLabel="Mic 2 — Speech / Secondary" useCase="speech" mic={mic2} setMic={setMic2} />

        {/* Wireless coordination */}
        <WirelessCoordCard mic1={mic1} mic2={mic2} />

        {/* Stage monitor */}
        <StageMonitorCard />

        {/* Bad frequency guide */}
        <FreqGuideCard />

        {/* Mixer Setup */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setBoardOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
          >
            <span className="text-xs text-gray-500 uppercase tracking-wider">Mixer Setup</span>
            <span className="text-gray-500 text-sm">{boardOpen ? '▲' : '▼'}</span>
          </button>
          {boardOpen && (
            <div className="border-t border-gray-800">
              <div className="flex border-b border-gray-800">
                {(['cq12t', 'qu-series'] as MixerType[]).map(m => (
                  <button key={m} onClick={() => setMixer(m)}
                    className={`flex-1 py-2 text-xs font-mono transition-colors ${
                      mixer === m
                        ? 'bg-gray-800 text-amber-400 border-b-2 border-amber-400'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}>
                    {m === 'cq12t' ? 'CQ-12T' : 'Qu-Series'}
                  </button>
                ))}
              </div>
              <div className="px-4 pb-4 pt-3 space-y-4">
                {mixerInstructions.map((section, si) => {
                  const isDelaySection = section.title.toLowerCase().includes('delay');
                  return (
                    <div key={si}>
                      <div className={`text-xs font-semibold mb-1.5 ${isDelaySection ? 'text-amber-400' : 'text-gray-300'}`}>
                        {si + 1}. {section.title}
                      </div>
                      <ol className="space-y-1 pl-3">
                        {section.steps.map((step, i) => {
                          const msMatch = step.match(/\+[\d.]+\s*ms/);
                          if (msMatch) {
                            const idx = step.indexOf(msMatch[0]);
                            return (
                              <li key={i} className={`text-xs flex gap-2 ${isDelaySection ? 'text-amber-300' : 'text-gray-400'}`}>
                                <span className="text-gray-600 shrink-0">{i + 1}.</span>
                                <span>
                                  {step.slice(0, idx)}
                                  <span className="font-mono text-blue-300 bg-blue-900/30 px-1 rounded">{msMatch[0]}</span>
                                  {step.slice(idx + msMatch[0].length)}
                                </span>
                              </li>
                            );
                          }
                          return (
                            <li key={i} className={`text-xs flex gap-2 ${isDelaySection ? 'text-amber-300' : 'text-gray-400'}`}>
                              <span className="text-gray-600 shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Right column — diagrams (first on mobile, second on desktop) ── */}
      <div className="space-y-4 order-1 md:order-none">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Top-Down View • {roomLength} × {roomWidth} ft
          </div>
          <RoomTopView roomLength={roomLength} roomWidth={roomWidth} result={result} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Side Elevation — {result.speakerName}
          </div>
          <ArraySideView roomLength={roomLength} result={result} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Array Close-up — Aim Angles
          </div>
          <ArrayCloseUp result={result} speaker={speaker} />
        </div>
      </div>
    </div>
  );
}
