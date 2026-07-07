import type { ExternalCardInput } from './external-card-schema';

export type CsvImportResult = {
  rows: Partial<ExternalCardInput>[];
  warnings: string[];
};

const ATTRIBUTE_KEYS = [
  'offensiveAwareness',
  'ballControl',
  'dribbling',
  'tightPossession',
  'lowPass',
  'loftedPass',
  'finishing',
  'heading',
  'placeKicking',
  'curl',
  'speed',
  'acceleration',
  'kickingPower',
  'jump',
  'physicalContact',
  'balance',
  'stamina',
  'defensiveAwareness',
  'tackling',
  'aggression',
  'defensiveEngagement',
  'goalkeeperAwareness',
  'goalkeeperCatching',
  'goalkeeperParrying',
  'goalkeeperReflexes',
  'goalkeeperReach'
] as const;

type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

const HEADER_ALIASES: Record<string, string> = {
  idCarta: 'sourceExternalId',
  cartaId: 'sourceExternalId',
  sourceId: 'sourceExternalId',
  idJogador: 'playerExternalId',
  jogadorId: 'playerExternalId',
  jogador: 'playerName',
  nomeJogador: 'playerName',
  nome: 'playerName',
  clube: 'club',
  pais: 'country',
  país: 'country',
  nacionalidade: 'country',
  posicaoPrincipal: 'mainPosition',
  posiçãoPrincipal: 'mainPosition',
  posicoesSecundarias: 'secondaryPositions',
  posiçõesSecundárias: 'secondaryPositions',
  estiloJogador: 'playerPlaystyle',
  altura: 'height',
  peso: 'weight',
  idade: 'age',
  peDominante: 'dominantFoot',
  péDominante: 'dominantFoot',
  nomeCarta: 'cardName',
  carta: 'cardName',
  temporada: 'season',
  raridade: 'rarity',
  tipoCarta: 'rarity',
  geral: 'overall',
  overallMaximo: 'maxOverall',
  overallMáximo: 'maxOverall',
  geralMaximo: 'maxOverall',
  geralMáximo: 'maxOverall',
  estiloCarta: 'cardPlaystyle',
  imagem: 'imageUrl',
  posicoes: 'positions',
  posições: 'positions',
  dataLancamento: 'releaseDate',
  dataLançamento: 'releaseDate',
  habilidadesNativas: 'nativeSkills',
  habilidadesRecomendadas: 'recommendedSkills',

  conscienciaOfensiva: 'offensiveAwareness',
  consciênciaOfensiva: 'offensiveAwareness',
  controleBola: 'ballControl',
  controleDeBola: 'ballControl',
  drible: 'dribbling',
  conducaoFirme: 'tightPossession',
  conduçãoFirme: 'tightPossession',
  posseApertada: 'tightPossession',
  passeRasteiro: 'lowPass',
  passeBaixo: 'lowPass',
  passeAlto: 'loftedPass',
  finalizacao: 'finishing',
  finalização: 'finishing',
  cabeceio: 'heading',
  bolaParada: 'placeKicking',
  cobrancaFalta: 'placeKicking',
  cobrançaFalta: 'placeKicking',
  efeito: 'curl',
  velocidade: 'speed',
  aceleracao: 'acceleration',
  aceleração: 'acceleration',
  forcaChute: 'kickingPower',
  forçaChute: 'kickingPower',
  impulsao: 'jump',
  impulsão: 'jump',
  contatoFisico: 'physicalContact',
  contatoFísico: 'physicalContact',
  equilibrio: 'balance',
  equilíbrio: 'balance',
  resistencia: 'stamina',
  resistência: 'stamina',
  conscienciaDefensiva: 'defensiveAwareness',
  consciênciaDefensiva: 'defensiveAwareness',
  desarme: 'tackling',
  agressividade: 'aggression',
  engajamentoDefensivo: 'defensiveEngagement',
  conscienciaGoleiro: 'goalkeeperAwareness',
  consciênciaGoleiro: 'goalkeeperAwareness',
  pegadaGoleiro: 'goalkeeperCatching',
  espalmarGoleiro: 'goalkeeperParrying',
  reflexosGoleiro: 'goalkeeperReflexes',
  alcanceGoleiro: 'goalkeeperReach'
};

function normalizeHeader(header: string) {
  const trimmed = header.replace(/^\uFEFF/, '').trim();
  return HEADER_ALIASES[trimmed] ?? trimmed;
}

function normalizeFoot(value?: string) {
  const v = clean(value).toUpperCase();
  if (['LEFT', 'ESQUERDO', 'ESQUERDA', 'L'].includes(v)) return 'LEFT';
  if (['BOTH', 'AMBOS', 'DIREITO/ESQUERDO', 'RIGHT/LEFT'].includes(v)) return 'BOTH';
  return 'RIGHT';
}

