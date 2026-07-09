'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Copy,
  History,
  ImagePlus,
  Loader2,
  LogOut,
  RotateCcw,
  ScanText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
  Zap
} from 'lucide-react';
import { clearBuildMasterSession } from '@/components/AuthGate';
import { analyzeCard, ATTRIBUTE_INPUTS, ATTRIBUTE_PT, PLAYSTYLE_OPTIONS, type AnalysisResult, type AttributeKey, type Objective, type PositionCode, POSITION_LABELS } from '@/lib/analyzer';

type ReadingMode = 'precision' | 'fast';
type ResultTab = 'resumo' | 'ficha' | 'habilidades' | 'posicoes' | 'dados';

type ManualFields = {
  playerName: string;
  level: string;
  trainingPointsTotal: string;
  attributes: Partial<Record<AttributeKey, string>>;
};

type SavedAnalysis = {
  id: string;
  savedAt: string;
  rawText: string;
  playerImage: string | null;
  fullPreview: string | null;
  result: AnalysisResult;
};

const HISTORY_KEY = 'buildmaster_history_v19_precision_check';

const objectives: Array<{ value: Objective; title: string; hint: string }> = [
  { value: 'COMPETITIVE', title: 'Desempenho máximo', hint: 'rendimento real em campo, não overall' },
  { value: 'FINISHER', title: 'Finalizador', hint: 'gols, área e chute' },
  { value: 'CREATOR', title: 'Criador', hint: 'passe, controle e assistência' },
  { value: 'DRIBBLER', title: 'Driblador', hint: 'giro curto e 1 contra 1' },
  { value: 'QUICK_COUNTER', title: 'Contra-ataque rápido', hint: 'arranque e verticalidade' },
  { value: 'POSSESSION', title: 'Posse de bola', hint: 'toque curto e paciência' },
  { value: 'PRESSING', title: 'Pressão alta', hint: 'roubo, fôlego e agressividade' },
  { value: 'DEFENSIVE', title: 'Defensivo', hint: 'marcação, bloqueio e cobertura' },
  { value: 'AERIAL', title: 'Jogo aéreo', hint: 'cabeceio, salto e físico' }
];

const playstyleOptions = PLAYSTYLE_OPTIONS;

const trainingLabels: Record<string, string> = {
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

const priLabels: Record<string, string> = {
  finishing: 'Finalização',
  creation: 'Criação',
  dribbling: 'Drible',
  mobility: 'Mobilidade',
  pressure: 'Pressão',
  defense: 'Defesa',
  physical: 'Físico',
  stamina: 'Resistência',
  aerial: 'Jogo aéreo',
  overall: 'PRI geral'
};

const tacticalLabels: Record<string, string> = {
  possession: 'Posse de bola',
  quickCounter: 'Contra-ataque rápido',
  longBallCounter: 'Contra-ataque bola longa',
  outWide: 'Pelas pontas',
  longBall: 'Bola longa'
};

function normalizeLine(line: string) {
  return line.replace(/\s+/g, ' ').trim();
}

function mergeOcrTexts(...texts: string[]) {
  const lines = new Map<string, string>();

  for (const text of texts) {
    for (const line of text.split(/\r?\n/).map(normalizeLine).filter(Boolean)) {
      const key = line
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '');
      if (key && !lines.has(key)) lines.set(key, line);
    }
  }

  return Array.from(lines.values()).join('\n');
}

async function imageToCanvas(file: File | Blob) {
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return null;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0);
  return { bitmap, canvas, ctx };
}

async function preprocessImage(file: File | Blob, mode: 'contrast' | 'sharp' = 'contrast'): Promise<Blob | File> {
  const setup = await imageToCanvas(file).catch(() => null);
  if (!setup) return file as File;

  const { bitmap, canvas, ctx } = setup;
  const scale = Math.max(2, Math.min(4, 3000 / Math.max(1, bitmap.width)));
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const boost = mode === 'sharp' ? 2.18 : 1.76;
    const contrasted = Math.max(0, Math.min(255, (gray - 108) * boost + 158));
    data[index] = contrasted;
    data[index + 1] = contrasted;
    data[index + 2] = contrasted;
  }
  ctx.putImageData(imageData, 0, 0);

  return await new Promise<Blob | File>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? (file as File)), 'image/png', 0.96);
  });
}

async function cropImage(file: File, region: { x: number; y: number; w: number; h: number }, widthTarget = 1900): Promise<Blob | File> {
  const setup = await imageToCanvas(file).catch(() => null);
  if (!setup) return file;

  const { bitmap } = setup;
  const cropX = Math.round(bitmap.width * region.x);
  const cropY = Math.round(bitmap.height * region.y);
  const cropW = Math.round(bitmap.width * region.w);
  const cropH = Math.round(bitmap.height * region.h);
  const scale = Math.max(1.6, widthTarget / Math.max(1, cropW));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cropW * scale);
  canvas.height = Math.round(cropH * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return file;
  ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const contrasted = Math.max(0, Math.min(255, (gray - 110) * 1.92 + 160));
    data[index] = contrasted;
    data[index + 1] = contrasted;
    data[index + 2] = contrasted;
  }
  ctx.putImageData(imageData, 0, 0);

  return await new Promise<Blob | File>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/png', 0.96);
  });
}

