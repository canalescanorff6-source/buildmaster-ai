import type { ExternalCardInput } from './external-card-schema';

export function joinField(value?: string | string[] | null) {
  if (!value) return null;
  return Array.isArray(value) ? value.filter(Boolean).join(', ') : value;
}

export function cardDisplayName(row: ExternalCardInput) {
  return row.cardName?.trim() || `${row.playerName} ${row.rarity}`.replace(/\s+/g, ' ').trim();
}

export function safeExternalPlayerId(row: ExternalCardInput) {
  return row.playerExternalId?.trim() || `generated:${row.playerName}:${row.mainPosition}:${row.country ?? 'unknown'}`.toLowerCase();
}
