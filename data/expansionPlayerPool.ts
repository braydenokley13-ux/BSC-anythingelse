export interface ExpansionPlayer {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  position: string;
  age: number;
  salary: number; // millions
  yearsLeft: number;
  rating: number; // 0–99
  isProtected: boolean;
  chemistry: string[]; // player IDs they have good chemistry with
  archetype: 'Star' | 'Starter' | 'Rotation' | 'Project';
  injuryRisk: 'Low' | 'Medium' | 'High';
}

export interface CityProfile {
  id: string;
  name: string;
  arena: string;
  revenueMultiplier: number; // 1.0 = average
  fanbaseDifficulty: number; // 1-10 (10 = hardest to please)
  marketSize: 'Large' | 'Medium' | 'Small';
  baseAttendance: number; // average tickets sold per game
  cultureCoefficent: number; // bonus to morale if team wins
  expansionFee: number; // billions
  startingFanBase: number; // 1-10 (10 = passionate existing base)
}

export const CITY_PROFILES: CityProfile[] = [
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    arena: 'T-Mobile Arena',
    revenueMultiplier: 1.35,
    fanbaseDifficulty: 8,
    marketSize: 'Large',
    baseAttendance: 18400,
    cultureCoefficent: 1.1,
    expansionFee: 6.0,
    startingFanBase: 4,
  },
  {
    id: 'seattle',
    name: 'Seattle',
    arena: 'Climate Pledge Arena',
    revenueMultiplier: 1.15,
    fanbaseDifficulty: 6,
    marketSize: 'Medium',
    baseAttendance: 17500,
    cultureCoefficent: 1.4,
    expansionFee: 4.5,
    startingFanBase: 9,
  },
];

