export type Objective =
  | 'COMPETITIVE'
  | 'FINISHER'
  | 'CREATOR'
  | 'DRIBBLER'
  | 'PRESSING'
  | 'POSSESSION'
  | 'QUICK_COUNTER'
  | 'DEFENSIVE'
  | 'AERIAL';

export type PositionCode = 'CF' | 'SS' | 'LWF' | 'RWF' | 'LMF' | 'RMF' | 'AMF' | 'CMF' | 'DMF' | 'CB' | 'LB' | 'RB' | 'GK';

export type AttributeKey =
  | 'offensiveAwareness'
  | 'ballControl'
  | 'dribbling'
  | 'tightPossession'
  | 'lowPass'
  | 'loftedPass'
  | 'finishing'
  | 'heading'
  | 'placeKicking'
  | 'curl'
  | 'defensiveAwareness'
  | 'defensiveEngagement'
  | 'tackling'
  | 'aggression'
  | 'goalkeeperAwareness'
  | 'goalkeeperCatching'
  | 'goalkeeperParrying'
  | 'goalkeeperReflexes'
  | 'goalkeeperReach'
  | 'speed'
  | 'acceleration'
  | 'kickingPower'
  | 'jump'
  | 'physicalContact'
  | 'balance'
  | 'stamina';

export type Attributes = Partial<Record<AttributeKey, number>>;
export type PositionRatings = Partial<Record<PositionCode, number>>;

export type TrainingKey =
  | 'shooting'
  | 'passing'
  | 'dribbling'
  | 'dexterity'
  | 'lowerBodyStrength'
  | 'aerialStrength'
  | 'defending'
  | 'gk1'
  | 'gk2'
  | 'gk3';

export type TrainingPlan = Record<TrainingKey, number>;

export type Impetus = {
  name: string;
  value?: number | null;
  active?: boolean;
};

export type PhysicalProfile = {
  armLength?: number | null;
  shoulderWidth?: number | null;
  neckLength?: number | null;
  chest?: number | null;
  neckSize?: number | null;
  shoulderHeight?: number | null;
  legLength?: number | null;
  thighSize?: number | null;
  waistSize?: number | null;
  armSize?: number | null;
  calfSize?: number | null;
  legCoverageRadius?: number | null;
  armCoverageRadius?: number | null;
  jumpHeight?: number | null;
  trunkCollision?: number | null;
  baseHeight?: number | null;
};

export type PlayerCondition = {
  weakFootFrequency?: string | null;
  weakFootAccuracy?: string | null;
  form?: string | null;
  injuryResistance?: string | null;
};

export type ParsedCard = {
  playerName: string;
  cardType: string;
  specialTag?: string | null;
  country?: string | null;
  mainPosition: PositionCode;
  mainPositionPt: string;
  positions: PositionCode[];
  positionsPt: string[];
  positionRatings: PositionRatings;
  playstyle?: string | null;
  dominantFoot?: string | null;
  overall?: number | null;
  maxOverall?: number | null;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  level?: number | null;
  trainingPointsTotal?: number | null;
  trainingPointsUsed?: number | null;
  trainingPointSource?: 'OCR' | 'LEVEL_INFERRED' | 'FALLBACK';
  condition: PlayerCondition;
  impetos: Impetus[];
  nativeSkills: string[];
  specialSkills: string[];
  attributes: Attributes;
  physicalProfile: PhysicalProfile;
  internalId: string;
  confidence: number;
  warnings: string[];
};

export type AnalysisResult = {
  parsed: ParsedCard;
  bestPosition: { code: PositionCode; label: string; score: number };
  positionScores: Array<{ code: PositionCode; label: string; score: number; role: string; cardRating?: number | null }>;
  pri: Record<string, number>;
  tacticalFit: Record<string, number>;
  training: TrainingPlan;
  trainingCost: TrainingPlan;
  trainingPointsUsed: number;
  trainingPointsTotal: number;
  trainingPointsRemaining: number;
  trainingCostRule: string;
  recommendedSkills: string[];
  buildName: string;
  strengths: string[];
  weaknesses: string[];
  usageTips: string[];
  note: string;
};

export const POSITION_PT: Record<PositionCode, string> = {
  CF: 'CA',
  SS: 'SA',
  LWF: 'PE',
  RWF: 'PD',
  LMF: 'ME',
  RMF: 'MD',
  AMF: 'MAT',
  CMF: 'MC',
  DMF: 'VOL',
  CB: 'ZAG',
  LB: 'LE',
  RB: 'LD',
  GK: 'GOL'
};

export const POSITION_LABELS: Array<{ code: PositionCode | 'AUTO'; label: string }> = [
  { code: 'AUTO', label: 'Automático' },
  { code: 'CF', label: 'CA - Centroavante' },
  { code: 'SS', label: 'SA - Segundo atacante' },
  { code: 'LWF', label: 'PE - Ponta esquerda' },
  { code: 'RWF', label: 'PD - Ponta direita' },
  { code: 'LMF', label: 'ME - Meia esquerda' },
  { code: 'RMF', label: 'MD - Meia direita' },
  { code: 'AMF', label: 'MAT - Meia atacante' },
  { code: 'CMF', label: 'MC - Meia central' },
  { code: 'DMF', label: 'VOL - Volante' },
  { code: 'CB', label: 'ZAG - Zagueiro' },
  { code: 'LB', label: 'LE - Lateral esquerdo' },
  { code: 'RB', label: 'LD - Lateral direito' },
  { code: 'GK', label: 'GOL - Goleiro' }
];

const ALL_POSITIONS = Object.keys(POSITION_PT) as PositionCode[];

function attr(overrides: Attributes = {}): Required<Attributes> {
  const base: Required<Attributes> = {
    offensiveAwareness: 68,
    ballControl: 68,
    dribbling: 68,
    tightPossession: 68,
    lowPass: 68,
    loftedPass: 68,
    finishing: 68,
    heading: 68,
    placeKicking: 60,
    curl: 64,
    defensiveAwareness: 50,
    defensiveEngagement: 50,
    tackling: 50,
    aggression: 52,
    goalkeeperAwareness: 40,
    goalkeeperCatching: 40,
    goalkeeperParrying: 40,
    goalkeeperReflexes: 40,
    goalkeeperReach: 40,
    speed: 70,
    acceleration: 70,
    kickingPower: 70,
    jump: 68,
    physicalContact: 68,
    balance: 68,
    stamina: 70
  };
  return { ...base, ...overrides };
}

const BASE_BY_POSITION: Record<PositionCode, Required<Attributes>> = {
  CF: attr({ offensiveAwareness: 86, finishing: 86, heading: 78, kickingPower: 84, speed: 80, acceleration: 78, physicalContact: 78, balance: 74, stamina: 78 }),
  SS: attr({ offensiveAwareness: 84, ballControl: 86, dribbling: 86, tightPossession: 84, finishing: 82, lowPass: 80, speed: 82, acceleration: 84, balance: 84, stamina: 78 }),
  LWF: attr({ offensiveAwareness: 80, ballControl: 84, dribbling: 88, tightPossession: 84, finishing: 78, lowPass: 76, loftedPass: 74, speed: 88, acceleration: 88, curl: 82, balance: 84, stamina: 80 }),
  RWF: attr({ offensiveAwareness: 80, ballControl: 84, dribbling: 88, tightPossession: 84, finishing: 78, lowPass: 76, loftedPass: 74, speed: 88, acceleration: 88, curl: 82, balance: 84, stamina: 80 }),
  LMF: attr({ speed: 84, acceleration: 82, stamina: 86, defensiveAwareness: 72, tackling: 74, lowPass: 78, loftedPass: 82, dribbling: 82, ballControl: 82 }),
  RMF: attr({ speed: 84, acceleration: 82, stamina: 86, defensiveAwareness: 72, tackling: 74, lowPass: 78, loftedPass: 82, dribbling: 82, ballControl: 82 }),
  AMF: attr({ offensiveAwareness: 82, ballControl: 88, dribbling: 84, tightPossession: 88, lowPass: 88, loftedPass: 84, finishing: 76, curl: 82, balance: 82, stamina: 78 }),
  CMF: attr({ ballControl: 82, dribbling: 78, lowPass: 84, loftedPass: 82, defensiveAwareness: 72, tackling: 72, defensiveEngagement: 74, aggression: 74, stamina: 86, physicalContact: 76 }),
  DMF: attr({ ballControl: 78, lowPass: 82, loftedPass: 78, defensiveAwareness: 86, tackling: 86, defensiveEngagement: 86, aggression: 84, physicalContact: 84, stamina: 86 }),
  CB: attr({ defensiveAwareness: 88, tackling: 88, defensiveEngagement: 86, aggression: 84, physicalContact: 88, heading: 84, jump: 84, speed: 72, stamina: 80 }),
  LB: attr({ speed: 84, acceleration: 82, stamina: 86, defensiveAwareness: 76, tackling: 76, lowPass: 76, loftedPass: 80, dribbling: 76 }),
  RB: attr({ speed: 84, acceleration: 82, stamina: 86, defensiveAwareness: 76, tackling: 76, lowPass: 76, loftedPass: 80, dribbling: 76 }),
  GK: attr({ goalkeeperAwareness: 88, goalkeeperCatching: 84, goalkeeperParrying: 84, goalkeeperReflexes: 88, goalkeeperReach: 86, jump: 78, physicalContact: 80 })
};

