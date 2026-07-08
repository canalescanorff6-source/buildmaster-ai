const LOGIN_USER = "thiago0126";
const LOGIN_PASSWORD = "iu1fsaa67a";
const SESSION_KEY = "buildmaster_local_pro_v8_session";

const POSITIONS = ["CA", "SA", "PD", "PE", "MAT", "MEI", "MC", "VOL", "LE", "LD", "ZAG", "GOL"];
const POSITION_NAMES = {
  CA: "Atacante Avançado",
  SA: "Segundo Atacante",
  PD: "Ponta Direita",
  PE: "Ponta Esquerda",
  MAT: "Meia Atacante",
  MEI: "Meia Central",
  MC: "Meio-campista",
  VOL: "Volante",
  LE: "Lateral Esquerdo",
  LD: "Lateral Direito",
  ZAG: "Zagueiro",
  GOL: "Goleiro"
};

const FIELD_LABELS = {
  shooting: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  dexterity: "Destreza",
  lowerBody: "Força pernas",
  aerial: "Bola aérea",
  defending: "Defesa",
  goalkeeper: "Goleiro"
};

const PROFILE_WEIGHTS = {
  CA: { shooting: 12, dexterity: 9, lowerBody: 8, aerial: 7, dribbling: 5, passing: 4, defending: 0, goalkeeper: 0 },
  SA: { dribbling: 10, dexterity: 9, shooting: 8, passing: 7, lowerBody: 6, aerial: 2, defending: 0, goalkeeper: 0 },
  PD: { dribbling: 11, dexterity: 10, lowerBody: 8, passing: 7, shooting: 6, aerial: 1, defending: 0, goalkeeper: 0 },
  PE: { dribbling: 11, dexterity: 10, lowerBody: 8, passing: 7, shooting: 6, aerial: 1, defending: 0, goalkeeper: 0 },
  MAT: { passing: 10, dribbling: 10, dexterity: 8, shooting: 7, lowerBody: 5, aerial: 1, defending: 1, goalkeeper: 0 },
  MEI: { passing: 11, dribbling: 8, dexterity: 7, lowerBody: 6, defending: 4, shooting: 3, aerial: 1, goalkeeper: 0 },
  MC: { passing: 10, lowerBody: 8, dribbling: 7, dexterity: 6, defending: 6, shooting: 3, aerial: 2, goalkeeper: 0 },
  VOL: { defending: 12, lowerBody: 8, passing: 7, aerial: 5, dexterity: 4, dribbling: 3, shooting: 1, goalkeeper: 0 },
  LE: { lowerBody: 10, defending: 9, passing: 7, dexterity: 6, dribbling: 5, aerial: 2, shooting: 1, goalkeeper: 0 },
  LD: { lowerBody: 10, defending: 9, passing: 7, dexterity: 6, dribbling: 5, aerial: 2, shooting: 1, goalkeeper: 0 },
  ZAG: { defending: 13, aerial: 10, lowerBody: 6, passing: 4, dexterity: 3, dribbling: 1, shooting: 0, goalkeeper: 0 },
  GOL: { goalkeeper: 14, aerial: 5, lowerBody: 3, passing: 2, defending: 1, shooting: 0, dribbling: 0, dexterity: 0 }
};

