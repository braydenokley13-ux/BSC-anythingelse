'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ROOKIE_SCALE,
  PLAYER_PROFILES,
  SHOE_DEALS,
  EXTENSION_OFFERS,
  HISTORICAL_COMPARISONS,
  type PlayerProfile,
  type ShoeDeal,
  type ExtensionOffer,
} from '../../data/rookieContractData';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase =
  | 'intro'
  | 'draft-night'    // Stage 1: Pick slot revealed
  | 'shoe-deal'      // Stage 2: Choose shoe brand
  | 'year3-review'   // Stage 3: Performance revealed, stats shown
  | 'extension'      // Stage 4: Extension or FA decision
  | 'outcome';       // Stage 5: Career trajectory + grade

interface CareerState {
  pickSlot: number | null;
  profile: PlayerProfile | null;
  shoeDeal: ShoeDeal | null;
  year3Stats: {
    ppg: number;
    rpg: number;
    apg: number;
    fg: number;
    performanceScore: number; // 0-100
    tier: 'elite' | 'good' | 'average';
  } | null;
  extensionChoice: ExtensionOffer | null;
  totalEarnings: number; // millions
  brandValue: number; // 1-100
  rings: number;
  legacyScore: number; // 1-100
}

// ─── Helper: format money ─────────────────────────────────────────────────────

function fmt(millions: number): string {
  if (millions >= 1000) return `$${(millions / 1000).toFixed(1)}B`;
  return `$${millions.toFixed(1)}M`;
}

function gradeFromScore(score: number): { grade: string; label: string; color: string } {
  if (score >= 90) return { grade: 'A+', label: 'Hall of Famer Trajectory', color: '#f59e0b' };
  if (score >= 80) return { grade: 'A',  label: 'Franchise Cornerstone',    color: '#10b981' };
  if (score >= 70) return { grade: 'B+', label: 'Perennial All-Star',        color: '#3b82f6' };
  if (score >= 60) return { grade: 'B',  label: 'Solid Starter',             color: '#8b5cf6' };
  if (score >= 50) return { grade: 'C+', label: 'Role Player',               color: '#64748b' };
  return { grade: 'C', label: 'Journeyman', color: '#ef4444' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhaseHeader({ step, label }: { step: number; label: string }) {
  const steps = ['Draft Night', 'Shoe Deal', 'Year 3 Review', 'Extension', 'Outcome'];
  return (
    <div className="mb-8">
      <div className="flex gap-2 mb-4">
        {steps.map((s, i) => (
          <div
            key={s}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i < step ? '#f59e0b' : i === step ? '#f59e0b80' : '#1e293b' }}
          />
        ))}
      </div>
      <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest">
        Stage {step + 1} of 5 — {label}
      </div>
    </div>
  );
}