const ATTRIBUTE_LABELS: Array<[AttributeKey, RegExp[]]> = [
  ['offensiveAwareness', [/talento\s+ofensivo\s*(\d{2,3})/i, /consci[eê]ncia\s+ofensiva\s*(\d{2,3})/i, /offensive\s+awareness\s*(\d{2,3})/i]],
  ['ballControl', [/controle\s+de\s+bola\s*(\d{2,3})/i, /ball\s+control\s*(\d{2,3})/i]],
  ['dribbling', [/(?:^|\s)drible\s*(\d{2,3})/i, /dribbling\s*(\d{2,3})/i]],
  ['tightPossession', [/condu[cç][aã]o\s+firme\s*(\d{2,3})/i, /tight\s+possession\s*(\d{2,3})/i]],
  ['lowPass', [/passe\s+rasteiro\s*(\d{2,3})/i, /low\s+pass\s*(\d{2,3})/i]],
  ['loftedPass', [/passe\s+alto\s*(\d{2,3})/i, /lofted\s+pass\s*(\d{2,3})/i]],
  ['finishing', [/finaliza[cç][aã]o\s*(\d{2,3})/i, /finishing\s*(\d{2,3})/i]],
  ['heading', [/cabe[cç]ada\s*(\d{2,3})/i, /heading\s*(\d{2,3})/i]],
  ['placeKicking', [/cobran[cç]a\s+de\s+bola\s+parada\s*(\d{2,3})/i, /bola\s+parada\s*(\d{2,3})/i, /place\s+kicking\s*(\d{2,3})/i]],
  ['curl', [/curva\s*(\d{2,3})/i, /curl\s*(\d{2,3})/i]],
  ['defensiveAwareness', [/talento\s+defensivo\s*(\d{2,3})/i, /consci[eê]ncia\s+defensiva\s*(\d{2,3})/i, /defensive\s+awareness\s*(\d{2,3})/i]],
  ['defensiveEngagement', [/dedica[cç][aã]o\s+defensiva\s*(\d{2,3})/i, /engajamento\s+defensivo\s*(\d{2,3})/i, /defensive\s+engagement\s*(\d{2,3})/i]],
  ['tackling', [/desarme\s*(\d{2,3})/i, /tackling\s*(\d{2,3})/i]],
  ['aggression', [/agressividade\s*(\d{2,3})/i, /aggression\s*(\d{2,3})/i]],
  ['goalkeeperAwareness', [/talento\s+de\s+go\s*(\d{2,3})/i, /talento\s+de\s+gol\s*(\d{2,3})/i, /goalkeeper\s+awareness\s*(\d{2,3})/i]],
  ['goalkeeperCatching', [/firmeza\s+do\s+go\s*(\d{2,3})/i, /firmeza\s+do\s+gol\s*(\d{2,3})/i, /catching\s*(\d{2,3})/i]],
  ['goalkeeperParrying', [/defesa\s+do\s+go\s*(\d{2,3})/i, /defesa\s+do\s+gol\s*(\d{2,3})/i, /parrying\s*(\d{2,3})/i]],
  ['goalkeeperReflexes', [/reflexos\s+do\s+go\s*(\d{2,3})/i, /reflexos\s+do\s+gol\s*(\d{2,3})/i, /reflexes\s*(\d{2,3})/i]],
  ['goalkeeperReach', [/alcance\s+do\s+go\s*(\d{2,3})/i, /alcance\s+do\s+gol\s*(\d{2,3})/i, /reach\s*(\d{2,3})/i]],
  ['speed', [/velocidade\s*(\d{2,3})/i, /speed\s*(\d{2,3})/i]],
  ['acceleration', [/acelera[cç][aã]o\s*(\d{2,3})/i, /acceleration\s*(\d{2,3})/i]],
  ['kickingPower', [/for[cç]a\s+do\s+chute\s*(\d{2,3})/i, /kicking\s+power\s*(\d{2,3})/i]],
  ['jump', [/salto\s*(\d{2,3})/i, /jump\s*(\d{2,3})/i]],
  ['physicalContact', [/contato\s+f[ií]sico\s*(\d{2,3})/i, /physical\s+contact\s*(\d{2,3})/i]],
  ['balance', [/equil[ií]brio\s*(\d{2,3})/i, /balance\s*(\d{2,3})/i]],
  ['stamina', [/resist[eê]ncia\s*(\d{2,3})/i, /stamina\s*(\d{2,3})/i]]
];

const SKILL_PROFILES: Record<string, { category: string; boosts: Partial<Record<string, number>>; aliases?: string[] }> = {
  'Pedalada simples': { category: 'DRIBLE', boosts: { dribbling: 2, mobility: 1 }, aliases: ['Scissors Feint', 'Pedalada'] },
  'Toque duplo': { category: 'DRIBLE', boosts: { dribbling: 4, mobility: 2 }, aliases: ['Double Touch', 'Toque Duplo'] },
  'Elástico': { category: 'DRIBLE', boosts: { dribbling: 3, mobility: 1 }, aliases: ['Flip Flap', 'Elastico'] },
  'Giro 360°': { category: 'DRIBLE', boosts: { dribbling: 2, mobility: 1 }, aliases: ['Marseille Turn', 'Giro 360'] },
  'Chapéu': { category: 'DRIBLE', boosts: { dribbling: 2, mobility: 1 }, aliases: ['Sombrero', 'Chaleira'] },
  'Corte com virada': { category: 'DRIBLE', boosts: { dribbling: 3, mobility: 1 }, aliases: ['Cut Behind & Turn', 'Corte com virada'] },
  'Puxada de letra': { category: 'DRIBLE', boosts: { dribbling: 2, creation: 1 }, aliases: ['Scotch Move'] },
  'Finta de letra': { category: 'DRIBLE', boosts: { dribbling: 2, mobility: 1 }, aliases: ['Step On Skill Control'] },
  'Controle com a sola': { category: 'DRIBLE', boosts: { dribbling: 4, creation: 1 }, aliases: ['Sole Control', 'Controle com sola', 'Controle de sola'] },
  'Cabeçada': { category: 'FINALIZAÇÃO', boosts: { finishing: 2, aerial: 2 }, aliases: ['Heading'] },
  'Efeito de longe': { category: 'FINALIZAÇÃO', boosts: { finishing: 3, creation: 1 }, aliases: ['Long-Range Curler'] },
  'Controle da cavadinha': { category: 'FINALIZAÇÃO', boosts: { finishing: 2 }, aliases: ['Chip Shot Control'] },
  'Chute com o peito do pé': { category: 'FINALIZAÇÃO', boosts: { finishing: 3 }, aliases: ['Knuckle Shot'] },
  'Folha seca': { category: 'FINALIZAÇÃO', boosts: { finishing: 2 }, aliases: ['Dipping Shot'] },
  'Chute ascendente': { category: 'FINALIZAÇÃO', boosts: { finishing: 2 }, aliases: ['Rising Shot'] },
  'Precisão à distância': { category: 'FINALIZAÇÃO', boosts: { finishing: 3 }, aliases: ['Long-Range Shooting', 'Precisao a distancia', 'Precisão a distância'] },
  'Finalização acrobática': { category: 'FINALIZAÇÃO', boosts: { finishing: 3, mobility: 1 }, aliases: ['Acrobatic Finishing', 'Finaliz. acrobática', 'Finaliz acrobática', 'Finaliz. acrobatica'] },
  'Toque de calcanhar': { category: 'PASSE', boosts: { creation: 2, dribbling: 1 }, aliases: ['Heel Trick'] },
  'Chute de primeira': { category: 'FINALIZAÇÃO', boosts: { finishing: 4 }, aliases: ['First-time Shot', 'First Time Shot'] },
  'Passe de primeira': { category: 'PASSE', boosts: { creation: 4, pressure: 1 }, aliases: ['One-touch Pass', 'One Touch Pass', 'Passe primeira'] },
  'Passe em profundidade': { category: 'PASSE', boosts: { creation: 4 }, aliases: ['Through Passing', 'Passe Profundidade'] },
  'Passe na medida': { category: 'PASSE', boosts: { creation: 3 }, aliases: ['Weighted Pass'] },
  'Cruzamento preciso': { category: 'PASSE', boosts: { creation: 3 }, aliases: ['Pinpoint Crossing'] },
  'Curva para fora': { category: 'PASSE', boosts: { creation: 2, finishing: 1 }, aliases: ['Outside Curler'] },
  'De letra': { category: 'PASSE', boosts: { creation: 2 }, aliases: ['Rabona'] },
  'Passe sem olhar': { category: 'PASSE', boosts: { creation: 2 }, aliases: ['No Look Pass'] },
  'Passe aéreo baixo': { category: 'PASSE', boosts: { creation: 2 }, aliases: ['Low Lofted Pass'] },
  'Arremesso lateral longo': { category: 'PASSE', boosts: { creation: 1 }, aliases: ['Long Throw'] },
  'Especialista em pênalti': { category: 'FINALIZAÇÃO', boosts: { finishing: 1 }, aliases: ['Penalty Specialist'] },
  'Malícia': { category: 'MENTAL', boosts: { pressure: 2 }, aliases: ['Gamesmanship'] },
  'Marcação individual': { category: 'DEFESA', boosts: { defense: 4, pressure: 2 }, aliases: ['Man Marking', 'Marcação ind.', 'Marcacao ind.', 'Marcação indiv.', 'Marcacao indiv.'] },
  'Volta para marcar': { category: 'DEFESA', boosts: { defense: 3, pressure: 4 }, aliases: ['Track Back'] },
  'Interceptação': { category: 'DEFESA', boosts: { defense: 4, pressure: 2 }, aliases: ['Interception'] },
  'Bloqueador': { category: 'DEFESA', boosts: { defense: 4, physical: 1 }, aliases: ['Blocker', 'Bloqueio'] },
  'Superioridade aérea': { category: 'DEFESA', boosts: { aerial: 4, physical: 2 }, aliases: ['Aerial Superiority'] },
  'Carrinho': { category: 'DEFESA', boosts: { defense: 2 }, aliases: ['Sliding Tackle', 'Carrinho preciso'] },
  'Afastamento acrobático': { category: 'DEFESA', boosts: { defense: 2, aerial: 1 }, aliases: ['Acrobatic Clearance'] },
  'Liderança': { category: 'MENTAL', boosts: { stamina: 2, pressure: 2 }, aliases: ['Captaincy'] },
  'Super substituto': { category: 'MENTAL', boosts: { finishing: 2, mobility: 2 }, aliases: ['Super-sub', 'Super Sub'] },
  'Espírito guerreiro': { category: 'MENTAL', boosts: { stamina: 4, pressure: 2 }, aliases: ['Fighting Spirit', 'Espirito guerreiro'] },
  'Esticada de Perna': { category: 'ÍMPETO', boosts: { defense: 2, physical: 1 }, aliases: ['Long Legs', 'Esticada da Perna', 'Esticada de perna'] },
  'Sombra veloz': { category: 'ÍMPETO', boosts: { mobility: 2, pressure: 1 }, aliases: ['Speeding Bullet', 'Sombra Veloz'] },
  'Finalizador nato': { category: 'ÍMPETO', boosts: { finishing: 3 }, aliases: ['Born Finisher'] }
};

const SPECIAL_SKILL_NAMES = ['Esticada de Perna', 'Sombra veloz', 'Finalizador nato'];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(value: string): string {
  return normalize(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function cleanLine(line: string) {
  return line.replace(/[|•·]/g, ' ').replace(/\s+/g, ' ').trim();
}

function clamp(value: number, min = 1, max = 110) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampDecimal(value: number, min = 1, max = 110) {
  return Math.max(min, Math.min(max, Number(value.toFixed(1))));
}

function avg(...values: Array<number | undefined>) {
  const usable = values.filter((value): value is number => Number.isFinite(value));
  if (!usable.length) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function readNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = Number(String(match[1]).replace(',', '.'));
      if (Number.isFinite(value)) return value;
    }
  }
  return null;
}

function textHas(text: string, candidate: string): boolean {
  return normalize(text).toLowerCase().includes(normalize(candidate).toLowerCase());
}

function skillKey(skill: string): string {
  return slug(skill).replace(/-/g, '');
}

