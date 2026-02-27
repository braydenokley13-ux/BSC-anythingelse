export interface TeamOption {
  id: string;
  city: string;
  name: string;
  champOdds: number; // 0–1
  maxSalary: number; // millions/year
  endorsementMarket: number; // 1–10
  legacyScore: number; // 1–10 (hometown, prestige, etc.)
  rosterQuality: number; // 1–10
  rosterNotes: string;
  loyaltyScore?: number; // for Cleveland
}

export interface ContractOption {
  id: string;
  label: string;
  years: number;
  totalValue: number; // millions
  annualValue: number;
  pros: string[];
  cons: string[];
}

export interface EndorsementDeal {
  id: string;
  brand: string;
  category: string;
  baseValue: number; // millions/year
  upsidePct: number; // % increase on great performance
  scandalRisk: number; // 0–10 scale (higher = riskier brand)
  fitScore: number; // how well it fits LeBron's brand (0–10)
  exclusivity: string[]; // categories blocked
  icon: string;
}

export interface InvestmentOption {
  id: string;
  name: string;
  description: string;
  costBasis: number; // millions invested
  currentValue: number; // what it's worth today
  riskLevel: 'Low' | 'Medium' | 'High';
  returnMultiple: number;
  culturalImpact: number; // 1–10
  yearAvailable: number; // which career phase unlocks this
}

export const TEAM_OPTIONS_2010: TeamOption[] = [
  {
    id: 'heat',
    city: 'Miami',
    name: 'Heat',
    champOdds: 0.72,
    maxSalary: 99.0,
    endorsementMarket: 9,
    legacyScore: 6,
    rosterQuality: 10,
    rosterNotes: 'D-Wade + Chris Bosh already committed. Instant contender.',
  },
  {
    id: 'cavaliers',
    city: 'Cleveland',
    name: 'Cavaliers',
    champOdds: 0.31,
    maxSalary: 110.0,
    endorsementMarket: 5,
    legacyScore: 10,
    rosterQuality: 7,
    rosterNotes: 'Home team. Loyal fanbase. Roster needs work. You are the team.',
    loyaltyScore: 10,
  },
  {
    id: 'bulls',
    city: 'Chicago',
    name: 'Bulls',
    champOdds: 0.45,
    maxSalary: 106.0,
    endorsementMarket: 8,
    legacyScore: 7,
    rosterQuality: 8,
    rosterNotes: 'Derrick Rose, Joakim Noah. Competitive core. Jordan\'s shadow.',
  },
  {
    id: 'knicks',
    city: 'New York',
    name: 'Knicks',
    champOdds: 0.08,
    maxSalary: 118.0,
    endorsementMarket: 10,
    legacyScore: 8,
    rosterQuality: 4,
    rosterNotes: 'Biggest market. Dolan ownership. No talent. Pure brand play.',
  },
  {
    id: 'clippers',
    city: 'Los Angeles',
    name: 'Clippers',
    champOdds: 0.14,
    maxSalary: 115.0,
    endorsementMarket: 10,
    legacyScore: 5,
    rosterQuality: 5,
    rosterNotes: 'LA market without the luster. Ownership concerns. Big upside risk.',
  },
  {
    id: 'nets',
    city: 'New Jersey',
    name: 'Nets',
    champOdds: 0.09,
    maxSalary: 108.0,
    endorsementMarket: 7,
    legacyScore: 4,
    rosterQuality: 4,
    rosterNotes: 'Jay-Z involved in ownership. New arena plan. Long-term upside.',
  },
];