function StatBar({ label, value, max, color = '#f59e0b' }: { label: string; value: number; max: number; color?: string }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-[#64748b] mb-1">
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RookieDealPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [gradeRevealed, setGradeRevealed] = useState(false);
  const [career, setCareer] = useState<CareerState>({
    pickSlot: null,
    profile: null,
    shoeDeal: null,
    year3Stats: null,
    extensionChoice: null,
    totalEarnings: 0,
    brandValue: 0,
    rings: 0,
    legacyScore: 50,
  });

  // ── Stage 1: Draft Night ───────────────────────────────────────────────────

  function selectPick(pick: number, profile: PlayerProfile) {
    const scale = ROOKIE_SCALE.find(r => r.pick === pick)!;
    setCareer(c => ({
      ...c,
      pickSlot: pick,
      profile,
      totalEarnings: scale.totalGuaranteed,
    }));
    setPhase('shoe-deal');
  }

  // ── Stage 2: Shoe Deal ────────────────────────────────────────────────────

  function selectShoeDeal(shoe: ShoeDeal) {
    setCareer(c => ({
      ...c,
      shoeDeal: shoe,
      totalEarnings: c.totalEarnings + shoe.guaranteedValue,
      brandValue: shoe.brandMultiplier * 20,
    }));
    setPhase('year3-review');
  }

  // ── Stage 3: Year 3 Review ────────────────────────────────────────────────

  const year3Stats = useMemo(() => {
    if (!career.profile) return null;
    const { baseStats, variance, starPotential } = career.profile;
    // Deterministic "random" based on profile's inherent traits
    const seed = starPotential / 100;
    const swing = (seed - 0.5) * variance;
    const ppg = Math.max(5, +(baseStats.ppg + swing).toFixed(1));
    const rpg = Math.max(1, +(baseStats.rpg + swing * 0.3).toFixed(1));
    const apg = Math.max(0, +(baseStats.apg + swing * 0.4).toFixed(1));
    const fg  = Math.min(65, Math.max(35, +(baseStats.fg + swing * 0.2).toFixed(1)));
    const score = Math.min(100, Math.round(
      (ppg / 35) * 40 +
      (rpg / 12) * 15 +
      (apg / 12) * 15 +
      (fg  / 65) * 15 +
      seed * 15
    ));
    const tier: 'elite' | 'good' | 'average' =
      score >= 75 ? 'elite' : score >= 50 ? 'good' : 'average';
    return { ppg, rpg, apg, fg, performanceScore: score, tier };
  }, [career.profile]);

  function revealYear3() {
    if (!year3Stats) return;
    setCareer(c => ({ ...c, year3Stats: year3Stats }));
    setPhase('extension');
  }

  // ── Stage 4: Extension / FA ───────────────────────────────────────────────

  function selectExtension(ext: ExtensionOffer) {
    if (!career.profile || !career.shoeDeal || !career.year3Stats) return;
    const shoe = career.shoeDeal;
    const y3 = career.year3Stats;

    // Bonus shoe earnings if All-Star tier
    const shoeBonus = y3.tier === 'elite'
      ? shoe.guaranteedValue * (shoe.upsidePct / 100)
      : 0;

    // Legacy: rings guess based on extension choice
    const rings = ext.id === 'supermax' ? 2
      : ext.id === 'max-extension' ? 1
      : ext.id === 'bet-on-yourself' ? 1
      : 0;

    // Legacy computation
    const legacy = Math.min(100, Math.round(
      career.legacyScore +
      (y3.performanceScore * 0.3) +
      (rings * 10) +
      (shoe.brandMultiplier * 5) -
      (ext.id === 'team-option-year4' ? 10 : 0)
    ));

    setCareer(c => ({
      ...c,
      extensionChoice: ext,
      totalEarnings: c.totalEarnings + ext.totalValue + shoeBonus,
      rings,
      legacyScore: legacy,
    }));
    setPhase('outcome');
  }

  // ── Outcome score ─────────────────────────────────────────────────────────

  const finalScore = useMemo(() => {
    if (!career.year3Stats || !career.extensionChoice || !career.profile) return 0;
    const earningsScore  = Math.min(40, (career.totalEarnings / 500) * 40);
    const performanceScore = (career.year3Stats.performanceScore / 100) * 30;
    const legacyScore    = (career.legacyScore / 100) * 20;
    const ringsScore     = Math.min(10, career.rings * 5);
    return Math.round(earningsScore + performanceScore + legacyScore + ringsScore);
  }, [career]);

  // ── Historical comp ───────────────────────────────────────────────────────

  const historicalComp = useMemo(() => {
    return HISTORICAL_COMPARISONS.find(h => h.pickSlot === career.pickSlot);
  }, [career.pickSlot]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  function reset() {
    setPhase('intro');
    setGradeRevealed(false);
    setCareer({
      pickSlot: null, profile: null, shoeDeal: null, year3Stats: null,
      extensionChoice: null, totalEarnings: 0, brandValue: 0, rings: 0, legacyScore: 50,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-[#64748b] hover:text-white text-sm transition-colors">
            ← Back to Hub
          </Link>
          <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest">
            The Rookie Deal
          </div>
          {phase !== 'intro' && (
            <button onClick={reset} className="text-xs text-[#64748b] hover:text-[#ef4444] transition-colors">
              Start Over
            </button>
          )}
        </div>

        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <div className="text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h1 className="text-4xl font-black text-white mb-4">The Rookie Deal</h1>
            <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto mb-4">
              You're the agent for a top-5 NBA draft pick. Navigate the biggest financial decisions of your client's young career.
            </p>
            <p className="text-[#64748b] text-sm max-w-xl mx-auto mb-10">
              Every rookie's salary is locked by the CBA rookie scale — but you control shoe deals, extensions, and whether to bet on free agency. Make smart decisions to maximize your client's career value.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { emoji: '📋', title: 'Stage 1–2', desc: 'Draft Night + Shoe Deal — Choose your player and first big endorsement.' },
                { emoji: '📊', title: 'Stage 3–4', desc: 'Year 3 Performance — Stats revealed. Extension or bet on free agency?' },
                { emoji: '🏆', title: 'Stage 5',   desc: 'Career Outcome — Total earnings, legacy score, and historical comparison.' },
              ].map(s => (
                <div key={s.title} className="p-5 bg-[#1a2035] rounded-xl border border-[#1e293b]">
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <div className="text-sm font-bold text-white mb-1">{s.title}</div>
                  <div className="text-xs text-[#94a3b8]">{s.desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase('draft-night')}
              className="px-10 py-4 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#d97706] transition-colors"
            >
              It's Draft Night →
            </button>
          </div>
        )}

        {/* ── STAGE 1: DRAFT NIGHT ── */}
        {phase === 'draft-night' && (
          <div>
            <PhaseHeader step={0} label="Draft Night" />
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">Who's Your Client?</h2>
              <p className="text-[#94a3b8] text-sm">
                Choose a player profile and pick slot. Higher picks = bigger rookie scale salary (set by the CBA — you can't negotiate this part). But personality, position, and potential all matter for what comes next.
              </p>
            </div>

            {/* Rookie scale reference */}
            <div className="mb-6 p-4 bg-[#111827] rounded-xl border border-[#1e293b]">
              <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest mb-3">2024 Rookie Scale (CBA-Fixed)</div>
              <div className="grid grid-cols-5 gap-2">
                {ROOKIE_SCALE.map(slot => (
                  <div key={slot.pick} className="text-center p-2 bg-[#0a0e1a] rounded-lg">
                    <div className="text-xs text-[#64748b] mb-1">Pick #{slot.pick}</div>
                    <div className="text-sm font-bold text-[#f59e0b]">{fmt(slot.year1Salary)}/yr</div>
                    <div className="text-xs text-[#64748b]">{fmt(slot.totalGuaranteed)} total</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLAYER_PROFILES.map((profile, i) => {
                const pick = i + 1;
                const scale = ROOKIE_SCALE[i];
                return (
                  <button
                    key={profile.id}
                    onClick={() => selectPick(pick, profile)}
                    className="text-left p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] hover:border-[#f59e0b]/50 transition-all hover:scale-[1.01] group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 rounded-full font-bold">
                            #{pick} Pick
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-[#1e293b] text-[#64748b] rounded-full">{profile.position}</span>
                        </div>
                        <h3 className="text-lg font-black text-white group-hover:text-[#f59e0b] transition-colors">{profile.name}</h3>
                        <div className="text-xs text-[#64748b]">{profile.college} · Age {profile.age}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#10b981]">{fmt(scale.year1Salary)}/yr</div>
                        <div className="text-xs text-[#64748b]">{fmt(scale.totalGuaranteed)} guaranteed</div>
                      </div>
                    </div>

                    <p className="text-xs text-[#94a3b8] mb-3 leading-relaxed">{profile.description}</p>

                    <div className="grid grid-cols-4 gap-1 mb-3 text-center">
                      {[
                        { label: 'PPG', val: profile.baseStats.ppg },
                        { label: 'RPG', val: profile.baseStats.rpg },
                        { label: 'APG', val: profile.baseStats.apg },
                        { label: 'FG%', val: profile.baseStats.fg },
                      ].map(s => (
                        <div key={s.label} className="bg-[#0a0e1a] rounded-lg p-1.5">
                          <div className="text-sm font-bold text-white">{s.val}</div>
                          <div className="text-xs text-[#64748b]">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="text-xs text-[#64748b] mb-1">Star Potential</div>
                        <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                          <div className="h-full bg-[#8b5cf6] rounded-full" style={{ width: `${profile.starPotential}%` }} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-[#64748b] mb-1">Variance (Risk)</div>
                        <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                          <div className="h-full bg-[#ef4444] rounded-full" style={{ width: `${(profile.variance / 20) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-[#64748b] italic">{profile.realWorldComparison}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STAGE 2: SHOE DEAL ── */}
        {phase === 'shoe-deal' && career.profile && career.pickSlot && (
          <div>
            <PhaseHeader step={1} label="Shoe Deal" />
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs px-2 py-1 bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 rounded-full font-bold">
                  #{career.pickSlot} Overall Pick
                </div>
                <span className="text-white font-bold">{career.profile.name}</span>
                <span className="text-[#64748b] text-sm">· {career.profile.position}</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">The Shoe War</h2>
              <p className="text-[#94a3b8] text-sm">
                Every top pick gets a shoe deal offer. Nike, Adidas, and New Balance are all at the table. This is more than money — it's brand identity for the next decade. Choose wisely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SHOE_DEALS.map(shoe => (
                <button
                  key={shoe.id}
                  onClick={() => selectShoeDeal(shoe)}
                  className="text-left p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] hover:border-[#f59e0b]/50 transition-all hover:scale-[1.01] group"
                >
                  <div className="text-4xl font-black mb-3" style={{ color: shoe.id === 'nike' ? '#f59e0b' : shoe.id === 'adidas' ? '#3b82f6' : '#10b981' }}>
                    {shoe.icon}
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-[#f59e0b] transition-colors mb-1">{shoe.brand}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748b]">Guaranteed</span>
                      <span className="font-bold text-[#10b981]">{fmt(shoe.guaranteedValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748b]">Per Year</span>
                      <span className="font-bold text-white">{fmt(shoe.annualValue)}/yr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748b]">All-Star Bonus</span>
                      <span className="font-bold text-[#f59e0b]">+{shoe.upsidePct}%</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <StatBar
                      label="Brand Power"
                      value={shoe.brandMultiplier * 20}
                      max={40}
                      color={shoe.id === 'nike' ? '#f59e0b' : shoe.id === 'adidas' ? '#3b82f6' : '#10b981'}
                    />
                  </div>

                  <div className="p-2 bg-[#0a0e1a] rounded-lg mb-2">
                    <div className="text-xs text-[#10b981] mb-1">✓ {shoe.proNote}</div>
                  </div>
                  <div className="text-xs text-[#64748b]">{shoe.riskNote}</div>

                  <div className="mt-3 text-xs text-[#64748b]">
                    Signature shoe if you reach {shoe.signatureShoeThreshold}+ star potential
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STAGE 3: YEAR 3 REVIEW ── */}
        {phase === 'year3-review' && career.profile && career.shoeDeal && (
          <div>
            <PhaseHeader step={2} label="Year 3 Review" />
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">Year 3 — How Did Your Client Develop?</h2>
              <p className="text-[#94a3b8] text-sm">
                Three seasons have passed. Your client's Year 3 performance will determine what extension offers are on the table. The numbers don't lie.
              </p>
            </div>

            {/* Player card recap */}
            <div className="p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-black text-white">{career.profile.name}</h3>
                  <div className="text-[#64748b] text-sm">{career.profile.position} · {career.shoeDeal.brand} athlete · #{career.pickSlot} Pick</div>
                </div>
              </div>

              {/* Year 3 projected stats */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {year3Stats && [
                  { label: 'PPG', value: year3Stats.ppg, max: 35 },
                  { label: 'RPG', value: year3Stats.rpg, max: 15 },
                  { label: 'APG', value: year3Stats.apg, max: 12 },
                  { label: 'FG%', value: year3Stats.fg,  max: 65 },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 bg-[#0a0e1a] rounded-lg">
                    <div className="text-2xl font-black text-[#f59e0b]">{s.value}</div>
                    <div className="text-xs text-[#64748b]">{s.label}</div>
                  </div>
                ))}
              </div>

              {year3Stats && (
                <div className="p-3 rounded-lg" style={{
                  background: year3Stats.tier === 'elite' ? '#10b98120' : year3Stats.tier === 'good' ? '#f59e0b20' : '#ef444420',
                  border: `1px solid ${year3Stats.tier === 'elite' ? '#10b98150' : year3Stats.tier === 'good' ? '#f59e0b50' : '#ef444450'}`,
                }}>
                  <div className="font-bold mb-1" style={{
                    color: year3Stats.tier === 'elite' ? '#10b981' : year3Stats.tier === 'good' ? '#f59e0b' : '#ef4444',
                  }}>
                    {year3Stats.tier === 'elite' ? '🌟 All-Star Caliber Season' : year3Stats.tier === 'good' ? '✅ Solid Starting-Level Performance' : '⚠️ Below Expectations'}
                  </div>
                  <div className="text-xs text-[#94a3b8]">
                    {year3Stats.tier === 'elite'
                      ? 'Your client has exceeded all projections. The best extension offers are now available.'
                      : year3Stats.tier === 'good'
                      ? 'Steady production. Not a superstar yet, but max extension is on the table.'
                      : 'Inconsistent Year 3. Development has been slower than expected. Options are limited.'}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={revealYear3}
                className="px-10 py-4 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#d97706] transition-colors"
              >
                See Extension Offers →
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 4: EXTENSION ── */}
        {phase === 'extension' && career.profile && career.year3Stats && (
          <div>
            <PhaseHeader step={3} label="Extension or Free Agency?" />
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">The Big Decision</h2>
              <p className="text-[#94a3b8] text-sm mb-2">
                Your current team wants to lock you up. But do you take the guaranteed money now, or bet on yourself in free agency next summer? This is the decision that defines careers.
              </p>
              <div className="text-xs text-[#64748b] p-3 bg-[#111827] rounded-lg border border-[#1e293b]">
                📊 Year 3 Performance: <span className="font-bold" style={{
                  color: career.year3Stats.tier === 'elite' ? '#10b981' : career.year3Stats.tier === 'good' ? '#f59e0b' : '#ef4444',
                }}>
                  {career.year3Stats.tier === 'elite' ? 'Elite (All-Star)' : career.year3Stats.tier === 'good' ? 'Good (Starter)' : 'Average'}
                </span>
                {' — '}based on this, here are your realistic options:
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {EXTENSION_OFFERS[career.year3Stats.tier].map(ext => (
                <button
                  key={ext.id}
                  onClick={() => selectExtension(ext)}
                  className="text-left p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] hover:border-[#f59e0b]/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-[#f59e0b] transition-colors">{ext.label}</h3>
                      <div className="text-[#64748b] text-sm">{ext.years} year{ext.years !== 1 ? 's' : ''} · {fmt(ext.totalValue)} total</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-[#10b981]">{fmt(ext.annualValue)}</div>
                      <div className="text-xs text-[#64748b]">per year</div>
                    </div>
                  </div>

                  <p className="text-[#94a3b8] text-sm mb-4">{ext.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-[#10b981] font-bold mb-2">PROS</div>
                      {ext.pros.map(p => (
                        <div key={p} className="text-xs text-[#94a3b8] mb-1">✓ {p}</div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs text-[#ef4444] font-bold mb-2">CONS</div>
                      {ext.cons.map(c => (
                        <div key={c} className="text-xs text-[#94a3b8] mb-1">✗ {c}</div>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STAGE 5: OUTCOME ── */}
        {phase === 'outcome' && career.profile && career.extensionChoice && career.year3Stats && (
          <div>
            <PhaseHeader step={4} label="Career Trajectory" />
            <h2 className="text-2xl font-black text-white mb-6">Career Summary: {career.profile.name}</h2>

            {/* Grade reveal */}
            {!gradeRevealed ? (
              <div className="text-center py-16">
                <div className="text-[#64748b] text-sm mb-6">All decisions locked in. Calculating career value...</div>
                <button
                  onClick={() => setGradeRevealed(true)}
                  className="px-10 py-4 bg-[#f59e0b] text-black font-black rounded-xl text-lg hover:bg-[#d97706] transition-colors animate-pulse"
                >
                  Reveal Career Grade
                </button>
              </div>
            ) : (
              <>
                {/* Grade card */}
                {(() => {
                  const { grade, label, color } = gradeFromScore(finalScore);
                  return (
                    <div className="p-6 rounded-2xl border mb-6 text-center" style={{ background: color + '15', borderColor: color + '50' }}>
                      <div className="text-7xl font-black mb-2" style={{ color }}>{grade}</div>
                      <div className="text-xl font-bold text-white mb-1">{label}</div>
                      <div className="text-[#64748b] text-sm">Career Score: {finalScore}/100</div>
                    </div>
                  );
                })()}

                {/* Stats breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Total Earnings', value: fmt(career.totalEarnings), color: '#10b981' },
                    { label: 'Rings',           value: `${career.rings}`,         color: '#f59e0b' },
                    { label: 'Legacy Score',    value: `${career.legacyScore}/100`, color: '#8b5cf6' },
                    { label: 'Brand Value',     value: `${Math.round(career.brandValue)}/40`, color: '#3b82f6' },
                  ].map(s => (
                    <div key={s.label} className="p-4 bg-[#1a2035] rounded-xl border border-[#1e293b] text-center">
                      <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs text-[#64748b]">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Decision recap */}
                <div className="p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] mb-6">
                  <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest mb-4">Your Decisions</div>
                  <div className="space-y-3">
                    {[
                      { label: 'Draft Pick',   value: `#${career.pickSlot} Overall — ${career.profile.name} (${career.profile.position})` },
                      { label: 'Shoe Deal',    value: `${career.shoeDeal?.brand} — ${fmt(career.shoeDeal?.guaranteedValue ?? 0)} guaranteed` },
                      { label: 'Year 3 Stats', value: `${career.year3Stats.ppg} PPG / ${career.year3Stats.rpg} RPG / ${career.year3Stats.apg} APG (${career.year3Stats.tier.toUpperCase()})` },
                      { label: 'Extension',   value: career.extensionChoice.label },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-start gap-4">
                        <div className="text-xs text-[#64748b] whitespace-nowrap">{row.label}</div>
                        <div className="text-xs text-[#e2e8f0] text-right">{row.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical comparison */}
                {historicalComp && (
                  <div className="p-5 bg-[#111827] rounded-xl border border-[#1e293b] mb-6">
                    <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest mb-3">Real-World Comparison — #{career.pickSlot} Pick</div>
                    <div className="text-lg font-black text-white mb-2">{historicalComp.playerName}</div>
                    <div className="space-y-2 text-xs text-[#94a3b8]">
                      <div><span className="text-[#64748b]">Shoe:</span> {historicalComp.shoeChoice}</div>
                      <div><span className="text-[#64748b]">Contract Decision:</span> {historicalComp.contractDecision}</div>
                      <div><span className="text-[#64748b]">Outcome:</span> {historicalComp.careerOutcome}</div>
                      <div className="flex gap-4 mt-2">
                        <div><span className="text-[#64748b]">Career Earnings:</span> <span className="text-[#10b981] font-bold">{historicalComp.totalEarnings}</span></div>
                        <div><span className="text-[#64748b]">Rings:</span> <span className="text-[#f59e0b] font-bold">{historicalComp.rings}</span></div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-[#64748b] italic">{career.profile?.realHistoricalNote}</div>
                  </div>
                )}

                {/* What this teaches */}
                <div className="p-5 bg-[#1a2035] rounded-xl border border-[#1e293b] mb-8">
                  <div className="text-xs text-[#f59e0b] font-bold uppercase tracking-widest mb-3">What This Sim Teaches</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#94a3b8]">
                    {[
                      'Rookie scale salaries are CBA-mandated — no negotiation on base pay for top picks.',
                      'Shoe deals are the first major agent win — brand alignment matters as much as dollars.',
                      'The rookie extension vs. free agency bet is a core risk/reward decision in real NBA contracts.',
                      'Star potential determines leverage — average players have far fewer options than stars.',
                      'Total career value = on-court performance + endorsements + business decisions.',
                    ].map(fact => (
                      <div key={fact} className="flex gap-2">
                        <span className="text-[#f59e0b] flex-shrink-0">→</span>
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 bg-[#1a2035] border border-[#1e293b] text-white font-bold rounded-xl hover:border-[#f59e0b]/50 transition-all"
                  >
                    Try Again with Different Choices
                  </button>
                  <Link
                    href="/"
                    className="flex-1 py-3 bg-[#f59e0b] text-black font-black rounded-xl text-center hover:bg-[#d97706] transition-colors"
                  >
                    Back to Hub →
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
