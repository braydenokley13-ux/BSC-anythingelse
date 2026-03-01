// Rookie Deal Simulation Data
// Used in app/rookie-deal/page.tsx

export interface RookieScaleSlot {
  pick: number;
  year1Salary: number; // millions
  year2Salary: number;
  year3Salary: number;
  year4Salary: number; // team option
  totalGuaranteed: number; // years 1-3
}

// 2024 rookie scale approximations (in millions)
export const ROOKIE_SCALE: RookieScaleSlot[] = [
  { pick: 1,  year1Salary: 12.5, year2Salary: 13.1, year3Salary: 13.7, year4Salary: 14.4, totalGuaranteed: 39.3 },
  { pick: 2,  year1Salary: 11.5, year2Salary: 12.1, year3Salary: 12.7, year4Salary: 13.3, totalGuaranteed: 36.3 },
  { pick: 3,  year1Salary: 10.9, year2Salary: 11.4, year3Salary: 11.9, year4Salary: 12.5, totalGuaranteed: 34.2 },
  { pick: 4,  year1Salary: 10.3, year2Salary: 10.8, year3Salary: 11.3, year4Salary: 11.9, totalGuaranteed: 32.4 },
  { pick: 5,  year1Salary: 9.7,  year2Salary: 10.2, year3Salary: 10.7, year4Salary: 11.2, totalGuaranteed: 30.6 },
];

export interface PlayerProfile {
  id: string;
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  age: number;
  college: string;
  description: string;
  baseStats: {
    ppg: number;
    rpg: number;
    apg: number;
    fg: number; // field goal %
  };
  // Performance trajectory variance each year (+/-)
  variance: number;
  // Likelihood of becoming a star (affects extension value)
  starPotential: number; // 0-100
  realWorldComparison: string; // e.g. "Similar path to Jayson Tatum"
  realHistoricalNote: string; // real player at that slot
}

export const PLAYER_PROFILES: PlayerProfile[] = [
  {
    id: 'marcus-heights',
    name: 'Marcus Heights',
    position: 'PG',
    age: 19,
    college: 'Duke University',
    description: 'Elite playmaker with court vision beyond his years. Motor never stops. Some scouts say he\'s already NBA-ready, others think his shot needs work.',
    baseStats: { ppg: 21, rpg: 4, apg: 8, fg: 44 },
    variance: 12,
    starPotential: 85,
    realWorldComparison: 'Similar path to Jayson Tatum',
    realHistoricalNote: 'The #1 pick in 2023 was Victor Wembanyama — went to San Antonio, immediately became a generational talent.',
  },
  {
    id: 'devante-cross',
    name: 'DeVante Cross',
    position: 'SG',
    age: 20,
    college: 'Kentucky',
    description: 'Pure scorer. Devastating in isolation. Athletic enough to defend 1-3. Question marks about shot creation at the next level when defenses key on him.',
    baseStats: { ppg: 23, rpg: 5, apg: 4, fg: 46 },
    variance: 15,
    starPotential: 75,
    realWorldComparison: 'Similar path to Devin Booker',
    realHistoricalNote: 'The #2 pick in 2020 was James Wiseman — injury struggles derailed early career. High risk, high ceiling.',
  },
  {
    id: 'tariq-coleman',
    name: 'Tariq Coleman',
    position: 'SF',
    age: 21,
    college: 'Michigan',
    description: 'Swiss army knife forward. Can guard 1-through-5. Not a singular star skill but elite efficiency. Championship DNA player from day one.',
    baseStats: { ppg: 17, rpg: 7, apg: 3, fg: 49 },
    variance: 8,
    starPotential: 60,
    realWorldComparison: 'Similar path to Mikal Bridges',
    realHistoricalNote: 'The #3 pick in 2021 was Evan Mobley — quietly became one of the best defenders in the league. Steady and reliable.',
  },
  {
    id: 'jordan-bass',
    name: 'Jordan Bass',
    position: 'PF',
    age: 19,
    college: 'North Carolina',
    description: 'Versatile big who can stretch the floor. 3-and-D profile with surprising handle for his size. Raw but enormous upside if development clicks.',
    baseStats: { ppg: 15, rpg: 9, apg: 2, fg: 47 },
    variance: 18,
    starPotential: 70,
    realWorldComparison: 'Similar path to Scottie Barnes',
    realHistoricalNote: 'The #4 pick in 2022 was Keegan Murray — consistent production immediately, steady starter.',
  },
  {
    id: 'amir-okonkwo',
    name: 'Amir Okonkwo',
    position: 'C',
    age: 20,
    college: 'UCLA',
    description: 'Rim-running center with elite athleticism. Lob threat. Can\'t shoot from outside yet but crashes the glass and finishes with authority. Defensive anchor.',
    baseStats: { ppg: 13, rpg: 11, apg: 2, fg: 62 },
    variance: 10,
    starPotential: 65,
    realWorldComparison: 'Similar path to Bam Adebayo',
    realHistoricalNote: 'The #5 pick in 2019 was Jarrett Allen — reliable starting center who became a two-time All-Star.',
  },
];

