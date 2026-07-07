'use client';

import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, ClipboardPaste, Download, Loader2, ScanText, ShieldCheck, Sparkles, UploadCloud, Wand2 } from 'lucide-react';
import { analyzeCard, type AnalysisResult, type Objective, type PositionCode, EXAMPLE_TEXT, POSITION_LABELS } from '@/lib/analyzer';

const objectives: Array<{ value: Objective; label: string; hint: string }> = [
  { value: 'COMPETITIVE', label: 'Competitivo', hint: 'melhor rendimento geral em campo' },
  { value: 'FINISHER', label: 'Finalizador', hint: 'gols, finalização e presença de área' },
  { value: 'CREATOR', label: 'Criador', hint: 'passes, assistência e controle do jogo' },
  { value: 'DRIBBLER', label: 'Driblador', hint: 'drible, giro curto e 1 contra 1' },
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

async function preprocessImage(file: File): Promise<Blob | File> {
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.max(2, Math.min(3.5, 2600 / Math.max(1, bitmap.width)));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let index = 0; index < data.length; index += 4) {
      const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      const contrasted = Math.max(0, Math.min(255, (gray - 115) * 1.85 + 148));
      data[index] = contrasted;
      data[index + 1] = contrasted;
      data[index + 2] = contrasted;
    }
    ctx.putImageData(imageData, 0, 0);

    return await new Promise<Blob | File>((resolve) => {
      canvas.toBlob((blob) => resolve(blob ?? file), 'image/png', 0.95);
    });
  } catch {
    return file;
  }
}



