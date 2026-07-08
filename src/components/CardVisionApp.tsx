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
import { analyzeCard, type AnalysisResult, type Objective, type PositionCode, POSITION_LABELS } from '@/lib/analyzer';

type ReadingMode = 'precision' | 'fast';
type ResultTab = 'resumo' | 'ficha' | 'habilidades' | 'posicoes' | 'dados';

type SavedAnalysis = {
  id: string;
  savedAt: string;
  rawText: string;
  playerImage: string | null;
  fullPreview: string | null;
  result: AnalysisResult;
};

const HISTORY_KEY = 'buildmaster_history_v7_premium';

const objectives: Array<{ value: Objective; title: string; hint: string }> = [
  { value: 'COMPETITIVE', title: 'Competitivo', hint: 'maior rendimento real em campo' },
  { value: 'FINISHER', title: 'Finalizador', hint: 'gols, área e chute' },
  { value: 'CREATOR', title: 'Criador', hint: 'passe, controle e assistência' },
  { value: 'DRIBBLER', title: 'Driblador', hint: 'giro curto e 1 contra 1' },
  { value: 'QUICK_COUNTER', title: 'Contra-ataque rápido', hint: 'arranque e verticalidade' },
  { value: 'POSSESSION', title: 'Posse de bola', hint: 'toque curto e paciência' },
  { value: 'PRESSING', title: 'Pressão alta', hint: 'roubo, fôlego e agressividade' },
  { value: 'DEFENSIVE', title: 'Defensivo', hint: 'marcação, bloqueio e cobertura' },
  { value: 'AERIAL', title: 'Jogo aéreo', hint: 'cabeceio, salto e físico' }
];

const trainingLabels: Record<string, string> = {
  shooting: 'Tiroteio',
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
  if (readingMode === 'fast') {
    return [
      { label: 'imagem original', image: file },
      { label: 'imagem otimizada', image: fullContrast }
    ];
  }

  const sharp = await preprocessImage(file, 'sharp');
  const topStats = await cropImage(file, { x: 0, y: 0, w: 1, h: 0.48 }, 2300);
  const rightStats = await cropImage(file, { x: 0.34, y: 0.08, w: 0.66, h: 0.74 }, 2350);
  const lowerSkills = await cropImage(file, { x: 0, y: 0.48, w: 1, h: 0.52 }, 2300);

  return [
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
    `BuildMaster Local Pro — ${result.parsed.playerName}`,
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
    'Como usar:',
    result.usageTips.join('\n')
  ].join('\n');

  void navigator.clipboard?.writeText(text);
}

function positionPt(code: string) {
  const labels: Record<string, string> = {
    CF: 'CA', SS: 'SA', LWF: 'PE', RWF: 'PD', LMF: 'ME', RMF: 'MD', AMF: 'MAT', CMF: 'MC', DMF: 'VOL', CB: 'ZAG', LB: 'LE', RB: 'LD', GK: 'GOL'
  };
  return labels[code] ?? code;
}

function attributeNamePt(key: string) {
  const labels: Record<string, string> = {
    offensiveAwareness: 'Talento ofensivo', ballControl: 'Controle de bola', dribbling: 'Drible', tightPossession: 'Condução firme', lowPass: 'Passe rasteiro', loftedPass: 'Passe alto', finishing: 'Finalização', heading: 'Cabeçada', placeKicking: 'Bola parada', curl: 'Curva', defensiveAwareness: 'Talento defensivo', defensiveEngagement: 'Dedicação defensiva', tackling: 'Desarme', aggression: 'Agressividade', goalkeeperAwareness: 'Talento GO', goalkeeperCatching: 'Firmeza GO', goalkeeperParrying: 'Defesa GO', goalkeeperReflexes: 'Reflexos GO', goalkeeperReach: 'Alcance GO', speed: 'Velocidade', acceleration: 'Aceleração', kickingPower: 'Força do chute', jump: 'Salto', physicalContact: 'Contato físico', balance: 'Equilíbrio', stamina: 'Resistência'
  };
  return labels[key] ?? key;
}

