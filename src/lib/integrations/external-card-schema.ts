import { z } from 'zod';
import { attributeSchema } from '@/lib/validators';

const nullableInt = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
}, z.number().int().optional());

export const externalCardSchema = z.object({
  sourceExternalId: z.string().min(1, 'Cada carta precisa ter sourceExternalId único na fonte.'),
  sourceUpdatedAt: z.string().optional().nullable(),

  playerExternalId: z.string().optional().nullable(),
  playerName: z.string().min(2),
  club: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  mainPosition: z.string().min(1),
  secondaryPositions: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  playerPlaystyle: z.string().optional().nullable(),
  height: nullableInt,
  weight: nullableInt,
  age: nullableInt,
  dominantFoot: z.enum(['RIGHT', 'LEFT', 'BOTH']).default('RIGHT'),

  cardName: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  rarity: z.enum([
    'STANDARD',
    'FEATURED',
    'POTW',
    'HIGHLIGHT',
    'TRENDING',
    'LEGEND',
    'EPIC',
    'BIG_TIME',
    'SHOW_TIME',
    'SPECIAL'
  ]).default('STANDARD'),
  overall: z.coerce.number().int().min(1).max(120),
  maxOverall: nullableInt,
  cardPlaystyle: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  positions: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  releaseDate: z.string().optional().nullable(),

  nativeSkills: z.array(z.string()).default([]),
  recommendedSkills: z.array(z.string()).default([]),
  attributes: attributeSchema.default({})
});

export const externalCardFeedSchema = z.object({
  source: z.object({
    name: z.string().min(1),
    kind: z.enum(['AUTHORIZED_JSON_FEED', 'AUTHORIZED_API', 'USER_UPLOAD', 'PARTNER_LICENSE']).default('AUTHORIZED_JSON_FEED'),
    documentationUrl: z.string().url().optional().nullable(),
    termsAccepted: z.boolean().default(false)
  }).optional(),
  cards: z.array(externalCardSchema)
});

export type ExternalCardInput = z.infer<typeof externalCardSchema>;
export type ExternalCardFeed = z.infer<typeof externalCardFeedSchema>;
