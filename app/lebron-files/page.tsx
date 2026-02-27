'use client';

import { useState } from 'react';
import {
  TEAM_OPTIONS_2010, CONTRACT_OPTIONS, ENDORSEMENT_DEALS, INVESTMENT_OPTIONS,
  LEBRON_REAL_TIMELINE, type TeamOption, type EndorsementDeal, type InvestmentOption
} from '@/data/lebronCareerData';
import { formatMoney } from '@/lib/CapMath';
import { HintBox } from '@/components/shared/TrackWrapper';

type Phase = 'intro' | 'decision-2010' | 'decision-extension' | 'decision-2018' | 'investments' | 'outcome';

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

  const isAdvanced = track === '7-8';

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
    setRevealedStep(false);
    setPhase('decision-extension');
  }

  function confirmEndorsements() {
    const deals = ENDORSEMENT_DEALS.filter(d => selectedEndorsements.includes(d.id));
    const totalEndorsementValue = deals.reduce((s, d) => s + d.baseValue * 8, 0);
    const brandValue = deals.reduce((s, d) => s + d.fitScore * 10, 0);
    setCareer(c => ({
      ...c,
      endorsements: deals,
      earnings: c.earnings + totalEndorsementValue,
      brandValue: c.brandValue + brandValue,
    }));
    setRevealedStep(false);
    setPhase('decision-2018');
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
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 1 OF 4</div>
          <h1 className="text-2xl font-black text-white">2010 Free Agency: The Decision</h1>
          <p className="text-[#94a3b8] text-sm">LeBron has finished his rookie deal in Cleveland. 6 teams want him. Where does he go?</p>
        </div>

        {!isAdvanced && (
          <HintBox>
            Look at Championship Odds, Max Salary, and Market Size. They don&apos;t all point to the same answer — that&apos;s the point. What does LeBron value most?
          </HintBox>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {TEAM_OPTIONS_2010.map(team => (
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
                  <span className="font-bold" style={{ color: team.champOdds > 0.5 ? '#10b981' : team.champOdds > 0.2 ? '#f59e0b' : '#ef4444' }}>
                    {(team.champOdds * 100).toFixed(0)}%
                  </span>
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
          ))}
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

        {selectedTeam && selectedContract && (
          <button
            onClick={confirmTeamChoice2010}
            className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#fbbf24] transition-colors"
          >
            LOCK IN DECISION →
          </button>
        )}
      </div>
    );
  }

  // ── DECISION EXTENSION (Endorsements) ──────────────────────────────────────
  if (phase === 'decision-extension') {
    const team = career.chosenTeam2010;
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 2 OF 4</div>
          <h1 className="text-2xl font-black text-white">Build LeBron&apos;s Brand</h1>
          <p className="text-[#94a3b8] text-sm">While playing for {team?.city}, companies are lining up. Choose wisely — some deals conflict.</p>
        </div>

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
            return (
              <button
                key={deal.id}
                onClick={() => !maxReached && setSelectedEndorsements(prev => isSelected ? prev.filter(x => x !== deal.id) : [...prev, deal.id])}
                disabled={maxReached}
                className={`text-left p-4 rounded-xl border-2 transition-all disabled:opacity-40 ${isSelected ? 'border-[#f59e0b] bg-[#2a1f00]' : 'border-[#1e293b] bg-[#1a2035] hover:border-[#64748b]'}`}
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
          {teams2018.map(team => (
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
                  <span className="font-bold" style={{ color: team.champOdds > 0.45 ? '#10b981' : team.champOdds > 0.25 ? '#f59e0b' : '#ef4444' }}>
                    {(team.champOdds * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">💰 Max Offer</span>
                  <span className="text-[#f59e0b] font-bold">${team.maxSalary.toFixed(0)}M</span>
                </div>
                {!isAdvanced && <div className="text-[#94a3b8] mt-2 border-t border-[#1e293b] pt-2">{team.youngCore}</div>}
              </div>
            </button>
          ))}
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

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">PHASE 4 OF 4</div>
          <h1 className="text-2xl font-black text-white">Build the Empire</h1>
          <p className="text-[#94a3b8] text-sm">LeBron has earned big. Now where does he invest? Real investments, real returns.</p>
        </div>

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

  // ── OUTCOME ─────────────────────────────────────────────────────────────────
  if (phase === 'outcome') {
    const totalNetWorth = career.earnings + career.portfolioValue + (career.brandValue * 5);
    const realLeBronNetWorth = 1100; // ~$1.1B
    const realLeBronRings = 4;
    const realLeBronLegacy = 92;

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
            onClick={() => { setPhase('intro'); setCareer({ chosenTeam2010: null, contractChoice2010: null, endorsements: [], extensions: [], chosenTeam2018: null, contractChoice2018: null, investments: [], rings: 0, earnings: 0, legacyScore: 50, portfolioValue: 0, brandValue: 0 }); setSelectedTeam(null); setSelectedContract(null); setSelectedEndorsements([]); setSelectedInvestments([]); }}
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
