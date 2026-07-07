import { z } from 'zod';

const nullableNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
}, z.number().int().optional());

export const registerSchema = z.object({
  name: z.string().min(3, 'Informe um nome com pelo menos 3 caracteres.'),
  email: z.string().email('Informe um e-mail válido.').toLowerCase(),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.')
});

export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.').toLowerCase(),
  password: z.string().min(1, 'Informe sua senha.')
});

export const playerSchema = z.object({
  name: z.string().min(2),
  club: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  mainPosition: z.string().min(1),
  secondaryPositions: z.string().optional().nullable(),
  playstyle: z.string().optional().nullable(),
  height: nullableNumber,
  weight: nullableNumber,
  age: nullableNumber,
  dominantFoot: z.enum(['RIGHT', 'LEFT', 'BOTH']).default('RIGHT')
});

export const attributeSchema = z.object({
  offensiveAwareness: z.coerce.number().int().min(1).max(110).default(70),
  ballControl: z.coerce.number().int().min(1).max(110).default(70),
  dribbling: z.coerce.number().int().min(1).max(110).default(70),
  tightPossession: z.coerce.number().int().min(1).max(110).default(70),
  lowPass: z.coerce.number().int().min(1).max(110).default(70),
  loftedPass: z.coerce.number().int().min(1).max(110).default(70),
  finishing: z.coerce.number().int().min(1).max(110).default(70),
  heading: z.coerce.number().int().min(1).max(110).default(70),
  placeKicking: z.coerce.number().int().min(1).max(110).default(70),
  curl: z.coerce.number().int().min(1).max(110).default(70),
  speed: z.coerce.number().int().min(1).max(110).default(70),
  acceleration: z.coerce.number().int().min(1).max(110).default(70),
  kickingPower: z.coerce.number().int().min(1).max(110).default(70),
  jump: z.coerce.number().int().min(1).max(110).default(70),
  physicalContact: z.coerce.number().int().min(1).max(110).default(70),
  balance: z.coerce.number().int().min(1).max(110).default(70),
  stamina: z.coerce.number().int().min(1).max(110).default(70),
  defensiveAwareness: z.coerce.number().int().min(1).max(110).default(50),
  tackling: z.coerce.number().int().min(1).max(110).default(50),
  aggression: z.coerce.number().int().min(1).max(110).default(50),
  defensiveEngagement: z.coerce.number().int().min(1).max(110).default(50),
  goalkeeperAwareness: z.coerce.number().int().min(1).max(110).default(40),
  goalkeeperCatching: z.coerce.number().int().min(1).max(110).default(40),
  goalkeeperParrying: z.coerce.number().int().min(1).max(110).default(40),
  goalkeeperReflexes: z.coerce.number().int().min(1).max(110).default(40),
  goalkeeperReach: z.coerce.number().int().min(1).max(110).default(40)
});

export const cardSchema = z.object({
  playerId: z.string().min(1),
  name: z.string().min(2),
  season: z.string().optional().nullable(),
  rarity: z.enum(['STANDARD', 'FEATURED', 'POTW', 'HIGHLIGHT', 'TRENDING', 'LEGEND', 'EPIC', 'BIG_TIME', 'SHOW_TIME', 'SPECIAL']).default('STANDARD'),
  overall: z.coerce.number().int().min(1).max(120),
  maxOverall: nullableNumber,
  playstyle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  positions: z.string().optional().nullable(),
  attributes: attributeSchema.optional()
});

export const buildRequestSchema = z.object({
  cardId: z.string().min(1),
  objective: z.enum(['COMPETITIVE', 'MAX_OVERALL', 'FINISHER', 'CREATOR', 'DRIBBLER', 'PRESSING', 'POSSESSION', 'QUICK_COUNTER', 'DEFENSIVE', 'AERIAL']).default('COMPETITIVE'),
  targetPosition: z.string().min(1).default('AUTO'),
  formation: z.string().default('4-2-2-2'),
  teamStyle: z.string().default('Quick Counter'),
  save: z.boolean().default(false)
});

export const compareSchema = z.object({
  cardIds: z.array(z.string()).min(2).max(4),
  targetPosition: z.string().default('AUTO'),
  teamStyle: z.string().default('Quick Counter')
});
