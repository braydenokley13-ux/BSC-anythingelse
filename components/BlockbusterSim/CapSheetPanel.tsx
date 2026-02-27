'use client';

import { isTradeCapLegal, formatMoneyShort, salaryMatchingLimit } from '@/lib/CapMath';
import type { Player, DraftPick } from '@/data/tradeScenarios';

interface CapSheetPanelProps {
  teamName: string;
  players: Player[];
  picks: DraftPick[];
  selectedOutgoing: string[];
  selectedIncoming: string[];
  onTogglePlayer: (id: string, direction: 'out' | 'in') => void;
  isStudentTeam: boolean;
  showHints?: boolean;
}

export default function CapSheetPanel({
  teamName, players, picks, selectedOutgoing, selectedIncoming, onTogglePlayer, isStudentTeam, showHints
}: CapSheetPanelProps) {
  const outgoingSalary = players
    .filter(p => selectedOutgoing.includes(p.id))
    .reduce((s, p) => s + p.salary, 0);
  const incomingSalary = players
    .filter(p => selectedIncoming.includes(p.id))
    .reduce((s, p) => s + p.salary, 0);

  const legality = isTradeCapLegal(
    players.filter(p => selectedOutgoing.includes(p.id)).map(p => p.salary),
    players.filter(p => selectedIncoming.includes(p.id)).map(p => p.salary),
    'over'
  );

  const ratingColor = (r: number) => r >= 90 ? '#f59e0b' : r >= 80 ? '#10b981' : r >= 70 ? '#3b82f6' : '#64748b';
  const { max } = salaryMatchingLimit(outgoingSalary);

  return (
    <div className="bg-[#0a0e1a] rounded-xl border border-[#1e293b] overflow-hidden">
      <div className="bg-[#111827] px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
        <div>
          <div className="text-white font-bold">{teamName}</div>
          {isStudentTeam && <div className="text-xs text-[#f59e0b]">YOUR TEAM</div>}
        </div>
        {isStudentTeam && selectedOutgoing.length > 0 && (
          <div className={`text-xs px-2 py-1 rounded-lg font-bold ${legality.legal ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-red-900/30 text-red-400 border border-red-700'}`}>
            {legality.legal ? '✓ CAP LEGAL' : '✗ ILLEGAL TRADE'}
          </div>
        )}
      </div>

      {showHints && isStudentTeam && (
        <div className="px-3 py-2 bg-[#1a2035] border-b border-[#1e293b] text-xs text-[#94a3b8]">
          💡 Click players to add them to your trade offer. Red border = too expensive to include. Green = cap-legal match.
        </div>
      )}

      <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
        {players.map(player => {
          const isOut = selectedOutgoing.includes(player.id);
          const isIn = selectedIncoming.includes(player.id);
          const isHighlighted = isOut || isIn;
          const canToggleOut = isStudentTeam && !player.isUntouchable;

          return (
            <div
              key={player.id}
              onClick={() => canToggleOut && onTogglePlayer(player.id, isStudentTeam ? 'out' : 'in')}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                canToggleOut ? 'cursor-pointer' : 'cursor-default'
              } ${
                isOut ? 'bg-red-900/20 border-red-600' :
                isIn ? 'bg-green-900/20 border-green-600' :
                'bg-[#111827] border-[#1e293b] hover:border-[#64748b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold w-8 text-center text-[#64748b]">{player.position}</span>
                <div>
                  <div className="text-sm font-semibold text-[#e2e8f0]">{player.name}</div>
                  <div className="text-xs text-[#64748b]">Age {player.age} • {player.yearsLeft}yr</div>
                </div>
                {player.isUntouchable && <span className="text-xs text-red-500">🔒</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: ratingColor(player.rating) }}>{player.rating}</span>
                <span className="text-sm font-bold text-[#f59e0b]">{formatMoneyShort(player.salary)}</span>
                {isOut && <span className="text-xs text-red-400 font-bold">OUT →</span>}
                {isIn && <span className="text-xs text-green-400 font-bold">← IN</span>}
              </div>
            </div>
          );
        })}

        {picks.map(pick => (
          <div key={pick.id} className="flex items-center justify-between p-2 rounded-lg border border-[#1e293b] bg-[#111827]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8b5cf6]">PICK</span>
              <div className="text-sm text-[#e2e8f0]">{pick.year} 1st Rd</div>
              {pick.protected && <span className="text-xs text-[#64748b]">({pick.protected})</span>}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: pick.estimatedValue }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isStudentTeam && selectedOutgoing.length > 0 && (
        <div className="border-t border-[#1e293b] p-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-[#64748b]">Sending out:</span>
            <span className="text-red-400 font-bold">{formatMoneyShort(outgoingSalary)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748b]">Match limit (125%):</span>
            <span className="text-[#e2e8f0]">{formatMoneyShort(max)}</span>
          </div>
          {!legality.legal && (
            <div className="text-red-400 text-xs pt-1">{legality.reason}</div>
          )}
        </div>
      )}
    </div>
  );
}