async function createOcrVariants(file: File, readingMode: ReadingMode): Promise<Array<{ label: string; image: File | Blob }>> {
  const fullContrast = await preprocessImage(file, 'contrast');
  const cardIdentity = await cropImage(file, { x: 0, y: 0, w: 0.38, h: 0.44 }, 2100);
  const cardBadge = await cropImage(file, { x: 0.035, y: 0.035, w: 0.24, h: 0.30 }, 2200);
  if (readingMode === 'fast') {
    return [
      { label: 'CARD BADGE', image: cardBadge },
      { label: 'IDENTIDADE DA CARTA', image: cardIdentity },
      { label: 'imagem original', image: file },
      { label: 'imagem otimizada', image: fullContrast }
    ];
  }

  const sharp = await preprocessImage(file, 'sharp');
  const cardTopWide = await cropImage(file, { x: 0, y: 0, w: 0.62, h: 0.36 }, 2300);
  const topStats = await cropImage(file, { x: 0, y: 0, w: 1, h: 0.48 }, 2300);
  const rightStats = await cropImage(file, { x: 0.34, y: 0.08, w: 0.66, h: 0.74 }, 2350);
  const lowerSkills = await cropImage(file, { x: 0, y: 0.48, w: 1, h: 0.52 }, 2300);

  return [
    { label: 'CARD BADGE', image: cardBadge },
    { label: 'IDENTIDADE DA CARTA', image: cardIdentity },
    { label: 'TOPO DA CARTA', image: cardTopWide },
    { label: 'imagem original', image: file },
    { label: 'imagem otimizada', image: fullContrast },
    { label: 'imagem reforçada', image: sharp },
    { label: 'área superior/posições', image: topStats },
    { label: 'área de atributos', image: rightStats },
    { label: 'área de habilidades', image: lowerSkills }
  ];
}

async function createPlayerCardPreview(file: File): Promise<string | null> {
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return null;

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const width = bitmap.width;
    const height = bitmap.height;

    const cropX = Math.round(width * 0.035);
    const cropY = Math.round(height * 0.04);
    const cropW = Math.round(width * 0.31);
    const cropH = Math.round(height * 0.42);

    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  } catch {
    return null;
  }
}

function skillReason(skill: string) {
  const reasons: Record<string, string> = {
    'Toque duplo': 'melhora o 1 contra 1 e a saída curta',
    'Controle com a sola': 'giro e domínio mais limpos sob pressão',
    'Elástico': 'abre espaço em pontas e meias ofensivos',
    'Cruzamento preciso': 'qualifica criação pelos lados',
    'Curva para fora': 'melhora passes e chutes com efeito',
    'Passe de primeira': 'acelera tabelas, pivôs e contra-ataques',
    'Passe em profundidade': 'melhora rupturas e bolas verticais',
    'Passe na medida': 'qualifica lançamentos e inversões',
    'Interceptação': 'aumenta cortes automáticos de passe',
    'Bloqueador': 'melhora bloqueios de chute e passe',
    'Marcação individual': 'gruda melhor no alvo defensivo',
    'Volta para marcar': 'ajuda na pressão e recomposição',
    'Espírito guerreiro': 'mantém desempenho cansado ou pressionado',
    'Chute de primeira': 'finaliza rápido sem dominar a bola',
    'Precisão à distância': 'melhora chute de fora da área',
    'Finalização acrobática': 'aumenta gols em posição difícil',
    Cabeçada: 'melhora finalização aérea',
    'Superioridade aérea': 'vence duelos pelo alto com frequência',
    Carrinho: 'melhora desarme de emergência',
    'Super substituto': 'aumenta impacto vindo do banco'
  };
  return reasons[skill] ?? 'completa a função real da carta sem repetir habilidade nativa';
}

function copyBuildText(result: AnalysisResult) {
  const training = Object.entries(result.training)
    .filter(([, value]) => Number(value) > 0)
    .map(([key, value]) => `${trainingLabels[key] ?? key} +${value} (${result.trainingCost[key as keyof typeof result.trainingCost]} pts)`)
    .join('\n');

  const text = [
    `BuildMaster Local Pro v19 — ${result.parsed.playerName}`,
    `Função: ${result.buildName}`,
    `Melhor posição: ${result.bestPosition.label}`,
    `PRI: ${result.pri.overall}`,
    `Pontos: ${result.trainingPointsUsed}/${result.trainingPointsTotal}`,
    '',
    'Ficha Elite:',
    training,
    '',
    'Habilidades adicionais:',
    result.recommendedSkills.map((skill, index) => `${index + 1}. ${skill}`).join('\n'),
    '',
    'Ímpetos recomendados:',
    result.recommendedImpetos.filter((item) => item.tier !== 'evitar').map((item, index) => `${index + 1}. ${item.name} — ${item.attributes.join(', ')}`).join('\n'),
    '',
    'Como usar:',
    result.usageTips.join('\n')
  ].join('\n');

  void navigator.clipboard?.writeText(text);
}

function positionPt(code: string) {
  const labels: Record<string, string> = {
    CF: 'CA', SS: 'SA', LWF: 'PE', RWF: 'PD', LMF: 'ME', RMF: 'MD', AMF: 'MAT', CMF: 'MLG', DMF: 'VOL', CB: 'ZAG', LB: 'LE', RB: 'LD', GK: 'GOL'
  };
  return labels[code] ?? code;
}

function attributeNamePt(key: string) {
  return ATTRIBUTE_PT[key as AttributeKey] ?? key;
}

