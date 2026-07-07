'use client';

import { useMemo, useState } from 'react';
import { Camera, ClipboardPaste, Loader2, Smartphone, Sparkles, Wand2 } from 'lucide-react';
import { POSITION_OPTIONS } from '@/lib/positions';

type AnalyzeResult = {
  parsed: {
    playerName: string;
    rarity: string;
    specialTag?: string | null;
    country?: string | null;
    mainPosition: string;
    mainPositionPt: string;
    positions: string[];
    positionsPt: string[];
    dominantFoot?: string | null;
    playstyle?: string | null;
    overall?: number | null;
    maxOverall?: number | null;
    height?: number | null;
    weight?: number | null;
    age?: number | null;
    level?: number | null;
    nativeSkills: string[];
    parsedAttributes: Record<string, number>;
    season?: string | null;
    internalId: string;
    confidence: number;
    warnings: string[];
  };
  matched: boolean;
  matchedCards: Array<{ id: string; playerName: string; cardName: string; rarity: string; positions: string; positionsPt?: string; overall: number; maxOverall?: number | null }>;
  recommendation: {
    pri: Record<string, number>;
    tacticalFit: Record<string, number>;
    recommendedPosition: string;
    recommendedPositionPt?: string;
    training: Record<string, number>;
    recommendedSkills: string[];
    strengths: string[];
    weaknesses: string[];
    usageTips: string[];
  };
  note: string;
};

const objectiveOptions = [
  ['COMPETITIVE', 'Competitivo'],
  ['FINISHER', 'Finalizador'],
  ['CREATOR', 'Criador'],
  ['DRIBBLER', 'Driblador'],
  ['PRESSING', 'Pressão alta'],
  ['POSSESSION', 'Posse de bola'],
  ['QUICK_COUNTER', 'Contra-ataque rápido'],
  ['DEFENSIVE', 'Defensivo'],
  ['AERIAL', 'Jogo aéreo']
];

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

const priLabels: Record<string, string> = {
  finishing: 'Finalização',
  creation: 'Criação',
  dribbling: 'Drible',
  mobility: 'Mobilidade',
  pressure: 'Pressão',
  defense: 'Defesa',
  physical: 'Físico',
  stamina: 'Resistência',
  overall: 'PRI geral'
};

const tacticalLabels: Record<string, string> = {
  possession: 'Posse de bola',
  quickCounter: 'Contra-ataque rápido',
  longBallCounter: 'Contra-ataque de bola longa',
  outWide: 'Pelas pontas',
  longBall: 'Bola longa'
};

const batistutaExample = `Gabriel Batistuta
Artilheiro
Argentina
CA / SA
Altura 185cm
Peso 73kg
Idade 26
Nível 31
Talento ofensivo 81
Controle de bola 76
Drible 76
Condução firme 74
Passe rasteiro 58
Passe alto 55
Finalização 81
Cabeçada 80
Cobrança de bola parada 60
Curva 62
Talento defensivo 40
Dedicação defensiva 47
Desarme 44
Agressividade 47
Velocidade 79
Aceleração 77
Força do chute 84
Salto 77
Contato físico 80
Equilíbrio 68
Resistência 72
Habilidades: Cabeçada, Efeito de longe, Precisão à distância, Chute com o peito do pé, Chute ascendente, Finalização acrobática, Chute de primeira, Espírito guerreiro, Superioridade aérea, Finalizador nato`;

