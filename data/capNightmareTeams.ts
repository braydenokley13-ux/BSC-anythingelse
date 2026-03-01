export interface CapPlayer {
  id: string;
  name: string;
  position: string;
  age: number;
  salary: number; // millions
  yearsLeft: number;
  rating: number; // 0-99 current
  projectedRating: Record<number, number>; // year offset -> rating
  tradeValue: number; // 1-10 how tradeable
  moraleImpact: number; // -5 to +5 (negative = cancer, positive = glue guy)
  canBeStretched: boolean;
  canBeBoughtOut: boolean;
  tradeInterest: string[]; // team IDs that might want them
}

export interface CapNightmareScenario {
  id: string;
  title: string;
  subtitle: string;
  team: string;
  teamAbbr: string;
  year: number;
  description: string;
  startingCapSituation: {
    totalSalary: number;
    capLine: number;
    taxLine: number;
    firstApron: number;
    secondApron: number;
    taxBill: number; // dollars over tax line
    picks: Array<{ year: number; protected?: string; value: number }>;
  };
  players: CapPlayer[];
  starMorale: number; // 0-100 (how happy the star is)
  starWantsOut: boolean;
  lockerRoomMorale: number; // 0-100
  winPct: number;
  realOutcome: {
    summary: string;
    result: string;
    score: number; // how well the real GM did 0-100
  };
}