async function createPlayerCardPreview(file: File): Promise<string | null> {
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return null;

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const width = bitmap.width;
    const height = bitmap.height;

    // Recorte aproximado do card do jogador em prints do eFHUB/eFootBase.
    // Mantém a imagem do jogador dentro do card visual premium sem distribuir base de imagens.
    const cropX = Math.round(width * 0.055);
    const cropY = Math.round(height * 0.075);
    const cropW = Math.round(width * 0.185);
    const cropH = Math.round(height * 0.245);

    canvas.width = 520;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  } catch {
    return null;
  }
}
function ResultCard({ result, playerImage }: { result: AnalysisResult; playerImage: string | null }) {
  const card = result.parsed;
  const infoItems = [
    ['Altura', card.height ? `${card.height} cm` : '—'],
    ['Peso', card.weight ? `${card.weight} kg` : '—'],
    ['Idade', card.age ?? '—'],
    ['Nível', card.level ?? '—'],
    ['Pior pé frequência', card.condition.weakFootFrequency ?? '—'],
    ['Pior pé precisão', card.condition.weakFootAccuracy ?? '—'],
    ['Condição física', card.condition.form ?? '—'],
    ['Resistência a lesão', card.condition.injuryResistance ?? '—']
  ];
  const attributeItems = Object.entries(card.attributes).filter(([, value]) => Number.isFinite(value));
  const physicalItems = Object.entries(card.physicalProfile).filter(([, value]) => Number.isFinite(value));
  const positionRatingItems = Object.entries(card.positionRatings).filter(([, value]) => Number.isFinite(value));

  return (
    <div className="result-shell">
      <section className="player-card-panel glass-panel">
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
          <p className="eyebrow">{card.cardType} {card.specialTag ? `• ${card.specialTag}` : ''}</p>
          <h2>{card.playerName}</h2>
          <div className="summary-grid">
            <div><span>Melhor posição</span><strong>{result.bestPosition.label}</strong></div>
            <div><span>PRI geral</span><strong>{result.pri.overall}</strong></div>
            <div><span>Confiança</span><strong>{card.confidence}%</strong></div>
            <div><span>Função</span><strong>{result.buildName}</strong></div>
          </div>
        </div>
      </section>

      {card.warnings.length > 0 && (
        <section className="warning-panel">
          {card.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </section>
      )}

      <section className="grid-area">
        <div className="glass-panel stack">
          <h3>Dados lidos da carta</h3>
          <div className="data-grid">
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
      </section>

      <section className="grid-area">
        <div className="glass-panel stack">
          <h3>Ficha recomendada</h3>
          <div className="training-grid">
            {Object.entries(result.training).filter(([, value]) => Number(value) > 0).map(([key, value]) => (
              <div key={key}>
                <span>{trainingLabels[key] ?? key}</span>
                <strong>+{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel stack">
          <h3>Habilidades adicionais</h3>
          <div className="chip-list">
            {result.recommendedSkills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
          {card.nativeSkills.length > 0 && (
            <p className="microcopy">Já lidas na carta: {card.nativeSkills.join(', ')}</p>
          )}
        </div>
      </section>

      <section className="glass-panel stack">
        <h3>Todos os atributos lidos</h3>
        <div className="data-grid attributes-grid">
          {attributeItems.length ? attributeItems.map(([key, value]) => (
            <div key={key}><span>{attributeNamePt(key)}</span><strong>{value}</strong></div>
          )) : <p className="microcopy">Nenhum atributo lido com segurança.</p>}
        </div>
      </section>

      <section className="glass-panel stack">
        <h3>PRI por setor</h3>
        <div className="bar-list">
          {Object.entries(result.pri).map(([key, value]) => (
            <div className="bar-row" key={key}>
              <div><span>{priLabels[key] ?? key}</span><strong>{value}</strong></div>
              <i><b style={{ width: `${Math.min(100, Number(value))}%` }} /></i>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-area">
        <div className="glass-panel stack">
          <h3>Melhores posições reais</h3>
          <div className="position-list">
            {result.positionScores.slice(0, 10).map((item) => (
              <div key={item.code}>
                <strong>{item.label}</strong>
                <span>{item.score}/100 • {item.role}{item.cardRating ? ` • rating da carta ${item.cardRating}` : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel stack">
          <h3>Overalls por posição lidos</h3>
          <div className="data-grid">
            {positionRatingItems.length ? positionRatingItems.map(([code, value]) => (
              <div key={code}><span>{code} → {positionPt(code)}</span><strong>{value}</strong></div>
            )) : <p className="microcopy">A tabela de posição não foi lida.</p>}
          </div>
        </div>
      </section>

      <section className="grid-area">
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

        <div className="glass-panel stack">
          <h3>Modelo de jogador lido</h3>
          <div className="data-grid">
            {physicalItems.length ? physicalItems.map(([key, value]) => (
              <div key={key}><span>{modelNamePt(key)}</span><strong>{String(value)}</strong></div>
            )) : <p className="microcopy">Modelo corporal não lido com segurança.</p>}
          </div>
        </div>
      </section>

      <section className="glass-panel stack">
        <h3>Como tirar mais gameplay em campo</h3>
        <ul className="tip-list">
          {result.usageTips.map((tip) => <li key={tip}>{tip}</li>)}
        </ul>
        <div className="strengths-grid">
          <div><h4>Pontos fortes</h4>{result.strengths.map((item) => <p key={item}>{item}</p>)}</div>
          <div><h4>Cuidados</h4>{result.weaknesses.map((item) => <p key={item}>{item}</p>)}</div>
        </div>
      </section>
    </div>
  );
}

function attributeNamePt(key: string) {
  const labels: Record<string, string> = {
    offensiveAwareness: 'Talento ofensivo', ballControl: 'Controle de bola', dribbling: 'Drible', tightPossession: 'Condução firme', lowPass: 'Passe rasteiro', loftedPass: 'Passe alto', finishing: 'Finalização', heading: 'Cabeçada', placeKicking: 'Cobrança de bola parada', curl: 'Curva', defensiveAwareness: 'Talento defensivo', defensiveEngagement: 'Dedicação defensiva', tackling: 'Desarme', aggression: 'Agressividade', goalkeeperAwareness: 'Talento de GO', goalkeeperCatching: 'Firmeza do GO', goalkeeperParrying: 'Defesa do GO', goalkeeperReflexes: 'Reflexos do GO', goalkeeperReach: 'Alcance do GO', speed: 'Velocidade', acceleration: 'Aceleração', kickingPower: 'Força do chute', jump: 'Salto', physicalContact: 'Contato físico', balance: 'Equilíbrio', stamina: 'Resistência'
  };
  return labels[key] ?? key;
}

function modelNamePt(key: string) {
  const labels: Record<string, string> = {
    armLength: 'Comprimento do braço', shoulderWidth: 'Largura dos ombros', neckLength: 'Comprimento do pescoço', chest: 'Chest', neckSize: 'Tamanho do pescoço', shoulderHeight: 'Altura do ombro', legLength: 'Comprimento da perna', thighSize: 'Tamanho da coxa', waistSize: 'Tamanho da cintura', armSize: 'Tamanho do braço', calfSize: 'Tamanho da panturrilha', legCoverageRadius: 'Raio cobertura pernas', armCoverageRadius: 'Raio cobertura braços', jumpHeight: 'Altura de salto', trunkCollision: 'Colisão do tronco', baseHeight: 'Altura com base'
  };
  return labels[key] ?? key;
}

function positionPt(code: string) {
  const labels: Record<string, string> = { CF: 'CA', SS: 'SA', LWF: 'PE', RWF: 'PD', LMF: 'ME', RMF: 'MD', AMF: 'MAT', CMF: 'MC', DMF: 'VOL', CB: 'ZAG', LB: 'LE', RB: 'LD', GK: 'GOL' };
  return labels[code] ?? code;
}

export function CardVisionApp() {
  const [preview, setPreview] = useState<string | null>(null);
  const [playerCardImage, setPlayerCardImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [objective, setObjective] = useState<Objective>('COMPETITIVE');
  const [targetPosition, setTargetPosition] = useState<PositionCode | 'AUTO'>('AUTO');
  const [status, setStatus] = useState('Envie a imagem da carta para começar.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const canAnalyze = useMemo(() => rawText.trim().length > 2, [rawText]);

  async function handleFile(file: File) {
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setPlayerCardImage(null);
    setResult(null);
    setLoading(true);
    setStatus('Preparando imagem para OCR...');

    try {
      const Tesseract = await import('tesseract.js');
      const croppedPreview = await createPlayerCardPreview(file);
      if (croppedPreview) setPlayerCardImage(croppedPreview);
      const processed = await preprocessImage(file);
      const { data } = await Tesseract.recognize(processed, 'por+eng', {
        logger: (message) => {
          if (message.status) {
            setStatus(`OCR: ${message.status}${message.progress ? ` ${Math.round(message.progress * 100)}%` : ''}`);
          }
        }
      });
      setRawText(data.text.trim());
      setStatus('Texto lido. Revise os dados e toque em Gerar ficha premium.');
    } catch {
      setStatus('Não consegui ler automaticamente. Cole ou digite os dados da carta no campo de revisão.');
    } finally {
      setLoading(false);
    }
  }

  function runAnalysis() {
    setStatus('Gerando ficha de jogabilidade...');
    const nextResult = analyzeCard(rawText, objective, targetPosition, fileName);
    setResult(nextResult);
    setStatus(nextResult.note);
  }

  return (
    <main className="app-frame">
      <section className="hero">
        <div className="brand-pill"><Sparkles size={16} /> BuildMaster AI Vision</div>
        <h1>Ficha premium por imagem para eFootball</h1>
        <p>
          O app agora fica focado apenas no que importa: enviar a imagem da carta, ler os dados, gerar melhor ficha, PRI, posição real,
          habilidades adicionais e plano de gameplay.
        </p>
        <div className="hero-badges">
          <span><ShieldCheck size={16} /> Sem banco obrigatório</span>
          <span><ScanText size={16} /> OCR local</span>
          <span><CheckCircle2 size={16} /> Posições PT-BR</span>
        </div>
      </section>

      <section className="main-grid">
        <section className="glass-panel input-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">1. Imagem da carta</p>
              <h2>Analisar jogador</h2>
            </div>
            <Camera size={24} />
          </div>

          <label className="dropzone">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {preview ? <img src={preview} alt="Imagem enviada" /> : (
              <span><UploadCloud size={34} /> Toque para tirar foto ou enviar print da carta</span>
            )}
          </label>

          <div className="form-grid">
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

          <label>
            Revisão dos dados lidos
            <textarea
              rows={12}
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder={'Exemplo:\nLionel Messi\nShow Time — Blitz Curler\nSA / PD / MAT\nPé esquerdo\nFinalização 92\nDrible 97\nVelocidade 85\nHabilidades: Toque duplo, Controle com a sola'}
            />
          </label>

          <div className="actions">
            <button type="button" className="soft-button" onClick={() => { setRawText(EXAMPLE_TEXT); setStatus('Exemplo carregado. Toque em Gerar ficha premium.'); }}>
              <ClipboardPaste size={18} /> Testar exemplo
            </button>
            <button type="button" className="primary-button" disabled={loading || !canAnalyze} onClick={runAnalysis}>
              {loading ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
              Gerar ficha premium
            </button>
          </div>

          <p className="status-line">{status}</p>
          <p className="microcopy">
            Para maior precisão, use print nítido direto do eFHUB/eFootBase. Foto da tela funciona, mas pode exigir correção manual do texto.
          </p>
        </section>

        <section className="output-panel">
          {result ? <ResultCard result={result} playerImage={playerCardImage ?? preview} /> : (
            <div className="glass-panel empty-result">
              <Sparkles size={42} />
              <h2>Resultado premium</h2>
              <p>Depois da análise, aqui aparecem a ficha, PRI, melhores posições, habilidades e gameplay ideal.</p>
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
