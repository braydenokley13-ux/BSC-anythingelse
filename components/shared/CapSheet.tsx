'use client';

import { capTier, formatMoneyShort, calculateLuxuryTax } from '@/lib/CapMath';

interface CapPlayer {
  name: string;
  position: string;
  salary: number;
  yearsLeft: number;
  age: number;
}

interface CapSheetProps {
  players: CapPlayer[];
  teamName: string;
  showTaxCalc?: boolean;
}

export default function CapSheet({ players, teamName, showTaxCalc = true }: CapSheetProps) {
  const totalSalary = players.reduce((s, p) => s + p.salary, 0);
  const tier = capTier(totalSalary);
  const taxBill = calculateLuxuryTax(totalSalary);
  const maxSalary = Math.max(...players.map(p => p.salary), 1);

  return (
    <div className="bg-[#0a0e1a] rounded-xl border border-[#1e293b] overflow-hidden">
      <div className="bg-[#111827] px-4 py-3 flex items-center justify-between border-b border-[#1e293b]">
        <div>
          <div className="text-white font-bold text-sm">{teamName}</div>
          <div className="text-[#64748b] text-xs">Cap Sheet</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black" style={{ color: tier.color }}>{formatMoneyShort(totalSalary)}</div>
          <div className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: tier.color + '20', color: tier.color }}>{tier.tier}</div>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        {players.map((player, i) => {
          const barWidth = (player.salary / maxSalary) * 100;
          const barColor = player.salary > 35 ? '#ef4444' : player.salary > 20 ? '#f59e0b' : '#10b981';
          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between text-xs mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#64748b] w-5 text-center font-mono">{player.position}</span>
                  <span className="text-[#e2e8f0] font-medium">{player.name}</span>
                  <span className="text-[#64748b]">({player.yearsLeft}yr)</span>
                </div>
                <span className="font-bold" style={{ color: barColor }}>{formatMoneyShort(player.salary)}</span>
              </div>
              <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showTaxCalc && (
        <div className="border-t border-[#1e293b] p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#64748b]">Cap Line</span>
            <span className="text-[#3b82f6]">$140.6M</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#64748b]">Tax Line</span>
            <span className="text-[#f59e0b]">$170.7M</span>
          </div>
          {taxBill > 0 && (
            <div className="flex justify-between text-xs font-bold mt-2 pt-2 border-t border-[#1e293b]">
              <span className="text-red-400">Luxury Tax Bill</span>
              <span className="text-red-400">+{formatMoneyShort(taxBill)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#64748b]">Cap Status</span>
            <span style={{ color: tier.color }}>{tier.description}</span>
          </div>
        </div>
      )}
    </div>
  );
}
