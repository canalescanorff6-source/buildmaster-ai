import { analyzeCard } from '../src/lib/analyzer';

const cases = [
  {
    name: 'Gattuso destruidor não pode virar lateral/atacante',
    text: `
[AJUSTES MANUAIS]
CONFIRMAÇÃO MANUAL: SIM
NOME DO JOGADOR: Gattuso
POSIÇÃO PRINCIPAL: DMF
ESTILO DE JOGO: O destruidor
NÍVEL MÁXIMO: 32
PONTOS TOTAIS: 62
Talento defensivo: 90
Desarme: 92
Dedicação defensiva: 90
Agressividade: 88
Contato físico: 86
Resistência: 88
Passe rasteiro: 80
Velocidade: 76
Aceleração: 72
[FIM AJUSTES]
`,
    disallow: ['LB', 'RB', 'CF', 'SS', 'LWF', 'RWF']
  },
  {
    name: 'Maldini deve ficar em função defensiva',
    text: `
[AJUSTES MANUAIS]
CONFIRMAÇÃO MANUAL: SIM
NOME DO JOGADOR: Paolo Maldini
POSIÇÃO PRINCIPAL: CB
ESTILO DE JOGO: Defensor criativo
NÍVEL MÁXIMO: 31
PONTOS TOTAIS: 60
Talento defensivo: 92
Desarme: 90
Dedicação defensiva: 88
Cabeçada: 86
Salto: 84
Contato físico: 82
Velocidade: 80
Passe rasteiro: 78
[FIM AJUSTES]
`,
    disallow: ['CF', 'SS', 'LWF', 'RWF', 'AMF']
  },
  {
    name: 'Neymar deve evitar defesa/goleiro',
    text: `
[AJUSTES MANUAIS]
CONFIRMAÇÃO MANUAL: SIM
NOME DO JOGADOR: Neymar
POSIÇÃO PRINCIPAL: LWF
ESTILO DE JOGO: Armador criativo
NÍVEL MÁXIMO: 30
PONTOS TOTAIS: 58
Controle de bola: 92
Drible: 94
Condução firme: 92
Passe rasteiro: 84
Finalização: 82
Velocidade: 86
Aceleração: 90
Equilíbrio: 88
[FIM AJUSTES]
`,
    disallow: ['CB', 'DMF', 'LB', 'RB', 'GK']
  }
];

for (const item of cases) {
  const result = analyzeCard(item.text, 'COMPETITIVE', 'AUTO', `${item.name}.txt`);
  if (item.disallow.includes(result.bestPosition.code)) {
    throw new Error(`${item.name}: posição proibida escolhida (${result.bestPosition.code}).`);
  }
  if (!result.validation.canGenerate) {
    throw new Error(`${item.name}: validação não permitiu gerar mesmo com confirmação manual.`);
  }
}

console.log(`OK: ${cases.length} testes de regressão passaram.`);
