# BuildMaster Local Pro v19 — Precision Check

Versão criada para reduzir erros sem usar IA paga. O app continua 100% local/offline no OCR com `tesseract.js`, mas agora não confia cegamente no print: ele obriga conferência antes de entregar a ficha final.

## O que entrou nesta versão

1. **Conferência obrigatória antes da ficha final** — depois do OCR, o app abre uma tela de revisão.
2. **Bloqueio quando a confiança está baixa** — posição, estilo, pontos e atributos suspeitos impedem ficha final automática.
3. **Banco local de cartas/regras** — regras offline para cartas conhecidas como Gattuso, Maldini, Vieira, Tchouaméni, Beckenbauer, Neymar, Messi e Mbappé.
4. **Correção manual de atributos** — você pode corrigir os atributos que o OCR leu errado.
5. **Modo manual preciso sem OCR** — permite gerar ficha sem imagem, preenchendo os dados manualmente.
6. **Testes de regressão** — script `npm run test:cards` valida casos conhecidos para evitar posições absurdas.
7. **OCR por áreas ampliado** — leitura segue separando badge, identidade, topo, atributos e habilidades.
8. **Regras anti-posição impossível** — destruidor não vira ponta/CA, atacante de área não vira defensor, goleiro não vira linha etc.
9. **Separação clara de posições** — mostra posição da carta, posições permitidas, melhor posição de gameplay e posições a evitar.
10. **Histórico/correções locais** — histórico foi renovado para v19 e a revisão manual fica registrada no texto analisado.

## Como usar

### Pelo print

1. Envie o print da carta.
2. Clique em **Ler carta e abrir conferência**.
3. Confira nome, posição, estilo, nível, pontos e atributos principais.
4. Ajuste o que estiver errado.
5. Clique em **Confirmar dados e gerar ficha final**.

### Sem OCR

Use **Modo manual preciso sem OCR**. Esse modo é o mais confiável quando você não quer depender da leitura do print.

## Comandos validados

```bash
npm run typecheck
npm run test:cards
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

Depois de atualizar, limpe o cache/dados do site no celular ou reinstale o PWA, porque o service worker mudou para v19.