export function CardImageAnalyzer() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [objective, setObjective] = useState('COMPETITIVE');
  const [targetPosition, setTargetPosition] = useState('AUTO');
  const [status, setStatus] = useState('Envie um print da carta para começar.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const canAnalyze = useMemo(() => rawText.trim().length > 2 || fileName, [rawText, fileName]);
  const attributeCount = result ? Object.keys(result.parsed.parsedAttributes ?? {}).length : 0;

  async function handleFile(file: File) {
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setLoading(true);
    setStatus('Lendo texto da imagem com OCR local...');

    try {
      const Tesseract = await import('tesseract.js');
      const { data } = await Tesseract.recognize(file, 'por+eng', {
        logger: (message) => {
          if (message.status) setStatus(`OCR: ${message.status}${message.progress ? ` ${Math.round(message.progress * 100)}%` : ''}`);
        }
      });
      setRawText(data.text.trim());
      setStatus('Texto extraído. Revise/corrija se necessário e clique em Analisar carta.');
    } catch {
      setStatus('Não consegui rodar o OCR no navegador. Você ainda pode digitar/colar os dados visíveis da carta no campo de texto.');
    } finally {
      setLoading(false);
    }
  }

  async function analyze() {
    setLoading(true);
    setStatus('Calculando melhor ficha, posição real, PRI e habilidades adicionais...');

    try {
      const response = await fetch('/api/vision/analyze-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, imageFileName: fileName, objective, targetPosition })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Erro ao analisar carta.');
      setResult(data);
      setStatus(data.note);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao analisar carta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack-lg premium-vision">
      <section className="panel hero-panel premium-hero">
        <div>
          <p className="eyebrow">Card Vision AI Premium</p>
          <h2>Análise por imagem da carta</h2>
          <p className="muted">
            Envie um print do eFHUB/eFootBase, tire foto pelo celular ou cole os dados. O app lê a ficha, converte posições para PT-BR, calcula PRI,
            melhor posição real, treino ideal, habilidades adicionais e como usar dentro de campo.
          </p>
        </div>
        <div className="hero-icon"><Smartphone size={34} /></div>
      </section>

      <section className="grid two-cols">
        <div className="panel stack-md premium-card-surface">
          <label className="upload-box premium-upload">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {preview ? <img src={preview} alt="Prévia da carta" /> : <span>Toque aqui para tirar foto ou enviar imagem da carta</span>}
          </label>

          <div className="grid two-cols compact-grid">
            <label>
              Objetivo da ficha
              <select value={objective} onChange={(event) => setObjective(event.target.value)}>
                {objectiveOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              Posição alvo
              <select value={targetPosition} onChange={(event) => setTargetPosition(event.target.value)}>
                {POSITION_OPTIONS.map((pos) => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
              </select>
            </label>
          </div>

          <label>
            Texto extraído da imagem / revisão manual
            <textarea
              rows={12}
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder={'Exemplo:\nLionel Messi\nShow Time — Blitz Curler\nArgentina\nSA / PD / MAT\nPé esquerdo\nCreative Playmaker\nOverall máximo 103\nFinalização 92\nDrible 97'}
            />
          </label>

          <div className="button-row">
            <button className="ghost-button" type="button" onClick={() => setRawText(batistutaExample)}>
              <ClipboardPaste size={18} /> Testar com Batistuta
            </button>
            <button className="primary-button" type="button" disabled={loading || !canAnalyze} onClick={() => void analyze()}>
              {loading ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
              Analisar carta
            </button>
          </div>
          <p className="muted">{status}</p>
          <p className="muted small-note">No celular, prefira print nítido ou foto horizontal da tela inteira da carta. Depois corrija o texto lido antes de analisar.</p>
        </div>

        <div className="panel stack-md premium-result-card">
          {!result ? (
            <div className="empty-state">
              <Sparkles size={34} />
              <h3>Resultado premium</h3>
              <p className="muted">O resultado aparece com PRI, posições em PT-BR, habilidades adicionais e plano de uso em campo.</p>
            </div>
          ) : (
            <div className="stack-md">
              <div className="extracted-card-hero">
                <div className="virtual-player-card" aria-label="Carta lida da imagem">
                  <div className="virtual-card-glow" />
                  <strong>{result.parsed.maxOverall ?? result.parsed.overall ?? '--'}</strong>
                  <span>{result.parsed.mainPositionPt}</span>
                  <em>{result.parsed.playstyle ?? result.parsed.specialTag ?? result.parsed.rarity.replace('_', ' ')}</em>
                </div>

                <div className="extracted-card-info">
                  <div className="card-title-row">
                    <div>
                      <p className="eyebrow">Dados extraídos da imagem • {result.parsed.rarity.replace('_', ' ')}</p>
                      <h3>{result.parsed.playerName}</h3>
                      <p className="muted">{result.parsed.specialTag ?? result.parsed.playstyle ?? 'Carta identificada por imagem'}</p>
                    </div>
                    <div className="score-pill"><small>PRI</small>{result.recommendation.pri.overall}</div>
                  </div>

                  <div className="card-fact-grid">
                    <div><span>Altura</span><strong>{result.parsed.height ? `${result.parsed.height} cm` : '-'}</strong></div>
                    <div><span>Peso</span><strong>{result.parsed.weight ? `${result.parsed.weight} kg` : '-'}</strong></div>
                    <div><span>Idade</span><strong>{result.parsed.age ?? '-'}</strong></div>
                    <div><span>Nível</span><strong>{result.parsed.level ?? '-'}</strong></div>
                    <div><span>Estilo</span><strong>{result.parsed.playstyle ?? '-'}</strong></div>
                    <div><span>Posição</span><strong>{result.parsed.mainPositionPt}</strong></div>
                  </div>
                </div>
              </div>

              <div className="id-box">ID interno: <strong>{result.parsed.internalId}</strong></div>
              <p className="muted">
                Confiança: {result.parsed.confidence}% • {result.matched ? 'Encontrada na base' : 'Análise por imagem'} • {attributeCount} atributos lidos
              </p>

              {result.parsed.warnings.length > 0 && (
                <div className="warning-box">
                  {result.parsed.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                </div>
              )}

              <div className="metric-grid">
                <div><span>Melhor posição</span><strong>{result.recommendation.recommendedPositionPt ?? result.recommendation.recommendedPosition}</strong></div>
                <div><span>Posições lidas</span><strong>{result.parsed.positionsPt.join(' / ')}</strong></div>
                <div><span>Overall máx.</span><strong>{result.parsed.maxOverall ?? result.parsed.overall ?? '-'}</strong></div>
                <div><span>Estilo</span><strong>{result.parsed.playstyle ?? '-'}</strong></div>
              </div>

              <div>
                <h4>PRI</h4>
                <div className="metric-grid small">
                  {Object.entries(result.recommendation.pri).map(([key, value]) => (
                    <div key={key}><span>{priLabels[key] ?? key}</span><strong>{value}</strong></div>
                  ))}
                </div>
              </div>

              <div>
                <h4>Compatibilidade tática</h4>
                <div className="metric-grid small">
                  {Object.entries(result.recommendation.tacticalFit).map(([key, value]) => (
                    <div key={key}><span>{tacticalLabels[key] ?? key}</span><strong>{value}/10</strong></div>
                  ))}
                </div>
              </div>

              <div>
                <h4>Treino recomendado</h4>
                <div className="metric-grid small">
                  {Object.entries(result.recommendation.training).filter(([, value]) => Number(value) > 0).map(([key, value]) => (
                    <div key={key}><span>{trainingLabels[key] ?? key}</span><strong>{value}</strong></div>
                  ))}
                </div>
              </div>

              {result.parsed.nativeSkills.length > 0 && (
                <div>
                  <h4>Habilidades já lidas na carta</h4>
                  <div className="chip-list native-skills">
                    {result.parsed.nativeSkills.map((skill) => <span key={skill}>{skill}</span>)}
                  </div>
                </div>
              )}

              <div>
                <h4>Habilidades adicionais sugeridas</h4>
                <div className="chip-list">
                  {result.recommendation.recommendedSkills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
                <p className="muted small-note">A lista é editável. Quando você mandar todas as habilidades oficiais, eu atualizo o dicionário para ficar exatamente igual ao jogo.</p>
              </div>

              <div>
                <h4>Como extrair gameplay em campo</h4>
                <ul className="clean-list">
                  {result.recommendation.usageTips.map((tip) => <li key={tip}>{tip}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
