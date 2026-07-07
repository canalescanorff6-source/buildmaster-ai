import { toInternalPosition, toPtBrPosition } from '@/lib/positions';
import { displaySkillName, SKILL_REGISTRY_PTBR } from '@/lib/skills-ptbr';

export type ParsedCardAttributes = Partial<{
  offensiveAwareness: number;
  ballControl: number;
  dribbling: number;
  tightPossession: number;
  lowPass: number;
  loftedPass: number;
  finishing: number;
  heading: number;
  placeKicking: number;
  curl: number;
  speed: number;
  acceleration: number;
  kickingPower: number;
  jump: number;
  physicalContact: number;
  balance: number;
  stamina: number;
  defensiveAwareness: number;
  tackling: number;
  aggression: number;
  defensiveEngagement: number;
  goalkeeperAwareness: number;
  goalkeeperCatching: number;
  goalkeeperParrying: number;
  goalkeeperReflexes: number;
  goalkeeperReach: number;
}>;

export type ParsedCardImage = {
  playerName: string;
  rarity: 'STANDARD' | 'FEATURED' | 'POTW' | 'HIGHLIGHT' | 'TRENDING' | 'LEGEND' | 'EPIC' | 'BIG_TIME' | 'SHOW_TIME' | 'SPECIAL';
  specialTag?: string | null;
  country?: string | null;
  club?: string | null;
  mainPosition: string;
  mainPositionPt: string;
  positions: string[];
  positionsPt: string[];
  dominantFoot?: 'RIGHT' | 'LEFT' | 'BOTH' | null;
  playstyle?: string | null;
  overall?: number | null;
  maxOverall?: number | null;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  level?: number | null;
  nativeSkills: string[];
  parsedAttributes: ParsedCardAttributes;
  season?: string | null;
  imageFileName?: string | null;
  internalId: string;
  confidence: number;
  warnings: string[];
};

const RARITY_MAP: Array<[ParsedCardImage['rarity'], RegExp]> = [
  ['SHOW_TIME', /show\s*time|showtime/i],
  ['BIG_TIME', /big\s*time|bigtime/i],
  ['EPIC', /\bepic\b|\b[eé]pico\b/i],
  ['LEGEND', /\blegend\b|lend[aá]rio/i],
  ['POTW', /\bpotw\b|players?\s+of\s+the\s+week|destaques\s+da\s+semana/i],
  ['FEATURED', /featured|destaque/i],
  ['HIGHLIGHT', /highlight/i],
  ['TRENDING', /trending/i],
  ['SPECIAL', /special|especial/i]
];

const POSITION_RE = /\b(GK|CB|LB|RB|DMF|CMF|AMF|LMF|RMF|LWF|RWF|SS|CF|GOL|ZAG|LE|LD|VOL|MC|MAT|MEI|ME|MD|PE|PD|SA|CA)\b/g;

const KNOWN_SPECIAL_TAGS = [
  'Instinto artilheiro',
  'Blitz Curler',
  'Momentum Dribbling',
  'Phenomenal Pass',
  'Phenomenal Finishing',
  'Fortress',
  'Game-changing Pass',
  'Edged Crossing',
  'Visionary Pass',
  'Bullet Header',
  'Aerial Fortress'
];

const SKILL_CANDIDATES = Array.from(
  new Set(SKILL_REGISTRY_PTBR.flatMap((skill) => [skill.name, ...(skill.aliases ?? [])]))
);


const PLAYSTYLE_PTBR: Record<string, string> = {
  'Goal Poacher': 'Artilheiro',
  'Fox in the Box': 'Atacante matador',
  'Deep-Lying Forward': 'Pivô',
  'Creative Playmaker': 'Criador de jogadas',
  'Hole Player': 'Jogador sem bola',
  'Prolific Winger': 'Ponta prolífico',
  'Roaming Flank': 'Jogador de ligação',
  'Anchor Man': 'Âncora',
  Destroyer: 'Destruidor',
  'Build Up': 'Construtor',
  'Offensive Full-back': 'Lateral ofensivo',
  'Defensive Full-back': 'Lateral defensivo',
  'Box-to-Box': 'Box-to-Box',
  'Orchestrator': 'Orquestrador',
  'Extra Frontman': 'Zagueiro ofensivo'
};

function toPtBrPlaystyle(value: string | null) {
  if (!value) return null;
  const normalized = normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const entry = Object.entries(PLAYSTYLE_PTBR).find(([key]) => normalizeText(key).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalized);
  return entry?.[1] ?? value;
}