function uniqueSkillList(skills: string[]) {
  const map = new Map<string, string>();
  for (const skill of skills) {
    if (SKILL_PROFILES[skill]) map.set(skillKey(skill), skill);
  }
  return Array.from(map.values());
}

function detectPositions(text: string): PositionCode[] {
  const normalized = ` ${normalize(text).toUpperCase()} `;
  const aliases: Array<[PositionCode, RegExp]> = [
    ['CF', /\b(CF|CA|CENTROAVANTE)\b/],
    ['SS', /\b(SS|SA|SEGUNDO ATACANTE|SEGUNDO\s+ATACANTE)\b/],
    ['LWF', /\b(LWF|PE|PTE|PONTA ESQUERDA)\b/],
    ['RWF', /\b(RWF|PD|PTD|PONTA DIREITA)\b/],
    ['LMF', /\b(LMF|ME|MEIA ESQUERDA)\b/],
    ['RMF', /\b(RMF|MD|MEIA DIREITA)\b/],
    ['AMF', /\b(AMF|MAT|MEIA ATACANTE|MEI[AO] ATACANTE)\b/],
    ['CMF', /\b(CMF|MC|MEIA CENTRAL)\b/],
    ['DMF', /\b(DMF|VOL|VOLANTE)\b/],
    ['CB', /\b(CB|ZAG|ZAGUEIRO)\b/],
    ['LB', /\b(LB|LE|LATERAL ESQUERDO)\b/],
    ['RB', /\b(RB|LD|LATERAL DIREITO)\b/],
    ['GK', /\b(GK|GOL|GOLEIRO)\b/]
  ];
  const detected = aliases.filter(([, regex]) => regex.test(normalized)).map(([code]) => code);
  return Array.from(new Set(detected));
}

function detectPositionRatings(text: string): PositionRatings {
  const ratings: PositionRatings = {};
  const normalized = normalize(text).toUpperCase();
  const lines = normalized.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const setRating = (code: PositionCode, value: number) => {
    if (value >= 40 && value <= 110 && ratings[code] === undefined) ratings[code] = value;
  };

  const ptMap: Array<[PositionCode, string[]]> = [
    ['CF', ['CF', 'CA', 'CENTROAVANTE']],
    ['SS', ['SS', 'SA', 'SEGUNDO ATACANTE']],
    ['LWF', ['LWF', 'PE', 'PTE', 'PONTA ESQUERDA']],
    ['RWF', ['RWF', 'PD', 'PTD', 'PONTA DIREITA']],
    ['LMF', ['LMF', 'ME', 'MEIA ESQUERDA']],
    ['RMF', ['RMF', 'MD', 'MEIA DIREITA']],
    ['AMF', ['AMF', 'MAT', 'MEIA ATACANTE']],
    ['CMF', ['CMF', 'MC', 'MEIA CENTRAL']],
    ['DMF', ['DMF', 'VOL', 'VOLANTE']],
    ['CB', ['CB', 'ZAG', 'ZAGUEIRO']],
    ['LB', ['LB', 'LE', 'LATERAL ESQUERDO']],
    ['RB', ['RB', 'LD', 'LATERAL DIREITO']],
    ['GK', ['GK', 'GOL', 'GOLEIRO']]
  ];

  // 1) Leitura clássica: CA 101, CF 101, VOL 97 etc.
  for (const [code, aliases] of ptMap) {
    for (const alias of aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = normalized.match(new RegExp(`\\b${escaped}\\s*[:\\-]?\\s*(\\d{2,3})\\b`, 'i'));
      if (match?.[1]) setRating(code, Number(match[1]));
    }
  }

  // 2) Leitura quando o OCR separa posição e número em linhas diferentes.
  // Exemplo: linha "CA" e na linha seguinte "101".
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const [code, aliases] of ptMap) {
      if (ratings[code] !== undefined) continue;
      const hasPosition = aliases.some((alias) => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(line));
      if (!hasPosition) continue;
      const nearby = [line, lines[index + 1] ?? '', lines[index + 2] ?? ''].join(' ');
      const number = nearby.match(/\b(\d{2,3})\b/);
      if (number?.[1]) setRating(code, Number(number[1]));
    }
  }

  // 3) Leitura de grades em duas linhas: uma linha com posições, outra com números.
  for (let index = 0; index < lines.length - 1; index += 1) {
    const current = lines[index];
    const next = lines[index + 1];
    const positionTokens: PositionCode[] = [];
    for (const [code, aliases] of ptMap) {
      if (aliases.some((alias) => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(current))) {
        positionTokens.push(code);
      }
    }
    const numbers = [...next.matchAll(/\b(\d{2,3})\b/g)].map((match) => Number(match[1])).filter((value) => value >= 40 && value <= 110);
    if (positionTokens.length >= 2 && numbers.length >= 2) {
      positionTokens.slice(0, numbers.length).forEach((code, posIndex) => setRating(code, numbers[posIndex]));
    }
  }

  return ratings;
}

function detectCardType(text: string) {
  const normalized = normalize(text).toLowerCase();
  if (/show\s*time/.test(normalized)) return 'Show Time';
  if (/big\s*time/.test(normalized)) return 'Big Time';
  if (/epic|epico/.test(normalized)) return 'Epic';
  if (/potw|player\s+of\s+the\s+week/.test(normalized)) return 'POTW';
  if (/featured|destaque/.test(normalized)) return 'Featured';
  if (/legend|lenda/.test(normalized)) return 'Legend';
  if (/highlight/.test(normalized)) return 'Highlight';
  if (/standard|padrao|padrão/.test(normalized)) return 'Standard';
  return 'Carta analisada';
}

function detectSpecialTag(text: string) {
  const tags = ['Blitz Curler', 'Momentum Dribbling', 'Phenomenal Finishing', 'Phenomenal Pass', 'Game-changing Pass', 'Fortress', 'Edged Crossing', 'Bullet Header', 'Duelo', 'Sem Impulso'];
  return tags.find((tag) => textHas(text, tag)) ?? null;
}

function detectPlaystyle(text: string) {
  const normalizedText = normalize(text);
  const styleMap: Array<[RegExp, string]> = [
    [/homem\s+de\s+[aá]rea|fox\s+in\s+the\s+box/i, 'Homem de área'],
    [/artilheiro|goal\s+poacher/i, 'Artilheiro'],
    [/criador\s+de\s+jogadas|creative\s+playmaker/i, 'Criador de jogadas'],
    [/jogador\s+sem\s+bola|hole\s+player/i, 'Jogador sem bola'],
    [/atacante\s+matador/i, 'Atacante matador'],
    [/piv[oô]|target\s+man/i, 'Pivô'],
    [/ponta\s+prol[ií]fico|prolific\s+winger/i, 'Ponta prolífico'],
    [/jogador\s+de\s+liga[cç][aã]o|deep\s+lying\s+forward/i, 'Jogador de ligação'],
    [/flanco\s+m[oó]vel|roaming\s+flank/i, 'Flanco móvel'],
    [/box\s*to\s*box|todo\s+campo/i, 'Box-to-box'],
    [/orquestrador|orchestrator/i, 'Orquestrador'],
    [/(?:^|\s)(ancora|âncora|anchor\s+man)(?:\s|$)/i, 'Âncora'],
    [/destruidor|destroyer/i, 'Destruidor'],
    [/construtor|build\s+up/i, 'Construtor'],
    [/lateral\s+ofensivo|offensive\s+full/i, 'Lateral ofensivo'],
    [/lateral\s+defensivo|defensive\s+full/i, 'Lateral defensivo'],
    [/avan[cç]ado\s+extra|extra\s+frontman/i, 'Avançado extra']
  ];
  const found = styleMap.find(([regex]) => regex.test(normalizedText));
  return found?.[1] ?? null;
}