export const CONTRACT_OPTIONS: Record<string, ContractOption[]> = {
  '2010': [
    {
      id: '2yr-short',
      label: '2-Year Deal (Max)',
      years: 2,
      totalValue: 40.2,
      annualValue: 20.1,
      pros: ['Maximum leverage — opt-out after 2025', 'Can re-evaluate team direction', 'Agent\'s dream: control'],
      cons: ['Team can\'t build long-term around you', 'Uncertainty for teammates and fans'],
    },
    {
      id: '4yr-max',
      label: '4-Year Max Deal',
      years: 4,
      totalValue: 86.2,
      annualValue: 21.6,
      pros: ['Max dollars over 4 years', 'Security for both sides', 'Team can invest in roster around you'],
      cons: ['Less leverage if situation goes bad', 'Locked in regardless of team performance'],
    },
    {
      id: '1plus1',
      label: '1+1 Player Option',
      years: 1,
      totalValue: 20.1,
      annualValue: 20.1,
      pros: ['Year-to-year leverage — max control', 'Can chase championship windows annually'],
      cons: ['Lowest total dollars if you stay', 'Creates constant trade/departure rumors'],
    },
  ],
  '2014': [
    {
      id: '2yr-return',
      label: '2-Year Return Deal',
      years: 2,
      totalValue: 42.0,
      annualValue: 21.0,
      pros: ['Prove loyalty to Cleveland', 'Championship window with young core'],
      cons: ['Lower salary than possible max', 'Young team may not be ready'],
    },
    {
      id: '1plus1-2014',
      label: '1+1 Player Option',
      years: 1,
      totalValue: 21.0,
      annualValue: 21.0,
      pros: ['Annual leverage', 'Can assess team progress each year'],
      cons: ['Constant free agent speculation'],
    },
  ],
  '2018': [
    {
      id: '4yr-lakers',
      label: '4-Year Max Lakers',
      years: 4,
      totalValue: 153.3,
      annualValue: 38.3,
      pros: ['Last mega deal at this salary level', 'LA market for business ventures', 'Young talent: Ingram, Kuzma, Ball'],
      cons: ['Young team = lower immediate contention', 'Lakers dysfunction historically'],
    },
    {
      id: '1plus1-2018',
      label: '1+1 Player Option',
      years: 1,
      totalValue: 35.6,
      annualValue: 35.6,
      pros: ['Flexibility after Year 1', 'Can get AD the next summer'],
      cons: ['$17M less guaranteed vs. 4-yr deal'],
    },
    {
      id: 'stay-cavs',
      label: 'Stay in Cleveland (1yr)',
      years: 1,
      totalValue: 35.6,
      annualValue: 35.6,
      pros: ['Loyalty legacy', 'Eastern conference dominance continues'],
      cons: ['Ownership investment uncertainty', 'Supporting cast declining'],
    },
  ],
};

export const ENDORSEMENT_DEALS: EndorsementDeal[] = [
  {
    id: 'nike',
    brand: 'Nike',
    category: 'Footwear & Apparel',
    baseValue: 30.0,
    upsidePct: 40,
    scandalRisk: 2,
    fitScore: 10,
    exclusivity: ['footwear', 'apparel'],
    icon: '👟',
  },
  {
    id: 'mcdonalds',
    brand: "McDonald's",
    category: 'Fast Food',
    baseValue: 8.0,
    upsidePct: 10,
    scandalRisk: 3,
    fitScore: 7,
    exclusivity: ['fast food'],
    icon: '🍔',
  },
  {
    id: 'samsung',
    brand: 'Samsung',
    category: 'Technology',
    baseValue: 14.0,
    upsidePct: 20,
    scandalRisk: 1,
    fitScore: 8,
    exclusivity: ['mobile devices'],
    icon: '📱',
  },
  {
    id: 'beats',
    brand: 'Beats by Dre',
    category: 'Audio/Music',
    baseValue: 10.0,
    upsidePct: 30,
    scandalRisk: 2,
    fitScore: 9,
    exclusivity: ['headphones', 'audio'],
    icon: '🎧',
  },
  {
    id: 'sprite',
    brand: 'Sprite',
    category: 'Beverage',
    baseValue: 6.0,
    upsidePct: 15,
    scandalRisk: 2,
    fitScore: 7,
    exclusivity: ['soda', 'energy drinks'],
    icon: '🥤',
  },
  {
    id: 'kia',
    brand: 'Kia',
    category: 'Automotive',
    baseValue: 12.0,
    upsidePct: 10,
    scandalRisk: 1,
    fitScore: 6,
    exclusivity: ['automotive'],
    icon: '🚗',
  },
  {
    id: 'crypto',
    brand: 'Crypto Exchange',
    category: 'Crypto/Finance',
    baseValue: 20.0,
    upsidePct: 100,
    scandalRisk: 9,
    fitScore: 4,
    exclusivity: ['crypto', 'trading'],
    icon: '₿',
  },
];

