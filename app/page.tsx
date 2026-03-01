'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const MAIN_SIMS = [
  {
    href: '/blockbuster',
    emoji: '🔄',
    title: 'The Blockbuster',
    subtitle: 'Full GM Trade Negotiation',
    description: 'Build a franchise-altering trade from scratch. Propose, negotiate, and close deals. AI GMs counter your offers. 3-team blockbusters available.',
    tags: ['Trade Mechanics', 'Salary Matching', 'AI Negotiation'],
    difficulty: 'High Stakes',
    color: '#f59e0b',
    time: '~15 min',
  },
  {
    href: '/lebron-files',
    emoji: '👑',
    title: 'The LeBron Files',
    subtitle: 'Build a Superstar\'s Career',
    description: '5 career decision points. Every choice cascades into the next. Team selection → Contract → Endorsements → Business empire → The Bronny Decision.',
    tags: ['Contracts', 'Endorsements', 'Investments'],
    difficulty: 'Multi-Stage',
    color: '#8b5cf6',
    time: '~20 min',
  },
  {
    href: '/dumpster-fire',
    emoji: '🔥',
    title: 'The Dumpster Fire',
    subtitle: 'Fix a Broken Team',
    description: 'Inherit a cap nightmare: aging max contracts, no picks, over the tax, star wants out. Use every tool to rebuild over 3 years.',
    tags: ['Cap Escape', 'Luxury Tax', 'Rebuild Strategy'],
    difficulty: '3-Year Arc',
    color: '#ef4444',
    time: '~15 min',
  },
  {
    href: '/ground-zero',
    emoji: '🏟️',
    title: 'Ground Zero',
    subtitle: 'Expansion Franchise',
    description: 'Brand new team. Expansion draft + free agency. Build your roster, name your franchise, simulate Year 1. AI rival team competes against you.',
    tags: ['Expansion Draft', 'Free Agency', 'Roster Building'],
    difficulty: 'AI vs. You',
    color: '#10b981',
    time: '~15 min',
  },
  {
    href: '/rookie-deal',
    emoji: '🎯',
    title: 'The Rookie Deal',
    subtitle: 'Agent Negotiation Sim',
    description: 'You\'re the agent for a top-5 draft pick. Navigate rookie scale contracts, shoe deals, and the extension-or-free-agency decision that defines careers.',
    tags: ['Rookie Scale', 'Shoe Deals', 'Extension vs. FA'],
    difficulty: 'Agent Mode',
    color: '#06b6d4',
    time: '~12 min',
  },
];

const MINI_GAMES = [
  {
    href: '/endorsement-empire.html',
    emoji: '💰',
    title: 'Endorsement Empire',
    subtitle: '3-season brand building sim',
    description: 'Pick deals, manage your image, survive random events. Beat the AI rival\'s portfolio.',
    time: '~8 min',
    color: '#f59e0b',
  },
  {
    href: '/fill-my-building.html',
    emoji: '🏟️',
    title: 'Fill My Building',
    subtitle: 'Arena economics manager',
    description: 'Set ticket prices, concessions, and special events. Real demand curves — greedy pricing kills attendance.',
    time: '~10 min',
    color: '#3b82f6',
  },
  {
    href: '/tank-commander.html',
    emoji: '🎯',
    title: 'Tank Commander',
    subtitle: 'Tanking & competitive balance',
    description: 'Manage a rebuild season. NBA anti-tanking rules enforced. Lottery odds are real. Can you get the top pick?',
    time: '~7 min',
    color: '#8b5cf6',
  },
];