function detectName(rawText: string, fileName?: string | null) {
  const ignored = /^(show time|big time|epic|potw|featured|legend|standard|arilheiro|artilheiro|destruidor|criador|altura|peso|idade|nivel|nível|talento|controle|drible|passe|finaliza|cabe[cç]ada|velocidade|acelera|for[cç]a|salto|contato|equil[ií]brio|resist[eê]ncia|habilidades|skills|modelo|jogador|ca|cf|sa|ss|pd|pe|mat|amf|cmf|dmf|cb|gk|gol)$/i;
  const lines = rawText
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean)
    .filter((line) => line.length <= 46)
    .filter((line) => /[A-Za-zÀ-ÿ]/.test(line))
    .filter((line) => !/\d{2,3}/.test(line))
    .filter((line) => !ignored.test(line));
  const strongName = lines.find((line) => /^[A-ZÀ-Ÿ][A-Za-zÀ-ÿ.'-]+(?:\s+[A-ZÀ-Ÿ][A-Za-zÀ-ÿ.'-]+){1,3}$/.test(line));
  if (strongName) return strongName;
  const explicit = rawText.match(/(?:jogador|player|nome)\s*[:\-]\s*([A-Za-zÀ-ÿ.'\-\s]{3,50})/i)?.[1]?.trim();
  if (explicit) return explicit;
  if (lines[0]) return lines[0];
  if (fileName) return cleanLine(fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
  return 'Jogador não identificado';
}

function parseAttributes(text: string): Attributes {
  const attributes: Attributes = {};
  const compact = normalize(text).replace(/\r?\n/g, ' ');
  for (const [key, patterns] of ATTRIBUTE_LABELS) {
    const value = readNumber(compact, patterns);
    if (value !== null && value >= 1 && value <= 120) attributes[key] = value;
  }
  return attributes;
}

function detectSkills(text: string) {
  const found: string[] = [];
  for (const [skill, profile] of Object.entries(SKILL_PROFILES)) {
    const candidates = [skill, ...(profile.aliases ?? [])];
    if (candidates.some((candidate) => textHas(text, candidate))) found.push(skill);
  }
  return Array.from(new Set(found));
}

function parseImpetos(text: string): Impetus[] {
  const impetos: Impetus[] = [];
  const normalized = normalize(text);
  const patterns = [
    /(duelo)\s*\+\s*(\d+)/i,
    /(instinto\s+artilheiro)\s*\+\s*(\d+)/i,
    /(velocidade|finaliza[cç][aã]o|passe|drible|defesa|f[ií]sico)\s*\+\s*(\d+)/i
  ];
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) impetos.push({ name: cleanLine(match[1]), value: match[2] ? Number(match[2]) : null, active: true });
  }
  if (/sem\s+impulso/i.test(normalized)) impetos.push({ name: 'Sem Impulso', value: null, active: false });
  for (const skill of SPECIAL_SKILL_NAMES) {
    if (textHas(text, skill)) impetos.push({ name: skill, value: null, active: true });
  }
  return Array.from(new Map(impetos.map((item) => [`${item.name}-${item.value ?? ''}`, item])).values());
}

function parseCondition(text: string): PlayerCondition {
  const compact = normalize(text).replace(/\r?\n/g, ' ');
  const weakFreq = compact.match(/pior\s+p[eé]\s*\(?frequ[eê]ncia\)?\s*(raramente|ocasionalmente|frequentemente|muito\s+frequentemente|baixo|m[eé]dio|alto|alta)/i)?.[1] ?? null;
  const weakAcc = compact.match(/pior\s+p[eé]\s*\(?precis[aã]o\)?\s*(baixa|m[eé]dia|alta|muito\s+alta)/i)?.[1] ?? null;
  const form = compact.match(/condi[cç][aã]o\s+f[ií]sica\s*(est[aá]vel|inconsistente|normal|alta|baixo|m[eé]dio)/i)?.[1] ?? null;
  const injury = compact.match(/resist[eê]ncia\s+a\s+les[aã]o\s*(baixo|baixa|m[eé]dio|m[eé]dia|alto|alta)/i)?.[1] ?? null;
  return {
    weakFootFrequency: weakFreq ? cleanLine(weakFreq) : null,
    weakFootAccuracy: weakAcc ? cleanLine(weakAcc) : null,
    form: form ? cleanLine(form) : null,
    injuryResistance: injury ? cleanLine(injury) : null
  };
}

function parsePhysicalProfile(text: string): PhysicalProfile {
  const compact = normalize(text).replace(/\r?\n/g, ' ');
  return {
    armLength: readNumber(compact, [/comprimento\s+do\s+bra[cç]o\s*(\d+(?:[,.]\d+)?)/i]),
    shoulderWidth: readNumber(compact, [/largura\s+dos\s+ombros\s*(\d+(?:[,.]\d+)?)/i]),
    neckLength: readNumber(compact, [/comprimento\s+do\s+pesco[cç]o\s*(\d+(?:[,.]\d+)?)/i]),
    chest: readNumber(compact, [/chest\s*(\d+(?:[,.]\d+)?)/i, /peito\s*(\d+(?:[,.]\d+)?)/i]),
    neckSize: readNumber(compact, [/tamanho\s+do\s+pesco[cç]o\s*(\d+(?:[,.]\d+)?)/i]),
    shoulderHeight: readNumber(compact, [/altura\s+do\s+ombro\s*(\d+(?:[,.]\d+)?)/i]),
    legLength: readNumber(compact, [/comprimento\s+da\s+perna\s*(\d+(?:[,.]\d+)?)/i]),
    thighSize: readNumber(compact, [/tamanho\s+da\s+coxa\s*(\d+(?:[,.]\d+)?)/i]),
    waistSize: readNumber(compact, [/tamanho\s+da\s+cintura\s*(\d+(?:[,.]\d+)?)/i]),
    armSize: readNumber(compact, [/tamanho\s+do\s+bra[cç]o\s*(\d+(?:[,.]\d+)?)/i]),
    calfSize: readNumber(compact, [/tamanho\s+da\s+panturrilha\s*(\d+(?:[,.]\d+)?)/i]),
    legCoverageRadius: readNumber(compact, [/raio\s+de\s+cobertura\s+das\s+pernas\s*(\d+(?:[,.]\d+)?)/i]),
    armCoverageRadius: readNumber(compact, [/raio\s+de\s+cobertura\s+dos\s+bra[cç]os\s*(\d+(?:[,.]\d+)?)/i]),
    jumpHeight: readNumber(compact, [/altura\s+de\s+salto\s*(\d+(?:[,.]\d+)?)/i]),
    trunkCollision: readNumber(compact, [/colis[aã]o\s+do\s+tronco\s*(\d+(?:[,.]\d+)?)/i]),
    baseHeight: readNumber(compact, [/altura\s+com\s+base\s+no\s+comprimento\S*\s*(\d+(?:[,.]\d+)?)/i])
  };
}

function fillAttributes(parsed: Pick<ParsedCard, 'mainPosition' | 'maxOverall' | 'overall' | 'attributes'>): Required<Attributes> {
  const target = parsed.maxOverall ?? parsed.overall ?? 90;
  const base = BASE_BY_POSITION[parsed.mainPosition];
  const delta = Math.max(-8, Math.min(14, target - 90));
  const scaled = Object.fromEntries(Object.entries(base).map(([key, value]) => [key, clamp(Number(value) + delta)])) as Required<Attributes>;
  return { ...scaled, ...parsed.attributes } as Required<Attributes>;
}

function applySkillBoosts(scores: Record<string, number>, skills: string[]) {
  const boosted = { ...scores };
  for (const skill of skills) {
    const boosts = SKILL_PROFILES[skill]?.boosts ?? {};
    for (const [key, value] of Object.entries(boosts)) {
      boosted[key] = clampDecimal((boosted[key] ?? 0) + Number(value), 1, 110);
    }
  }
  return boosted;
}


function playstylePositionBonus(position: PositionCode, playstyle?: string | null) {
  const style = normalize(playstyle ?? '').toLowerCase();
  if (!style) return 0;

  // A IA não pode jogar um centroavante de área para PE só porque o OCR confundiu a grade.
  if (/homem de area|atacante matador|pivo|target man|fox/.test(style)) {
    if (position === 'CF') return 26;
    if (position === 'SS') return 10;
    if (position === 'LWF' || position === 'RWF' || position === 'LMF' || position === 'RMF') return -20;
    return -8;
  }

  if (/artilheiro|goal poacher/.test(style)) {
    if (position === 'CF') return 18;
    if (position === 'SS') return 8;
    if (position === 'LWF' || position === 'RWF') return -8;
  }

  if (/ponta prolifico|flanco movel|roaming flank|prolific winger/.test(style)) {
    if (position === 'LWF' || position === 'RWF') return 18;
    if (position === 'LMF' || position === 'RMF') return 10;
    if (position === 'CF') return -8;
  }

  if (/criador de jogadas|jogador sem bola|creative|hole player/.test(style)) {
    if (position === 'AMF' || position === 'SS') return 16;
    if (position === 'CMF') return 8;
  }

  if (/orquestrador|ancora|anchor|box-to-box|todo campo/.test(style)) {
    if (position === 'CMF' || position === 'DMF') return 16;
    if (position === 'AMF') return 5;
  }

  if (/destruidor|destroyer/.test(style)) {
    if (position === 'DMF') return 22;
    if (position === 'CMF') return 14;
    if (position === 'CB') return 10;
    if (position === 'LB' || position === 'RB') return 4;
    if (position === 'LWF' || position === 'RWF' || position === 'CF') return -14;
  }

  if (/construtor|build up/.test(style)) {
    if (position === 'CB') return 18;
    if (position === 'DMF') return 8;
  }

  if (/lateral ofensivo|lateral defensivo|full/.test(style)) {
    if (position === 'LB' || position === 'RB') return 18;
    if (position === 'LMF' || position === 'RMF') return 6;
  }

  return 0;
}

function preferredPositionFromPlaystyle(playstyle: string | null | undefined, ratings: PositionRatings, attributes: Attributes): PositionCode | null {
  const style = normalize(playstyle ?? '').toLowerCase();
  const hasGoodRating = (code: PositionCode) => Number(ratings[code] ?? 0) >= 75;
  if (/homem de area|atacante matador|pivo|target man|fox|artilheiro|goal poacher/.test(style)) return 'CF';
  if (/destruidor|destroyer/.test(style)) return hasGoodRating('DMF') || !hasGoodRating('LB') ? 'DMF' : 'DMF';
  if (/orquestrador|ancora|anchor/.test(style)) return 'DMF';
  if (/box-to-box|todo campo/.test(style)) return 'CMF';
  if (/criador de jogadas|jogador sem bola|creative|hole player/.test(style)) return 'AMF';
  if (/ponta prolifico|flanco movel|roaming flank|prolific winger/.test(style)) return hasGoodRating('RWF') ? 'RWF' : 'LWF';
  if (/lateral ofensivo|lateral defensivo|full/.test(style)) return hasGoodRating('RB') && !hasGoodRating('LB') ? 'RB' : 'LB';
  if ((attributes.finishing ?? 0) >= 82 && (attributes.defensiveAwareness ?? 0) < 70) return 'CF';
  return null;
}

function positionScore(position: PositionCode, a: Required<Attributes>, skills: string[], positionRatings: PositionRatings) {
  const skillBonus = (names: string[]) => names.reduce((sum, skill) => sum + (skills.includes(skill) ? 1.5 : 0), 0);
  const scores: Record<PositionCode, number> = {
    CF: avg(a.offensiveAwareness, a.finishing, a.kickingPower, a.heading, a.physicalContact, a.speed) + skillBonus(['Chute de primeira', 'Precisão à distância', 'Cabeçada', 'Superioridade aérea', 'Finalização acrobática']),
    SS: avg(a.offensiveAwareness, a.ballControl, a.dribbling, a.tightPossession, a.finishing, a.acceleration, a.balance, a.lowPass) + skillBonus(['Toque duplo', 'Controle com a sola', 'Passe de primeira', 'Chute de primeira']),
    LWF: avg(a.speed, a.acceleration, a.dribbling, a.ballControl, a.tightPossession, a.curl, a.finishing, a.balance) + skillBonus(['Toque duplo', 'Controle com a sola', 'Elástico', 'Cruzamento preciso']),
    RWF: avg(a.speed, a.acceleration, a.dribbling, a.ballControl, a.tightPossession, a.curl, a.finishing, a.balance) + skillBonus(['Toque duplo', 'Controle com a sola', 'Elástico', 'Cruzamento preciso']),
    LMF: avg(a.speed, a.acceleration, a.stamina, a.dribbling, a.loftedPass, a.lowPass, a.defensiveAwareness) + skillBonus(['Cruzamento preciso', 'Passe de primeira', 'Volta para marcar']),
    RMF: avg(a.speed, a.acceleration, a.stamina, a.dribbling, a.loftedPass, a.lowPass, a.defensiveAwareness) + skillBonus(['Cruzamento preciso', 'Passe de primeira', 'Volta para marcar']),
    AMF: avg(a.lowPass, a.loftedPass, a.ballControl, a.tightPossession, a.dribbling, a.offensiveAwareness, a.curl) + skillBonus(['Passe de primeira', 'Passe em profundidade', 'Passe na medida', 'Passe sem olhar']),
    CMF: avg(a.lowPass, a.loftedPass, a.ballControl, a.stamina, a.defensiveAwareness, a.tackling, a.physicalContact) + skillBonus(['Passe de primeira', 'Interceptação', 'Espírito guerreiro']),
    DMF: avg(a.defensiveAwareness, a.tackling, a.defensiveEngagement, a.aggression, a.physicalContact, a.stamina, a.lowPass) + skillBonus(['Interceptação', 'Bloqueador', 'Marcação individual', 'Volta para marcar']),
    CB: avg(a.defensiveAwareness, a.tackling, a.defensiveEngagement, a.physicalContact, a.heading, a.jump, a.aggression) + skillBonus(['Bloqueador', 'Interceptação', 'Superioridade aérea', 'Marcação individual']),
    LB: avg(a.speed, a.acceleration, a.stamina, a.defensiveAwareness, a.tackling, a.loftedPass, a.dribbling) + skillBonus(['Cruzamento preciso', 'Interceptação', 'Volta para marcar']),
    RB: avg(a.speed, a.acceleration, a.stamina, a.defensiveAwareness, a.tackling, a.loftedPass, a.dribbling) + skillBonus(['Cruzamento preciso', 'Interceptação', 'Volta para marcar']),
    GK: avg(a.goalkeeperAwareness, a.goalkeeperCatching, a.goalkeeperParrying, a.goalkeeperReflexes, a.goalkeeperReach, a.jump) + skillBonus(['Liderança', 'Espírito guerreiro'])
  };
  const cardRating = positionRatings[position];
  const ratingBlend = cardRating ? (scores[position] * 0.72 + cardRating * 0.28) : scores[position];
  return clampDecimal(ratingBlend, 1, 100);
}

function roleName(position: PositionCode, a: Required<Attributes>) {
  if (position === 'CF') return a.heading >= 80 && a.physicalContact >= 78 ? 'finalizador de área' : 'atacante móvel';
  if (position === 'SS') return a.lowPass >= 80 ? 'segundo atacante criativo' : 'segundo atacante agressivo';
  if (position === 'AMF') return 'armador ofensivo';
  if (position === 'CMF') return a.defensiveAwareness >= 75 ? 'meia box-to-box' : 'meia de distribuição';
  if (position === 'DMF') return a.tackling >= 80 ? 'volante destruidor' : 'volante construtor';
  if (position === 'CB') return a.speed >= 78 ? 'zagueiro de cobertura' : 'zagueiro físico';
  if (position === 'LB' || position === 'RB') return a.loftedPass >= 80 ? 'lateral de apoio' : 'lateral marcador';
  if (position === 'LMF' || position === 'RMF') return 'meia lateral intenso';
  if (position === 'LWF' || position === 'RWF') return a.finishing >= 80 ? 'ponta finalizador' : 'ponta criador';
  return 'goleiro';
}

function calculatePri(position: PositionCode, a: Required<Attributes>, skills: string[]) {
  const scores = {
    finishing: avg(a.finishing, a.offensiveAwareness, a.kickingPower, a.heading, a.curl),
    creation: avg(a.lowPass, a.loftedPass, a.ballControl, a.tightPossession, a.curl),
    dribbling: avg(a.dribbling, a.ballControl, a.tightPossession, a.balance),
    mobility: avg(a.speed, a.acceleration, a.balance, a.stamina),
    pressure: avg(a.stamina, a.aggression, a.defensiveEngagement, a.speed),
    defense: avg(a.defensiveAwareness, a.tackling, a.defensiveEngagement, a.aggression, a.physicalContact),
    physical: avg(a.physicalContact, a.jump, a.balance, a.stamina),
    stamina: a.stamina,
    aerial: avg(a.heading, a.jump, a.physicalContact)
  };
  const boosted = applySkillBoosts(scores, skills);
  const weights: Record<PositionCode, Record<string, number>> = {
    CF: { finishing: 2, aerial: 1.15, physical: 1, mobility: .8, creation: .45 },
    SS: { finishing: 1.2, creation: 1.1, dribbling: 1.25, mobility: 1 },
    LWF: { dribbling: 1.3, mobility: 1.25, finishing: .95, creation: .85 },
    RWF: { dribbling: 1.3, mobility: 1.25, finishing: .95, creation: .85 },
    LMF: { mobility: 1.15, creation: 1.05, pressure: 1, defense: .8, stamina: 1 },
    RMF: { mobility: 1.15, creation: 1.05, pressure: 1, defense: .8, stamina: 1 },
    AMF: { creation: 1.7, dribbling: 1.15, finishing: .8, mobility: .75 },
    CMF: { creation: 1.05, defense: 1.0, pressure: 1, stamina: 1.2, physical: .75 },
    DMF: { defense: 1.8, pressure: 1.25, physical: 1, creation: .6, stamina: 1 },
    CB: { defense: 2, physical: 1.1, aerial: 1, mobility: .55, pressure: .8 },
    LB: { mobility: 1.15, defense: 1.0, creation: .95, pressure: .95, stamina: 1.05 },
    RB: { mobility: 1.15, defense: 1.0, creation: .95, pressure: .95, stamina: 1.05 },
    GK: { defense: 1 }
  };
  const weight = weights[position];
  const totalWeight = Object.values(weight).reduce((sum, value) => sum + value, 0);
  const overall = Object.entries(weight).reduce((sum, [key, value]) => sum + (boosted[key] ?? 0) * value, 0) / Math.max(1, totalWeight);
  return Object.fromEntries([...Object.entries(boosted), ['overall', clampDecimal(overall)]].map(([key, value]) => [key, clampDecimal(Number(value))]));
}

function calculateTacticalFit(position: PositionCode, a: Required<Attributes>, pri: Record<string, number>) {
  return {
    possession: clampDecimal(avg(pri.creation, pri.dribbling, a.lowPass, a.ballControl) / 10, 1, 10),
    quickCounter: clampDecimal(avg(pri.mobility, pri.finishing, a.speed, a.acceleration) / 10, 1, 10),
    longBallCounter: clampDecimal(avg(pri.physical, pri.aerial, pri.defense, a.speed) / 10, 1, 10),
    outWide: clampDecimal(avg(position === 'CF' ? pri.aerial : pri.creation, a.loftedPass, a.speed, a.stamina) / 10, 1, 10),
    longBall: clampDecimal(avg(pri.physical, pri.aerial, a.kickingPower, a.loftedPass) / 10, 1, 10)
  };
}


const TRAINING_KEYS: TrainingKey[] = ['shooting', 'passing', 'dribbling', 'dexterity', 'lowerBodyStrength', 'aerialStrength', 'defending', 'gk1', 'gk2', 'gk3'];

const SAFE_DEFAULT_TRAINING_BUDGET = 64;

function normalizeTrainingBudget(value: number | null | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 20 || n > 220) return SAFE_DEFAULT_TRAINING_BUDGET;
  return Math.round(n);
}

