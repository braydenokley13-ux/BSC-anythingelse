'use client';

import { useState } from 'react';
import { TRADE_SCENARIOS } from '@/data/tradeScenarios';
import { evaluateTrade } from '@/lib/AIValuation';
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

  const scenario = scenarioId ? TRADE_SCENARIOS.find(s => s.id === scenarioId) : null;
  const studentTeam = scenario?.teams.find(t => t.id === scenario.studentTeam);
  const otherTeams = scenario?.teams.filter(t => t.id !== scenario.studentTeam);
  const targetTeam = selectedTargetTeam ? scenario?.teams.find(t => t.id === selectedTargetTeam) : null;

  const isAdvanced = track === '7-8';

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
            <div className="p-4 bg-[#2a1f00] rounded-xl border border-[#f59e0b]/30">
              <div className="text-xs text-[#f59e0b] font-bold uppercase tracking-widest mb-2">🎯 Your Mission</div>
              <p className="text-[#e2e8f0] text-sm">{scenario.goal}</p>
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-red-400 font-bold mb-2">YOU SEND ({formatMoneyShort(outSalary)})</div>
                {outPlayers.map(p => <div key={p.id} className="text-xs text-[#e2e8f0]">• {p.name} ({formatMoneyShort(p.salary)})</div>)}
                {outPicksList.map(pk => <div key={pk.id} className="text-xs text-[#8b5cf6]">• {pk.year} 1st (value: {pk.estimatedValue}/10)</div>)}
              </div>
              <div>
                <div className="text-xs text-green-400 font-bold mb-2">YOU RECEIVE ({formatMoneyShort(inSalary)})</div>
                {inPlayers.map(p => <div key={p.id} className="text-xs text-[#e2e8f0]">• {p.name} ({formatMoneyShort(p.salary)})</div>)}
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
        <h1 className="text-2xl font-black text-white mb-2">GM-to-GM Negotiation</h1>
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
            <button onClick={() => setStage('build-offer')} className="flex-1 py-3 bg-[#1a2035] text-white font-bold rounded-xl border border-[#1e293b] hover:border-[#f59e0b] transition-colors">
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
