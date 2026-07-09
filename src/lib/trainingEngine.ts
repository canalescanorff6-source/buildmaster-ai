import type { TrainingKey, TrainingPlan } from './analyzer';

export type BuildVariant = {
  kind: 'safe' | 'competitive' | 'alternative';
  title: string;
  positionLabel: string;
  training: TrainingPlan;
  pointsUsed: number;
  note: string;
};

export type TrainingComparisonItem = {
  key: TrainingKey;
  label: string;
  auto: number;
  recommended: number;
  difference: number;
};

export const TRAINING_LABELS: Record<TrainingKey, string> = {
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  dexterity: 'Destreza',
  lowerBodyStrength: 'Força pernas',
  aerialStrength: 'Bola aérea',
  defending: 'Defesa',
  gk1: 'GO 1',
  gk2: 'GO 2',
  gk3: 'GO 3'
};

export function cloneTraining(plan: TrainingPlan): TrainingPlan {
  return { ...plan };
}
