export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  salary: number; // in millions
  age: number;
  rating: number; // 0–99
  yearsLeft: number;
  hasBirdRights?: boolean;
  isUntouchable?: boolean;
}

export interface DraftPick {
  id: string;
  year: number;
  team: string;
  protected?: string; // e.g. "Top 4 protected"
  estimatedValue: number; // 0–10 scale
}

export interface TeamSnapshot {
  id: string;
  name: string;
  city: string;
  abbr: string;
  capSpace: number; // positive = under cap, negative = over cap
  taxLine: number;
  players: Player[];
  picks: DraftPick[];
  needs: string[]; // positional needs
  winPct: number;
  playoffOdds: number;
}

export interface TradeScenario {
  id: string;
  title: string;
  year: number;
  description: string;
  studentTeam: string; // team ID student manages
  goal: string;
  teams: TeamSnapshot[];
  historicalOutcome: {
    summary: string;
    winsChange: Record<string, number>;
    capImpact: Record<string, string>;
    verdict: string;
    score: number; // 0–100
  };
}

export const TRADE_SCENARIOS: TradeScenario[] = [
  {
    id: 'lakers-2023',
    title: '2023 Lakers: Escape or Evolve?',
    year: 2023,
    description: 'The Lakers missed the playoffs in 2022–23. LeBron and AD are aging. You have few picks. Something has to change.',
    studentTeam: 'lakers',
    goal: 'Acquire a reliable third star or clear cap space for next off-season. Stay competitive for a 37-year-old LeBron.',
    teams: [
      {
        id: 'lakers',
        name: 'Los Angeles Lakers',
        city: 'Los Angeles',
        abbr: 'LAL',
        capSpace: -4.2,
        taxLine: 170.7,
        players: [
          { id: 'lebron', name: 'LeBron James', team: 'lakers', position: 'SF', salary: 47.6, age: 38, rating: 88, yearsLeft: 1, isUntouchable: true },
          { id: 'ad', name: 'Anthony Davis', team: 'lakers', position: 'C', salary: 40.6, age: 30, rating: 91, yearsLeft: 2, isUntouchable: true },
          { id: 'russ', name: 'Russell Westbrook', team: 'lakers', position: 'PG', salary: 47.1, age: 34, rating: 72, yearsLeft: 1 },
          { id: 'beasley', name: 'Malik Beasley', team: 'lakers', position: 'SG', salary: 15.4, age: 26, rating: 74, yearsLeft: 1 },
          { id: 'reaves', name: 'Austin Reaves', team: 'lakers', position: 'SG', salary: 1.9, age: 24, rating: 79, yearsLeft: 1 },
          { id: 'hayes', name: 'Jarred Vanderbilt', team: 'lakers', position: 'PF', salary: 4.7, age: 23, rating: 76, yearsLeft: 3 },
        ],
        picks: [
          { id: 'lal-2027-1', year: 2027, team: 'Lakers', protected: 'Top 4 protected', estimatedValue: 4 },
          { id: 'lal-2029-1', year: 2029, team: 'Lakers', estimatedValue: 5 },
        ],
        needs: ['SG', 'PG', 'shooting'],
        winPct: 0.476,
        playoffOdds: 0.48,
      },
      {
        id: 'jazz',
        name: 'Utah Jazz',
        city: 'Salt Lake City',
        abbr: 'UTA',
        capSpace: 18.2,
        taxLine: 170.7,
        players: [
          { id: 'lauri', name: 'Lauri Markkanen', team: 'jazz', position: 'PF', salary: 18.0, age: 25, rating: 87, yearsLeft: 3 },
          { id: 'clarkson', name: 'Jordan Clarkson', team: 'jazz', position: 'SG', salary: 13.5, age: 30, rating: 78, yearsLeft: 2 },
          { id: 'kessler', name: 'Walker Kessler', team: 'jazz', position: 'C', salary: 3.8, age: 22, rating: 80, yearsLeft: 3, isUntouchable: true },
          { id: 'agbaji', name: 'Ochai Agbaji', team: 'jazz', position: 'SG', salary: 4.2, age: 23, rating: 74, yearsLeft: 2 },
        ],
        picks: [
          { id: 'uta-2024-1', year: 2024, team: 'Jazz (via MIN)', estimatedValue: 8 },
          { id: 'uta-2025-1', year: 2025, team: 'Jazz (via OKC)', estimatedValue: 7 },
          { id: 'uta-2026-1', year: 2026, team: 'Jazz', estimatedValue: 6 },
        ],
        needs: ['C', 'PG', 'experience'],
        winPct: 0.390,
        playoffOdds: 0.15,
      },
      {
        id: 'bulls',
        name: 'Chicago Bulls',
        city: 'Chicago',
        abbr: 'CHI',
        capSpace: -8.3,
        taxLine: 170.7,
        players: [
          { id: 'lavine', name: 'Zach LaVine', team: 'bulls', position: 'SG', salary: 43.9, age: 28, rating: 83, yearsLeft: 3 },
          { id: 'vucevic', name: 'Nikola Vucevic', team: 'bulls', position: 'C', salary: 22.0, age: 32, rating: 77, yearsLeft: 1 },
          { id: 'ball', name: 'Lonzo Ball', team: 'bulls', position: 'PG', salary: 20.0, age: 25, rating: 0, yearsLeft: 2 },
          { id: 'derozan', name: 'DeMar DeRozan', team: 'bulls', position: 'SF', salary: 28.6, age: 34, rating: 81, yearsLeft: 0 },
        ],
        picks: [
          { id: 'chi-2024-1', year: 2024, team: 'Bulls', protected: 'Top 10 protected', estimatedValue: 3 },
        ],
        needs: ['PG', 'defense', 'shooting'],
        winPct: 0.500,
        playoffOdds: 0.55,
      },
    ],
    historicalOutcome: {
      summary: 'Lakers traded Russell Westbrook, picks, and filler for D\'Angelo Russell, Jarred Vanderbilt, and Malik Beasley from Minnesota. Team made Western Conference Finals but lost to Denver.',
      winsChange: { lakers: +7, wolves: -2 },
      capImpact: { lakers: 'Cleared Westbrook\'s $47M, added $13.8M in shorter deals', wolves: 'Took on Westbrook\'s expiring deal to clear Gobert\'s tax burden' },
      verdict: 'Lakers Win — Short-term boost, sacrificed future picks for a finals run that came close.',
      score: 71,
    },
  },
  {
    id: 'harden-brooklyn-2021',
    title: 'The Houston Teardown',
    year: 2021,
    description: 'James Harden demanded a trade. Houston is rebuilding. You\'re Brooklyn — do you give up everything for a 3rd star?',
    studentTeam: 'nets',
    goal: 'Land Harden without destroying your young core. You already have KD and Kyrie.',
    teams: [
      {
        id: 'nets',
        name: 'Brooklyn Nets',
        city: 'Brooklyn',
        abbr: 'BKN',
        capSpace: -12.0,
        taxLine: 132.6,
        players: [
          { id: 'kd', name: 'Kevin Durant', team: 'nets', position: 'SF', salary: 39.1, age: 32, rating: 97, yearsLeft: 3, isUntouchable: true },
          { id: 'kyrie', name: 'Kyrie Irving', team: 'nets', position: 'PG', salary: 33.5, age: 28, rating: 92, yearsLeft: 1, isUntouchable: true },
          { id: 'lequesne', name: 'Caris LeVert', team: 'nets', position: 'SG', salary: 18.3, age: 26, rating: 78, yearsLeft: 2 },
          { id: 'allen', name: 'Jarrett Allen', team: 'nets', position: 'C', salary: 9.4, age: 22, rating: 79, yearsLeft: 1 },
          { id: 'dinwiddie', name: 'Spencer Dinwiddie', team: 'nets', position: 'PG', salary: 10.6, age: 27, rating: 75, yearsLeft: 1 },
          { id: 'prince', name: 'Taurean Prince', team: 'nets', position: 'SF', salary: 7.8, age: 26, rating: 72, yearsLeft: 2 },
        ],
        picks: [
          { id: 'bkn-2022-1', year: 2022, team: 'Nets', estimatedValue: 5 },
          { id: 'bkn-2024-1', year: 2024, team: 'Nets', estimatedValue: 5 },
          { id: 'bkn-2026-1', year: 2026, team: 'Nets', estimatedValue: 5 },
          { id: 'bkn-2028-1', year: 2028, team: 'Nets', estimatedValue: 5 },
        ],
        needs: ['PG', 'ball handler', '3rd star'],
        winPct: 0.610,
        playoffOdds: 0.92,
      },
      {
        id: 'rockets',
        name: 'Houston Rockets',
        city: 'Houston',
        abbr: 'HOU',
        players: [
          { id: 'harden', name: 'James Harden', team: 'rockets', position: 'PG', salary: 41.3, age: 31, rating: 95, yearsLeft: 2 },
          { id: 'wood', name: 'Christian Wood', team: 'rockets', position: 'C', salary: 13.6, age: 25, rating: 80, yearsLeft: 2 },
        ],
        picks: [],
        needs: ['rebuilding', 'future picks', 'young players'],
        capSpace: 22.0,
        taxLine: 132.6,
        winPct: 0.171,
        playoffOdds: 0.02,
      },
      {
        id: 'cavaliers',
        name: 'Cleveland Cavaliers',
        city: 'Cleveland',
        abbr: 'CLE',
        capSpace: 5.0,
        taxLine: 132.6,
        players: [
          { id: 'sexton', name: 'Collin Sexton', team: 'cavaliers', position: 'PG', salary: 6.3, age: 22, rating: 76, yearsLeft: 1 },
          { id: 'garland', name: 'Darius Garland', team: 'cavaliers', position: 'PG', salary: 5.4, age: 20, rating: 78, yearsLeft: 2 },
        ],
        picks: [
          { id: 'cle-2022-1', year: 2022, team: 'Cavaliers', protected: 'Top 4 protected', estimatedValue: 6 },
        ],
        needs: ['SF', 'shooting', 'defense'],
        winPct: 0.280,
        playoffOdds: 0.10,
      },
    ],
    historicalOutcome: {
      summary: 'Brooklyn sent 4 unprotected first-round picks + multiple pick swaps + LeVert + Allen + Dinwiddie. Got Harden. Harden left after 1 year. All 4 picks conveyed as high-lottery picks during Houston rebuild.',
      winsChange: { nets: +3, rockets: -5 },
      capImpact: { nets: 'Locked in $300M+ in salaries for KD+Kyrie+Harden. No flexibility for 4 years.', rockets: 'Received 4 unprotected picks that became top-4 selections' },
      verdict: 'Houston Won Long-Term. Brooklyn gave up generational draft capital for a partnership that lasted 13 months.',
      score: 28,
    },
  },
  {
    id: 'durant-suns-2023',
    title: 'KD to Phoenix: Worth It?',
    year: 2023,
    description: 'Kevin Durant demands out of Brooklyn. You\'re Phoenix — do you mortgage the future for KD?',
    studentTeam: 'suns',
    goal: 'Land KD without crippling Phoenix\'s cap and draft future. You already have Booker and CP3 (expiring).',
    teams: [
      {
        id: 'suns',
        name: 'Phoenix Suns',
        city: 'Phoenix',
        abbr: 'PHX',
        capSpace: -8.0,
        taxLine: 162.0,
        players: [
          { id: 'booker', name: 'Devin Booker', team: 'suns', position: 'SG', salary: 36.0, age: 26, rating: 93, yearsLeft: 4, isUntouchable: true },
          { id: 'cp3', name: 'Chris Paul', team: 'suns', position: 'PG', salary: 30.8, age: 37, rating: 79, yearsLeft: 0 },
          { id: 'ayton', name: 'Deandre Ayton', team: 'suns', position: 'C', salary: 30.9, age: 24, rating: 83, yearsLeft: 3 },
          { id: 'bridges', name: 'Mikal Bridges', team: 'suns', position: 'SF', salary: 21.5, age: 26, rating: 84, yearsLeft: 3 },
          { id: 'johnson', name: 'Cameron Johnson', team: 'suns', position: 'SF', salary: 17.0, age: 26, rating: 79, yearsLeft: 3 },
        ],
        picks: [
          { id: 'phx-2023-1', year: 2023, team: 'Suns', estimatedValue: 5 },
          { id: 'phx-2025-1', year: 2025, team: 'Suns', estimatedValue: 5 },
          { id: 'phx-2027-1', year: 2027, team: 'Suns', estimatedValue: 5 },
          { id: 'phx-2029-1', year: 2029, team: 'Suns', estimatedValue: 5 },
        ],
        needs: ['superstar', 'wing', 'playmaker'],
        winPct: 0.573,
        playoffOdds: 0.88,
      },
      {
        id: 'nets',
        name: 'Brooklyn Nets',
        city: 'Brooklyn',
        abbr: 'BKN',
        capSpace: -15.0,
        taxLine: 162.0,
        players: [
          { id: 'kd-bkn', name: 'Kevin Durant', team: 'nets', position: 'SF', salary: 44.1, age: 34, rating: 97, yearsLeft: 3 },
          { id: 'ben', name: 'Ben Simmons', team: 'nets', position: 'PG', salary: 35.4, age: 26, rating: 74, yearsLeft: 3 },
        ],
        picks: [],
        needs: ['new direction', 'picks', 'young talent'],
        winPct: 0.402,
        playoffOdds: 0.50,
      },
    ],
    historicalOutcome: {
      summary: 'Phoenix traded Mikal Bridges, Cameron Johnson, Jae Crowder, 4 unprotected picks + 1 pick swap. Got KD. Suns went 49-33 but lost in 2nd round of playoffs. Bridges became a star in Brooklyn.',
      winsChange: { suns: +5, nets: -8 },
      capImpact: { suns: 'Added $44M KD to $36M Booker. Into second apron. Almost no flexibility.', nets: 'Received 4 unprotected firsts + quality young pieces for a fresh rebuild' },
      verdict: 'Jury is still out. Short-term suns are better. Long-term they gave up Bridges (becoming an all-star) and 4 picks.',
      score: 52,
    },
  },
];
