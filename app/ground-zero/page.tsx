'use client';

import { useState } from 'react';
import {
  EXPANSION_PLAYER_POOL, FREE_AGENT_POOL, CITY_PROFILES,
  NBA_SALARY_FLOOR, EXPANSION_CAP_ALLOTMENT
} from '@/data/expansionPlayerPool';
import type { ExpansionPlayer, CityProfile } from '@/data/expansionPlayerPool';
import { formatMoneyShort } from '@/lib/CapMath';
import { HintBox } from '@/components/shared/TrackWrapper';

type Phase = 'intro' | 'city' | 'name-team' | 'expansion-draft' | 'free-agency' | 'season-sim' | 'outcome';

interface GroundZeroState {
  city: CityProfile | null;
  teamNickname: string;
  draftPicks: ExpansionPlayer[];
  rosterFA: typeof FREE_AGENT_POOL;
  totalSalary: number;
  morale: number;
  winPct: number;
  fanBase: number;
  revenue: number;
}

const CITY_NICKNAMES: Record<string, string[]> = {
  'las-vegas': ['Aces', 'High Rollers', 'Neons'],
  'seattle': ['SuperSonics', 'Kraken', 'Cascades'],
};

const PICKS_NEEDED = 12;
const BUDGET_FOR_FA = EXPANSION_CAP_ALLOTMENT;
const SEASON_MONTHS = ['October', 'November', 'December', 'January', 'February (All-Star)', 'March', 'April'];