function emptyTraining(): TrainingPlan {
  return { shooting: 0, passing: 0, dribbling: 0, dexterity: 0, lowerBodyStrength: 0, aerialStrength: 0, defending: 0, gk1: 0, gk2: 0, gk3: 0 };
}

function trainingLevelCost(level: number): number {
  if (level <= 0) return 0;
  return Math.ceil(level / 4);
}

function trainingTotalCost(level: number): number {
  let cost = 0;
  for (let current = 1; current <= Math.max(0, level); current += 1) cost += trainingLevelCost(current);
  return cost;
}

function trainingPlanCost(plan: TrainingPlan): TrainingPlan {
  const costs = emptyTraining();
  for (const key of TRAINING_KEYS) costs[key] = trainingTotalCost(plan[key] ?? 0);
  return costs;
}

function trainingPlanTotalCost(plan: TrainingPlan): number {
  return Object.values(trainingPlanCost(plan)).reduce((sum, value) => sum + value, 0);
}

function addTrainingLevel(plan: TrainingPlan, key: TrainingKey, maxLevel = 16): boolean {
  if ((plan[key] ?? 0) >= maxLevel) return false;
  plan[key] = (plan[key] ?? 0) + 1;
  return true;
}

function removeTrainingLevel(plan: TrainingPlan, key: TrainingKey): boolean {
  if ((plan[key] ?? 0) <= 0) return false;
  plan[key] = (plan[key] ?? 0) - 1;
  return true;
}

function trainingBudgetFromCard(parsed: ParsedCard): number {
  const inferred = inferTrainingPointsFromLevel(parsed.level);
  if (inferred && inferred >= 20) return normalizeTrainingBudget(inferred);

  const total = Number(parsed.trainingPointsTotal ?? NaN);
  if (Number.isFinite(total) && total >= 20) return normalizeTrainingBudget(total);

  return SAFE_DEFAULT_TRAINING_BUDGET;
}

function applyPlanEntries(entries: Partial<TrainingPlan>): TrainingPlan {
  return { ...emptyTraining(), ...entries };
}

