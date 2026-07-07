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

export type PositionCode = 'CF' | 'SS' | 'LWF' | 'RWF' | 'AMF' | 'CMF' | 'DMF' | 'CB' | 'LB' | 'RB' | 'GK';

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

export type ParsedCard = {
  playerName: string;
  cardType: string;
  specialTag?: string | null;
  country?: string | null;
  mainPosition: PositionCode;
  mainPositionPt: string;
  positions: PositionCode[];
  positionsPt: string[];
  playstyle?: string | null;
  dominantFoot?: string | null;
  overall?: number | null;
  maxOverall?: number | null;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  level?: number | null;
  nativeSkills: string[];
  attributes: Attributes;
  internalId: string;
  confidence: number;
  warnings: string[];
};

export type AnalysisResult = {
  parsed: ParsedCard;
  bestPosition: { code: PositionCode; label: string; score: number };
  positionScores: Array<{ code: PositionCode; label: string; score: number; role: string }>;
  pri: Record<string, number>;
  tacticalFit: Record<string, number>;
  training: Record<string, number>;
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
  { code: 'AMF', label: 'MAT - Meia atacante' },
  { code: 'CMF', label: 'MC - Meia central' },
  { code: 'DMF', label: 'VOL - Volante' },
  { code: 'CB', label: 'ZAG - Zagueiro' },
  { code: 'LB', label: 'LE - Lateral esquerdo' },
  { code: 'RB', label: 'LD - Lateral direito' },
  { code: 'GK', label: 'GOL - Goleiro' }
];

