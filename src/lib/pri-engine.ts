import type { Ability, Card, CardAbility, CardAttribute, Player } from '@prisma/client';
import type { PRIBlock, RecommendationResult, TacticalFit } from '@/types';
import { toInternalPosition, toPtBrPosition } from '@/lib/positions';
import { recommendPtBrSkills } from '@/lib/skills-ptbr';

type FullCard = Card & {
  player: Player;
  attributes: CardAttribute | null;
  abilities: Array<CardAbility & { ability: Ability }>;
};

type Objective = 'COMPETITIVE' | 'MAX_OVERALL' | 'FINISHER' | 'CREATOR' | 'DRIBBLER' | 'PRESSING' | 'POSSESSION' | 'QUICK_COUNTER' | 'DEFENSIVE' | 'AERIAL';

type BoostKey = 'finishingBoost' | 'creationBoost' | 'dribbleBoost' | 'defenseBoost' | 'mobilityBoost' | 'physicalBoost' | 'pressureBoost';

const defaultAttributes: CardAttribute = {
  id: 'default',
  cardId: 'default',
  offensiveAwareness: 70,
  ballControl: 70,
  dribbling: 70,
  tightPossession: 70,
  lowPass: 70,
  loftedPass: 70,
  finishing: 70,
  heading: 70,
  placeKicking: 70,
  curl: 70,
  speed: 70,
  acceleration: 70,
  kickingPower: 70,
  jump: 70,
  physicalContact: 70,
  balance: 70,
  stamina: 70,
  defensiveAwareness: 50,
  tackling: 50,
  aggression: 50,
  defensiveEngagement: 50,
  goalkeeperAwareness: 40,
  goalkeeperCatching: 40,
  goalkeeperParrying: 40,
  goalkeeperReflexes: 40,
  goalkeeperReach: 40,
  createdAt: new Date(),
  updatedAt: new Date()
};