export default function Home() {
  const [completed, setCompleted] = useState<Record<string, { completed: boolean; grade: string }>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bsc-completed');
      if (stored) setCompleted(JSON.parse(stored));
    } catch {}
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-4">
          BOW SPORTS CAPITAL — BONUS ACTIVITIES
        </div>
        <h1 className="text-5xl font-black text-white mb-4 leading-tight">
          Advanced GM Simulations
        </h1>
        <p className="text-[#64748b] text-lg max-w-2xl mx-auto">
          7 new activities covering concepts beyond the core BSC curriculum. High stakes. Real data. Beat the AI.
        </p>
      </div>

      {/* Concept tags */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {['Trade Negotiations', 'Endorsement Economics', 'Luxury Tax', 'Expansion Drafts', 'Career Management', 'Rookie Scale', 'Arena Revenue', 'Tanking Strategy', 'Agent Negotiations'].map(tag => (
          <span key={tag} className="px-3 py-1 bg-[#1a2035] border border-[#1e293b] rounded-full text-xs text-[#64748b]">{tag}</span>
        ))}
      </div>

      {/* Main sims */}
      <div className="mb-4">
        <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest mb-6">
          MAIN SIMULATIONS — MULTI-STAGE • REAL DATA • AI NEGOTIATION
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {MAIN_SIMS.map(sim => {
            const result = completed[sim.href];
            return (
              <Link
                key={sim.href}
                href={sim.href}
                className="group block p-6 bg-[#1a2035] rounded-2xl border border-[#1e293b] hover:border-[#f59e0b]/50 transition-all hover:scale-[1.01] relative"
              >
                {result?.completed && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-[#10b981]/15 border border-[#10b981]/40 rounded-full">
                    <span className="text-[#10b981] text-xs font-black">✓ Done</span>
                    {result.grade && result.grade !== '—' && (
                      <span className="text-[#10b981] text-xs font-bold">{result.grade}</span>
                    )}
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-3">{sim.emoji}</div>
                    <h2 className="text-xl font-black text-white group-hover:text-[#f59e0b] transition-colors">{sim.title}</h2>
                    <div className="text-[#64748b] text-sm">{sim.subtitle}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: sim.color + '20', color: sim.color, border: `1px solid ${sim.color}50` }}>
                    {sim.difficulty}
                  </span>
                </div>
                <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">{sim.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {sim.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-[#0a0e1a] border border-[#1e293b] rounded-full text-[#64748b]">{tag}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2" style={{ color: sim.color }}>
                    <span>{result?.completed ? 'Play Again' : 'Launch Sim'}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  {'time' in sim && (
                    <span className="text-xs text-[#64748b]">⏱ {sim.time}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mini games */}
      <div>
        <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest mb-6">
          MINI-GAMES — QUICK PLAY • 7–10 MIN EACH
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MINI_GAMES.map(game => (
            <a
              key={game.href}
              href={game.href}
              className="group block p-5 bg-[#1a2035] rounded-2xl border border-[#1e293b] hover:border-[#f59e0b]/50 transition-all"
            >
              <div className="text-3xl mb-3">{game.emoji}</div>
              <h3 className="text-base font-black text-white group-hover:text-[#f59e0b] transition-colors mb-1">{game.title}</h3>
              <div className="text-[#64748b] text-xs mb-3">{game.subtitle}</div>
              <p className="text-[#94a3b8] text-xs leading-relaxed mb-4">{game.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748b]">⏱ {game.time}</span>
                <span className="text-xs" style={{ color: game.color }}>Play →</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Concepts footer */}
      <div className="mt-16 p-6 bg-[#111827] rounded-2xl border border-[#1e293b]">
        <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest mb-4">CONCEPTS COVERED BY THESE ACTIVITIES</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { concept: 'Trade Salary Matching', sim: 'The Blockbuster' },
            { concept: 'Multi-Team Trades', sim: 'The Blockbuster' },
            { concept: 'Career Contract Strategy', sim: 'LeBron Files' },
            { concept: 'Endorsement Economics', sim: 'LeBron Files + Empire' },
            { concept: 'Stretch Provision', sim: 'Dumpster Fire' },
            { concept: 'Luxury Tax Math', sim: 'Dumpster Fire' },
            { concept: 'Expansion Draft Rules', sim: 'Ground Zero' },
            { concept: 'Salary Floor', sim: 'Ground Zero' },
            { concept: 'Arena Revenue Optimization', sim: 'Fill My Building' },
            { concept: 'Tanking & Lottery Odds', sim: 'Tank Commander' },
            { concept: 'Investment & Equity', sim: 'LeBron Files' },
            { concept: 'Player Brand Building', sim: 'Endorsement Empire' },
            { concept: 'Rookie Scale Contracts', sim: 'Rookie Deal' },
            { concept: 'Shoe Deal Negotiation', sim: 'Rookie Deal' },
            { concept: 'Extension vs. Free Agency', sim: 'Rookie Deal' },
          ].map(({ concept, sim }) => (
            <div key={concept} className="p-2 bg-[#0a0e1a] rounded-lg">
              <div className="text-[#e2e8f0] font-medium mb-0.5">{concept}</div>
              <div className="text-[#64748b]">{sim}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
