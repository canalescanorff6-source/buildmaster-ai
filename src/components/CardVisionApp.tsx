'use client';

import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, Copy, Download, ImagePlus, Loader2, ScanText, ShieldCheck, Sparkles, UploadCloud, Wand2, Zap } from 'lucide-react';
import { analyzeCard, type AnalysisResult, type Objective, type PositionCode, POSITION_LABELS } from '@/lib/analyzer';

const objectives: Array<{ value: Objective; label: string; hint: string }> = [
  { value: 'COMPETITIVE', label: 'Competitivo', hint: 'maior rendimento real em campo' },
  { value: 'FINISHER', label: 'Finalizador', hint: 'gols, presença de área e chute' },
  { value: 'CREATOR', label: 'Criador', hint: 'passe, assistência e controle' },
  { value: 'DRIBBLER', label: 'Driblador', hint: 'giro curto e 1 contra 1' },
  { value: 'QUICK_COUNTER', label: 'Contra-ataque rápido', hint: 'arranque e verticalidade' },
  { value: 'POSSESSION', label: 'Posse de bola', hint: 'toque curto e criação paciente' },
  { value: 'PRESSING', label: 'Pressão alta', hint: 'roubo, fôlego e agressividade' },
  { value: 'DEFENSIVE', label: 'Defensivo', hint: 'marcação, bloqueio e cobertura' },
  { value: 'AERIAL', label: 'Jogo aéreo', hint: 'cabeceio, salto e contato físico' }
];

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

const trainingLabels: Record<string, string> = {
  shooting: 'Chute',
  passing: 'Passe',
  dribbling: 'Drible',
  dexterity: 'Destreza',
  lowerBodyStrength: 'Força nas pernas',
  aerialStrength: 'Bola aérea',
  defending: 'Defesa',
  gk1: 'Goleiro 1',
  gk2: 'Goleiro 2',
  gk3: 'Goleiro 3'
};

const tacticalLabels: Record<string, string> = {
  possession: 'Posse de bola',
  quickCounter: 'Contra-ataque rápido',
  longBallCounter: 'Contra-ataque bola longa',
  outWide: 'Pelas pontas',
  longBall: 'Bola longa'
};

type ReadingMode = 'fast' | 'precision';
type ResultTab = 'resumo' | 'ficha' | 'habilidades' | 'posicoes' | 'dados';

function mergeOcrTexts(...texts: string[]) {
  const lines = new Map<string, string>();
  for (const text of texts) {
    for (const line of text.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) {
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

async function preprocessImage(file: File | Blob, mode: 'contrast' | 'sharp' = 'contrast'): Promise<Blob | File | Blob> {
  const setup = await imageToCanvas(file).catch(() => null);
  if (!setup) return file;

  const { bitmap, canvas, ctx } = setup;
  const scale = Math.max(2, Math.min(4, 2900 / Math.max(1, bitmap.width)));
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const boost = mode === 'sharp' ? 2.12 : 1.72;
    const contrasted = Math.max(0, Math.min(255, (gray - 110) * boost + 155));
    data[index] = contrasted;
    data[index + 1] = contrasted;
    data[index + 2] = contrasted;
  }
  ctx.putImageData(imageData, 0, 0);

  return await new Promise<Blob | File | Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/png', 0.96);
  });
}

