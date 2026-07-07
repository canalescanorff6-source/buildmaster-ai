import type { Ability, Card, CardAbility, CardAttribute, Player } from '@prisma/client';
import type { ParsedCardImage } from './card-identity';
import { getSkillProfile } from '@/lib/skills-ptbr';

type FullCard = Card & {
  player: Player;
  attributes: CardAttribute | null;
  abilities: Array<CardAbility & { ability: Ability }>;
};

const positionProfiles: Record<string, Partial<CardAttribute>> = {
  CF: { offensiveAwareness: 88, finishing: 88, kickingPower: 84, heading: 78, speed: 80, acceleration: 80, physicalContact: 78, balance: 78, stamina: 80 },
  SS: { offensiveAwareness: 86, ballControl: 88, dribbling: 87, tightPossession: 86, finishing: 84, lowPass: 82, speed: 80, acceleration: 84, balance: 84, stamina: 80 },
  AMF: { offensiveAwareness: 84, ballControl: 88, dribbling: 86, tightPossession: 87, lowPass: 88, loftedPass: 84, finishing: 78, curl: 84, balance: 82, stamina: 80 },
  RWF: { offensiveAwareness: 82, ballControl: 86, dribbling: 88, tightPossession: 84, finishing: 80, lowPass: 78, speed: 88, acceleration: 88, curl: 84, balance: 84, stamina: 80 },
  LWF: { offensiveAwareness: 82, ballControl: 86, dribbling: 88, tightPossession: 84, finishing: 80, lowPass: 78, speed: 88, acceleration: 88, curl: 84, balance: 84, stamina: 80 },
  CMF: { ballControl: 84, lowPass: 86, loftedPass: 82, dribbling: 80, defensiveAwareness: 74, tackling: 74, stamina: 86, aggression: 76, physicalContact: 76 },
  DMF: { ballControl: 78, lowPass: 82, defensiveAwareness: 86, tackling: 86, defensiveEngagement: 86, aggression: 84, physicalContact: 84, stamina: 86 },
  CB: { defensiveAwareness: 88, tackling: 88, defensiveEngagement: 86, aggression: 84, physicalContact: 88, heading: 84, jump: 84, speed: 74, stamina: 80 },
  RB: { speed: 84, acceleration: 82, stamina: 86, defensiveAwareness: 78, tackling: 78, lowPass: 76, loftedPass: 78, dribbling: 76 },
  LB: { speed: 84, acceleration: 82, stamina: 86, defensiveAwareness: 78, tackling: 78, lowPass: 76, loftedPass: 78, dribbling: 76 },
  GK: { goalkeeperAwareness: 88, goalkeeperCatching: 84, goalkeeperParrying: 84, goalkeeperReflexes: 88, goalkeeperReach: 86, jump: 78, physicalContact: 80 }
};

const baseAttributes: Omit<CardAttribute, 'id' | 'cardId' | 'createdAt' | 'updatedAt'> = {
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
  goalkeeperReach: 40
};

function scale(value: number, targetOverall: number) {
  const delta = Math.max(-6, Math.min(12, targetOverall - 90));
  return Math.max(1, Math.min(110, Math.round(value + delta)));
}

function categoryFromSkill(name: string) {
  const profile = getSkillProfile(name);
  if (!profile) return 'GENERAL';
  const map = {
    FINALIZACAO: 'FINISHING',
    PASSE: 'PASSING',
    DRIBLE: 'DRIBBLING',
    DEFESA: 'DEFENDING',
    FISICO: 'PHYSICAL',
    GOLEIRO: 'GOALKEEPING',
    GERAL: 'GENERAL'
  } as const;
  return map[profile.category];
}

function makeAbility(name: string, index: number): CardAbility & { ability: Ability } {
  const profile = getSkillProfile(name);
  return {
    id: `temp-card-ability-${index}`,
    cardId: 'temp-card',
    abilityId: `temp-ability-${index}`,
    type: index === 0 ? 'NATIVE' : 'RECOMMENDED',
    createdAt: new Date(),
    ability: {
      id: `temp-ability-${index}`,
      name,
      category: categoryFromSkill(name) as Ability['category'],
      description: null,
      finishingBoost: profile?.boosts.finishing ?? 0,
      creationBoost: profile?.boosts.creation ?? 0,
      dribbleBoost: profile?.boosts.dribble ?? 0,
      defenseBoost: profile?.boosts.defense ?? 0,
      mobilityBoost: profile?.boosts.mobility ?? 0,
      physicalBoost: profile?.boosts.physical ?? 0,
      pressureBoost: profile?.boosts.pressure ?? 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
}

function nativeSkillsFromParsed(parsed: ParsedCardImage) {
  const skills = [...parsed.nativeSkills];
  if (parsed.specialTag) skills.unshift(parsed.specialTag);
  if (!skills.length && parsed.rarity === 'SHOW_TIME') skills.push('Habilidade especial Show Time');
  if (!skills.length && parsed.rarity === 'BIG_TIME') skills.push('Impacto Big Time');
  if (!skills.length) skills.push('Habilidade base');
  return Array.from(new Set(skills)).slice(0, 12);
}

export function createTemporaryCardFromImage(parsed: ParsedCardImage): FullCard {
  const overall = parsed.maxOverall ?? parsed.overall ?? 92;
  const profile = positionProfiles[parsed.mainPosition] ?? positionProfiles.SS;
  const estimatedAttributes = Object.fromEntries(Object.entries({ ...baseAttributes, ...profile }).map(([key, value]) => [key, scale(Number(value), overall)]));
  const attributes = { ...estimatedAttributes, ...parsed.parsedAttributes };
  const nativeSkills = nativeSkillsFromParsed(parsed);

  return {
    id: 'temp-card',
    playerId: 'temp-player',
    name: `${parsed.playerName} ${parsed.rarity.replace('_', ' ')}`,
    season: parsed.season ?? null,
    rarity: parsed.rarity,
    overall: parsed.overall ?? Math.max(1, overall - 3),
    maxOverall: parsed.maxOverall ?? overall,
    playstyle: parsed.playstyle ?? 'Não identificado',
    imageUrl: null,
    positions: parsed.positions.join(', '),
    createdAt: new Date(),
    updatedAt: new Date(),
    player: {
      id: 'temp-player',
      externalId: parsed.internalId,
      name: parsed.playerName,
      club: parsed.club ?? null,
      country: parsed.country ?? null,
      mainPosition: parsed.mainPosition,
      secondaryPositions: parsed.positions.filter((p) => p !== parsed.mainPosition).join(', ') || null,
      playstyle: parsed.playstyle ?? null,
      height: parsed.height ?? null,
      weight: parsed.weight ?? null,
      age: parsed.age ?? null,
      dominantFoot: parsed.dominantFoot ?? 'RIGHT',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    attributes: {
      id: 'temp-attrs',
      cardId: 'temp-card',
      ...(attributes as Omit<CardAttribute, 'id' | 'cardId' | 'createdAt' | 'updatedAt'>),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    abilities: nativeSkills.map(makeAbility)
  } as FullCard;
}