const SKILLS_BY_POSITION = {
  CA: ["Chute de primeira", "Cabeçada", "Superioridade aérea", "Finalização acrobática", "Passe de primeira", "Super substituto", "Espírito guerreiro"],
  SA: ["Passe de primeira", "Chute colocado", "Toque duplo", "Controle com a sola", "Arranque explosivo", "Passe em profundidade"],
  PD: ["Toque duplo", "Cruzamento preciso", "Passe em profundidade", "Controle com a sola", "Passe de primeira", "Arranque explosivo"],
  PE: ["Toque duplo", "Cruzamento preciso", "Passe em profundidade", "Controle com a sola", "Passe de primeira", "Arranque explosivo"],
  MAT: ["Passe de primeira", "Passe em profundidade", "Chute colocado", "Toque duplo", "Controle com a sola", "Visão de jogo"],
  MEI: ["Passe de primeira", "Passe em profundidade", "Interceptação", "Espírito guerreiro", "Controle com a sola"],
  MC: ["Passe de primeira", "Passe em profundidade", "Interceptação", "Bloqueador", "Espírito guerreiro"],
  VOL: ["Interceptação", "Bloqueador", "Marcação individual", "Volta para marcar", "Passe de primeira", "Espírito guerreiro"],
  LE: ["Interceptação", "Bloqueador", "Cruzamento preciso", "Passe de primeira", "Espírito guerreiro"],
  LD: ["Interceptação", "Bloqueador", "Cruzamento preciso", "Passe de primeira", "Espírito guerreiro"],
  ZAG: ["Interceptação", "Bloqueador", "Marcação individual", "Superioridade aérea", "Cabeçada", "Espírito guerreiro"],
  GOL: ["Defesa de pênalti", "Lançamento baixo", "Lançamento alto", "Capitão"]
};

const STYLE_ALIASES = [
  ["homem de area", "Homem de área", "CA"],
  ["artilheiro", "Artilheiro", "CA"],
  ["pivo", "Pivô", "CA"],
  ["atacante matador", "Atacante matador", "CA"],
  ["prolifico", "Ponta prolífico", "PD"],
  ["criativo", "Armador criativo", "MAT"],
  ["orquestrador", "Orquestrador", "MC"],
  ["box", "Box-to-box", "MC"],
  ["destruidor", "Destruidor", "VOL"],
  ["ancora", "Âncora", "VOL"],
  ["extra frontman", "Zagueiro ofensivo", "ZAG"]
];

const state = {
  imageDataUrl: "",
  imageName: "",
  lastAnalysis: null
};

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", () => {
  bindUi();
  if (localStorage.getItem(SESSION_KEY) === "active") {
    showScreen("homeScreen");
  } else {
    showScreen("loginScreen");
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
});

function bindUi() {
  $("#loginForm").addEventListener("submit", handleLogin);
  $("#togglePassword").addEventListener("click", togglePassword);
  $("#logoutBtn").addEventListener("click", logout);
  $("#galleryInput").addEventListener("change", handleFile);
  $("#cameraInput").addEventListener("change", handleFile);
  $("#changeImageBtn").addEventListener("click", () => $("#galleryInput").click());
  $("#analyzeBtn").addEventListener("click", runAnalysis);
  $("#backBtn").addEventListener("click", () => showScreen("homeScreen"));
  $("#newAnalysisBtn").addEventListener("click", resetAnalysis);
}

function handleLogin(event) {
  event.preventDefault();
  const user = $("#username").value.trim();
  const pass = $("#password").value;
  const error = $("#loginError");
  error.textContent = "";

  if (user === LOGIN_USER && pass === LOGIN_PASSWORD) {
    localStorage.setItem(SESSION_KEY, "active");
    showScreen("homeScreen");
    return;
  }

  error.textContent = "Usuário ou senha incorretos.";
}

function togglePassword() {
  const input = $("#password");
  input.type = input.type === "password" ? "text" : "password";
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  showScreen("loginScreen");
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === id);
  });
}

function handleFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    state.imageDataUrl = String(reader.result);
    state.imageName = file.name || "print da carta";
    updatePreview();
  };
  reader.readAsDataURL(file);
}

function updatePreview() {
  const preview = $("#cardPreview");
  const resultPreview = $("#resultPreview");
  preview.src = state.imageDataUrl;
  resultPreview.src = state.imageDataUrl;
  preview.parentElement.classList.add("has-image");
  resultPreview.parentElement.classList.add("has-image");
  $("#selectedCard").classList.remove("is-empty");
  $("#selectedTitle").textContent = "Print carregado";
  $("#selectedMeta").textContent = state.imageName;
}