function avg(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min = 1, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function abilityBoost(card: FullCard, key: BoostKey) {
  return card.abilities.reduce((sum, item) => {
    const multiplier = item.type === 'NATIVE' ? 1 : 0.65;
    return sum + Number(item.ability[key] ?? 0) * multiplier;
  }, 0);
}

function normalizePosition(position: string, fallback: string) {
  const value = position === 'AUTO' ? fallback : position;
  return toInternalPosition(value) ?? toInternalPosition(fallback) ?? 'SS';
}

export function calculatePRI(card: FullCard, targetPosition = 'AUTO'): PRIBlock {
  const a = card.attributes ?? defaultAttributes;
  const position = normalizePosition(targetPosition, card.player.mainPosition);

  const finishing = avg([a.finishing * 1.45, a.offensiveAwareness * 1.15, a.kickingPower * 0.9, a.curl * 0.55, a.ballControl * 0.75, a.balance * 0.45]) + abilityBoost(card, 'finishingBoost');
  const creation = avg([a.lowPass * 1.35, a.loftedPass * 1.05, a.ballControl * 0.95, a.tightPossession * 0.85, a.offensiveAwareness * 0.75, a.curl * 0.55]) + abilityBoost(card, 'creationBoost');
  const dribbling = avg([a.dribbling * 1.35, a.ballControl * 1.05, a.tightPossession * 1.1, a.balance * 0.8, a.acceleration * 0.65]) + abilityBoost(card, 'dribbleBoost');
  const mobility = avg([a.speed * 1.15, a.acceleration * 1.25, a.balance * 0.85, a.stamina * 0.45]) + abilityBoost(card, 'mobilityBoost');
  const pressure = avg([a.aggression * 1.05, a.stamina * 1.05, a.speed * 0.75, a.defensiveEngagement * 0.95, a.acceleration * 0.55]) + abilityBoost(card, 'pressureBoost');
  const defense = avg([a.defensiveAwareness * 1.25, a.tackling * 1.2, a.defensiveEngagement * 1.1, a.aggression * 0.9, a.physicalContact * 0.75, a.jump * 0.45]) + abilityBoost(card, 'defenseBoost');
  const physical = avg([a.physicalContact * 1.15, a.jump * 0.85, a.heading * 0.8, a.stamina * 0.65, a.balance * 0.55]) + abilityBoost(card, 'physicalBoost');
  const stamina = a.stamina;

  const scores = { finishing, creation, dribbling, mobility, pressure, defense, physical, stamina };
  const positionWeights: Record<string, Partial<Record<keyof typeof scores, number>>> = {
    CF: { finishing: 0.28, mobility: 0.16, dribbling: 0.14, physical: 0.14, creation: 0.1, pressure: 0.1, stamina: 0.08 },
    SS: { finishing: 0.22, dribbling: 0.2, mobility: 0.16, creation: 0.16, pressure: 0.1, stamina: 0.08, physical: 0.08 },
    AMF: { creation: 0.28, dribbling: 0.2, mobility: 0.13, finishing: 0.13, pressure: 0.1, stamina: 0.1, physical: 0.06 },
    RWF: { dribbling: 0.24, mobility: 0.22, finishing: 0.16, creation: 0.15, pressure: 0.09, stamina: 0.08, physical: 0.06 },
    LWF: { dribbling: 0.24, mobility: 0.22, finishing: 0.16, creation: 0.15, pressure: 0.09, stamina: 0.08, physical: 0.06 },
    RMF: { mobility: 0.18, creation: 0.18, dribbling: 0.17, pressure: 0.14, stamina: 0.14, defense: 0.11, finishing: 0.08 },
    LMF: { mobility: 0.18, creation: 0.18, dribbling: 0.17, pressure: 0.14, stamina: 0.14, defense: 0.11, finishing: 0.08 },
    CMF: { creation: 0.22, stamina: 0.16, pressure: 0.15, defense: 0.13, dribbling: 0.13, mobility: 0.11, physical: 0.1 },
    DMF: { defense: 0.27, pressure: 0.18, physical: 0.15, stamina: 0.14, creation: 0.12, mobility: 0.08, dribbling: 0.06 },
    CB: { defense: 0.34, physical: 0.18, pressure: 0.15, stamina: 0.09, mobility: 0.1, creation: 0.07, dribbling: 0.03, finishing: 0.04 },
    RB: { defense: 0.2, mobility: 0.18, stamina: 0.16, pressure: 0.15, creation: 0.12, physical: 0.1, dribbling: 0.09 },
    LB: { defense: 0.2, mobility: 0.18, stamina: 0.16, pressure: 0.15, creation: 0.12, physical: 0.1, dribbling: 0.09 }
  };
  const weights = positionWeights[position] ?? positionWeights[card.player.mainPosition.toUpperCase()] ?? positionWeights.SS;
  const overall = Object.entries(weights).reduce((sum, [key, weight]) => sum + scores[key as keyof typeof scores] * Number(weight), 0);

  return {
    finishing: round(clamp(finishing)),
    creation: round(clamp(creation)),
    dribbling: round(clamp(dribbling)),
    mobility: round(clamp(mobility)),
    pressure: round(clamp(pressure)),
    defense: round(clamp(defense)),
    physical: round(clamp(physical)),
    stamina: round(clamp(stamina)),
    overall: round(clamp(overall))
  };
}

export function calculateTacticalFit(card: FullCard): TacticalFit {
  const a = card.attributes ?? defaultAttributes;
  return {
    possession: round(clamp(avg([a.ballControl, a.lowPass, a.tightPossession, a.dribbling, a.stamina]) / 10, 1, 10)),
    quickCounter: round(clamp(avg([a.speed, a.acceleration, a.offensiveAwareness, a.finishing, a.stamina]) / 10, 1, 10)),
    longBallCounter: round(clamp(avg([a.speed, a.physicalContact, a.heading, a.kickingPower, a.offensiveAwareness]) / 10, 1, 10)),
    outWide: round(clamp(avg([a.speed, a.loftedPass, a.dribbling, a.curl, a.stamina]) / 10, 1, 10)),
    longBall: round(clamp(avg([a.physicalContact, a.heading, a.jump, a.loftedPass, a.kickingPower]) / 10, 1, 10))
  };
}

function recommendedSkillsByPosition(position: string, objective: Objective, nativeSkills: string[] = []) {
  const positionPt = toPtBrPosition(position);
  return recommendPtBrSkills(positionPt, objective, nativeSkills, 5);
}


function trainingByObjective(position: string, objective: Objective): Record<string, number> {
  const p = toInternalPosition(position) ?? position.toUpperCase();
  const base = { shooting: 0, passing: 0, dribbling: 0, dexterity: 0, lowerBodyStrength: 0, aerialStrength: 0, defending: 0, gk1: 0, gk2: 0, gk3: 0 };
  if (objective === 'FINISHER' || p === 'CF') return { ...base, shooting: 10, dribbling: 4, dexterity: 8, lowerBodyStrength: 8, aerialStrength: 4 };
  if (objective === 'CREATOR' || p === 'AMF') return { ...base, shooting: 4, passing: 10, dribbling: 8, dexterity: 7, lowerBodyStrength: 4 };
  if (objective === 'DRIBBLER' || ['RWF', 'LWF', 'SS'].includes(p)) return { ...base, shooting: 6, passing: 4, dribbling: 10, dexterity: 10, lowerBodyStrength: 6 };
  if (objective === 'DEFENSIVE' || p === 'DMF') return { ...base, passing: 5, dexterity: 4, lowerBodyStrength: 6, defending: 12, aerialStrength: 3 };
  if (p === 'CB') return { ...base, lowerBodyStrength: 6, aerialStrength: 8, defending: 14, dexterity: 2 };
  if (['LB', 'RB'].includes(p)) return { ...base, passing: 5, dribbling: 4, dexterity: 6, lowerBodyStrength: 8, defending: 8 };
  if (objective === 'PRESSING') return { ...base, passing: 4, dribbling: 4, dexterity: 7, lowerBodyStrength: 10, defending: 7 };
  if (objective === 'AERIAL') return { ...base, shooting: 5, lowerBodyStrength: 6, aerialStrength: 12, defending: p === 'CB' ? 8 : 0 };
  return { ...base, shooting: 6, passing: 5, dribbling: 7, dexterity: 7, lowerBodyStrength: 6, aerialStrength: 2, defending: ['CMF', 'DMF'].includes(p) ? 6 : 0 };
}

function getCandidatePositions(card: FullCard) {
  const fields = [card.player.mainPosition, card.player.secondaryPositions, card.positions].filter(Boolean).join(',');
  const candidates = fields.split(/[,.\s/|]+/).map((item) => toInternalPosition(item)).filter(Boolean) as string[];
  return Array.from(new Set(candidates.length ? candidates : [normalizePosition('AUTO', card.player.mainPosition)]));
}

export function getBestPosition(card: FullCard) {
  const ranked = getCandidatePositions(card).map((position) => ({ position, pri: calculatePRI(card, position).overall })).sort((a, b) => b.pri - a.pri);
  return ranked[0]?.position ?? card.player.mainPosition;
}

export function buildRecommendation(card: FullCard, objective: Objective = 'COMPETITIVE', targetPosition = 'AUTO'): RecommendationResult {
  const recommendedPosition = targetPosition === 'AUTO' ? getBestPosition(card) : normalizePosition(targetPosition, card.player.mainPosition);
  const pri = calculatePRI(card, recommendedPosition);
  const tacticalFit = calculateTacticalFit(card);
  const training = trainingByObjective(recommendedPosition, objective);
  const nativeSkills = card.abilities.map((item) => item.ability.name);
  const recommendedSkills = recommendedSkillsByPosition(recommendedPosition, objective, nativeSkills);
  const labelMap: Record<string, string> = { finishing: 'Finalização', creation: 'Criação', dribbling: 'Drible', mobility: 'Mobilidade', pressure: 'Pressão', defense: 'Defesa', physical: 'Físico', stamina: 'Resistência' };
  const strengths = Object.entries(pri).filter(([key, value]) => key !== 'overall' && value >= 82).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([key]) => labelMap[key] ?? key);
  const weaknesses = Object.entries(pri).filter(([key, value]) => key !== 'overall' && value < 68).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([key]) => labelMap[key] ?? key);
  const usageTips = [
    `Use como ${toPtBrPosition(recommendedPosition)} para explorar o melhor equilíbrio entre atributos e habilidades.`,
    tacticalFit.quickCounter >= tacticalFit.possession ? 'Combina melhor com transições rápidas e ataque direto.' : 'Combina melhor com posse, troca de passes e aproximação.',
    pri.stamina < 70 ? 'Evite pressão constante durante os 90 minutos ou use como opção de segundo tempo.' : 'Pode participar bastante da pressão e recomposição.'
  ];
  return { pri, tacticalFit, targetPosition, targetPositionPt: targetPosition === 'AUTO' ? 'Automático' : toPtBrPosition(targetPosition), recommendedPosition, recommendedPositionPt: toPtBrPosition(recommendedPosition), training, recommendedSkills, strengths, weaknesses, usageTips };
}

export function compareCards(cards: FullCard[], targetPosition = 'AUTO') {
  const rows = cards.map((card) => {
    const position = targetPosition === 'AUTO' ? getBestPosition(card) : normalizePosition(targetPosition, card.player.mainPosition);
    const pri = calculatePRI(card, position);
    const tacticalFit = calculateTacticalFit(card);
    return { id: card.id, player: card.player.name, cardName: card.name, rarity: card.rarity, position, overall: card.overall, maxOverall: card.maxOverall, pri, tacticalFit };
  });
  const winner = rows.slice().sort((a, b) => b.pri.overall - a.pri.overall)[0];
  return { winner, rows };
}
