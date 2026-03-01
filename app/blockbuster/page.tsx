'use client';

import { useState, useEffect } from 'react';
import { TRADE_SCENARIOS } from '@/data/tradeScenarios';
import { evaluateTrade, calculateMultiFactorScore } from '@/lib/AIValuation';
import { saveCompletion } from '@/lib/gradeStorage';
import GradeRevealPrompt from '@/components/shared/GradeRevealPrompt';
import { isTradeCapLegal, formatMoneyShort } from '@/lib/CapMath';
import CapSheetPanel from '@/components/BlockbusterSim/CapSheetPanel';
import ScoreBreakdown from '@/components/shared/ScoreBreakdown';
import { HintBox, TermTooltip } from '@/components/shared/TrackWrapper';

type Stage = 'select-scenario' | 'read-situation' | 'build-offer' | 'negotiation' | 'outcome';

export default function BlockbusterPage() {
  const [track, setTrack] = useState<'5-6' | '7-8'>('5-6');
  const [stage, setStage] = useState<Stage>('select-scenario');
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [selectedOutgoing, setSelectedOutgoing] = useState<string[]>([]);
  const [selectedIncoming, setSelectedIncoming] = useState<string[]>([]);
  const [selectedOutgoingPicks, setSelectedOutgoingPicks] = useState<string[]>([]);
  const [selectedIncomingPicks, setSelectedIncomingPicks] = useState<string[]>([]);
  const [selectedTargetTeam, setSelectedTargetTeam] = useState<string | null>(null);
  const [negotiationRound, setNegotiationRound] = useState(0);
  const [aiResponse, setAiResponse] = useState<ReturnType<typeof evaluateTrade> | null>(null);
  const [finalScore, setFinalScore] = useState<{ valueAcquired: number; capEfficiency: number; futureAssets: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(-1);
  const [showFormula, setShowFormula] = useState(false);
  const [gradeRevealed, setGradeRevealed] = useState(false);

  const scenario = scenarioId ? TRADE_SCENARIOS.find(s => s.id === scenarioId) : null;
  const studentTeam = scenario?.teams.find(t => t.id === scenario.studentTeam);
  const otherTeams = scenario?.teams.filter(t => t.id !== scenario.studentTeam);
  const targetTeam = selectedTargetTeam ? scenario?.teams.find(t => t.id === selectedTargetTeam) : null;

  const isAdvanced = track === '7-8';

  // Hard mode: 30-second timer per negotiation round
  useEffect(() => {
    if (!isAdvanced || stage !== 'negotiation' || timeLeft === -1) return;
    if (timeLeft === 0) { acceptDeal(); return; }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvanced, stage, timeLeft]);

  function toggleOutgoing(id: string) {
    setSelectedOutgoing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleIncoming(id: string) {
    setSelectedIncoming(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleOutgoingPick(id: string) {
    setSelectedOutgoingPicks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleIncomingPick(id: string) {
    setSelectedIncomingPicks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function submitOffer() {
    if (!scenario || !studentTeam || !targetTeam) return;

    const outPlayers = studentTeam.players.filter(p => selectedOutgoing.includes(p.id));
    const inPlayers = targetTeam.players.filter(p => selectedIncoming.includes(p.id));
    const outPicks = studentTeam.picks.filter(pk => selectedOutgoingPicks.includes(pk.id));
    const inPicks = targetTeam.picks.filter(pk => selectedIncomingPicks.includes(pk.id));

    const evaluation = evaluateTrade({
      studentGives: outPlayers,
      studentReceives: inPlayers,
      picksStudentGives: outPicks.map(pk => ({ year: pk.year, value: pk.estimatedValue })),
      picksStudentReceives: inPicks.map(pk => ({ year: pk.year, value: pk.estimatedValue })),
      aiTeamNeeds: targetTeam.needs,
      aiTeamName: targetTeam.city,
    });

    setAiResponse(evaluation);
    setNegotiationRound(r => r + 1);
    if (isAdvanced) setTimeLeft(30);
    setStage('negotiation');
  }

  function acceptDeal() {
    if (!scenario || !studentTeam || !targetTeam) return;
    const inPlayers = targetTeam.players.filter(p => selectedIncoming.includes(p.id));
    const inPicks = targetTeam.picks.filter(pk => selectedIncomingPicks.includes(pk.id));
    const outPlayers = studentTeam.players.filter(p => selectedOutgoing.includes(p.id));
    const outPicks = studentTeam.picks.filter(pk => selectedOutgoingPicks.includes(pk.id));

    const avgRating = inPlayers.length > 0 ? inPlayers.reduce((s, p) => s + p.rating, 0) / inPlayers.length : 0;
    const outSalary = outPlayers.reduce((s, p) => s + p.salary, 0);
    const inSalary = inPlayers.reduce((s, p) => s + p.salary, 0);
    const picksRetained = outPicks.length === 0 ? 10 : Math.max(0, 10 - outPicks.reduce((s, pk) => s + pk.estimatedValue, 0));
    const picksGained = inPicks.reduce((s, pk) => s + pk.estimatedValue, 0);

    setFinalScore({
      valueAcquired: Math.min(10, avgRating / 10),
      capEfficiency: Math.min(10, Math.max(0, 5 + (outSalary - inSalary) / 10)),
      futureAssets: Math.min(10, (picksRetained + picksGained) / 2),
    });
    setStage('outcome');
  }

  function reset() {
    setStage('select-scenario');
    setScenarioId(null);
    setSelectedOutgoing([]);
    setSelectedIncoming([]);
    setSelectedOutgoingPicks([]);
    setSelectedIncomingPicks([]);
    setSelectedTargetTeam(null);
    setNegotiationRound(0);
    setAiResponse(null);
    setFinalScore(null);
    setTimeLeft(-1);
    setShowFormula(false);
    setGradeRevealed(false);
  }

  // ── STAGE: SELECT SCENARIO ──────────────────────────────────────────────────
  if (stage === 'select-scenario') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
            <span className="text-xs text-[#64748b] uppercase tracking-widest">Grade Level:</span>
            {(['5-6', '7-8'] as const).map(t => (
              <button key={t} onClick={() => setTrack(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${track === t ? 'bg-[#f59e0b] text-black' : 'bg-[#1a2035] text-[#64748b]'}`}>
                {t === '5-6' ? '5th–6th Grade' : '7th–8th (Hard Mode)'}
              </button>
            ))}
            {isAdvanced && <span className="text-xs text-red-400 ml-2">⚡ No hints • Timed decisions</span>}
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1">THE BLOCKBUSTER</h1>
          <p className="text-[#64748b]">You are the GM. Build the trade. Close the deal. Reshape the franchise.</p>
        </div>

        {!isAdvanced && (
          <HintBox>
            You&apos;re going to propose a trade to another team&apos;s AI General Manager. They will accept, reject, or counter your offer based on what&apos;s fair for their team. You can trade players AND draft picks — salary must match within NBA rules!
          </HintBox>
        )}

        <div className="grid gap-4">
          {TRADE_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => { setScenarioId(s.id); setStage('read-situation'); }}
              className="text-left p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] hover:border-[#f59e0b] transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-white font-bold text-lg group-hover:text-[#f59e0b] transition-colors">{s.title}</div>
                  <div className="text-[#64748b] text-xs">{s.year} · {s.teams.find(t => t.id === s.studentTeam)?.name}</div>
                </div>
                <span className="text-2xl">🏀</span>
              </div>
              <p className="text-[#94a3b8] text-sm">{s.description}</p>
              <div className="mt-3 p-2 bg-[#0a0e1a] rounded-lg">
                <div className="text-xs text-[#f59e0b] font-bold">YOUR GOAL:</div>
                <div className="text-xs text-[#94a3b8] mt-0.5">{s.goal}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── STAGE: READ SITUATION ───────────────────────────────────────────────────
  if (stage === 'read-situation' && scenario && studentTeam) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={reset} className="text-[#64748b] hover:text-white text-sm">← Back</button>
          <div>
            <h1 className="text-2xl font-black text-white">{scenario.title}</h1>
            <p className="text-[#64748b] text-sm">{scenario.year} · Your team: {studentTeam.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="mb-4 p-4 bg-[#111827] rounded-xl border border-[#1e293b]">
              <div className="text-xs text-[#64748b] uppercase tracking-widest mb-2">Situation</div>
              <p className="text-[#e2e8f0] text-sm leading-relaxed">{scenario.description}</p>
            </div>
            <div className="p-4 bg-[#2a1f00] rounded-xl border border-[#f59e0b]/30 mb-4">
              <div className="text-xs text-[#f59e0b] font-bold uppercase tracking-widest mb-2">🎯 Your Mission</div>
              <p className="text-[#e2e8f0] text-sm">{scenario.goal}</p>
            </div>
            {/* Strategy context */}
            <div className={`p-4 rounded-xl border ${
              scenario.strategy.mode === 'win-now' ? 'bg-[#0a1628] border-[#3b82f6]/40' :
              scenario.strategy.mode === 'rebuild' ? 'bg-[#1a0a00] border-[#f59e0b]/40' :
              'bg-[#0a1a0a] border-[#10b981]/40'
            }`}>
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                scenario.strategy.mode === 'win-now' ? 'text-[#3b82f6]' :
                scenario.strategy.mode === 'rebuild' ? 'text-[#f59e0b]' : 'text-[#10b981]'
              }`}>
                {scenario.strategy.mode === 'win-now' ? '🏆 Win-Now Mode' :
                 scenario.strategy.mode === 'rebuild' ? '🔨 Rebuild Mode' : '⚖️ Mixed Strategy'}
              </div>
              <p className="text-[#94a3b8] text-sm">{scenario.strategy.hint}</p>
              {!isAdvanced && (
                <div className="mt-2 text-xs text-[#64748b]">
                  {scenario.strategy.mode === 'win-now' ? 'Prioritize: High rating + short contracts' :
                   scenario.strategy.mode === 'rebuild' ? 'Prioritize: Future picks + players ≤24 years old' :
                   'Balance: Keep stars, trade role players for picks'}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 text-xs text-[#64748b] uppercase tracking-widest">Your Roster & Cap Sheet</div>
            <div className="space-y-1.5">
              {studentTeam.players.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-[#111827] rounded-lg border border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748b] w-7">{p.position}</span>
                    <span className="text-sm text-[#e2e8f0] font-medium">{p.name}</span>
                    {p.isUntouchable && <span className="text-xs text-red-400">🔒</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#3b82f6]">{p.rating} OVR</span>
                    <span className="text-[#f59e0b] font-bold">{formatMoneyShort(p.salary)}</span>
                    <span className="text-[#64748b]">{p.yearsLeft}yr</span>
                  </div>
                </div>
              ))}
              {studentTeam.picks.map(pk => (
                <div key={pk.id} className="flex items-center justify-between p-2 bg-[#111827] rounded-lg border border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8b5cf6] w-7">PICK</span>
                    <span className="text-sm text-[#e2e8f0]">{pk.year} 1st — {pk.team}</span>
                    {pk.protected && <span className="text-xs text-[#64748b]">({pk.protected})</span>}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: pk.estimatedValue }).map((_, i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#64748b]">Win %</span>
              <span className="text-white font-bold">{(studentTeam.winPct * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setStage('build-offer')}
            className="px-8 py-3 bg-[#f59e0b] text-black font-black rounded-xl hover:bg-[#fbbf24] transition-colors text-lg"
          >
            GO TO TRADE ROOM →
          </button>
        </div>
      </div>
    );
  }

  // ── STAGE: BUILD OFFER ──────────────────────────────────────────────────────
  if (stage === 'build-offer' && scenario && studentTeam && otherTeams) {
    const outPlayers = studentTeam.players.filter(p => selectedOutgoing.includes(p.id));
    const outSalary = outPlayers.reduce((s, p) => s + p.salary, 0);
    const inPlayers = (targetTeam?.players || []).filter(p => selectedIncoming.includes(p.id));
    const inSalary = inPlayers.reduce((s, p) => s + p.salary, 0);
    const outPicksList = studentTeam.picks.filter(pk => selectedOutgoingPicks.includes(pk.id));
    const inPicksList = (targetTeam?.picks || []).filter(pk => selectedIncomingPicks.includes(pk.id));
    const legality = isTradeCapLegal(outPlayers.map(p => p.salary), inPlayers.map(p => p.salary), 'over');
    const hasDeal = selectedOutgoing.length > 0 || selectedOutgoingPicks.length > 0;
    const hasReturn = selectedIncoming.length > 0 || selectedIncomingPicks.length > 0;

    // Live trade value balance calculation
    function tradeVal(players: typeof outPlayers, picks: typeof outPicksList) {
      return players.reduce((s, p) => s + p.rating * 0.6 + (p.rating / Math.max(p.salary, 5)) * 10 + p.yearsLeft * 1.5, 0)
        + picks.reduce((s, pk) => s + pk.estimatedValue * 4, 0);
    }
    const outValue = tradeVal(outPlayers, outPicksList);
    const inValue  = tradeVal(inPlayers, inPicksList);
    const valueRatio = outValue > 0 || inValue > 0 ? outValue / Math.max(outValue + inValue, 1) : 0.5;
    const youWinning = outValue > inValue * 1.05;
    const theyWinning = inValue > outValue * 1.05;

    function ageLabel(age: number): { text: string; color: string } {
      if (age <= 24) return { text: 'Developing', color: '#8b5cf6' };
      if (age <= 28) return { text: 'Peak', color: '#10b981' };
      if (age <= 31) return { text: 'Prime-Late', color: '#f59e0b' };
      return { text: 'Declining', color: '#ef4444' };
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setStage('read-situation')} className="text-[#64748b] hover:text-white text-sm">← Back</button>
          <h1 className="text-2xl font-black text-white">Build Your Trade Offer</h1>
        </div>

        {!isAdvanced && (
          <HintBox>
            Step 1: Pick which team you want to trade WITH below. Step 2: Select players AND picks from YOUR roster to send out (red). Step 3: Select players AND picks from THEIR roster to bring in (green). Salary must match within 125%.
          </HintBox>
        )}

        {/* Target team selector */}
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-3">Select Target Team</div>
          <div className="flex gap-3 flex-wrap">
            {otherTeams.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedTargetTeam(t.id); setSelectedIncoming([]); setSelectedIncomingPicks([]); }}
                className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${selectedTargetTeam === t.id ? 'bg-[#f59e0b] text-black border-[#f59e0b]' : 'bg-[#1a2035] text-[#64748b] border-[#1e293b] hover:border-[#64748b]'}`}
              >
                {t.city} {t.name.split(' ').pop()}
                {!isAdvanced && <span className="ml-2 text-xs opacity-70">Needs: {t.needs[0]}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CapSheetPanel
            teamName={`${studentTeam.city} ${studentTeam.name} (YOU)`}
            players={studentTeam.players}
            picks={studentTeam.picks}
            selectedOutgoing={selectedOutgoing}
            selectedIncoming={[]}
            selectedOutgoingPicks={selectedOutgoingPicks}
            selectedIncomingPicks={[]}
            onTogglePlayer={(id) => toggleOutgoing(id)}
            onTogglePick={(id) => toggleOutgoingPick(id)}
            isStudentTeam={true}
            showHints={!isAdvanced}
          />

          {targetTeam ? (
            <CapSheetPanel
              teamName={`${targetTeam.city} ${targetTeam.name}`}
              players={targetTeam.players}
              picks={targetTeam.picks}
              selectedOutgoing={[]}
              selectedIncoming={selectedIncoming}
              selectedOutgoingPicks={[]}
              selectedIncomingPicks={selectedIncomingPicks}
              onTogglePlayer={(id) => toggleIncoming(id)}
              onTogglePick={(id) => toggleIncomingPick(id)}
              isStudentTeam={false}
              showHints={!isAdvanced}
            />
          ) : (
            <div className="flex items-center justify-center bg-[#111827] rounded-xl border border-[#1e293b] border-dashed h-64">
              <p className="text-[#64748b] text-sm">Select a target team above</p>
            </div>
          )}
        </div>

        {/* Trade summary */}
        {hasDeal && hasReturn && (
          <div className="mt-6 p-5 bg-[#111827] rounded-xl border border-[#1e293b]">
            <div className="text-sm font-bold text-[#e2e8f0] mb-3">Trade Summary</div>

            {/* Live trade value balance */}
            <div className="mb-4 p-3 bg-[#0a0e1a] rounded-lg">
              <div className="flex justify-between text-xs mb-1">
                <span className={youWinning ? 'text-[#10b981] font-bold' : 'text-[#64748b]'}>YOU</span>
                <span className="text-[#64748b]">Trade Value Balance</span>
                <span className={theyWinning ? 'text-[#ef4444] font-bold' : 'text-[#64748b]'}>AI TEAM</span>
              </div>
              <div className="h-3 bg-[#1e293b] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#10b981] rounded-l-full transition-all" style={{ width: `${valueRatio * 100}%` }} />
                <div className="h-full bg-[#ef4444] rounded-r-full transition-all" style={{ width: `${(1 - valueRatio) * 100}%` }} />
              </div>
              <div className="text-xs text-center mt-1" style={{ color: youWinning ? '#10b981' : theyWinning ? '#ef4444' : '#f59e0b' }}>
                {youWinning ? '✓ You\'re winning this trade' : theyWinning ? 'AI team is getting the better deal' : '⚖️ Roughly even value'}
              </div>
              <button
                onClick={() => setShowFormula(f => !f)}
                className="mt-2 text-xs text-[#64748b] hover:text-[#f59e0b] underline w-full text-center transition-colors"
              >
                {showFormula ? '▲ Hide formula' : '▼ How is this calculated?'}
              </button>
              {showFormula && (
                <div className="mt-2 p-3 bg-[#111827] rounded-lg text-xs space-y-1.5">
                  <div className="text-[#f59e0b] font-bold mb-1">Player Value Formula:</div>
                  <div className="font-mono text-[#e2e8f0]">Value = (Rating × 0.6) + (Rating ÷ Salary × 10) + (Years Left × 1.5)</div>
                  {!isAdvanced && (
                    <div className="space-y-1 mt-2 text-[#94a3b8]">
                      <div><span className="text-[#3b82f6]">Rating × 0.6</span> = how talented the player is (40% weight)</div>
                      <div><span className="text-[#10b981]">Rating ÷ Salary × 10</span> = bang for your buck (are they cheap for their talent?)</div>
                      <div><span className="text-[#8b5cf6]">Years Left × 1.5</span> = contract length bonus (longer = more value)</div>
                      <div className="text-[#f59e0b] mt-1">Draft picks add flat value (estimatedValue × 4)</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-red-400 font-bold mb-2">YOU SEND ({formatMoneyShort(outSalary)})</div>
                {outPlayers.map(p => {
                  const al = ageLabel(p.age);
                  return (
                    <div key={p.id} className="text-xs text-[#e2e8f0] mb-1">
                      • {p.name} ({formatMoneyShort(p.salary)})
                      <span className="ml-1 px-1 rounded text-[10px]" style={{ color: al.color }}>Age {p.age} · {al.text}</span>
                    </div>
                  );
                })}
                {outPicksList.map(pk => <div key={pk.id} className="text-xs text-[#8b5cf6]">• {pk.year} 1st (value: {pk.estimatedValue}/10)</div>)}
              </div>
              <div>
                <div className="text-xs text-green-400 font-bold mb-2">YOU RECEIVE ({formatMoneyShort(inSalary)})</div>
                {inPlayers.map(p => {
                  const al = ageLabel(p.age);
                  const studentNeeds = studentTeam?.needs || [];
                  const fitsNeed = studentNeeds.some(n =>
                    n.toLowerCase() === p.position.toLowerCase() ||
                    p.name.toLowerCase().includes(n.toLowerCase())
                  );
                  return (
                    <div key={p.id} className="text-xs text-[#e2e8f0] mb-1">
                      • {p.name} ({formatMoneyShort(p.salary)})
                      <span className="ml-1 px-1 rounded text-[10px]" style={{ color: al.color }}>Age {p.age} · {al.text}</span>
                      <span className="ml-1 text-[10px]" style={{ color: fitsNeed ? '#10b981' : '#64748b' }}>
                        {fitsNeed ? '✓ Fits your needs' : '— Neutral'}
                      </span>
                    </div>
                  );
                })}
                {inPicksList.map(pk => <div key={pk.id} className="text-xs text-[#8b5cf6]">• {pk.year} 1st (value: {pk.estimatedValue}/10)</div>)}
              </div>
            </div>
            {outPlayers.length > 0 && inPlayers.length > 0 && (
              <div className={`text-xs mb-3 p-2 rounded-lg ${legality.legal ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                {legality.legal ? '✓ ' : '✗ '}{legality.reason}
              </div>
            )}
            <button
              onClick={submitOffer}
              disabled={outPlayers.length > 0 && inPlayers.length > 0 && !legality.legal}
              className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl hover:bg-[#fbbf24] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              SUBMIT OFFER TO {targetTeam?.name.toUpperCase() || 'GM'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── STAGE: NEGOTIATION ──────────────────────────────────────────────────────
  if (stage === 'negotiation' && scenario && studentTeam && targetTeam && aiResponse) {
    const decisionColors = { Accept: '#10b981', Reject: '#ef4444', Counter: '#f59e0b' };
    const decisionEmoji = { Accept: '✅', Reject: '❌', Counter: '🔄' };

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-white">GM-to-GM Negotiation</h1>
          {isAdvanced && timeLeft >= 0 && (
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold" style={{ color: timeLeft <= 10 ? '#ef4444' : '#f59e0b' }}>
                ⏱ {timeLeft}s
              </span>
              <div className="w-32 h-2 bg-[#1e293b] rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(timeLeft / 30) * 100}%`,
                    backgroundColor: timeLeft <= 10 ? '#ef4444' : '#f59e0b',
                  }}
                />
              </div>
              <span className="text-[10px] text-[#64748b] mt-0.5">Auto-accept when it hits 0</span>
            </div>
          )}
        </div>
        <p className="text-[#64748b] text-sm mb-6">Round {negotiationRound} · {targetTeam.city} {targetTeam.name} responds:</p>

        <div className="p-6 bg-[#111827] rounded-xl border-2 mb-6 verdict-slide" style={{ borderColor: decisionColors[aiResponse.decision] }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{decisionEmoji[aiResponse.decision]}</span>
            <div>
              <div className="text-2xl font-black" style={{ color: decisionColors[aiResponse.decision] }}>{aiResponse.decision.toUpperCase()}</div>
              <div className="text-xs text-[#64748b]">{targetTeam.city} GM Response</div>
            </div>
          </div>
          <p className="text-[#e2e8f0] italic text-sm leading-relaxed">&quot;{aiResponse.reason}&quot;</p>
          {aiResponse.counterOffer && (
            <div className="mt-4 p-3 bg-[#0a0e1a] rounded-lg border border-[#1e293b]">
              <div className="text-xs text-[#f59e0b] font-bold mb-1">THEIR COUNTER:</div>
              <p className="text-[#94a3b8] text-xs">{aiResponse.counterOffer.message}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {(aiResponse.decision === 'Accept' || aiResponse.decision === 'Counter') && (
            <button onClick={acceptDeal} className="flex-1 py-3 bg-[#10b981] text-black font-black rounded-xl hover:opacity-90 transition-opacity">
              {aiResponse.decision === 'Accept' ? '🤝 ACCEPT — DEAL DONE' : '✓ ACCEPT TERMS'}
            </button>
          )}
          {negotiationRound < 3 && (
            <button onClick={() => { setStage('build-offer'); setTimeLeft(-1); }} className="flex-1 py-3 bg-[#1a2035] text-white font-bold rounded-xl border border-[#1e293b] hover:border-[#f59e0b] transition-colors">
              🔄 REVISE OFFER
            </button>
          )}
          <button onClick={() => setStage('outcome')} className="flex-1 py-3 bg-[#ef4444]/20 text-red-400 font-bold rounded-xl border border-red-700 hover:bg-red-900/30 transition-colors">
            WALK AWAY
          </button>
        </div>
      </div>
    );
  }

  // ── STAGE: OUTCOME ──────────────────────────────────────────────────────────
  if (stage === 'outcome' && scenario) {
    const dealMade = finalScore !== null;

    // Win% impact analysis for the dealt players
    const inPlayers = targetTeam?.players.filter(p => selectedIncoming.includes(p.id)) || [];
    const outPlayers = studentTeam?.players.filter(p => selectedOutgoing.includes(p.id)) || [];
    const avgAgeIn  = inPlayers.length  ? inPlayers.reduce((s, p)  => s + p.age, 0) / inPlayers.length  : 0;
    const avgAgeOut = outPlayers.length ? outPlayers.reduce((s, p) => s + p.age, 0) / outPlayers.length : 0;
    const avgRatingIn  = inPlayers.length  ? inPlayers.reduce((s, p)  => s + p.rating, 0) / inPlayers.length  : 0;
    const avgRatingOut = outPlayers.length ? outPlayers.reduce((s, p) => s + p.rating, 0) / outPlayers.length : 0;
    const winPctDelta  = ((avgRatingIn - avgRatingOut) / 100) * 0.4;
    const winDelta     = Math.round(winPctDelta * 82);

    const letterGrade = finalScore
      ? calculateMultiFactorScore({ valueAcquired: finalScore.valueAcquired, capEfficiency: finalScore.capEfficiency, futureAssets: finalScore.futureAssets }).grade
      : 'D';

    if (!gradeRevealed) {
      return (
        <GradeRevealPrompt
          title={dealMade ? '🤝 Deal Done' : '🚫 No Deal'}
          subtitle={`${scenario.title} — ${scenario.year}`}
          loadingMessage={dealMade ? 'Trade logged. Evaluating GM performance...' : 'Walkaway recorded. Calculating negotiation score...'}
          buttonText="Reveal GM Score"
          buttonColor="#f59e0b"
          onReveal={() => { setGradeRevealed(true); saveCompletion('/blockbuster', dealMade ? letterGrade : '—'); }}
        />
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-white mb-2">{dealMade ? '🤝 Deal Done' : '🚫 No Deal'}</h1>
        <p className="text-[#64748b] text-sm mb-6">{scenario.title} — {scenario.year}</p>

        {dealMade && finalScore && (
          <div className="mb-6">
            <ScoreBreakdown
              valueAcquired={finalScore.valueAcquired}
              capEfficiency={finalScore.capEfficiency}
              futureAssets={finalScore.futureAssets}
              title="Your GM Score"
              compareScore={scenario.historicalOutcome.score}
            />
            {/* Win% and age impact */}
            {inPlayers.length > 0 && outPlayers.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
                  <div className="text-xs text-[#64748b] mb-1">Projected Win Impact</div>
                  <div className="text-xl font-black" style={{ color: winDelta >= 0 ? '#10b981' : '#ef4444' }}>
                    {winDelta >= 0 ? '+' : ''}{winDelta} wins
                  </div>
                  <div className="text-xs text-[#64748b] mt-1">
                    {winDelta > 3 ? 'Significant upgrade to the roster' : winDelta < -3 ? 'Roster talent decreased' : 'Roughly talent-neutral'}
                  </div>
                </div>
                <div className="p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
                  <div className="text-xs text-[#64748b] mb-1">Age Trade-Off</div>
                  <div className="text-xl font-black" style={{ color: avgAgeIn <= avgAgeOut ? '#10b981' : '#f59e0b' }}>
                    {avgAgeIn <= avgAgeOut ? 'Got Younger' : 'Got Older'}
                  </div>
                  <div className="text-xs text-[#64748b] mt-1">
                    Sent avg age {avgAgeOut.toFixed(0)}, received avg age {avgAgeIn.toFixed(0)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-5 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
          <div className="text-xs text-[#f59e0b] font-bold uppercase tracking-widest mb-3">📰 What Really Happened</div>
          <p className="text-[#e2e8f0] text-sm leading-relaxed mb-3">{scenario.historicalOutcome.summary}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {Object.entries(scenario.historicalOutcome.capImpact).map(([team, impact]) => (
              <div key={team} className="p-2 bg-[#0a0e1a] rounded-lg">
                <div className="text-xs text-[#64748b] font-bold uppercase mb-1">{team}</div>
                <div className="text-xs text-[#94a3b8]">{impact}</div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-[#0a0e1a] rounded-lg">
            <div className="text-xs text-[#64748b] font-bold mb-1">VERDICT:</div>
            <p className="text-[#94a3b8] text-sm italic">{scenario.historicalOutcome.verdict}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={reset} className="flex-1 py-3 bg-[#f59e0b] text-black font-black rounded-xl">TRY ANOTHER SCENARIO</button>
          <button onClick={() => setStage('build-offer')} className="flex-1 py-3 bg-[#1a2035] text-white font-bold rounded-xl border border-[#1e293b]">RENEGOTIATE</button>
        </div>
      </div>
    );
  }

  return null;
}