async function cropImage(file: File, region: { x: number; y: number; w: number; h: number }, widthTarget = 1700): Promise<Blob | File> {
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
    const contrasted = Math.max(0, Math.min(255, (gray - 112) * 1.95 + 158));
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
  const topStats = await cropImage(file, { x: 0.0, y: 0.0, w: 1.0, h: 0.48 }, 2200);
  const rightStats = await cropImage(file, { x: 0.34, y: 0.10, w: 0.66, h: 0.72 }, 2300);
  const lowerSkills = await cropImage(file, { x: 0.0, y: 0.50, w: 1.0, h: 0.50 }, 2200);

  return [
    { label: 'imagem original', image: file },
    { label: 'imagem otimizada', image: fullContrast },
    { label: 'imagem reforçada', image: sharp },
    { label: 'área superior/posições', image: topStats },
    { label: 'área de atributos', image: rightStats },
    { label: 'área de habilidades/ímpetos', image: lowerSkills }
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
    const cropY = Math.round(height * 0.055);
    const cropW = Math.round(width * 0.27);
    const cropH = Math.round(height * 0.36);

    canvas.width = 560;
    canvas.height = 760;
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
    'Controle com a sola': 'deixa o giro e o domínio mais limpos',
    'Elástico': 'abre espaço em pontas e meias ofensivos',
    'Cruzamento preciso': 'aumenta criação pelas laterais',
    'Curva para fora': 'melhora passes e finalizações de trivela',
    'Passe de primeira': 'acelera tabelas, pivôs e contra-ataques',
    'Passe em profundidade': 'melhora bolas verticais e rupturas',
    'Passe na medida': 'qualifica lançamentos e inversões',
    'Interceptação': 'aumenta cortes automáticos de passe',
    'Bloqueador': 'melhora bloqueios de chute e passe',
    'Marcação individual': 'gruda melhor no alvo defensivo',
    'Volta para marcar': 'ajuda na pressão e recomposição',
    'Espírito guerreiro': 'mantém precisão mesmo cansado ou pressionado',
    'Chute de primeira': 'finaliza rápido sem dominar a bola',
    'Precisão à distância': 'melhora chute de fora da área',
    'Finalização acrobática': 'aumenta gols em posição ruim',
    'Cabeçada': 'melhora finalização aérea',
    'Superioridade aérea': 'vence duelos pelo alto com mais frequência',
    'Carrinho': 'aumenta precisão no desarme de emergência',
    'Afastamento acrobático': 'limpa bolas difíceis na defesa',
    'Super substituto': 'melhora impacto vindo do banco'
  };
  return reasons[skill] ?? 'completa a função real da carta sem repetir habilidade nativa';
}

function attributeNamePt(key: string) {
  const labels: Record<string, string> = {
    offensiveAwareness: 'Talento ofensivo', ballControl: 'Controle de bola', dribbling: 'Drible', tightPossession: 'Condução firme', lowPass: 'Passe rasteiro', loftedPass: 'Passe alto', finishing: 'Finalização', heading: 'Cabeçada', placeKicking: 'Cobrança de bola parada', curl: 'Curva', defensiveAwareness: 'Talento defensivo', defensiveEngagement: 'Dedicação defensiva', tackling: 'Desarme', aggression: 'Agressividade', goalkeeperAwareness: 'Talento de GO', goalkeeperCatching: 'Firmeza do GO', goalkeeperParrying: 'Defesa do GO', goalkeeperReflexes: 'Reflexos do GO', goalkeeperReach: 'Alcance do GO', speed: 'Velocidade', acceleration: 'Aceleração', kickingPower: 'Força do chute', jump: 'Salto', physicalContact: 'Contato físico', balance: 'Equilíbrio', stamina: 'Resistência'
  };
  return labels[key] ?? key;
}

function modelNamePt(key: string) {
  const labels: Record<string, string> = {
    armLength: 'Comprimento do braço', shoulderWidth: 'Largura dos ombros', neckLength: 'Comprimento do pescoço', chest: 'Peito', neckSize: 'Tamanho do pescoço', shoulderHeight: 'Altura do ombro', legLength: 'Comprimento da perna', thighSize: 'Tamanho da coxa', waistSize: 'Tamanho da cintura', armSize: 'Tamanho do braço', calfSize: 'Tamanho da panturrilha', legCoverageRadius: 'Raio cobertura pernas', armCoverageRadius: 'Raio cobertura braços', jumpHeight: 'Altura de salto', trunkCollision: 'Colisão do tronco', baseHeight: 'Altura com base'
  };
  return labels[key] ?? key;
}

function positionPt(code: string) {
  const labels: Record<string, string> = { CF: 'CA', SS: 'SA', LWF: 'PE', RWF: 'PD', LMF: 'ME', RMF: 'MD', AMF: 'MAT', CMF: 'MC', DMF: 'VOL', CB: 'ZAG', LB: 'LE', RB: 'LD', GK: 'GOL' };
  return labels[code] ?? code;
}

