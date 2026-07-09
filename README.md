# BuildMaster Local Pro v20 — Calibração e Banco de Cartas

Versão criada para aumentar a precisão sem usar IA paga. O app continua com OCR local via `tesseract.js`, mas agora combina leitura por áreas, calibração visual, banco local maior, aprendizado local, detector de print ruim, comparação de ficha e perfil tático.

## O que entrou nesta versão

1. **Calibrador visual de print** — mostra as áreas lidas pelo OCR: nome, overall, posição, estilo, atributos, ficha automática, posições jogáveis e habilidades. Dá para ajustar X/Y/largura/altura e ativar/desativar cada zona.
2. **Banco local maior de cartas** — inclui regras offline para Davids, Gattuso, Maldini, Vieira, Tchouaméni, Beckenbauer, Neymar, Messi, Mbappé, Beckham, Rijkaard, Makelele, Kanté, Ronaldinho, Cristiano Ronaldo, Haaland, Rodri, Van Dijk, Cafu e Roberto Carlos.
3. **Aprendizado local** — quando você confirma uma carta, o navegador salva nome, posição, estilo, melhor posição e pontos para corrigir leituras futuras da mesma carta, sem API e sem IA paga.
4. **Mais testes com print real/texto OCR real** — `npm run test:prints` valida o caso Edgar Davids do print completo, impedindo que VOL destruidor vire LE/LD só porque o grid mostra 89.
5. **Comparação de ficha** — mostra ficha automática lida do jogo, ficha recomendada pelo app e diferença ponto a ponto.
6. **Explicação da recomendação** — explica por que recomendou a posição/ficha e quais atributos pesaram.
7. **Perfil por formação/tática** — adiciona formação 4-2-2-2, 4-3-3, 4-1-2-3, 3-2-4-1 e estilos como passe curto, contra-ataque rápido, posse, bola longa e pressão alta.
8. **Ficha segura, competitiva e alternativa** — além da ficha principal, mostra três versões para uso conservador, competitivo e fora da função principal.
9. **Detector de print ruim** — mede resolução, nitidez, brilho e contraste antes do OCR e avisa se a imagem pode causar erro.
10. **Organização do código** — foram separados módulos para banco local, regras de posição, OCR/calibração, validação de print e motor de comparação de treino.

## Mudança grande aplicada ao seu print do Edgar Davids

A grade de posições pode mostrar LE/LD 89, mas o motor agora não escolhe lateral só pelo maior overall. Para cartas como Davids com `O destruidor` e posição de card `DMF/VOL`, a regra local e o motor de gameplay priorizam `VOL`, depois `MLG`, e só tratam outras posições como situacionais.

## Como usar

1. Envie o print completo da carta.
2. Abra o **Calibrador de print** se o corte do OCR estiver errado.
3. Clique em **Ler carta e abrir conferência**.
4. Confira nome, posição, estilo, pontos, atributos e perfil tático.
5. Confirme para gerar a ficha final.

## Comandos validados

```bash
npm run typecheck
npm run test:all
npm run build
```

Todos passaram nesta entrega.

## Login

Usuário: `thiago0126`  
Senha: `iu1fsaa67a`

## Vercel

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run vercel-build`

Depois de atualizar, limpe o cache/dados do site no celular ou reinstale o PWA, porque o service worker mudou para v20.