export const CAP_NIGHTMARE_SCENARIOS: CapNightmareScenario[] = [
  {
    id: 'nets-2023',
    title: 'Brooklyn Nets — The Aftermath',
    subtitle: 'KD traded mid-season. Kyrie gone. Ben Simmons won\'t play. You\'re left holding the bill.',
    team: 'Brooklyn Nets',
    teamAbbr: 'BKN',
    year: 2023,
    description: 'The KD-Kyrie-Harden experiment is over. KD was traded to Phoenix. Kyrie demanded out and went to Dallas. You\'re left with Ben Simmons (won\'t play), bad contracts, no picks, and a franchise in shambles. Fix it.',
    startingCapSituation: {
      totalSalary: 174.2,
      capLine: 136.0,
      taxLine: 165.3,
      firstApron: 172.3,
      secondApron: 182.9,
      taxBill: 8.9,
      picks: [
        { year: 2025, protected: 'Top 4 protected', value: 3 },
        // All future picks traded to Houston for Harden
      ],
    },
    players: [
      {
        id: 'simmons',
        name: 'Ben Simmons',
        position: 'PG',
        age: 26,
        salary: 35.4,
        yearsLeft: 2,
        rating: 0, // won\'t play
        projectedRating: { 0: 0, 1: 72, 2: 78 },
        tradeValue: 2,
        moraleImpact: -4,
        canBeStretched: false,
        canBeBoughtOut: true,
        tradeInterest: ['kings', 'pacers'],
      },
      {
        id: 'bridges-bkn',
        name: 'Mikal Bridges',
        position: 'SF',
        age: 26,
        salary: 24.8,
        yearsLeft: 3,
        rating: 85,
        projectedRating: { 0: 85, 1: 87, 2: 88 },
        tradeValue: 9,
        moraleImpact: 3,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['knicks', 'heat', 'sixers', 'lakers'],
      },
      {
        id: 'finney-smith',
        name: 'Dorian Finney-Smith',
        position: 'SF',
        age: 29,
        salary: 14.4,
        yearsLeft: 2,
        rating: 76,
        projectedRating: { 0: 76, 1: 74, 2: 72 },
        tradeValue: 6,
        moraleImpact: 2,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['bucks', 'celtics'],
      },
      {
        id: 'claxton',
        name: 'Nic Claxton',
        position: 'C',
        age: 23,
        salary: 9.8,
        yearsLeft: 1,
        rating: 81,
        projectedRating: { 0: 81, 1: 84, 2: 86 },
        tradeValue: 8,
        moraleImpact: 2,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['heat', 'lakers', 'warriors'],
      },
      {
        id: 'thomas',
        name: 'Cam Thomas',
        position: 'SG',
        age: 21,
        salary: 4.2,
        yearsLeft: 2,
        rating: 79,
        projectedRating: { 0: 79, 1: 83, 2: 87 },
        tradeValue: 8,
        moraleImpact: 3,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['raptors', 'magic', 'pistons'],
      },
    ],
    starMorale: 55,
    starWantsOut: false,
    lockerRoomMorale: 38,
    winPct: 0.402,
    realOutcome: {
      summary: 'Nets traded Mikal Bridges to the Knicks for 4 unprotected firsts. Began a full-blown rebuild with Thomas and young players.',
      result: 'Won in the long run — got draft capital to rebuild properly. Painful short-term.',
      score: 72,
    },
  },
  {
    id: 'okc-2016',
    title: 'Oklahoma City — After Durant',
    subtitle: 'KD left for Golden State in free agency. You have Westbrook and a decision to make.',
    team: 'Oklahoma City Thunder',
    teamAbbr: 'OKC',
    year: 2016,
    description: 'Kevin Durant left for the Warriors in free agency. Westbrook is furious and motivated. You have him on max money, but no real second option, and the rest of the West is getting better. Rebuild or compete?',
    startingCapSituation: {
      totalSalary: 117.0,
      capLine: 94.1,
      taxLine: 113.3,
      firstApron: 121.0,
      secondApron: 131.0,
      taxBill: 3.7,
      picks: [
        { year: 2017, value: 8 },
        { year: 2018, value: 7 },
        { year: 2019, value: 6 },
      ],
    },
    players: [
      {
        id: 'westbrook',
        name: 'Russell Westbrook',
        position: 'PG',
        age: 27,
        salary: 26.5,
        yearsLeft: 1,
        rating: 92,
        projectedRating: { 0: 92, 1: 91, 2: 90 },
        tradeValue: 8,
        moraleImpact: 5,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['rockets', 'knicks', 'heat'],
      },
      {
        id: 'oladipo',
        name: 'Victor Oladipo',
        position: 'SG',
        age: 24,
        salary: 13.0,
        yearsLeft: 2,
        rating: 78,
        projectedRating: { 0: 78, 1: 83, 2: 87 },
        tradeValue: 7,
        moraleImpact: 3,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['pacers', 'bucks', 'magic'],
      },
      {
        id: 'kanter',
        name: 'Enes Kanter',
        position: 'C',
        age: 24,
        salary: 17.1,
        yearsLeft: 2,
        rating: 76,
        projectedRating: { 0: 76, 1: 75, 2: 74 },
        tradeValue: 4,
        moraleImpact: -1,
        canBeStretched: false,
        canBeBoughtOut: true,
        tradeInterest: ['knicks', 'bulls'],
      },
      {
        id: 'sabonis-domantas',
        name: 'Domantas Sabonis',
        position: 'PF',
        age: 20,
        salary: 2.4,
        yearsLeft: 2,
        rating: 73,
        projectedRating: { 0: 73, 1: 80, 2: 86 },
        tradeValue: 7,
        moraleImpact: 2,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['pacers', 'kings'],
      },
    ],
    starMorale: 85,
    starWantsOut: false,
    lockerRoomMorale: 70,
    winPct: 0.427,
    realOutcome: {
      summary: 'OKC extended Westbrook to a max deal ($200M over 5 years). Traded Oladipo and Sabonis for Paul George. Traded Westbrook later for a pick haul. Rebuilt into perennial lottery team.',
      result: 'Mixed: Westbrook extension + PG trade bought 2 competitive years but cost picks. The Westbrook trade to Houston yielded a massive pick haul that built OKC\'s new dynasty.',
      score: 65,
    },
  },
  {
    id: 'kings-2017',
    title: 'Sacramento Kings — 12 Years of Losing',
    subtitle: 'Boogie Cousins wants out. You\'re over the tax. No picks. No path. Just chaos.',
    team: 'Sacramento Kings',
    teamAbbr: 'SAC',
    year: 2017,
    description: 'The Kings haven\'t made the playoffs in 12 years — longest active drought in the NBA. DeMarcus Cousins is a generational talent but a locker room volcano. You\'re over the luxury tax, have no draft picks, and Cousins just told ESPN he wants to be traded. Chaos is an understatement.',
    startingCapSituation: {
      totalSalary: 119.4,
      capLine: 99.1,
      taxLine: 119.3,
      firstApron: 127.0,
      secondApron: 137.0,
      taxBill: 0.1,
      picks: [],
    },
    players: [
      {
        id: 'cousins',
        name: 'DeMarcus Cousins',
        position: 'C',
        age: 26,
        salary: 16.9,
        yearsLeft: 1,
        rating: 92,
        projectedRating: { 0: 92, 1: 90, 2: 88 },
        tradeValue: 9,
        moraleImpact: -3,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['pelicans', 'celtics', 'warriors', 'cavs'],
      },
      {
        id: 'rudy-gay',
        name: 'Rudy Gay',
        position: 'SF',
        age: 30,
        salary: 14.8,
        yearsLeft: 1,
        rating: 78,
        projectedRating: { 0: 78, 1: 76, 2: 74 },
        tradeValue: 4,
        moraleImpact: 1,
        canBeStretched: false,
        canBeBoughtOut: true,
        tradeInterest: ['spurs', 'hawks'],
      },
      {
        id: 'george-hill',
        name: 'George Hill',
        position: 'PG',
        age: 30,
        salary: 12.0,
        yearsLeft: 1,
        rating: 77,
        projectedRating: { 0: 77, 1: 75, 2: 72 },
        tradeValue: 5,
        moraleImpact: 2,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['cavaliers', 'spurs'],
      },
      {
        id: 'darren-collison',
        name: 'Darren Collison',
        position: 'PG',
        age: 29,
        salary: 6.0,
        yearsLeft: 1,
        rating: 74,
        projectedRating: { 0: 74, 1: 73, 2: 71 },
        tradeValue: 3,
        moraleImpact: 1,
        canBeStretched: false,
        canBeBoughtOut: true,
        tradeInterest: ['pacers'],
      },
      {
        id: 'willie-cauley-stein',
        name: 'Willie Cauley-Stein',
        position: 'C',
        age: 23,
        salary: 3.0,
        yearsLeft: 2,
        rating: 73,
        projectedRating: { 0: 73, 1: 77, 2: 81 },
        tradeValue: 6,
        moraleImpact: 2,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['hawks', 'suns', 'bulls'],
      },
    ],
    starMorale: 20,
    starWantsOut: true,
    lockerRoomMorale: 32,
    winPct: 0.329,
    realOutcome: {
      summary: 'Kings traded Cousins to New Orleans mid-season for a package headlined by Buddy Hield. Kings eventually drafted De\'Aaron Fox, traded for Harrison Barnes, and finally made the playoffs in 2023.',
      result: 'Kings eventually rebuilt correctly — Fox + Mitchell trade in 2022 produced a playoff team by 2023. The Cousins trade itself was considered a loss but unlocked the future.',
      score: 55,
    },
  },
  {
    id: 'cleveland-2018',
    title: 'Cleveland Post-LeBron',
    subtitle: 'LeBron left again. You\'re a lottery team with overpaid veterans and no path forward.',
    team: 'Cleveland Cavaliers',
    teamAbbr: 'CLE',
    year: 2018,
    description: 'LeBron left for the Lakers in free agency. Cleveland is back to lottery-land. You have aging veterans on contracts that don\'t fit a rebuild, but young assets if you play it right.',
    startingCapSituation: {
      totalSalary: 126.4,
      capLine: 101.9,
      taxLine: 122.3,
      firstApron: 130.0,
      secondApron: 140.0,
      taxBill: 4.1,
      picks: [
        { year: 2018, value: 9 }, // Top 3 pick in an exceptional draft
        { year: 2019, value: 7 },
        { year: 2020, value: 6 },
      ],
    },
    players: [
      {
        id: 'love',
        name: 'Kevin Love',
        position: 'PF',
        age: 29,
        salary: 24.1,
        yearsLeft: 3,
        rating: 82,
        projectedRating: { 0: 82, 1: 79, 2: 75 },
        tradeValue: 5,
        moraleImpact: 1,
        canBeStretched: false,
        canBeBoughtOut: true,
        tradeInterest: ['blazers', 'nets', 'knicks'],
      },
      {
        id: 'thompson-tristan',
        name: 'Tristan Thompson',
        position: 'C',
        age: 27,
        salary: 18.5,
        yearsLeft: 1,
        rating: 75,
        projectedRating: { 0: 75, 1: 73, 2: 70 },
        tradeValue: 3,
        moraleImpact: 0,
        canBeStretched: false,
        canBeBoughtOut: true,
        tradeInterest: ['nets', 'bulls'],
      },
      {
        id: 'sexton-young',
        name: 'Collin Sexton (Rookie)',
        position: 'PG',
        age: 19,
        salary: 4.0,
        yearsLeft: 3,
        rating: 74,
        projectedRating: { 0: 74, 1: 80, 2: 85 },
        tradeValue: 7,
        moraleImpact: 2,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: [],
      },
      {
        id: 'clarkson-jordan',
        name: 'Jordan Clarkson',
        position: 'SG',
        age: 25,
        salary: 13.0,
        yearsLeft: 1,
        rating: 76,
        projectedRating: { 0: 76, 1: 75, 2: 74 },
        tradeValue: 5,
        moraleImpact: 1,
        canBeStretched: false,
        canBeBoughtOut: false,
        tradeInterest: ['jazz', 'kings'],
      },
    ],
    starMorale: 60,
    starWantsOut: true,
    lockerRoomMorale: 42,
    winPct: 0.220,
    realOutcome: {
      summary: 'Cleveland took Darius Garland with the 5th pick. Traded Love eventually. Let veterans walk. Signed and developed Jarrett Allen. Built around Garland and Mitchell (acquired 2022).',
      result: 'Patient rebuild paid off — 2022 playoffs with an exciting young core. 4 years of patience required.',
      score: 78,
    },
  },
];

