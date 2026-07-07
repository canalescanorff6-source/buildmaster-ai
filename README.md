# BuildMaster AI Vision Only Premium

Versão focada apenas no que interessa: analisar imagem/print da carta do eFootball e gerar ficha de jogabilidade.

## O que lê da imagem

- Nome do jogador
- Estilo de jogo
- Tipo da carta
- Overall principal
- Overalls por posição: CF, SS, LWF, RWF, LMF, RMF, AMF, CMF, DMF, CB, LB, RB, GK
- Conversão de posições para PT-BR: CA, SA, PE, PD, ME, MD, MAT, MC, VOL, ZAG, LE, LD, GOL
- Altura, peso, idade e nível
- Pior pé: frequência e precisão
- Condição física
- Resistência a lesão
- Atributos técnicos, defensivos, físicos e de goleiro
- Habilidades nativas
- Ímpetos/boosters, como Duelo +3, Sem Impulso, Esticada de Perna, Sombra veloz e Finalizador nato
- Modelo de jogador/biometria quando o OCR conseguir ler

## O que gera

- Melhor ficha/build
- PRI geral e PRI por setor
- Melhor posição real
- Ranking de posições
- Habilidades adicionais recomendadas
- Compatibilidade tática
- Como usar o jogador em campo

## Importante sobre precisão

O app usa OCR local no navegador. Print nítido direto do eFHUB/eFootBase oferece melhor resultado. Foto da tela pode errar letras/números; por isso o app mostra o texto extraído para revisão manual antes de gerar a ficha.

## Rodar local

```bash
npm install
npm run dev
```

## Deploy na Vercel

```bash
npm install
npm run build
```

Este projeto não usa banco, Prisma, login ou Neon.