export default function GroundZeroPage() {
  const [track, setTrack] = useState<'5-6' | '7-8'>('5-6');
  const [phase, setPhase] = useState<Phase>('intro');
  const [state, setState] = useState<GroundZeroState>({
    city: null, teamNickname: '', draftPicks: [], rosterFA: [],
    totalSalary: 0, morale: 60, winPct: 0.3, fanBase: 40, revenue: 0,
  });
  const [aiRivalPicks, setAiRivalPicks] = useState<string[]>([]);
  const [lastAiPick, setLastAiPick] = useState<ExpansionPlayer | null>(null);
  const [seasonEvents, setSeasonEvents] = useState<string[]>([]);
  const [monthlyVariance, setMonthlyVariance] = useState<number[]>([]);
  const [finalScore, setFinalScore] = useState<{ wins: number; capFlexibility: number; fanGrowth: number; aiWins: number } | null>(null);
  const [showWinFormula, setShowWinFormula] = useState(false);
  const [draftSubStep, setDraftSubStep] = useState(0);
  const [gradeRevealed, setGradeRevealed] = useState(false);

  const isAdvanced = track === '7-8';
  const availablePlayers = EXPANSION_PLAYER_POOL.filter(p => !p.isProtected && !aiRivalPicks.includes(p.id));
  const draftedIds = state.draftPicks.map(p => p.id);
  const remaningCap = BUDGET_FOR_FA
    - state.draftPicks.reduce((s, p) => s + (p.salary * 0.2), 0)
    - state.rosterFA.reduce((s, p) => s + p.salary, 0);

  const totalRoster = [...state.draftPicks, ...state.rosterFA];

  const positionCounts = totalRoster.reduce<Record<string, number>>((acc, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {});
  const missingPositions = ['PG', 'SG', 'SF', 'PF', 'C'].filter(pos => !positionCounts[pos]);

  function pickPlayer(player: ExpansionPlayer) {
    if (draftedIds.includes(player.id) || state.draftPicks.length >= PICKS_NEEDED) return;

    // AI picks the highest-rated remaining player (smart strategy — prioritizes stars)
    const remaining = availablePlayers.filter(p => !draftedIds.includes(p.id) && p.id !== player.id && !aiRivalPicks.includes(p.id));
    const aiChoice = remaining.sort((a, b) => b.rating - a.rating)[0];
    const newAiPicks = aiChoice ? [...aiRivalPicks, aiChoice.id] : aiRivalPicks;

    setState(s => ({
      ...s,
      draftPicks: [...s.draftPicks, player],
      totalSalary: s.totalSalary + player.salary * 0.2,
    }));
    setAiRivalPicks(newAiPicks);
    setLastAiPick(aiChoice || null);
  }

  function signFA(player: typeof FREE_AGENT_POOL[0]) {
    if (remaningCap - player.salary < 0) return;
    setState(s => ({
      ...s,
      rosterFA: [...s.rosterFA, player],
      totalSalary: s.totalSalary + player.salary,
    }));
  }

  function removeFA(playerId: string) {
    const player = FREE_AGENT_POOL.find(p => p.id === playerId);
    if (!player) return;
    setState(s => ({
      ...s,
      rosterFA: s.rosterFA.filter(p => p.id !== playerId),
      totalSalary: s.totalSalary - player.salary,
    }));
  }

  function simulateSeason() {
    const roster = [...state.draftPicks, ...state.rosterFA];
    const avgRating = roster.length > 0 ? roster.reduce((s, p) => s + p.rating, 0) / roster.length : 60;
    const centerCount = roster.filter(p => p.position === 'C').length;
    const posPenalty = centerCount === 0 ? 0.05 : 0;
    const winPct = Math.max(0.1, Math.min(0.85, ((avgRating - 60) / 40) * 0.7 - posPenalty));
    const cityBonus = state.city ? state.city.cultureCoefficent * 0.05 : 0;
    const fanGrowth = state.city ? (winPct * 40) + state.city.startingFanBase * 5 : 0;
    const revenue = state.city ? (state.city.revenueMultiplier * winPct * 200) : 100;

    // Pre-compute all random values to prevent re-render flickering
    const variance = SEASON_MONTHS.map(() => (Math.random() - 0.5) * 0.1);
    const aiWins = Math.round((0.32 + Math.random() * 0.18) * 82);

    const events: string[] = [];
    if (winPct > 0.55) events.push('🔥 Hot start — city buzz growing fast!');
    if (winPct < 0.35) events.push('📉 Rough start — expansion struggles expected. Lottery odds improving.');
    if (avgRating > 80) events.push('⭐ Young star emerging as franchise face — jersey sales through the roof.');
    if (roster.some(p => p.injuryRisk === 'High')) events.push('🏥 Key player went down with injury mid-season.');
    if (centerCount === 0) events.push('⚠️ No true center — interior defense struggled all year.');
    if (cityBonus > 0.05) events.push(`🏙️ ${state.city?.name} fans showing up in full force!`);
    events.push(`📊 All-Star Break record: ${Math.round(winPct * 41)}–${41 - Math.round(winPct * 41)}`);

    setState(s => ({ ...s, winPct, fanBase: s.fanBase + fanGrowth / 10, revenue }));
    setMonthlyVariance(variance);
    setSeasonEvents(events);
    setFinalScore({
      wins: Math.round(winPct * 82),
      capFlexibility: Math.round(Math.max(0, remaningCap) * 2),
      fanGrowth: Math.round(fanGrowth),
      aiWins,
    });
  }

  const ratingColor = (r: number) => r >= 85 ? '#f59e0b' : r >= 78 ? '#10b981' : r >= 72 ? '#3b82f6' : '#64748b';
  const archetypeColor: Record<string, string> = { Star: '#f59e0b', Starter: '#10b981', Rotation: '#3b82f6', Project: '#8b5cf6' };

  // INTRO
  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6 p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
          {(['5-6', '7-8'] as const).map(t => (
            <button key={t} onClick={() => setTrack(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${track === t ? 'bg-[#f59e0b] text-black' : 'bg-[#1a2035] text-[#64748b]'}`}>
              {t === '5-6' ? '5th–6th Grade' : '7th–8th (Hard)'}
            </button>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏟️</div>
          <h1 className="text-4xl font-black text-white mb-2">GROUND ZERO</h1>
          <p className="text-[#64748b] text-lg">Brand new franchise. Zero fans. Zero roster. Build it from nothing.</p>
        </div>

        {!isAdvanced && (
          <div className="mb-6 space-y-3">
            <HintBox>
              Build a brand new NBA team in 4 steps:
              <br />1. <strong>Pick your city</strong> (affects revenue and fan culture)
              <br />2. <strong>Name your team</strong> (make it yours!)
              <br />3. <strong>Expansion Draft</strong> — pick unprotected players from existing teams
              <br />4. <strong>Free Agency</strong> — fill your roster within your cap space
            </HintBox>
          </div>
        )}

        <div className="p-4 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
          <div className="text-xs text-[#64748b] font-bold mb-3 uppercase tracking-widest">How Expansion Drafts Work</div>
          <div className="space-y-2 text-sm">
            {[
              'Each existing NBA team must protect 8 players from being taken',
              'You pick unprotected players — mix Stars, Starters, and Rotation guys',
              'You MUST stay within the expansion salary cap allotment',
              'An AI rival team also picks simultaneously — compete for the best available',
            ].map((rule, i) => <div key={i} className="flex gap-2"><span className="text-[#f59e0b]">{i + 1}.</span><span className="text-[#94a3b8]">{rule}</span></div>)}
          </div>
        </div>

        <button onClick={() => setPhase('city')} className="w-full py-4 bg-[#f59e0b] text-black font-black text-xl rounded-xl">
          START — PICK YOUR CITY →
        </button>
      </div>
    );
  }

  // CITY SELECTION
  if (phase === 'city') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">STEP 1 OF 4</div>
          <h1 className="text-2xl font-black text-white">Choose Your City</h1>
          <p className="text-[#94a3b8] text-sm">Your market affects revenue, fan passion, and how quickly your fanbase grows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {CITY_PROFILES.map(city => (
            <button
              key={city.id}
              onClick={() => setState(s => ({ ...s, city, teamNickname: '' }))}
              className={`text-left p-6 rounded-xl border-2 transition-all ${state.city?.id === city.id ? 'border-[#f59e0b] bg-[#2a1f00]' : 'border-[#1e293b] bg-[#1a2035] hover:border-[#64748b]'}`}
            >
              <div className="font-black text-2xl text-white mb-1">{city.name}</div>
              <div className="text-[#64748b] text-sm mb-4">{city.arena}</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Market Size</span>
                  <span className="font-bold text-white">{city.marketSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Revenue Multiplier</span>
                  <span style={{ color: city.revenueMultiplier > 1.2 ? '#10b981' : '#f59e0b' }}>{city.revenueMultiplier}x avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Starting Fanbase</span>
                  <div className="flex">
                    {Array.from({ length: city.startingFanBase }).map((_, i) => (
                      <span key={i} className="text-[8px]" style={{ color: city.startingFanBase >= 8 ? '#10b981' : '#f59e0b' }}>★</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Win Culture Bonus</span>
                  <span className="text-[#3b82f6]">{city.cultureCoefficent}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Expansion Fee</span>
                  <span className="text-[#f59e0b] font-bold">${city.expansionFee}B</span>
                </div>
              </div>
              {!isAdvanced && (
                <div className="mt-4 pt-4 border-t border-[#1e293b] text-xs text-[#94a3b8]">
                  {city.id === 'las-vegas'
                    ? '💰 Max revenue but must build a fanbase from scratch. High ceiling, slow start.'
                    : '🔥 Passionate fans from day one — SuperSonics nostalgia is real. Strong culture bonus when you win.'}
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPhase('name-team')}
          disabled={!state.city}
          className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl disabled:opacity-40"
        >
          NAME YOUR TEAM →
        </button>
      </div>
    );
  }

  // NAME YOUR TEAM
  if (phase === 'name-team' && state.city) {
    const presets = CITY_NICKNAMES[state.city.id] || ['Express', 'United', 'FC'];
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">STEP 2 OF 4</div>
          <h1 className="text-2xl font-black text-white">Name Your Franchise</h1>
          <p className="text-[#94a3b8] text-sm">The {state.city.name} ___. Pick a nickname or type your own.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {presets.map(name => (
            <button
              key={name}
              onClick={() => setState(s => ({ ...s, teamNickname: name }))}
              className={`py-4 rounded-xl border-2 font-black text-lg transition-all ${state.teamNickname === name ? 'border-[#f59e0b] bg-[#2a1f00] text-[#f59e0b]' : 'border-[#1e293b] bg-[#1a2035] text-white hover:border-[#64748b]'}`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-2">Or type your own:</div>
          <input
            type="text"
            value={state.teamNickname}
            onChange={e => setState(s => ({ ...s, teamNickname: e.target.value }))}
            placeholder="e.g. Wolves, Kings, Surge..."
            maxLength={20}
            className="w-full bg-[#111827] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-lg font-bold placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
          />
        </div>

        {state.teamNickname && (
          <div className="p-4 bg-[#111827] rounded-xl border border-[#f59e0b]/30 mb-6 text-center">
            <div className="text-xs text-[#64748b] mb-1">YOUR FRANCHISE</div>
            <div className="text-3xl font-black text-white">{state.city.name} <span className="text-[#f59e0b]">{state.teamNickname}</span></div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setPhase('city')} className="px-6 py-3 bg-[#1a2035] text-[#64748b] font-bold rounded-xl border border-[#1e293b]">← Back</button>
          <button
            onClick={() => setPhase('expansion-draft')}
            disabled={!state.teamNickname.trim()}
            className="flex-1 py-3 bg-[#f59e0b] text-black font-black rounded-xl disabled:opacity-40"
          >
            ENTER EXPANSION DRAFT →
          </button>
        </div>
      </div>
    );
  }

  // EXPANSION DRAFT
  if (phase === 'expansion-draft') {
    // Sub-step 0: draft strategy overview
    if (draftSubStep === 0) {
      const topAvailable = [...availablePlayers].sort((a, b) => b.rating - a.rating).slice(0, 6);
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">STEP 3 · STRATEGY PREVIEW</div>
            <h1 className="text-2xl font-black text-white">Scouting the Expansion Pool</h1>
            <p className="text-[#94a3b8] text-sm">Before you pick, know who&apos;s available. The AI rival city will also be choosing simultaneously.</p>
          </div>
          {!isAdvanced && (
            <HintBox>Strategy tip: Draft 1–2 Stars first, then fill with Starters. Rotation guys come later. Remember — winning more means LOWER lottery odds for next year.</HintBox>
          )}
          <div className="mb-6 p-4 bg-[#111827] rounded-xl border border-[#1e293b]">
            <div className="text-xs text-[#64748b] uppercase tracking-widest mb-3">🏆 Top Available Players</div>
            <div className="space-y-2">
              {topAvailable.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748b] w-4">{i + 1}</span>
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[#64748b]">{p.position} · {p.team}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: archetypeColor[p.archetype] + '22', color: archetypeColor[p.archetype] }}>{p.archetype}</span>
                    <span className="font-black" style={{ color: ratingColor(p.rating) }}>{p.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Lottery explainer */}
          <div className="mb-6 p-4 bg-[#0a1628] rounded-xl border border-[#3b82f6]/30">
            <div className="text-xs font-bold text-[#3b82f6] uppercase tracking-widest mb-3">🎰 How the Lottery Works</div>
            <div className="text-xs text-[#94a3b8] mb-3">The worst records get the best lottery odds for next year&apos;s #1 draft pick. Sometimes losing now = winning later.</div>
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              {[
                { wins: '≤20W', odds: '14%', slot: '#1–2 pick' },
                { wins: '≤25W', odds: '12%', slot: '#3–5 pick' },
                { wins: '≤30W', odds: '8%', slot: '#5–7 pick' },
                { wins: '>30W', odds: '5%', slot: '#7–10 pick' },
              ].map(row => (
                <div key={row.wins} className="p-2 bg-[#111827] rounded-lg text-center">
                  <div className="text-[#3b82f6] font-bold">{row.wins}</div>
                  <div className="text-[#10b981]">{row.odds}</div>
                  <div className="text-[#64748b]">{row.slot}</div>
                </div>
              ))}
            </div>
            {!isAdvanced && <div className="mt-3 text-[10px] text-[#64748b]">If you tank this season (lose a lot), you get better odds at the next star player. But is one season of losing worth it?</div>}
          </div>
          <button onClick={() => setDraftSubStep(1)} className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#fbbf24] transition-colors">
            START EXPANSION DRAFT →
          </button>
        </div>
      );
    }

    // Sub-step 1: actual draft
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">STEP 3 OF 4</div>
            <h1 className="text-xl font-black text-white">Expansion Draft</h1>
            <p className="text-[#64748b] text-xs">{state.city?.name} <span className="text-[#f59e0b]">{state.teamNickname}</span></p>
          </div>
          <div className="text-right">
            <div className="text-[#f59e0b] font-black">{state.draftPicks.length}/{PICKS_NEEDED}</div>
            <div className="text-xs text-[#64748b]">Players picked</div>
          </div>
        </div>

        {/* AI rival reveal banner */}
        {lastAiPick && (
          <div className="mb-4 p-3 bg-[#1a0505] border border-red-800 rounded-xl text-xs">
            <span className="text-red-400 font-bold">🤖 Rival city just picked: </span>
            <span className="text-white font-bold">{lastAiPick.name}</span>
            <span className="text-[#64748b]"> (Rated {lastAiPick.rating} · {lastAiPick.position})</span>
            {aiRivalPicks.length > 0 && (() => {
              const aiAvg = aiRivalPicks.map(id => EXPANSION_PLAYER_POOL.find(p => p.id === id)?.rating || 0);
              const yourAvg = state.draftPicks.length > 0 ? state.draftPicks.reduce((s, p) => s + p.rating, 0) / state.draftPicks.length : 0;
              const rivalAvg = aiAvg.reduce((s, r) => s + r, 0) / aiAvg.length;
              return <span className="ml-2 text-[#64748b]">Their avg: <span style={{ color: rivalAvg > yourAvg ? '#ef4444' : '#10b981' }}>{rivalAvg.toFixed(0)}</span> vs yours: <span style={{ color: yourAvg >= rivalAvg ? '#10b981' : '#ef4444' }}>{yourAvg > 0 ? yourAvg.toFixed(0) : '—'}</span></span>;
            })()}
          </div>
        )}

        {!isAdvanced && (
          <HintBox>
            Click a player to pick them. The AI rival team picks right after you. Mix Stars with solid Starters and Rotation guys. You need exactly {PICKS_NEEDED} players.
          </HintBox>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="text-xs text-[#64748b] mb-2 uppercase tracking-widest">Available Players (unprotected)</div>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
              {availablePlayers
                .filter(p => !draftedIds.includes(p.id))
                .sort((a, b) => b.rating - a.rating)
                .map(player => {
                  const isPicked = draftedIds.includes(player.id);
                  const aiPicked = aiRivalPicks.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      onClick={() => !isPicked && !aiPicked && pickPlayer(player)}
                      disabled={isPicked || aiPicked || state.draftPicks.length >= PICKS_NEEDED}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-all disabled:opacity-50 ${aiPicked ? 'bg-red-900/10 border-red-800' : isPicked ? 'bg-green-900/20 border-green-700' : 'bg-[#111827] border-[#1e293b] hover:border-[#f59e0b] cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#64748b] w-6">{player.position}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{player.name}</div>
                          <div className="text-xs text-[#64748b]">{player.team} · Age {player.age}</div>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: archetypeColor[player.archetype] + '22', color: archetypeColor[player.archetype] }}>{player.archetype}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-black" style={{ color: ratingColor(player.rating) }}>{player.rating}</span>
                        <span className="text-[#f59e0b]">{formatMoneyShort(player.salary)}</span>
                        {aiPicked && <span className="text-red-400 text-xs">AI TOOK</span>}
                        {isPicked && <span className="text-green-400 text-xs">✓ YOURS</span>}
                        {isAdvanced && (
                          <span style={{ color: player.injuryRisk === 'High' ? '#ef4444' : player.injuryRisk === 'Medium' ? '#f59e0b' : '#10b981' }}>
                            {player.injuryRisk[0]}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#64748b] mb-2 uppercase tracking-widest">Your Draft Picks</div>
            <div className="space-y-1.5 mb-4">
              {state.draftPicks.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-green-900/20 border border-green-700 rounded-lg text-xs">
                  <span className="text-white font-medium">{p.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#64748b]">{p.position}</span>
                    <span style={{ color: ratingColor(p.rating) }}>{p.rating}</span>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, PICKS_NEEDED - state.draftPicks.length) }).map((_, i) => (
                <div key={i} className="p-2 border border-dashed border-[#1e293b] rounded-lg text-xs text-[#64748b] text-center">— open slot —</div>
              ))}
            </div>

            <div className="text-xs text-[#64748b] mb-4">AI Rival picked: {aiRivalPicks.length} players</div>

            {state.draftPicks.length === PICKS_NEEDED && (
              <button onClick={() => setPhase('free-agency')} className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl">
                GO TO FREE AGENCY →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FREE AGENCY
  if (phase === 'free-agency') {
    const atFloor = state.totalSalary >= NBA_SALARY_FLOOR;
    const signedFAIds = state.rosterFA.map(p => p.id);

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-4">
          <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">STEP 4 OF 4</div>
          <h1 className="text-xl font-black text-white">Free Agency</h1>
          <p className="text-[#64748b] text-xs">{state.city?.name} <span className="text-[#f59e0b]">{state.teamNickname}</span></p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-3 text-center">
            <div className={`text-lg font-black ${remaningCap > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{formatMoneyShort(Math.max(0, remaningCap))}</div>
            <div className="text-xs text-[#64748b]">Cap Space Left</div>
          </div>
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-3 text-center">
            <div className="text-lg font-black text-white">{totalRoster.length}</div>
            <div className="text-xs text-[#64748b]">Players on Roster</div>
          </div>
          <div className={`bg-[#111827] rounded-xl border p-3 text-center ${atFloor ? 'border-[#10b981]' : 'border-[#ef4444]'}`}>
            <div className={`text-lg font-black ${atFloor ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{atFloor ? '✓ FLOOR MET' : '✗ BELOW FLOOR'}</div>
            <div className="text-xs text-[#64748b]">Min: {formatMoneyShort(NBA_SALARY_FLOOR)}</div>
          </div>
        </div>

        {missingPositions.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-xl text-xs space-y-1">
            <div className="text-yellow-400 font-bold">⚠️ Missing positions: {missingPositions.join(', ')}</div>
            {missingPositions.includes('C') && (
              <div className="text-[#94a3b8]">No Center: <span className="text-[#ef4444]">–5% win rate</span> = <span className="text-[#ef4444]">~4 fewer wins</span> this season</div>
            )}
            {missingPositions.filter(p => p !== 'C').map(pos => (
              <div key={pos} className="text-[#94a3b8]">No {pos}: lineup gaps hurt defensive rotations and scoring efficiency</div>
            ))}
          </div>
        )}

        {!isAdvanced && !atFloor && (
          <HintBox>
            You need to spend at least {formatMoneyShort(NBA_SALARY_FLOOR)} on salaries (the salary floor). Sign more players until you hit that number.
          </HintBox>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-[#64748b] mb-2 uppercase tracking-widest">Free Agents Available</div>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {FREE_AGENT_POOL.filter(p => !signedFAIds.includes(p.id)).map(player => {
                const canSign = remaningCap >= player.salary;
                return (
                  <button
                    key={player.id}
                    onClick={() => canSign && signFA(player)}
                    disabled={!canSign}
                    className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-all ${canSign ? 'bg-[#111827] border-[#1e293b] hover:border-[#f59e0b] cursor-pointer' : 'opacity-40 cursor-not-allowed bg-[#111827] border-[#1e293b]'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#64748b] w-6">{player.position}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{player.name}</div>
                        <span className="text-xs" style={{ color: archetypeColor[player.archetype] }}>{player.archetype}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span style={{ color: ratingColor(player.rating) }}>{player.rating} OVR</span>
                      <span className="text-[#f59e0b] font-bold">{formatMoneyShort(player.salary)}/yr</span>
                      {!canSign && <span className="text-red-400">Over budget</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#64748b] mb-2 uppercase tracking-widest">Your Full Roster ({totalRoster.length})</div>

            {/* Position balance */}
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {['PG', 'SG', 'SF', 'PF', 'C'].map(pos => (
                <span
                  key={pos}
                  className={`text-xs px-2 py-0.5 rounded-full font-bold border ${positionCounts[pos] ? 'border-[#10b981] text-[#10b981] bg-green-900/20' : 'border-[#ef4444] text-[#ef4444] bg-red-900/10'}`}
                >
                  {pos} {positionCounts[pos] ? '✓' : '✗'}
                </span>
              ))}
            </div>

            {/* Win% formula tooltip */}
            <button onClick={() => setShowWinFormula(f => !f)} className="text-xs text-[#64748b] hover:text-[#f59e0b] underline mb-2 transition-colors">
              {showWinFormula ? '▲ Hide win% formula' : '▼ How is win% calculated?'}
            </button>
            {showWinFormula && (
              <div className="mb-3 p-3 bg-[#111827] rounded-lg text-xs space-y-1.5">
                <div className="text-[#f59e0b] font-bold">Win% Formula:</div>
                <div className="font-mono text-[#e2e8f0]">Win% = ((AvgRating – 60) ÷ 40) × 0.7 – PosPenalty</div>
                {!isAdvanced && (
                  <div className="space-y-1 text-[#94a3b8] mt-1">
                    <div>League average rating is ~72. Rating 60 = 0.1 win%, Rating 100 = 0.7 win%</div>
                    <div className="grid grid-cols-4 gap-1 mt-2 text-[10px]">
                      {[{ r: 65, w: '~30W' }, { r: 70, w: '~40W' }, { r: 75, w: '~50W' }, { r: 80, w: '~60W' }].map(({ r, w }) => (
                        <div key={r} className="bg-[#0a0e1a] rounded p-1 text-center">
                          <div className="text-white font-bold">{r} Rtg</div>
                          <div className="text-[#10b981]">{w}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[#ef4444]">No Center penalty: –5% win% = ~4 fewer wins</div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
              {state.draftPicks.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-[#111827] rounded-lg text-xs border border-[#1e293b]">
                  <span className="text-[#64748b] mr-2">{p.position}</span>
                  <span className="text-white flex-1">{p.name}</span>
                  <span style={{ color: ratingColor(p.rating) }}>{p.rating}</span>
                  <span className="text-[#f59e0b] ml-2">{formatMoneyShort(p.salary * 0.2)}</span>
                  <span className="text-xs text-[#64748b] ml-2">Draft pick</span>
                </div>
              ))}
              {state.rosterFA.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-green-900/10 rounded-lg text-xs border border-green-800">
                  <span className="text-[#64748b] mr-2">{p.position}</span>
                  <span className="text-white flex-1">{p.name}</span>
                  <span style={{ color: ratingColor(p.rating) }}>{p.rating}</span>
                  <span className="text-[#f59e0b] ml-2">{formatMoneyShort(p.salary)}</span>
                  <button onClick={() => removeFA(p.id)} className="ml-2 text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
            </div>

            {!atFloor && (
              <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
                Must reach salary floor ({formatMoneyShort(NBA_SALARY_FLOOR)}) before starting the season.
              </div>
            )}

            <button
              onClick={() => { simulateSeason(); setPhase('season-sim'); }}
              disabled={totalRoster.length < 8 || !atFloor}
              className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl disabled:opacity-40"
            >
              START SEASON SIM →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SEASON SIM
  if (phase === 'season-sim' && finalScore) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-white mb-1">Year 1 Season Simulation</h1>
        <p className="text-[#64748b] text-sm mb-6">{state.city?.name} <span className="text-[#f59e0b]">{state.teamNickname}</span> — First Season</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-4 text-center">
            <div className="text-4xl font-black text-[#f59e0b]">{finalScore.wins}</div>
            <div className="text-[#64748b] text-sm">Projected Wins</div>
            <div className="text-xs text-[#64748b] mt-1">{82 - finalScore.wins} losses</div>
          </div>
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-4 text-center">
            <div className="text-4xl font-black text-[#10b981]">{finalScore.fanGrowth}%</div>
            <div className="text-[#64748b] text-sm">Fan Base Growth</div>
          </div>
        </div>

        <div className="p-4 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
          <div className="text-xs font-bold text-[#64748b] mb-3 uppercase tracking-widest">Month-by-Month Record</div>
          <div className="space-y-2">
            {SEASON_MONTHS.map((month, i) => {
              const monthWinPct = Math.max(0.05, Math.min(0.95, state.winPct + (monthlyVariance[i] || 0)));
              const monthW = Math.round(monthWinPct * 12);
              const monthL = 12 - monthW;
              return (
                <div key={month} className="flex items-center gap-3 text-sm">
                  <span className="text-[#64748b] w-36 text-xs">{month}</span>
                  <div className="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: `${monthWinPct * 100}%` }} />
                  </div>
                  <span className="text-white text-xs w-16">{monthW}–{monthL}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
          <div className="text-xs font-bold text-[#64748b] mb-3 uppercase tracking-widest">Season Events</div>
          <div className="space-y-2">
            {seasonEvents.map((event, i) => (
              <div key={i} className="text-sm text-[#e2e8f0]">{event}</div>
            ))}
          </div>
        </div>

        <button onClick={() => setPhase('outcome')} className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl">
          SEE FINAL OUTCOME →
        </button>
      </div>
    );
  }

  // OUTCOME
  if (phase === 'outcome' && finalScore) {
    const aiWins = finalScore.aiWins;
    const overall = Math.round((finalScore.wins / 82 * 100 + Math.min(100, finalScore.capFlexibility) + Math.min(100, finalScore.fanGrowth)) / 3);
    const beat = finalScore.wins > aiWins;
    const year2ExpiredSalary = state.rosterFA.reduce((s, p) => s + p.salary, 0);
    const year2CapSpace = Math.max(0, remaningCap + Math.max(0, year2ExpiredSalary - 10));

    // Conference standing context (both cities are Western Conference)
    const westPlayoffLine = 44;
    const playIn = finalScore.wins >= 38 && finalScore.wins < westPlayoffLine;
    const madePlayoffs = finalScore.wins >= westPlayoffLine;
    const lotteryBound = finalScore.wins < 38;
    const lotteryOdds = lotteryBound
      ? finalScore.wins <= 20 ? '14%' : finalScore.wins <= 25 ? '12%' : finalScore.wins <= 30 ? '8%' : '5%'
      : null;
    const lotterySlot = lotteryBound
      ? finalScore.wins <= 20 ? '#1–2' : finalScore.wins <= 25 ? '#3–5' : finalScore.wins <= 30 ? '#5–7' : '#7–10'
      : null;

    const outcomeBadge = beat ? 'W' : 'L';

    if (!gradeRevealed) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-black text-white mb-1">Franchise Verdict</h1>
          <p className="text-[#64748b] text-sm mb-6">{state.city?.name} <span className="text-[#f59e0b]">{state.teamNickname}</span> · Year 1</p>
          <div className="text-center py-16">
            <div className="text-[#64748b] text-sm mb-6">Season complete. Tallying wins, cap flexibility, and fan growth...</div>
            <button
              onClick={() => {
                setGradeRevealed(true);
                try {
                  const prev = JSON.parse(localStorage.getItem('bsc-completed') || '{}');
                  prev['/ground-zero'] = { completed: true, grade: outcomeBadge };
                  localStorage.setItem('bsc-completed', JSON.stringify(prev));
                } catch {}
              }}
              className="px-10 py-4 bg-[#10b981] text-black font-black rounded-xl text-lg hover:bg-[#059669] transition-colors animate-pulse"
            >
              Reveal Season Results
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-1">Franchise Verdict</h1>
        <p className="text-[#64748b] text-sm mb-6">{state.city?.name} <span className="text-[#f59e0b]">{state.teamNickname}</span> · Year 1</p>

        <div className={`p-6 rounded-xl border-2 mb-6 text-center ${beat ? 'border-[#10b981] bg-green-900/10' : 'border-[#f59e0b] bg-yellow-900/10'}`}>
          <div className="text-5xl font-black mb-2" style={{ color: beat ? '#10b981' : '#f59e0b' }}>
            {beat ? '🏆 YOU WIN' : '📉 AI WINS'}
          </div>
          <div className="text-[#e2e8f0]">Your team: <strong>{finalScore.wins} wins</strong> vs AI rival: <strong>{aiWins} wins</strong></div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Season Wins', value: finalScore.wins, max: 82, unit: 'W' },
            { label: 'Cap Flexibility', value: Math.min(100, finalScore.capFlexibility), max: 100, unit: '' },
            { label: 'Fan Growth', value: Math.min(100, finalScore.fanGrowth), max: 100, unit: '%' },
          ].map(({ label, value, max, unit }) => (
            <div key={label} className="bg-[#1a2035] rounded-xl border border-[#1e293b] p-4 text-center">
              <div className="text-2xl font-black" style={{ color: value / max >= 0.6 ? '#10b981' : '#f59e0b' }}>{value}{unit}</div>
              <div className="text-sm font-bold text-white">{label}</div>
              <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Conference Standing Context */}
        <div className="p-4 bg-[#111827] rounded-xl border border-[#1e293b] mb-4">
          <div className="text-xs font-bold text-[#64748b] mb-3 uppercase tracking-widest">📊 Western Conference Standing</div>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: madePlayoffs ? '#10b981' : playIn ? '#f59e0b' : '#ef4444' }}>
                {finalScore.wins}–{82 - finalScore.wins}
              </div>
              <div className="text-xs text-[#64748b]">Your Record</div>
            </div>
            <div className="flex-1 text-sm">
              {madePlayoffs && <div className="text-[#10b981] font-bold">✓ Automatic playoff berth — top 6 in the West</div>}
              {playIn && <div className="text-[#f59e0b] font-bold">⚡ Play-In Tournament (7–10 seed) — one game to make the playoffs</div>}
              {lotteryBound && <div className="text-[#ef4444] font-bold">📉 Lottery bound — {lotterySlot} pick odds: {lotteryOdds} chance at #1</div>}
            </div>
          </div>
          {/* Mini standings */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { label: 'West Playoff Line', wins: 44, desc: 'Top 6 auto qualify' },
              { label: 'Play-In Line', wins: 38, desc: '7–10 seeds compete' },
              { label: 'Top Draft Pick', wins: 25, desc: 'Best lottery odds' },
            ].map(s => (
              <div key={s.label} className="p-2 bg-[#0a0e1a] rounded-lg">
                <div className="font-bold text-white">{s.wins} W</div>
                <div className="text-[#64748b]">{s.label}</div>
                <div className="text-[#64748b] text-[10px] mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
          {lotteryBound && (
            <div className="mt-3 p-2 bg-[#ef4444]/10 rounded-lg border border-[#ef4444]/20 text-xs text-[#94a3b8]">
              <span className="text-[#f59e0b] font-bold">Silver lining:</span> A high lottery pick could land your franchise cornerstone. Year 2 rebuild accelerated.
            </div>
          )}
        </div>

        {/* Year 2 Cap Projection */}
        <div className="p-4 bg-[#111827] rounded-xl border border-[#1e293b] mb-4">
          <div className="text-xs font-bold text-[#64748b] mb-3 uppercase tracking-widest">📊 Year 2 Cap Outlook</div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="p-2 bg-[#0a0e1a] rounded-lg">
              <div className="text-xs text-[#64748b]">Expiring contracts</div>
              <div className="text-[#f59e0b] font-bold">{formatMoneyShort(year2ExpiredSalary)}</div>
            </div>
            <div className="p-2 bg-[#0a0e1a] rounded-lg">
              <div className="text-xs text-[#64748b]">Projected cap space Y2</div>
              <div className="text-[#10b981] font-bold">{formatMoneyShort(year2CapSpace)}</div>
            </div>
          </div>
          <div className="text-[#94a3b8] text-xs leading-relaxed">
            {year2CapSpace > 20
              ? '✓ Strong cap space heading into Year 2. You can sign a difference-maker in free agency.'
              : '⚠️ Limited cap space in Year 2 — focus on developing your young draft picks.'}{' '}
            {finalScore.wins > 35
              ? '✓ Playoff contention possible in Year 2 with one more piece.'
              : '📊 Lottery bound — a high pick could accelerate the rebuild.'}
          </div>
        </div>

        <button
          onClick={() => {
            setPhase('intro');
            setState({ city: null, teamNickname: '', draftPicks: [], rosterFA: [], totalSalary: 0, morale: 60, winPct: 0.3, fanBase: 40, revenue: 0 });
            setAiRivalPicks([]);
            setFinalScore(null);
            setSeasonEvents([]);
            setMonthlyVariance([]);
            setGradeRevealed(false);
          }}
          className="w-full py-3 bg-[#f59e0b] text-black font-black rounded-xl"
        >
          BUILD ANOTHER FRANCHISE
        </button>
      </div>
    );
  }

  return null;
}
