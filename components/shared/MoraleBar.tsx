'use client';

interface MoraleBarProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showWarning?: boolean;
}

export default function MoraleBar({ value, label = 'Morale', size = 'md', showWarning = true }: MoraleBarProps) {
  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444';
  const emoji = value >= 70 ? '😊' : value >= 40 ? '😐' : '🔥';
  const status = value >= 70 ? 'Good' : value >= 40 ? 'Tense' : 'CRISIS';

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-5' : 'h-3';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div>
      <div className={`flex items-center justify-between mb-1 ${textSize}`}>
        <span className="text-[#64748b]">{label}</span>
        <span className="flex items-center gap-1 font-bold" style={{ color }}>
          {emoji} {value}% <span className="text-xs opacity-70">({status})</span>
        </span>
      </div>
      <div className={`${heightClass} bg-[#1e293b] rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full morale-bar transition-all duration-1000"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: value < 30 ? `0 0 8px ${color}` : 'none',
          }}
        />
      </div>
      {showWarning && value < 25 && (
        <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
          ⚠️ Danger zone — star may demand trade publicly
        </div>
      )}
    </div>
  );
}