function normalizeRarity(value?: string) {
  const v = clean(value);
  if (!v) return 'STANDARD';
  return v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

function clean(value?: string) {
  return (value ?? '').trim();
}

function emptyToUndefined(value?: string) {
  const v = clean(value);
  return v === '' ? undefined : v;
}

function parseList(value?: string) {
  const v = clean(value);
  if (!v) return [];
  return v
    .split(/[|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(cell);
      cell = '';
      continue;
    }

    cell += char;
  }

  cells.push(cell);
  return cells.map((item) => item.trim());
}

function splitCsvRows(csv: string) {
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += char + next;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      if (current.trim()) rows.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) rows.push(current);
  return rows;
}

function buildObject(headers: string[], cells: string[]) {
  const row: Record<string, string> = {};
  headers.forEach((header, index) => {
    row[header] = cells[index] ?? '';
  });
  return row;
}

export function csvToExternalCards(csv: string): CsvImportResult {
  const warnings: string[] = [];
  const lines = splitCsvRows(csv);

  if (lines.length < 2) return { rows: [], warnings: ['CSV vazio ou sem linhas de dados.'] };

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length) warnings.push(`Cabeçalhos duplicados: ${duplicateHeaders.join(', ')}`);

  const rows = lines.slice(1).map((line, index) => {
    const raw = buildObject(headers, parseCsvLine(line));
    const attributes: Record<AttributeKey, string> = {} as Record<AttributeKey, string>;

    for (const key of ATTRIBUTE_KEYS) {
      if (raw[key] !== undefined && raw[key] !== '') attributes[key] = raw[key] as string;
    }

    const sourceExternalId = emptyToUndefined(raw.sourceExternalId) ?? `upload-row-${index + 1}-${clean(raw.playerName || raw.nome).toLowerCase().replace(/\s+/g, '-')}`;

    return {
      sourceExternalId,
      sourceUpdatedAt: emptyToUndefined(raw.sourceUpdatedAt),
      playerExternalId: emptyToUndefined(raw.playerExternalId),
      playerName: emptyToUndefined(raw.playerName),
      club: emptyToUndefined(raw.club),
      country: emptyToUndefined(raw.country),
      mainPosition: emptyToUndefined(raw.mainPosition),
      secondaryPositions: parseList(raw.secondaryPositions),
      playerPlaystyle: emptyToUndefined(raw.playerPlaystyle),
      height: emptyToUndefined(raw.height) as unknown as number,
      weight: emptyToUndefined(raw.weight) as unknown as number,
      age: emptyToUndefined(raw.age) as unknown as number,
      dominantFoot: normalizeFoot(raw.dominantFoot),
      cardName: emptyToUndefined(raw.cardName),
      season: emptyToUndefined(raw.season),
      rarity: normalizeRarity(raw.rarity),
      overall: emptyToUndefined(raw.overall) as unknown as number,
      maxOverall: emptyToUndefined(raw.maxOverall) as unknown as number,
      cardPlaystyle: emptyToUndefined(raw.cardPlaystyle),
      imageUrl: emptyToUndefined(raw.imageUrl),
      positions: parseList(raw.positions),
      releaseDate: emptyToUndefined(raw.releaseDate),
      nativeSkills: parseList(raw.nativeSkills),
      recommendedSkills: parseList(raw.recommendedSkills),
      attributes
    } as Partial<ExternalCardInput>;
  });

  return { rows, warnings };
}

export const csvImportTemplate = `sourceExternalId,playerExternalId,playerName,club,country,mainPosition,secondaryPositions,playerPlaystyle,height,weight,age,dominantFoot,cardName,season,rarity,overall,maxOverall,cardPlaystyle,positions,releaseDate,nativeSkills,recommendedSkills,offensiveAwareness,ballControl,dribbling,tightPossession,lowPass,loftedPass,finishing,heading,placeKicking,curl,speed,acceleration,kickingPower,jump,physicalContact,balance,stamina,defensiveAwareness,tackling,aggression,defensiveEngagement,goalkeeperAwareness,goalkeeperCatching,goalkeeperParrying,goalkeeperReflexes,goalkeeperReach\nexemplo-001,jogador-001,Jogador Exemplo,Clube Exemplo,Brazil,AMF,SS|CMF,Creative Playmaker,175,72,27,RIGHT,Carta Exemplo,2026,FEATURED,90,96,Creative Playmaker,AMF|SS,2026-01-01,One-touch Pass|Through Passing,Double Touch|Sole Control,88,91,90,89,87,84,82,65,78,86,84,87,82,70,68,86,80,55,52,58,50,40,40,40,40,40`;
