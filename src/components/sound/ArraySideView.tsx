import type { SoundResult } from '../../utils/sound';

interface Props {
  roomLength: number;
  result: SoundResult;
}

export function ArraySideView({ roomLength, result }: Props) {
  const vw = 620;
  const vh = 340;

  const mTop = 40;
  const mBottom = 50;
  const mLeft = 70;
  const mRight = 50;

  const drawW = vw - mLeft - mRight;
  const drawH = vh - mTop - mBottom;

  const ceilH = 20;
  const scaleX = drawW / roomLength;
  const scaleY = drawH / ceilH;

  const floorY = mTop + drawH;
  const ceilY = mTop;
  const stageX = mLeft;
  const backX = mLeft + drawW;

  // ── Sub: sits on floor ──────────────────────────────────────────────────
  const subW = 22;
  const subVisH = 18; // visual-only height (not to exact scale)
  const subX = stageX + 2;
  const subFloorY = floorY;
  const subTopY = subFloorY - subVisH;

  // ── Crank stand: pole from floor up to flybar ───────────────────────────
  // Mid-array height used in SPL calculation = stackHeightFt + 3ft
  const calcMidArrayFt = result.stackHeightFt + 3;
  // Display flybar slightly above the mid-array (top of array = mid + half array span)
  const flybarFt = calcMidArrayFt + 0.7; // 0.7ft ≈ one box height above mid
  const flybarY = floorY - flybarFt * scaleY;

  const standCenterX = stageX + 14;
  const standW = 4;

  // Flybar horizontal beam
  const flybarHalfW = 12;

  // ── Array boxes hang below the flybar ───────────────────────────────────
  const boxH = 9;
  const boxW = 20;
  const boxGap = 2;
  // Box 0 = bottom of array (aimed far, tight splay) → drawn lowest
  // Box N-1 = top of array (aimed near, wide splay)  → drawn just below flybar
  const arrayTopY = flybarY + 4; // first box starts just below flybar

  // Mid-array for coverage ray origin (use calculated physics height)
  const midArrayY = floorY - calcMidArrayFt * scaleY;
  const midArrayX = standCenterX;

  // ── Audience positions ───────────────────────────────────────────────────
  const nearSeatX = mLeft + 15 * scaleX;
  const farX = backX;
  const nearFloorY = floorY;
  const sweetStartX = nearSeatX;
  const sweetEndX = backX;

  // ── Delay speaker (ceiling-hung) ─────────────────────────────────────────
  const delayX = mLeft + result.delayPosition * scaleX;
  const delayCeilY = ceilY + 8;

  const titleBoxes = `Side Elevation • Crank Stand + Ground Sub • ${result.effectiveBoxes} boxes/side`;

  // ── SPL dots at 3 positions ──────────────────────────────────────────────
  const splPoints = [
    { x: mLeft + 15 * scaleX, spl: result.splAtNear, label: `~${result.splAtNear.toFixed(0)} dB` },
    { x: mLeft + result.throwDist * 0.5 * scaleX, spl: result.splAtMid, label: `~${result.splAtMid.toFixed(0)} dB` },
    { x: mLeft + result.throwDist * scaleX, spl: result.splAtFar, label: `~${result.splAtFar.toFixed(0)} dB` },
  ];

  function splColor(spl: number) {
    if (spl >= 100) return '#22c55e';
    if (spl >= 95) return '#f59e0b';
    return '#ef4444';
  }

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      className="w-full h-auto rounded-lg bg-gray-950"
      style={{ maxHeight: 340 }}
    >
      {/* Title strip */}
      <rect x={0} y={0} width={vw} height={mTop - 4} fill="#111827" />
      <text x={vw / 2} y={mTop / 2 + 5}
        textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="monospace">
        {titleBoxes}
      </text>

      {/* Floor */}
      <line x1={stageX} y1={floorY} x2={backX} y2={floorY}
        stroke="#374151" strokeWidth="3" />

      {/* Ceiling (dashed) */}
      <line x1={stageX} y1={ceilY} x2={backX} y2={ceilY}
        stroke="#374151" strokeWidth="1" strokeDasharray="6,4" />
      <text x={stageX + 4} y={ceilY - 4}
        fontSize="8" fill="#4b5563" fontFamily="monospace">Ceiling ~{ceilH}ft</text>

      {/* Stage wall */}
      <line x1={stageX} y1={ceilY} x2={stageX} y2={floorY}
        stroke="#374151" strokeWidth="2" />
      <text x={stageX - 4} y={floorY - drawH / 2}
        textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="monospace"
        transform={`rotate(-90, ${stageX - 14}, ${floorY - drawH / 2})`}>
        STAGE
      </text>

      {/* Back wall */}
      <line x1={backX} y1={ceilY} x2={backX} y2={floorY}
        stroke="#374151" strokeWidth="2" />

      {/* ── Sub on floor (separate from array) ─────────────────────────── */}
      <rect x={subX} y={subTopY} width={subW} height={subVisH}
        fill="#1f2937" stroke="#4b5563" strokeWidth="1" rx="1" />
      <text x={subX + subW / 2} y={subTopY + subVisH / 2 + 3}
        textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="monospace">SUB</text>

      {/* ── Crank stand pole ───────────────────────────────────────────── */}
      <rect
        x={standCenterX - standW / 2} y={flybarY}
        width={standW} height={floorY - flybarY}
        fill="#374151" stroke="#4b5563" strokeWidth="0.5"
      />
      {/* Stand base plate */}
      <rect
        x={standCenterX - 10} y={floorY - 3}
        width={20} height={4}
        fill="#374151" stroke="#4b5563" strokeWidth="0.5" rx="1"
      />
      {/* Flybar beam */}
      <rect
        x={standCenterX - flybarHalfW} y={flybarY - 3}
        width={flybarHalfW * 2} height={4}
        fill="#4b5563" stroke="#6b7280" strokeWidth="0.5" rx="1"
      />
      {/* Flybar label */}
      <text x={standCenterX + flybarHalfW + 4} y={flybarY + 2}
        fontSize="7" fill="#6b7280" fontFamily="monospace">
        flybar
      </text>

      {/* ── Array boxes hanging from flybar ────────────────────────────── */}
      {Array.from({ length: result.effectiveBoxes }, (_, i) => {
        // i=0 is the top box (nearest-aimed, wide splay) just below flybar
        // i=effectiveBoxes-1 is the bottom box (far-aimed, tight splay)
        // Invert display index so box[0] (top/near) is at top of hanging cluster
        const displayIdx = result.effectiveBoxes - 1 - i; // i=0 → bottom of cluster
        const boxY = arrayTopY + displayIdx * (boxH + boxGap);
        // In boxLevels: 0=bottom (far, 0dB), 1=top (near, -3dB)
        const level = result.boxLevels[i]; // i=0 far=0dB, i=1 near=-3dB
        const isTop = i === result.effectiveBoxes - 1;
        const fill = isTop ? '#fbbf24' : '#d97706';
        return (
          <g key={i}>
            <rect
              x={standCenterX - boxW / 2} y={boxY}
              width={boxW} height={boxH}
              fill={fill} stroke="#92400e" strokeWidth="0.5" rx="1"
            />
            <text x={standCenterX + boxW / 2 + 5} y={boxY + boxH - 1}
              fontSize="7" fill="#9ca3af" fontFamily="monospace">
              {isTop ? '#2' : '#1'} {level === 0 ? '0dB' : `${level}dB`}
            </text>
          </g>
        );
      })}

      {/* ── Coverage rays from physics mid-array point ──────────────────── */}
      {/* Bottom ray → far floor */}
      <line x1={midArrayX} y1={midArrayY}
        x2={farX} y2={nearFloorY}
        stroke="#f59e0b" strokeWidth="1.5" opacity="0.8" />
      {/* Top ray → near floor */}
      <line x1={midArrayX} y1={midArrayY}
        x2={nearSeatX} y2={nearFloorY}
        stroke="#3b82f6" strokeWidth="1.5" opacity="0.8" />

      {/* Array height bracket */}
      <line x1={stageX - 10} y1={arrayTopY} x2={stageX - 10} y2={floorY}
        stroke="#6b7280" strokeWidth="1" />
      <line x1={stageX - 14} y1={arrayTopY} x2={stageX - 6} y2={arrayTopY}
        stroke="#6b7280" strokeWidth="1" />
      <line x1={stageX - 14} y1={floorY} x2={stageX - 6} y2={floorY}
        stroke="#6b7280" strokeWidth="1" />
      <text x={stageX - 22} y={(arrayTopY + floorY) / 2 + 4}
        textAnchor="middle" fontSize="8" fill="#6b7280" fontFamily="monospace"
        transform={`rotate(-90, ${stageX - 22}, ${(arrayTopY + floorY) / 2 + 4})`}>
        {flybarFt.toFixed(1)}ft
      </text>

      {/* ── Front-row vertical dashed line ──────────────────────────────── */}
      <line x1={nearSeatX} y1={ceilY} x2={nearSeatX} y2={floorY}
        stroke="#4b5563" strokeWidth="1" strokeDasharray="5,4" />
      <text x={nearSeatX + 3} y={ceilY + 10}
        fontSize="8" fill="#6b7280" fontFamily="monospace">
        Front row
      </text>

      {/* ── Sweet zone on floor ─────────────────────────────────────────── */}
      <line x1={sweetStartX} y1={floorY + 5} x2={sweetEndX} y2={floorY + 5}
        stroke="#22c55e" strokeWidth="3" opacity="0.7" />
      <text x={(sweetStartX + sweetEndX) / 2} y={floorY + 16}
        textAnchor="middle" fontSize="8" fill="#22c55e" fontFamily="monospace">
        coverage zone
      </text>

      {/* ── SPL callout dots ─────────────────────────────────────────────── */}
      {splPoints.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={floorY - 5} r={3} fill={splColor(pt.spl)} opacity="0.9" />
          <text x={pt.x} y={floorY - 15}
            textAnchor="middle" fontSize="9" fill={splColor(pt.spl)} fontFamily="monospace">
            {pt.label}
          </text>
        </g>
      ))}

      {/* ── Delay speaker (ceiling-hung) ─────────────────────────────────── */}
      {result.needsDelay && delayX > stageX && delayX < backX && (
        <>
          <rect x={delayX - 8} y={delayCeilY - 8} width={16} height={8}
            fill="#f59e0b" rx="2" />
          <polygon
            points={`${delayX - 5},${delayCeilY} ${delayX + 5},${delayCeilY} ${delayX},${delayCeilY + 8}`}
            fill="#fbbf24" />
          <line x1={delayX} y1={delayCeilY + 8} x2={delayX} y2={floorY}
            stroke="#6b7280" strokeWidth="1" strokeDasharray="4,3" />
          <text x={delayX + 10} y={delayCeilY + 4}
            fontSize="8" fill="#fbbf24" fontFamily="monospace">
            +{result.alignmentMs.toFixed(1)}ms
          </text>
          <text x={delayX + 10} y={delayCeilY + 14}
            fontSize="8" fill="#fbbf24" fontFamily="monospace">
            {result.delayLevel}dB
          </text>
        </>
      )}

      {/* ── Throw distance arrow ─────────────────────────────────────────── */}
      <line x1={stageX} y1={floorY + 28} x2={backX} y2={floorY + 28}
        stroke="#4b5563" strokeWidth="1" />
      <text x={(stageX + backX) / 2} y={floorY + 40}
        textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="monospace">
        {result.throwDist} ft throw
      </text>

      {/* ── Aim angle labels ─────────────────────────────────────────────── */}
      <text x={midArrayX + 22} y={midArrayY - 4}
        fontSize="8" fill="#3b82f6" fontFamily="monospace">
        top: {result.topAimAngle.toFixed(1)}° (far)
      </text>
      <text x={midArrayX + 22} y={midArrayY + 8}
        fontSize="8" fill="#f59e0b" fontFamily="monospace">
        btm: {result.bottomAimAngle.toFixed(1)}° (near)
      </text>
    </svg>
  );
}