function trainingTemplate(position: PositionCode, objective: Objective, a: Required<Attributes>, parsed: ParsedCard): { target: TrainingPlan; priority: TrainingKey[] } {
  const playstyle = normalize(parsed.playstyle ?? '').toLowerCase();
  const isDestroyer = /destruidor|destroyer/.test(playstyle);
  const isFullback = position === 'LB' || position === 'RB';
  const highAerial = a.heading >= 76 || a.jump >= 76 || a.physicalContact >= 80;

  let target: TrainingPlan = emptyTraining();
  let priority: TrainingKey[] = ['dexterity', 'lowerBodyStrength', 'passing', 'dribbling', 'defending', 'shooting', 'aerialStrength'];

  if (position === 'CF') {
    target = applyPlanEntries({ shooting: 10, dexterity: 8, lowerBodyStrength: 8, aerialStrength: highAerial ? 6 : 3, dribbling: 3 });
    priority = ['shooting', 'dexterity', 'lowerBodyStrength', 'aerialStrength', 'dribbling', 'passing'];
  } else if (position === 'SS') {
    target = applyPlanEntries({ shooting: 7, dribbling: 7, dexterity: 8, passing: 5, lowerBodyStrength: 5 });
    priority = ['dexterity', 'dribbling', 'shooting', 'passing', 'lowerBodyStrength'];
  } else if (position === 'LWF' || position === 'RWF') {
    target = applyPlanEntries({ dribbling: 9, dexterity: 9, lowerBodyStrength: 6, shooting: 5, passing: 3 });
    priority = ['dribbling', 'dexterity', 'lowerBodyStrength', 'shooting', 'passing'];
  } else if (position === 'LMF' || position === 'RMF') {
    target = applyPlanEntries({ passing: 7, dribbling: 5, dexterity: 6, lowerBodyStrength: 7, defending: 6, aerialStrength: 2 });
    priority = ['lowerBodyStrength', 'passing', 'dexterity', 'defending', 'dribbling', 'aerialStrength'];
  } else if (position === 'AMF') {
    target = applyPlanEntries({ passing: 9, dribbling: 7, dexterity: 6, shooting: 4, lowerBodyStrength: 3 });
    priority = ['passing', 'dribbling', 'dexterity', 'shooting', 'lowerBodyStrength'];
  } else if (position === 'CMF') {
    target = applyPlanEntries({ passing: 8, dribbling: 4, dexterity: 4, lowerBodyStrength: 7, defending: 8, aerialStrength: 2 });
    priority = ['passing', 'defending', 'lowerBodyStrength', 'dexterity', 'dribbling', 'aerialStrength'];
  } else if (position === 'DMF') {
    // Modelo competitivo inspirado no próprio eFHUB: em 64 pontos vira 8/4/4/8/4/13.
    target = isDestroyer
      ? applyPlanEntries({ passing: 8, dribbling: 4, dexterity: 4, lowerBodyStrength: 8, aerialStrength: 4, defending: 13 })
      : applyPlanEntries({ passing: 7, dribbling: 3, dexterity: 4, lowerBodyStrength: 7, aerialStrength: 3, defending: 12 });
    priority = ['defending', 'passing', 'lowerBodyStrength', 'dexterity', 'dribbling', 'aerialStrength'];
  } else if (position === 'CB') {
    target = applyPlanEntries({ defending: 14, aerialStrength: 8, lowerBodyStrength: 6, dexterity: 3, passing: 2 });
    priority = ['defending', 'aerialStrength', 'lowerBodyStrength', 'dexterity', 'passing'];
  } else if (isFullback) {
    target = isDestroyer
      ? applyPlanEntries({ defending: 10, lowerBodyStrength: 8, passing: 6, dexterity: 6, dribbling: 3, aerialStrength: 3 })
      : applyPlanEntries({ defending: 8, lowerBodyStrength: 8, passing: 7, dexterity: 6, dribbling: 4, aerialStrength: 2 });
    priority = ['lowerBodyStrength', 'defending', 'dexterity', 'passing', 'dribbling', 'aerialStrength'];
  } else if (position === 'GK') {
    target = applyPlanEntries({ gk1: 9, gk2: 9, gk3: 9, aerialStrength: 4, lowerBodyStrength: 2 });
    priority = ['gk1', 'gk2', 'gk3', 'aerialStrength', 'lowerBodyStrength'];
  }

  if (objective === 'FINISHER') priority = ['shooting', 'dexterity', ...priority.filter((key) => !['shooting', 'dexterity'].includes(key))];
  if (objective === 'CREATOR' || objective === 'POSSESSION') priority = ['passing', 'dribbling', ...priority.filter((key) => !['passing', 'dribbling'].includes(key))];
  if (objective === 'DRIBBLER') priority = ['dribbling', 'dexterity', ...priority.filter((key) => !['dribbling', 'dexterity'].includes(key))];
  if (objective === 'PRESSING' || objective === 'DEFENSIVE') priority = ['defending', 'lowerBodyStrength', ...priority.filter((key) => !['defending', 'lowerBodyStrength'].includes(key))];
  if (objective === 'QUICK_COUNTER') priority = ['lowerBodyStrength', 'dexterity', ...priority.filter((key) => !['lowerBodyStrength', 'dexterity'].includes(key))];
  if (objective === 'AERIAL') priority = ['aerialStrength', 'defending', ...priority.filter((key) => !['aerialStrength', 'defending'].includes(key))];

  return { target, priority: Array.from(new Set(priority)) };
}

function fitTrainingToBudget(target: TrainingPlan, priority: TrainingKey[], budget: number): TrainingPlan {
  budget = normalizeTrainingBudget(budget);
  const plan = { ...target };
  const cleanPriority = priority.length ? priority : TRAINING_KEYS;

  // Se passou do orçamento real do eFootball, remove primeiro das prioridades menores.
  let guard = 0;
  while (trainingPlanTotalCost(plan) > budget && guard < 500) {
    guard += 1;
    const removable = [...cleanPriority].reverse().find((key) => (plan[key] ?? 0) > 0) ?? TRAINING_KEYS.find((key) => (plan[key] ?? 0) > 0);
    if (!removable) break;
    removeTrainingLevel(plan, removable);
  }

  // Se ainda sobrar ponto, coloca onde tem mais impacto, respeitando custo progressivo.
  guard = 0;
  while (guard < 500) {
    guard += 1;
    const current = trainingPlanTotalCost(plan);
    if (current >= budget) break;
    let added = false;
    for (const key of cleanPriority) {
      const nextLevel = (plan[key] ?? 0) + 1;
      const nextCost = trainingLevelCost(nextLevel);
      if (current + nextCost <= budget && nextLevel <= 16) {
        addTrainingLevel(plan, key);
        added = true;
        break;
      }
    }
    if (!added) break;
  }

  return plan;
}

function trainingFor(position: PositionCode, objective: Objective, a: Required<Attributes>, parsed: ParsedCard): TrainingPlan {
  const budget = trainingBudgetFromCard(parsed);
  const { target, priority } = trainingTemplate(position, objective, a, parsed);
  return fitTrainingToBudget(target, priority, budget);
}

function trainingCostRuleText() {
  return 'Custo real do eFootball: níveis 1–4 custam 1 ponto cada; 5–8 custam 2; 9–12 custam 3; 13–16 custam 4. Por isso uma ficha com soma 41 pode gastar 64 pontos.';
}

function skillPriority(position: PositionCode, objective: Objective) {
  const byPosition: Record<PositionCode, string[]> = {
    CF: ['Chute de primeira', 'Precisão à distância', 'Finalização acrobática', 'Cabeçada', 'Superioridade aérea', 'Espírito guerreiro', 'Super substituto'],
    SS: ['Toque duplo', 'Controle com a sola', 'Passe de primeira', 'Passe em profundidade', 'Chute de primeira', 'Precisão à distância'],
    LWF: ['Toque duplo', 'Controle com a sola', 'Elástico', 'Cruzamento preciso', 'Curva para fora', 'Precisão à distância'],
    RWF: ['Toque duplo', 'Controle com a sola', 'Elástico', 'Cruzamento preciso', 'Curva para fora', 'Precisão à distância'],
    LMF: ['Cruzamento preciso', 'Passe de primeira', 'Passe na medida', 'Interceptação', 'Volta para marcar', 'Curva para fora'],
    RMF: ['Cruzamento preciso', 'Passe de primeira', 'Passe na medida', 'Interceptação', 'Volta para marcar', 'Curva para fora'],
    AMF: ['Passe de primeira', 'Passe em profundidade', 'Passe na medida', 'Passe sem olhar', 'Controle com a sola', 'Curva para fora'],
    CMF: ['Passe de primeira', 'Passe em profundidade', 'Passe na medida', 'Interceptação', 'Espírito guerreiro', 'Volta para marcar'],
    DMF: ['Interceptação', 'Bloqueador', 'Marcação individual', 'Volta para marcar', 'Passe de primeira', 'Espírito guerreiro'],
    CB: ['Bloqueador', 'Interceptação', 'Marcação individual', 'Superioridade aérea', 'Carrinho', 'Espírito guerreiro'],
    LB: ['Cruzamento preciso', 'Passe de primeira', 'Interceptação', 'Volta para marcar', 'Bloqueador', 'Curva para fora'],
    RB: ['Cruzamento preciso', 'Passe de primeira', 'Interceptação', 'Volta para marcar', 'Bloqueador', 'Curva para fora'],
    GK: ['Liderança', 'Espírito guerreiro']
  };
  const extras: Record<Objective, string[]> = {
    COMPETITIVE: ['Espírito guerreiro', 'Passe de primeira'],
    FINISHER: ['Chute de primeira', 'Precisão à distância', 'Finalização acrobática'],
    CREATOR: ['Passe de primeira', 'Passe em profundidade', 'Passe na medida'],
    DRIBBLER: ['Toque duplo', 'Controle com a sola', 'Elástico'],
    PRESSING: ['Volta para marcar', 'Interceptação', 'Espírito guerreiro'],
    POSSESSION: ['Passe de primeira', 'Controle com a sola', 'Passe na medida'],
    QUICK_COUNTER: ['Passe em profundidade', 'Chute de primeira', 'Toque duplo'],
    DEFENSIVE: ['Interceptação', 'Bloqueador', 'Marcação individual'],
    AERIAL: ['Cabeçada', 'Superioridade aérea', 'Afastamento acrobático']
  };
  return Array.from(new Set([...(extras[objective] ?? []), ...(byPosition[position] ?? [])]));
}


function topRatedPositions(positionRatings: PositionRatings): PositionCode[] {
  return Object.entries(positionRatings)
    .filter((entry): entry is [PositionCode, number] => Number.isFinite(entry[1]))
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([position]) => position);
}

function recommendAdditionalSkills(parsed: ParsedCard, selectedPosition: PositionCode, objective: Objective, attributes: Required<Attributes>): string[] {
  const candidateScores = new Map<string, number>();
  const ownedSkillKeys = new Set([
    ...parsed.nativeSkills.map(skillKey),
    ...parsed.specialSkills.map(skillKey),
    ...parsed.impetos.map((item) => skillKey(item.name))
  ]);
  const bannedAdditional = new Set(SPECIAL_SKILL_NAMES.map(skillKey));

  const add = (skill: string, score: number) => {
    if (!SKILL_PROFILES[skill]) return;
    const key = skillKey(skill);
    if (ownedSkillKeys.has(key)) return;
    if (bannedAdditional.has(key)) return;
    candidateScores.set(skill, Math.max(candidateScores.get(skill) ?? 0, score));
  };

  // 1) Função principal escolhida pela IA.
  skillPriority(selectedPosition, objective).forEach((skill, index) => add(skill, 100 - index * 6));

  // 2) Posições reais da carta lidas no grid do eFHUB/eFootBase.
  // Isso evita recomendar só por "LE" quando a carta também rende como VOL/MC/ZAG etc.
  const ratedPositions = topRatedPositions(parsed.positionRatings);
  const cardPositions = ratedPositions.length ? ratedPositions : parsed.positions;
  cardPositions.slice(0, 4).forEach((position, posIndex) => {
    skillPriority(position, objective).forEach((skill, index) => add(skill, 78 - posIndex * 8 - index * 4));
  });

  const playstyle = normalize(parsed.playstyle ?? '').toLowerCase();
  const isDestroyer = /destruidor|destroyer/.test(playstyle);
  const isFullback = selectedPosition === 'LB' || selectedPosition === 'RB' || cardPositions.includes('LB') || cardPositions.includes('RB');
  const isMidfielder = selectedPosition === 'DMF' || selectedPosition === 'CMF' || selectedPosition === 'AMF' || cardPositions.some((p) => ['DMF', 'CMF', 'AMF'].includes(p));
  const isForward = ['CF', 'SS', 'LWF', 'RWF'].includes(selectedPosition) || cardPositions.some((p) => ['CF', 'SS', 'LWF', 'RWF'].includes(p));

  // 3) Ajuste por estilo de jogo.
  if (isDestroyer) {
    add('Interceptação', 112);
    add('Bloqueador', 108);
    add('Marcação individual', 104);
    add('Volta para marcar', 98);
    add('Passe de primeira', 92);
    add('Espírito guerreiro', 88);
    add('Passe em profundidade', 84);
    add('Passe na medida', 78);
    add('Superioridade aérea', 70);
  }

  if (/criador|orquestrador|creative|orchestrator/.test(playstyle)) {
    add('Passe de primeira', 112);
    add('Passe em profundidade', 108);
    add('Passe na medida', 102);
    add('Passe sem olhar', 86);
    add('Controle com a sola', 82);
  }

  if (/artilheiro|goal poacher|homem de area|atacante matador|pivo|target man|fox/.test(playstyle)) {
    add('Chute de primeira', 112);
    add('Precisão à distância', 98);
    add('Finalização acrobática', 92);
    add('Cabeçada', 86);
    add('Superioridade aérea', 82);
  }

  // 4) Ajuste por atributos. Aqui é onde a recomendação fica mais "gameplay real".
  if (attributes.defensiveAwareness >= 78 || attributes.tackling >= 78 || attributes.defensiveEngagement >= 78) {
    add('Interceptação', 106);
    add('Bloqueador', 102);
    add('Marcação individual', 96);
  }
  if (attributes.aggression >= 78 || attributes.stamina >= 80) {
    add('Volta para marcar', 92);
    add('Espírito guerreiro', 84);
  }
  if (attributes.lowPass >= 76 || isMidfielder) {
    add('Passe de primeira', 96);
    add('Passe em profundidade', 90);
  }
  if (attributes.loftedPass >= 74 || isFullback) {
    add('Passe na medida', 84);
    add('Cruzamento preciso', isFullback ? 88 : 74);
    add('Passe aéreo baixo', 66);
  }
  if (attributes.ballControl >= 76 || attributes.tightPossession >= 76 || attributes.dribbling >= 76) {
    add('Controle com a sola', 78);
    add('Toque duplo', 74);
  }
  if (attributes.speed >= 82 || attributes.acceleration >= 82) {
    add('Toque duplo', 82);
    if (isForward) add('Elástico', 74);
  }
  if (attributes.finishing >= 78 || isForward) {
    add('Chute de primeira', 94);
    add('Precisão à distância', 82);
    add('Finalização acrobática', 74);
  }
  if (attributes.heading >= 76 || attributes.jump >= 76 || attributes.physicalContact >= 80) {
    add('Superioridade aérea', 86);
    add('Cabeçada', 78);
  }
  if (selectedPosition === 'CB') {
    add('Afastamento acrobático', 80);
    add('Carrinho', 76);
  }
  if (selectedPosition === 'GK') {
    add('Liderança', 92);
    add('Espírito guerreiro', 82);
  }

  return Array.from(candidateScores.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([skill]) => skill)
    .slice(0, 5);
}

