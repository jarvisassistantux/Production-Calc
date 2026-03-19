import type { SoundResult } from '../../utils/sound';
import type { SpeakerSpec } from '../../data/speakers';

interface Props {
  result: SoundResult;
  speaker: SpeakerSpec;
}

const BOX_FILL  = ['#d97706', '#fbbf24', '#f59e0b', '#ca8a04', '#92400e', '#fde68a'];
const RAY_COLOR = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#06b6d4'];

export function ArrayCloseUp({ result, speaker }: Props) {
  const vw = 520;
  const vh = 300;
  const mLeft   = 68;
  const mTop    = 36;
  const mRight  = 24;
  const mBottom = 44;

  const drawW = vw - mLeft - mRight;
  const drawH = vh - mTop - mBottom;

  const N = result.effectiveBoxes;

  const boxW = 44;
  const boxH = Math.min(52, Math.max(28, (drawH * 0.62) / N));
  const totalBoxH = N * boxH;
  const stackTopY = mTop + (drawH - totalBoxH) / 2;

  // Per-box aim angles interpolated from bottom (far) to top (near)
  const aimAngles = Array.from({ length: N }, (_, i) => {
    if (N === 1) return result.bottomAimAngle;
    return result.bottomAimAngle + (result.topAimAngle - result.bottomAimAngle) * (i / (N - 1));
  });

  const halfCov = speaker.verticalDeg / 2;
  const rayLen  = drawW - boxW - 10;
  const rayOriX = mLeft + boxW;

  const clampY = (y: number) => Math.min(mTop + drawH - 4, Math.max(mTop + 4, y));

  // i=0 is the bottom box (far-aimed), drawn at the bottom of the visual stack
  const boxTopY  = (i: number) => stackTopY + (N - 1 - i) * boxH;
  const boxCentY = (i: number) => boxTopY(i) + boxH / 2;

  // No splay to show for single box
  const showSplay = N > 1;

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      className="w-full h-auto rounded-lg bg-gray-950"
      style={{ maxHeight: vh }}
    >
      <defs>
        <clipPath id="cuClip">
          <rect x={mLeft + boxW} y={mTop} width={rayLen + 10} height={drawH} />
        </clipPath>
      </defs>

      {/* Title */}
      <rect x={0} y={0} width={vw} height={mTop - 4} fill="#111827" />
      <text x={vw / 2} y={mTop / 2 + 5}
        textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="monospace">
        Array Close-up · {N} box{N !== 1 ? 'es' : ''}/side · {speaker.verticalDeg}° coverage per box
      </text>

      {/* Horizontal boresight reference */}
      <line x1={mLeft + boxW} y1={mTop + drawH / 2}
        x2={mLeft + drawW} y2={mTop + drawH / 2}
        stroke="#1f2937" strokeWidth="1" strokeDasharray="3,5" />

      {/* Coverage wedges */}
      {Array.from({ length: N }, (_, i) => {
        const cy     = boxCentY(i);
        const aimRad = (aimAngles[i] * Math.PI) / 180;
        const upRad  = ((aimAngles[i] - halfCov) * Math.PI) / 180;
        const lowRad = ((aimAngles[i] + halfCov) * Math.PI) / 180;
        const endX   = rayOriX + rayLen;
        const aimEndY = cy + rayLen * Math.tan(aimRad);
        const upEndY  = cy + rayLen * Math.tan(upRad);
        const lowEndY = cy + rayLen * Math.tan(lowRad);
        const color   = RAY_COLOR[i % RAY_COLOR.length];

        // Label: bottom box = "Far seats", top box = "Near seats"
        const isBot = i === 0;
        const isTop = i === N - 1;
        const seatLabel = isBot ? 'near seats (15 ft)' : isTop ? `far seats (${result.throwDist} ft)` : 'mid';

        return (
          <g key={i} clipPath="url(#cuClip)">
            {/* Wedge fill */}
            <polygon
              points={`${rayOriX},${cy} ${endX},${upEndY} ${endX},${lowEndY}`}
              fill={color} opacity="0.09"
            />
            {/* Edge rays */}
            <line x1={rayOriX} y1={cy} x2={endX} y2={upEndY}
              stroke={color} strokeWidth="1" opacity="0.4" />
            <line x1={rayOriX} y1={cy} x2={endX} y2={lowEndY}
              stroke={color} strokeWidth="1" opacity="0.4" />
            {/* Centre aim ray */}
            <line x1={rayOriX} y1={cy} x2={endX} y2={aimEndY}
              stroke={color} strokeWidth="1.5" strokeDasharray="7,4" opacity="0.85" />
            {/* Seat label at ~60% along ray */}
            {(isBot || isTop) && (() => {
              const lx = rayOriX + rayLen * 0.55;
              const ly = clampY(cy + (rayLen * 0.55) * Math.tan(aimRad)) - 6;
              return (
                <text x={lx} y={ly}
                  textAnchor="middle" fontSize="9" fill={color} fontFamily="monospace">
                  {seatLabel}
                </text>
              );
            })()}
          </g>
        );
      })}

      {/* Box rectangles */}
      {Array.from({ length: N }, (_, i) => {
        const ty    = boxTopY(i);
        const cy    = boxCentY(i);
        const level = result.boxLevels[i];
        const fill  = BOX_FILL[i % BOX_FILL.length];

        return (
          <g key={i}>
            <rect x={mLeft} y={ty} width={boxW} height={boxH - 1}
              fill={fill} stroke="#92400e" strokeWidth="0.5" rx="2" />
            <text x={mLeft + boxW / 2} y={cy + 4}
              textAnchor="middle" fontSize="9" fill="#1c0a00" fontFamily="monospace" fontWeight="bold">
              #{i + 1}
            </text>
            {/* Level */}
            <text x={mLeft - 5} y={cy - 3}
              textAnchor="end" fontSize="8" fill="#9ca3af" fontFamily="monospace">
              {level === 0 ? '0 dB' : `${level} dB`}
            </text>
          </g>
        );
      })}

      {/* Splay bracket callouts between adjacent boxes */}
      {showSplay && Array.from({ length: N - 1 }, (_, i) => {
        // Junction is at the top edge of box i (the lower box)
        const junctionY = boxTopY(i);
        const splay = result.splayDeg;  // per-junction, same for all

        // Bracket indicator: horizontal tick at junction on the right side of boxes
        const bx = mLeft + boxW + 2;

        return (
          <g key={i}>
            {/* Tick line at junction */}
            <line x1={mLeft} y1={junctionY} x2={bx + 60} y2={junctionY}
              stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            {/* Bracket label */}
            <rect x={bx} y={junctionY - 11} width={72} height={14}
              fill="#f59e0b" fillOpacity="0.15" rx="3" />
            <text x={bx + 36} y={junctionY + 1}
              textAnchor="middle" fontSize="9" fill="#f59e0b" fontFamily="monospace" fontWeight="bold">
              bracket: {splay.toFixed(1)}°
            </text>
          </g>
        );
      })}

      {/* Bottom legend */}
      <text x={mLeft + boxW + rayLen / 2} y={mTop + drawH + 28}
        textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="monospace">
        {showSplay
          ? `Set rigging bracket to ${result.splayDeg.toFixed(1)}° · aim whole array forward · covers ${result.throwDist} ft`
          : `Single box · aim forward toward audience · covers ${result.throwDist} ft`}
      </text>
    </svg>
  );
}