export const INVESTMENT_OPTIONS: InvestmentOption[] = [
  {
    id: 'springhill',
    name: 'SpringHill Company',
    description: 'LeBron\'s own media/entertainment production company. Produced Space Jam 2, "More Than a Game," and athlete content.',
    costBasis: 10.0,
    currentValue: 725.0,
    riskLevel: 'Medium',
    returnMultiple: 72.5,
    culturalImpact: 10,
    yearAvailable: 2015,
  },
  {
    id: 'fenway',
    name: 'Fenway Sports Group (Liverpool FC)',
    description: 'Bought a minority stake in FSG, which owns Liverpool FC. Liverpool won Premier League and Champions League after purchase.',
    costBasis: 6.5,
    currentValue: 40.0,
    riskLevel: 'Medium',
    returnMultiple: 6.2,
    culturalImpact: 8,
    yearAvailable: 2011,
  },
  {
    id: 'warner',
    name: 'Warner Bros. Deal',
    description: 'Signed a $250M production deal with Warner Bros. for films, TV, and streaming content through SpringHill.',
    costBasis: 0,
    currentValue: 250.0,
    riskLevel: 'Low',
    returnMultiple: 25,
    culturalImpact: 9,
    yearAvailable: 2021,
  },
  {
    id: 'lobos',
    name: 'Lobos 1707 Tequila',
    description: 'Invested in and became part-owner of Lobos 1707 tequila brand. Celebrity spirits are a massive market.',
    costBasis: 3.0,
    currentValue: 18.0,
    riskLevel: 'High',
    returnMultiple: 6.0,
    culturalImpact: 5,
    yearAvailable: 2021,
  },
  {
    id: 'pizza-hut',
    name: 'Blaze Pizza Franchise',
    description: 'Early investor in Blaze Pizza chain. Grew to 340+ locations. LeBron declined $15M McDonald\'s deal to invest instead.',
    costBasis: 1.0,
    currentValue: 35.0,
    riskLevel: 'Medium',
    returnMultiple: 35.0,
    culturalImpact: 6,
    yearAvailable: 2012,
  },
  {
    id: 'nfl-bid',
    name: 'NFL Ownership Bid',
    description: 'LeBron has expressed interest in owning an NFL expansion franchise. Expansion fee expected at $5B+.',
    costBasis: 500.0,
    currentValue: 5000.0,
    riskLevel: 'High',
    returnMultiple: 10.0,
    culturalImpact: 10,
    yearAvailable: 2025,
  },
];

export const LEBRON_REAL_TIMELINE = [
  { year: 2010, decision: 'Joined Miami Heat on 1+1 player options', rings: 0, earnings: 20.1, legacyNote: 'The Decision — vilified initially, redeemed by championships' },
  { year: 2012, decision: 'Won first NBA Championship with Heat', rings: 1, earnings: 22.0, legacyNote: 'Silenced doubters. First of back-to-back with Wade and Bosh' },
  { year: 2014, decision: 'Returned to Cleveland on 2-year deals (1+1 options)', rings: 2, earnings: 21.0, legacyNote: 'The Return. Chose loyalty and championship promise' },
  { year: 2016, decision: 'Delivered championship to Cleveland — 3-1 comeback vs Warriors', rings: 3, earnings: 31.0, legacyNote: 'Greatest Finals performance ever. Iconic.' },
  { year: 2018, decision: 'Signed 4-year $153M max with Lakers', rings: 3, earnings: 35.6, legacyNote: 'Business move: LA market, SpringHill, Hollywood' },
  { year: 2020, decision: 'Won NBA Championship with Lakers in the Bubble', rings: 4, earnings: 39.2, legacyNote: 'Championship in empty arenas — tied MJ at 4' },
];
