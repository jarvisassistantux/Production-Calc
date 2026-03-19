import type { SoundResult } from '../../utils/sound';

interface Props {
  roomLength: number;
  roomWidth: number;
  result: SoundResult;
}

export function RoomTopView({ roomLength, roomWidth, result }: Props) {
  const vw = 520;
  const vh = 400;
  const margin = 50;

  // Room rect (length = stage→back = vertical axis, width = horizontal axis)
  const roomW = vw - margin * 2;
  const roomH = vh - margin * 2;

  const scaleY = roomH / roomLength;

  // Room rect origin
  const rx = margin;
  const ry = margin;

  // Stage zone at top of room rect
  const stageZoneH = Math.min(40, roomH * 0.12);

  // Array bars (vertical, near stage)
  const arrayBarW = 8;
  const stackScaled = Math.min(result.stackHeightFt * scaleY * 0.5, roomH * 0.25);
  const arrayY = ry + stageZoneH + 4;

  // Reposition arrays by actual wall offset
  const wallOffsetPx = (result.wallOffsetFt / roomWidth) * roomW;
  const leftArrayX = rx + wallOffsetPx;
  const rightArrayX = rx + roomW - wallOffsetPx - arrayBarW;

  // Coverage fan: ±45° from array toward room
  const arrayFY = arrayY + stackScaled / 2;
  const leftFX = leftArrayX + arrayBarW / 2;
  const rightFX = rightArrayX + arrayBarW / 2;

  const fanLen = roomH * 1.2;
  const fanAngle = (result.horizontalDeg / 2) * (Math.PI / 180);

  const leftFanPoints = [
    [leftFX, arrayFY],
    [leftFX + fanLen * Math.sin(fanAngle), arrayFY + fanLen * Math.cos(fanAngle)],
    [leftFX + fanLen * Math.sin(fanAngle * 0.1), arrayFY + fanLen * Math.cos(fanAngle * 0.1)],
  ];

  const rightFanPoints = [
    [rightFX, arrayFY],
    [rightFX - fanLen * Math.sin(fanAngle), arrayFY + fanLen * Math.cos(fanAngle)],
    [rightFX - fanLen * Math.sin(fanAngle * 0.1), arrayFY + fanLen * Math.cos(fanAngle * 0.1)],
  ];

  const toSvgPts = (pts: number[][]) => pts.map(p => p.join(',')).join(' ');

  // Delay speaker positions
  const delayYOffset = result.delayPosition * scaleY;
  const delayY = ry + stageZoneH + delayYOffset;

  // Dimension lines
  const dimLineY = ry + roomH + 18;
  const dimLineX = rx + roomW + 18;

  // L-R spacing dimension line — sit below the array bars to avoid stage label
  const leftArrayCX = leftArrayX + arrayBarW / 2;
  const rightArrayCX = rightArrayX + arrayBarW / 2;
  const spacingLineY = arrayY + stackScaled + 10;

  // Near-seat dashed line
  const nearSeatY = ry + stageZoneH + (15 / roomLength) * roomH;

  // Coverage width at back wall
  const coverageWidthFt = (2 * result.throwDist * Math.tan(50 * Math.PI / 180)).toFixed(0);

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      className="w-full h-auto rounded-lg bg-gray-950"
      style={{ maxHeight: 400 }}
    >
      <defs>
        <clipPath id="roomClip">
          <rect x={rx} y={ry} width={roomW} height={roomH} />
        </clipPath>
        <marker id="arrowR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="#4b5563" strokeWidth="1" />
        </marker>
        <marker id="arrowL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="#4b5563" strokeWidth="1" />
        </marker>
        <marker id="arrowAmberR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="#f59e0b" strokeWidth="1" />
        </marker>
        <marker id="arrowAmberL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="#f59e0b" strokeWidth="1" />
        </marker>
      </defs>

      {/* Room rect */}
      <rect x={rx} y={ry} width={roomW} height={roomH}
        fill="none" stroke="#374151" strokeWidth="2" />

      {/* Stage zone */}
      <rect x={rx} y={ry} width={roomW} height={stageZoneH}
        fill="#1f2937" stroke="none" />
      <text x={rx + roomW / 2} y={ry + stageZoneH / 2 + 4}
        textAnchor="middle" fontSize="10" fill="#6b7280" fontFamily="monospace">
        STAGE
      </text>

      {/* MC near-field zone — between arrays and front row (feedback risk area) */}
      <rect
        x={rx} y={arrayY + stackScaled}
        width={roomW} height={Math.max(0, nearSeatY - (arrayY + stackScaled))}
        fill="#f59e0b" opacity="0.05"
        clipPath="url(#roomClip)"
      />
      <text
        x={rx + roomW / 2} y={arrayY + stackScaled + Math.max(0, nearSeatY - (arrayY + stackScaled)) / 2 + 4}
        textAnchor="middle" fontSize="8" fill="#f59e0b" fontFamily="monospace" opacity="0.6">
        MC near-field — feedback risk when facing arrays
      </text>

      {/* Coverage fans (clipped to room) */}
      <g clipPath="url(#roomClip)" opacity="0.18">
        <polygon points={toSvgPts(leftFanPoints)} fill="#3b82f6" />
        <polygon points={toSvgPts(rightFanPoints)} fill="#3b82f6" />
      </g>
      <g clipPath="url(#roomClip)">
        <polygon points={toSvgPts(leftFanPoints)}
          fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
        <polygon points={toSvgPts(rightFanPoints)}
          fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
      </g>

      {/* L-R spacing dimension line (below array bars, in audience area) */}
      <line
        x1={leftArrayCX} y1={spacingLineY}
        x2={rightArrayCX} y2={spacingLineY}
        stroke="#f59e0b" strokeWidth="1"
        markerEnd="url(#arrowAmberR)" markerStart="url(#arrowAmberL)"
      />
      {/* Tick marks */}
      <line x1={leftArrayCX} y1={spacingLineY - 4} x2={leftArrayCX} y2={spacingLineY + 4}
        stroke="#f59e0b" strokeWidth="1" />
      <line x1={rightArrayCX} y1={spacingLineY - 4} x2={rightArrayCX} y2={spacingLineY + 4}
        stroke="#f59e0b" strokeWidth="1" />
      <text
        x={(leftArrayCX + rightArrayCX) / 2} y={spacingLineY + 12}
        textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="monospace">
        ← {result.arraySpacingFt} ft →
      </text>

      {/* Left array bar */}
      <rect x={leftArrayX} y={arrayY} width={arrayBarW} height={stackScaled}
        fill="#f59e0b" rx="2" />
      <text x={leftArrayX - 4} y={arrayY + stackScaled / 2 + 4}
        textAnchor="end" fontSize="9" fill="#f59e0b" fontFamily="monospace" fontWeight="bold">
        L
      </text>

      {/* Right array bar */}
      <rect x={rightArrayX} y={arrayY} width={arrayBarW} height={stackScaled}
        fill="#f59e0b" rx="2" />
      <text x={rightArrayX + arrayBarW + 4} y={arrayY + stackScaled / 2 + 4}
        textAnchor="start" fontSize="9" fill="#f59e0b" fontFamily="monospace" fontWeight="bold">
        R
      </text>

      {/* Near-seat dashed line */}
      <line x1={rx} y1={nearSeatY} x2={rx + roomW} y2={nearSeatY}
        stroke="#4b5563" strokeWidth="1" strokeDasharray="5,4" />
      <text x={rx + roomW - 3} y={nearSeatY - 3}
        textAnchor="end" fontSize="8" fill="#6b7280" fontFamily="monospace">
        front row
      </text>

      {/* Delay speakers */}
      {result.needsDelay && delayY > ry + stageZoneH && delayY < ry + roomH && (
        <>
          <circle cx={rx + 6} cy={delayY} r={6} fill="#f59e0b" opacity="0.9" />
          <text x={rx + 16} y={delayY + 4}
            fontSize="8" fill="#fbbf24" fontFamily="monospace">DL</text>
          <circle cx={rx + roomW - 6} cy={delayY} r={6} fill="#f59e0b" opacity="0.9" />
          <text x={rx + roomW - 16} y={delayY + 4}
            textAnchor="end" fontSize="8" fill="#fbbf24" fontFamily="monospace">DR</text>
          <line x1={rx + roomW / 2} y1={ry + stageZoneH}
            x2={rx + roomW / 2} y2={delayY}
            stroke="#6b7280" strokeWidth="1" strokeDasharray="4,3" />
        </>
      )}

      {result.needsFlare && (
        <text x={rx + roomW - 6} y={ry + 14}
          textAnchor="end" fontSize="11" fill="#ef4444" fontFamily="monospace">!</text>
      )}

      {/* Width dimension arrow */}
      <line x1={rx} y1={dimLineY} x2={rx + roomW} y2={dimLineY}
        stroke="#4b5563" strokeWidth="1" markerEnd="url(#arrowR)" markerStart="url(#arrowL)" />
      <text x={rx + roomW / 2} y={dimLineY + 12}
        textAnchor="middle" fontSize="10" fill="#6b7280" fontFamily="monospace">
        {roomWidth} ft wide
      </text>

      {/* Length dimension arrow */}
      <line x1={dimLineX} y1={ry} x2={dimLineX} y2={ry + roomH}
        stroke="#4b5563" strokeWidth="1" />
      <text x={dimLineX + 6} y={ry + roomH / 2}
        fontSize="10" fill="#6b7280" fontFamily="monospace"
        transform={`rotate(90, ${dimLineX + 6}, ${ry + roomH / 2})`}
        textAnchor="middle">
        {roomLength} ft long
      </text>

      {/* Delay distance annotation */}
      {result.needsDelay && (
        <text x={rx + roomW / 2 + 6} y={delayY - 4}
          textAnchor="start" fontSize="8" fill="#fbbf24" fontFamily="monospace">
          {result.delayPosition.toFixed(0)}ft
        </text>
      )}

      {/* Coverage width label at back wall */}
      <text x={rx + roomW / 2} y={ry + roomH - 5}
        textAnchor="middle" fontSize="8" fill="#4b5563" fontFamily="monospace">
        coverage ~{coverageWidthFt} ft wide
      </text>

      {/* Throw distance vertical dimension (inside room, right side) */}
      {(() => {
        const tdX = rx + roomW - 14;
        const tdTop = ry + stageZoneH + 2;
        const tdBot = ry + roomH - 2;
        const tdMid = (tdTop + tdBot) / 2;
        return (
          <>
            <line x1={tdX} y1={tdTop} x2={tdX} y2={tdBot}
              stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
            <line x1={tdX - 3} y1={tdTop} x2={tdX + 3} y2={tdTop}
              stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
            <line x1={tdX - 3} y1={tdBot} x2={tdX + 3} y2={tdBot}
              stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
            <text x={tdX - 5} y={tdMid}
              textAnchor="middle" fontSize="9" fill="#60a5fa" fontFamily="monospace"
              transform={`rotate(-90, ${tdX - 5}, ${tdMid})`}>
              throw: {result.throwDist} ft
            </text>
          </>
        );
      })()}
    </svg>
  );
}