export interface ShoeDeal {
  id: string;
  brand: string;
  icon: string;
  guaranteedValue: number; // millions over 4 years
  annualValue: number;
  upsidePct: number; // bonus % if you become All-Star
  brandMultiplier: number; // multiplied into final brand score
  riskNote: string;
  proNote: string;
  exclusivityYears: number;
  signatureShoeThreshold: number; // starPotential needed for signature line upgrade
}

export const SHOE_DEALS: ShoeDeal[] = [
  {
    id: 'nike',
    brand: 'Nike',
    icon: '✔',
    guaranteedValue: 24.0,
    annualValue: 6.0,
    upsidePct: 50,
    brandMultiplier: 1.5,
    riskNote: 'Locked to Nike brand. No crossing to other footwear.',
    proNote: 'The gold standard. Instant credibility. Signature shoe potential if you make All-Star.',
    exclusivityYears: 4,
    signatureShoeThreshold: 70,
  },
  {
    id: 'adidas',
    brand: 'Adidas',
    icon: '⊘',
    guaranteedValue: 20.0,
    annualValue: 5.0,
    upsidePct: 70,
    brandMultiplier: 1.3,
    riskNote: 'Larger upside bonuses than Nike but smaller guaranteed floor.',
    proNote: 'Higher performance bonuses. If you ball out, you earn more than Nike. High risk, high reward.',
    exclusivityYears: 4,
    signatureShoeThreshold: 60,
  },
  {
    id: 'new-balance',
    brand: 'New Balance',
    icon: 'N',
    guaranteedValue: 14.0,
    annualValue: 3.5,
    upsidePct: 100,
    brandMultiplier: 1.1,
    riskNote: 'Newer to NBA. Less prestige, but massive upside if you help grow the brand.',
    proNote: 'Smaller brand = more creative freedom. If you make All-Star, bonus doubles your contract value.',
    exclusivityYears: 3,
    signatureShoeThreshold: 55,
  },
];

export interface ExtensionOffer {
  id: string;
  label: string;
  years: number;
  totalValue: number; // millions
  annualValue: number;
  description: string;
  pros: string[];
  cons: string[];
  requiredPerformanceScore: number; // minimum score to unlock this offer
}

// Extension offers depend on Year 3 performance
export const EXTENSION_OFFERS: Record<'elite' | 'good' | 'average', ExtensionOffer[]> = {
  elite: [
    {
      id: 'supermax',
      label: 'Supermax Extension — 5yr / 35% Max',
      years: 5,
      totalValue: 280,
      annualValue: 56,
      description: 'Elite performance unlocked the designated player extension. Your team is betting big on you.',
      pros: ['Most guaranteed money in NBA history at this age', 'Only your current team can offer this', 'Legacy stability'],
      cons: ['Locked in even if team declines', 'Less leverage after signing'],
      requiredPerformanceScore: 80,
    },
    {
      id: 'max-extension',
      label: 'Max Extension — 4yr / 30% Max',
      years: 4,
      totalValue: 200,
      annualValue: 50,
      description: 'Standard max extension for a clear All-Star performer. Guaranteed money.',
      pros: ['Big money, less risk', 'Keeps championship flexibility'],
      cons: ['$80M less than supermax', 'Miss out on free agency market'],
      requiredPerformanceScore: 65,
    },
  ],
  good: [
    {
      id: 'max-extension',
      label: 'Max Extension — 4yr / 30% Max',
      years: 4,
      totalValue: 200,
      annualValue: 50,
      description: 'Good Year 3 earned you a max offer. Smart security or underselling yourself?',
      pros: ['Guaranteed maximum dollars', 'Foundation for long career on one team'],
      cons: ['Betting against a breakout Year 4 free agency payday'],
      requiredPerformanceScore: 50,
    },
    {
      id: 'qualifying-offer',
      label: 'Sign Qualifying Offer — Restricted FA',
      years: 1,
      totalValue: 14,
      annualValue: 14,
      description: 'Prove it on a 1-year qualifying offer, then enter restricted free agency. High risk, high reward.',
      pros: ['Enter restricted FA if you ball out Year 4', 'Another team can make offer — your team must match'],
      cons: ['If you decline, you\'re a restricted FA, not fully free', 'One injury ruins everything'],
      requiredPerformanceScore: 0,
    },
  ],
  average: [
    {
      id: 'team-option-year4',
      label: 'Accept Team Option Year 4 (~$11-14M)',
      years: 1,
      totalValue: 13,
      annualValue: 13,
      description: 'Average Year 3 means limited leverage. Your team holds the Year 4 option — they can keep or release you.',
      pros: ['Guaranteed Year 4 salary', 'Time to prove yourself'],
      cons: ['Far below market rate for stars', 'Team controls your future'],
      requiredPerformanceScore: 0,
    },
    {
      id: 'bet-on-yourself',
      label: 'Decline Option — Unrestricted FA',
      years: 1,
      totalValue: 8,
      annualValue: 8,
      description: 'Risky play: decline team option, enter unrestricted FA. Average player, open market.',
      pros: ['Freedom to choose your team', 'Championship chasing opportunity'],
      cons: ['Smaller deal likely: $8-12M/yr instead of $30M+', 'High downside risk'],
      requiredPerformanceScore: 0,
    },
  ],
};

