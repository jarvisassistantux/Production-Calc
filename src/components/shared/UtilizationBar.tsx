interface Props {
  percent: number;
  label?: string;
  showPercent?: boolean;
}

export function UtilizationBar({ percent, label, showPercent = true }: Props) {
  const clamped = Math.min(percent, 100);
  const color =
    percent > 100 ? 'bg-red-500' :
    percent >= 80 ? 'bg-amber-500' :
    'bg-emerald-500';
  const textColor =
    percent > 100 ? 'text-red-400' :
    percent >= 80 ? 'text-amber-400' :
    'text-emerald-400';

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span className="text-gray-400">{label}</span>}
          {showPercent && <span className={`font-mono font-semibold ${textColor}`}>{percent.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
