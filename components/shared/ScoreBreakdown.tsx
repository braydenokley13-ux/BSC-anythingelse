'use client';

import { calculateMultiFactorScore } from '@/lib/AIValuation';

interface ScoreBreakdownProps {
  valueAcquired: number; // 0-10
  capEfficiency: number; // 0-10
  futureAssets: number; // 0-10
  title?: string;
  compareScore?: number; // real GM score
}

export default function ScoreBreakdown({
  valueAcquired, capEfficiency, futureAssets, title = 'Your GM Score', compareScore
}: ScoreBreakdownProps) {
  const { total, grade, breakdown } = calculateMultiFactorScore({ valueAcquired, capEfficiency, futureAssets });

  const gradeColor = (g: string) => {
    if (g.startsWith('A')) return '#10b981';
    if (g.startsWith('B')) return '#f59e0b';
    if (g.startsWith('C')) return '#3b82f6';
    return '#ef4444';
  };

  const barColor = (val: number) => val >= 70 ? '#10b981' : val >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-[#0a0e1a] rounded-xl border border-[#1e293b] p-5">
      <div className="text-center mb-5">
        <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">{title}</div>
        <div className="text-6xl font-black" style={{ color: gradeColor(grade) }}>{grade}</div>
        <div className="text-2xl font-bold text-[#e2e8f0] mt-1">{total}/100</div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Value Acquired', value: breakdown.valueAcquired, weight: '40%', desc: 'Rating vs salary of incoming players' },
          { label: 'Cap Efficiency', value: breakdown.capEfficiency, weight: '30%', desc: 'Did you improve cap flexibility?' },
          { label: 'Future Assets', value: breakdown.futureAssets, weight: '30%', desc: 'Draft picks retained' },
        ].map(({ label, value, weight, desc }) => (
          <div key={label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <div>
                <span className="text-[#e2e8f0] font-medium">{label}</span>
                <span className="text-[#64748b] ml-2">({weight})</span>
              </div>
              <span className="font-bold" style={{ color: barColor(value) }}>{value}/100</span>
            </div>
            <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: barColor(value) }} />
            </div>
            <div className="text-xs text-[#64748b] mt-0.5">{desc}</div>
          </div>
        ))}
      </div>

      {compareScore !== undefined && (
        <div className="mt-4 pt-4 border-t border-[#1e293b]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#64748b]">Real GM Score</span>
            <span className="font-bold text-[#3b82f6]">{compareScore}/100</span>
          </div>
          <div className="text-xs text-center mt-2" style={{
            color: total > compareScore ? '#10b981' : total === compareScore ? '#f59e0b' : '#ef4444'
          }}>
            {total > compareScore ? `🏆 You outperformed the real GM by ${total - compareScore} points!` :
              total === compareScore ? '🤝 You matched the real GM exactly.' :
              `📉 Real GM scored ${compareScore - total} points higher than you.`}
          </div>
        </div>
      )}
    </div>
  );
}
