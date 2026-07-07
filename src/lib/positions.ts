export type InternalPosition =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'DMF'
  | 'CMF'
  | 'AMF'
  | 'LMF'
  | 'RMF'
  | 'LWF'
  | 'RWF'
  | 'SS'
  | 'CF';

export const POSITION_PTBR: Record<InternalPosition, string> = {
  GK: 'GOL',
  CB: 'ZAG',
  LB: 'LE',
  RB: 'LD',
  DMF: 'VOL',
  CMF: 'MC',
  AMF: 'MAT',
  LMF: 'ME',
  RMF: 'MD',
  LWF: 'PE',
  RWF: 'PD',
  SS: 'SA',
  CF: 'CA'
};

export const POSITION_EN_FROM_PTBR: Record<string, InternalPosition> = {
  GOL: 'GK',
  GOLEIRO: 'GK',
  ZAG: 'CB',
  ZAGUEIRO: 'CB',
  LE: 'LB',
  LD: 'RB',
  VOL: 'DMF',
  MC: 'CMF',
  MAT: 'AMF',
  MEI: 'AMF',
  MEIA: 'AMF',
  ME: 'LMF',
  MD: 'RMF',
  PE: 'LWF',
  PTE: 'LWF',
  PD: 'RWF',
  PTD: 'RWF',
  SA: 'SS',
  SS: 'SS',
  CA: 'CF',
  ATA: 'CF'
};

export const POSITION_OPTIONS = [
  { value: 'AUTO', label: 'Automático' },
  { value: 'CF', label: 'CA - Centroavante' },
  { value: 'SS', label: 'SA - Segundo atacante' },
  { value: 'RWF', label: 'PD - Ponta direita' },
  { value: 'LWF', label: 'PE - Ponta esquerda' },
  { value: 'AMF', label: 'MAT - Meia atacante' },
  { value: 'CMF', label: 'MC - Meia central' },
  { value: 'DMF', label: 'VOL - Volante' },
  { value: 'RMF', label: 'MD - Meia direita' },
  { value: 'LMF', label: 'ME - Meia esquerda' },
  { value: 'RB', label: 'LD - Lateral direito' },
  { value: 'LB', label: 'LE - Lateral esquerdo' },
  { value: 'CB', label: 'ZAG - Zagueiro' },
  { value: 'GK', label: 'GOL - Goleiro' }
];

export function toInternalPosition(position?: string | null): InternalPosition | null {
  if (!position) return null;
  const cleaned = position
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase();

  if (!cleaned) return null;
  if (cleaned in POSITION_PTBR) return cleaned as InternalPosition;
  return POSITION_EN_FROM_PTBR[cleaned] ?? null;
}

export function toPtBrPosition(position?: string | null) {
  const internal = toInternalPosition(position);
  return internal ? POSITION_PTBR[internal] : position ?? '';
}

export function toPtBrPositions(value?: string | null) {
  if (!value) return '';
  return value
    .split(/[,/|\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => toPtBrPosition(item))
    .join(' / ');
}

export function positionsForEngine(value?: string | null) {
  if (!value) return '';
  return value
    .split(/[,/|\s]+/)
    .map((item) => toInternalPosition(item))
    .filter(Boolean)
    .join(', ');
}