async function runAnalysis() {
  const button = $("#analyzeBtn");
  const status = $("#analysisStatus");
  button.disabled = true;
  status.classList.add("is-working");
  status.innerHTML = "<span>◇</span> Lendo imagem localmente e montando ficha Elite...";

  try {
    const text = await readImageText();
    const parsed = parseCardText(text);
    const analysis = buildAnalysis(parsed);
    state.lastAnalysis = analysis;
    renderResult(analysis);
    showScreen("resultScreen");
  } catch (error) {
    const analysis = buildAnalysis(parseCardText(""));
    analysis.confidence = 68;
    analysis.readSource = "Leitura local limitada";
    state.lastAnalysis = analysis;
    renderResult(analysis);
    showScreen("resultScreen");
  } finally {
    button.disabled = false;
    status.classList.remove("is-working");
    status.innerHTML = "<span>◇</span> Análise 100% local. Seus dados não saem do aparelho.";
  }
}

async function readImageText() {
  if (!state.imageDataUrl || !window.Tesseract) return "";

  const result = await window.Tesseract.recognize(state.imageDataUrl, "eng", {
    logger: () => {}
  });

  return result?.data?.text || "";
}

function parseCardText(rawText) {
  const text = normalizeText(rawText);
  const positions = readPositions(text);
  const style = readStyle(text);
  const styleMain = style?.mainPosition;
  const mainPosition = positions[0] || styleMain || "CA";
  const level = readLevel(text);
  const explicitPoints = readExplicitPoints(text);
  const autoBuild = readAutoBuild(text);
  const autoCost = costOfBuild(autoBuild);
  const totalPoints = resolveTotalPoints({ explicitPoints, level, autoCost });
  const overall = readOverall(text);
  const detectedSkills = readSkills(text);

  return {
    rawText,
    normalizedText: text,
    positions: positions.length ? positions : [mainPosition],
    mainPosition,
    style: style?.label || guessStyleFromPosition(mainPosition),
    level,
    explicitPoints,
    autoBuild,
    autoCost,
    totalPoints,
    overall,
    detectedSkills
  };
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function readPositions(text) {
  const found = [];
  POSITIONS.forEach((position) => {
    const pattern = new RegExp(`(^|[^a-z])${position.toLowerCase()}([^a-z]|$)`, "i");
    if (pattern.test(text) && !found.includes(position)) found.push(position);
  });

  return found.filter((position) => {
    if (position === "PE" && /\bpes\b|\bpeso\b/.test(text)) return false;
    if (position === "PD" && /\bpadrao\b/.test(text)) return false;
    return true;
  });
}

function readStyle(text) {
  const match = STYLE_ALIASES.find(([key]) => text.includes(key));
  if (!match) return null;
  return { label: match[1], mainPosition: match[2] };
}

function readLevel(text) {
  const patterns = [
    /nivel\s*maximo\s*(\d{1,2})/i,
    /nivel\s*(\d{1,2})/i,
    /level\s*max\s*(\d{1,2})/i,
    /max\s*level\s*(\d{1,2})/i
  ];

  for (const pattern of patterns) {
    const value = Number(text.match(pattern)?.[1]);
    if (value >= 20 && value <= 70) return value;
  }

  return null;
}

function readExplicitPoints(text) {
  const patterns = [
    /pontos\s*(?:totais)?\s*(\d{2,3})\s*\/\s*(\d{2,3})/i,
    /points\s*(\d{2,3})\s*\/\s*(\d{2,3})/i,
    /(\d{2,3})\s*\/\s*(\d{2,3})\s*pontos/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = Math.max(Number(match[1]), Number(match[2]));
    if (isSafePointTotal(value)) return value;
  }

  return null;
}

function readOverall(text) {
  const candidates = [...text.matchAll(/\b(8\d|9\d|10\d)\b/g)].map((match) => Number(match[1]));
  const filtered = candidates.filter((value) => value >= 80 && value <= 109);
  return filtered.length ? Math.max(...filtered) : 102;
}

function readAutoBuild(text) {
  const aliases = {
    shooting: ["finalizacao", "finaliza", "chute", "shooting"],
    passing: ["passe", "passing"],
    dribbling: ["drible", "dribbling"],
    dexterity: ["destreza", "dexterity"],
    lowerBody: ["forca nas pernas", "forca pernas", "velocidade", "lower body"],
    aerial: ["bola aerea", "jogo aereo", "aerial"],
    defending: ["defesa", "defendendo", "defending"],
    goalkeeper: ["goleiro", "goalkeeping"]
  };

  const build = emptyBuild();
  Object.entries(aliases).forEach(([field, names]) => {
    for (const name of names) {
      const pattern = new RegExp(`${name}\\s*(\\d{1,2})`, "i");
      const value = Number(text.match(pattern)?.[1]);
      if (value > 0 && value <= 20) {
        build[field] = Math.max(build[field], value);
        break;
      }
    }
  });

  return build;
}

function readSkills(text) {
  const known = [
    "Chute de primeira",
    "Cabeçada",
    "Finalização acrobática",
    "Controle com a sola",
    "Passe de primeira",
    "Passe em profundidade",
    "Cruzamento preciso",
    "Interceptação",
    "Bloqueador",
    "Marcação individual",
    "Super substituto",
    "Espírito guerreiro"
  ];

  const detected = known.filter((skill) => normalizeText(skill).split(" ").every((word) => text.includes(word)));
  return detected.slice(0, 6);
}

function resolveTotalPoints({ explicitPoints, level, autoCost }) {
  if (isSafePointTotal(explicitPoints)) return explicitPoints;

  if (level) {
    const byLevel = (level - 1) * 2;
    if (isSafePointTotal(byLevel)) return byLevel;
  }

  if (isSafePointTotal(autoCost)) return autoCost;

  return 64;
}

function isSafePointTotal(value) {
  return Number.isFinite(value) && value >= 20 && value <= 80;
}

function guessStyleFromPosition(position) {
  const map = {
    CA: "Artilheiro",
    SA: "Segundo atacante",
    PD: "Ponta prolífico",
    PE: "Ponta prolífico",
    MAT: "Armador criativo",
    MEI: "Orquestrador",
    MC: "Box-to-box",
    VOL: "Destruidor",
    LE: "Lateral ofensivo",
    LD: "Lateral ofensivo",
    ZAG: "Zagueiro construtor",
    GOL: "Goleiro defensivo"
  };

  return map[position] || "Competitivo";
}

function buildAnalysis(parsed) {
  const selected = $("#positionSelect").value;
  const goal = $("#goalSelect").value;
  const allowedPositions = parsed.positions.length ? parsed.positions : [parsed.mainPosition];
  const bestPosition = selected !== "auto" && allowedPositions.includes(selected) ? selected : chooseBestPosition(allowedPositions, parsed.style);
  const totalPoints = parsed.totalPoints;
  const eliteBuild = optimizeBuild(bestPosition, totalPoints, goal);
  const pointsUsed = costOfBuild(eliteBuild);
  const detectedSkills = parsed.detectedSkills.length ? parsed.detectedSkills : defaultDetectedSkills(bestPosition);
  const suggestedSkills = suggestSkills(bestPosition, detectedSkills);
  const confidence = calculateConfidence(parsed);

  return {
    ...parsed,
    bestPosition,
    allowedPositions,
    totalPoints,
    eliteBuild,
    pointsUsed,
    detectedSkills,
    suggestedSkills,
    confidence,
    name: POSITION_NAMES[bestPosition] || "Jogador Elite",
    pri: calculatePri(parsed.overall, pointsUsed),
    readSource: parsed.normalizedText ? "OCR local" : "Padrão seguro local"
  };
}

function chooseBestPosition(positions, style) {
  const styleText = normalizeText(style);
  if (/(artilheiro|homem de area|pivo|matador)/.test(styleText) && positions.includes("CA")) return "CA";
  if (/(destruidor|ancora)/.test(styleText) && positions.includes("VOL")) return "VOL";
  if (/zagueiro/.test(styleText) && positions.includes("ZAG")) return "ZAG";
  return positions[0] || "CA";
}

function optimizeBuild(position, totalPoints, goal) {
  const weights = { ...(PROFILE_WEIGHTS[position] || PROFILE_WEIGHTS.CA) };
  if (goal === "overall") {
    Object.keys(weights).forEach((key) => {
      if (weights[key] > 0) weights[key] += 1;
    });
  }
  if (goal === "balanced") {
    ["passing", "dexterity", "lowerBody"].forEach((key) => {
      weights[key] = (weights[key] || 0) + 2;
    });
  }

  const build = emptyBuild();
  let remaining = totalPoints;
  let guard = 0;

  while (remaining > 0 && guard < 400) {
    guard += 1;
    const candidates = Object.keys(build)
      .filter((field) => (weights[field] || 0) > 0)
      .map((field) => {
        const nextCost = costForNextPoint(build[field]);
        const max = field === "goalkeeper" ? 16 : 14;
        return {
          field,
          nextCost,
          score: (weights[field] || 0) / nextCost,
          canUse: build[field] < max && nextCost <= remaining
        };
      })
      .filter((candidate) => candidate.canUse)
      .sort((a, b) => b.score - a.score || build[a.field] - build[b.field]);

    if (!candidates.length) break;
    const chosen = candidates[0];
    build[chosen.field] += 1;
    remaining -= chosen.nextCost;
  }

  return build;
}

function emptyBuild() {
  return {
    shooting: 0,
    passing: 0,
    dribbling: 0,
    dexterity: 0,
    lowerBody: 0,
    aerial: 0,
    defending: 0,
    goalkeeper: 0
  };
}

function costForNextPoint(current) {
  return Math.floor(current / 4) + 1;
}

function costOfBuild(build) {
  return Object.values(build).reduce((sum, value) => {
    let cost = 0;
    for (let i = 0; i < value; i += 1) cost += costForNextPoint(i);
    return sum + cost;
  }, 0);
}

function defaultDetectedSkills(position) {
  const base = {
    CA: ["Chute de primeira", "Cabeçada", "Finalização"],
    SA: ["Passe de primeira", "Controle de bola"],
    PD: ["Drible", "Cruzamento"],
    PE: ["Drible", "Cruzamento"],
    MAT: ["Passe de primeira", "Passe em profundidade"],
    MEI: ["Passe de primeira", "Controle de bola"],
    MC: ["Passe de primeira", "Interceptação"],
    VOL: ["Interceptação", "Bloqueador"],
    LE: ["Cruzamento", "Interceptação"],
    LD: ["Cruzamento", "Interceptação"],
    ZAG: ["Cabeçada", "Bloqueador"],
    GOL: ["Lançamento baixo", "Defesa de pênalti"]
  };
  return base[position] || ["Passe de primeira"];
}

function suggestSkills(position, detected) {
  const detectedSet = new Set(detected.map((skill) => normalizeText(skill)));
  return (SKILLS_BY_POSITION[position] || SKILLS_BY_POSITION.CA)
    .filter((skill) => !detectedSet.has(normalizeText(skill)))
    .slice(0, 5);
}

function calculateConfidence(parsed) {
  let score = 70;
  if (parsed.normalizedText) score += 8;
  if (parsed.positions.length) score += 7;
  if (parsed.level) score += 5;
  if (parsed.explicitPoints || parsed.autoCost >= 20) score += 5;
  if (parsed.detectedSkills.length) score += 3;
  return Math.min(98, score);
}

function calculatePri(overall, pointsUsed) {
  const value = Math.round((overall * 44 + pointsUsed * 17) / 10) * 10;
  return value.toLocaleString("pt-BR");
}

function renderResult(analysis) {
  $("#resultName").textContent = analysis.name;
  $("#resultStyle").textContent = analysis.style;
  $("#resultOverall").textContent = analysis.overall;
  $("#resultOverallArt").textContent = analysis.overall;
  $("#resultBestPosition").textContent = analysis.bestPosition;
  $("#resultPositionArt").textContent = analysis.bestPosition;
  $("#resultPri").textContent = analysis.pri;
  $("#resultConfidence").textContent = `${analysis.confidence}%`;
  $("#resultPoints").textContent = `${analysis.pointsUsed}/${analysis.totalPoints}`;

  renderStats(analysis.eliteBuild);
  renderSkills("#detectedSkills", analysis.detectedSkills);
  renderSkills("#suggestedSkills", analysis.suggestedSkills);
  renderPositions(analysis);
  renderReadData(analysis);
  renderPointBars(analysis.eliteBuild);
  renderBoosts(analysis);
}

function renderStats(build) {
  const container = $("#eliteStats");
  container.innerHTML = "";
  Object.entries(FIELD_LABELS)
    .filter(([field]) => field !== "goalkeeper" || build[field] > 0)
    .slice(0, 5)
    .forEach(([field, label]) => {
      const value = build[field];
      const estimated = Math.min(99, 78 + value * 2);
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="stat-tile">
          <small>${label}</small>
          <strong>${estimated}</strong>
          <div class="mini-bar"><span style="width:${Math.min(100, estimated)}%"></span></div>
        </div>`
      );
    });
}

function renderSkills(selector, skills) {
  const container = $(selector);
  container.innerHTML = "";
  skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.textContent = skill;
    container.appendChild(chip);
  });
}

function renderPositions(analysis) {
  const container = $("#positionList");
  container.innerHTML = "";
  analysis.allowedPositions.forEach((position, index) => {
    const tag = position === analysis.bestPosition ? "PRIMÁRIA" : index === 1 ? "ÓTIMA" : "BOA";
    const tagClass = position === analysis.bestPosition ? "tag-primary" : "tag-good";
    container.insertAdjacentHTML(
      "beforeend",
      `<div class="position-item">
        <span class="position-code">${position}</span>
        <span>${POSITION_NAMES[position] || "Posição lida"}</span>
        <span class="${tagClass}">${tag}</span>
      </div>`
    );
  });
}

function renderReadData(analysis) {
  const rows = [
    ["Estilo de jogo", analysis.style],
    ["Nível máximo", analysis.level || "Não lido"],
    ["Total de pontos", `${analysis.totalPoints}/${analysis.totalPoints}`],
    ["Pontos usados", `${analysis.pointsUsed}/${analysis.totalPoints}`],
    ["Versão do OCR", "Premium Local"],
    ["Leitura", `${analysis.confidence}% local`]
  ];

  $("#readData").innerHTML = rows
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderPointBars(build) {
  const container = $("#pointBars");
  container.innerHTML = "";
  Object.entries(FIELD_LABELS)
    .filter(([field]) => field !== "goalkeeper" || build[field] > 0)
    .forEach(([field, label]) => {
      const value = build[field];
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="point-bar">
          <small>${label}</small>
          <strong>${value}</strong>
          <div class="progress"><span style="width:${Math.min(100, value * 7)}%"></span></div>
        </div>`
      );
    });
}

function renderBoosts(analysis) {
  const topFields = Object.entries(analysis.eliteBuild)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([field]) => FIELD_LABELS[field]);

  const container = $("#boosts");
  container.innerHTML = "";
  topFields.forEach((field, index) => {
    const boost = document.createElement("span");
    boost.textContent = `${field} +${index === 0 ? 2 : 1}`;
    container.appendChild(boost);
  });
}

function resetAnalysis() {
  state.imageDataUrl = "";
  state.imageName = "";
  state.lastAnalysis = null;
  $("#galleryInput").value = "";
  $("#cameraInput").value = "";
  $("#cardPreview").removeAttribute("src");
  $("#resultPreview").removeAttribute("src");
  $("#cardPreview").parentElement.classList.remove("has-image");
  $("#resultPreview").parentElement.classList.remove("has-image");
  $("#selectedCard").classList.add("is-empty");
  $("#selectedTitle").textContent = "Aguardando print";
  $("#selectedMeta").textContent = "O app vai ler pontos, nível, posições e estilo.";
  showScreen("homeScreen");
}
