import { PrismaClient, CardRarity, Foot, Role, SkillCategory } from '@prisma/client';
import { hashPassword } from '../src/lib/password';
import { SKILL_REGISTRY_PTBR } from '../src/lib/skills-ptbr';

const prisma = new PrismaClient();

const skillCategoryMap: Record<(typeof SKILL_REGISTRY_PTBR)[number]['category'], SkillCategory> = {
  FINALIZACAO: SkillCategory.FINISHING,
  DRIBLE: SkillCategory.DRIBBLING,
  PASSE: SkillCategory.PASSING,
  DEFESA: SkillCategory.DEFENDING,
  FISICO: SkillCategory.PHYSICAL,
  GOLEIRO: SkillCategory.GOALKEEPING,
  GERAL: SkillCategory.GENERAL
};

const abilities = SKILL_REGISTRY_PTBR.map((skill) => ({
  name: skill.name,
  category: skillCategoryMap[skill.category],
  finishingBoost: skill.boosts.finishing ?? 0,
  creationBoost: skill.boosts.creation ?? 0,
  dribbleBoost: skill.boosts.dribble ?? 0,
  defenseBoost: skill.boosts.defense ?? 0,
  mobilityBoost: skill.boosts.mobility ?? 0,
  physicalBoost: skill.boosts.physical ?? 0,
  pressureBoost: skill.boosts.pressure ?? 0,
  description: `Habilidade adicional em PT-BR: ${skill.name}`
}));

const players = [
  { key: 'messi', name: 'Lionel Messi', club: 'Inter Miami', country: 'Argentina', mainPosition: 'SS', secondaryPositions: 'AMF, RWF, CF', playstyle: 'Creative Playmaker', height: 170, weight: 72, age: 38, dominantFoot: Foot.LEFT },
  { key: 'mbappe', name: 'Kylian Mbappé', club: 'Real Madrid', country: 'France', mainPosition: 'CF', secondaryPositions: 'LWF, SS, RWF', playstyle: 'Goal Poacher', height: 178, weight: 75, age: 27, dominantFoot: Foot.RIGHT },
  { key: 'kdb', name: 'Kevin De Bruyne', club: 'Napoli', country: 'Belgium', mainPosition: 'AMF', secondaryPositions: 'CMF, RMF', playstyle: 'Hole Player', height: 181, weight: 70, age: 35, dominantFoot: Foot.RIGHT },
  { key: 'maldini', name: 'Paolo Maldini', club: 'Milano RN', country: 'Italy', mainPosition: 'CB', secondaryPositions: 'LB', playstyle: 'Defensive Full-back', height: 186, weight: 85, age: 39, dominantFoot: Foot.RIGHT },
  { key: 'vieira', name: 'Patrick Vieira', club: 'Arsenal', country: 'France', mainPosition: 'DMF', secondaryPositions: 'CMF, CB', playstyle: 'Destroyer', height: 192, weight: 82, age: 30, dominantFoot: Foot.RIGHT }
];

