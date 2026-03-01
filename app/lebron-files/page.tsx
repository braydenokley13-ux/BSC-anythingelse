'use client';

import { useState } from 'react';
import {
  TEAM_OPTIONS_2010, CONTRACT_OPTIONS, ENDORSEMENT_DEALS, INVESTMENT_OPTIONS,
  LEBRON_REAL_TIMELINE, BRONNY_DECISIONS,
  type TeamOption, type EndorsementDeal, type InvestmentOption
} from '@/data/lebronCareerData';
import { formatMoney } from '@/lib/CapMath';
import { HintBox } from '@/components/shared/TrackWrapper';

type Phase = 'intro' | 'decision-2010' | 'decision-extension' | 'decision-2018' | 'investments' | 'scandal-event' | 'bronny-2023' | 'outcome';

interface CareerState {
  chosenTeam2010: TeamOption | null;
  contractChoice2010: string | null;
  endorsements: EndorsementDeal[];
  extensions: string[];
  chosenTeam2018: string | null;
  contractChoice2018: string | null;
  investments: InvestmentOption[];
  rings: number;
  earnings: number;
  legacyScore: number;
  portfolioValue: number;
  brandValue: number;
}

export default function LeBronFilesPage() {
  const [track, setTrack] = useState<'5-6' | '7-8'>('5-6');
  const [phase, setPhase] = useState<Phase>('intro');
  const [career, setCareer] = useState<CareerState>({
    chosenTeam2010: null,
    contractChoice2010: null,
    endorsements: [],
    extensions: [],
    chosenTeam2018: null,
    contractChoice2018: null,
    investments: [],
    rings: 0,
    earnings: 0,
    legacyScore: 50,
    portfolioValue: 0,
    brandValue: 0,
  });
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [selectedEndorsements, setSelectedEndorsements] = useState<string[]>([]);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [revealedStep, setRevealedStep] = useState(false);
  const [consequence, setConsequence] = useState<{ title: string; text: string; stats: { label: string; value: string; color: string }[] } | null>(null);
  const [pendingPhase, setPendingPhase] = useState<Phase | null>(null);
  const [decisionSubStep, setDecisionSubStep] = useState(0);
  const [pendingScandal, setPendingScandal] = useState<{ brand: string; risk: number } | null>(null);
  const [gradeRevealed, setGradeRevealed] = useState(false);
  const [scandalBrand, setScandalBrand] = useState<string | null>(null);
  const [legacyBreakdown, setLegacyBreakdown] = useState<{ source: string; amount: number }[]>([]);

  const isAdvanced = track === '7-8';

  const TEAM_CONSEQUENCES: Record<string, { title: string; text: string; stats: { label: string; value: string; color: string }[] }> = {
    heat: {
      title: 'Year 1 — Miami: The Villain Era Begins',
      text: '"The Decision" caused a national meltdown. Jerseys burned in Cleveland. But in Miami, 20,000 fans packed an arena just for the introductory press conference. LeBron, Wade, and Bosh formed the most hyped team since the \'96 Bulls. Year 1 ended in the Finals — a loss to Dallas that still haunts the legacy.',
      stats: [{ label: 'Season Result', value: 'NBA Finals — Lost to Dallas', color: '#ef4444' }, { label: 'Narrative', value: 'National villain → rings chaser', color: '#f59e0b' }, { label: 'Legacy Impact', value: 'Controversial but winning', color: '#8b5cf6' }],
    },
    cavaliers: {
      title: 'Year 1 — Cleveland: The Loyal King',
      text: 'The city exhaled. LeBron stayed home — ticket sales surged, city pride was at an all-time high. The roster was thin, but LeBron willed 66 wins out of a team most thought was done. The NBA was on notice: the King wasn\'t going anywhere.',
      stats: [{ label: 'Season Result', value: '66 wins — Conference Finals', color: '#10b981' }, { label: 'Narrative', value: 'Hometown hero. Legacy cemented', color: '#f59e0b' }, { label: 'Legacy Impact', value: 'Highest loyalty score in league', color: '#10b981' }],
    },
    bulls: {
      title: 'Year 1 — Chicago: Jordan\'s Shadow',
      text: 'Jordan\'s ghost lurked everywhere in Chicago. LeBron and Derrick Rose formed a dangerous duo — the city was electric. But comparisons to #23 were relentless. After a Conference Finals loss, the question became: is Chicago LeBron\'s city, or will it always belong to Michael?',
      stats: [{ label: 'Season Result', value: 'Conference Finals exit', color: '#f59e0b' }, { label: 'Narrative', value: 'Legitimate contender but Jordan comparisons everywhere', color: '#f59e0b' }, { label: 'Legacy Impact', value: 'Winning but never his stage', color: '#64748b' }],
    },
    knicks: {
      title: 'Year 1 — New York: The Capital of Basketball',
      text: 'Madison Square Garden was electric every night — every game was front-page news. But the roster was a disaster. LeBron carried a broken team through sheer will alone. First-round exit. The media pressure was unlike anything — every missed shot dissected for 48 hours.',
      stats: [{ label: 'Season Result', value: 'First Round exit', color: '#ef4444' }, { label: 'Narrative', value: 'Biggest market, worst supporting cast', color: '#ef4444' }, { label: 'Legacy Impact', value: 'Brand value sky-high, ring count zero', color: '#f59e0b' }],
    },
    clippers: {
      title: 'Year 1 — Los Angeles: The Other LA',
      text: 'LeBron and Chris Paul dominated the regular season but fell short in the Conference Finals. Being the "other" LA team meant Lakers fans never fully embraced him. The Donald Sterling ownership scandal exploded mid-season — adding chaos to everything.',
      stats: [{ label: 'Season Result', value: 'Conference Finals exit', color: '#f59e0b' }, { label: 'Narrative', value: 'Winning team, wrong side of town', color: '#64748b' }, { label: 'Legacy Impact', value: 'Competitive but politically messy', color: '#f59e0b' }],
    },
    nets: {
      title: 'Year 1 — New Jersey: Jay-Z\'s Vision Falls Short',
      text: 'The Barclays Center was brand new, Jay-Z was part of ownership, and the hype was enormous. But the roster wasn\'t good enough. A first-round exit. By mid-season, LeBron was already being questioned. Some "futures" just don\'t pan out the way they look on paper.',
      stats: [{ label: 'Season Result', value: 'First Round exit', color: '#ef4444' }, { label: 'Narrative', value: 'All hype, no championship hardware', color: '#ef4444' }, { label: 'Legacy Impact', value: 'Questioned immediately', color: '#ef4444' }],
    },
  };

  function confirmTeamChoice2010() {
    const team = TEAM_OPTIONS_2010.find(t => t.id === selectedTeam);
    const contract = CONTRACT_OPTIONS['2010'].find(c => c.id === selectedContract);
    if (!team || !contract) return;

    const rings = team.champOdds > 0.6 ? 2 : team.champOdds > 0.3 ? 1 : 0;
    const earnings = contract.totalValue;
    const legacyBonus = team.legacyScore - 5;

    setCareer(c => ({
      ...c,
      chosenTeam2010: team,
      contractChoice2010: selectedContract,
      rings,
      earnings: c.earnings + earnings,
      legacyScore: c.legacyScore + legacyBonus + (rings * 8),
    }));
    // Show consequence card before advancing
    const conseq = TEAM_CONSEQUENCES[team.id];
    setDecisionSubStep(0);
    if (conseq) {
      setConsequence(conseq);
      setPendingPhase('decision-extension');
    } else {
      setRevealedStep(false);
      setPhase('decision-extension');
    }
  }

  function confirmEndorsements() {
    const deals = ENDORSEMENT_DEALS.filter(d => selectedEndorsements.includes(d.id));
    const totalEndorsementValue = deals.reduce((s, d) => s + d.baseValue * 8, 0);
    const brandValue = deals.reduce((s, d) => s + d.fitScore * 10, 0);
    const highRiskDeal = deals.find(d => d.scandalRisk >= 7);
    setCareer(c => ({
      ...c,
      endorsements: deals,
      earnings: c.earnings + totalEndorsementValue,
      brandValue: c.brandValue + brandValue,
    }));
    setRevealedStep(false);
    if (highRiskDeal) {
      setPendingScandal({ brand: highRiskDeal.brand, risk: highRiskDeal.scandalRisk });
      setPhase('scandal-event');
    } else {
      setPhase('decision-2018');
    }
  }

  function confirmTeamChoice2018() {
    const contract = CONTRACT_OPTIONS['2018'].find(c => c.id === selectedContract);
    if (!contract) return;

    const rings = selectedTeam === 'lakers' ? 1 : 0;
    const earnings = contract.totalValue;

    setCareer(c => ({
      ...c,
      chosenTeam2018: selectedTeam,
      contractChoice2018: selectedContract,
      rings: c.rings + rings,
      earnings: c.earnings + earnings,
      legacyScore: c.legacyScore + (rings * 10) + (selectedTeam === 'lakers' ? 5 : 0),
    }));
    setRevealedStep(false);
    setDecisionSubStep(0);
    setPhase('investments');
  }

  function confirmInvestments() {
    const invested = INVESTMENT_OPTIONS.filter(i => selectedInvestments.includes(i.id) && i.yearAvailable <= 2021);
    const portfolio = invested.reduce((s, i) => s + i.currentValue, 0);
    const culturalScore = invested.reduce((s, i) => s + i.culturalImpact, 0);
    setCareer(c => ({
      ...c,
      investments: invested,
      portfolioValue: portfolio,
      legacyScore: c.legacyScore + culturalScore,
    }));
    setPhase('bronny-2023');
  }

  function confirmBronnyDecision(decisionId: string) {
    const decision = BRONNY_DECISIONS.find(d => d.id === decisionId);
    if (!decision) return;
    setCareer(c => ({
      ...c,
      rings: c.rings + decision.ringsChange,
      earnings: c.earnings + decision.earningsChange,
      legacyScore: Math.min(100, c.legacyScore + decision.legacyChange),
    }));
    setPhase('outcome');
  }

  const teamColors: Record<string, string> = {
    heat: '#98002e', cavaliers: '#860038', bulls: '#ce1141',
    knicks: '#006bb6', clippers: '#1d428a', nets: '#000000',
    lakers: '#552583',
  };

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6 p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
          <span className="text-xs text-[#64748b] uppercase tracking-widest">Grade Level:</span>
          {(['5-6', '7-8'] as const).map(t => (
            <button key={t} onClick={() => setTrack(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${track === t ? 'bg-[#f59e0b] text-black' : 'bg-[#1a2035] text-[#64748b]'}`}>
              {t === '5-6' ? '5th–6th Grade' : '7th–8th (Hard)'}
            </button>
          ))}
        </div>

        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-4xl font-black text-white mb-2">THE LEBRON FILES</h1>
          <p className="text-[#64748b] text-lg">You are LeBron&apos;s advisor. Every decision you make is real. What life does he live?</p>
        </div>

        {!isAdvanced && (
          <div className="mb-6 grid grid-cols-2 gap-3">
            {[
              { icon: '🏀', label: 'Championship Rings', desc: 'Depends on team quality and contract' },
              { icon: '💰', label: 'Career Earnings', desc: 'Salary + endorsements + investments' },
              { icon: '✨', label: 'Legacy Score', desc: 'How history remembers him' },
              { icon: '🏢', label: 'Business Empire', desc: 'Portfolio value from smart investments' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="p-3 bg-[#1a2035] rounded-xl border border-[#1e293b] text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs font-bold text-white">{label}</div>
                <div className="text-xs text-[#64748b]">{desc}</div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
          <div className="text-xs text-[#64748b] font-bold mb-3 uppercase tracking-widest">LeBron&apos;s Real Career Timeline (Comparison)</div>
          <div className="space-y-2">
            {LEBRON_REAL_TIMELINE.map(e => (
              <div key={e.year} className="flex items-start gap-3 text-xs">
                <span className="text-[#f59e0b] font-bold w-10">{e.year}</span>
                <div>
                  <span className="text-[#e2e8f0]">{e.decision}</span>
                  {!isAdvanced && <div className="text-[#64748b] mt-0.5">{e.legacyNote}</div>}
                </div>
                <span className="ml-auto text-[#f59e0b]">{'🏆'.repeat(e.rings)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setPhase('decision-2010')}
          className="w-full py-4 bg-[#f59e0b] text-black font-black text-xl rounded-xl hover:bg-[#fbbf24] transition-colors"
        >
          START — 2010 FREE AGENCY →
        </button>
      </div>
    );
  }

  // ── DECISION 2010 ───────────────────────────────────────────────────────────
  if (phase === 'decision-2010') {
    // Sub-step 0: Team pitches overview
    if (decisionSubStep === 0) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 1 · STEP 1 OF 2</div>
            <h1 className="text-2xl font-black text-white">The Phone Keeps Ringing</h1>
            <p className="text-[#94a3b8] text-sm">Summer 2010. LeBron&apos;s rookie deal just expired. Six teams are making their pitch. Read each team&apos;s offer before you decide.</p>
          </div>
          {!isAdvanced && (
            <HintBox>Before you choose, understand what each team is offering. Championship odds, market size, and roster quality all matter differently depending on what LeBron wants most.</HintBox>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {TEAM_OPTIONS_2010.map(team => {
              const oddsLabel = team.champOdds > 0.5 ? { text: 'High odds', color: '#10b981' } : team.champOdds > 0.25 ? { text: 'Medium odds', color: '#f59e0b' } : { text: 'Low odds', color: '#ef4444' };
              return (
                <div key={team.id} className="p-4 bg-[#1a2035] rounded-xl border border-[#1e293b]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-black text-white">{team.city} {team.name}</div>
                      <div className="text-xs text-[#64748b]">{team.rosterNotes}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold" style={{ color: oddsLabel.color }}>{oddsLabel.text}</div>
                      <div className="text-xs text-[#64748b]">{(team.champOdds * 100).toFixed(0)}% champ odds</div>
                    </div>
                  </div>
                  {/* Odds meter bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-[#64748b] mb-1">
                      <span>Championship Probability</span>
                      <span style={{ color: oddsLabel.color }}>{(team.champOdds * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${team.champOdds * 100}%`, backgroundColor: oddsLabel.color }} />
                    </div>
                    {!isAdvanced && (
                      <div className="text-[10px] text-[#64748b] mt-1">
                        {team.champOdds > 0.5 ? `With ${(team.champOdds * 100).toFixed(0)}% odds over 4 years → likely 2 rings` :
                         team.champOdds > 0.25 ? `With ${(team.champOdds * 100).toFixed(0)}% odds → could get 1 ring` :
                         `With ${(team.champOdds * 100).toFixed(0)}% odds → ring is unlikely in 4 years`}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center"><div className="text-[#f59e0b] font-bold">${team.maxSalary.toFixed(0)}M</div><div className="text-[#64748b]">Max offer</div></div>
                    <div className="text-center"><div className="text-[#3b82f6] font-bold">{team.endorsementMarket}/10</div><div className="text-[#64748b]">Market size</div></div>
                    <div className="text-center"><div className="text-[#8b5cf6] font-bold">{team.legacyScore}/10</div><div className="text-[#64748b]">Legacy fit</div></div>
                  </div>
                </div>
              );
            })}
          </div>
          {!isAdvanced && (
            <div className="p-3 bg-[#111827] rounded-xl border border-[#1e293b] mb-4 text-xs text-[#94a3b8]">
              <span className="text-[#f59e0b] font-bold">How Champ Odds Work:</span> These factor in roster talent, coaching staff, and conference competition. Higher % = better shot at rings over 4 years. But nothing is guaranteed — Dallas (15% odds) won the 2011 title as an underdog.
            </div>
          )}
          <button
            onClick={() => setDecisionSubStep(1)}
            className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#fbbf24] transition-colors"
          >
            I&apos;VE SEEN ENOUGH — MAKE MY DECISION →
          </button>
        </div>
      );
    }

    // Sub-step 1: Final team + contract selection
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 1 · STEP 2 OF 2</div>
          <h1 className="text-2xl font-black text-white">2010 Free Agency: The Decision</h1>
          <p className="text-[#94a3b8] text-sm">LeBron has finished his rookie deal in Cleveland. 6 teams want him. Where does he go?</p>
        </div>
        <button onClick={() => setDecisionSubStep(0)} className="text-xs text-[#64748b] hover:text-white mb-4">← Back to team pitches</button>

        {!isAdvanced && (
          <HintBox>
            Look at Championship Odds, Max Salary, and Market Size. They don&apos;t all point to the same answer — that&apos;s the point. What does LeBron value most?
          </HintBox>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {TEAM_OPTIONS_2010.map(team => {
            const oddsLabel = team.champOdds > 0.5 ? '#10b981' : team.champOdds > 0.25 ? '#f59e0b' : '#ef4444';
            return (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${selectedTeam === team.id ? 'ring-2 ring-[#f59e0b]' : 'hover:border-[#64748b]'}`}
              style={{ borderColor: selectedTeam === team.id ? '#f59e0b' : '#1e293b', background: selectedTeam === team.id ? teamColors[team.id] + '33' : '#1a2035' }}
            >
              <div className="font-black text-white text-sm">{team.city}</div>
              <div className="text-[#64748b] text-xs mb-3">{team.name}</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748b]">🏆 Champ Odds</span>
                  <span className="font-bold" style={{ color: oddsLabel }}>
                    {(team.champOdds * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Odds meter bar */}
                <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${team.champOdds * 100}%`, backgroundColor: oddsLabel }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748b]">💰 Max Salary</span>
                  <span className="text-[#f59e0b] font-bold">${team.maxSalary.toFixed(0)}M</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748b]">📺 Market</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.round(team.endorsementMarket / 2) }).map((_, i) => (
                      <span key={i} className="text-[#f59e0b] text-[8px]">★</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748b]">🏅 Legacy</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.round(team.legacyScore / 2) }).map((_, i) => (
                      <span key={i} className="text-[#e2e8f0] text-[8px]">★</span>
                    ))}
                  </div>
                </div>
                {!isAdvanced && <div className="text-xs text-[#94a3b8] mt-2 border-t border-[#1e293b] pt-2">{team.rosterNotes}</div>}
              </div>
            </button>
            );
          })}
        </div>

        {selectedTeam && (
          <div className="mb-6">
            <div className="text-sm font-bold text-white mb-3">Contract Structure</div>
            {!isAdvanced && <HintBox>Shorter contracts = more leverage each year. Longer = more guaranteed money. What does LeBron need most?</HintBox>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CONTRACT_OPTIONS['2010'].map(contract => (
                <button
                  key={contract.id}
                  onClick={() => setSelectedContract(contract.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${selectedContract === contract.id ? 'border-[#f59e0b] bg-[#2a1f00]' : 'border-[#1e293b] bg-[#1a2035] hover:border-[#64748b]'}`}
                >
                  <div className="font-bold text-white text-sm mb-1">{contract.label}</div>
                  <div className="text-2xl font-black text-[#f59e0b] mb-2">${contract.totalValue.toFixed(0)}M</div>
                  <div className="text-xs text-[#64748b] mb-2">${contract.annualValue.toFixed(1)}M/year</div>
                  <div className="space-y-1">
                    {contract.pros.map(p => <div key={p} className="text-xs text-green-400">✓ {p}</div>)}
                    {contract.cons.map(c => <div key={c} className="text-xs text-red-400">✗ {c}</div>)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTeam && selectedContract && !consequence && (
          <button
            onClick={confirmTeamChoice2010}
            className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#fbbf24] transition-colors"
          >
            LOCK IN DECISION →
          </button>
        )}

        {/* Consequence reveal card */}
        {consequence && (
          <div className="mt-4 p-5 bg-[#111827] rounded-xl border-2 border-[#f59e0b]/60">
            <div className="text-xs text-[#f59e0b] font-bold uppercase tracking-widest mb-2">📰 What Happened</div>
            <div className="text-lg font-black text-white mb-3">{consequence.title}</div>
            <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">{consequence.text}</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {consequence.stats.map(s => (
                <div key={s.label} className="p-2 bg-[#0a0e1a] rounded-lg text-center">
                  <div className="text-xs font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-[#64748b]">{s.label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setConsequence(null); setRevealedStep(false); if (pendingPhase) { setPhase(pendingPhase); setPendingPhase(null); } }}
              className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl hover:bg-[#fbbf24] transition-colors"
            >
              CONTINUE — BUILD THE BRAND →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── DECISION EXTENSION (Endorsements) ──────────────────────────────────────
  if (phase === 'decision-extension') {
    const team = career.chosenTeam2010;

    // Sub-step 0: brand approach pitch screen
    if (decisionSubStep === 0) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 2 · STEP 1 OF 2</div>
            <h1 className="text-2xl font-black text-white">The Brands Come Calling</h1>
            <p className="text-[#94a3b8] text-sm">7 companies want LeBron&apos;s name on their product. Each deal has different risk and reward. Review before you choose.</p>
          </div>
          {!isAdvanced && (
            <HintBox>High scandal risk = real risk of losing the deal and your reputation. Exclusivity = you can&apos;t sign competing brands. Look before you leap.</HintBox>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {ENDORSEMENT_DEALS.map(deal => (
              <div key={deal.id} className="p-4 bg-[#1a2035] rounded-xl border border-[#1e293b]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{deal.icon}</span>
                  <div>
                    <div className="font-bold text-white">{deal.brand}</div>
                    <div className="text-xs text-[#64748b]">{deal.category}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-[#f59e0b] font-black">${deal.baseValue.toFixed(0)}M/yr</div>
                    <div className="text-xs text-[#64748b]">+{deal.upsidePct}% upside</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[#64748b]">Scandal Risk:</span>
                    <div className="h-1.5 w-16 bg-[#1e293b] rounded-full overflow-hidden ml-1">
                      <div className="h-full rounded-full" style={{ width: `${deal.scandalRisk * 10}%`, backgroundColor: deal.scandalRisk >= 7 ? '#ef4444' : deal.scandalRisk >= 4 ? '#f59e0b' : '#10b981' }} />
                    </div>
                    <span style={{ color: deal.scandalRisk >= 7 ? '#ef4444' : deal.scandalRisk >= 4 ? '#f59e0b' : '#10b981' }}>{deal.scandalRisk}/10</span>
                  </div>
                  {deal.exclusivity.length > 0 && (
                    <span className="text-[#64748b]">Blocks: {deal.exclusivity.slice(0, 2).join(', ')}</span>
                  )}
                </div>
                {deal.scandalRisk >= 7 && !isAdvanced && (
                  <div className="mt-2 text-[10px] text-[#ef4444] bg-red-950/30 rounded p-1.5">
                    ⚠️ High risk — if a controversy erupts, this deal could cost you legacy points
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setDecisionSubStep(1)}
            className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#fbbf24] transition-colors"
          >
            CHOOSE YOUR DEALS →
          </button>
        </div>
      );
    }

    // Sub-step 1: deal selection (existing screen)
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 2 · STEP 2 OF 2</div>
          <h1 className="text-2xl font-black text-white">Build LeBron&apos;s Brand</h1>
          <p className="text-[#94a3b8] text-sm">While playing for {team?.city}, companies are lining up. Choose wisely — some deals conflict.</p>
        </div>
        <button onClick={() => setDecisionSubStep(0)} className="text-xs text-[#64748b] hover:text-white mb-4">← Back to brand overview</button>

        <div className="flex items-center gap-4 mb-6 p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
          <div>
            <div className="text-xs text-[#64748b]">Playing for</div>
            <div className="text-white font-bold">{team?.city} {team?.name}</div>
          </div>
          <div className="ml-auto flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-[#f59e0b] font-black">{'🏆'.repeat(career.rings) || '–'}</div>
              <div className="text-xs text-[#64748b]">Rings</div>
            </div>
            <div className="text-center">
              <div className="text-[#10b981] font-black">{formatMoney(career.earnings)}</div>
              <div className="text-xs text-[#64748b]">Earned</div>
            </div>
          </div>
        </div>

        {!isAdvanced && (
          <HintBox>
            Pick up to 3 endorsements. Check the &quot;Scandal Risk&quot; — high risk brands can hurt your legacy score if something goes wrong. &quot;Exclusivity&quot; means you can&apos;t sign competing brands.
          </HintBox>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {ENDORSEMENT_DEALS.map(deal => {
            const isSelected = selectedEndorsements.includes(deal.id);
            const maxReached = selectedEndorsements.length >= 3 && !isSelected;
            // Exclusivity conflict: selected deals' exclusivity blocks this deal's category
            const selectedDeals = ENDORSEMENT_DEALS.filter(d => selectedEndorsements.includes(d.id) && d.id !== deal.id);
            const conflictingDeal = selectedDeals.find(sel =>
              sel.exclusivity.some(ex => deal.category.toLowerCase().includes(ex) || deal.exclusivity.includes(ex))
            );
            const isBlocked = !isSelected && !!conflictingDeal;
            return (
              <button
                key={deal.id}
                onClick={() => !maxReached && !isBlocked && setSelectedEndorsements(prev => isSelected ? prev.filter(x => x !== deal.id) : [...prev, deal.id])}
                disabled={maxReached || isBlocked}
                className={`text-left p-4 rounded-xl border-2 transition-all ${isBlocked ? 'opacity-40 cursor-not-allowed border-[#ef4444]/30 bg-red-950/20' : isSelected ? 'border-[#f59e0b] bg-[#2a1f00]' : 'border-[#1e293b] bg-[#1a2035] hover:border-[#64748b]'} ${maxReached && !isBlocked ? 'disabled:opacity-40' : ''}`}
              >
                <div className="text-2xl mb-2">{deal.icon}</div>
                <div className="font-bold text-white text-sm">{deal.brand}</div>
                <div className="text-[#64748b] text-xs mb-3">{deal.category}</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Base Value</span>
                    <span className="text-[#f59e0b] font-bold">${deal.baseValue.toFixed(0)}M/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Upside</span>
                    <span className="text-green-400">+{deal.upsidePct}%</span>
                  </div>
                  {isAdvanced && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Scandal Risk</span>
                        <span style={{ color: deal.scandalRisk > 6 ? '#ef4444' : deal.scandalRisk > 3 ? '#f59e0b' : '#10b981' }}>
                          {deal.scandalRisk}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Brand Fit</span>
                        <span className="text-[#3b82f6]">{deal.fitScore}/10</span>
                      </div>
                    </>
                  )}
                  {!isAdvanced && deal.exclusivity.length > 0 && (
                    <div className="text-[#64748b] text-xs">Blocks: {deal.exclusivity.join(', ')}</div>
                  )}
                  {isBlocked && (
                    <div className="mt-2 text-xs text-[#ef4444] font-bold">
                      ✗ Blocked by {conflictingDeal?.brand} (exclusivity conflict)
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-[#111827] rounded-xl border border-[#1e293b] mb-4 flex items-center justify-between text-sm">
          <span className="text-[#64748b]">Selected endorsements value (8yr):</span>
          <span className="text-[#f59e0b] font-black">{formatMoney(ENDORSEMENT_DEALS.filter(d => selectedEndorsements.includes(d.id)).reduce((s, d) => s + d.baseValue * 8, 0))}</span>
        </div>

        <button
          onClick={confirmEndorsements}
          disabled={selectedEndorsements.length === 0}
          className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#fbbf24] transition-colors disabled:opacity-40"
        >
          LOCK ENDORSEMENTS — MOVE TO 2018 →
        </button>
      </div>
    );
  }

  // ── DECISION 2018 ───────────────────────────────────────────────────────────
  if (phase === 'decision-2018') {
    const teams2018 = [
      { id: 'lakers', city: 'Los Angeles', name: 'Lakers', champOdds: 0.35, maxSalary: 153.3, marketSize: 10, youngCore: 'Ingram, Kuzma, Ball' },
      { id: 'cavaliers', city: 'Cleveland', name: 'Cavaliers', champOdds: 0.22, maxSalary: 35.6, marketSize: 5, youngCore: 'None — fading roster' },
      { id: 'sixers', city: 'Philadelphia', name: '76ers', champOdds: 0.48, maxSalary: 35.6, marketSize: 8, youngCore: 'Simmons, Embiid — The Process' },
      { id: 'rockets', city: 'Houston', name: 'Rockets', champOdds: 0.52, maxSalary: 35.6, marketSize: 7, youngCore: 'Harden, Paul — prime window' },
    ];

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 3 OF 4</div>
          <h1 className="text-2xl font-black text-white">2018: The Biggest Move</h1>
          <p className="text-[#94a3b8] text-sm">LeBron is 33. This is likely his last mega contract. Where does he take his legacy?</p>
        </div>

        <div className="flex items-center gap-6 mb-6 p-3 bg-[#111827] rounded-xl border border-[#1e293b] text-sm">
          <div><div className="text-xs text-[#64748b]">Rings So Far</div><div className="text-xl">{'🏆'.repeat(career.rings) || '0'}</div></div>
          <div><div className="text-xs text-[#64748b]">Earned So Far</div><div className="text-[#f59e0b] font-bold">{formatMoney(career.earnings)}</div></div>
          <div><div className="text-xs text-[#64748b]">Legacy Score</div><div className="text-[#e2e8f0] font-bold">{career.legacyScore}/100</div></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {teams2018.map(team => {
            const oddsColor = team.champOdds > 0.45 ? '#10b981' : team.champOdds > 0.25 ? '#f59e0b' : '#ef4444';
            return (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${selectedTeam === team.id ? 'border-[#f59e0b] bg-[#2a1f00]' : 'border-[#1e293b] bg-[#1a2035] hover:border-[#64748b]'}`}
            >
              <div className="font-black text-white">{team.city}</div>
              <div className="text-[#64748b] text-xs mb-3">{team.name}</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">🏆 Champ Odds</span>
                  <span className="font-bold" style={{ color: oddsColor }}>
                    {(team.champOdds * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${team.champOdds * 100}%`, backgroundColor: oddsColor }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">💰 Max Offer</span>
                  <span className="text-[#f59e0b] font-bold">${team.maxSalary.toFixed(0)}M</span>
                </div>
                {!isAdvanced && <div className="text-[#94a3b8] mt-2 border-t border-[#1e293b] pt-2">{team.youngCore}</div>}
              </div>
            </button>
            );
          })}
        </div>

        {selectedTeam && (
          <div className="mb-6">
            <div className="text-sm font-bold text-white mb-3">Contract Structure</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONTRACT_OPTIONS['2018'].map(contract => (
                <button
                  key={contract.id}
                  onClick={() => setSelectedContract(contract.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${selectedContract === contract.id ? 'border-[#f59e0b] bg-[#2a1f00]' : 'border-[#1e293b] bg-[#1a2035] hover:border-[#64748b]'}`}
                >
                  <div className="font-bold text-white text-sm">{contract.label}</div>
                  <div className="text-2xl font-black text-[#f59e0b]">${contract.totalValue.toFixed(0)}M</div>
                  <div className="space-y-0.5 mt-2">
                    {contract.pros.map(p => <div key={p} className="text-xs text-green-400">✓ {p}</div>)}
                    {contract.cons.map(c => <div key={c} className="text-xs text-red-400">✗ {c}</div>)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTeam && selectedContract && (
          <button onClick={confirmTeamChoice2018} className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg">
            COMMIT TO {teams2018.find(t => t.id === selectedTeam)?.city.toUpperCase()} →
          </button>
        )}
      </div>
    );
  }

  // ── INVESTMENTS ─────────────────────────────────────────────────────────────
  if (phase === 'investments') {
    const availableInvestments = INVESTMENT_OPTIONS.filter(i => i.yearAvailable <= 2021);
    const totalInvested = availableInvestments.filter(i => selectedInvestments.includes(i.id)).reduce((s, i) => s + i.costBasis, 0);

    // Sub-step 0: financial math explainer
    if (decisionSubStep === 0) {
      const examples = [
        { invest: 5, years: 15, rate: 8, result: Math.round(5 * Math.pow(1.08, 15)) },
        { invest: 10, years: 20, rate: 8, result: Math.round(10 * Math.pow(1.08, 20)) },
        { invest: 20, years: 25, rate: 8, result: Math.round(20 * Math.pow(1.08, 25)) },
      ];
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 4 · STEP 1 OF 2</div>
            <h1 className="text-2xl font-black text-white">How Money Actually Grows</h1>
            <p className="text-[#94a3b8] text-sm">Before you invest, understand WHY investing turns millions into billions.</p>
          </div>
          <div className="p-4 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
            <div className="text-sm font-bold text-white mb-3">The Magic Formula: Compound Growth</div>
            <div className="font-mono text-[#f59e0b] text-sm mb-3 p-2 bg-[#0a0e1a] rounded-lg">
              Future Value = Investment × (1 + Rate)^Years
            </div>
            {!isAdvanced && <p className="text-xs text-[#94a3b8] mb-4">Money grows not just on what you put in — it grows on the growth too. That&apos;s why LeBron&apos;s $10M investment in Liverpool FC turned into $111M. The stock market averages ~8% per year.</p>}
            <div className="space-y-3">
              {examples.map(ex => (
                <div key={ex.invest} className="p-3 bg-[#0a0e1a] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-bold">${ex.invest}M invested at 8%/yr for {ex.years} years</span>
                    <span className="text-[#10b981] font-black text-lg">${ex.result}M</span>
                  </div>
                  <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#10b981] rounded-full" style={{ width: `${Math.min(100, (ex.result / 140) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#64748b] mt-1">
                    <span>Started: ${ex.invest}M</span>
                    <span className="text-[#10b981]">{(ex.result / ex.invest).toFixed(0)}x return</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-[#2a1f00] rounded-xl border border-[#f59e0b]/30 mb-6 text-xs text-[#e2e8f0]">
            <span className="text-[#f59e0b] font-bold">Real LeBron: </span>
            Invested ~$1M in Liverpool FC in 2011 when it was worth $300M total. By 2021, Liverpool was worth $4.1B — LeBron&apos;s share: <span className="text-[#10b981] font-bold">~$45M</span>.
            That&apos;s how $1M becomes $45M. Compounding + choosing right.
          </div>
          <button
            onClick={() => setDecisionSubStep(1)}
            className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#fbbf24] transition-colors"
          >
            NOW CHOOSE WHERE TO INVEST →
          </button>
        </div>
      );
    }

    // Sub-step 1: investment selection (existing screen)
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 4 · STEP 2 OF 2</div>
          <h1 className="text-2xl font-black text-white">Build the Empire</h1>
          <p className="text-[#94a3b8] text-sm">LeBron has earned big. Now where does he invest? Real investments, real returns.</p>
        </div>
        <button onClick={() => setDecisionSubStep(0)} className="text-xs text-[#64748b] hover:text-white mb-4">← Back to how money grows</button>

        {!isAdvanced && (
          <HintBox>
            Each investment shows what it was worth when LeBron bought in vs. what it&apos;s worth TODAY. Pick the ones you think have the best return AND cultural impact.
          </HintBox>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {availableInvestments.map(inv => {
            const isSelected = selectedInvestments.includes(inv.id);
            const returnMultiple = inv.returnMultiple;
            return (
              <button
                key={inv.id}
                onClick={() => setSelectedInvestments(prev => isSelected ? prev.filter(x => x !== inv.id) : [...prev, inv.id])}
                className={`text-left p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-[#f59e0b] bg-[#2a1f00]' : 'border-[#1e293b] bg-[#1a2035] hover:border-[#64748b]'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-white">{inv.name}</div>
                    <div className="text-xs text-[#64748b]">{inv.riskLevel} Risk</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#f59e0b] font-black">{returnMultiple.toFixed(1)}x</div>
                    <div className="text-xs text-[#64748b]">return</div>
                  </div>
                </div>
                {!isAdvanced && <p className="text-xs text-[#94a3b8] mb-3">{inv.description}</p>}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                    <div className="text-[#64748b]">Invested</div>
                    <div className="text-white font-bold">{inv.costBasis === 0 ? 'Partnership' : formatMoney(inv.costBasis)}</div>
                  </div>
                  <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                    <div className="text-[#64748b]">Worth Today</div>
                    <div className="text-[#10b981] font-bold">{formatMoney(inv.currentValue)}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-[#111827] rounded-xl border border-[#1e293b] mb-4 flex justify-between text-sm">
          <span className="text-[#64748b]">Total invested:</span>
          <span className="text-[#f59e0b] font-bold">{formatMoney(totalInvested)}</span>
        </div>

        <button
          onClick={confirmInvestments}
          disabled={selectedInvestments.length === 0}
          className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg disabled:opacity-40"
        >
          SEE LEBRON&apos;S FINAL STORY →
        </button>
      </div>
    );
  }

  // ── SCANDAL EVENT ────────────────────────────────────────────────────────────
  if (phase === 'scandal-event' && pendingScandal) {
    function resolveScandal() {
      setCareer(c => ({
        ...c,
        legacyScore: c.legacyScore - 12,
        brandValue: c.brandValue - 10,
      }));
      setPendingScandal(null);
      setPhase('decision-2018');
    }
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#ef4444] uppercase tracking-widest mb-1 font-bold">⚠️ CONTROVERSY ALERT</div>
          <h1 className="text-2xl font-black text-white">Scandal: {pendingScandal.brand}</h1>
          <p className="text-[#94a3b8] text-sm">A major controversy erupted with your {pendingScandal.brand} deal. The internet is on fire.</p>
        </div>
        <div className="p-6 bg-[#1a0505] rounded-xl border-2 border-[#ef4444]/50 mb-6">
          <div className="text-4xl mb-4 text-center">📰</div>
          <p className="text-[#e2e8f0] text-sm leading-relaxed mb-4">
            Your {pendingScandal.brand} partnership (Scandal Risk: {pendingScandal.risk}/10) attracted intense media scrutiny.
            Activists, fans, and rival brands all weighed in. The controversy dominated the news cycle for weeks,
            overshadowing your on-court performance and forcing brands to distance themselves.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-[#0a0e1a] rounded-lg text-center">
              <div className="text-[#ef4444] font-black text-xl">–12</div>
              <div className="text-xs text-[#64748b]">Legacy Score</div>
            </div>
            <div className="p-3 bg-[#0a0e1a] rounded-lg text-center">
              <div className="text-[#ef4444] font-black text-xl">–$10M</div>
              <div className="text-xs text-[#64748b]">Brand Value</div>
            </div>
          </div>
          <div className="p-3 bg-[#111827] rounded-lg text-xs text-[#94a3b8]">
            <span className="text-[#f59e0b] font-bold">Real LeBron: </span>
            LeBron vets every partnership carefully. He famously rejected deals that conflicted with his community values,
            even when the money was enormous. His brand discipline is why he&apos;s trusted by Nike, Beats, and Apple for decades.
          </div>
        </div>
        <button
          onClick={resolveScandal}
          className="w-full py-3 bg-[#ef4444] text-white font-black rounded-xl hover:bg-red-600 transition-colors"
        >
          MANAGE THE FALLOUT → CONTINUE TO 2018
        </button>
      </div>
    );
  }

  // ── BRONNY 2023 ──────────────────────────────────────────────────────────────
  if (phase === 'bronny-2023') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 5 OF 5</div>
          <h1 className="text-2xl font-black text-white">2023: The Bronny Moment</h1>
          <p className="text-[#94a3b8] text-sm">LeBron is 38. Bronny James is entering the NBA Draft. The Lakers have a roster spot. What does LeBron do?</p>
        </div>

        <div className="flex items-center gap-6 mb-6 p-3 bg-[#111827] rounded-xl border border-[#1e293b] text-sm">
          <div><div className="text-xs text-[#64748b]">Rings So Far</div><div className="text-xl">{'🏆'.repeat(career.rings) || '0'}</div></div>
          <div><div className="text-xs text-[#64748b]">Earned So Far</div><div className="text-[#f59e0b] font-bold">{formatMoney(career.earnings)}</div></div>
          <div><div className="text-xs text-[#64748b]">Legacy Score</div><div className="text-[#e2e8f0] font-bold">{Math.min(100, career.legacyScore)}/100</div></div>
        </div>

        {!isAdvanced && (
          <div className="mb-6 p-4 bg-[#2a1f00] rounded-xl border border-[#f59e0b]/30">
            <div className="text-xs text-[#f59e0b] font-bold uppercase tracking-widest mb-2">💡 The Dilemma</div>
            <p className="text-[#e2e8f0] text-sm">Bronny went undrafted in Round 1 but the Lakers have a roster spot. Playing together = making NBA history as the first father-son duo. But it costs LeBron $45M+ in salary to take the vet minimum. Is legacy worth more than money?</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 mb-6">
          {BRONNY_DECISIONS.map(decision => (
            <button
              key={decision.id}
              onClick={() => confirmBronnyDecision(decision.id)}
              className="text-left p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] hover:border-[#f59e0b] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-black text-base group-hover:text-[#f59e0b] transition-colors">{decision.label}</div>
                  <p className="text-[#94a3b8] text-sm mt-1">{decision.description}</p>
                </div>
                <div className="ml-4 text-right shrink-0">
                  <div className={`text-lg font-black ${decision.legacyChange > 10 ? 'text-[#10b981]' : decision.legacyChange > 0 ? 'text-[#f59e0b]' : 'text-[#64748b]'}`}>
                    +{decision.legacyChange} legacy
                  </div>
                  <div className={`text-xs ${decision.earningsChange >= 0 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                    {decision.earningsChange >= 0 ? '+' : ''}{formatMoney(decision.earningsChange)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  {decision.pros.map(p => <div key={p} className="text-green-400">✓ {p}</div>)}
                </div>
                <div>
                  {decision.cons.map(c => <div key={c} className="text-red-400">✗ {c}</div>)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── OUTCOME ─────────────────────────────────────────────────────────────────
  if (phase === 'outcome') {
    const totalNetWorth = career.earnings + career.portfolioValue + (career.brandValue * 5);
    const realLeBronNetWorth = 1100; // ~$1.1B
    const realLeBronRings = 4;
    const realLeBronLegacy = 92;

    // Legacy breakdown — itemize each contribution
    const legacyBreakdown = [
      { source: 'Starting legacy (baseline)', amount: 50, color: '#64748b' },
      { source: `Team choice 2010 (${career.chosenTeam2010?.city || '—'})`, amount: career.chosenTeam2010 ? career.chosenTeam2010.legacyScore - 5 : 0, color: '#3b82f6' },
      { source: `Rings from 2010 era (${career.rings > 0 ? Math.min(career.rings, 2) : 0}×8)`, amount: Math.min(career.rings, 2) * 8, color: '#f59e0b' },
      { source: `Team choice 2018 (${career.chosenTeam2018 || '—'})`, amount: career.chosenTeam2018 === 'lakers' ? 5 : 0, color: '#8b5cf6' },
      { source: 'Rings from 2018 era', amount: (career.rings > 2 ? 1 : 0) * 10, color: '#f59e0b' },
      { source: `Investment cultural impact`, amount: career.investments.reduce((s, i) => s + i.culturalImpact, 0), color: '#10b981' },
    ].filter(b => b.amount !== 0);

    const legacyGrade = career.legacyScore >= 85 ? 'A+' : career.legacyScore >= 75 ? 'A' : career.legacyScore >= 65 ? 'B+' : career.legacyScore >= 55 ? 'B' : 'C';

    if (!gradeRevealed) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-black text-white mb-2">LeBron&apos;s Final Story</h1>
          <p className="text-[#64748b] text-sm mb-8">All decisions locked in. Calculating legacy score...</p>
          <div className="text-center py-16">
            <div className="text-[#64748b] text-sm mb-6">20+ years of decisions compiled. Legacy = rings + brand + investments.</div>
            <button
              onClick={() => {
                setGradeRevealed(true);
                try {
                  const prev = JSON.parse(localStorage.getItem('bsc-completed') || '{}');
                  prev['/lebron-files'] = { completed: true, grade: legacyGrade };
                  localStorage.setItem('bsc-completed', JSON.stringify(prev));
                } catch {}
              }}
              className="px-10 py-4 bg-[#8b5cf6] text-white font-black rounded-xl text-lg hover:bg-[#7c3aed] transition-colors animate-pulse"
            >
              Reveal Legacy Score
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-2">LeBron&apos;s Final Story</h1>
        <p className="text-[#64748b] text-sm mb-8">The choices you made shaped an entire career.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: '🏆 Championship Rings', yours: career.rings, real: realLeBronRings, fmt: (v: number) => '🏆'.repeat(v) || '0' },
            { label: '💰 Total Net Worth', yours: Math.round(totalNetWorth), real: realLeBronNetWorth, fmt: (v: number) => formatMoney(v) },
            { label: '✨ Legacy Score', yours: Math.min(100, career.legacyScore), real: realLeBronLegacy, fmt: (v: number) => `${v}/100` },
            { label: '🏢 Business Empire', yours: Math.round(career.portfolioValue), real: 725, fmt: (v: number) => formatMoney(v) },
          ].map(({ label, yours, real, fmt }) => (
            <div key={label} className="p-4 bg-[#1a2035] rounded-xl border border-[#1e293b]">
              <div className="text-xs text-[#64748b] mb-3">{label}</div>
              <div className="text-xl font-black text-[#f59e0b] mb-1">{fmt(yours)}</div>
              <div className="text-xs text-[#64748b]">Real LeBron: <span className="text-[#e2e8f0]">{fmt(real)}</span></div>
              <div className="text-xs mt-1" style={{
                color: yours >= real ? '#10b981' : yours >= real * 0.7 ? '#f59e0b' : '#ef4444'
              }}>
                {yours >= real ? '✓ Matched or beat' : yours >= real * 0.7 ? '~ Close' : '✗ Below LeBron'}
              </div>
            </div>
          ))}
        </div>

        {/* Legacy Report Card */}
        <div className="p-5 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
          <div className="text-xs text-[#f59e0b] font-bold uppercase tracking-widest mb-3">📊 Legacy Score Breakdown</div>
          <div className="text-xs text-[#64748b] mb-3">Legacy = multiple compounding factors, not just rings</div>
          <div className="space-y-2">
            {legacyBreakdown.map(b => (
              <div key={b.source} className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">{b.source}</span>
                <span className="font-bold" style={{ color: b.color }}>{b.amount > 0 ? '+' : ''}{b.amount}</span>
              </div>
            ))}
            <div className="border-t border-[#1e293b] pt-2 flex items-center justify-between text-sm font-bold">
              <span className="text-white">Total Legacy Score</span>
              <span className="text-[#f59e0b]">{Math.min(100, career.legacyScore)}/100</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
          <div className="text-xs text-[#f59e0b] font-bold mb-3 uppercase tracking-widest">📰 LeBron&apos;s Real Decisions</div>
          <div className="space-y-2">
            {LEBRON_REAL_TIMELINE.map(e => (
              <div key={e.year} className="text-xs">
                <span className="text-[#f59e0b] font-bold">{e.year}:</span>{' '}
                <span className="text-[#e2e8f0]">{e.decision}</span>{' '}
                <span className="text-[#64748b]">— {e.legacyNote}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setPhase('intro'); setCareer({ chosenTeam2010: null, contractChoice2010: null, endorsements: [], extensions: [], chosenTeam2018: null, contractChoice2018: null, investments: [], rings: 0, earnings: 0, legacyScore: 50, portfolioValue: 0, brandValue: 0 }); setSelectedTeam(null); setSelectedContract(null); setSelectedEndorsements([]); setSelectedInvestments([]); setRevealedStep(false); setDecisionSubStep(0); setPendingScandal(null); setGradeRevealed(false); }}
            className="flex-1 py-3 bg-[#f59e0b] text-black font-black rounded-xl"
          >
            REPLAY
          </button>
        </div>
      </div>
    );
  }

  return null;
}