export const MLE_FREE_AGENTS = [
  { id: 'mle-1', name: 'Bruce Brown Jr.', position: 'SG', age: 27, salary: 12.0, rating: 77, moraleImpact: 2 },
  { id: 'mle-2', name: 'Nerlens Noel', position: 'C', age: 29, salary: 11.5, rating: 72, moraleImpact: 1 },
  { id: 'mle-3', name: 'Kyle Anderson', position: 'SF', age: 30, salary: 10.0, rating: 75, moraleImpact: 3 },
  { id: 'mle-4', name: 'Torrey Craig', position: 'SF', age: 32, salary: 8.0, rating: 71, moraleImpact: 2 },
  { id: 'mle-5', name: 'Jevon Carter', position: 'PG', age: 29, salary: 9.0, rating: 72, moraleImpact: 2 },
];

export const PRESS_EVENTS = [
  { text: '📣 Star gave an amazing press conference — locker room energy through the roof!', starMoraleChange: 10, lockerRoomChange: 8, fanConfidenceChange: 5 },
  { text: '📰 ESPN reported trade rumors — star morale took a hit.', starMoraleChange: -15, lockerRoomChange: -5, fanConfidenceChange: -5 },
  { text: '🤝 Veteran player stepped up as a leader — locker room cohesion improved.', starMoraleChange: 5, lockerRoomChange: 12, fanConfidenceChange: 8 },
  { text: '🎙️ GM gave a transparent press conference — fans appreciate the honesty.', starMoraleChange: 5, lockerRoomChange: 3, fanConfidenceChange: 15 },
  { text: '😤 Anonymous player sourced a locker room leak to the media. Trust is damaged.', starMoraleChange: -8, lockerRoomChange: -12, fanConfidenceChange: -10 },
  { text: '🏥 Team doctor cleared the star player to return ahead of schedule!', starMoraleChange: 15, lockerRoomChange: 8, fanConfidenceChange: 12 },
  { text: '📉 Poor season record is drawing national criticism. Pressure building.', starMoraleChange: -10, lockerRoomChange: -8, fanConfidenceChange: -15 },
  { text: '🌟 Young player had a breakout month — future of the franchise!', starMoraleChange: 5, lockerRoomChange: 10, fanConfidenceChange: 10 },
  { text: '🎉 Front office made a smart low-cost addition — players are impressed.', starMoraleChange: 8, lockerRoomChange: 8, fanConfidenceChange: 5 },
  { text: '🚌 Team bus incident — minor dispute between players caught on camera.', starMoraleChange: -5, lockerRoomChange: -10, fanConfidenceChange: -8 },
];

