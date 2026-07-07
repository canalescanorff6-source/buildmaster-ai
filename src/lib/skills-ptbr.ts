export type SkillProfile = {
  name: string;
  aliases?: string[];
  category: 'FINALIZACAO' | 'PASSE' | 'DRIBLE' | 'DEFESA' | 'FISICO' | 'GOLEIRO' | 'GERAL';
  roleTags: string[];
  boosts: {
    finishing?: number;
    creation?: number;
    dribble?: number;
    defense?: number;
    mobility?: number;
    physical?: number;
    pressure?: number;
  };
};

// Habilidades em PT-BR extraídas das telas do eFootball enviadas pelo usuário.
// A recomendação usa estes nomes para não inventar habilidades fora do jogo.
export const SKILL_REGISTRY_PTBR: SkillProfile[] = [
  // Dribles e controle de bola
  { name: 'Pedalada simples', aliases: ['Scissors Feint', 'Scissors'], category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 2, mobility: 1 } },
  { name: 'Toque duplo', aliases: ['Double Touch'], category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 4, mobility: 1 } },
  { name: 'Elástico', aliases: ['Drible elástico', 'Flip Flap'], category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 3 } },
  { name: 'Giro 360°', aliases: ['Giro 360', 'Giro do Marselha', 'Marseille Turn', 'Marseille'], category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 2, mobility: 1 } },
  { name: 'Chapéu', aliases: ['Sombrero'], category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 2 } },
  { name: 'Corte com virada', aliases: ['Corte atrás e giro', 'Cut Behind & Turn', 'Cut Behind and Turn'], category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 3, mobility: 1 } },
  { name: 'Puxada de letra', category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 2 } },
  { name: 'Finta de letra', category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 2 } },
  { name: 'Controle com a sola', aliases: ['Controle de sola', 'Controle da sola', 'Sole Control'], category: 'DRIBLE', roleTags: ['SA', 'MAT', 'PD', 'PE', 'driblador'], boosts: { dribble: 3, creation: 1 } },

  // Finalização e jogo ofensivo
  { name: 'Cabeçada', aliases: ['Heading'], category: 'FINALIZACAO', roleTags: ['CA', 'ZAG', 'jogo-aereo'], boosts: { finishing: 2, physical: 2 } },
  { name: 'Efeito de longe', aliases: ['Long Range Curler', 'Long-Range Curler'], category: 'FINALIZACAO', roleTags: ['SA', 'MAT', 'PD', 'PE', 'finalizador'], boosts: { finishing: 2, dribble: 1 } },
  { name: 'Controle da cavadinha', aliases: ['Chip Shot Control'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'MAT', 'finalizador'], boosts: { finishing: 2 } },
  { name: 'Chute com o peito do pé', aliases: ['Knuckle Shot'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'MAT', 'PD', 'PE', 'finalizador'], boosts: { finishing: 3 } },
  { name: 'Folha seca', aliases: ['Dipping Shot'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'MAT', 'finalizador'], boosts: { finishing: 2 } },
  { name: 'Chute ascendente', aliases: ['Tiro Ascendente', 'Tiro ascendente', 'Rising Shot'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'MAT', 'PD', 'PE', 'finalizador'], boosts: { finishing: 3 } },
  { name: 'Precisão à distância', aliases: ['Long Range Shooting', 'Long-Range Shooting'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'MAT', 'PD', 'PE', 'finalizador'], boosts: { finishing: 3 } },
  { name: 'Finalização acrobática', aliases: ['Finaliz. acrobática', 'Finalizacao acrobatica', 'Acrobatic Finishing'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'jogo-aereo', 'finalizador'], boosts: { finishing: 3, physical: 1 } },
  { name: 'Toque de calcanhar', aliases: ['Heel Trick'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'MAT', 'criador'], boosts: { finishing: 1, creation: 2 } },
  { name: 'Chute de primeira', aliases: ['First-time Shot', 'First Time Shot'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'PD', 'PE', 'finalizador'], boosts: { finishing: 4 } },
  { name: 'De letra', aliases: ['Rabona'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'MAT', 'PD', 'PE', 'criador'], boosts: { finishing: 2, creation: 1 } },
  { name: 'Afastamento acrobático', category: 'GERAL', roleTags: ['ZAG', 'LD', 'LE', 'VOL'], boosts: { defense: 2, physical: 1 } },
  { name: 'Finalizador nato', category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'finalizador'], boosts: { finishing: 4 } },

  // Passe, criação e cruzamentos
  { name: 'Passe de primeira', aliases: ['One-touch Pass', 'One Touch Pass'], category: 'PASSE', roleTags: ['MAT', 'MC', 'VOL', 'SA', 'criador', 'POSSESSION'], boosts: { creation: 4 } },
  { name: 'Passe em profundidade', aliases: ['Through Passing'], category: 'PASSE', roleTags: ['MAT', 'MC', 'SA', 'VOL', 'criador', 'QUICK_COUNTER'], boosts: { creation: 4 } },
  { name: 'Passe na medida', aliases: ['Passe ponderado', 'Weighted Pass'], category: 'PASSE', roleTags: ['MAT', 'MC', 'VOL', 'criador'], boosts: { creation: 3 } },
  { name: 'Cruzamento preciso', aliases: ['Pinpoint Crossing'], category: 'PASSE', roleTags: ['PD', 'PE', 'LD', 'LE', 'MD', 'ME', 'criador'], boosts: { creation: 3 } },
  { name: 'Curva para fora', aliases: ['Curva externa', 'Outside Curler'], category: 'PASSE', roleTags: ['MAT', 'MC', 'SA', 'PD', 'PE', 'criador'], boosts: { creation: 2, finishing: 1 } },
  { name: 'Passe sem olhar', aliases: ['No Look Pass', 'No-Look Pass'], category: 'PASSE', roleTags: ['MAT', 'MC', 'SA', 'criador'], boosts: { creation: 3 } },
  { name: 'Passe aéreo baixo', aliases: ['Passe alto baixo', 'Low Lofted Pass'], category: 'PASSE', roleTags: ['MAT', 'MC', 'VOL', 'LD', 'LE', 'criador'], boosts: { creation: 3 } },

  // Especialistas e mentalidade
  { name: 'Arremesso lateral longo', aliases: ['Long Throw'], category: 'GERAL', roleTags: ['LD', 'LE', 'ZAG'], boosts: { creation: 1, physical: 1 } },
  { name: 'Especialista em pênalti', aliases: ['Penalty Specialist'], category: 'FINALIZACAO', roleTags: ['CA', 'SA', 'MAT', 'finalizador'], boosts: { finishing: 2 } },
  { name: 'Malícia', aliases: ['Gamesmanship'], category: 'GERAL', roleTags: ['CA', 'SA', 'MAT', 'PD', 'PE'], boosts: { creation: 1, dribble: 1 } },
  { name: 'Liderança', aliases: ['Captaincy', 'Captain'], category: 'GERAL', roleTags: ['CA', 'MC', 'VOL', 'ZAG', 'GOL'], boosts: { pressure: 1, physical: 1 } },
  { name: 'Super substituto', aliases: ['Super reserva', 'Super-sub', 'Super Sub'], category: 'GERAL', roleTags: ['CA', 'SA', 'MAT', 'PD', 'PE'], boosts: { finishing: 2, mobility: 2 } },
  { name: 'Espírito guerreiro', aliases: ['Fighting Spirit'], category: 'GERAL', roleTags: ['CA', 'SA', 'MAT', 'MC', 'VOL', 'ZAG', 'LD', 'LE'], boosts: { pressure: 2, physical: 2 } },

  // Defesa e pressão
  { name: 'Marcação individual', aliases: ['Man Marking'], category: 'DEFESA', roleTags: ['VOL', 'ZAG', 'LD', 'LE', 'MC', 'defensivo'], boosts: { defense: 3, pressure: 2 } },
  { name: 'Volta para marcar', aliases: ['Track Back'], category: 'DEFESA', roleTags: ['VOL', 'MC', 'LD', 'LE', 'PD', 'PE', 'defensivo'], boosts: { defense: 2, pressure: 3 } },
  { name: 'Interceptação', aliases: ['Interception'], category: 'DEFESA', roleTags: ['VOL', 'MC', 'ZAG', 'LD', 'LE', 'defensivo'], boosts: { defense: 4, pressure: 1 } },
  { name: 'Bloqueador', aliases: ['Blocker'], category: 'DEFESA', roleTags: ['VOL', 'ZAG', 'LD', 'LE', 'defensivo'], boosts: { defense: 4 } },
  { name: 'Superioridade aérea', aliases: ['Superioridade Aérea', 'Aerial Superiority'], category: 'FISICO', roleTags: ['CA', 'ZAG', 'VOL', 'jogo-aereo'], boosts: { physical: 4, finishing: 1, defense: 1 } },
  { name: 'Carrinho', aliases: ['Sliding Tackle'], category: 'DEFESA', roleTags: ['VOL', 'ZAG', 'LD', 'LE', 'defensivo'], boosts: { defense: 2, pressure: 1 } }
];