const ATTRIBUTE_PATTERNS: Array<[keyof ParsedCardAttributes, RegExp[]]> = [
  ['offensiveAwareness', [/talento\s+ofensivo\s*(\d{2,3})/i, /offensive\s+awareness\s*(\d{2,3})/i]],
  ['ballControl', [/controle\s+de\s+bola\s*(\d{2,3})/i, /ball\s+control\s*(\d{2,3})/i]],
  ['dribbling', [/\bdrible\s*(\d{2,3})/i, /dribbling\s*(\d{2,3})/i]],
  ['tightPossession', [/condu[cç][aã]o\s+firme\s*(\d{2,3})/i, /tight\s+possession\s*(\d{2,3})/i]],
  ['lowPass', [/passe\s+rasteiro\s*(\d{2,3})/i, /low\s+pass\s*(\d{2,3})/i]],
  ['loftedPass', [/passe\s+alto\s*(\d{2,3})/i, /lofted\s+pass\s*(\d{2,3})/i]],
  ['finishing', [/finaliza[cç][aã]o\s*(\d{2,3})/i, /finishing\s*(\d{2,3})/i]],
  ['heading', [/cabe[cç]ada\s*(\d{2,3})/i, /heading\s*(\d{2,3})/i]],
  ['placeKicking', [/cobran[cç]a\s+de\s+bola\s+parada\s*(\d{2,3})/i, /place\s+kicking\s*(\d{2,3})/i]],
  ['curl', [/\bcurva\s*(\d{2,3})/i, /curl\s*(\d{2,3})/i]],
  ['speed', [/velocidade\s*(\d{2,3})/i, /speed\s*(\d{2,3})/i]],
  ['acceleration', [/acelera[cç][aã]o\s*(\d{2,3})/i, /acceleration\s*(\d{2,3})/i]],
  ['kickingPower', [/for[cç]a\s+do\s+chute\s*(\d{2,3})/i, /kicking\s+power\s*(\d{2,3})/i]],
  ['jump', [/\bsalto\s*(\d{2,3})/i, /jump\s*(\d{2,3})/i]],
  ['physicalContact', [/contato\s+f[ií]sico\s*(\d{2,3})/i, /physical\s+contact\s*(\d{2,3})/i]],
  ['balance', [/equil[ií]brio\s*(\d{2,3})/i, /balance\s*(\d{2,3})/i]],
  ['stamina', [/resist[eê]ncia\s*(\d{2,3})/i, /stamina\s*(\d{2,3})/i]],
  ['defensiveAwareness', [/talento\s+defensivo\s*(\d{2,3})/i, /defensive\s+awareness\s*(\d{2,3})/i]],
  ['defensiveEngagement', [/dedica[cç][aã]o\s+defensiva\s*(\d{2,3})/i, /defensive\s+engagement\s*(\d{2,3})/i]],
  ['tackling', [/desarme\s*(\d{2,3})/i, /tackling\s*(\d{2,3})/i]],
  ['aggression', [/agressividade\s*(\d{2,3})/i, /aggression\s*(\d{2,3})/i]],
  ['goalkeeperAwareness', [/talento\s+de\s+go\s*(\d{2,3})/i, /gk\s+awareness\s*(\d{2,3})/i]],
  ['goalkeeperCatching', [/firmeza\s+do\s+go\s*(\d{2,3})/i, /gk\s+catching\s*(\d{2,3})/i]],
  ['goalkeeperParrying', [/defesa\s+do\s+go\s*(\d{2,3})/i, /gk\s+parrying\s*(\d{2,3})/i]],
  ['goalkeeperReflexes', [/reflexos\s+do\s+go\s*(\d{2,3})/i, /gk\s+reflexes\s*(\d{2,3})/i]],
  ['goalkeeperReach', [/alcance\s+do\s+go\s*(\d{2,3})/i, /gk\s+reach\s*(\d{2,3})/i]]
];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function cleanLine(value: string) {
  return value.replace(/[|•*_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function findFirst(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanLine(match[1]);
  }
  return null;
}

function parseNumber(text: string, patterns: RegExp[]) {
  const value = findFirst(text, patterns);
  if (!value) return null;
  const n = Number(value.replace(/[^0-9]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function detectRarity(text: string): ParsedCardImage['rarity'] {
  return RARITY_MAP.find(([, pattern]) => pattern.test(text))?.[0] ?? 'SPECIAL';
}

function detectSpecialTag(text: string) {
  return KNOWN_SPECIAL_TAGS.find((tag) => new RegExp(tag.replace(/\s+/g, '\\s+'), 'i').test(text)) ?? null;
}

function detectPositions(text: string) {
  const matches = Array.from(text.toUpperCase().matchAll(POSITION_RE))
    .map((match) => toInternalPosition(match[1]))
    .filter(Boolean) as string[];
  const unique = Array.from(new Set(matches));
  return unique.length ? unique : ['SS'];
}

function detectDominantFoot(text: string): ParsedCardImage['dominantFoot'] {
  if (/p[eé]\s*esquerdo|pior\s+p[eé].*esquerdo|left\s*foot|\bleft\b/i.test(text)) return 'LEFT';
  if (/p[eé]\s*direito|pior\s+p[eé].*direito|right\s*foot|\bright\b/i.test(text)) return 'RIGHT';
  if (/ambidestro|both/i.test(text)) return 'BOTH';
  return null;
}

function guessPlayerName(rawText: string, fileName?: string | null) {
  const ignored = /overall|max|show\s*time|big\s*time|epic|potw|style|estilo|position|posição|posicao|height|weight|skill|habilidade|talento|controle|drible|passe|finaliza|velocidade|acelera|resist|cabe[cç]ada|idade|nivel|nível|altura|peso|artilheiro|argentina/i;
  const lines = rawText
    .split('\n')
    .map(cleanLine)
    .filter(Boolean)
    .filter((line) => !ignored.test(line));

  const uppercaseName = rawText
    .split('\n')
    .map(cleanLine)
    .find((line) => /^[A-ZÀ-Ÿ][A-ZÀ-Ÿ.'\-]+(?:\s+[A-ZÀ-Ÿ][A-ZÀ-Ÿ.'\-]+){1,3}$/.test(line) && !ignored.test(line));

  const explicit = findFirst(rawText, [
    /(?:jogador|player|nome)\s*[:\-]\s*([A-Za-zÀ-ÿ.'\-\s]{3,50})/i,
    /^([A-ZÀ-Ÿ][A-Za-zÀ-ÿ.'\-]+(?:\s+[A-ZÀ-Ÿ][A-Za-zÀ-ÿ.'\-]+){0,3})$/m
  ]);

  if (uppercaseName && uppercaseName.length > 2) return uppercaseName
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  if (explicit && explicit.length > 2) return explicit;
  if (lines[0] && /[A-Za-zÀ-ÿ]/.test(lines[0]) && lines[0].length <= 50) return lines[0];
  if (fileName) {
    const base = fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    if (base.trim().length > 2) return cleanLine(base);
  }
  return 'Jogador não identificado';
}

function detectCountry(rawText: string) {
  return findFirst(rawText, [
    /(?:pa[ií]s|nacionalidade|country|nation)\s*[:\-]\s*([A-Za-zÀ-ÿ\s]{3,40})/i,
    /\b(Argentina|Brazil|Brasil|France|França|Portugal|Spain|Espanha|England|Inglaterra|Germany|Alemanha|Italy|Itália|Netherlands|Holanda|Uruguay|Uruguai)\b/i
  ]);
}

function detectPlaystyle(rawText: string) {
  const detected = findFirst(rawText, [
    /(?:estilo|playstyle|playing\s*style)\s*[:\-]\s*([A-Za-zÀ-ÿ\s\-]{3,45})/i,
    /\b(Artilheiro|Criador de jogadas|Jogador sem bola|Atacante matador|Pivô|Ponta prolífico|Jogador de ligação|Âncora|Destruidor|Construtor|Lateral ofensivo|Lateral defensivo|Creative Playmaker|Hole Player|Goal Poacher|Fox in the Box|Deep-Lying Forward|Roaming Flank|Prolific Winger|Anchor Man|Destroyer|Build Up|Offensive Full-back|Defensive Full-back|Box-to-Box|Orchestrator|Extra Frontman)\b/i
  ]);
  return toPtBrPlaystyle(detected);
}

function parseAttributes(text: string): ParsedCardAttributes {
  const attributes: ParsedCardAttributes = {};
  const clean = normalizeText(text).replace(/\n/g, ' ');

  for (const [key, patterns] of ATTRIBUTE_PATTERNS) {
    for (const pattern of patterns) {
      const normalizedPattern = new RegExp(normalizeText(pattern.source), pattern.flags.replace('u', ''));
      const match = clean.match(normalizedPattern);
      if (match?.[1]) {
        const value = Number(match[1]);
        if (Number.isFinite(value) && value >= 1 && value <= 120) {
          attributes[key] = value;
          break;
        }
      }
    }
  }

  return attributes;
}

function detectNativeSkills(text: string) {
  const normalized = normalizeText(text).toLowerCase();
  const found = SKILL_CANDIDATES.filter((skill) => normalized.includes(normalizeText(skill).toLowerCase()))
    .map(displaySkillName);
  return Array.from(new Set(found));
}

export function parseCardImageText(rawText: string, imageFileName?: string | null): ParsedCardImage {
  const text = rawText || '';
  const warnings: string[] = [];
  const playerName = guessPlayerName(text, imageFileName);
  const rarity = detectRarity(text);
  const specialTag = detectSpecialTag(text) ?? findFirst(text, [/(?:especial|special|skill\s*especial|booster)\s*[:\-]?\s*([A-Za-zÀ-ÿ0-9\s+\-]{3,45})/i]);
  const positions = detectPositions(text);
  const explicitMain = findFirst(text, [/(?:posi[cç][aã]o\s*principal|main\s*position)\s*[:\-]\s*(GK|CB|LB|RB|DMF|CMF|AMF|LMF|RMF|LWF|RWF|SS|CF|GOL|ZAG|LE|LD|VOL|MC|MAT|MEI|ME|MD|PE|PD|SA|CA)/i]);
  const mainPosition = toInternalPosition(explicitMain) ?? positions[0];
  const country = detectCountry(text);
  const playstyle = detectPlaystyle(text);
  const dominantFoot = detectDominantFoot(text);
  const maxOverall = parseNumber(text, [/(?:overall\s*m[aá]ximo|max\s*overall|max)\s*[:\-]?\s*(\d{2,3})/i]);
  const overall = parseNumber(text, [/(?:overall|geral|ovr)\s*[:\-]?\s*(\d{2,3})/i]) ?? maxOverall;
  const season = findFirst(text, [/(20\d{2})/]);
  const height = parseNumber(text, [/(?:altura|height)\s*[:\-]?\s*(\d{2,3})\s*cm/i]);
  const weight = parseNumber(text, [/(?:peso|weight)\s*[:\-]?\s*(\d{2,3})\s*kg/i]);
  const age = parseNumber(text, [/(?:idade|age)\s*[:\-]?\s*(\d{1,2})/i]);
  const level = parseNumber(text, [/(?:n[ií]vel|level)\s*[:\-]?\s*(\d{1,3})/i]);
  const nativeSkills = detectNativeSkills(text);
  const parsedAttributes = parseAttributes(text);
  const attributeCount = Object.keys(parsedAttributes).length;

  if (playerName === 'Jogador não identificado') warnings.push('Não consegui identificar o nome com segurança. Corrija o texto extraído antes de salvar/analisar.');
  if (!playstyle) warnings.push('Estilo de jogo não encontrado no OCR. A recomendação usará posição e atributos.');
  if (!overall && !maxOverall) warnings.push('Overall não encontrado. A análise usará uma carta temporária equilibrada.');
  if (attributeCount < 8) warnings.push('Poucos atributos foram lidos. Envie um print mais nítido/recortado na ficha ou corrija o texto antes de analisar.');
  if (!specialTag && rarity === 'SHOW_TIME') warnings.push('A habilidade especial/booster da carta Show Time não foi encontrada. Corrija se quiser diferenciar versões parecidas.');

  const identityParts = [playerName, rarity.toLowerCase().replace('_', '-'), specialTag ?? playstyle ?? mainPosition, season ?? 'manual', String(maxOverall ?? overall ?? 'na')];
  const internalId = `${slugify(identityParts.join('-'))}-001`;
  const confidence = Math.max(
    25,
    Math.min(
      98,
      30 +
        (playerName !== 'Jogador não identificado' ? 18 : 0) +
        (rarity ? 8 : 0) +
        (specialTag ? 10 : 0) +
        (playstyle ? 7 : 0) +
        (overall || maxOverall ? 8 : 0) +
        Math.min(17, attributeCount)
    )
  );

  return {
    playerName,
    rarity,
    specialTag,
    country,
    club: null,
    mainPosition,
    mainPositionPt: toPtBrPosition(mainPosition),
    positions,
    positionsPt: positions.map(toPtBrPosition),
    dominantFoot,
    playstyle,
    overall,
    maxOverall,
    height,
    weight,
    age,
    level,
    nativeSkills,
    parsedAttributes,
    season,
    imageFileName,
    internalId,
    confidence,
    warnings
  };
}