const cards = [
  {
    playerKey: 'messi',
    name: 'Epic Creative Playmaker',
    rarity: CardRarity.EPIC,
    overall: 98,
    maxOverall: 103,
    positions: 'SS, AMF, RWF, CF',
    playstyle: 'Creative Playmaker',
    abilities: ['Toque duplo', 'Controle com a sola', 'Efeito de longe', 'Passe de primeira', 'Passe em profundidade'],
    attributes: { offensiveAwareness: 91, ballControl: 99, dribbling: 98, tightPossession: 99, lowPass: 91, loftedPass: 86, finishing: 91, heading: 64, placeKicking: 92, curl: 95, speed: 84, acceleration: 92, kickingPower: 88, jump: 65, physicalContact: 67, balance: 99, stamina: 82, defensiveAwareness: 45, tackling: 48, aggression: 61, defensiveEngagement: 52 }
  },
  {
    playerKey: 'mbappe',
    name: 'Big Time Goal Poacher',
    rarity: CardRarity.BIG_TIME,
    overall: 97,
    maxOverall: 102,
    positions: 'CF, LWF, SS',
    playstyle: 'Goal Poacher',
    abilities: ['Chute de primeira', 'Efeito de longe', 'Super substituto', 'Finalização acrobática'],
    attributes: { offensiveAwareness: 94, ballControl: 91, dribbling: 92, tightPossession: 88, lowPass: 78, loftedPass: 72, finishing: 94, heading: 76, placeKicking: 73, curl: 83, speed: 98, acceleration: 97, kickingPower: 91, jump: 82, physicalContact: 78, balance: 88, stamina: 86, defensiveAwareness: 48, tackling: 52, aggression: 71, defensiveEngagement: 57 }
  },
  {
    playerKey: 'kdb',
    name: 'Show Time Visionary Pass',
    rarity: CardRarity.SHOW_TIME,
    overall: 96,
    maxOverall: 101,
    positions: 'AMF, CMF, RMF',
    playstyle: 'Hole Player',
    abilities: ['Passe de primeira', 'Passe em profundidade', 'Passe na medida', 'Curva para fora', 'Passe aéreo baixo'],
    attributes: { offensiveAwareness: 88, ballControl: 93, dribbling: 86, tightPossession: 88, lowPass: 98, loftedPass: 97, finishing: 84, heading: 72, placeKicking: 90, curl: 93, speed: 80, acceleration: 78, kickingPower: 92, jump: 72, physicalContact: 78, balance: 82, stamina: 90, defensiveAwareness: 65, tackling: 67, aggression: 73, defensiveEngagement: 70 }
  },
  {
    playerKey: 'maldini',
    name: 'Epic Defensive Leader',
    rarity: CardRarity.EPIC,
    overall: 96,
    maxOverall: 100,
    positions: 'CB, LB',
    playstyle: 'Defensive Full-back',
    abilities: ['Bloqueador', 'Interceptação', 'Superioridade aérea', 'Marcação individual', 'Carrinho'],
    attributes: { offensiveAwareness: 63, ballControl: 78, dribbling: 73, tightPossession: 75, lowPass: 82, loftedPass: 79, finishing: 58, heading: 92, placeKicking: 65, curl: 68, speed: 86, acceleration: 82, kickingPower: 77, jump: 91, physicalContact: 90, balance: 79, stamina: 88, defensiveAwareness: 97, tackling: 96, aggression: 88, defensiveEngagement: 95 }
  },
  {
    playerKey: 'vieira',
    name: 'Legend Destroyer',
    rarity: CardRarity.LEGEND,
    overall: 95,
    maxOverall: 100,
    positions: 'DMF, CMF, CB',
    playstyle: 'Destroyer',
    abilities: ['Interceptação', 'Bloqueador', 'Marcação individual', 'Espírito guerreiro', 'Superioridade aérea'],
    attributes: { offensiveAwareness: 72, ballControl: 82, dribbling: 78, tightPossession: 79, lowPass: 84, loftedPass: 80, finishing: 72, heading: 88, placeKicking: 67, curl: 69, speed: 84, acceleration: 78, kickingPower: 88, jump: 91, physicalContact: 96, balance: 80, stamina: 92, defensiveAwareness: 93, tackling: 94, aggression: 95, defensiveEngagement: 94 }
  }
];

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@buildmaster.ai' },
    update: {},
    create: { name: 'Administrador BuildMaster', email: 'admin@buildmaster.ai', passwordHash: await hashPassword('admin123456'), role: Role.ADMIN }
  });

  for (const ability of abilities) {
    await prisma.ability.upsert({ where: { name: ability.name }, update: ability, create: ability });
  }

  const abilityMap = new Map((await prisma.ability.findMany()).map((ability) => [ability.name, ability.id]));
  const playerMap = new Map<string, string>();

  for (const player of players) {
    const { key, ...data } = player;
    const saved = await prisma.player.upsert({
      where: { externalId: `seed:${key}` },
      update: data,
      create: { ...data, externalId: `seed:${key}` }
    });
    playerMap.set(key, saved.id);
  }

  for (const card of cards) {
    const existing = await prisma.card.findFirst({ where: { playerId: playerMap.get(card.playerKey), name: card.name } });
    if (existing) continue;

    const saved = await prisma.card.create({
      data: {
        playerId: playerMap.get(card.playerKey)!,
        name: card.name,
        rarity: card.rarity,
        overall: card.overall,
        maxOverall: card.maxOverall,
        positions: card.positions,
        playstyle: card.playstyle,
        season: '2026',
        attributes: { create: card.attributes },
        abilities: {
          create: card.abilities.map((name) => ({ abilityId: abilityMap.get(name)!, type: 'NATIVE' }))
        }
      }
    });

    console.log(`Carta criada: ${saved.name}`);
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
