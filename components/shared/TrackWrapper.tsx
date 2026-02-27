'use client';

import { useState } from 'react';

interface TrackWrapperProps {
  children: React.ReactNode;
  hintsContent?: React.ReactNode;
  glossaryTerms?: Array<{ term: string; definition: string }>;
}

export function useTrack() {
  const [track, setTrack] = useState<'5-6' | '7-8'>('5-6');
  const isAdvanced = track === '7-8';
  return { track, setTrack, isAdvanced };
}

export default function TrackWrapper({ children, hintsContent, glossaryTerms }: TrackWrapperProps) {
  const { track, setTrack, isAdvanced } = useTrack();
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <div>
      {/* Track selector */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-[#111827] rounded-xl border border-[#1e293b]">
        <span className="text-xs text-[#64748b] uppercase tracking-widest">Grade Level:</span>
        <div className="flex gap-1">
          {(['5-6', '7-8'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTrack(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                track === t ? 'bg-[#f59e0b] text-black' : 'bg-[#1a2035] text-[#64748b] hover:text-[#e2e8f0]'
              }`}
            >
              {t === '5-6' ? '5th–6th Grade' : '7th–8th Grade (Hard Mode)'}
            </button>
          ))}
        </div>
        {track === '7-8' && <span className="text-xs text-red-400 ml-2">⚡ No hints • Timed decisions</span>}
        {glossaryTerms && (
          <button onClick={() => setShowGlossary(!showGlossary)} className="ml-auto text-xs text-[#3b82f6] hover:underline">
            📖 Glossary
          </button>
        )}
      </div>

      {/* Glossary panel */}
      {showGlossary && glossaryTerms && (
        <div className="mb-4 p-4 bg-[#111827] rounded-xl border border-[#1e293b] grid grid-cols-2 gap-3">
          {glossaryTerms.map(({ term, definition }) => (
            <div key={term}>
              <div className="text-[#f59e0b] font-bold text-xs">{term}</div>
              <div className="text-[#64748b] text-xs mt-0.5">{definition}</div>
            </div>
          ))}
        </div>
      )}

      {/* Hints for 5-6 grade */}
      {!isAdvanced && hintsContent && (
        <div className="mb-4 p-3 bg-[#1a2035] rounded-xl border border-[#1e293b] border-l-4 border-l-[#3b82f6]">
          <div className="text-xs font-bold text-[#3b82f6] mb-2">💡 GUIDE</div>
          {hintsContent}
        </div>
      )}

      {children}
    </div>
  );
}

export function HintBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 bg-[#1a2035] rounded-lg border border-[#1e293b] border-l-4 border-l-[#3b82f6] text-xs text-[#94a3b8] mb-3">
      <span className="text-[#3b82f6] font-bold mr-1">💡</span>{children}
    </div>
  );
}

export function TermTooltip({ term, definition, children }: { term: string; definition: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <span
        className="border-b border-dashed border-[#3b82f6] cursor-help text-[#3b82f6]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </span>
      {open && (
        <span className="absolute z-50 bottom-full left-0 mb-2 w-56 bg-[#111827] border border-[#1e293b] rounded-lg p-2 text-xs text-[#e2e8f0] shadow-xl">
          <strong className="text-[#f59e0b]">{term}:</strong> {definition}
        </span>
      )}
    </span>
  );
}
