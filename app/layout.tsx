import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BSC — Bow Sports Capital',
  description: 'Sports-business education through GM-style simulations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e1a] text-[#e2e8f0] min-h-screen">
        {/* Ticker bar */}
        <div className="ticker-bar py-1.5 text-xs text-[#f59e0b] font-mono">
          <span className="ticker-inner">
            &nbsp;&nbsp;&nbsp;&nbsp;NBA SALARY CAP 2024–25: $140.6M &nbsp;|&nbsp;
            LUXURY TAX LINE: $170.7M &nbsp;|&nbsp;
            FIRST APRON: $178.1M &nbsp;|&nbsp;
            SECOND APRON: $188.9M &nbsp;|&nbsp;
            NBA MIN SALARY: $1.19M &nbsp;|&nbsp;
            MAX CONTRACT (10yr): $63.7M &nbsp;|&nbsp;
            NFL SALARY CAP 2024: $255.4M &nbsp;|&nbsp;
            MLB CBT THRESHOLD 2024: $237M &nbsp;|&nbsp;
            NBA SALARY CAP 2024–25: $140.6M &nbsp;|&nbsp;
            LUXURY TAX LINE: $170.7M &nbsp;|&nbsp;
            FIRST APRON: $178.1M &nbsp;|&nbsp;
            SECOND APRON: $188.9M
          </span>
        </div>

        {/* Nav */}
        <nav className="bg-[#111827] border-b border-[#1e293b] px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-[#f59e0b] font-black text-xl tracking-tight">BSC</span>
            <span className="text-[#64748b] text-sm font-medium">BOW SPORTS CAPITAL</span>
          </a>
          <div className="flex items-center gap-4 text-sm text-[#64748b]">
            <a href="/blockbuster" className="hover:text-[#f59e0b] transition-colors">The Blockbuster</a>
            <a href="/lebron-files" className="hover:text-[#f59e0b] transition-colors">LeBron Files</a>
            <a href="/dumpster-fire" className="hover:text-[#f59e0b] transition-colors">Dumpster Fire</a>
            <a href="/ground-zero" className="hover:text-[#f59e0b] transition-colors">Ground Zero</a>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
