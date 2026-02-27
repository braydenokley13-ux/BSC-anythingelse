'use client';

interface PlayerCardProps {
  name: string;
  position: string;
  salary: number;
  age: number;
  rating: number;
  yearsLeft: number;
  isProtected?: boolean;
  isUntouchable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  showTradeValue?: boolean;
  tradeValue?: number;
}

const ratingColor = (r: number) => {
  if (r >= 90) return '#f59e0b';
  if (r >= 80) return '#10b981';
  if (r >= 70) return '#3b82f6';
  if (r >= 60) return '#8b5cf6';
  return '#64748b';
};

const posColor = (pos: string) => {
  const map: Record<string, string> = { PG: '#3b82f6', SG: '#8b5cf6', SF: '#10b981', PF: '#f59e0b', C: '#ef4444' };
  return map[pos] || '#64748b';
};

export default function PlayerCard({
  name, position, salary, age, rating, yearsLeft,
  isProtected, isUntouchable, isSelected, onClick, compact, showTradeValue, tradeValue
}: PlayerCardProps) {
  const borderColor = isSelected ? '#f59e0b' : isUntouchable ? '#ef4444' : '#1e293b';

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
          isSelected ? 'bg-[#2a1f00]' : 'bg-[#111827] hover:bg-[#1a2035]'
        }`}
        style={{ borderColor }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: posColor(position), color: '#000' }}>{position}</span>
          <span className="text-sm font-semibold text-[#e2e8f0]">{name}</span>
          {isUntouchable && <span className="text-xs text-red-400">(UNTOUCHABLE)</span>}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          <span style={{ color: ratingColor(rating) }}>{rating} OVR</span>
          <span>${salary.toFixed(1)}M</span>
          <span>{yearsLeft}yr</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 transition-all ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''} ${
        isSelected ? 'bg-[#2a1f00] ring-2 ring-[#f59e0b]' : 'bg-[#1a2035]'
      }`}
      style={{ borderColor }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: posColor(position) + '33', color: posColor(position), border: `1px solid ${posColor(position)}` }}>
              {position}
            </span>
            {isUntouchable && <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-700">UNTOUCHABLE</span>}
            {isProtected && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-700">PROTECTED</span>}
          </div>
          <div className="text-white font-bold text-base">{name}</div>
          <div className="text-[#64748b] text-xs mt-0.5">Age {age}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black" style={{ color: ratingColor(rating) }}>{rating}</div>
          <div className="text-xs text-[#64748b]">OVR</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center bg-[#0a0e1a] rounded-lg p-2">
          <div className="text-[#f59e0b] font-bold text-sm">${salary.toFixed(1)}M</div>
          <div className="text-[#64748b] text-xs">Salary</div>
        </div>
        <div className="text-center bg-[#0a0e1a] rounded-lg p-2">
          <div className="text-[#e2e8f0] font-bold text-sm">{yearsLeft}yr</div>
          <div className="text-[#64748b] text-xs">Left</div>
        </div>
        {showTradeValue && tradeValue !== undefined && (
          <div className="text-center bg-[#0a0e1a] rounded-lg p-2">
            <div className="font-bold text-sm" style={{ color: tradeValue >= 7 ? '#10b981' : tradeValue >= 4 ? '#f59e0b' : '#ef4444' }}>{tradeValue}/10</div>
            <div className="text-[#64748b] text-xs">Trade Val</div>
          </div>
        )}
      </div>
    </div>
  );
}