export const SKILL_NAMES_PTBR = SKILL_REGISTRY_PTBR.map((skill) => skill.name);

export function normalizeSkillName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizedNames(skill: SkillProfile) {
  return [skill.name, ...(skill.aliases ?? [])].map(normalizeSkillName);
}

export function getSkillProfile(name: string) {
  const normalized = normalizeSkillName(name);
  return SKILL_REGISTRY_PTBR.find((skill) => normalizedNames(skill).includes(normalized));
}

export function displaySkillName(name: string) {
  return getSkillProfile(name)?.name ?? name;
}

export function recommendPtBrSkills(positionPt: string, objective: string, nativeSkills: string[] = [], limit = 5) {
  const blocked = new Set(nativeSkills.map((skill) => normalizeSkillName(displaySkillName(skill))));
  const tags = new Set<string>([positionPt, objective]);

  if (objective === 'FINISHER') tags.add('finalizador');
  if (objective === 'AERIAL') tags.add('jogo-aereo');
  if (objective === 'CREATOR' || objective === 'POSSESSION') tags.add('criador');
  if (objective === 'DRIBBLER') tags.add('driblador');
  if (objective === 'DEFENSIVE' || objective === 'PRESSING') tags.add('defensivo');

  return SKILL_REGISTRY_PTBR
    .map((skill) => {
      const roleScore = skill.roleTags.reduce((score, tag) => score + (tags.has(tag) ? 3 : 0), 0);
      const objectiveScore =
        objective === 'FINISHER' && skill.category === 'FINALIZACAO' ? 2 :
        objective === 'CREATOR' && skill.category === 'PASSE' ? 2 :
        objective === 'DRIBBLER' && skill.category === 'DRIBLE' ? 2 :
        objective === 'DEFENSIVE' && skill.category === 'DEFESA' ? 2 :
        objective === 'AERIAL' && skill.roleTags.includes('jogo-aereo') ? 2 : 0;
      return { skill, score: roleScore + objectiveScore };
    })
    .filter((item) => !normalizedNames(item.skill).some((name) => blocked.has(name)))
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name, 'pt-BR'))
    .slice(0, limit)
    .map((item) => item.skill.name);
}