function ResultCard({ result, playerImage }: { result: AnalysisResult; playerImage: string | null }) {
  const [tab, setTab] = useState<ResultTab>('resumo');
  const card = result.parsed;
  const overall = card.maxOverall ?? card.overall ?? '--';
  const trainingItems = Object.entries(result.training).filter(([, value]) => Number(value) > 0);
  const pointPercent = Math.min(100, Math.round((result.trainingPointsUsed / Math.max(1, result.trainingPointsTotal)) * 100));
  const positionItems = result.positionScores.slice(0, 8);
  const cardPositions = Array.from(new Set([card.mainPosition, ...card.positions])).slice(0, 10);
  const nativeSkills = card.nativeSkills.slice(0, 8);
  const recommendedSkills = result.recommendedSkills.slice(0, 8);
  const recommendedImpetos = result.recommendedImpetos.slice(0, 8);
  const positionRatings = Object.entries(card.positionRatings).filter(([, value]) => Number.isFinite(value));
  const attributes = Object.entries(card.attributes).filter(([, value]) => Number.isFinite(value));
  const sourceLabel = card.trainingPointSource === 'TRAINING_READ'
    ? 'Ficha automática somada'
    : card.trainingPointSource === 'LEVEL_INFERRED'
      ? 'Calculado pelo nível'
      : card.trainingPointSource === 'OCR'
        ? 'Lido no print'
        : 'Padrão seguro';

  return (
    <section className="result-panel">
      <div className="result-head luxury-panel">
        <div className="premium-card-art">
          {playerImage && <img src={playerImage} alt={`Imagem de ${card.playerName}`} />}
          <div className="card-shine" />
          <div className="card-number">
            <strong>{overall}</strong>
            <span>{card.mainPositionPt}</span>
          </div>
          <em>{card.playstyle ?? 'BuildMaster'}</em>
        </div>

        <div className="result-intro">
          <p className="kicker">Resumo</p>
          <h2>{card.playerName}</h2>
          <div className="playstyle-pill">{card.playstyle ?? 'Estilo não lido'}</div>
          <p className="identity-note">Identidade preservada: {card.mainPositionPt}{card.playstyle ? ` • ${card.playstyle}` : ''}. O app não altera a posição/estilo do card; só recomenda abaixo onde rende mais.</p>
          <div className="metric-grid">
            <div><span>GER lido</span><strong>{overall}</strong></div>
            <div><span>Pos. carta</span><strong>{card.mainPositionPt}</strong></div>
            <div><span>Melhor pos.</span><strong>{result.bestPosition.label}</strong></div>
            <div><span>PRI gameplay</span><strong>{result.pri.overall}</strong></div>
            <div><span>Confiança</span><strong>{card.confidence}%</strong></div>
            <div className="wide-metric"><span>Pontos totais</span><strong>{result.trainingPointsUsed}/{result.trainingPointsTotal}</strong></div>
          </div>
        </div>
      </div>

      {card.warnings.length > 0 && (
        <div className="alert-strip">
          {card.warnings.slice(0, 2).map((warning) => <span key={warning}>{warning}</span>)}
        </div>
      )}

      <nav className="elite-tabs" aria-label="Seções do resultado">
        {[
          ['resumo', 'Resumo'],
          ['ficha', 'Ficha'],
          ['habilidades', 'Habilidades'],
          ['posicoes', 'Posições'],
          ['dados', 'Dados']
        ].map(([value, label]) => (
          <button key={value} className={tab === value ? 'active' : ''} type="button" onClick={() => setTab(value as ResultTab)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'resumo' && (
        <div className="result-section-grid">
          <article className="luxury-panel elite-build-card">
            <p className="kicker">Build Elite recomendado</p>
            <div className="section-title-row">
              <h3>{result.buildName}</h3>
              <span>Elite</span>
            </div>
            <div className="stat-bars five-cols">
              {[
                ['Finalização', result.pri.finishing],
                ['Drible', result.pri.dribbling],
                ['Passe', result.pri.creation],
                ['Força', result.pri.physical],
                ['Velocidade', result.pri.mobility]
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <i><b style={{ width: `${Math.min(100, Number(value))}%` }} /></i>
                </div>
              ))}
            </div>
          </article>

          <article className="luxury-panel compact-card">
            <p className="kicker">Habilidades adicionais</p>
            <div className="chip-cloud purple">
              {recommendedSkills.length ? recommendedSkills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>) : <span>Nenhuma recomendação segura</span>}
            </div>
            <p className="panel-note">Exclui habilidades já presentes na carta.</p>
          </article>

          <article className="luxury-panel compact-card">
            <p className="kicker">Pontos detectados</p>
            <strong className="big-number">{result.trainingPointsUsed}/{result.trainingPointsTotal}</strong>
            <div className="mini-meter"><i style={{ width: `${pointPercent}%` }} /></div>
            <p className="panel-note">{sourceLabel}</p>
          </article>

          <article className="luxury-panel compact-card">
            <p className="kicker">Ímpeto ideal</p>
            <div className="chip-cloud purple">
              {recommendedImpetos.filter((item) => item.tier !== 'evitar').slice(0, 3).map((item) => <span key={item.name}>{item.name}</span>)}
            </div>
            <p className="panel-note">Escolhido por posição + estilo + função real.</p>
          </article>

          <article className="luxury-panel wide-card">
            <p className="kicker">Como jogar</p>
            <ul className="clean-list">
              {result.usageTips.slice(0, 4).map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </article>
        </div>
      )}

      {tab === 'ficha' && (
        <div className="result-section-grid">
          <article className="luxury-panel wide-card">
            <div className="section-title-row">
              <div>
                <p className="kicker">Distribuição de pontos</p>
                <h3>Ficha Elite de gameplay</h3>
              </div>
              <span>{result.trainingPointsUsed}/{result.trainingPointsTotal}</span>
            </div>
            <div className="training-ribbon">
              {trainingItems.map(([key, value]) => (
                <div key={key}>
                  <span>{trainingLabels[key] ?? key}</span>
                  <strong>{value}</strong>
                  <i><b style={{ width: `${Math.min(100, Number(value) * 7)}%` }} /></i>
                </div>
              ))}
            </div>
            <p className="panel-note">Custo real: {result.trainingCostRule}. Restante: {result.trainingPointsRemaining} ponto(s).</p>
          </article>

          <article className="luxury-panel wide-card">
            <p className="kicker">Compatibilidade tática</p>
            <div className="data-grid">
              {Object.entries(result.tacticalFit).map(([key, value]) => (
                <div key={key}><span>{tacticalLabels[key] ?? key}</span><strong>{value}/10</strong></div>
              ))}
            </div>
          </article>
        </div>
      )}

      {tab === 'habilidades' && (
        <div className="result-section-grid">
          <article className="luxury-panel wide-card">
            <p className="kicker">Sugeridas adicionais</p>
            <div className="skill-grid">
              {recommendedSkills.length ? recommendedSkills.map((skill, index) => (
                <div key={skill}>
                  <strong>{String(index + 1).padStart(2, '0')} • {skill}</strong>
                  <span>{skillReason(skill)}</span>
                </div>
              )) : <p className="panel-note">Nenhuma habilidade adicional segura foi encontrada.</p>}
            </div>
          </article>
          <article className="luxury-panel wide-card">
            <p className="kicker">Detectadas na carta</p>
            <div className="chip-cloud">
              {nativeSkills.length ? nativeSkills.map((skill) => <span key={skill}>{skill}</span>) : <span>Nenhuma habilidade lida</span>}
            </div>
          </article>
        </div>
      )}

      {tab === 'posicoes' && (
        <div className="result-section-grid">
          <article className="luxury-panel wide-card">
            <p className="kicker">Identidade da carta</p>
            <div className="position-list">
              {cardPositions.map((code, index) => (
                <div key={code}>
                  <strong>{positionPt(code)}</strong>
                  <span>{index === 0 ? 'Posição do card' : 'Compatível'}</span>
                  <em>{code === card.mainPosition ? `Preservada no card • ${card.playstyle ?? 'estilo não lido'}` : `Lida no print${card.positionRatings[code] ? ` • ${card.positionRatings[code]}` : ''}`}</em>
                </div>
              ))}
            </div>
            <p className="panel-note">Esta seção não é ranking: ela mostra a posição/estilo originais da carta e as posições compatíveis lidas.</p>
          </article>

          <article className="luxury-panel wide-card">
            <p className="kicker">Ranking de gameplay real</p>
            <div className="position-list">
              {positionItems.map((item, index) => (
                <div key={item.code}>
                  <strong>{item.label}</strong>
                  <span>{index === 0 ? 'Melhor uso' : item.score >= 90 ? 'Ótima' : item.score >= 82 ? 'Boa' : 'Alternativa'}</span>
                  <em>{item.role}{item.cardRating ? ` • ${item.cardRating}` : ''}</em>
                </div>
              ))}
            </div>
            <p className="panel-note">Aqui sim o app pode recomendar outra posição, mas sem alterar a identidade da carta no card principal.</p>
          </article>

          <article className="luxury-panel wide-card">
            <p className="kicker">Overalls lidos</p>
            <div className="data-grid">
              {positionRatings.length ? positionRatings.map(([code, value]) => (
                <div key={code}><span>{positionPt(code)}</span><strong>{value}</strong></div>
              )) : <p className="panel-note">Nenhum overall por posição lido com segurança.</p>}
            </div>
          </article>
        </div>
      )}

      {tab === 'dados' && (
        <div className="result-section-grid">
          <article className="luxury-panel wide-card">
            <p className="kicker">Dados lidos</p>
            <div className="data-grid">
              <div><span>Posição da carta</span><strong>{card.mainPositionPt}</strong></div>
              <div><span>Estilo de jogo</span><strong>{card.playstyle ?? '—'}</strong></div>
              <div><span>Melhor posição</span><strong>{result.bestPosition.label}</strong></div>
              <div><span>Nível máximo</span><strong>{card.level ?? '—'}</strong></div>
              <div><span>Total de pontos</span><strong>{result.trainingPointsUsed}/{result.trainingPointsTotal}</strong></div>
              <div><span>Origem dos pontos</span><strong>{sourceLabel}</strong></div>
              <div><span>Altura</span><strong>{card.height ? `${card.height} cm` : '—'}</strong></div>
              <div><span>Peso</span><strong>{card.weight ? `${card.weight} kg` : '—'}</strong></div>
              <div><span>Idade</span><strong>{card.age ?? '—'}</strong></div>
              <div><span>OCR</span><strong>100% local</strong></div>
            </div>
          </article>
          <article className="luxury-panel wide-card">
            <p className="kicker">Ímpetos recomendados</p>
            <div className="skill-grid">
              {recommendedImpetos.length ? recommendedImpetos.map((item) => (
                <div key={`${item.name}-${item.tier}`}>
                  <strong>{item.tier === 'ideal' ? 'Ideal' : item.tier === 'alternativo' ? 'Alternativo' : 'Evitar'} • {item.name}</strong>
                  <span>{item.attributes.join(', ')} — {item.reason}</span>
                </div>
              )) : <p className="panel-note">Nenhum ímpeto recomendado com segurança.</p>}
            </div>
          </article>

          <article className="luxury-panel wide-card">
            <p className="kicker">Ímpetos / boosters lidos</p>
            <div className="chip-cloud purple">
              {card.impetos.length ? card.impetos.map((item) => (
                <span key={`${item.name}-${item.value ?? ''}`}>{item.name}{item.value ? ` +${item.value}` : ''}{item.active === false ? ' — inativo' : ''}</span>
              )) : <span>Nenhum ímpeto lido</span>}
            </div>
          </article>
          <article className="luxury-panel wide-card">
            <p className="kicker">Atributos</p>
            <div className="data-grid attributes-grid">
              {attributes.length ? attributes.map(([key, value]) => (
                <div key={key}><span>{attributeNamePt(key)}</span><strong>{value}</strong></div>
              )) : <p className="panel-note">Nenhum atributo lido com segurança.</p>}
            </div>
          </article>
        </div>
      )}

      <button className="copy-floating" type="button" onClick={() => copyBuildText(result)}><Copy size={16} /> Copiar ficha</button>
    </section>
  );
}


function ReviewPanel({
  draft,
  playerImage,
  manualFields,
  setManualFields,
  cardPositionOverride,
  setCardPositionOverride,
  playstyleOverride,
  setPlaystyleOverride,
  targetPosition,
  setTargetPosition,
  onRefresh,
  onConfirm
}: {
  draft: AnalysisResult;
  playerImage: string | null;
  manualFields: ManualFields;
  setManualFields: (updater: ManualFields | ((current: ManualFields) => ManualFields)) => void;
  cardPositionOverride: PositionCode | 'AUTO';
  setCardPositionOverride: (value: PositionCode | 'AUTO') => void;
  playstyleOverride: string;
  setPlaystyleOverride: (value: string) => void;
  targetPosition: PositionCode | 'AUTO';
  setTargetPosition: (value: PositionCode | 'AUTO') => void;
  onRefresh: () => void;
  onConfirm: () => void;
}) {
  const card = draft.parsed;
  const criticalIssues = draft.validation.issues.filter((issue) => issue.severity === 'block');
  const reviewIssues = draft.validation.issues.filter((issue) => issue.severity === 'review');
  const updateAttribute = (key: AttributeKey, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 3);
    setManualFields((current) => ({
      ...current,
      attributes: { ...current.attributes, [key]: cleaned }
    }));
  };

  return (
    <section className="review-panel result-panel">
      <div className="result-head luxury-panel">
        <div className="premium-card-art compact-art">
          {playerImage && <img src={playerImage} alt={`Imagem de ${card.playerName}`} />}
          <div className="card-shine" />
          <div className="card-number">
            <strong>{card.maxOverall ?? card.overall ?? '--'}</strong>
            <span>{card.mainPositionPt}</span>
          </div>
          <em>{card.playerName}</em>
        </div>
        <div className="result-intro">
          <p className="kicker"><ShieldCheck size={16} /> Conferência obrigatória</p>
          <h2>Revise antes da ficha final</h2>
          <p className="review-copy">O OCR é local e gratuito. Para evitar erro de posição, estilo ou pontos, esta etapa segura bloqueia a ficha até você confirmar os dados principais.</p>
          <div className="metric-grid">
            <div><span>Confiança</span><strong>{card.confidence}%</strong></div>
            <div><span>Posição lida</span><strong>{card.mainPositionPt}</strong></div>
            <div><span>Estilo</span><strong>{card.playstyle ?? 'revisar'}</strong></div>
            <div><span>Pontos</span><strong>{draft.trainingPointsTotal}</strong></div>
          </div>
        </div>
      </div>

      <article className="luxury-panel wide-card review-alert-card">
        <p className="kicker">Validação sem IA paga</p>
        <div className="alert-strip strong-alert">
          {criticalIssues.length ? criticalIssues.map((issue) => <span key={issue.code}>⚠ {issue.message}</span>) : <span>✓ Nenhum bloqueio crítico encontrado.</span>}
          {reviewIssues.map((issue) => <span key={issue.code}>• {issue.message}</span>)}
        </div>
        <p className="panel-note">A ficha final só deve ser gerada quando posição, estilo, nível/pontos e atributos principais estiverem corretos.</p>
      </article>

      <div className="review-grid">
        <article className="luxury-panel wide-card">
          <p className="kicker">Dados principais</p>
          <div className="review-form-grid">
            <label>
              <span>Nome do jogador</span>
              <input value={manualFields.playerName} onChange={(event) => setManualFields((current) => ({ ...current, playerName: event.target.value }))} placeholder={card.playerName} />
            </label>
            <label>
              <span>Posição principal correta</span>
              <select value={cardPositionOverride} onChange={(event) => setCardPositionOverride(event.target.value as PositionCode | 'AUTO')}>
                {POSITION_LABELS.filter((item) => item.code !== 'AUTO').map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>Estilo de jogo correto</span>
              <select value={playstyleOverride} onChange={(event) => setPlaystyleOverride(event.target.value)}>
                <option value="AUTO">Automático / não sei</option>
                {playstyleOptions.map((style) => <option key={style} value={style}>{style}</option>)}
              </select>
            </label>
            <label>
              <span>Melhor posição desejada</span>
              <select value={targetPosition} onChange={(event) => setTargetPosition(event.target.value as PositionCode | 'AUTO')}>
                {POSITION_LABELS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>Nível máximo</span>
              <input inputMode="numeric" value={manualFields.level} onChange={(event) => setManualFields((current) => ({ ...current, level: event.target.value.replace(/[^0-9]/g, '').slice(0, 2) }))} placeholder={card.level ? String(card.level) : 'Ex.: 32'} />
            </label>
            <label>
              <span>Pontos totais da ficha</span>
              <input inputMode="numeric" value={manualFields.trainingPointsTotal} onChange={(event) => setManualFields((current) => ({ ...current, trainingPointsTotal: event.target.value.replace(/[^0-9]/g, '').slice(0, 3) }))} placeholder={String(draft.trainingPointsTotal)} />
            </label>
          </div>
        </article>

        <article className="luxury-panel wide-card">
          <p className="kicker">Atributos revisáveis</p>
          <div className="attribute-editor-grid">
            {ATTRIBUTE_INPUTS.map((item) => (
              <label key={item.key}>
                <span>{item.label}</span>
                <input
                  inputMode="numeric"
                  value={manualFields.attributes[item.key] ?? ''}
                  onChange={(event) => updateAttribute(item.key, event.target.value)}
                  placeholder={card.attributes[item.key] ? String(card.attributes[item.key]) : '--'}
                />
              </label>
            ))}
          </div>
          <p className="panel-note">Preencha só os valores que você quer corrigir. O restante continua vindo do OCR e das regras locais.</p>
        </article>

        <article className="luxury-panel wide-card">
          <p className="kicker">Posições separadas</p>
          <div className="position-list">
            {draft.permittedPositions.map((item) => (
              <div key={item.code}>
                <strong>{item.label}</strong>
                <span>{item.reason}</span>
                <em>{item.rating ? `Nota lida ${item.rating}` : 'Sem depender de overall'}</em>
              </div>
            ))}
          </div>
          {draft.avoidPositions.length > 0 && (
            <>
              <p className="kicker avoid-kicker">Evitar</p>
              <div className="position-list avoid-list">
                {draft.avoidPositions.map((item) => (
                  <div key={item.code}>
                    <strong>{item.label}</strong>
                    <span>{item.reason}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>
      </div>

      <div className="review-actions">
        <button type="button" className="secondary-action" onClick={onRefresh}>Atualizar prévia com correções</button>
        <button type="button" className="elite-button" onClick={onConfirm}><CheckCircle2 size={18} /> Confirmar dados e gerar ficha final</button>
      </div>
    </section>
  );
}


export function CardVisionApp() {
  const [preview, setPreview] = useState<string | null>(null);
  const [playerCardImage, setPlayerCardImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrDone, setOcrDone] = useState(false);
  const [rawText, setRawText] = useState('');
  const [objective, setObjective] = useState<Objective>('COMPETITIVE');
  const [targetPosition, setTargetPosition] = useState<PositionCode | 'AUTO'>('AUTO');
  const [cardPositionOverride, setCardPositionOverride] = useState<PositionCode | 'AUTO'>('AUTO');
  const [playstyleOverride, setPlaystyleOverride] = useState<string>('AUTO');
  const [readingMode, setReadingMode] = useState<ReadingMode>('precision');
  const [status, setStatus] = useState('Envie o print da carta para começar.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [draftResult, setDraftResult] = useState<AnalysisResult | null>(null);
  const [manualFields, setManualFields] = useState<ManualFields>({ playerName: '', level: '', trainingPointsTotal: '', attributes: {} });
  const [manualMode, setManualMode] = useState(false);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const lastSavedKey = useRef<string | null>(null);

  const canProceed = useMemo(() => !loading && (!!selectedFile || rawText.trim().length > 2), [selectedFile, rawText, loading]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored).slice(0, 6));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    const key = `${result.parsed.playerName}-${result.bestPosition.code}-${result.trainingPointsUsed}-${result.trainingPointsTotal}`;
    if (lastSavedKey.current === key) return;
    lastSavedKey.current = key;

    const item: SavedAnalysis = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      savedAt: new Date().toLocaleString('pt-BR'),
      rawText,
      playerImage: playerCardImage,
      fullPreview: preview,
      result
    };

    setHistory((current) => {
      const next = [item, ...current.filter((entry) => entry.result.parsed.playerName !== result.parsed.playerName)].slice(0, 6);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Histórico é opcional.
      }
      return next;
    });
  }, [result, rawText, playerCardImage, preview]);

  function logout() {
    clearBuildMasterSession();
    window.location.href = '/';
  }

  function resetAnalysis() {
    setPreview(null);
    setPlayerCardImage(null);
    setFileName(null);
    setSelectedFile(null);
    setOcrDone(false);
    setRawText('');
    setResult(null);
    setDraftResult(null);
    setManualFields({ playerName: '', level: '', trainingPointsTotal: '', attributes: {} });
    setManualMode(false);
    setCardPositionOverride('AUTO');
    setPlaystyleOverride('AUTO');
    setStatus('Envie outro print da carta para começar.');
  }

  function restoreHistory(item: SavedAnalysis) {
    lastSavedKey.current = `${item.result.parsed.playerName}-${item.result.bestPosition.code}-${item.result.trainingPointsUsed}-${item.result.trainingPointsTotal}`;
    setSelectedFile(null);
    setOcrDone(true);
    setRawText(item.rawText);
    setPlayerCardImage(item.playerImage);
    setPreview(item.fullPreview ?? item.playerImage);
    setDraftResult(null);
    setResult(item.result);
    setManualMode(false);
    setStatus(`Análise restaurada: ${item.result.parsed.playerName}.`);
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setPlayerCardImage(null);
    setResult(null);
    setDraftResult(null);
    setManualFields({ playerName: '', level: '', trainingPointsTotal: '', attributes: {} });
    setManualMode(false);
    setRawText('');
    setOcrDone(false);
    setLoading(false);
    setStatus('Imagem selecionada. Confira as travas opcionais se o OCR costuma errar posição/estilo e toque em Prosseguir.');

    const croppedPreview = await createPlayerCardPreview(file).catch(() => null);
    if (croppedPreview) setPlayerCardImage(croppedPreview);
  }

  function stripManualBlock(text: string) {
    return text.replace(/\[AJUSTES MANUAIS\][\s\S]*?\[FIM AJUSTES\]\s*/gi, '').trimStart();
  }

  function textWithManualLocks(text: string, confirmed = false) {
    const cleaned = stripManualBlock(text)
      .replace(/^(POSIÇÃO PRINCIPAL|POSICAO PRINCIPAL|ESTILO DE JOGO|NOME|NOME DO JOGADOR|NÍVEL MÁXIMO|NIVEL MAXIMO|PONTOS TOTAIS)\s*[:=\-].*$/gim, '')
      .replace(/^\s+/, '');
    const locks: string[] = ['[AJUSTES MANUAIS]'];
    if (confirmed) locks.push('CONFIRMAÇÃO MANUAL: SIM');
    if (manualFields.playerName.trim()) locks.push(`NOME DO JOGADOR: ${manualFields.playerName.trim()}`);
    if (cardPositionOverride !== 'AUTO') locks.push(`POSIÇÃO PRINCIPAL: ${cardPositionOverride}`);
    if (playstyleOverride !== 'AUTO') locks.push(`ESTILO DE JOGO: ${playstyleOverride}`);
    if (manualFields.level.trim()) locks.push(`NÍVEL MÁXIMO: ${manualFields.level.trim()}`);
    if (manualFields.trainingPointsTotal.trim()) locks.push(`PONTOS TOTAIS: ${manualFields.trainingPointsTotal.trim()}`);
    for (const item of ATTRIBUTE_INPUTS) {
      const value = manualFields.attributes[item.key]?.trim();
      if (value) locks.push(`${item.label}: ${value}`);
    }
    locks.push('[FIM AJUSTES]');
    return `${locks.join('\n')}\n${cleaned}`.trim();
  }

  function hydrateReviewFields(nextResult: AnalysisResult) {
    const nextAttributes: Partial<Record<AttributeKey, string>> = {};
    for (const [key, value] of Object.entries(nextResult.parsed.attributes)) {
      if (Number.isFinite(value)) nextAttributes[key as AttributeKey] = String(value);
    }
    setManualFields({
      playerName: nextResult.parsed.playerName !== 'Jogador não identificado' ? nextResult.parsed.playerName : '',
      level: nextResult.parsed.level ? String(nextResult.parsed.level) : '',
      trainingPointsTotal: nextResult.trainingPointsTotal ? String(nextResult.trainingPointsTotal) : '',
      attributes: nextAttributes
    });
    if (cardPositionOverride === 'AUTO') setCardPositionOverride(nextResult.parsed.mainPosition);
    if (playstyleOverride === 'AUTO' && nextResult.parsed.playstyle) setPlaystyleOverride(nextResult.parsed.playstyle);
  }

  function startManualPreciseMode() {
    const template = [
      'NOME DO JOGADOR: ',
      'POSIÇÃO PRINCIPAL: CF',
      'ESTILO DE JOGO: AUTO',
      'NÍVEL MÁXIMO: ',
      'PONTOS TOTAIS: ',
      '',
      'Preencha os dados no painel de conferência. Este modo não depende de OCR.'
    ].join('\n');
    setManualMode(true);
    setSelectedFile(null);
    setPreview(null);
    setPlayerCardImage(null);
    setRawText(template);
    setOcrDone(true);
    setResult(null);
    setDraftResult(null);
    setCardPositionOverride('CF');
    setPlaystyleOverride('AUTO');
    setManualFields({ playerName: '', level: '', trainingPointsTotal: '', attributes: {} });
    setStatus('Modo manual preciso ativado. Preencha os dados e toque em Gerar prévia para conferência.');
  }

  async function analyzeSelectedImage() {
    if (!selectedFile) {
      if (rawText.trim().length > 2) runAnalysis();
      return;
    }

    setLoading(true);
    setResult(null);
    setDraftResult(null);
    setManualFields({ playerName: '', level: '', trainingPointsTotal: '', attributes: {} });
    setManualMode(false);
    setRawText('');
    setOcrDone(false);
    setStatus('Preparando imagem para OCR local premium...');

    try {
      const Tesseract = await import('tesseract.js');
      const croppedPreview = await createPlayerCardPreview(selectedFile);
      if (croppedPreview) setPlayerCardImage(croppedPreview);

      const variants = await createOcrVariants(selectedFile, readingMode);
      const texts: string[] = [];

      for (let index = 0; index < variants.length; index += 1) {
        const variant = variants[index];
        setStatus(`Lendo ${variant.label} (${index + 1}/${variants.length})...`);
        const pass = await Tesseract.recognize(variant.image, 'por+eng', {
          logger: (message) => {
            if (message.status) {
              setStatus(`${variant.label}: ${message.status}${message.progress ? ` ${Math.round(message.progress * 100)}%` : ''}`);
            }
          }
        });
        const variantText = pass.data.text.trim();
        if (variantText) texts.push(`### ${variant.label}\n${variantText}`);
      }

      const mergedText = mergeOcrTexts(...texts);
      setOcrDone(true);

      if (mergedText.trim().length > 2) {
        const lockedText = textWithManualLocks(mergedText);
        setRawText(lockedText);
        const autoResult = analyzeCard(lockedText, objective, targetPosition, fileName);
        hydrateReviewFields(autoResult);
        setDraftResult(autoResult);
        setResult(null);
        setStatus('Carta lida. Confira posição, estilo, pontos e atributos antes de gerar a ficha final.');
      } else {
        setStatus('Não consegui ler texto suficiente. Tente print direto da tela com nome, posição, estilo e ficha automática visíveis.');
      }
    } catch {
      setStatus('Não consegui ler automaticamente. Tente outro print direto da tela com nome, posição, estilo e ficha automática visíveis.');
    } finally {
      setLoading(false);
    }
  }

  function runAnalysis(confirmed = false) {
    setStatus(confirmed ? 'Gerando ficha final confirmada...' : 'Atualizando prévia para conferência...');
    const lockedText = textWithManualLocks(rawText, confirmed);
    if (lockedText !== rawText) setRawText(lockedText);
    const nextResult = analyzeCard(lockedText, objective, targetPosition, fileName);
    if (confirmed) {
      setResult(nextResult);
      setDraftResult(null);
      setStatus(nextResult.note);
    } else {
      setDraftResult(nextResult);
      setResult(null);
      setStatus('Prévia atualizada. Revise os dados e confirme para gerar a ficha final.');
    }
  }

  return (
    <main className="premium-app">
      <header className="app-topbar luxury-panel">
        <div className="brand-lockup">
          <div className="brand-icon"><Sparkles size={19} /></div>
          <div>
            <strong>BuildMaster</strong>
            <span>Local Pro</span>
          </div>
        </div>
        <div className="session-badge"><ShieldCheck size={16} /> Sessão protegida</div>
        <div className="topbar-actions">
          <button type="button" onClick={resetAnalysis}><RotateCcw size={16} /> Nova</button>
          <button type="button" onClick={logout}><LogOut size={16} /> Sair</button>
        </div>
      </header>

      <section className="hero-redesign">
        <div>
          <p className="kicker"><Sparkles size={16} /> BuildMaster Local Pro</p>
          <h1>Analise sua carta. Descubra o build Elite.</h1>
          <p>Envie o print e gere uma ficha voltada para desempenho real em campo. Overall é só referência visual; a ficha prioriza função, atributos úteis, estilo e melhor posicionamento.</p>
        </div>
        <div className="orb-ball" aria-hidden="true" />
      </section>

      <section className="workspace-grid">
        <aside className="control-panel luxury-panel">
          <div className="panel-heading">
            <div>
              <p className="kicker">Nova análise</p>
              <h2>Imagem da carta</h2>
            </div>
            <Camera size={24} />
          </div>

          <div className="upload-box">
            {preview ? <img src={preview} alt="Print enviado" /> : (
              <div>
                <UploadCloud size={36} />
                <strong>Envie a imagem da sua carta</strong>
                <span>Use print direto da tela com nome, posição, estilo, atributos e nível máximo visíveis.</span>
              </div>
            )}
          </div>

          <div className="upload-buttons">
            <label>
              <input type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0];
                event.currentTarget.value = '';
                if (file) void handleFile(file);
              }} />
              <ImagePlus size={18} /> Buscar print
            </label>
            <label>
              <input type="file" accept="image/*" capture="environment" onChange={(event) => {
                const file = event.target.files?.[0];
                event.currentTarget.value = '';
                if (file) void handleFile(file);
              }} />
              <Camera size={18} /> Tirar foto
            </label>
          </div>

          <button className="manual-mode-button" type="button" onClick={startManualPreciseMode}>
            <ShieldCheck size={16} /> Modo manual preciso sem OCR
          </button>

          <div className="select-stack">
            <label>
              <span>Modo de leitura</span>
              <select value={readingMode} onChange={(event) => setReadingMode(event.target.value as ReadingMode)}>
                <option value="precision">OCR local premium — mais preciso</option>
                <option value="fast">OCR rápido — menos passadas</option>
              </select>
            </label>

            <label>
              <span>Objetivo da ficha</span>
              <select value={objective} onChange={(event) => setObjective(event.target.value as Objective)}>
                {objectives.map((item) => <option key={item.value} value={item.value}>{item.title} — {item.hint}</option>)}
              </select>
            </label>

            <label>
              <span>Melhor posição para jogar</span>
              <select value={targetPosition} onChange={(event) => setTargetPosition(event.target.value as PositionCode | 'AUTO')}>
                {POSITION_LABELS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>

            <label>
              <span>Travar posição da carta se o OCR errar</span>
              <select value={cardPositionOverride} onChange={(event) => setCardPositionOverride(event.target.value as PositionCode | 'AUTO')}>
                {POSITION_LABELS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>

            <label>
              <span>Travar estilo de jogo se o OCR errar</span>
              <select value={playstyleOverride} onChange={(event) => setPlaystyleOverride(event.target.value)}>
                <option value="AUTO">Automático</option>
                {playstyleOptions.map((style) => <option key={style} value={style}>{style}</option>)}
              </select>
            </label>
          </div>

          <button className="elite-button generate-button" type="button" onClick={selectedFile && !ocrDone ? analyzeSelectedImage : () => runAnalysis(false)} disabled={!canProceed}>
            {loading ? <Loader2 className="spin" size={18} /> : <Zap size={18} />}
            {loading ? 'Lendo imagem...' : selectedFile && !ocrDone ? 'Ler carta e abrir conferência' : result ? 'Reabrir conferência' : 'Gerar prévia para conferência'}
          </button>

          <div className="flow-steps">
            <span className={selectedFile ? 'done' : ''}>1. Escolher carta</span>
            <span className={ocrDone ? 'done' : selectedFile ? 'active' : ''}>2. Ler identidade</span>
            <span className={draftResult ? 'active' : result ? 'done' : ocrDone ? 'active' : ''}>3. Conferir dados</span>
            <span className={result ? 'done' : ''}>4. Ficha final</span>
          </div>

          <div className="status-card">
            <ScanText size={18} />
            <p>{status}</p>
          </div>

          {rawText && (
            <details className="raw-details">
              <summary>Dados detectados pelo OCR</summary>
              <textarea value={rawText} onChange={(event) => setRawText(event.target.value)} spellCheck={false} />
            </details>
          )}

          {history.length > 0 && (
            <div className="history-strip">
              <p className="kicker"><History size={14} /> Histórico</p>
              {history.slice(0, 3).map((item) => (
                <button type="button" key={item.id} onClick={() => restoreHistory(item)}>
                  <strong>{item.result.parsed.playerName}</strong>
                  <span>{item.result.bestPosition.label} • {item.result.trainingPointsUsed}/{item.result.trainingPointsTotal}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="preview-panel">
          {result ? <ResultCard result={result} playerImage={playerCardImage ?? preview} /> : draftResult ? (
            <ReviewPanel
              draft={draftResult}
              playerImage={playerCardImage ?? preview}
              manualFields={manualFields}
              setManualFields={setManualFields}
              cardPositionOverride={cardPositionOverride}
              setCardPositionOverride={setCardPositionOverride}
              playstyleOverride={playstyleOverride}
              setPlaystyleOverride={setPlaystyleOverride}
              targetPosition={targetPosition}
              setTargetPosition={setTargetPosition}
              onRefresh={() => runAnalysis(false)}
              onConfirm={() => runAnalysis(true)}
            />
          ) : (
            <div className="empty-state luxury-panel">
              <div className="empty-icon"><Wand2 size={34} /></div>
              <h2>Resultado da análise</h2>
              <p>Depois da leitura, o resultado aparece como um painel premium com resumo, ficha, habilidades, posições e dados lidos.</p>
              <div className="empty-card-preview">
                <strong>--</strong>
                <span>CA</span>
                <em>BuildMaster Local</em>
              </div>
              <div className="feature-row">
                <span><ShieldCheck size={15} /> 100% local</span>
                <span><CheckCircle2 size={15} /> Sem API paga</span>
                <span><Sparkles size={15} /> Ficha Elite</span>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