function copyBuildText(result: AnalysisResult) {
  const training = Object.entries(result.training)
    .filter(([, value]) => Number(value) > 0)
    .map(([key, value]) => `${trainingLabels[key] ?? key} +${value} (${result.trainingCost[key as keyof typeof result.trainingCost]} pts)`)
    .join('\n');

  const text = [
    `BuildMaster AI — ${result.parsed.playerName}`,
    `Função: ${result.buildName}`,
    `Melhor posição: ${result.bestPosition.label}`,
    `PRI: ${result.pri.overall}`,
    `Pontos: ${result.trainingPointsUsed}/${result.trainingPointsTotal}`,
    '',
    'Ficha:',
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

function ResultCard({ result, playerImage }: { result: AnalysisResult; playerImage: string | null }) {
  const [tab, setTab] = useState<ResultTab>('resumo');
  const card = result.parsed;
  const attributeItems = Object.entries(card.attributes).filter(([, value]) => Number.isFinite(value));
  const physicalItems = Object.entries(card.physicalProfile).filter(([, value]) => Number.isFinite(value));
  const positionRatingItems = Object.entries(card.positionRatings).filter(([, value]) => Number.isFinite(value));
  const trainingItems = Object.entries(result.training).filter(([, value]) => Number(value) > 0);
  const pointPercent = Math.min(100, Math.round((result.trainingPointsUsed / Math.max(1, result.trainingPointsTotal)) * 100));

  const pointsSourceLabel = card.trainingPointSource === 'OCR'
    ? 'lidos no print'
    : card.trainingPointSource === 'LEVEL_INFERRED'
      ? 'calculados pelo nível'
      : 'padrão do app';

  const infoItems = [
    ['Altura', card.height ? `${card.height} cm` : '—'],
    ['Peso', card.weight ? `${card.weight} kg` : '—'],
    ['Idade', card.age ?? '—'],
    ['Nível máximo', card.level ?? '—'],
    ['Pontos da ficha', card.trainingPointsTotal ? `${card.trainingPointsUsed ?? result.trainingPointsUsed}/${card.trainingPointsTotal} (${pointsSourceLabel})` : '—'],
    ['Pior pé frequência', card.condition.weakFootFrequency ?? '—'],
    ['Pior pé precisão', card.condition.weakFootAccuracy ?? '—'],
    ['Condição física', card.condition.form ?? '—'],
    ['Resistência a lesão', card.condition.injuryResistance ?? '—']
  ];

  return (
    <div className="result-shell pro-result">
      <section className="player-card-panel glass-panel premium-summary">
        <div className={`virtual-card ${playerImage ? 'has-player-image' : ''}`}>
          {playerImage && <img className="virtual-player-image" src={playerImage} alt={`Imagem de ${card.playerName}`} />}
          <div className="card-gradient" />
          <div className="card-lines" />
          <div className="card-top-info">
            <strong>{card.maxOverall ?? card.overall ?? '--'}</strong>
            <span>{card.mainPositionPt}</span>
          </div>
          <em>{card.playstyle ?? result.buildName}</em>
        </div>

        <div className="player-summary">
          <p className="eyebrow">Veredito BuildMaster AI</p>
          <h2>{card.playerName}</h2>
          <p className="role-line">Use como <strong>{result.buildName}</strong>. {card.playstyle ? `Estilo lido: ${card.playstyle}.` : ''}</p>
          <div className="summary-grid summary-grid-5">
            <div><span>Overall</span><strong>{card.maxOverall ?? card.overall ?? '—'}</strong></div>
            <div><span>Melhor posição</span><strong>{result.bestPosition.label}</strong></div>
            <div><span>PRI</span><strong>{result.pri.overall}</strong></div>
            <div><span>Pontos</span><strong>{result.trainingPointsUsed}/{result.trainingPointsTotal}</strong></div>
            <div><span>Confiança</span><strong>{card.confidence}%</strong></div>
          </div>
          <div className="point-meter"><i style={{ width: `${pointPercent}%` }} /><span>{pointPercent}% dos pontos usados</span></div>
          <div className="position-strip">
            <span>Posições da carta</span>
            <strong>{card.positionsPt.join(' • ')}</strong>
          </div>
          <div className="result-actions">
            <button type="button" className="soft-button mini-button" onClick={() => copyBuildText(result)}><Copy size={16} /> Copiar ficha</button>
          </div>
        </div>
      </section>

      {card.warnings.length > 0 && (
        <section className="warning-panel">
          {card.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </section>
      )}

      <nav className="result-tabs" aria-label="Resultado da análise">
        {[
          ['resumo', 'Resumo'],
          ['ficha', 'Ficha'],
          ['habilidades', 'Habilidades'],
          ['posicoes', 'Posições'],
          ['dados', 'Dados lidos']
        ].map(([value, label]) => (
          <button key={value} type="button" className={tab === value ? 'active' : ''} onClick={() => setTab(value as ResultTab)}>{label}</button>
        ))}
      </nav>

      {tab === 'resumo' && (
        <section className="grid-area compact-grid">
          <div className="glass-panel stack">
            <h3>Como usar em campo</h3>
            <ul className="tip-list pro-tips">
              {result.usageTips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
          <div className="glass-panel stack">
            <h3>PRI por setor</h3>
            <div className="bar-list compact-bars">
              {Object.entries(result.pri).map(([key, value]) => (
                <div className="bar-row" key={key}>
                  <div><span>{priLabels[key] ?? key}</span><strong>{value}</strong></div>
                  <i><b style={{ width: `${Math.min(100, Number(value))}%` }} /></i>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel stack">
            <h3>Pontos fortes</h3>
            <div className="pill-list">{result.strengths.map((item) => <span key={item}>{item}</span>)}</div>
          </div>
          <div className="glass-panel stack">
            <h3>Cuidados</h3>
            <div className="pill-list warning-pills">{result.weaknesses.map((item) => <span key={item}>{item}</span>)}</div>
          </div>
        </section>
      )}

      {tab === 'ficha' && (
        <section className="grid-area">
          <div className="glass-panel stack featured-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Custo real do jogo</p>
                <h3>Ficha recomendada</h3>
              </div>
              <span className="premium-badge">{result.trainingPointsUsed}/{result.trainingPointsTotal} pts</span>
            </div>
            <div className="point-meter big"><i style={{ width: `${pointPercent}%` }} /><span>{result.trainingPointsRemaining > 0 ? `${result.trainingPointsRemaining} pts restantes` : 'Ficha fechada no limite'}</span></div>
            <div className="training-grid premium-training">
              {trainingItems.map(([key, value]) => (
                <div key={key}>
                  <span>{trainingLabels[key] ?? key}</span>
                  <strong>+{value}</strong>
                  <small>{result.trainingCost[key as keyof typeof result.trainingCost] ?? 0} pts reais</small>
                </div>
              ))}
            </div>
            <p className="microcopy">{result.trainingCostRule}</p>
          </div>

          <div className="glass-panel stack">
            <h3>Compatibilidade tática</h3>
            <div className="tactical-grid">
              {Object.entries(result.tacticalFit).map(([key, value]) => (
                <div key={key}>
                  <span>{tacticalLabels[key] ?? key}</span>
                  <strong>{value}/10</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === 'habilidades' && (
        <section className="grid-area">
          <div className="glass-panel stack priority-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Somente faltantes</p>
                <h3>Habilidades para adicionar</h3>
              </div>
              <span className="premium-badge">Top {result.recommendedSkills.length}</span>
            </div>
            <div className="skill-priority-list">
              {result.recommendedSkills.length ? result.recommendedSkills.map((skill, index) => (
                <div key={skill} className="skill-priority-card">
                  <strong>{String(index + 1).padStart(2, '0')}</strong>
                  <div>
                    <span>{skill}</span>
                    <small>{skillReason(skill)}</small>
                  </div>
                </div>
              )) : (
                <div className="skill-priority-card">
                  <strong>OK</strong>
                  <div>
                    <span>A carta já tem as principais habilidades da função</span>
                    <small>revise o texto lido se alguma habilidade nativa não foi reconhecida</small>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="glass-panel stack muted-panel">
            <h3>Habilidades já lidas</h3>
            <div className="chip-list small-chips">
              {card.nativeSkills.length ? card.nativeSkills.map((skill) => <span key={skill}>{skill}</span>) : <span>Nenhuma habilidade nativa lida com segurança</span>}
            </div>
            <p className="microcopy">Essas habilidades são removidas da recomendação para evitar repetição.</p>
          </div>
        </section>
      )}

      {tab === 'posicoes' && (
        <section className="grid-area">
          <div className="glass-panel stack">
            <h3>Melhores posições reais</h3>
            <div className="position-list">
              {result.positionScores.slice(0, 10).map((item, index) => (
                <div key={item.code} className={index === 0 ? 'best-position-row' : ''}>
                  <strong>{String(index + 1).padStart(2, '0')} • {item.label}</strong>
                  <span>{item.score}/100 • {item.role}{item.cardRating ? ` • rating da carta ${item.cardRating}` : ''}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel stack">
            <h3>Overalls por posição lidos</h3>
            <div className="data-grid compact-data-grid">
              {positionRatingItems.length ? positionRatingItems.map(([code, value]) => (
                <div key={code}><span>{code} → {positionPt(code)}</span><strong>{value}</strong></div>
              )) : <p className="microcopy">A tabela de posição não foi lida. Revise o OCR ou cole manualmente as linhas CA 90, SA 86, VOL 80 etc.</p>}
            </div>
          </div>
        </section>
      )}

      {tab === 'dados' && (
        <section className="grid-area">
          <div className="glass-panel stack">
            <h3>Dados principais lidos</h3>
            <div className="data-grid compact-data-grid">
              {infoItems.map(([label, value]) => (
                <div key={String(label)}><span>{label}</span><strong>{String(value)}</strong></div>
              ))}
            </div>
          </div>
          <div className="glass-panel stack">
            <h3>Ímpetos / boosters</h3>
            <div className="chip-list">
              {card.impetos.length ? card.impetos.map((item) => (
                <span key={`${item.name}-${item.value ?? ''}`}>{item.name}{item.value ? ` +${item.value}` : ''}{item.active === false ? ' — inativo' : ''}</span>
              )) : <span>Nenhum ímpeto lido</span>}
            </div>
            {card.specialSkills.length > 0 && <p className="microcopy">Habilidades especiais lidas: {card.specialSkills.join(', ')}</p>}
          </div>
          <div className="glass-panel stack wide-panel">
            <h3>Todos os atributos lidos</h3>
            <div className="data-grid attributes-grid compact-data-grid">
              {attributeItems.length ? attributeItems.map(([key, value]) => (
                <div key={key}><span>{attributeNamePt(key)}</span><strong>{value}</strong></div>
              )) : <p className="microcopy">Nenhum atributo lido com segurança.</p>}
            </div>
          </div>
          <div className="glass-panel stack wide-panel">
            <h3>Modelo de jogador lido</h3>
            <div className="data-grid compact-data-grid">
              {physicalItems.length ? physicalItems.map(([key, value]) => (
                <div key={key}><span>{modelNamePt(key)}</span><strong>{String(value)}</strong></div>
              )) : <p className="microcopy">Modelo corporal não lido com segurança.</p>}
            </div>
          </div>
        </section>
      )}
    </div>
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

  const canAnalyze = useMemo(() => rawText.trim().length > 2, [rawText]);

  async function handleFile(file: File) {
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setPlayerCardImage(null);
    setResult(null);
    setLoading(true);
    setRawText('');
    setStatus('Preparando imagem para leitura inteligente...');

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
      setStatus('Leitura concluída. Confira nome, estilo, posição, pontos e atributos antes de gerar a ficha final.');
    } catch {
      setStatus('Não consegui ler automaticamente. Use Buscar print/galeria novamente ou cole os dados da carta no campo de revisão.');
    } finally {
      setLoading(false);
    }
  }

  function runAnalysis() {
    setStatus('Gerando ficha de gameplay máximo...');
    const nextResult = analyzeCard(rawText, objective, targetPosition, fileName);
    setResult(nextResult);
    setStatus(nextResult.note);
  }

  return (
    <main className="app-frame">
      <section className="hero compact-hero premium-hero">
        <div>
          <div className="brand-pill"><Sparkles size={16} /> BuildMaster AI Vision Pro</div>
          <h1>Ficha máxima por imagem</h1>
          <p>Envie o print da carta. O app lê as estatísticas, organiza a informação e entrega ficha com custo real de pontos, melhor posição, habilidades adicionais faltantes e gameplay ideal.</p>
        </div>
        <div className="hero-badges">
          <span><ShieldCheck size={16} /> Sem banco</span>
          <span><ScanText size={16} /> OCR por áreas</span>
          <span><CheckCircle2 size={16} /> PT-BR</span>
        </div>
      </section>

      <section className="main-grid pro-main-grid">
        <section className="glass-panel input-panel premium-input">
          <div className="panel-title">
            <div>
              <p className="eyebrow">Etapa 1</p>
              <h2>Imagem da carta</h2>
            </div>
            <Camera size={24} />
          </div>

          <div className="dropzone preview-zone compact-preview">
            {preview ? <img src={preview} alt="Imagem enviada" /> : (
              <span><ImagePlus size={34} /> Toque em Buscar print/galeria e selecione o print da carta</span>
            )}
          </div>

          <div className="upload-choice-row">
            <label className="soft-button upload-action primary-upload">
              <input
                className="visually-hidden"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = '';
                  if (file) void handleFile(file);
                }}
              />
              <UploadCloud size={18} /> Buscar print/galeria
            </label>

            <label className="soft-button upload-action camera-upload">
              <input
                className="visually-hidden"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = '';
                  if (file) void handleFile(file);
                }}
              />
              <Camera size={18} /> Tirar foto
            </label>
          </div>

          <div className="form-grid compact-form-grid">
            <label>
              Modo de leitura
              <select value={readingMode} onChange={(event) => setReadingMode(event.target.value as ReadingMode)}>
                <option value="precision">Precisão máxima — lê por áreas</option>
                <option value="fast">Rápido — leitura leve</option>
              </select>
            </label>
            <label>
              Objetivo da ficha
              <select value={objective} onChange={(event) => setObjective(event.target.value as Objective)}>
                {objectives.map((item) => <option key={item.value} value={item.value}>{item.label} — {item.hint}</option>)}
              </select>
            </label>
            <label>
              Posição alvo
              <select value={targetPosition} onChange={(event) => setTargetPosition(event.target.value as PositionCode | 'AUTO')}>
                {POSITION_LABELS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>
          </div>

          <div className="review-box">
            <div className="section-head compact-section-head">
              <div>
                <p className="eyebrow">Etapa 2</p>
                <h3>Revisão do OCR</h3>
              </div>
              <Zap size={18} />
            </div>
            <textarea
              rows={12}
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder={'O texto lido aparece aqui. Corrija se precisar:\nEl-Hadji Diouf\nEstilo: Artilheiro\nCA 102  PE 100  PD 100  SA 100\nNível máximo 32  Pontos 62/62\nChute 10  Passe 4  Destreza 12  Força nas pernas 8  Bola aérea 4\nFinalização 91  Velocidade 92  Aceleração 95\nHabilidades: Chute de primeira, Cabeçada...'}
            />
          </div>

          <div className="actions sticky-actions">
            <button type="button" className="primary-button" disabled={loading || !canAnalyze} onClick={runAnalysis}>
              {loading ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
              Gerar ficha premium
            </button>
          </div>

          <p className="status-line">{status}</p>
          <p className="microcopy upload-help">Para máxima precisão, use print direto da tela. Se alguma linha vier errada, corrija no campo acima antes de gerar a ficha.</p>
        </section>

        <section className="output-panel">
          {result ? <ResultCard result={result} playerImage={playerCardImage ?? preview} /> : (
            <div className="glass-panel empty-result premium-empty">
              <Sparkles size={42} />
              <h2>Resultado final</h2>
              <p>Depois da leitura, o resultado fica separado em abas: resumo, ficha, habilidades, posições e dados lidos.</p>
              <div className="preview-card-mini">
                <strong>--</strong><span>CA</span><em>BuildMaster AI</em>
              </div>
            </div>
          )}
        </section>
      </section>

      <footer className="footer-note">
        <Download size={16} /> Instale no celular pelo Chrome: menu ⋮ → Adicionar à tela inicial.
      </footer>
    </main>
  );
}
