'use client';

import { useState, useEffect } from 'react';
import { CAP_NIGHTMARE_SCENARIOS, REBUILD_TOOLS, MLE_FREE_AGENTS, PRESS_EVENTS } from '@/data/capNightmareTeams';
import type { CapNightmareScenario, CapPlayer } from '@/data/capNightmareTeams';
import { calculateLuxuryTax, formatMoneyShort, stretchProvision } from '@/lib/CapMath';
import MoraleBar from '@/components/shared/MoraleBar';
import { HintBox } from '@/components/shared/TrackWrapper';

type Phase = 'select' | 'year1' | 'year2' | 'year3' | 'press-event' | 'star-crisis' | 'verdict';

interface RebuildState {
  scenario: CapNightmareScenario | null;
  players: CapPlayer[];
  picks: Array<{ year: number; protected?: string; value: number }>;
  totalSalary: number;
  starMorale: number;
  lockerRoomMorale: number;
  winPct: number;
  decisions: string[];
  capHealth: number;
  fanConfidence: number;
  isTanking: boolean;
  mleUsed: boolean;
}

interface FlashEntry {
  tool: string;
  player: string;
  capEffect: string;
  lesson: string;
}

export default function DumpsterFirePage() {
  const [track, setTrack] = useState<'5-6' | '7-8'>('5-6');
  const [phase, setPhase] = useState<Phase>('select');
  const [state, setState] = useState<RebuildState>({
    scenario: null, players: [], picks: [], totalSalary: 0,
    starMorale: 0, lockerRoomMorale: 0, winPct: 0,
    decisions: [], capHealth: 0, fanConfidence: 50, isTanking: false, mleUsed: false,
  });
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [yearScores, setYearScores] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMlePanel, setShowMlePanel] = useState(false);
  const [pendingPressEvent, setPendingPressEvent] = useState<typeof PRESS_EVENTS[0] | null>(null);
  const [pendingNextPhase, setPendingNextPhase] = useState<Phase | null>(null);
  const [selectedScenarioPreview, setSelectedScenarioPreview] = useState<CapNightmareScenario | null>(null);
  const [flashEntry, setFlashEntry] = useState<FlashEntry | null>(null);
  const [showMoraleFormula, setShowMoraleFormula] = useState(false);

  const isAdvanced = track === '7-8';

  // Auto-clear flash entry after 5 seconds
  useEffect(() => {
    if (!flashEntry) return;
    const id = setTimeout(() => setFlashEntry(null), 5000);
    return () => clearTimeout(id);
  }, [flashEntry]);

  function selectScenario(scenario: CapNightmareScenario) {
    setState({
      scenario,
      players: [...scenario.players],
      picks: [...scenario.startingCapSituation.picks],
      totalSalary: scenario.startingCapSituation.totalSalary,
      starMorale: scenario.starMorale,
      lockerRoomMorale: scenario.lockerRoomMorale,
      winPct: scenario.winPct,
      decisions: [],
      capHealth: 0,
      fanConfidence: 50,
      isTanking: false,
      mleUsed: false,
    });
    setActionLog([]);
    setPhase('year1');
    setErrorMessage(null);
    setShowMlePanel(false);
    setFlashEntry(null);
  }

  function applyTool(tool: string, playerId: string) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    setErrorMessage(null);
    let newPlayers = [...state.players];
    let newSalary = state.totalSalary;
    let newMorale = state.lockerRoomMorale;
    let newStarMorale = state.starMorale;
    let newWinPct = state.winPct;
    let logEntry = '';

    switch (tool) {
      case 'trade': {
        const tradeValue = player.tradeValue;
        newPlayers = newPlayers.filter(p => p.id !== playerId);
        newSalary -= player.salary;
        newMorale += player.moraleImpact > 0 ? -5 : 5;
        newWinPct -= player.rating / 1000;
        logEntry = `✓ TRADED ${player.name} (${formatMoneyShort(player.salary)}/yr). Trade value was ${tradeValue}/10. Cap freed: ${formatMoneyShort(player.salary)}/yr.`;
        break;
      }
      case 'stretch': {
        if (!player.canBeStretched) {
          setErrorMessage(`${player.name}'s contract cannot be stretched — minimum 2 years required.`);
          return;
        }
        const { yearsSpread, perYearAmount } = stretchProvision(player.salary, player.yearsLeft);
        newPlayers = newPlayers.filter(p => p.id !== playerId);
        newSalary = newSalary - player.salary + perYearAmount;
        logEntry = `📅 STRETCHED ${player.name}. Spread $${(player.salary * player.yearsLeft).toFixed(0)}M over ${yearsSpread} years = ${formatMoneyShort(perYearAmount)}/yr.`;
        break;
      }
      case 'buyout': {
        if (!player.canBeBoughtOut) {
          setErrorMessage(`${player.name} refused buyout terms — their agent won't agree.`);
          return;
        }
        const buyoutPenalty = player.salary * 0.3;
        newSalary = newSalary - player.salary + buyoutPenalty;
        newPlayers = newPlayers.filter(p => p.id !== playerId);
        logEntry = `💸 BOUGHT OUT ${player.name}. Eating ${formatMoneyShort(buyoutPenalty)} dead money. He is now a free agent.`;
        break;
      }
      case 'tank': {
        setState(s => ({ ...s, isTanking: !s.isTanking }));
        const logMsg = state.isTanking ? '🎯 STOPPED TANKING — Competing again.' : '🎯 ENTERED TANK MODE — Sacrificing wins for draft position.';
        setActionLog(prev => [...prev, logMsg]);
        setSelectedTool(null);
        return;
      }
      default:
        return;
    }

    newMorale = Math.max(0, Math.min(100, newMorale));
    newStarMorale -= player.moraleImpact > 2 ? 10 : 0;
    newStarMorale = Math.max(0, Math.min(100, newStarMorale));

    // Build educational flash entry
    let flashCapEffect = '';
    let flashLesson = '';
    if (tool === 'trade') {
      flashCapEffect = `Freed ${formatMoneyShort(player.salary)}/yr in cap space. Win% dipped by ${(player.rating / 1000 * 100).toFixed(1)}%.`;
      flashLesson = 'Trading cuts payroll instantly, but a thinner roster means fewer wins — which can actually improve your draft lottery odds next year.';
    } else if (tool === 'stretch') {
      const { yearsSpread, perYearAmount } = stretchProvision(player.salary, player.yearsLeft);
      const totalOld = player.salary * player.yearsLeft;
      flashCapEffect = `Saves ${formatMoneyShort(player.salary - perYearAmount)}/yr now. Creates ${formatMoneyShort(perYearAmount)}/yr dead money for ${yearsSpread} years ($${totalOld.toFixed(0)}M total).`;
      flashLesson = 'The stretch provision is a debt delay — not forgiveness. Real GMs use it when immediate relief outweighs the long-term cap hit. It\'s a last resort.';
    } else if (tool === 'buyout') {
      const buyoutPenalty = player.salary * 0.3;
      flashCapEffect = `Eating ${formatMoneyShort(buyoutPenalty)} in dead money (30% of salary). Player is now a free agent and can sign anywhere.`;
      flashLesson = 'Buyouts let veterans chase rings elsewhere. The team eats ~30% of remaining salary. Kevin Durant used this with Brooklyn in 2023 to join Phoenix.';
    }
    if (flashCapEffect) {
      setFlashEntry({ tool: tool.toUpperCase(), player: player.name, capEffect: flashCapEffect, lesson: flashLesson });
    }

    setState(s => ({
      ...s,
      players: newPlayers,
      totalSalary: newSalary,
      lockerRoomMorale: newMorale,
      starMorale: newStarMorale,
      winPct: newWinPct,
    }));
    setActionLog(prev => [...prev, logEntry]);
    setSelectedTool(null);

    // If star morale hits 0, trigger forced trade demand crisis
    if (newStarMorale <= 0) {
      setPhase('star-crisis');
    }
  }

  function signMLE(agentId: string) {
    if (state.mleUsed) {
      setErrorMessage('You already used your Mid-Level Exception this season.');
      return;
    }
    const agent = MLE_FREE_AGENTS.find(a => a.id === agentId);
    if (!agent) return;

    const newPlayer: CapPlayer = {
      id: agent.id,
      name: agent.name,
      position: agent.position,
      age: agent.age,
      salary: agent.salary,
      yearsLeft: 2,
      rating: agent.rating,
      projectedRating: { 0: agent.rating, 1: agent.rating - 1, 2: agent.rating - 2 },
      tradeValue: 3,
      moraleImpact: agent.moraleImpact,
      canBeStretched: false,
      canBeBoughtOut: true,
      tradeInterest: [],
    };

    setState(s => ({
      ...s,
      players: [...s.players, newPlayer],
      totalSalary: s.totalSalary + agent.salary,
      lockerRoomMorale: Math.min(100, s.lockerRoomMorale + 5),
      mleUsed: true,
    }));
    setActionLog(prev => [...prev, `✍️ SIGNED ${agent.name} via MLE (${formatMoneyShort(agent.salary)}/yr). MLE used for this season.`]);
    setShowMlePanel(false);
    setSelectedTool(null);
    setErrorMessage(null);
  }

  function advanceYear(year: 'year1' | 'year2') {
    const capHealth = Math.max(0, 100 - (state.totalSalary - (state.scenario?.startingCapSituation.capLine || 140)) * 2);
    const competitiveness = Math.round(state.winPct * 100);
    const tanking = state.isTanking ? 10 : 0;
    setYearScores(prev => ({ ...prev, [year]: Math.round((capHealth + competitiveness + tanking) / 3) }));

    // Random press event between years
    const event = PRESS_EVENTS[Math.floor(Math.random() * PRESS_EVENTS.length)];
    const nextPhase: Phase = year === 'year1' ? 'year2' : 'year3';
    setPendingPressEvent(event);
    setPendingNextPhase(nextPhase);
    setPhase('press-event');
  }

  function applyPressEvent() {
    if (!pendingPressEvent || !pendingNextPhase) return;
    setState(s => ({
      ...s,
      starMorale: Math.max(0, Math.min(100, s.starMorale + pendingPressEvent.starMoraleChange)),
      lockerRoomMorale: Math.max(0, Math.min(100, s.lockerRoomMorale + pendingPressEvent.lockerRoomChange)),
      fanConfidence: Math.max(0, Math.min(100, s.fanConfidence + pendingPressEvent.fanConfidenceChange)),
      mleUsed: false, // MLE resets each season
    }));
    setPhase(pendingNextPhase);
    setPendingPressEvent(null);
    setPendingNextPhase(null);
    setShowMlePanel(false);
    setSelectedTool(null);
    setErrorMessage(null);
  }

  function calculateFinalScore() {
    const capHealth = Math.max(0, Math.min(100, 100 - (state.totalSalary - 140) * 3));
    const taxBill = calculateLuxuryTax(state.totalSalary);
    const taxScore = taxBill === 0 ? 100 : Math.max(0, 100 - taxBill * 5);
    const competitiveness = Math.round(state.winPct * 100) + (state.isTanking ? 20 : 0);
    const futureAssets = state.picks.length * 15;
    return {
      capHealth: Math.round((capHealth + taxScore) / 2),
      competitiveness: Math.min(100, competitiveness),
      futureAssets: Math.min(100, futureAssets),
      taxBill,
    };
  }

  if (phase === 'select') {
    // STAGE 2: Detailed situation preview before starting
    if (selectedScenarioPreview) {
      const s = selectedScenarioPreview;
      const tax = calculateLuxuryTax(s.startingCapSituation.totalSalary);
      const overCap = s.startingCapSituation.totalSalary - s.startingCapSituation.capLine;
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => setSelectedScenarioPreview(null)} className="text-[#64748b] hover:text-white text-sm mb-4 block">← Back to scenarios</button>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-[#ef4444] font-bold uppercase tracking-widest">📋 Situation Brief</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">{s.title}</h1>
          <p className="text-[#64748b] text-sm mb-6">{s.year} season · You are the new GM of the {s.team}</p>

          <div className="p-4 bg-[#1a0505] border border-red-800/50 rounded-xl mb-5 text-sm text-[#e2e8f0] leading-relaxed">
            {s.description}
          </div>

          {/* Cap numbers breakdown */}
          <div className="mb-5">
            <div className="text-xs text-[#64748b] uppercase tracking-widest mb-3">💰 The Financial Reality</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Payroll', value: formatMoneyShort(s.startingCapSituation.totalSalary), color: '#ef4444', note: 'What you owe players' },
                { label: 'Salary Cap', value: formatMoneyShort(s.startingCapSituation.capLine), color: '#64748b', note: 'The league limit' },
                { label: 'Over the Cap', value: `+${formatMoneyShort(overCap)}`, color: '#ef4444', note: 'You can\'t add salary here' },
                { label: 'Luxury Tax Owed', value: tax > 0 ? `+${formatMoneyShort(tax)}` : 'None', color: tax > 0 ? '#f59e0b' : '#10b981', note: tax > 0 ? 'Extra penalty to the league' : 'Under the tax line' },
              ].map(({ label, value, color, note }) => (
                <div key={label} className="p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
                  <div className="font-black text-base" style={{ color }}>{value}</div>
                  <div className="text-xs font-semibold text-white">{label}</div>
                  <div className="text-xs text-[#64748b]">{note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key players */}
          <div className="mb-5">
            <div className="text-xs text-[#64748b] uppercase tracking-widest mb-3">🏀 Key Players You Inherit</div>
            <div className="space-y-2">
              {s.players.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#64748b] w-6">{p.position}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{p.name}</div>
                      <div className="text-xs text-[#64748b]">Age {p.age} · {p.yearsLeft}yr left</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span style={{ color: p.rating >= 75 ? '#10b981' : p.rating >= 60 ? '#f59e0b' : '#ef4444' }}>{p.rating} OVR</span>
                    <span className="text-[#f59e0b] font-bold">{formatMoneyShort(p.salary)}/yr</span>
                    {p.moraleImpact <= -3 && <span className="text-red-400 text-xs">⚠️ Problem</span>}
                    {p.canBeBoughtOut && <span className="text-blue-400 text-xs">Buyout OK</span>}
                    {p.canBeStretched && <span className="text-purple-400 text-xs">Stretchable</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Morale situation */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Star Morale', value: s.starMorale, warn: s.starWantsOut },
              { label: 'Locker Room', value: s.lockerRoomMorale, warn: s.lockerRoomMorale < 40 },
            ].map(({ label, value, warn }) => (
              <div key={label} className="p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#64748b]">{label}</span>
                  <span className="text-xs font-bold" style={{ color: value >= 60 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444' }}>{value}%</span>
                </div>
                <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: value >= 60 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444' }} />
                </div>
                {warn && <div className="text-xs text-red-400 mt-1">⚠️ {label === 'Star Morale' ? 'Star may demand trade soon' : 'Team chemistry is fractured'}</div>}
              </div>
            ))}
          </div>

          {/* Your goal */}
          <div className="p-4 bg-[#0a1520] border border-[#3b82f6]/30 rounded-xl mb-6">
            <div className="text-xs text-[#3b82f6] font-bold mb-2">🎯 Your Mission Over 3 Years</div>
            <div className="space-y-1 text-sm text-[#94a3b8]">
              <div>• Get payroll below the luxury tax line ({formatMoneyShort(s.startingCapSituation.taxLine)})</div>
              <div>• Keep star morale above 0 — or execute a trade-demand scenario</div>
              <div>• Build future assets: picks and young players</div>
              <div>• Score higher than the real GM did ({s.realOutcome.score}/100)</div>
            </div>
          </div>

          <button
            onClick={() => { selectScenario(s); setSelectedScenarioPreview(null); }}
            className="w-full py-4 bg-[#ef4444] text-white font-black rounded-xl text-lg hover:bg-red-500 transition-colors"
          >
            BEGIN YEAR 1 — TAKE OVER AS GM →
          </button>
        </div>
      );
    }

    // STAGE 1: Scenario selection list
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6 p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
          <span className="text-xs text-[#64748b] uppercase tracking-widest">Grade Level:</span>
          {(['5-6', '7-8'] as const).map(t => (
            <button key={t} onClick={() => setTrack(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${track === t ? 'bg-[#f59e0b] text-black' : 'bg-[#1a2035] text-[#64748b]'}`}>
              {t === '5-6' ? '5th–6th Grade' : '7th–8th (Hard)'}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1">🔥 THE DUMPSTER FIRE</h1>
          <p className="text-[#64748b]">Inherit a cap nightmare. Fix it over 3 years. Don&apos;t let it get worse.</p>
        </div>

        {!isAdvanced && (
          <HintBox>
            You&apos;re going to take over a real team&apos;s worst financial situation. You have tools: Trade, Stretch, Buyout, MLE, and more. Every decision has consequences — choose carefully over 3 years. Press conferences between years add random events!
          </HintBox>
        )}

        <div className="grid gap-4">
          {CAP_NIGHTMARE_SCENARIOS.map(s => {
            const tax = calculateLuxuryTax(s.startingCapSituation.totalSalary);
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScenarioPreview(s)}
                className="text-left p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] hover:border-[#ef4444] transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-bold text-lg group-hover:text-[#ef4444] transition-colors">{s.title}</div>
                    <div className="text-[#64748b] text-xs">{s.year} · {s.teamAbbr}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-black text-lg">{formatMoneyShort(s.startingCapSituation.totalSalary)}</div>
                    <div className="text-xs text-[#64748b]">Total Payroll</div>
                    {tax > 0 && <div className="text-xs text-red-500">+{formatMoneyShort(tax)} tax</div>}
                  </div>
                </div>
                <p className="text-[#94a3b8] text-sm mb-3">{s.subtitle}</p>
                <div className="flex gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.starWantsOut ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                    {s.starWantsOut ? '🔥 Star wants out' : '✓ Star committed'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a2035] text-[#64748b]">
                    {s.startingCapSituation.picks.length} picks left
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a2035] text-[#64748b] ml-auto">
                    Read full brief →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!state.scenario) return null;

  // PRESS EVENT SCREEN
  if (phase === 'press-event' && pendingPressEvent) {
    const isPositive = pendingPressEvent.starMoraleChange > 0 || pendingPressEvent.lockerRoomChange > 0;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-xs text-[#64748b] uppercase tracking-widest mb-4">🎙️ OFF-SEASON EVENT</div>
        <div className={`p-6 rounded-xl border-2 mb-6 ${isPositive ? 'border-[#10b981] bg-green-900/10' : 'border-[#ef4444] bg-red-900/10'}`}>
          <div className="text-3xl mb-4">{isPositive ? '📣' : '⚠️'}</div>
          <p className="text-[#e2e8f0] text-lg font-semibold mb-4">{pendingPressEvent.text}</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { label: 'Star Morale', change: pendingPressEvent.starMoraleChange },
              { label: 'Locker Room', change: pendingPressEvent.lockerRoomChange },
              { label: 'Fan Confidence', change: pendingPressEvent.fanConfidenceChange },
            ].map(({ label, change }) => (
              <div key={label} className="p-2 bg-[#0a0e1a] rounded-lg text-center">
                <div className={`font-black text-lg ${change > 0 ? 'text-[#10b981]' : change < 0 ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                  {change > 0 ? '+' : ''}{change}
                </div>
                <div className="text-[#64748b]">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 bg-[#111827] rounded-xl border border-[#1e293b] mb-6 text-xs text-[#94a3b8]">
          💡 MLE resets for the new season — you can sign another free agent via Mid-Level Exception.
        </div>
        <button onClick={applyPressEvent} className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl">
          CONTINUE TO NEXT YEAR →
        </button>
      </div>
    );
  }

  // STAR CRISIS — forced when star morale hits 0
  if (phase === 'star-crisis') {
    const starPlayer = state.players.find(p => p.moraleImpact >= 3) || state.players[0];
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-xs text-[#ef4444] font-bold uppercase tracking-widest mb-4">🔥 FRANCHISE CRISIS</div>
        <div className="p-6 rounded-xl border-2 border-[#ef4444] bg-red-950/20 mb-6">
          <div className="text-4xl mb-4">📢</div>
          <h2 className="text-2xl font-black text-white mb-3">Star Demands Trade — Publicly</h2>
          <p className="text-[#e2e8f0] text-sm leading-relaxed mb-4">
            {starPlayer?.name || 'Your franchise star'} held a press conference today and said:{' '}
            <span className="italic text-[#f59e0b]">"I love this city, but the situation isn't working. I need to be somewhere I can win."</span>{' '}
            This is now public. You MUST execute a trade to restore any semblance of order.
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs mb-4">
            {[
              { label: 'Star Morale', value: '0%', color: '#ef4444' },
              { label: 'Fan Confidence', value: `${Math.max(0, state.fanConfidence - 20)}%`, color: '#ef4444' },
              { label: 'Locker Room', value: `${Math.max(0, state.lockerRoomMorale - 15)}%`, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="p-2 bg-[#0a0e1a] rounded-lg text-center">
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[#64748b]">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-[#0a0e1a] rounded-lg text-xs text-[#94a3b8]">
            📚 <span className="text-[#f59e0b] font-bold">Real example:</span> In 2019, Anthony Davis demanded a trade from the New Orleans Pelicans. The team held firm for months but eventually dealt him to the Lakers. Cap health suffered — but the return package (picks + youth) set up their future.
          </div>
        </div>
        <button
          onClick={() => {
            setState(s => ({
              ...s,
              fanConfidence: Math.max(0, s.fanConfidence - 20),
              lockerRoomMorale: Math.max(0, s.lockerRoomMorale - 15),
            }));
            setActionLog(prev => [...prev, '🔥 CRISIS: Star demanded trade publicly. Morale penalties applied. You must trade them.']);
            setSelectedTool('trade');
            setPhase(phase === 'star-crisis' ? (state.decisions.includes('year1') ? 'year2' : 'year1') : 'year1');
          }}
          className="w-full py-3 bg-[#ef4444] text-white font-black rounded-xl hover:opacity-90 transition-opacity"
        >
          MANAGE THE FALLOUT — TRADE THEM →
        </button>
      </div>
    );
  }

  const currentYear = phase === 'year1' ? 'Year 1' : phase === 'year2' ? 'Year 2' : 'Year 3';
  const taxBill = calculateLuxuryTax(state.totalSalary);

  const phaseContent = (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setPhase('select')} className="text-[#64748b] hover:text-white text-sm">← Exit</button>
        <div>
          <h1 className="text-xl font-black text-white">{state.scenario.title}</h1>
          <p className="text-[#64748b] text-xs">{currentYear} of 3</p>
        </div>
        <div className="ml-auto flex gap-1">
          {(['year1', 'year2', 'year3'] as const).map((y, i) => (
            <div key={y} className={`w-8 h-1.5 rounded-full ${phase === y ? 'bg-[#f59e0b]' : i < ['year1','year2','year3'].indexOf(phase) ? 'bg-[#10b981]' : 'bg-[#1e293b]'}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Salary', value: formatMoneyShort(state.totalSalary), color: state.totalSalary > 170 ? '#ef4444' : state.totalSalary > 140 ? '#f59e0b' : '#10b981' },
          { label: 'Luxury Tax', value: taxBill > 0 ? `+${formatMoneyShort(taxBill)}` : 'NONE', color: taxBill > 0 ? '#ef4444' : '#10b981' },
          { label: 'Win %', value: `${(state.winPct * 100).toFixed(1)}%`, color: state.winPct > 0.5 ? '#10b981' : state.winPct > 0.35 ? '#f59e0b' : '#ef4444' },
          { label: 'Draft Picks', value: String(state.picks.length), color: state.picks.length >= 2 ? '#10b981' : state.picks.length === 1 ? '#f59e0b' : '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#111827] rounded-xl border border-[#1e293b] p-3 text-center">
            <div className="font-black text-lg" style={{ color }}>{value}</div>
            <div className="text-xs text-[#64748b]">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <MoraleBar value={state.starMorale} label="Star Morale" size="md" />
        <MoraleBar value={state.lockerRoomMorale} label="Locker Room" size="md" />
      </div>

      {/* Inline error message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-xl text-sm text-red-400 flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300 ml-4">✕</button>
        </div>
      )}

      {state.isTanking && (
        <div className="mb-4 p-3 bg-orange-900/20 border border-orange-700 rounded-xl text-sm text-orange-400 flex items-center gap-2">
          🎯 TANK MODE ACTIVE — Win% dropped, lottery odds improving. Morale draining.
        </div>
      )}

      {state.starMorale < 30 && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-xl text-sm text-red-400 flex items-center gap-2">
          🔥 CRISIS — Star morale critical! If it hits 0%, they demand a trade publicly.
        </div>
      )}

      {taxBill > 0 && (
        <div className="mb-4 p-3 bg-amber-900/20 border border-amber-600 rounded-xl text-sm text-amber-400 flex items-center justify-between">
          <span>⚠️ <strong>{formatMoneyShort(taxBill)}</strong> over the luxury tax line — the league charges $1.50 for every $1 over. Penalty: <strong>~{formatMoneyShort(taxBill * 1.5)}</strong>/yr.</span>
        </div>
      )}

      {state.mleUsed && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-xl text-xs text-blue-400">
          ✍️ MLE used this season — resets next year.
        </div>
      )}

      {/* Decision Impact Flash */}
      {flashEntry && (
        <div className="mb-4 p-4 bg-[#0a2010] border-2 border-[#10b981] rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#10b981] font-bold uppercase tracking-widest">📋 Decision Impact: {flashEntry.tool}</span>
            <button onClick={() => setFlashEntry(null)} className="text-[#64748b] hover:text-white text-xs">✕</button>
          </div>
          <div className="text-sm font-bold text-white mb-1">{flashEntry.player}</div>
          <div className="text-sm text-[#10b981] mb-2">{flashEntry.capEffect}</div>
          <div className="text-xs text-[#94a3b8] italic border-t border-[#1e293b] pt-2">{flashEntry.lesson}</div>
        </div>
      )}

      {!isAdvanced && phase === 'year1' && (
        <HintBox>
          Use the tools on the right to fix this situation. Click a tool, then click a player to apply it. Each action has tradeoffs — trading a good player helps the cap but hurts the team.
        </HintBox>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player list */}
        <div className="lg:col-span-2">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-3">Current Roster</div>
          <div className="space-y-2">
            {state.players.map(player => (
              <div
                key={player.id}
                onClick={() => selectedTool && selectedTool !== 'mle' && selectedTool !== 'tank' && applyTool(selectedTool, player.id)}
                className={`p-3 rounded-xl border transition-all ${selectedTool && selectedTool !== 'mle' && selectedTool !== 'tank' ? 'cursor-pointer hover:border-[#f59e0b]' : ''} border-[#1e293b] bg-[#111827]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#64748b] w-6">{player.position}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{player.name}</div>
                      <div className="text-xs text-[#64748b]">Age {player.age} · {player.yearsLeft}yr left</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#3b82f6]">{player.rating} OVR</span>
                    <span className="text-[#f59e0b] font-bold">{formatMoneyShort(player.salary)}/yr</span>
                    {isAdvanced && (
                      <span style={{ color: player.tradeValue >= 7 ? '#10b981' : player.tradeValue >= 4 ? '#f59e0b' : '#ef4444' }}>
                        TV: {player.tradeValue}/10
                      </span>
                    )}
                  </div>
                </div>
                {!isAdvanced && player.canBeBoughtOut && <div className="text-xs text-green-400 mt-1">✓ Buyout eligible</div>}
                {!isAdvanced && player.canBeStretched && <div className="text-xs text-blue-400 mt-1">✓ Stretch eligible</div>}
                {selectedTool && selectedTool !== 'mle' && selectedTool !== 'tank' && (
                  <div className="text-xs text-[#f59e0b] mt-1">Click to apply {selectedTool.toUpperCase()}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tools panel */}
        <div>
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-3">GM Tools</div>
          <div className="space-y-2 mb-4">
            {REBUILD_TOOLS.map(tool => {
              const isSelected = selectedTool === tool.id || (tool.id === 'mle' && showMlePanel);
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (tool.id === 'tank') {
                      applyTool('tank', '');
                    } else if (tool.id === 'mle') {
                      setShowMlePanel(!showMlePanel);
                      setSelectedTool(null);
                    } else {
                      setSelectedTool(selectedTool === tool.id ? null : tool.id);
                      setShowMlePanel(false);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? 'border-[#f59e0b] bg-[#2a1f00]' : 'border-[#1e293b] bg-[#111827] hover:border-[#64748b]'} ${tool.id === 'mle' && state.mleUsed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={tool.id === 'mle' && state.mleUsed}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{tool.icon}</span>
                    <span className="text-sm font-bold text-white">{tool.name}</span>
                    {tool.id === 'mle' && state.mleUsed && <span className="text-xs text-[#64748b]">(used)</span>}
                  </div>
                  {!isAdvanced && <p className="text-xs text-[#64748b]">{tool.description}</p>}
                  {isSelected && (
                    <p className="text-xs text-[#3b82f6] mt-1.5 italic border-t border-[#f59e0b]/20 pt-1.5">
                      📖 Real NBA: {tool.realWorldExample}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* MLE free agent panel */}
          {showMlePanel && !state.mleUsed && (
            <div className="mb-4 p-3 bg-[#111827] rounded-xl border border-[#f59e0b]/30">
              <div className="text-xs text-[#f59e0b] font-bold mb-2 uppercase tracking-widest">MLE Free Agents</div>
              <div className="space-y-2">
                {MLE_FREE_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => signMLE(agent.id)}
                    className="w-full text-left p-2 bg-[#0a0e1a] rounded-lg border border-[#1e293b] hover:border-[#f59e0b] transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-semibold">{agent.name}</span>
                      <span className="text-[#64748b]">{agent.position}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-0.5">
                      <span className="text-[#3b82f6]">{agent.rating} OVR</span>
                      <span className="text-[#f59e0b]">{formatMoneyShort(agent.salary)}/yr</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Win trajectory projection */}
          <div className="bg-[#0a0e1a] rounded-xl border border-[#1e293b] p-3 mb-3">
            <div className="text-xs text-[#64748b] font-bold mb-2 uppercase tracking-widest">Win Projection</div>
            <div className="space-y-2">
              {(['year1', 'year2', 'year3'] as const).map((yr, i) => {
                const isCurrent = phase === yr;
                const isPast = ['year1', 'year2', 'year3'].indexOf(phase) > i;
                const projectedWinPct = state.winPct * (state.isTanking ? 0.5 : 1) - (i > 0 ? 0 : 0);
                const projWins = Math.round(Math.max(12, Math.min(65, projectedWinPct * 82)));
                const yr1YearScoreExists = Object.keys(yearScores).length > 0;
                return (
                  <div key={yr} className="flex items-center gap-2">
                    <span className="text-xs text-[#64748b] w-12">Yr {i + 1}</span>
                    <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(projWins / 82) * 100}%`,
                          background: isCurrent ? '#f59e0b' : isPast ? '#10b981' : '#1e293b',
                        }}
                      />
                    </div>
                    <span className="text-xs w-12 text-right" style={{ color: isCurrent ? '#f59e0b' : isPast ? '#10b981' : '#64748b' }}>
                      {isCurrent ? `~${projWins}W` : isPast && yr1YearScoreExists ? `${projWins}W` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-[#64748b] mt-2">
              Playoff line: ~44W · {state.winPct > 0.5 ? '✓ Contending' : state.winPct > 0.35 ? '⚡ Bubble team' : '📉 Lottery'}
            </div>
          </div>

          {/* Action log */}
          {actionLog.length > 0 && (
            <div className="bg-[#0a0e1a] rounded-xl border border-[#1e293b] p-3">
              <div className="text-xs text-[#64748b] font-bold mb-2">ACTION LOG</div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {actionLog.map((log, i) => <div key={i} className="text-xs text-[#94a3b8]">{log}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        {phase !== 'year3' ? (
          <button
            onClick={() => advanceYear(phase as 'year1' | 'year2')}
            className="px-8 py-3 bg-[#f59e0b] text-black font-black rounded-xl hover:bg-[#fbbf24]"
          >
            END {currentYear.toUpperCase()} →
          </button>
        ) : (
          <button
            onClick={() => setPhase('verdict')}
            className="px-8 py-3 bg-[#10b981] text-black font-black rounded-xl"
          >
            SEE FINAL VERDICT →
          </button>
        )}
      </div>
    </div>
  );

  if (phase !== 'verdict') return phaseContent;

  // VERDICT
  const scores = calculateFinalScore();
  const overall = Math.round((scores.capHealth + scores.competitiveness + scores.futureAssets) / 3);
  const grade = overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : overall >= 35 ? 'D' : 'F';
  const gradeColor = grade === 'A' ? '#10b981' : grade === 'B' ? '#f59e0b' : grade === 'C' ? '#3b82f6' : '#ef4444';

  // Morale → Win% formula: winPctBonus = (starMorale - 50) / 1000
  const moraleBonus = (state.starMorale - 50) / 1000;
  const moraleWinAdj = Math.round(moraleBonus * 82 * 10) / 10; // fractional wins
  const taxPenaltyPoints = scores.taxBill > 0 ? Math.round(scores.taxBill * 5) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-6">3-Year Rebuild Verdict</h1>

      <div className="text-center mb-6 p-6 bg-[#111827] rounded-xl border-2" style={{ borderColor: gradeColor }}>
        <div className="text-8xl font-black mb-2" style={{ color: gradeColor }}>{grade}</div>
        <div className="text-2xl text-white font-bold">{overall}/100</div>
        <div className="text-[#64748b] text-sm mt-2">Your Rebuild Score</div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Cap Health', score: scores.capHealth, desc: 'Did you clear tax space?' },
          { label: 'Competitiveness', score: scores.competitiveness, desc: 'Win % trajectory' },
          { label: 'Future Assets', score: scores.futureAssets, desc: 'Picks & young players' },
        ].map(({ label, score, desc }) => (
          <div key={label} className="bg-[#1a2035] rounded-xl border border-[#1e293b] p-3 text-center">
            <div className="text-2xl font-black" style={{ color: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444' }}>{score}</div>
            <div className="text-sm font-bold text-white">{label}</div>
            <div className="text-xs text-[#64748b]">{desc}</div>
          </div>
        ))}
      </div>

      {/* Morale → Win% explanation */}
      <div className="p-4 bg-[#111827] rounded-xl border border-[#1e293b] mb-4">
        <button
          onClick={() => setShowMoraleFormula(!showMoraleFormula)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-xs text-[#64748b] font-bold uppercase tracking-widest">📊 How Morale Affected Your Win%</span>
          <span className="text-[#64748b] text-xs">{showMoraleFormula ? '▲ Hide' : '▼ Show'}</span>
        </button>
        {showMoraleFormula && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="p-2 bg-[#0a0e1a] rounded-lg">
              <div className="text-[#94a3b8] mb-1">Formula: <span className="font-mono text-white">Win% bonus = (Star Morale – 50) ÷ 1000</span></div>
              <div className="text-[#94a3b8]">Your star morale ended at <span className="text-white font-bold">{state.starMorale}/100</span></div>
              <div className="mt-1" style={{ color: moraleBonus >= 0 ? '#10b981' : '#ef4444' }}>
                → Win% adjusted by <strong>{moraleBonus >= 0 ? '+' : ''}{(moraleBonus * 100).toFixed(1)}%</strong> = approximately <strong>{moraleBonus >= 0 ? '+' : ''}{moraleWinAdj} wins</strong> over a full season
              </div>
            </div>
            <div className="text-[#64748b]">High star morale means better effort, fewer missed games, and a positive locker room. Low morale does the reverse — even if the player stays.</div>
          </div>
        )}
      </div>

      {/* Luxury tax score penalty */}
      {scores.taxBill > 0 && (
        <div className="p-4 bg-amber-900/10 rounded-xl border border-amber-700/40 mb-4">
          <div className="text-xs text-amber-400 font-bold mb-2">⚠️ Luxury Tax Cost</div>
          <div className="text-sm text-[#e2e8f0] mb-1">You were <strong>{formatMoneyShort(scores.taxBill)}</strong> over the luxury tax line.</div>
          <div className="text-xs text-[#94a3b8] mb-2">The league charges $1.50 for every $1 over → total penalty: <strong className="text-amber-400">{formatMoneyShort(scores.taxBill * 1.5)}</strong>/yr owed to revenue sharing.</div>
          <div className="text-xs text-amber-400">This cost <strong>{taxPenaltyPoints} points</strong> off your cap health score.</div>
        </div>
      )}

      {state.scenario && (
        <div className="p-5 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
          <div className="text-xs text-[#f59e0b] font-bold mb-3">📰 What the Real GM Did</div>
          <p className="text-[#e2e8f0] text-sm mb-3">{state.scenario.realOutcome.summary}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748b]">Real GM Score</span>
            <span className="text-[#3b82f6] font-bold">{state.scenario.realOutcome.score}/100</span>
          </div>
          <div className="text-xs mt-1" style={{ color: overall >= state.scenario.realOutcome.score ? '#10b981' : '#ef4444' }}>
            {overall >= state.scenario.realOutcome.score ? `🏆 You outperformed the real GM!` : `The real GM scored ${state.scenario.realOutcome.score - overall} points higher.`}
          </div>
        </div>
      )}

      <button onClick={() => { setPhase('select'); setSelectedScenarioPreview(null); }} className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl">
        TRY ANOTHER SCENARIO
      </button>
    </div>
  );
}