const BASE_BY_POSITION: Record<PositionCode, Required<Attributes>> = {
  CF: attr({ offensiveAwareness: 86, finishing: 86, heading: 78, kickingPower: 84, speed: 80, acceleration: 78, physicalContact: 78, balance: 74, stamina: 78 }),
  SS: attr({ offensiveAwareness: 84, ballControl: 86, dribbling: 86, tightPossession: 84, finishing: 82, lowPass: 80, speed: 82, acceleration: 84, balance: 84, stamina: 78 }),
  LWF: attr({ offensiveAwareness: 80, ballControl: 84, dribbling: 88, tightPossession: 84, finishing: 78, lowPass: 76, loftedPass: 74, speed: 88, acceleration: 88, curl: 82, balance: 84, stamina: 80 }),
  RWF: attr({ offensiveAwareness: 80, ballControl: 84, dribbling: 88, tightPossession: 84, finishing: 78, lowPass: 76, loftedPass: 74, speed: 88, acceleration: 88, curl: 82, balance: 84, stamina: 80 }),
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
  ['dribbling', [/(?<!condu[cç][aã]o\s+)drible\s*(\d{2,3})/i, /dribbling\s*(\d{2,3})/i]],
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

const SKILL_PROFILES: Record<string, { category: string; boosts: Partial<Record<keyof AnalysisResult['pri'], number>>; aliases?: string[] }> = {
  'Pedalada simples': { category: 'DRIBLE', boosts: { dribbling: 2, mobility: 1 }, aliases: ['Scissors Feint'] },
  'Toque duplo': { category: 'DRIBLE', boosts: { dribbling: 4, mobility: 2 }, aliases: ['Double Touch'] },
  'Elástico': { category: 'DRIBLE', boosts: { dribbling: 3, mobility: 1 }, aliases: ['Flip Flap'] },
  'Giro 360°': { category: 'DRIBLE', boosts: { dribbling: 2, mobility: 1 }, aliases: ['Marseille Turn'] },
  'Chapéu': { category: 'DRIBLE', boosts: { dribbling: 2, mobility: 1 }, aliases: ['Sombrero'] },
  'Corte com virada': { category: 'DRIBLE', boosts: { dribbling: 3, mobility: 1 }, aliases: ['Cut Behind & Turn', 'Corte e giro'] },
  'Puxada de letra': { category: 'DRIBLE', boosts: { dribbling: 2, creation: 1 }, aliases: ['Scotch Move'] },
  'Finta de letra': { category: 'DRIBLE', boosts: { dribbling: 2, mobility: 1 }, aliases: ['Step On Skill Control'] },
  'Controle com a sola': { category: 'DRIBLE', boosts: { dribbling: 4, creation: 1 }, aliases: ['Sole Control', 'Controle de sola'] },
  'Cabeçada': { category: 'FINALIZAÇÃO', boosts: { finishing: 2, physical: 1 }, aliases: ['Heading'] },
  'Efeito de longe': { category: 'FINALIZAÇÃO', boosts: { finishing: 3, creation: 1 }, aliases: ['Long-Range Curler'] },
  'Controle da cavadinha': { category: 'FINALIZAÇÃO', boosts: { finishing: 2 }, aliases: ['Chip Shot Control'] },
  'Chute com o peito do pé': { category: 'FINALIZAÇÃO', boosts: { finishing: 3 }, aliases: ['Knuckle Shot'] },
  'Folha seca': { category: 'FINALIZAÇÃO', boosts: { finishing: 2 }, aliases: ['Dipping Shot'] },
  'Chute ascendente': { category: 'FINALIZAÇÃO', boosts: { finishing: 2 }, aliases: ['Rising Shot'] },
  'Precisão à distância': { category: 'FINALIZAÇÃO', boosts: { finishing: 3 }, aliases: ['Long-Range Shooting'] },
  'Finalização acrobática': { category: 'FINALIZAÇÃO', boosts: { finishing: 3, mobility: 1 }, aliases: ['Acrobatic Finishing'] },
  'Toque de calcanhar': { category: 'PASSE', boosts: { creation: 2, dribbling: 1 }, aliases: ['Heel Trick'] },
  'Chute de primeira': { category: 'FINALIZAÇÃO', boosts: { finishing: 4 }, aliases: ['First-time Shot', 'First Time Shot'] },
  'Passe de primeira': { category: 'PASSE', boosts: { creation: 4, pressure: 1 }, aliases: ['One-touch Pass', 'One Touch Pass'] },
  'Passe em profundidade': { category: 'PASSE', boosts: { creation: 4 }, aliases: ['Through Passing'] },
  'Passe na medida': { category: 'PASSE', boosts: { creation: 3 }, aliases: ['Weighted Pass'] },
  'Cruzamento preciso': { category: 'PASSE', boosts: { creation: 3 }, aliases: ['Pinpoint Crossing'] },
  'Curva para fora': { category: 'PASSE', boosts: { creation: 2, finishing: 1 }, aliases: ['Outside Curler'] },
  'De letra': { category: 'FINALIZAÇÃO', boosts: { finishing: 2, creation: 1 }, aliases: ['Rabona'] },
  'Passe sem olhar': { category: 'PASSE', boosts: { creation: 2 }, aliases: ['No Look Pass'] },
  'Passe aéreo baixo': { category: 'PASSE', boosts: { creation: 2 }, aliases: ['Low Lofted Pass'] },
  'Arremesso lateral longo': { category: 'GERAL', boosts: { creation: 1 }, aliases: ['Long Throw'] },
  'Especialista em pênalti': { category: 'FINALIZAÇÃO', boosts: { finishing: 1 }, aliases: ['Penalty Specialist'] },
  'Malícia': { category: 'DRIBLE', boosts: { dribbling: 1, mobility: 1 }, aliases: ['Gamesmanship'] },
  'Marcação individual': { category: 'DEFESA', boosts: { defense: 4, pressure: 2 }, aliases: ['Man Marking'] },
  'Volta para marcar': { category: 'DEFESA', boosts: { pressure: 4, defense: 2 }, aliases: ['Track Back'] },
  'Interceptação': { category: 'DEFESA', boosts: { defense: 4, pressure: 1 }, aliases: ['Interception'] },
  'Bloqueador': { category: 'DEFESA', boosts: { defense: 4, physical: 1 }, aliases: ['Blocker'] },
  'Superioridade aérea': { category: 'FÍSICO', boosts: { physical: 3, finishing: 1 }, aliases: ['Aerial Superiority'] },
  'Carrinho': { category: 'DEFESA', boosts: { defense: 3 }, aliases: ['Sliding Tackle'] },
  'Afastamento acrobático': { category: 'DEFESA', boosts: { defense: 2, mobility: 1 }, aliases: ['Acrobatic Clearance'] },
  'Liderança': { category: 'GERAL', boosts: { stamina: 2, pressure: 1 }, aliases: ['Captaincy'] },
  'Super substituto': { category: 'GERAL', boosts: { finishing: 2, mobility: 2, stamina: 1 }, aliases: ['Super Sub', 'Super-sub'] },
  'Espírito guerreiro': { category: 'GERAL', boosts: { stamina: 3, pressure: 2 }, aliases: ['Fighting Spirit'] },
  'Finalizador nato': { category: 'FINALIZAÇÃO', boosts: { finishing: 3 }, aliases: ['Phenomenal Finishing', 'Finisher'] }
};

function attr(overrides: Attributes): Required<Attributes> {
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

function avg(...values: Array<number | undefined>) {
  const usable = values.filter((value): value is number => Number.isFinite(value));
  if (!usable.length) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function readNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) return value;
    }
  }
  return null;
}