export const REBUILD_TOOLS = [
  {
    id: 'trade',
    name: 'Propose Trade',
    description: 'Send players to another team. Salary must match within 125% + $100K. AI GM will accept, counter, or reject.',
    icon: '🔄',
    realWorldExample: 'Lakers traded Pau Gasol (2019) to free cap space for LeBron\'s supporting cast. The cost: a fan-favorite left. The gain: roster flexibility.',
  },
  {
    id: 'stretch',
    name: 'Stretch Provision',
    description: 'Release a player and spread the remaining salary over twice the years left + 1. Clears cap now, hurts later.',
    icon: '📅',
    realWorldExample: 'Golden State used the stretch provision on Andrew Bogut in 2016 — spread his $12M over 3 seasons to stay under the tax threshold while chasing a championship.',
  },
  {
    id: 'buyout',
    name: 'Buyout',
    description: 'Negotiate to buy out remaining salary. Player becomes an unrestricted free agent immediately.',
    icon: '💸',
    realWorldExample: 'Kevin Durant was bought out by Brooklyn in 2023. The Nets ate $45M in exchange for immediate cap relief. KD then signed with Phoenix as a free agent.',
  },
  {
    id: 'mle',
    name: 'Sign via MLE',
    description: 'Use your Mid-Level Exception to sign a free agent at ~$8–12M/yr. You only get 1 MLE per season.',
    icon: '✍️',
    realWorldExample: 'Every NBA team gets an MLE even when over the salary cap. Golden State used their MLE to add key rotation players around Steph Curry during their dynasty years.',
  },
  {
    id: 'tank',
    name: 'Tank Mode',
    description: 'Bench your best players. Lower win% for better lottery odds. Risk: morale drops, star may demand trade.',
    icon: '🎯',
    realWorldExample: 'Houston Rockets tanked deliberately in 2021 after trading James Harden. Result: 3 lottery picks in 2 years, including Jalen Green (#2 overall). The short-term pain paid off.',
  },
];