export interface HistoricalComparison {
  pickSlot: number;
  playerName: string;
  year: number;
  shoeChoice: string;
  contractDecision: string;
  careerOutcome: string;
  totalEarnings: string;
  rings: number;
}

export const HISTORICAL_COMPARISONS: HistoricalComparison[] = [
  {
    pickSlot: 1,
    playerName: 'LeBron James (2003)',
    year: 2003,
    shoeChoice: 'Nike ($90M rookie deal — historic at the time)',
    contractDecision: 'Extension after Year 3, then FA tour',
    careerOutcome: 'GOAT debate. 4 rings. Billionaire. Hall of Famer.',
    totalEarnings: '$500M+',
    rings: 4,
  },
  {
    pickSlot: 2,
    playerName: 'Darko Milicic (2003)',
    year: 2003,
    shoeChoice: 'Smaller deal, limited market',
    contractDecision: 'Multiple short-term deals',
    careerOutcome: 'Biggest draft bust in history. 9 teams in 13 years.',
    totalEarnings: '$55M',
    rings: 0,
  },
  {
    pickSlot: 3,
    playerName: 'Carmelo Anthony (2003)',
    year: 2003,
    shoeChoice: 'Jordan Brand',
    contractDecision: 'Max extension after Year 3',
    careerOutcome: 'Hall of Famer. 10x All-Star. Never won a ring.',
    totalEarnings: '$260M',
    rings: 0,
  },
  {
    pickSlot: 4,
    playerName: 'Chris Bosh (2003)',
    year: 2003,
    shoeChoice: 'Nike',
    contractDecision: 'Max extension, then FA to Miami',
    careerOutcome: '11x All-Star. 2 rings with Miami Heat. Hall of Famer.',
    totalEarnings: '$188M',
    rings: 2,
  },
  {
    pickSlot: 5,
    playerName: 'Dwyane Wade (2003)',
    year: 2003,
    shoeChoice: 'Converse → Reebok → Li-Ning',
    contractDecision: 'Max extensions in Miami',
    careerOutcome: 'Top-75 all-time. 3 rings. Wade County icon.',
    totalEarnings: '$198M',
    rings: 3,
  },
];

export interface RookieBadge {
  id: string;
  label: string;
  description: string;
  condition: string;
}

export const ROOKIE_BADGES: RookieBadge[] = [
  {
    id: 'first-pick',
    label: 'Top Dog',
    description: 'Went #1 overall',
    condition: 'pick === 1',
  },
  {
    id: 'nike-chosen',
    label: 'The Chosen Brand',
    description: 'Signed with Nike as a rookie',
    condition: 'shoeId === "nike"',
  },
  {
    id: 'supermax-earner',
    label: 'Supermax Star',
    description: 'Earned the supermax extension',
    condition: 'extensionId === "supermax"',
  },
  {
    id: 'bet-on-yourself',
    label: 'Bet On Yourself',
    description: 'Declined the safe option and entered free agency',
    condition: 'extensionId === "bet-on-yourself" || extensionId === "unrestricted-fa"',
  },
  {
    id: 'high-variance-player',
    label: 'Boom or Bust',
    description: 'Chose the high-variance player profile',
    condition: 'profile.variance >= 15',
  },
];