function strengthsWeaknesses(a: Required<Attributes>, pri: Record<string, number>) {
  const ranked = Object.entries({
    Finalização: pri.finishing,
    Criação: pri.creation,
    Drible: pri.dribbling,
    Mobilidade: pri.mobility,
    Defesa: pri.defense,
    Físico: pri.physical,
    Resistência: pri.stamina,
    'Jogo aéreo': pri.aerial,
    'Passe curto': a.lowPass,
    Velocidade: a.speed,
    Aceleração: a.acceleration,
    Equilíbrio: a.balance
  }).sort((left, right) => Number(right[1]) - Number(left[1]));
  const strengths = ranked.slice(0, 4).map(([name, value]) => `${name} forte (${Number(value).toFixed(1)})`);
  const weaknesses = ranked.slice(-3).reverse().map(([name, value]) => `${name} precisa de cuidado (${Number(value).toFixed(1)})`);
  return { strengths, weaknesses };
}

function usageTips(position: PositionCode, objective: Objective, a: Required<Attributes>) {
  const tips: string[] = [];
  if (position === 'CF') {
    tips.push('Use como referência no último terço: procure finalizar de primeira e atacar o espaço entre zagueiros.');
    if (a.heading >= 80 || a.physicalContact >= 80) tips.push('Valorize cruzamentos, pivôs curtos e bolas aéreas; o físico e a cabeçada sustentam o contato.');
    if (a.balance < 72) tips.push('Evite conduções longas sob pressão; solte a bola rápido e finalize em poucos toques.');
  } else if (position === 'SS') {
    tips.push('Use como SA entre linhas: receba no giro, combine com o CA e ataque o espaço para finalizar.');
    tips.push('Funciona melhor com passe rápido e triangulações, não preso na ponta o tempo todo.');
  } else if (position === 'AMF') {
    tips.push('Use como MAT por dentro: acione passes em profundidade e chute de média distância quando sobrar espaço.');
    tips.push('Evite gastar pontos demais em defesa; o valor dele é criação e último passe.');
  } else if (position === 'LWF' || position === 'RWF') {
    tips.push('Use aberto para atrair marcação e cortar para dentro; aceleração e drible são o foco.');
    tips.push('Se tiver Cruzamento preciso, alterne entre infiltrar e cruzar para não ficar previsível.');
  } else if (position === 'LMF' || position === 'RMF') {
    tips.push('Use pelo corredor lateral como apoio intenso: ajuda na recomposição e acelera a transição.');
  } else if (position === 'DMF') {
    tips.push('Use como VOL fixo: bloqueie linha de passe, antecipe e solte passe curto seguro.');
    tips.push('Para extrair máximo gameplay, pressione só no timing certo; esta função rende mais protegendo a entrada da área.');
  } else if (position === 'CMF') {
    tips.push('Use como MC de ida e volta: acelere transições, encurte passes e pressione após perda da bola.');
  } else if (position === 'CB') {
    tips.push('Use como ZAG de cobertura: não dê bote desnecessário; priorize interceptar e bloquear chutes.');
    tips.push('Combine com outro zagueiro mais veloz se a velocidade estiver abaixo de 75.');
  } else {
    tips.push('Use na posição recomendada e foque nas ações que aparecem como pontos fortes no PRI.');
  }
  if (objective === 'QUICK_COUNTER') tips.push('No contra-ataque rápido, procure passes verticais cedo e evite prender a bola no meio.');
  if (objective === 'POSSESSION') tips.push('Na posse de bola, mantenha aproximação curta e use Passe de primeira para acelerar triangulações.');
  if (objective === 'PRESSING') tips.push('Em pressão alta, controle o fôlego: use pressão manual em gatilhos, não o tempo todo.');
  return tips;
}

function detectMainPosition(positions: PositionCode[], positionRatings: PositionRatings, attributes: Attributes, playstyle?: string | null): PositionCode {
  const preferred = preferredPositionFromPlaystyle(playstyle, positionRatings, attributes);
  if (preferred) return preferred;

  const validRatings = Object.entries(positionRatings)
    .filter((entry): entry is [PositionCode, number] => Number.isFinite(entry[1]) && Number(entry[1]) >= 40 && Number(entry[1]) <= 110)
    .map(([code, rating]) => [code, Number(rating) + playstylePositionBonus(code, playstyle)] as [PositionCode, number])
    .sort((a, b) => b[1] - a[1]);

  const fromRatings = validRatings[0]?.[0];
  if (fromRatings) return fromRatings;
  if (positions[0]) return positions[0];
  if ((attributes.defensiveAwareness ?? 0) >= 76 && (attributes.lowPass ?? 0) >= 72) return 'DMF';
  if ((attributes.finishing ?? 0) >= 80) return 'CF';
  return 'SS';
}


type TrainingPointCandidate = { used: number | null; total: number; source: string };

function parseLevel(text: string): number | null {
  const compact = normalize(text).replace(/\r?\n/g, ' ');
  const candidates: number[] = [];
  const patterns = [
    /(?:n[ií]vel|nivel|level)(?:\s*(?:m[aá]ximo|max|maximo))?[^0-9]{0,18}(\d{1,3})/gi,
    /(?:lv|lvl)[^0-9]{0,8}(\d{1,3})/gi
  ];

  for (const pattern of patterns) {
    for (const match of compact.matchAll(pattern)) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) candidates.push(value);
    }
  }

  // Erro comum: OCR lê "Nível 32" como "Nível 2".
  // Nível 1–9 não deve virar orçamento 2/2, 4/4 etc.
  const plausible = candidates.filter((value) => value >= 10 && value <= 99);
  if (plausible.length) return plausible[0];
  return null;
}

function collectTrainingPointCandidates(text: string): TrainingPointCandidate[] {
  const compact = normalize(text).replace(/\r?\n/g, ' ');
  const candidates: TrainingPointCandidate[] = [];

  const directPatterns = [
    /(?:pontos|points)\s*(?:usados|used|da\s*ficha|ficha)?\s*[:\-]?\s*(\d{1,3})\s*[\/\\]\s*(\d{1,3})/gi,
    /(?:training\s*points|progression\s*points)\s*[:\-]?\s*(\d{1,3})\s*[\/\\]\s*(\d{1,3})/gi
  ];

  for (const pattern of directPatterns) {
    for (const match of compact.matchAll(pattern)) {
      const used = Number(match[1]);
      const total = Number(match[2]);
      if (Number.isFinite(total)) candidates.push({ used: Number.isFinite(used) ? used : null, total, source: 'OCR_RATIO' });
    }
  }

  const totalPatterns = [
    /(?:pontos|points)\s*(?:totais|total|dispon[ií]veis|da\s*ficha|ficha)?\s*[:\-]?\s*(\d{1,3})/gi,
    /(?:training\s*points|progression\s*points)\s*[:\-]?\s*(\d{1,3})/gi
  ];

  for (const pattern of totalPatterns) {
    for (const match of compact.matchAll(pattern)) {
      const total = Number(match[1]);
      if (Number.isFinite(total)) candidates.push({ used: null, total, source: 'OCR_TOTAL' });
    }
  }

  return candidates;
}

function parseTrainingPoints(text: string, inferredPoints: number | null): { used: number | null; total: number | null; ignoredReason?: string } {
  const candidates = collectTrainingPointCandidates(text);
  if (!candidates.length) return { used: null, total: null };

  // Correção definitiva do 2/2: nenhum valor abaixo de 20 é orçamento real de ficha.
  // Esses números pequenos quase sempre vêm de boosters, estrelas, ícones ou OCR quebrado.
  const hardMinimum = 20;
  const valid = candidates
    .filter((candidate) => candidate.total >= hardMinimum && candidate.total <= 220)
    .filter((candidate) => {
      if (!inferredPoints || inferredPoints < hardMinimum) return true;
      const minimumPlausible = Math.max(hardMinimum, Math.floor(inferredPoints * 0.55));
      const maximumPlausible = Math.ceil(inferredPoints * 1.45);
      return candidate.total >= minimumPlausible && candidate.total <= maximumPlausible;
    })
    .sort((a, b) => b.total - a.total);

  if (!valid.length) {
    const first = candidates[0];
    return {
      used: null,
      total: null,
      ignoredReason: `Pontos OCR ${first.used ?? first.total}/${first.total} descartados; valor inválido para ficha de jogador.`
    };
  }

  const selected = valid[0];
  const safeUsed = Number.isFinite(selected.used ?? NaN) && selected.used !== null && selected.used >= 0 && selected.used <= selected.total
    ? selected.used
    : null;
  return { used: safeUsed, total: selected.total };
}

