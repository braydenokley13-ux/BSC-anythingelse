// Real NBA salary matching calculations

export const CAP_LINE = 140.6; // 2024-25
export const TAX_LINE = 170.7;
export const FIRST_APRON = 178.1;
export const SECOND_APRON = 188.9;

// Tax multipliers (how much you pay PER DOLLAR over the tax line)
// Progressive: the more you're over, the more you pay
export function calculateLuxuryTax(totalSalary: number): number {
  if (totalSalary <= TAX_LINE) return 0;
  const overage = totalSalary - TAX_LINE;
  let tax = 0;

  // Tier 1: $0–5M over → $1.50 per $1
  const tier1 = Math.min(overage, 5);
  tax += tier1 * 1.5;

  // Tier 2: $5–10M over → $1.75 per $1
  const tier2 = Math.min(Math.max(overage - 5, 0), 5);
  tax += tier2 * 1.75;

  // Tier 3: $10–15M over → $2.50 per $1
  const tier3 = Math.min(Math.max(overage - 10, 0), 5);
  tax += tier3 * 2.5;

  // Tier 4: $15–20M over → $3.25 per $1
  const tier4 = Math.min(Math.max(overage - 15, 0), 5);
  tax += tier4 * 3.25;

  // Tier 5: $20M+ over → $3.75 per $1 (repeater tax: $5.00)
  const tier5 = Math.max(overage - 20, 0);
  tax += tier5 * 3.75;

  return Math.round(tax * 10) / 10;
}

// Salary matching rules: outgoing must be within range of incoming
export function salaryMatchingLimit(outgoingSalary: number): { min: number; max: number } {
  // Incoming cannot exceed outgoing * 1.25 + $100K
  // (if team is over cap, outgoing must be >= incoming)
  const max = outgoingSalary * 1.25 + 0.1; // in millions
  const min = outgoingSalary * 0.75;
  return { min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10 };
}

// Check if a trade is salary-legal
export function isTradeCapLegal(
  outgoing: number[],
  incoming: number[],
  teamCapSituation: 'under' | 'over',
): { legal: boolean; reason: string } {
  const outTotal = outgoing.reduce((s, v) => s + v, 0);
  const inTotal = incoming.reduce((s, v) => s + v, 0);

  if (teamCapSituation === 'under') {
    // Under cap: can take back more salary up to cap line
    return { legal: true, reason: 'Team is under cap — can absorb salary' };
  }

  const { max } = salaryMatchingLimit(outTotal);
  if (inTotal <= max) {
    return { legal: true, reason: `Within 125%+100K rule (max: $${max.toFixed(1)}M)` };
  }
  return {
    legal: false,
    reason: `Incoming ($${inTotal.toFixed(1)}M) exceeds match limit ($${max.toFixed(1)}M). Need to add more outgoing.`,
  };
}

// Calculate stretch provision savings per year
export function stretchProvision(salary: number, yearsLeft: number): {
  yearsSpread: number;
  perYearAmount: number;
  yearsSaved: number;
} {
  const yearsSpread = yearsLeft * 2 + 1;
  const perYearAmount = (salary * yearsLeft) / yearsSpread;
  return {
    yearsSpread,
    perYearAmount: Math.round(perYearAmount * 10) / 10,
    yearsSaved: yearsLeft - 1,
  };
}

// Simple win% projection based on roster quality
export function projectWinPct(players: Array<{ rating: number; salary: number }>): number {
  if (players.length === 0) return 0.1;
  const avgRating = players.reduce((s, p) => s + p.rating, 0) / players.length;
  // Rough mapping: avg rating 70 ≈ .300, 80 ≈ .500, 90 ≈ .700
  const pct = ((avgRating - 60) / 40) * 0.7;
  return Math.max(0.1, Math.min(0.85, pct));
}

// Calculate trade value (0-10 scale)
export function tradeValue(rating: number, salary: number, yearsLeft: number, age: number): number {
  const efficiency = rating / salary; // higher = better deal
  const agePenalty = Math.max(0, (age - 28) * 0.3);
  const raw = efficiency * 2.5 - agePenalty + (yearsLeft * 0.3);
  return Math.max(0, Math.min(10, Math.round(raw * 10) / 10));
}

export function formatMoney(millions: number): string {
  if (millions >= 1000) return `$${(millions / 1000).toFixed(1)}B`;
  return `$${millions.toFixed(1)}M`;
}

export function formatMoneyShort(millions: number): string {
  return `$${millions.toFixed(1)}M`;
}

export function capTier(totalSalary: number): {
  tier: 'Under Cap' | 'Over Cap' | 'Over Tax' | 'First Apron' | 'Second Apron';
  color: string;
  description: string;
} {
  if (totalSalary <= CAP_LINE) return { tier: 'Under Cap', color: '#10b981', description: 'Full cap room available' };
  if (totalSalary <= TAX_LINE) return { tier: 'Over Cap', color: '#3b82f6', description: 'Limited to exceptions only' };
  if (totalSalary <= FIRST_APRON) return { tier: 'Over Tax', color: '#f59e0b', description: 'Paying luxury tax' };
  if (totalSalary <= SECOND_APRON) return { tier: 'First Apron', color: '#f97316', description: 'Restricted trade rights, reduced MLE' };
  return { tier: 'Second Apron', color: '#ef4444', description: 'Severe restrictions: no pick aggregation, reduced exceptions' };
}