function ResultCard({ result, playerImage }: { result: AnalysisResult; playerImage: string | null }) {
  const [tab, setTab] = useState<ResultTab>('resumo');
  const card = result.parsed;
  const overall = card.maxOverall ?? card.overall ?? '--';
  const trainingItems = Object.entries(result.training).filter(([, value]) => Number(value) > 0);
  const pointPercent = Math.min(100, Math.round((result.trainingPointsUsed / Math.max(1, result.trainingPointsTotal)) * 100));
  const positionItems = result.positionScores.slice(0, 8);
  const nativeSkills = card.nativeSkills.slice(0, 8);
  const recommendedSkills = result.recommendedSkills.slice(0, 8);
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
          <div className="metric-grid">
            <div><span>GER</span><strong>{overall}</strong></div>
            <div><span>Melhor pos.</span><strong>{result.bestPosition.label}</strong></div>
            <div><span>PRI</span><strong>{result.pri.overall}</strong></div>
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
            <p className="kicker">Posições da carta</p>
            <div className="position-list">
              {positionItems.map((item, index) => (
                <div key={item.code}>
                  <strong>{item.label}</strong>
                  <span>{index === 0 ? 'Primária' : item.score >= 90 ? 'Ótima' : item.score >= 82 ? 'Boa' : 'Alternativa'}</span>
                  <em>{item.role}{item.cardRating ? ` • ${item.cardRating}` : ''}</em>
                </div>
              ))}
            </div>
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
              <div><span>Estilo de jogo</span><strong>{card.playstyle ?? '—'}</strong></div>
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
            <p className="kicker">Ímpetos / boosters</p>
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

export function CardVisionApp() {
  const [preview, setPreview] = useState<string | null>(null);
  const [playerCardImage, setPlayerCardImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [objective, setObjective] = useState<Objective>('COMPETITIVE');
  const [targetPosition, setTargetPosition] = useState<PositionCode | 'AUTO'>('AUTO');
  const [readingMode, setReadingMode] = useState<ReadingMode>('precision');
  const [status, setStatus] = useState('Envie o print da carta para começar.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const lastSavedKey = useRef<string | null>(null);

  const canAnalyze = useMemo(() => rawText.trim().length > 2 && !loading, [rawText, loading]);

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
    setRawText('');
    setResult(null);
    setStatus('Envie outro print da carta para começar.');
  }

  function restoreHistory(item: SavedAnalysis) {
    lastSavedKey.current = `${item.result.parsed.playerName}-${item.result.bestPosition.code}-${item.result.trainingPointsUsed}-${item.result.trainingPointsTotal}`;
    setRawText(item.rawText);
    setPlayerCardImage(item.playerImage);
    setPreview(item.fullPreview ?? item.playerImage);
    setResult(item.result);
    setStatus(`Análise restaurada: ${item.result.parsed.playerName}.`);
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setPlayerCardImage(null);
    setResult(null);
    setLoading(true);
    setRawText('');
    setStatus('Preparando imagem para OCR local premium...');

    try {
      const Tesseract = await import('tesseract.js');
      const croppedPreview = await createPlayerCardPreview(file);
      if (croppedPreview) setPlayerCardImage(croppedPreview);

      const variants = await createOcrVariants(file, readingMode);
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
        if (pass.data.text.trim()) texts.push(pass.data.text.trim());
      }

      const mergedText = mergeOcrTexts(...texts);
      setRawText(mergedText);

      if (mergedText.trim().length > 2) {
        const autoResult = analyzeCard(mergedText, objective, targetPosition, file.name);
        setResult(autoResult);
        setStatus('Carta analisada. Ficha Elite gerada com OCR local.');
      } else {
        setStatus('Não consegui ler texto suficiente. Tente print direto da tela com ficha automática visível.');
      }
    } catch {
      setStatus('Não consegui ler automaticamente. Tente outro print direto da tela com ficha automática visível.');
    } finally {
      setLoading(false);
    }
  }

  function runAnalysis() {
    setStatus('Gerando ficha Elite de gameplay máximo...');
    const nextResult = analyzeCard(rawText, objective, targetPosition, fileName);
    setResult(nextResult);
    setStatus(nextResult.note);
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
          <p>Envie o print, leia tudo localmente e gere uma ficha mais forte para gameplay real, sem API paga e sem copiar a ficha automática do jogo.</p>
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
                <span>Use print direto da tela com ficha automática visível.</span>
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
              <span>Posição alvo</span>
              <select value={targetPosition} onChange={(event) => setTargetPosition(event.target.value as PositionCode | 'AUTO')}>
                {POSITION_LABELS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>
          </div>

          <button className="elite-button generate-button" type="button" onClick={runAnalysis} disabled={!canAnalyze}>
            {loading ? <Loader2 className="spin" size={18} /> : <Zap size={18} />}
            {loading ? 'Lendo imagem...' : 'Gerar ficha Elite'}
          </button>

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
          {result ? <ResultCard result={result} playerImage={playerCardImage ?? preview} /> : (
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