export const EXPANSION_PLAYER_POOL: ExpansionPlayer[] = [
  // Stars / Unprotected Top Players
  { id: 'trae', name: 'Trae Young', team: 'Atlanta Hawks', teamAbbr: 'ATL', position: 'PG', age: 25, salary: 43.0, yearsLeft: 3, rating: 88, isProtected: false, chemistry: ['hunter'], archetype: 'Star', injuryRisk: 'Medium' },
  { id: 'lavine-chi', name: 'Zach LaVine', team: 'Chicago Bulls', teamAbbr: 'CHI', position: 'SG', age: 29, salary: 43.9, yearsLeft: 2, rating: 83, isProtected: false, chemistry: [], archetype: 'Star', injuryRisk: 'High' },
  { id: 'myles', name: 'Myles Turner', team: 'Indiana Pacers', teamAbbr: 'IND', position: 'C', age: 28, salary: 19.0, yearsLeft: 1, rating: 82, isProtected: false, chemistry: ['haliburton'], archetype: 'Starter', injuryRisk: 'Low' },
  { id: 'obi', name: 'Obi Toppin', team: 'Indiana Pacers', teamAbbr: 'IND', position: 'PF', age: 25, salary: 14.0, yearsLeft: 2, rating: 77, isProtected: false, chemistry: ['haliburton', 'myles'], archetype: 'Starter', injuryRisk: 'Low' },
  { id: 'herro', name: 'Tyler Herro', team: 'Miami Heat', teamAbbr: 'MIA', position: 'SG', age: 24, salary: 32.6, yearsLeft: 3, rating: 84, isProtected: false, chemistry: [], archetype: 'Star', injuryRisk: 'Medium' },
  { id: 'lillard', name: 'Khris Middleton', team: 'Milwaukee Bucks', teamAbbr: 'MIL', position: 'SF', age: 32, salary: 33.9, yearsLeft: 1, rating: 79, isProtected: false, chemistry: [], archetype: 'Starter', injuryRisk: 'High' },
  { id: 'ant', name: 'Nickeil Alexander-Walker', team: 'Minnesota Timberwolves', teamAbbr: 'MIN', position: 'SG', age: 25, salary: 14.0, yearsLeft: 2, rating: 76, isProtected: false, chemistry: [], archetype: 'Rotation', injuryRisk: 'Low' },
  { id: 'obj-nba', name: 'Josh Hart', team: 'New York Knicks', teamAbbr: 'NYK', position: 'SG', age: 29, salary: 12.96, yearsLeft: 2, rating: 78, isProtected: false, chemistry: [], archetype: 'Rotation', injuryRisk: 'Low' },
  { id: 'sga', name: 'Isaiah Joe', team: 'Oklahoma City Thunder', teamAbbr: 'OKC', position: 'SG', age: 24, salary: 5.8, yearsLeft: 2, rating: 73, isProtected: false, chemistry: [], archetype: 'Rotation', injuryRisk: 'Low' },
  { id: 'simons', name: 'Anfernee Simons', team: 'Portland Trail Blazers', teamAbbr: 'POR', position: 'SG', age: 25, salary: 25.8, yearsLeft: 3, rating: 81, isProtected: false, chemistry: [], archetype: 'Starter', injuryRisk: 'Medium' },
  { id: 'fox', name: 'Malik Monk', team: 'Sacramento Kings', teamAbbr: 'SAC', position: 'SG', age: 26, salary: 19.0, yearsLeft: 2, rating: 78, isProtected: false, chemistry: ['fox'], archetype: 'Rotation', injuryRisk: 'Low' },
  { id: 'devin-vassell', name: 'Devin Vassell', team: 'San Antonio Spurs', teamAbbr: 'SAS', position: 'SG', age: 24, salary: 18.0, yearsLeft: 3, rating: 79, isProtected: false, chemistry: [], archetype: 'Starter', injuryRisk: 'Medium' },
  { id: 'keldon', name: 'Keldon Johnson', team: 'San Antonio Spurs', teamAbbr: 'SAS', position: 'SF', age: 24, salary: 13.0, yearsLeft: 2, rating: 76, isProtected: false, chemistry: ['devin-vassell'], archetype: 'Rotation', injuryRisk: 'Low' },
  { id: 'poeltl', name: 'Jakob Poeltl', team: 'Toronto Raptors', teamAbbr: 'TOR', position: 'C', age: 28, salary: 19.5, yearsLeft: 3, rating: 80, isProtected: false, chemistry: [], archetype: 'Starter', injuryRisk: 'Low' },
  { id: 'banchero', name: 'Wendell Carter Jr.', team: 'Orlando Magic', teamAbbr: 'ORL', position: 'C', age: 25, salary: 16.5, yearsLeft: 2, rating: 78, isProtected: false, chemistry: [], archetype: 'Starter', injuryRisk: 'Medium' },
  // Protected players (cannot be taken)
  { id: 'curry', name: 'Stephen Curry', team: 'Golden State Warriors', teamAbbr: 'GSW', position: 'PG', age: 36, salary: 51.9, yearsLeft: 2, rating: 95, isProtected: true, chemistry: [], archetype: 'Star', injuryRisk: 'Low' },
  { id: 'giannis', name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', teamAbbr: 'MIL', position: 'PF', age: 29, salary: 45.6, yearsLeft: 4, rating: 97, isProtected: true, chemistry: [], archetype: 'Star', injuryRisk: 'Low' },
  { id: 'jokic', name: 'Nikola Jokic', team: 'Denver Nuggets', teamAbbr: 'DEN', position: 'C', age: 29, salary: 47.6, yearsLeft: 3, rating: 99, isProtected: true, chemistry: [], archetype: 'Star', injuryRisk: 'Low' },
];

export const FREE_AGENT_POOL = [
  { id: 'fa-1', name: 'Dennis Schroder', position: 'PG', age: 30, salary: 13.0, rating: 76, archetype: 'Rotation' as const, injuryRisk: 'Low' as const },
  { id: 'fa-2', name: 'Bogdan Bogdanovic', position: 'SG', age: 31, salary: 18.0, rating: 78, archetype: 'Rotation' as const, injuryRisk: 'Medium' as const },
  { id: 'fa-3', name: 'Gary Trent Jr.', position: 'SG', age: 25, salary: 19.0, rating: 77, archetype: 'Starter' as const, injuryRisk: 'Low' as const },
  { id: 'fa-4', name: 'Georges Niang', position: 'PF', age: 31, salary: 10.0, rating: 74, archetype: 'Rotation' as const, injuryRisk: 'Low' as const },
  { id: 'fa-5', name: 'Montrezl Harrell', position: 'C', age: 30, salary: 6.0, rating: 74, archetype: 'Rotation' as const, injuryRisk: 'Low' as const },
  { id: 'fa-6', name: 'Duncan Robinson', position: 'SG', age: 30, salary: 18.3, rating: 76, archetype: 'Rotation' as const, injuryRisk: 'Low' as const },
  { id: 'fa-7', name: 'Isaiah Hartenstein', position: 'C', age: 25, salary: 16.0, rating: 78, archetype: 'Starter' as const, injuryRisk: 'Low' as const },
  { id: 'fa-8', name: 'Malik Beasley', position: 'SG', age: 27, salary: 14.0, rating: 74, archetype: 'Rotation' as const, injuryRisk: 'Low' as const },
  { id: 'fa-9', name: 'Mo Bamba', position: 'C', age: 25, salary: 10.0, rating: 72, archetype: 'Rotation' as const, injuryRisk: 'High' as const },
  { id: 'fa-10', name: 'Reggie Bullock', position: 'SF', age: 33, salary: 8.0, rating: 72, archetype: 'Rotation' as const, injuryRisk: 'Medium' as const },
];

export const NBA_SALARY_CAP_2024 = 140.6;
export const NBA_SALARY_FLOOR_PCT = 0.90;
export const NBA_SALARY_FLOOR = NBA_SALARY_CAP_2024 * NBA_SALARY_FLOOR_PCT;
export const EXPANSION_CAP_ALLOTMENT = 102.0; // expansion teams get a slight discount
