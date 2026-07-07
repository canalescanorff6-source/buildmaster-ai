export type PRIBlock = {
  finishing: number;
  creation: number;
  dribbling: number;
  mobility: number;
  pressure: number;
  defense: number;
  physical: number;
  stamina: number;
  overall: number;
};

export type TacticalFit = {
  possession: number;
  quickCounter: number;
  longBallCounter: number;
  outWide: number;
  longBall: number;
};

export type RecommendationResult = {
  pri: PRIBlock;
  tacticalFit: TacticalFit;
  targetPosition: string;
  recommendedPosition: string;
  recommendedPositionPt?: string;
  targetPositionPt?: string;
  training: Record<string, number>;
  recommendedSkills: string[];
  strengths: string[];
  weaknesses: string[];
  usageTips: string[];
};