function detectPositions(text: string): PositionCode[] {
  const normalized = ` ${normalize(text).toUpperCase()} `;
  const aliases: Array<[PositionCode, RegExp]> = [
    ['CF', /\b(CF|CA|CENTROAVANTE)\b/],
    ['SS', /\b(SS|SA|SEGUNDO ATACANTE|SEGUNDO\s+ATACANTE)\b/],
    ['LWF', /\b(LWF|PE|PTE|PONTA ESQUERDA)\b/],
    ['RWF', /\b(RWF|PD|PTD|PONTA DIREITA)\b/],
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

function detectCardType(text: string) {
  const normalized = normalize(text).toLowerCase();
  if (/show\s*time/.test(normalized)) return 'Show Time';
  if (/big\s*time/.test(normalized)) return 'Big Time';
  if (/epic|epico|epic/.test(normalized)) return 'Epic';
  if (/potw|player\s+of\s+the\s+week/.test(normalized)) return 'POTW';
  if (/featured|destaque/.test(normalized)) return 'Featured';
  if (/legend|lenda/.test(normalized)) return 'Legend';
  if (/highlight/.test(normalized)) return 'Highlight';
  if (/standard|padrao|padrão/.test(normalized)) return 'Standard';
  return 'Carta analisada';
}

function detectSpecialTag(text: string) {
  const normalized = normalize(text).toLowerCase();
  const tags = ['Blitz Curler', 'Momentum Dribbling', 'Phenomenal Finishing', 'Phenomenal Pass', 'Game-changing Pass', 'Fortress', 'Edged Crossing', 'Bullet Header'];
  return tags.find((tag) => normalized.includes(normalize(tag).toLowerCase())) ?? null;
}

function detectPlaystyle(text: string) {
  const styleMap: Array<[RegExp, string]> = [
    [/artilheiro|goal\s+poacher/i, 'Artilheiro'],
    [/criador\s+de\s+jogadas|creative\s+playmaker/i, 'Criador de jogadas'],
    [/jogador\s+sem\s+bola|hole\s+player/i, 'Jogador sem bola'],
    [/atacante\s+matador|fox\s+in\s+the\s+box/i, 'Atacante matador'],
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

  const found = styleMap.find(([regex]) => regex.test(text));
  return found?.[1] ?? null;
}

function detectName(rawText: string, fileName?: string | null) {
  const ignored = /^(show time|big time|epic|potw|featured|legend|standard|arilheiro|artilheiro|criador|altura|peso|idade|nivel|nível|talento|controle|drible|passe|finaliza|cabe[cç]ada|velocidade|acelera|for[cç]a|salto|contato|equil[ií]brio|resist[eê]ncia|habilidades|skills|ca|cf|sa|ss|pd|pe|mat|amf|cmf|dmf|cb|gk|gol)$/i;
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
  const normalized = normalize(text).toLowerCase();
  const found: string[] = [];
  for (const [skill, profile] of Object.entries(SKILL_PROFILES)) {
    const candidates = [skill, ...(profile.aliases ?? [])];
    if (candidates.some((candidate) => normalized.includes(normalize(candidate).toLowerCase()))) found.push(skill);
  }
  return Array.from(new Set(found));
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
      boosted[key] = clamp((boosted[key] ?? 0) + Number(value), 1, 110);
    }
  }
  return boosted;
}

function positionScore(position: PositionCode, a: Required<Attributes>, skills: string[]) {
  const skillBonus = (names: string[]) => names.reduce((sum, skill) => sum + (skills.includes(skill) ? 1.5 : 0), 0);
  const scores: Record<PositionCode, number> = {
    CF: avg(a.offensiveAwareness, a.finishing, a.kickingPower, a.heading, a.physicalContact, a.speed) + skillBonus(['Chute de primeira', 'Precisão à distância', 'Cabeçada', 'Superioridade aérea', 'Finalização acrobática']),
    SS: avg(a.offensiveAwareness, a.ballControl, a.dribbling, a.tightPossession, a.finishing, a.acceleration, a.balance, a.lowPass) + skillBonus(['Toque duplo', 'Controle com a sola', 'Passe de primeira', 'Chute de primeira']),
    LWF: avg(a.speed, a.acceleration, a.dribbling, a.ballControl, a.tightPossession, a.curl, a.finishing, a.balance) + skillBonus(['Toque duplo', 'Controle com a sola', 'Elástico', 'Cruzamento preciso']),
    RWF: avg(a.speed, a.acceleration, a.dribbling, a.ballControl, a.tightPossession, a.curl, a.finishing, a.balance) + skillBonus(['Toque duplo', 'Controle com a sola', 'Elástico', 'Cruzamento preciso']),
    AMF: avg(a.lowPass, a.loftedPass, a.ballControl, a.tightPossession, a.dribbling, a.offensiveAwareness, a.curl) + skillBonus(['Passe de primeira', 'Passe em profundidade', 'Passe na medida', 'Passe sem olhar']),
    CMF: avg(a.lowPass, a.loftedPass, a.ballControl, a.stamina, a.defensiveAwareness, a.tackling, a.physicalContact) + skillBonus(['Passe de primeira', 'Interceptação', 'Espírito guerreiro']),
    DMF: avg(a.defensiveAwareness, a.tackling, a.defensiveEngagement, a.aggression, a.physicalContact, a.stamina, a.lowPass) + skillBonus(['Interceptação', 'Bloqueador', 'Marcação individual', 'Volta para marcar']),
    CB: avg(a.defensiveAwareness, a.tackling, a.defensiveEngagement, a.physicalContact, a.heading, a.jump, a.aggression) + skillBonus(['Bloqueador', 'Interceptação', 'Superioridade aérea', 'Marcação individual']),
    LB: avg(a.speed, a.acceleration, a.stamina, a.loftedPass, a.defensiveAwareness, a.tackling, a.dribbling) + skillBonus(['Cruzamento preciso', 'Interceptação', 'Volta para marcar']),
    RB: avg(a.speed, a.acceleration, a.stamina, a.loftedPass, a.defensiveAwareness, a.tackling, a.dribbling) + skillBonus(['Cruzamento preciso', 'Interceptação', 'Volta para marcar']),
    GK: avg(a.goalkeeperAwareness, a.goalkeeperCatching, a.goalkeeperParrying, a.goalkeeperReflexes, a.goalkeeperReach, a.jump)
  };
  return clamp(scores[position], 1, 110);
}

function roleName(position: PositionCode, a: Required<Attributes>) {
  if (position === 'CF') return a.heading >= 82 || a.physicalContact >= 82 ? 'CA de área / pivô finalizador' : 'CA móvel finalizador';
  if (position === 'SS') return 'SA de infiltração e finalização curta';
  if (position === 'AMF') return 'MAT criador entrelinhas';
  if (position === 'LWF' || position === 'RWF') return 'Ponta agressivo cortando para dentro';
  if (position === 'DMF') return 'VOL marcador e interceptador';
  if (position === 'CMF') return 'MC equilibrado de construção';
  if (position === 'CB') return 'ZAG físico e bloqueador';
  if (position === 'LB' || position === 'RB') return 'Lateral de apoio e recomposição';
  return 'GOL';
}

function calculatePri(position: PositionCode, attributes: Required<Attributes>, skills: string[]) {
  const base = {
    finishing: avg(attributes.finishing, attributes.offensiveAwareness, attributes.kickingPower, attributes.heading),
    creation: avg(attributes.lowPass, attributes.loftedPass, attributes.ballControl, attributes.tightPossession, attributes.curl),
    dribbling: avg(attributes.ballControl, attributes.dribbling, attributes.tightPossession, attributes.balance),
    mobility: avg(attributes.speed, attributes.acceleration, attributes.balance, attributes.stamina),
    pressure: avg(attributes.stamina, attributes.aggression, attributes.defensiveEngagement, attributes.speed),
    defense: avg(attributes.defensiveAwareness, attributes.tackling, attributes.defensiveEngagement, attributes.aggression),
    physical: avg(attributes.physicalContact, attributes.jump, attributes.heading, attributes.kickingPower),
    stamina: attributes.stamina,
    aerial: avg(attributes.heading, attributes.jump, attributes.physicalContact)
  };
  const boosted = applySkillBoosts(base, skills);
  const weights: Record<PositionCode, Partial<Record<keyof typeof boosted, number>>> = {
    CF: { finishing: 0.34, physical: 0.17, aerial: 0.13, mobility: 0.14, dribbling: 0.1, creation: 0.04, stamina: 0.08 },
    SS: { finishing: 0.22, dribbling: 0.22, mobility: 0.18, creation: 0.16, pressure: 0.08, physical: 0.06, stamina: 0.08 },
    LWF: { dribbling: 0.24, mobility: 0.24, finishing: 0.16, creation: 0.14, pressure: 0.08, stamina: 0.08, physical: 0.06 },
    RWF: { dribbling: 0.24, mobility: 0.24, finishing: 0.16, creation: 0.14, pressure: 0.08, stamina: 0.08, physical: 0.06 },
    AMF: { creation: 0.34, dribbling: 0.2, mobility: 0.12, finishing: 0.12, pressure: 0.08, stamina: 0.08, physical: 0.06 },
    CMF: { creation: 0.23, defense: 0.18, pressure: 0.16, stamina: 0.15, dribbling: 0.12, physical: 0.1, mobility: 0.06 },
    DMF: { defense: 0.33, pressure: 0.19, physical: 0.17, stamina: 0.13, creation: 0.1, mobility: 0.08 },
    CB: { defense: 0.37, physical: 0.23, aerial: 0.17, pressure: 0.1, stamina: 0.06, mobility: 0.07 },
    LB: { mobility: 0.23, stamina: 0.18, defense: 0.18, creation: 0.15, pressure: 0.12, dribbling: 0.1, physical: 0.04 },
    RB: { mobility: 0.23, stamina: 0.18, defense: 0.18, creation: 0.15, pressure: 0.12, dribbling: 0.1, physical: 0.04 },
    GK: { defense: 0.2, physical: 0.25, mobility: 0.15, stamina: 0.05 }
  };
  const weight = weights[position];
  const overall = Object.entries(weight).reduce((sum, [key, value]) => sum + boosted[key] * Number(value), 0);
  return Object.fromEntries([...Object.entries(boosted).map(([key, value]) => [key, Number(value.toFixed(1))]), ['overall', Number(overall.toFixed(1))]]) as Record<string, number>;
}

function calculateTacticalFit(position: PositionCode, a: Required<Attributes>, pri: Record<string, number>) {
  const possession = avg(pri.creation, pri.dribbling, a.lowPass, a.ballControl) / 10;
  const quickCounter = avg(pri.mobility, pri.finishing, a.acceleration, a.offensiveAwareness) / 10;
  const longBallCounter = avg(pri.physical, pri.aerial, a.speed, a.stamina) / 10;
  const outWide = avg(a.loftedPass, a.curl, a.speed, a.acceleration, position === 'CF' ? a.heading : a.dribbling) / 10;
  const longBall = avg(a.physicalContact, a.heading, a.kickingPower, a.loftedPass) / 10;
  return {
    possession: Number(Math.max(1, Math.min(10, possession)).toFixed(1)),
    quickCounter: Number(Math.max(1, Math.min(10, quickCounter)).toFixed(1)),
    longBallCounter: Number(Math.max(1, Math.min(10, longBallCounter)).toFixed(1)),
    outWide: Number(Math.max(1, Math.min(10, outWide)).toFixed(1)),
    longBall: Number(Math.max(1, Math.min(10, longBall)).toFixed(1))
  };
}

function trainingFor(position: PositionCode, objective: Objective, a: Required<Attributes>) {
  const baseByPosition: Record<PositionCode, Record<string, number>> = {
    CF: { shooting: 8, passing: 0, dribbling: 2, dexterity: 5, lowerBodyStrength: 8, aerialStrength: a.heading >= 78 ? 5 : 2, defending: 0 },
    SS: { shooting: 6, passing: 2, dribbling: 6, dexterity: 8, lowerBodyStrength: 5, aerialStrength: 0, defending: 0 },
    LWF: { shooting: 4, passing: 2, dribbling: 8, dexterity: 8, lowerBodyStrength: 6, aerialStrength: 0, defending: 0 },
    RWF: { shooting: 4, passing: 2, dribbling: 8, dexterity: 8, lowerBodyStrength: 6, aerialStrength: 0, defending: 0 },
    AMF: { shooting: 2, passing: 7, dribbling: 6, dexterity: 6, lowerBodyStrength: 3, aerialStrength: 0, defending: 0 },
    CMF: { shooting: 0, passing: 6, dribbling: 3, dexterity: 3, lowerBodyStrength: 4, aerialStrength: 0, defending: 5 },
    DMF: { shooting: 0, passing: 4, dribbling: 0, dexterity: 2, lowerBodyStrength: 4, aerialStrength: 0, defending: 9 },
    CB: { shooting: 0, passing: 0, dribbling: 0, dexterity: 0, lowerBodyStrength: 5, aerialStrength: 5, defending: 10 },
    LB: { shooting: 0, passing: 4, dribbling: 3, dexterity: 4, lowerBodyStrength: 5, aerialStrength: 0, defending: 5 },
    RB: { shooting: 0, passing: 4, dribbling: 3, dexterity: 4, lowerBodyStrength: 5, aerialStrength: 0, defending: 5 },
    GK: { shooting: 0, passing: 0, dribbling: 0, dexterity: 0, lowerBodyStrength: 0, aerialStrength: 0, defending: 0, gk1: 6, gk2: 6, gk3: 6 }
  };
  const build = { ...baseByPosition[position] };
  if (objective === 'FINISHER') build.shooting = (build.shooting ?? 0) + 3;
  if (objective === 'CREATOR' || objective === 'POSSESSION') build.passing = (build.passing ?? 0) + 3;
  if (objective === 'DRIBBLER') build.dribbling = (build.dribbling ?? 0) + 3;
  if (objective === 'PRESSING') {
    build.defending = (build.defending ?? 0) + 2;
    build.lowerBodyStrength = (build.lowerBodyStrength ?? 0) + 2;
  }
  if (objective === 'AERIAL') build.aerialStrength = (build.aerialStrength ?? 0) + 4;
  if (objective === 'DEFENSIVE') build.defending = (build.defending ?? 0) + 4;
  if (objective === 'QUICK_COUNTER') {
    build.dexterity = (build.dexterity ?? 0) + 2;
    build.lowerBodyStrength = (build.lowerBodyStrength ?? 0) + 2;
  }
  return build;
}

function skillPriority(position: PositionCode, objective: Objective) {
  const byPosition: Record<PositionCode, string[]> = {
    CF: ['Chute de primeira', 'Precisão à distância', 'Finalização acrobática', 'Cabeçada', 'Superioridade aérea', 'Efeito de longe', 'Super substituto', 'Espírito guerreiro'],
    SS: ['Toque duplo', 'Controle com a sola', 'Chute de primeira', 'Passe de primeira', 'Passe em profundidade', 'Efeito de longe', 'Curva para fora', 'Super substituto'],
    LWF: ['Toque duplo', 'Controle com a sola', 'Elástico', 'Corte com virada', 'Cruzamento preciso', 'Efeito de longe', 'Curva para fora', 'Passe de primeira'],
    RWF: ['Toque duplo', 'Controle com a sola', 'Elástico', 'Corte com virada', 'Cruzamento preciso', 'Efeito de longe', 'Curva para fora', 'Passe de primeira'],
    AMF: ['Passe de primeira', 'Passe em profundidade', 'Passe na medida', 'Passe sem olhar', 'Controle com a sola', 'Toque duplo', 'Curva para fora', 'Efeito de longe'],
    CMF: ['Passe de primeira', 'Passe em profundidade', 'Interceptação', 'Espírito guerreiro', 'Passe na medida', 'Volta para marcar', 'Bloqueador'],
    DMF: ['Interceptação', 'Bloqueador', 'Marcação individual', 'Volta para marcar', 'Espírito guerreiro', 'Passe de primeira', 'Passe em profundidade'],
    CB: ['Bloqueador', 'Interceptação', 'Superioridade aérea', 'Marcação individual', 'Carrinho', 'Afastamento acrobático', 'Espírito guerreiro'],
    LB: ['Cruzamento preciso', 'Passe de primeira', 'Interceptação', 'Volta para marcar', 'Bloqueador', 'Curva para fora', 'Passe na medida'],
    RB: ['Cruzamento preciso', 'Passe de primeira', 'Interceptação', 'Volta para marcar', 'Bloqueador', 'Curva para fora', 'Passe na medida'],
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
  } else if (position === 'DMF') {
    tips.push('Use como VOL fixo: bloqueie linha de passe, antecipe e solte passe curto seguro.');
    tips.push('Evite subir demais se a carta não tiver mobilidade alta.');
  } else if (position === 'CB') {
    tips.push('Use como ZAG de cobertura: não dê bote desnecessário; priorize interceptar e bloquear chutes.');
    tips.push('Combine com outro zagueiro mais veloz se a velocidade estiver abaixo de 75.');
  } else {
    tips.push('Use na posição recomendada e foque nas ações que aparecem como pontos fortes no PRI.');
  }
  if (objective === 'QUICK_COUNTER') tips.push('No contra-ataque rápido, procure passes verticais cedo e evite prender a bola no meio.');
  if (objective === 'POSSESSION') tips.push('Na posse de bola, mantenha aproximação curta e use Passe de primeira para acelerar triangulações.');
  return tips;
}

export function parseCard(rawText: string, imageFileName?: string | null): ParsedCard {
  const text = rawText || '';
  const attributes = parseAttributes(text);
  const positions = detectPositions(text);
  const allNumbers = [...text.matchAll(/\b(\d{2,3})\b/g)].map((match) => Number(match[1])).filter((value) => value >= 40 && value <= 120);
  const overall = readNumber(text, [/overall\s*(?:base|inicial)?\s*(\d{2,3})/i, /\bovr\s*(\d{2,3})/i]) ?? (allNumbers.find((value) => value >= 80 && value <= 110) ?? null);
  const maxOverall = readNumber(text, [/overall\s*(?:m[aá]x(?:imo)?|max)\s*(\d{2,3})/i, /max\s*overall\s*(\d{2,3})/i]) ?? (allNumbers.filter((value) => value >= 80 && value <= 110).sort((a, b) => b - a)[0] ?? overall);
  const playerName = detectName(text, imageFileName);
  const mainPosition = positions[0] ?? 'SS';
  const nativeSkills = detectSkills(text);
  const height = readNumber(text, [/altura\s*(\d{3})\s*cm/i, /height\s*(\d{3})\s*cm/i]);
  const weight = readNumber(text, [/peso\s*(\d{2,3})\s*kg/i, /weight\s*(\d{2,3})\s*kg/i]);
  const age = readNumber(text, [/idade\s*(\d{1,2})/i, /age\s*(\d{1,2})/i]);
  const level = readNumber(text, [/n[ií]vel\s*(\d{1,3})/i, /level\s*(\d{1,3})/i]);
  const playstyle = detectPlaystyle(text);
  const specialTag = detectSpecialTag(text);
  const cardType = detectCardType(text);
  const country = text.match(/\b(Argentina|Brasil|Brazil|França|France|Portugal|Espanha|Spain|Inglaterra|England|Alemanha|Germany|Itália|Italy|Holanda|Netherlands|Uruguai|Uruguay)\b/i)?.[1] ?? null;
  const dominantFoot = /p[eé]\s+esquerdo|left\s+foot/i.test(text) ? 'Esquerdo' : /p[eé]\s+direito|right\s+foot/i.test(text) ? 'Direito' : null;
  const attributeCount = Object.keys(attributes).length;
  let confidence = 20;
  if (playerName !== 'Jogador não identificado') confidence += 18;
  if (positions.length > 0) confidence += 14;
  if (overall || maxOverall) confidence += 12;
  if (playstyle) confidence += 10;
  confidence += Math.min(22, attributeCount * 2);
  confidence += Math.min(10, nativeSkills.length);
  const warnings: string[] = [];
  if (attributeCount < 8) warnings.push('Poucos atributos foram lidos. Para maior precisão, envie print nítido da tela de atributos ou corrija o texto manualmente.');
  if (!positions.length) warnings.push('Posição não identificada com segurança. O app usou SA como fallback; ajuste no campo de texto para melhorar.');
  if (!overall && !maxOverall) warnings.push('Overall não identificado. O app estimou os atributos pela posição, mas a precisão cai.');
  const id = `${slug(playerName)}-${slug(cardType)}-${slug(specialTag ?? playstyle ?? mainPosition)}-${maxOverall ?? overall ?? 'sem-ovr'}`;

  return {
    playerName,
    cardType,
    specialTag,
    country,
    mainPosition,
    mainPositionPt: POSITION_PT[mainPosition],
    positions: positions.length ? positions : [mainPosition],
    positionsPt: (positions.length ? positions : [mainPosition]).map((position) => POSITION_PT[position]),
    playstyle,
    dominantFoot,
    overall,
    maxOverall,
    height,
    weight,
    age,
    level,
    nativeSkills,
    attributes,
    internalId: id,
    confidence: Math.max(1, Math.min(100, Math.round(confidence))),
    warnings
  };
}

export function analyzeCard(rawText: string, objective: Objective = 'COMPETITIVE', targetPosition: PositionCode | 'AUTO' = 'AUTO', imageFileName?: string | null): AnalysisResult {
  const parsed = parseCard(rawText, imageFileName);
  const attributes = fillAttributes(parsed);
  const positionScores = (Object.keys(POSITION_PT) as PositionCode[])
    .map((code) => ({ code, label: POSITION_PT[code], score: positionScore(code, attributes, parsed.nativeSkills), role: roleName(code, attributes) }))
    .sort((left, right) => right.score - left.score);
  const selected = targetPosition === 'AUTO' ? positionScores[0] : positionScores.find((item) => item.code === targetPosition) ?? positionScores[0];
  const pri = calculatePri(selected.code, attributes, parsed.nativeSkills);
  const tacticalFit = calculateTacticalFit(selected.code, attributes, pri);
  const training = trainingFor(selected.code, objective, attributes);
  const recommendedSkills = skillPriority(selected.code, objective).filter((skill) => !parsed.nativeSkills.includes(skill)).slice(0, 6);
  const { strengths, weaknesses } = strengthsWeaknesses(attributes, pri);
  const tips = usageTips(selected.code, objective, attributes);
  const buildName = `${POSITION_PT[selected.code]} ${selected.role}`;
  const note = parsed.confidence >= 85
    ? 'Alta confiança. A ficha foi gerada com boa quantidade de dados lidos.'
    : parsed.confidence >= 60
      ? 'Confiança média. Revise nome, posição, overall e atributos para melhorar a recomendação.'
      : 'Confiança baixa. Para máxima precisão, corrija manualmente os dados lidos antes de usar a ficha.';
  return {
    parsed,
    bestPosition: selected,
    positionScores: positionScores.slice(0, 8),
    pri,
    tacticalFit,
    training,
    recommendedSkills,
    buildName,
    strengths,
    weaknesses,
    usageTips: tips,
    note
  };
}

export const EXAMPLE_TEXT = `Gabriel Batistuta
Artilheiro
Argentina
CA / SA
Altura 185cm
Peso 73kg
Idade 26
Nível 31
Talento ofensivo 81
Controle de bola 76
Drible 76
Condução firme 74
Passe rasteiro 58
Passe alto 55
Finalização 81
Cabeçada 80
Cobrança de bola parada 60
Curva 62
Talento defensivo 40
Dedicação defensiva 47
Desarme 44
Agressividade 47
Velocidade 79
Aceleração 77
Força do chute 84
Salto 77
Contato físico 80
Equilíbrio 68
Resistência 72
Habilidades: Cabeçada, Efeito de longe, Precisão à distância, Chute com o peito do pé, Chute ascendente, Finalização acrobática, Chute de primeira, Espírito guerreiro, Superioridade aérea, Finalizador nato`;