function inferTrainingPointsFromLevel(level?: number | null): number | null {
  if (!Number.isFinite(level ?? NaN)) return null;
  const safeLevel = Number(level);
  if (safeLevel < 10 || safeLevel > 99) return null;
  return Math.max(20, (safeLevel - 1) * 2);
}

function resolveTrainingPointBudget(
  parsedPoints: { used: number | null; total: number | null; ignoredReason?: string },
  inferredPoints: number | null
): { used: number; total: number; source: 'OCR' | 'LEVEL_INFERRED' | 'FALLBACK'; warning?: string } {
  // Prioridade para o nível máximo. Ele é mais estável que OCR solto de "Pontos".
  if (inferredPoints && inferredPoints >= 20) {
    return {
      used: inferredPoints,
      total: inferredPoints,
      source: 'LEVEL_INFERRED',
      warning: parsedPoints.ignoredReason
    };
  }

  if (parsedPoints.total && parsedPoints.total >= 20) {
    const safeTotal = normalizeTrainingBudget(parsedPoints.total);
    const safeUsed = parsedPoints.used !== null && Number.isFinite(parsedPoints.used) && parsedPoints.used >= 20 && parsedPoints.used <= safeTotal
      ? parsedPoints.used
      : safeTotal;
    return { used: safeUsed, total: safeTotal, source: 'OCR', warning: parsedPoints.ignoredReason };
  }

  // Padrão seguro. O motor nunca mais pode cair em 2/2.
  return {
    used: SAFE_DEFAULT_TRAINING_BUDGET,
    total: SAFE_DEFAULT_TRAINING_BUDGET,
    source: 'FALLBACK',
    warning: parsedPoints.ignoredReason ?? 'Pontos e nível não foram lidos com segurança; usando orçamento padrão seguro de 64 pontos.'
  };
}

export function parseCard(rawText: string, imageFileName?: string | null): ParsedCard {
  const text = rawText || '';
  const attributes = parseAttributes(text);
  const positionRatings = detectPositionRatings(text);
  const positions = Array.from(new Set([...detectPositions(text), ...(Object.keys(positionRatings) as PositionCode[])]));
  const allNumbers = [...text.matchAll(/\b(\d{2,3})\b/g)].map((match) => Number(match[1])).filter((value) => value >= 40 && value <= 120);
  const ratingValues = Object.values(positionRatings).filter((v): v is number => Number.isFinite(v));
  const overall = readNumber(text, [/overall\s*(?:base|inicial)?\s*(\d{2,3})/i, /\bovr\s*(\d{2,3})/i]) ?? (ratingValues.sort((a, b) => b - a)[0] ?? allNumbers.find((value) => value >= 80 && value <= 110) ?? null);
  const maxOverall = readNumber(text, [/overall\s*(?:m[aá]x(?:imo)?|max)\s*(\d{2,3})/i, /max\s*overall\s*(\d{2,3})/i]) ?? (ratingValues.sort((a, b) => b - a)[0] ?? allNumbers.filter((value) => value >= 80 && value <= 110).sort((a, b) => b - a)[0] ?? overall);
  const playerName = detectName(text, imageFileName);
  const playstyle = detectPlaystyle(text);
  const mainPosition = detectMainPosition(positions, positionRatings, attributes, playstyle);
  const nativeSkills = detectSkills(text);
  const specialSkills = nativeSkills.filter((skill) => SPECIAL_SKILL_NAMES.includes(skill));
  const height = readNumber(text, [/altura\s*(\d{3})\s*cm/i, /height\s*(\d{3})\s*cm/i]);
  const weight = readNumber(text, [/peso\s*(\d{2,3})\s*kg/i, /weight\s*(\d{2,3})\s*kg/i]);
  const age = readNumber(text, [/idade\s*(\d{1,2})/i, /age\s*(\d{1,2})/i]);
  const level = parseLevel(text);
  const inferredPoints = inferTrainingPointsFromLevel(level);
  const parsedPoints = parseTrainingPoints(text, inferredPoints);
  const pointBudget = resolveTrainingPointBudget(parsedPoints, inferredPoints);
  const trainingPointsTotal = pointBudget.total;
  const trainingPointsUsed = pointBudget.used;
  const trainingPointSource: ParsedCard['trainingPointSource'] = pointBudget.source;
  const specialTag = detectSpecialTag(text);
  const cardType = detectCardType(text);
  const country = text.match(/\b(Argentina|Brasil|Brazil|França|France|Portugal|Espanha|Spain|Inglaterra|England|Alemanha|Germany|Itália|Italy|Holanda|Netherlands|Países Baixos|Uruguai|Uruguay)\b/i)?.[1] ?? null;
  const dominantFoot = /p[eé]\s+esquerdo|left\s+foot/i.test(text) ? 'Esquerdo' : /p[eé]\s+direito|right\s+foot/i.test(text) ? 'Direito' : null;
  const condition = parseCondition(text);
  const physicalProfile = parsePhysicalProfile(text);
  const impetos = parseImpetos(text);
  const attributeCount = Object.keys(attributes).length;
  const modelCount = Object.values(physicalProfile).filter((value) => Number.isFinite(value)).length;
  let confidence = 18;
  if (playerName !== 'Jogador não identificado') confidence += 14;
  if (positions.length > 0) confidence += 10;
  if (ratingValues.length >= 3) confidence += 12;
  if (overall || maxOverall) confidence += 8;
  if (playstyle) confidence += 8;
  confidence += Math.min(24, attributeCount * 1.6);
  confidence += Math.min(8, nativeSkills.length);
  confidence += Math.min(8, modelCount);
  confidence += Math.min(6, impetos.length * 2);
  const warnings: string[] = [];
  if (attributeCount < 12) warnings.push('O OCR leu poucos atributos. Confirme o texto no campo de revisão; mesmo print em HD pode falhar se os números estiverem pequenos no recorte.');
  if (Object.keys(positionRatings).length < 4) warnings.push('A grade de posições não foi lida por completo. Se a posição sair errada, revise as linhas CF/CA, SS/SA, PE/PD, VOL/MC etc. antes de gerar.');
  if (!overall && !maxOverall) warnings.push('Overall não identificado. O app estimou a análise pela posição e atributos lidos.');
  if (trainingPointSource === 'LEVEL_INFERRED') warnings.push(`Orçamento de pontos calculado pelo nível máximo ${level}: ${trainingPointsTotal} pontos.`);
  if (trainingPointSource === 'FALLBACK') warnings.push(pointBudget.warning ?? 'Pontos e nível não foram lidos com segurança; usando orçamento padrão de 64 pontos. Corrija o campo se necessário.');
  if (pointBudget.warning && trainingPointSource !== 'FALLBACK') warnings.push(pointBudget.warning);
  const id = `${slug(playerName)}-${slug(cardType)}-${slug(specialTag ?? playstyle ?? mainPosition)}-${maxOverall ?? overall ?? 'sem-ovr'}`;
  const usablePositions = positions.length
    ? Array.from(new Set([mainPosition, ...positions])).sort((left, right) => Number(positionRatings[right] ?? 0) - Number(positionRatings[left] ?? 0))
    : [mainPosition];

  return {
    playerName,
    cardType,
    specialTag,
    country,
    mainPosition,
    mainPositionPt: POSITION_PT[mainPosition],
    positions: usablePositions,
    positionsPt: usablePositions.map((position) => POSITION_PT[position]),
    positionRatings,
    playstyle,
    dominantFoot,
    overall,
    maxOverall,
    height,
    weight,
    age,
    level,
    trainingPointsTotal,
    trainingPointsUsed,
    trainingPointSource,
    condition,
    impetos,
    nativeSkills,
    specialSkills,
    attributes,
    physicalProfile,
    internalId: id,
    confidence: Math.max(1, Math.min(100, Math.round(confidence))),
    warnings
  };
}

export function analyzeCard(rawText: string, objective: Objective = 'COMPETITIVE', targetPosition: PositionCode | 'AUTO' = 'AUTO', imageFileName?: string | null): AnalysisResult {
  const parsed = parseCard(rawText, imageFileName);
  const attributes = fillAttributes(parsed);
  const positionScores = ALL_POSITIONS
    .map((code) => {
      const rawScore = positionScore(code, attributes, parsed.nativeSkills, parsed.positionRatings) + playstylePositionBonus(code, parsed.playstyle);
      return { code, label: POSITION_PT[code], score: clampDecimal(rawScore, 1, 100), role: roleName(code, attributes), cardRating: parsed.positionRatings[code] ?? null };
    })
    .sort((left, right) => right.score - left.score);
  const stylePreferred = preferredPositionFromPlaystyle(parsed.playstyle, parsed.positionRatings, parsed.attributes);
  const selected = targetPosition === 'AUTO'
    ? (stylePreferred ? positionScores.find((item) => item.code === stylePreferred) ?? positionScores[0] : positionScores[0])
    : positionScores.find((item) => item.code === targetPosition) ?? positionScores[0];
  const pri = calculatePri(selected.code, attributes, parsed.nativeSkills);
  const tacticalFit = calculateTacticalFit(selected.code, attributes, pri);
  const trainingPointsTotal = trainingBudgetFromCard(parsed);
  const training = trainingFor(selected.code, objective, attributes, parsed);
  const trainingCost = trainingPlanCost(training);
  const trainingPointsUsed = Math.min(trainingPlanTotalCost(training), trainingPointsTotal);
  const trainingPointsRemaining = Math.max(0, trainingPointsTotal - trainingPointsUsed);
  const recommendedSkills = recommendAdditionalSkills(parsed, selected.code, objective, attributes);
  const { strengths, weaknesses } = strengthsWeaknesses(attributes, pri);
  const tips = usageTips(selected.code, objective, attributes);
  const buildName = `${POSITION_PT[selected.code]} ${selected.role}`;
  const note = parsed.confidence >= 85
    ? 'Alta confiança. A ficha foi gerada com boa quantidade de dados lidos.'
    : parsed.confidence >= 60
      ? 'Confiança média. Revise nome, posição, overalls e atributos para melhorar a recomendação.'
      : 'Confiança baixa. Para máxima precisão, corrija manualmente os dados lidos antes de usar a ficha.';
  return { parsed, bestPosition: selected, positionScores: positionScores.slice(0, 10), pri, tacticalFit, training, trainingCost, trainingPointsUsed, trainingPointsTotal, trainingPointsRemaining, trainingCostRule: trainingCostRuleText(), recommendedSkills, buildName, strengths, weaknesses, usageTips: tips, note };
}
